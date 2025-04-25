import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Exam, Question, Option } from '@models/exam';
import { QuestionAndAnswer, Result } from '@models/result';
import { ExamService } from '@services/exam.service';
import { ResultService } from '@services/result.service';
// import { AuthService } from '@services/auth.service';
import { UserService } from '@services/user.service';



@Component({
  selector: 'app-exam',
  imports: [],
  templateUrl: './exam.component.html',
  styleUrl: './exam.component.css'
})
export class ExamComponent implements OnInit {

  // authService = inject(AuthService);
  userService = inject(UserService);
  examService = inject(ExamService);
  route = inject(ActivatedRoute);
  resultService = inject(ResultService);



  exam: Exam | null = null;
  preparedQuestions: { question: Question, options: Option[] }[] = [];
  userAnswers: { [questionIndex: number]: string } = {};
  questions_limit = 5;
  false_options_count = 1;

  constructor(
    // private examService: ExamService,
    // private route: ActivatedRoute,
    // private resultService: ResultService
  ) {

  }

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
          this.prepareExam();
        } else {
          console.error('Examen no encontrado');
        }
      },
      error: (error) => {
        console.error('Error al cargar el examen:', error);
      }
    });
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

    const currentUser = this.userService.userSig();
    console.log(currentUser);

    if (!currentUser) {
      alert('You must be logged!!!');
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
    const result: Omit<Result, 'id'> = {
      userUID: currentUser.email,
      time: new Date().toUTCString(),
      totalQuestions: questionsAndAnswers.length,
      correctAnswers,
      examTitle: this.exam.title,
      teacherId: this.exam.teacherId,
      questions: questionsAndAnswers,
      difficulty: this.false_options_count,
      questions_answered: questionsAnswered
    };

    this.resultService.saveResult(result).then((resultId) => {
      alert(`Examen enviado con éxito. ID del resultado: ${resultId}`);
    }).catch(err => {
      console.error('Error al guardar el resultado:', err);
    });
  }
}
