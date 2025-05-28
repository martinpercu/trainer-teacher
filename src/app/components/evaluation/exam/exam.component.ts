import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Exam, Question, Option } from '@models/exam';
import { QuestionAndAnswer, Result } from '@models/result';
import { ExamService } from '@services/exam.service';
import { ResultService } from '@services/result.service';
import { AuthService } from '@services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { take } from 'rxjs/operators'; // Asegúrate de importar esto



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
  questions_limit = 20;
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

  private currentResultId: string | null = null; // Para guardar el ID del resultado en progreso
  momentStartExam!: string; // Ya la tienes
  // doingTheExamNow: boolean = false; // Esta la manejará el documento en Firestore
  private isExamPrepared: boolean = false; // Nueva propiedad

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    // this.examViewMode = 'loading'; // Initial state
    this.examViewMode = 'introInfoExam'; // Initial state
    if (examId) {
      this.loadExam(examId);
    }
  }

  changeViewTo(value: 'loading' | 'taking_question' | 'summary' | 'results' | 'editing_question_from_summary' | 'introInfoExam') {
    this.examViewMode = value
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
    console.log('checkIfCanTakeExam llamado con examId:', examId);
    const currentUser = this.authService.currentUserSig();
    if (!currentUser) {
      alert('Submitting the exam requires you to be logged in.');
      this.router.navigate([`/teacher/${examId}`])
      return;
    }

    this.resultService.getLastResultByUserAndExam(currentUser.userUID, examId)
      .pipe(take(1)) // Solo toma la primera emisión y completa la suscripción
      .subscribe({
        next: (lastResult) => {
          console.log('Último resultado obtenido:', lastResult);
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
    if (this.isExamPrepared) {
      console.log('Examen ya preparado, evitando duplicación');
      return;
    }
    console.log('prepareExam llamado');
    if (!this.exam || !this.exam.questions) return;

    this.isExamPrepared = true; // Marcamos como preparado
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
    // this.examViewMode = 'introInfoExam'; // Or some error state
    // this.startExamTimer();
    // this.updateFooterButtonState();
    const nowStartExam = new Date()
    this.momentStartExam = nowStartExam.toUTCString();

    // **NUEVO: Crear el resultado inicial en progreso**
    // Esto debe hacerse antes de que el usuario comience el examen.
    // Si el usuario ya tiene un examen "doingTheExamNow" para este examId,
    // podrías querer cargarlo en lugar de crear uno nuevo (lógica de reanudación, más compleja).
    // Por ahora, asumimos que siempre crea uno nuevo si pasa checkIfCanTakeExam.
    this.createInitialResultEntry();
  }

  async createInitialResultEntry(): Promise<void> {
    console.log('createInitialResultEntry llamado');
    const currentUser = this.authService.currentUserSig();
    if (!this.exam || !currentUser) {
      console.error("Examen o usuario no disponible para el guardado inicial.");
      return;
    }

    const initialQuestionsAndAnswers: QuestionAndAnswer[] = this.preparedQuestions.map(pq => ({
      question: pq.question.text,
      options: pq.options, // Guardamos las opciones que se le mostrarán
      answer: '', // Respuesta vacía inicialmente
      correct: false // No evaluada inicialmente
    }));

    const initialResult: Omit<Result, 'id'> = {
      userUID: currentUser.userUID,
      examId: this.exam.id,
      examTitle: this.exam.title,
      teacherId: this.exam.teacherId,
      momentStartExam: this.momentStartExam,
      time: this.momentStartExam, // 'time' podría ser la hora de inicio o la última actualización
      doingTheExamNow: true,
      totalQuestions: this.preparedQuestions.length,
      questions: initialQuestionsAndAnswers,
      difficulty: this.false_options_count,
      questions_answered: 0,
      correctAnswers: 0,
      examPassed: null // Aún no se sabe
    };

    try {
      this.currentResultId = await this.resultService.createInitialResult(initialResult);
      console.log('Resultado inicial en progreso guardado con ID:', this.currentResultId);
    } catch (error) {
      console.error('Error al guardar el resultado inicial en progreso:', error);
      // Aquí podrías decidir si el usuario puede continuar o no.
      // Por ejemplo, podrías deshabilitar el botón de "START EXAM" o mostrar un error.
    }
  }

  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  // --- START intro page ---

  // startExam() {
  //   this.startExamTimer();
  //   this.examViewMode = 'taking_question';
  //   // this.examViewMode = 'introInfoExam'; // Or some error state
  //   this.startExamTimer();
  //   this.updateFooterButtonState();
  // }
  startExam() {
    if (!this.currentResultId && this.isOkToDoTheExam) {
      // Si por alguna razón createInitialResultEntry no se llamó o falló
      // y el examen está a punto de empezar, es un problema.
      // Podrías intentar llamarlo aquí de nuevo o manejar el error.
      // Por ahora, asumimos que currentResultId ya está seteado desde prepareExam/createInitialResultEntry.
      console.warn('Intentando iniciar examen sin un ID de resultado en progreso.');
      // alert('No se pudo inicializar el guardado del examen. Intenta recargar.');
      // return; // Podrías detener el inicio del examen aquí.
    }
    this.startExamTimer();
    this.examViewMode = 'taking_question';
    this.updateFooterButtonState(); // Llama a updateResult si es necesario
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
          this.footerButtonAction = () => { }; // No action
          this.isFooterButtonDisabled = true; // Or style differently
          // this.updateResult()
          this.updateCurrentResultInDB(); // Llamada aquí
        } else if (isCurrentQuestionAnswered) {
          this.footerButtonText = 'Next Question';
          this.footerButtonAction = this.goToNextUnansweredOrSummary;
          this.isFooterButtonDisabled = false;
          // this.updateResult()
          this.updateCurrentResultInDB(); // Llamada aquí
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

  // updateResult() {
  //   if (this.examViewMode === 'taking_question') {
  //     console.log('UPDATING RESULTS');
  //   }
  // }

  async updateCurrentResultInDB(): Promise<void> {
    if (!this.currentResultId || !this.exam) {
      console.warn('No hay ID de resultado actual para actualizar o examen no cargado.');
      return;
    }
    console.log('UPDATING RESULTS en DB para el ID:', this.currentResultId);

    const questionsAndAnswers: QuestionAndAnswer[] = this.preparedQuestions.map((pq, index) => {
      const userAnswer = this.userAnswers[index] || '';
      // La propiedad 'correct' podría recalcularse aquí o solo al final.
      // Por simplicidad, la recalculamos aquí, pero para performance podrías omitirla
      // en actualizaciones intermedias si solo importa al final.
      const correctOption = pq.options.find(opt => opt.isCorrect)!;
      return {
        question: pq.question.text,
        options: pq.options,
        answer: userAnswer,
        correct: userAnswer === correctOption.text
      };
    });

    const questionsAnswered = Object.keys(this.userAnswers).length;
    const correctAnswers = questionsAndAnswers.filter(q => q.correct).length; // Recalcular

    const updates: Partial<Result> = {
      questions: questionsAndAnswers,
      questions_answered: questionsAnswered,
      correctAnswers: correctAnswers, // Actualizar respuestas correctas parciales
      time: new Date().toUTCString(), // Actualizar el timestamp de la última modificación
      doingTheExamNow: true // Sigue en progreso
    };

    try {
      await this.resultService.updateExistingResult(this.currentResultId, updates);
      console.log('Resultado en progreso actualizado en DB.');
    } catch (error) {
      console.error('Error al actualizar el resultado en progreso en DB:', error);
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


  async submitExam(): Promise<void> {
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


    // Objeto Result final
    const finalResultData: Result = {
      // Si currentResultId existe, lo incluimos para que saveFinalResult sepa qué actualizar
      id: this.currentResultId || undefined, // Firestore no guarda 'undefined'
      userUID: currentUser.userUID,
      time: new Date().toUTCString(), // Hora de finalización
      totalQuestions,
      correctAnswers,
      examTitle: this.exam.title,
      examId: this.exam.id,
      teacherId: this.exam.teacherId,
      questions: questionsAndAnswers,
      difficulty: this.false_options_count,
      questions_answered: questionsAnswered,
      examPassed,
      momentStartExam: this.momentStartExam, // El que ya tenías
      doingTheExamNow: false // **CRUCIAL: el examen ha terminado**
    };

    try {
      const savedResultId = await this.resultService.saveFinalResult(finalResultData);

      this.lastSubmittedResult = { ...finalResultData, id: savedResultId }; // Asegurar que el ID esté en el objeto local
      this.lastExamPassed = examPassed;
      this.examViewMode = 'results';
      this.updateFooterButtonState();
      this.currentResultId = null; // Limpiar el ID para la próxima vez
    } catch (err) {
      console.error('Error al guardar el resultado final:', err);
      alert('Error to save result');
    }

    // const result: Omit<Result, 'id'> = {
    //   userUID: currentUser.userUID,
    //   time: new Date().toUTCString(),
    //   totalQuestions,
    //   correctAnswers,
    //   examTitle: this.exam.title,
    //   examId: this.exam.id,
    //   teacherId: this.exam.teacherId,
    //   questions: questionsAndAnswers,
    //   difficulty: this.false_options_count,
    //   questions_answered: questionsAnswered,
    //   examPassed,
    //   momentStartExam: this.momentStartExam,
    //   doingTheExamNow: false
    // };

    // this.resultService.saveResult(result).then((resultId) => {
    //   // if (examPassed) {
    //   //   const message = `You passed the exam! You answered ${percentage.toFixed(0)}% of the questions correctly.`;
    //   //   alert(message);
    //   //   this.router.navigate(['/']);
    //   // } else {
    //   //   const message = `Sorry. You failed the exam.\nOnly ${percentage.toFixed(0)}% of your answers were correct.\nYou can try again in ${this.exam?.timeToWait} minutes.`;
    //   //   alert(message);
    //   //   this.router.navigate([`/teacher/${result.examId}`]);
    //   // }

    //   // Instead of alert and navigate, set data for results view
    //   this.examViewMode = 'results';
    //   // You'll need to pass the 'result' and 'examPassed' to the results view
    //   // For example, by setting them as component properties
    //   this.lastSubmittedResult = result;
    //   this.lastExamPassed = examPassed;
    //   this.updateFooterButtonState(); // Clear footer button for results page or set new one
    // }).catch(err => {
    //   console.error('Error to save result:', err);
    //   alert('Error to save result');
    // });
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


  ngOnDestroy(): void {
    if (this.timerId) { // For timeToWait
      clearInterval(this.timerId);
    }
    if (this.examTimerId) { // For timeToDoTheExam
      clearInterval(this.examTimerId);
    }
  }

}
