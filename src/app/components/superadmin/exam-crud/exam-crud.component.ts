import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule, AsyncPipe } from '@angular/common';

import { ExamCrudService } from '@services/exam-crud.service';
import { TeacherCrudService } from '@services/teacher-crud.service';
import { Exam, Question, Option } from '@models/exam';
import { Teacher } from '@models/teacher';


@Component({
  selector: 'app-exam-crud',
  imports: [FormsModule, CommonModule, AsyncPipe],
  templateUrl: './exam-crud.component.html',
  styleUrl: './exam-crud.component.css'
})
export class ExamCrudComponent implements OnInit {
  exams$!: Observable<Exam[]>;
  teachers$!: Observable<Teacher[]>;
  newExam: Partial<Exam> = {
    title: '',
    teacherId: '',
    teacherName: '',
    questions: []
  };
  errorMessage: string = '';
  editingExamId: string | undefined = undefined;
  selectedExamId: string = '';

  constructor(
    private examCrudService: ExamCrudService,
    private teacherCrudService: TeacherCrudService
  ) {}

  ngOnInit() {
    this.exams$ = this.examCrudService.getExams();
    this.teachers$ = this.teacherCrudService.getTeachers().pipe(
      catchError(error => {
        console.error('Error al cargar profesores:', error);
        return of([]);
      })
    );
  }

  loadExam(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const examId = selectElement.value;
    this.selectedExamId = examId;

    if (examId) {
      this.examCrudService.getExamById(examId).subscribe({
        next: (exam) => {
          if (exam) {
            this.newExam = {
              title: exam.title,
              teacherId: exam.teacherId,
              teacherName: exam.teacherName || '',
              questions: exam.questions.map(q => ({
                text: q.text,
                options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
              }))
            };
            this.editingExamId = examId;
            this.errorMessage = '';
          } else {
            this.errorMessage = 'Examen no encontrado';
            this.resetForm();
          }
        },
        error: (error) => {
          console.error('Error al cargar el examen:', error);
          this.errorMessage = 'Error al cargar el examen';
          this.resetForm();
        }
      });
    } else {
      this.resetForm();
    }
  }

  saveExam() {
    if (!this.newExam.title?.trim()) {
      this.errorMessage = 'El título es requerido';
      return;
    }
    if (!this.newExam.teacherId) {
      this.errorMessage = 'El profesor es requerido';
      return;
    }
    if (!this.newExam.questions?.length) {
      this.errorMessage = 'Se requiere al menos una pregunta';
      return;
    }

    // Validar preguntas
    const invalidQuestion = this.newExam.questions.find(q => !this.isValidQuestion(q));
    if (invalidQuestion) {
      this.errorMessage = 'Una o más preguntas son inválidas (deben tener texto y 6 opciones: 1 correcta, 5 incorrectas)';
      return;
    }

    // Verificar título duplicado y examen existente para el teacherId
    this.examCrudService.checkExamTitleExists(this.newExam.title, this.editingExamId).subscribe({
      next: (titleExists) => {
        if (titleExists) {
          this.errorMessage = 'Ya existe un examen con este título';
          return;
        }

        this.examCrudService.checkExamExistsByTeacherId(this.newExam.teacherId!, this.editingExamId).subscribe({
          next: (teacherExamExists) => {
            if (teacherExamExists) {
              this.errorMessage = 'Este profesor ya tiene un examen asignado';
              return;
            }

            const examData: Partial<Exam> = {
              title: this.newExam.title!.trim(),
              teacherId: this.newExam.teacherId,
              teacherName: this.newExam.teacherName?.trim() || undefined,
              questions: this.newExam.questions
            };

            if (this.editingExamId) {
              this.examCrudService.updateExam(this.editingExamId, examData).subscribe({
                next: (success) => {
                  if (success) {
                    this.resetForm();
                  } else {
                    this.errorMessage = 'Error al actualizar el examen';
                  }
                },
                error: (error) => {
                  console.error('Error al actualizar el examen:', error);
                  this.errorMessage = 'Error al actualizar el examen';
                }
              });
            } else {
              this.examCrudService.createExam(examData).subscribe({
                next: (id) => {
                  if (id) {
                    this.resetForm();
                  } else {
                    this.errorMessage = 'Error al crear el examen';
                  }
                },
                error: (error) => {
                  console.error('Error al crear el examen:', error);
                  this.errorMessage = 'Error al crear el examen';
                }
              });
            }
          },
          error: (error) => {
            console.error('Error al verificar el examen por teacherId:', error);
            this.errorMessage = 'Error al verificar el examen para el profesor';
          }
        });
      },
      error: (error) => {
        console.error('Error al verificar el título:', error);
        this.errorMessage = 'Error al verificar el título del examen';
      }
    });
  }

