import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Exam, Question, Option } from '@models/exam';
import { QuestionAndAnswer, Result } from '@models/result';
import { ExamService } from '@services/exam.service';
import { ResultService } from '@services/result.service';
import { AuthService } from '@services/auth.service';
import { MatIconModule } from '@angular/material/icon';




@Component({
  selector: 'app-exam',
  imports: [CommonModule, MatIconModule],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css'
})
export class ExamComponent implements OnInit, OnDestroy {
  authService = inject(AuthService);
  examService = inject(ExamService);
  route = inject(ActivatedRoute);
  resultService = inject(ResultService);
  router = inject(Router);

  exam: Exam | null = null;
  preparedQuestions: { question: Question, options: Option[] }[] = [];
  userAnswers: { [questionIndex: number]: string } = {};
  questions_limit = 12;
  false_options_count = 5;
  isOkToDoTheExam: boolean = false;
  timeRemaining: number = 0;
  showReloadButton: boolean = false;
  private timerId: any;

  lastExamPassed!: boolean;
  lastSubmittedResult!: Result;

  // --- NEW/MODIFIED STATE FOR UX REFACTOR ---
  currentQuestionIndex: number = 0;
  examViewMode: 'loading' | 'taking_question' | 'summary' | 'results' | 'editing_question_from_summary' | 'introInfoExam' = 'introInfoExam'; // To handle different views

  // For the exam timer (timeToDoTheExam)
  examTotalDurationMinutes: number = 0; // To store exam.timeToDoTheExam
  examTimeRemainingSeconds: number = 0;
  private examTimerId: any;
  isExamTimeCritical: boolean = false; // For styling the timer when time is low

