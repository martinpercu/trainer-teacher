// import { Component, OnInit, inject } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { Exam, Question, Option } from '@models/exam';
// import { QuestionAndAnswer, Result } from '@models/result';
// import { ExamService } from '@services/exam.service';
// import { ResultService } from '@services/result.service';
// import { AuthService } from '@services/auth.service';

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Exam, Question, Option } from '@models/exam';
import { QuestionAndAnswer, Result } from '@models/result';
import { ExamService } from '@services/exam.service';
import { ResultService } from '@services/result.service';
import { AuthService } from '@services/auth.service';



@Component({
  selector: 'app-exam',
  imports: [CommonModule],
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

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (examId) {
      this.loadExam(examId);
    }
  }

  loadExam(examId: string): void {
    this.examService.getExamById(examId).subscribe({
      next: (exam) => {
        if (exam) {
          this.exam = exam;
          this.checkIfCanTakeExam(examId);
        } else {
          console.error('Examen no encontrado');
          alert('Examen no encontrado');
        }
      },
      error: (error) => {
        console.error('Error al cargar el examen:', error);
        alert('Error al cargar el examen');
      }
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
  }

  shuffleArray<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  selectAnswer(questionIndex: number, answer: string): void {
    this.userAnswers[questionIndex] = answer;
  }

  submitExam(): void {
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
      if (examPassed) {
        const message = `You passed the exam! You answered ${percentage.toFixed(0)}% of the questions correctly.`;
        alert(message);
        this.router.navigate(['/']);
      } else {
        const message = `Sorry. You failed the exam.\nOnly ${percentage.toFixed(0)}% of your answers were correct.\nYou can try again in ${this.exam?.timeToWait} minutes.`;
        alert(message);
        this.router.navigate([`/teacher/${result.examId}`]);
      }
    }).catch(err => {
      console.error('Error to save result:', err);
      alert('Error to save result');
    });
  }

  reloadPage(): void {
    location.reload();
  }

  ngOnDestroy(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }
}


//   authService = inject(AuthService);
//   examService = inject(ExamService);
//   route = inject(ActivatedRoute);
//   resultService = inject(ResultService);
//   router = inject(Router);

//   exam: Exam | null = null;
//   preparedQuestions: { question: Question, options: Option[] }[] = [];
//   userAnswers: { [questionIndex: number]: string } = {};
//   questions_limit = 12;
//   false_options_count = 5;


//   constructor() {}

//   ngOnInit(): void {
//     const examId = this.route.snapshot.paramMap.get('id');
//     if (examId) {
//       this.loadExam(examId);
//     }
//   }


//   loadExam(examId: string): void {
//     this.examService.getExamById(examId).subscribe({
//       next: (exam) => {
//         if (exam) {
//           this.exam = exam;
//           this.prepareExam();
//         } else {
//           console.error('Examen no encontrado');
//         }
//       },
//       error: (error) => {
//         console.error('Error al cargar el examen:', error);
//       }
//     });
//   }

//   prepareExam(): void {
//     if (!this.exam || !this.exam.questions) return;
//     console.log(this.exam);
//     // IMPORTANT ==> This will control de difficulty.
//     // this.false_options_count = this.course.difficulty;

//     const shuffledQuestions = this.shuffleArray([...this.exam.questions]);
//     const selectedQuestions = shuffledQuestions.slice(0, Math.min(this.questions_limit, this.exam.questions.length));

//     this.preparedQuestions = selectedQuestions.map(question => {
//       const correctOption = question.options.find(opt => opt.isCorrect)!;
//       const falseOptions = this.shuffleArray(question.options.filter(opt => !opt.isCorrect))
//         .slice(0, this.false_options_count);
//       const options = this.shuffleArray([correctOption, ...falseOptions]);
//       return { question, options };
//     });
//   }

//   shuffleArray<T>(array: T[]): T[] {
//     for (let i = array.length - 1; i > 0; i--) {
//       const j = Math.floor(Math.random() * (i + 1));
//       [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
//   }

//   selectAnswer(questionIndex: number, answer: string): void {
//     this.userAnswers[questionIndex] = answer;
//   }

//   submitExam(): void {
//     if (!this.exam) return;

//     // const currentUser = this.userService.userSig();
//     const currentUser = this.authService.currentUserSig();
//     console.log(currentUser);

//     if (!currentUser) {
//       alert('You must be logged!!!');
//       return;
//     }

//     const questionsAndAnswers: QuestionAndAnswer[] = this.preparedQuestions.map((pq, index) => {
//       const userAnswer = this.userAnswers[index] || '';
//       const correctOption = pq.options.find(opt => opt.isCorrect)!;
//       return {
//         question: pq.question.text,
//         options: pq.options,
//         answer: userAnswer,
//         correct: userAnswer === correctOption.text
//       };
//     });

//     const correctAnswers = questionsAndAnswers.filter(q => q.correct).length;
//     const questionsAnswered = questionsAndAnswers.filter(q => q.answer !== '').length;
//     // const exam_passed_sucees = 'this is the logic we need and return a boolea if correct answer are bigger than percentage'
//     const result: Omit<Result, 'id'> = {
//       userUID: currentUser.userUID,
//       time: new Date().toUTCString(),
//       totalQuestions: questionsAndAnswers.length,
//       correctAnswers,
//       examTitle: this.exam.title,
//       examId: this.exam.id,
//       teacherId: this.exam.teacherId,
//       questions: questionsAndAnswers,
//       difficulty: this.false_options_count,
//       questions_answered: questionsAnswered
//     };

//     this.resultService.saveResult(result).then((resultId) => {
//       alert(`Examen enviado con éxito. ID del resultado: ${resultId}`);
//     }).catch(err => {
//       console.error('Error al guardar el resultado:', err);
//     });
//   }
// }