  deleteExam() {
    if (this.editingExamId) {
      const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este examen?');
      if (confirmDelete) {
        this.examCrudService.deleteExam(this.editingExamId).subscribe({
          next: (success) => {
            if (success) {
              this.resetForm();
            } else {
              this.errorMessage = 'Error al eliminar el examen';
            }
          },
          error: (error) => {
            console.error('Error al eliminar el examen:', error);
            this.errorMessage = 'Error al eliminar el examen';
          }
        });
      }
    }
  }

  updateTeacherName(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const teacherId = selectElement.value;
    this.newExam.teacherId = teacherId;

    if (teacherId) {
      this.teacherCrudService.getTeacherById(teacherId).subscribe({
        next: (teacher) => {
          this.newExam.teacherName = teacher ? teacher.name : '';
          // Cargar el examen asociado al teacherId
          this.examCrudService.getExamByTeacherId(teacherId).subscribe({
            next: (exam) => {
              if (exam) {
                this.newExam = {
                  title: exam.title,
                  teacherId: exam.teacherId,
                  teacherName: exam.teacherName || '',
                  questions: exam.questions.map(q => ({
                    text: q.text,
                    options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
                  }))
                };
                this.editingExamId = exam.id;
                this.selectedExamId = exam.id;
                this.errorMessage = '';
              } else {
                this.newExam = {
                  title: '',
                  teacherId: teacherId,
                  teacherName: this.newExam.teacherName,
                  questions: []
                };
                this.editingExamId = undefined;
                this.selectedExamId = '';
                this.errorMessage = '';
              }
            },
            error: (error) => {
              console.error('Error al cargar el examen por teacherId:', error);
              this.errorMessage = 'Error al cargar el examen';
            }
          });
        },
        error: (error) => {
          console.error('Error al obtener el profesor:', error);
          this.newExam.teacherName = '';
        }
      });
    } else {
      this.newExam.teacherName = '';
      this.resetForm();
    }
  }

  addQuestion() {
    this.newExam.questions = this.newExam.questions || [];
    this.newExam.questions.push({
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false }
      ]
    });
  }

  removeQuestion(index: number) {
    this.newExam.questions = this.newExam.questions?.filter((_, i) => i !== index) || [];
  }

  updateOptionCorrectness(questionIndex: number, optionIndex: number) {
    const question = this.newExam.questions![questionIndex];
    question.options = question.options.map((opt, i) => ({
      ...opt,
      isCorrect: i === optionIndex
    }));
  }

  resetForm() {
    this.newExam = {
      title: '',
      teacherId: '',
      teacherName: '',
      questions: []
    };
    this.editingExamId = undefined;
    this.selectedExamId = '';
    this.errorMessage = '';
  }

  private isValidQuestion(question: Question): boolean {
    if (!question.text?.trim()) {
      return false;
    }
    if (!Array.isArray(question.options) || question.options.length !== 6) {
      return false;
    }
    const correctCount = question.options.filter(opt => opt.isCorrect).length;
    if (correctCount !== 1) {
      return false;
    }
    return question.options.every(opt => opt.text?.trim() && typeof opt.isCorrect === 'boolean');
  }
}
