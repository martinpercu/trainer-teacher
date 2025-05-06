import { Component, OnInit } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule, AsyncPipe } from '@angular/common';

import { ExamCrudService } from '@services/exam-crud.service';
import { TeacherCrudService } from '@services/teacher-crud.service';
import { Exam, Question, Option } from '@models/exam';
import { Teacher } from '@models/teacher';

import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-exam-crud',
  imports: [FormsModule, CommonModule, AsyncPipe, MatIcon],
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
  isSaving: boolean = false;

  constructor(
    private examCrudService: ExamCrudService,
    private teacherCrudService: TeacherCrudService
  ) {}

  ngOnInit() {
    this.exams$ = this.examCrudService.getExams();
    this.teachers$ = this.teacherCrudService.getTeachers().pipe(
      catchError(error => {
        console.error('Error al cargar profesores:', error);
        this.errorMessage = 'No se pudieron cargar los profesores';
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
          this.errorMessage = error.message || 'Error al cargar el examen';
          this.resetForm();
        }
      });
    } else {
      this.resetForm();
    }
  }

  saveExam() {
    if (this.isSaving) return;
    this.isSaving = true;
    this.errorMessage = '';

    if (!this.newExam.title?.trim()) {
      this.errorMessage = 'Exam title mandatory';
      this.isSaving = false;
      return;
    }
    if (!this.newExam.teacherId) {
      this.errorMessage = 'Teacher is mandatory';
      this.isSaving = false;
      return;
    }
    if (!this.newExam.questions?.length) {
      this.errorMessage = 'At least one question';
      this.isSaving = false;
      return;
    }

    const invalidQuestion = this.newExam.questions.find(q => !this.isValidQuestion(q));
    if (invalidQuestion) {
      this.errorMessage = 'At least one question is invalid. (Shoud have text and at least 2 options: 1 correct)';
      this.isSaving = false;
      return;
    }

    this.examCrudService.checkExamTitleExists(this.newExam.title, this.editingExamId).subscribe({
      next: (titleExists) => {
        if (titleExists) {
          this.errorMessage = 'Ya existe un examen con este título';
          this.isSaving = false;
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
              this.isSaving = false;
              if (success) {
                this.resetForm();
              } else {
                this.errorMessage = 'Error al actualizar el examen';
              }
            },
            error: (error) => {
              this.isSaving = false;
              console.error('Error al actualizar el examen:', error);
              this.errorMessage = error.message || 'Error al actualizar el examen';
            }
          });
        } else {
          this.examCrudService.createExam(examData).subscribe({
            next: (id) => {
              this.isSaving = false;
              if (id) {
                this.resetForm();
              } else {
                this.errorMessage = 'Error al crear el examen';
              }
            },
            error: (error) => {
              this.isSaving = false;
              console.error('Error al crear el examen:', error);
              this.errorMessage = error.message || 'Error al crear el examen';
            }
          });
        }
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error al verificar el título:', error);
        this.errorMessage = error.message || 'Error al verificar el título del examen';
      }
    });
  }

  deleteExam() {
    if (this.isSaving || !this.editingExamId) return;
    this.isSaving = true;
    this.errorMessage = '';

    const confirmDelete = confirm('Are you sure to delete this exam?');
    if (confirmDelete) {
      this.examCrudService.deleteExam(this.editingExamId).subscribe({
        next: (success) => {
          this.isSaving = false;
          if (success) {
            this.resetForm();
          } else {
            this.errorMessage = 'Error al eliminar el examen';
          }
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Error al eliminar el examen:', error);
          this.errorMessage = error.message || 'Error al eliminar el examen';
        }
      });
    } else {
      this.isSaving = false;
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
          this.errorMessage = '';
        },
        error: (error) => {
          console.error('Error al obtener el profesor:', error);
          this.newExam.teacherName = '';
          this.errorMessage = error.message || 'Error al cargar el profesor';
        }
      });
    } else {
      this.newExam.teacherName = '';
      this.newExam.teacherId = '';
      this.errorMessage = '';
    }
  }

  addQuestion() {
    this.newExam.questions = this.newExam.questions || [];
    this.newExam.questions.push({
      text: '',
      options: [
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ]
    });
  }

  removeQuestion(index: number) {
    this.newExam.questions = this.newExam.questions?.filter((_, i) => i !== index) || [];
  }

  addOption(questionIndex: number) {
    this.newExam.questions = this.newExam.questions || [];
    const question = this.newExam.questions[questionIndex];
    if (question.options.length < 6) {
      question.options.push({ text: '', isCorrect: false });
    }
  }

  removeOption(questionIndex: number, optionIndex: number) {
    this.newExam.questions = this.newExam.questions || [];
    const question = this.newExam.questions[questionIndex];
    if (question.options.length > 2) {
      question.options = question.options.filter((_, i) => i !== optionIndex);
      if (!question.options.some(opt => opt.isCorrect)) {
        question.options[0].isCorrect = true;
      }
    }
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
    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6) {
      return false;
    }
    const correctCount = question.options.filter(opt => opt.isCorrect).length;
    if (correctCount !== 1) {
      return false;
    }
    return question.options.every(opt => opt.text?.trim() && typeof opt.isCorrect === 'boolean');
  }


  // exams$!: Observable<Exam[]>;
  // teachers$!: Observable<Teacher[]>;
  // newExam: Partial<Exam> = {
  //   title: '',
  //   teacherId: '',
  //   teacherName: '',
  //   questions: []
  // };
  // errorMessage: string = '';
  // editingExamId: string | undefined = undefined;
  // selectedExamId: string = '';

  // constructor(
  //   private examCrudService: ExamCrudService,
  //   private teacherCrudService: TeacherCrudService
  // ) {}

  // ngOnInit() {
  //   this.exams$ = this.examCrudService.getExams();
  //   this.teachers$ = this.teacherCrudService.getTeachers().pipe(
  //     catchError(error => {
  //       console.error('Error al cargar profesores:', error);
  //       return of([]);
  //     })
  //   );
  // }

  // loadExam(event: Event) {
  //   const selectElement = event.target as HTMLSelectElement;
  //   const examId = selectElement.value;
  //   this.selectedExamId = examId;

  //   if (examId) {
  //     this.examCrudService.getExamById(examId).subscribe({
  //       next: (exam) => {
  //         if (exam) {
  //           this.newExam = {
  //             title: exam.title,
  //             teacherId: exam.teacherId,
  //             teacherName: exam.teacherName || '',
  //             questions: exam.questions.map(q => ({
  //               text: q.text,
  //               options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
  //             }))
  //           };
  //           this.editingExamId = examId;
  //           this.errorMessage = '';
  //         } else {
  //           this.errorMessage = 'Examen no encontrado';
  //           this.resetForm();
  //         }
  //       },
  //       error: (error) => {
  //         console.error('Error al cargar el examen:', error);
  //         this.errorMessage = 'Error al cargar el examen';
  //         this.resetForm();
  //       }
  //     });
  //   } else {
  //     this.resetForm();
  //   }
  // }

  // saveExam() {
  //   if (!this.newExam.title?.trim()) {
  //     this.errorMessage = 'El título es requerido';
  //     return;
  //   }
  //   if (!this.newExam.teacherId) {
  //     this.errorMessage = 'El profesor es requerido';
  //     return;
  //   }
  //   if (!this.newExam.questions?.length) {
  //     this.errorMessage = 'Se requiere al menos una pregunta';
  //     return;
  //   }

  //   // Validar preguntas
  //   const invalidQuestion = this.newExam.questions.find(q => !this.isValidQuestion(q));
  //   if (invalidQuestion) {
  //     this.errorMessage = 'Una o más preguntas son inválidas (Una o más preguntas son inválidas (deben tener texto y entre 3-6 opciones: 1 correcta)';
  //     return;
  //   }

  //   // Verificar título duplicado y examen existente para el teacherId
  //   this.examCrudService.checkExamTitleExists(this.newExam.title, this.editingExamId).subscribe({
  //     next: (titleExists) => {
  //       if (titleExists) {
  //         this.errorMessage = 'Ya existe un examen con este título';
  //         return;
  //       }

  //       this.examCrudService.checkExamExistsByTeacherId(this.newExam.teacherId!, this.editingExamId).subscribe({
  //         next: (teacherExamExists) => {
  //           if (teacherExamExists) {
  //             this.errorMessage = 'Este profesor ya tiene un examen asignado';
  //             return;
  //           }

  //           const examData: Partial<Exam> = {
  //             title: this.newExam.title!.trim(),
  //             teacherId: this.newExam.teacherId,
  //             teacherName: this.newExam.teacherName?.trim() || undefined,
  //             questions: this.newExam.questions
  //           };

  //           if (this.editingExamId) {
  //             this.examCrudService.updateExam(this.editingExamId, examData).subscribe({
  //               next: (success) => {
  //                 if (success) {
  //                   this.resetForm();
  //                 } else {
  //                   this.errorMessage = 'Error al actualizar el examen';
  //                 }
  //               },
  //               error: (error) => {
  //                 console.error('Error al actualizar el examen:', error);
  //                 this.errorMessage = 'Error al actualizar el examen';
  //               }
  //             });
  //           } else {
  //             this.examCrudService.createExam(examData).subscribe({
  //               next: (id) => {
  //                 if (id) {
  //                   this.resetForm();
  //                 } else {
  //                   this.errorMessage = 'Error al crear el examen';
  //                 }
  //               },
  //               error: (error) => {
  //                 console.error('Error al crear el examen:', error);
  //                 this.errorMessage = 'Error al crear el examen';
  //               }
  //             });
  //           }
  //         },
  //         error: (error) => {
  //           console.error('Error al verificar el examen por teacherId:', error);
  //           this.errorMessage = 'Error al verificar el examen para el profesor';
  //         }
  //       });
  //     },
  //     error: (error) => {
  //       console.error('Error al verificar el título:', error);
  //       this.errorMessage = 'Error al verificar el título del examen';
  //     }
  //   });
  // }

  // deleteExam() {
  //   if (this.editingExamId) {
  //     const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este examen?');
  //     if (confirmDelete) {
  //       this.examCrudService.deleteExam(this.editingExamId).subscribe({
  //         next: (success) => {
  //           if (success) {
  //             this.resetForm();
  //           } else {
  //             this.errorMessage = 'Error al eliminar el examen';
  //           }
  //         },
  //         error: (error) => {
  //           console.error('Error al eliminar el examen:', error);
  //           this.errorMessage = 'Error al eliminar el examen';
  //         }
  //       });
  //     }
  //   }
  // }

  // updateTeacherName(event: Event) {
  //   const selectElement = event.target as HTMLSelectElement;
  //   const teacherId = selectElement.value;
  //   this.newExam.teacherId = teacherId;

  //   if (teacherId) {
  //     this.teacherCrudService.getTeacherById(teacherId).subscribe({
  //       next: (teacher) => {
  //         this.newExam.teacherName = teacher ? teacher.name : '';
  //         // Cargar el examen asociado al teacherId
  //         this.examCrudService.getExamByTeacherId(teacherId).subscribe({
  //           next: (exam) => {
  //             if (exam) {
  //               this.newExam = {
  //                 title: exam.title,
  //                 teacherId: exam.teacherId,
  //                 teacherName: exam.teacherName || '',
  //                 questions: exam.questions.map(q => ({
  //                   text: q.text,
  //                   options: q.options.map(o => ({ text: o.text, isCorrect: o.isCorrect }))
  //                 }))
  //               };
  //               this.editingExamId = exam.id;
  //               this.selectedExamId = exam.id;
  //               this.errorMessage = '';
  //             } else {
  //               this.newExam = {
  //                 title: '',
  //                 teacherId: teacherId,
  //                 teacherName: this.newExam.teacherName,
  //                 questions: []
  //               };
  //               this.editingExamId = undefined;
  //               this.selectedExamId = '';
  //               this.errorMessage = '';
  //             }
  //           },
  //           error: (error) => {
  //             console.error('Error al cargar el examen por teacherId:', error);
  //             this.errorMessage = 'Error al cargar el examen';
  //           }
  //         });
  //       },
  //       error: (error) => {
  //         console.error('Error al obtener el profesor:', error);
  //         this.newExam.teacherName = '';
  //       }
  //     });
  //   } else {
  //     this.newExam.teacherName = '';
  //     this.resetForm();
  //   }
  // }

  // addQuestion() {
  //   this.newExam.questions = this.newExam.questions || [];
  //   this.newExam.questions.push({
  //     text: '',
  //     options: [
  //       { text: '', isCorrect: true },
  //       { text: '', isCorrect: false },
  //       { text: '', isCorrect: false }
  //     ]
  //   });
  // }

  // removeQuestion(index: number) {
  //   this.newExam.questions = this.newExam.questions?.filter((_, i) => i !== index) || [];
  // }

  // updateOptionCorrectness(questionIndex: number, optionIndex: number) {
  //   const question = this.newExam.questions![questionIndex];
  //   question.options = question.options.map((opt, i) => ({
  //     ...opt,
  //     isCorrect: i === optionIndex
  //   }));
  // }

  // resetForm() {
  //   this.newExam = {
  //     title: '',
  //     teacherId: '',
  //     teacherName: '',
  //     questions: []
  //   };
  //   this.editingExamId = undefined;
  //   this.selectedExamId = '';
  //   this.errorMessage = '';
  // }

  // // private isValidQuestion(question: Question): boolean {
  // //   if (!question.text?.trim()) {
  // //     return false;
  // //   }
  // //   if (!Array.isArray(question.options) || question.options.length !== 6) {
  // //     return false;
  // //   }
  // //   const correctCount = question.options.filter(opt => opt.isCorrect).length;
  // //   if (correctCount !== 1) {
  // //     return false;
  // //   }
  // //   return question.options.every(opt => opt.text?.trim() && typeof opt.isCorrect === 'boolean');
  // // }
  // private isValidQuestion(question: Question): boolean {
  //   if (!question.text?.trim()) {
  //     return false;
  //   }
  //   if (!Array.isArray(question.options) || question.options.length < 3 || question.options.length > 6) {
  //     return false;
  //   }
  //   const correctCount = question.options.filter(opt => opt.isCorrect).length;
  //   if (correctCount !== 1) {
  //     return false;
  //   }
  //   return question.options.every(opt => opt.text?.trim() && typeof opt.isCorrect === 'boolean');
  // }

  // addOption(questionIndex: number) {
  //   this.newExam.questions = this.newExam.questions || [];
  //   const question = this.newExam.questions[questionIndex];
  //   if (question.options.length < 6) {
  //     question.options.push({ text: '', isCorrect: false });
  //   }
  // }

  // removeOption(questionIndex: number, optionIndex: number) {
  //   this.newExam.questions = this.newExam.questions || [];
  //   const question = this.newExam.questions[questionIndex];
  //   if (question.options.length > 4) {
  //     question.options = question.options.filter((_, i) => i !== optionIndex);
  //     // Asegurar que haya una opción correcta
  //     if (!question.options.some(opt => opt.isCorrect)) {
  //       question.options[0].isCorrect = true;
  //     }
  //   }
  // }

  // // updateOptionCorrectness(questionIndex: number, optionIndex: number) {
  // //   const question = this.newExam.questions![questionIndex];
  // //   question.options = question.options.map((opt, i) => ({
  // //     ...opt,
  // //     isCorrect: i === optionIndex
  // //   }));
  // // }
}