  // To manage button states more easily (optional, but can be helpful)
  footerButtonText: string = '';
  footerButtonAction: (() => void) | null = null;
  isFooterButtonDisabled: boolean = false;
  // --- END OF NEW/MODIFIED STATE ---


  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    // this.examViewMode = 'loading'; // Initial state
    this.examViewMode = 'introInfoExam'; // Initial state
    if (examId) {
      this.loadExam(examId);
    }
  }


  loadExam(examId: string): void {
    this.examService.getExamById(examId).subscribe({
      next: (exam) => {
        if (exam) {
          this.exam = exam;
          this.examTotalDurationMinutes = this.exam.timeToDoTheExam || 0; // Ensure it's set
          // Reset userAnswers for a fresh attempt if logic requires, or load from elsewhere if resuming
          this.userAnswers = {};
          this.checkIfCanTakeExam(examId); // This will eventually set examViewMode and call prepareExam
        } else {
          // ... existing error handling ...
          console.error('Examen no encontrado');
          alert('Examen no encontrado');
          // this.examViewMode = 'loading'; // Or some error state
          this.examViewMode = 'introInfoExam'; // Or some error state
        }
      },
      // ... existing error handling ...
    });
  }



  checkIfCanTakeExam(examId: string): void {
    const currentUser = this.authService.currentUserSig();
    if (!currentUser) {
      alert('Submitting the exam requires you to be logged in.');
      this.router.navigate([`/teacher/${examId}`])
      return;
    }

    this.resultService.getLastResultByUserAndExam(currentUser.userUID, examId).subscribe({
      next: (lastResult) => {
        if (!lastResult) {
          this.isOkToDoTheExam = true;
          this.prepareExam();
          return;
        }
        console.log(lastResult);


        if (lastResult.examPassed == true) {
          alert('You alredy passed the exam');
          this.router.navigate(['/']);
          return
        }

        const lastAttemptTime = new Date(lastResult.time);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastAttemptTime.getTime()) / (1000 * 60);

        if (diffMinutes >= this.exam!.timeToWait) {
          this.isOkToDoTheExam = true;
          this.prepareExam();
        } else {
          this.isOkToDoTheExam = false;
          this.timeRemaining = this.exam!.timeToWait - diffMinutes;
          this.startTimer();
        }
      },
      error: (error) => {
        console.error('Error al verificar el último resultado:', error);
        alert('Error al verificar si puedes tomar el examen');
      }
    });
    // // If this.isOkToDoTheExam becomes true:
    // this.prepareExam(); // This will be called
    // this.examViewMode = 'taking_question'; // Set after preparation
    // this.startExamTimer(); // Start the main exam timer
    // this.updateFooterButtonState(); // Initialize button

    // // If not ok to do exam (e.g., waiting period):
    // this.examViewMode = 'loading'; // Or a specific 'waiting' view if you create one
    // this.startTimer(); // This is the existing timer for timeToWait

  }

  startTimer(): void {
    this.timerId = setInterval(() => {
      this.timeRemaining -= 1 / 60; // Decrementa cada segundo (1/60 minutos)
      if (this.timeRemaining <= 0) {
        clearInterval(this.timerId);
        this.showReloadButton = true;
      }
    }, 1000);
  }

  prepareExam(): void {
    if (!this.exam || !this.exam.questions) return;
    const shuffledQuestions = this.shuffleArray([...this.exam.questions]);
    const selectedQuestions = shuffledQuestions.slice(0, Math.min(this.questions_limit, this.exam.questions.length));

    this.preparedQuestions = selectedQuestions.map(question => {
      const correctOption = question.options.find(opt => opt.isCorrect)!;
      const falseOptions = this.shuffleArray(question.options.filter(opt => !opt.isCorrect))
        .slice(0, this.false_options_count);
      const options = this.shuffleArray([correctOption, ...falseOptions]);
      return { question, options };
    });

    this.currentQuestionIndex = 0; // Start with the first question
    // this.examViewMode = 'taking_question';
    this.examViewMode = 'introInfoExam'; // Or some error state
    // this.startExamTimer();
    this.updateFooterButtonState();
  }

  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // --- START intro page ---

  startExam() {
    this.startExamTimer();
    this.examViewMode = 'taking_question';
  }

  // --- END intro page ---




  // --- NEW TIMER FOR timeToDoTheExam ---
  startExamTimer(): void {
    if (this.examTotalDurationMinutes <= 0) return; // No timer if duration is 0 or not set

    this.examTimeRemainingSeconds = this.examTotalDurationMinutes * 60;
    this.isExamTimeCritical = false;

    if (this.examTimerId) {
      clearInterval(this.examTimerId);
    }

    this.examTimerId = setInterval(() => {
      this.examTimeRemainingSeconds--;

      // Check for critical time (e.g., last 5 minutes, or 50% of total time)
      const criticalThreshold = Math.min(5 * 60, this.examTotalDurationMinutes * 60 * 0.5,); // e.g. 50% or 5 mins
      // const criticalThreshold = 117

      if (this.examTimeRemainingSeconds <= criticalThreshold && !this.isExamTimeCritical) {
        this.isExamTimeCritical = true;
      }

      if (this.examTimeRemainingSeconds <= 0) {
        clearInterval(this.examTimerId);
        this.examTimeRemainingSeconds = 0;
        this.isExamTimeCritical = false;
        // this.examViewMode = 'results';
        // alert('¡Tiempo terminado! El examen se enviará automáticamente.'); // Optional alert
        this.submitExam();
      }
    }, 1000);
  }

  formatTimeRemaining(): string {
    if (this.examTimeRemainingSeconds <= 0) return '0:00';
    const minutes = Math.floor(this.examTimeRemainingSeconds / 60); // Truncar a la parte entera
    const seconds = Math.floor(this.examTimeRemainingSeconds % 60); // Truncar segundos si es necesario
    return `${minutes.toString().padStart(1, '0')}:${seconds.toString().padStart(2, '0')}`;
  }
  // --- END OF NEW TIMER ---



  // selectAnswer(questionIndex: number, answer: string): void {
  //   this.userAnswers[questionIndex] = answer;
  // }
  selectAnswer(questionIndex: number, answerText: string): void {
    // Ensure we are setting the answer for the currently viewed question
    if (questionIndex !== this.currentQuestionIndex) {
        console.warn('Attempting to set answer for a non-current question.');
        return;
    }
    this.userAnswers[this.currentQuestionIndex] = answerText;
    this.updateFooterButtonState(); // Update button text/action
  }


  // --- NAVIGATION AND BUTTON LOGIC ---
  updateFooterButtonState(): void {
    const currentQ = this.preparedQuestions[this.currentQuestionIndex];
    const isCurrentQuestionAnswered = !!this.userAnswers[this.currentQuestionIndex];
    const allQuestionsAnswered = this.areAllQuestionsAnswered();

    if (this.examViewMode === 'taking_question') {
      if (allQuestionsAnswered) {
        this.footerButtonText = 'Show Questions Answered';
        this.footerButtonAction = this.goToSummary;
        this.isFooterButtonDisabled = false;
      } else {
        // Check if this is the last unanswered question
        if (!isCurrentQuestionAnswered && this.isThisTheOnlyUnansweredQuestion()) {
          this.footerButtonText = 'This is the last Question';
          this.footerButtonAction = () => {}; // No action
          this.isFooterButtonDisabled = true; // Or style differently
        } else if (isCurrentQuestionAnswered) {
          this.footerButtonText = 'Next Question';
          this.footerButtonAction = this.goToNextUnansweredOrSummary;
          this.isFooterButtonDisabled = false;
        } else {
          this.footerButtonText = 'Skip question';
          this.footerButtonAction = this.goToNextUnansweredOrSummary;
          this.isFooterButtonDisabled = false;
        }
      }
    } else if (this.examViewMode === 'summary') {
      this.footerButtonText = 'Send Exam';
      this.footerButtonAction = this.submitExam;
      this.isFooterButtonDisabled = false;
    } else if (this.examViewMode === 'editing_question_from_summary') { // New mode for clarity
        this.footerButtonText = 'Return to Questions Answered';
        this.footerButtonAction = this.goToSummary;
        this.isFooterButtonDisabled = false;
    } else {
      this.footerButtonText = '';
      this.footerButtonAction = null;
      this.isFooterButtonDisabled = true;
    }
  }

  areAllQuestionsAnswered(): boolean {
    return this.preparedQuestions.length === Object.keys(this.userAnswers).length;
  }

  isThisTheOnlyUnansweredQuestion(): boolean {
    let unansweredCount = 0;
    for (let i = 0; i < this.preparedQuestions.length; i++) {
      if (!this.userAnswers[i]) {
        unansweredCount++;
      }
    }
    return unansweredCount === 1 && !this.userAnswers[this.currentQuestionIndex];
  }

  goToNextUnansweredOrSummary(): void {
    if (this.areAllQuestionsAnswered()) {
        this.goToSummary();
        return;
    }

    let nextIndex = -1;
    // Start searching from the question after the current one
    for (let i = 1; i < this.preparedQuestions.length; i++) {
        const potentialNextIndex = (this.currentQuestionIndex + i) % this.preparedQuestions.length;
        if (!this.userAnswers[potentialNextIndex]) {
            nextIndex = potentialNextIndex;
            break;
        }
    }

    if (nextIndex !== -1) {
        this.currentQuestionIndex = nextIndex;
    } else {
        // This case should ideally be handled by areAllQuestionsAnswered,
        // but as a fallback, if no unanswered found (shouldn't happen if not all answered)
        // or if the current one is the only one left.
        if (this.areAllQuestionsAnswered()) {
            this.goToSummary();
        } else {
            // Stay on current or re-evaluate. This indicates a potential logic flaw
            // if this branch is reached without all questions being answered.
            console.warn("Could not find next unanswered question, but not all are answered.");
        }
    }
    this.updateFooterButtonState();
  }

  goToSummary = (): void => { // Use arrow function for correct `this`
    this.examViewMode = 'summary';
    this.updateFooterButtonState();
  }

  editQuestionFromSummary(questionIndex: number): void {
    this.currentQuestionIndex = questionIndex;
    this.examViewMode = 'editing_question_from_summary'; // Change mode
    this.updateFooterButtonState();
  }
  // --- END OF NAVIGATION AND BUTTON LOGIC ---


  submitExam(): void {
    if (this.examTimerId) clearInterval(this.examTimerId); // Stop the timer

    if (!this.exam) return;

    const currentUser = this.authService.currentUserSig();
    if (!currentUser) {
      alert('Submitting the exam requires you to be logged in.');
      this.router.navigate([`/teacher/${this.exam.id}`])
      return;
    }

    const questionsAndAnswers: QuestionAndAnswer[] = this.preparedQuestions.map((pq, index) => {
      const userAnswer = this.userAnswers[index] || '';
      const correctOption = pq.options.find(opt => opt.isCorrect)!;
      return {
        question: pq.question.text,
        options: pq.options,
        answer: userAnswer,
        correct: userAnswer === correctOption.text
      };
    });

    const correctAnswers = questionsAndAnswers.filter(q => q.correct).length;
    const questionsAnswered = questionsAndAnswers.filter(q => q.answer !== '').length;
    const totalQuestions = questionsAndAnswers.length;
    const percentage = (correctAnswers / totalQuestions) * 100;
    const examPassed = percentage >= this.exam.passingPercentage;

    const result: Omit<Result, 'id'> = {
      userUID: currentUser.userUID,
      time: new Date().toUTCString(),
      totalQuestions,
      correctAnswers,
      examTitle: this.exam.title,
      examId: this.exam.id,
      teacherId: this.exam.teacherId,
      questions: questionsAndAnswers,
      difficulty: this.false_options_count,
      questions_answered: questionsAnswered,
      examPassed
    };

    this.resultService.saveResult(result).then((resultId) => {
      // if (examPassed) {
      //   const message = `You passed the exam! You answered ${percentage.toFixed(0)}% of the questions correctly.`;
      //   alert(message);
      //   this.router.navigate(['/']);
      // } else {
      //   const message = `Sorry. You failed the exam.\nOnly ${percentage.toFixed(0)}% of your answers were correct.\nYou can try again in ${this.exam?.timeToWait} minutes.`;
      //   alert(message);
      //   this.router.navigate([`/teacher/${result.examId}`]);
      // }

      // Instead of alert and navigate, set data for results view
      this.examViewMode = 'results';
      // You'll need to pass the 'result' and 'examPassed' to the results view
      // For example, by setting them as component properties
      this.lastSubmittedResult = result;
      this.lastExamPassed = examPassed;
      this.updateFooterButtonState(); // Clear footer button for results page or set new one
    }).catch(err => {
      console.error('Error to save result:', err);
      alert('Error to save result');
    });
  }


  navigateToTeacherPage(): void {
    if (this.exam) {
      this.router.navigate([`/teacher/${this.exam.id}`]); // Or exam.id if that's what you mean
    } else {
      this.router.navigate(['/']); // Fallback
    }
  }

  reloadPage(): void {
    location.reload();
  }

  // ngOnDestroy(): void {
  //   if (this.timerId) {
  //     clearInterval(this.timerId);
  //   }
  // }

  ngOnDestroy(): void {
    if (this.timerId) { // For timeToWait
      clearInterval(this.timerId);
    }
    if (this.examTimerId) { // For timeToDoTheExam
      clearInterval(this.examTimerId);
    }
  }

}
