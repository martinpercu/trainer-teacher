import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, from, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Exam, Question, Option } from '@models/exam';

@Injectable({
  providedIn: 'root'
})

export class ExamCrudService {
  private examsCollection;

  constructor(private firestore: Firestore) {
    this.examsCollection = collection(this.firestore, 'exams');
  }

  /**
   * Obtiene todos los exámenes
   */
  getExams(): Observable<Exam[]> {
    return collectionData(this.examsCollection, { idField: 'id' }).pipe(
      map(exams => exams as Exam[]),
      catchError(error => {
        console.error('Error al obtener exámenes:', error);
        return throwError(() => new Error('No se pudieron cargar los exámenes'));
      })
    );
  }

  /**
   * Obtiene un examen por ID
   */
  getExamById(examId: string): Observable<Exam | null> {
    const examDoc = doc(this.firestore, `exams/${examId}`);
    return from(getDoc(examDoc)).pipe(
      map(docSnap => (docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Exam : null)),
      catchError(error => {
        console.error('Error al obtener el examen:', error);
        return throwError(() => new Error(`No se pudo cargar el examen con ID ${examId}`));
      })
    );
  }

  /**
   * Obtiene un examen por teacherId (retorna el primero encontrado)
   */
  getExamByTeacherId(teacherId: string): Observable<Exam | null> {
    const q = query(this.examsCollection, where('teacherId', '==', teacherId));
    return from(getDocs(q)).pipe(
      map(querySnapshot => {
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          return { id: doc.id, ...doc.data() } as Exam;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error al obtener el examen por teacherId:', error);
        return throwError(() => new Error(`No se pudo cargar el examen para el profesor ${teacherId}`));
      })
    );
  }

  /**
   * Crea un nuevo examen
   */
  createExam(exam: Partial<Exam>): Observable<string> {
    const validationError = this.validateExam(exam);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    const examData: Partial<Exam> = {
      title: exam.title!.trim(),
      teacherId: exam.teacherId!,
      teacherName: exam.teacherName?.trim() || undefined,
      questions: exam.questions!
    };

    return from(addDoc(this.examsCollection, examData)).pipe(
      map(docRef => docRef.id),
      catchError(error => {
        console.error('Error al crear el examen:', error);
        return throwError(() => new Error('No se pudo crear el examen'));
      })
    );
  }

  /**
   * Actualiza un examen existente
   */
  updateExam(examId: string, exam: Partial<Exam>): Observable<boolean> {
    const validationError = this.validateExam(exam);
    if (validationError) {
      return throwError(() => new Error(validationError));
    }

    const examDoc = doc(this.firestore, `exams/${examId}`);
    const examData: Partial<Exam> = {
      title: exam.title!.trim(),
      teacherId: exam.teacherId!,
      teacherName: exam.teacherName?.trim() || undefined,
      questions: exam.questions!
    };

    return from(updateDoc(examDoc, examData)).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error al actualizar el examen:', error);
        return throwError(() => new Error(`No se pudo actualizar el examen con ID ${examId}`));
      })
    );
  }

  /**
   * Elimina un examen
   */
  deleteExam(examId: string): Observable<boolean> {
    const examDoc = doc(this.firestore, `exams/${examId}`);
    return from(deleteDoc(examDoc)).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error al eliminar el examen:', error);
        return throwError(() => new Error(`No se pudo eliminar el examen con ID ${examId}`));
      })
    );
  }

  /**
   * Verifica si un examen con el mismo título ya existe
   */
  checkExamTitleExists(title: string, excludeExamId?: string): Observable<boolean> {
    const q = query(this.examsCollection, where('title', '==', title.trim()));
    return from(getDocs(q)).pipe(
      map(querySnapshot =>
        !querySnapshot.empty &&
        !querySnapshot.docs.some(doc => doc.id === excludeExamId)
      ),
      catchError(error => {
        console.error('Error al verificar el título del examen:', error);
        return throwError(() => new Error('No se pudo verificar el título del examen'));
      })
    );
  }

  /**
   * Verifica si existe un examen para el teacherId dado
   */
  checkExamExistsByTeacherId(teacherId: string, excludeExamId?: string): Observable<boolean> {
    const q = query(this.examsCollection, where('teacherId', '==', teacherId));
    return from(getDocs(q)).pipe(
      map(querySnapshot =>
        !querySnapshot.empty &&
        !querySnapshot.docs.some(doc => doc.id === excludeExamId)
      ),
      catchError(error => {
        console.error('Error al verificar el examen por teacherId:', error);
        return throwError(() => new Error('No se pudo verificar el examen para el profesor'));
      })
    );
  }

  /**
   * Valida un examen
   */
  private validateExam(exam: Partial<Exam>): string | null {
    if (!exam.title?.trim()) {
      return 'El título es requerido';
    }
    if (!exam.teacherId) {
      return 'El ID del profesor es requerido';
    }
    if (!exam.questions?.length) {
      return 'Se requiere al menos una pregunta';
    }
    const invalidQuestion = exam.questions.find(q => !this.isValidQuestion(q));
    if (invalidQuestion) {
      return 'Una o más preguntas son inválidas (deben tener texto y 2-6 opciones: 1 correcta)';
    }
    return null;
  }

  /**
   * Valida una pregunta
   */
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





  // private examsCollection;

  // constructor(private firestore: Firestore) {
  //   this.examsCollection = collection(this.firestore, 'exams');
  // }

  // /**
  //  * Obtiene todos los exámenes
  //  */
  // getExams(): Observable<Exam[]> {
  //   return collectionData(this.examsCollection, { idField: 'id' }).pipe(
  //     map(exams => exams as Exam[]),
  //     catchError(error => {
  //       console.error('Error al obtener exámenes:', error);
  //       return throwError(() => new Error('No se pudieron cargar los exámenes'));
  //     })
  //   );
  // }

  // /**
  //  * Obtiene un examen por ID
  //  */
  // getExamById(examId: string): Observable<Exam | null> {
  //   const examDoc = doc(this.firestore, `exams/${examId}`);
  //   return from(getDoc(examDoc)).pipe(
  //     map(docSnap => (docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Exam : null)),
  //     catchError(error => {
  //       console.error('Error al obtener el examen:', error);
  //       return throwError(() => new Error(`No se pudo cargar el examen con ID ${examId}`));
  //     })
  //   );
  // }

  // /**
  //  * Obtiene un examen por teacherId
  //  */
  // getExamByTeacherId(teacherId: string): Observable<Exam | null> {
  //   const q = query(this.examsCollection, where('teacherId', '==', teacherId));
  //   return from(getDocs(q)).pipe(
  //     map(querySnapshot => {
  //       if (!querySnapshot.empty) {
  //         const doc = querySnapshot.docs[0];
  //         return { id: doc.id, ...doc.data() } as Exam;
  //       }
  //       return null;
  //     }),
  //     catchError(error => {
  //       console.error('Error al obtener el examen por teacherId:', error);
  //       return throwError(() => new Error(`No se pudo cargar el examen para el profesor ${teacherId}`));
  //     })
  //   );
  // }

  // /**
  //  * Crea un nuevo examen
  //  */
  // createExam(exam: Partial<Exam>): Observable<string> {
  //   const validationError = this.validateExam(exam);
  //   if (validationError) {
  //     return throwError(() => new Error(validationError));
  //   }

  //   const examData: Partial<Exam> = {
  //     title: exam.title!.trim(),
  //     teacherId: exam.teacherId!,
  //     teacherName: exam.teacherName?.trim() || undefined,
  //     questions: exam.questions!
  //   };

  //   return from(addDoc(this.examsCollection, examData)).pipe(
  //     map(docRef => docRef.id),
  //     catchError(error => {
  //       console.error('Error al crear el examen:', error);
  //       return throwError(() => new Error('No se pudo crear el examen'));
  //     })
  //   );
  // }

  // /**
  //  * Actualiza un examen existente
  //  */
  // updateExam(examId: string, exam: Partial<Exam>): Observable<boolean> {
  //   const validationError = this.validateExam(exam);
  //   if (validationError) {
  //     return throwError(() => new Error(validationError));
  //   }

  //   const examDoc = doc(this.firestore, `exams/${examId}`);
  //   const examData: Partial<Exam> = {
  //     title: exam.title!.trim(),
  //     teacherId: exam.teacherId!,
  //     teacherName: exam.teacherName?.trim() || undefined,
  //     questions: exam.questions!
  //   };

  //   return from(updateDoc(examDoc, examData)).pipe(
  //     map(() => true),
  //     catchError(error => {
  //       console.error('Error al actualizar el examen:', error);
  //       return throwError(() => new Error(`No se pudo actualizar el examen con ID ${examId}`));
  //     })
  //   );
  // }

  // /**
  //  * Elimina un examen
  //  */
  // deleteExam(examId: string): Observable<boolean> {
  //   const examDoc = doc(this.firestore, `exams/${examId}`);
  //   return from(deleteDoc(examDoc)).pipe(
  //     map(() => true),
  //     catchError(error => {
  //       console.error('Error al eliminar el examen:', error);
  //       return throwError(() => new Error(`No se pudo eliminar el examen con ID ${examId}`));
  //     })
  //   );
  // }

  // /**
  //  * Verifica si un examen con el mismo título ya existe
  //  */
  // checkExamTitleExists(title: string, excludeExamId?: string): Observable<boolean> {
  //   const q = query(this.examsCollection, where('title', '==', title.trim()));
  //   return from(getDocs(q)).pipe(
  //     map(querySnapshot =>
  //       !querySnapshot.empty &&
  //       !querySnapshot.docs.some(doc => doc.id === excludeExamId)
  //     ),
  //     catchError(error => {
  //       console.error('Error al verificar el título del examen:', error);
  //       return throwError(() => new Error('No se pudo verificar el título del examen'));
  //     })
  //   );
  // }

  // /**
  //  * Verifica si ya existe un examen para el teacherId dado
  //  */
  // checkExamExistsByTeacherId(teacherId: string, excludeExamId?: string): Observable<boolean> {
  //   const q = query(this.examsCollection, where('teacherId', '==', teacherId));
  //   return from(getDocs(q)).pipe(
  //     map(querySnapshot =>
  //       !querySnapshot.empty &&
  //       !querySnapshot.docs.some(doc => doc.id === excludeExamId)
  //     ),
  //     catchError(error => {
  //       console.error('Error al verificar el examen por teacherId:', error);
  //       return throwError(() => new Error('No se pudo verificar el examen para el profesor'));
  //     })
  //   );
  // }

  // /**
  //  * Valida un examen
  //  */
  // private validateExam(exam: Partial<Exam>): string | null {
  //   if (!exam.title?.trim()) {
  //     return 'El título es requerido';
  //   }
  //   if (!exam.teacherId) {
  //     return 'El ID del profesor es requerido';
  //   }
  //   if (!exam.questions?.length) {
  //     return 'Se requiere al menos una pregunta';
  //   }
  //   const invalidQuestion = exam.questions.find(q => !this.isValidQuestion(q));
  //   if (invalidQuestion) {
  //     return 'Una o más preguntas son inválidas (deben tener texto y 3-6 opciones: 1 correcta)';
  //   }
  //   return null;
  // }

  // /**
  //  * Valida una pregunta
  //  */
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












  // /**
  //  * Obtiene todos los exámenes como un Observable
  //  */
  // getExams(): Observable<Exam[]> {
  //   return collectionData(this.examsCollection, { idField: 'id' }).pipe(
  //     map(exams => exams as Exam[]),
  //     catchError(error => {
  //       console.error('Error al obtener exámenes:', error);
  //       return of([]);
  //     })
  //   );
  // }

  // /**
  //  * Obtiene un examen específico por su ID
  //  */
  // getExamById(examId: string): Observable<Exam | null> {
  //   const examDoc = doc(this.firestore, `exams/${examId}`);
  //   return from(getDoc(examDoc)).pipe(
  //     map(docSnap => (docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Exam : null)),
  //     catchError(error => {
  //       console.error('Error al obtener el examen:', error);
  //       return of(null);
  //     })
  //   );
  // }

  // /**
  //  * Obtiene un examen por teacherId
  //  */
  // getExamByTeacherId(teacherId: string): Observable<Exam | null> {
  //   const q = query(this.examsCollection, where('teacherId', '==', teacherId));
  //   return from(getDocs(q)).pipe(
  //     map(querySnapshot => {
  //       if (!querySnapshot.empty) {
  //         const doc = querySnapshot.docs[0];
  //         return { id: doc.id, ...doc.data() } as Exam;
  //       }
  //       return null;
  //     }),
  //     catchError(error => {
  //       console.error('Error al obtener el examen por teacherId:', error);
  //       return of(null);
  //     })
  //   );
  // }

  // /**
  //  * Crea un nuevo examen
  //  */
  // createExam(exam: Partial<Exam>): Observable<string | null> {
  //   if (!exam.title?.trim()) {
  //     console.error('El título es requerido');
  //     return of(null);
  //   }
  //   if (!exam.teacherId) {
  //     console.error('El ID del profesor es requerido');
  //     return of(null);
  //   }
  //   if (!exam.questions?.length) {
  //     console.error('Se requiere al menos una pregunta');
  //     return of(null);
  //   }

  //   // Validar preguntas
  //   const invalidQuestion = exam.questions.find(q => !this.isValidQuestion(q));
  //   if (invalidQuestion) {
  //     console.error('Una o más preguntas son inválidas');
  //     return of(null);
  //   }

  //   const examData: Partial<Exam> = {
  //     title: exam.title.trim(),
  //     teacherId: exam.teacherId,
  //     teacherName: exam.teacherName?.trim() || undefined,
  //     questions: exam.questions
  //   };

  //   return from(addDoc(this.examsCollection, examData)).pipe(
  //     map(docRef => {
  //       // Actualizar el documento para incluir el ID
  //       updateDoc(doc(this.firestore, `exams/${docRef.id}`), { id: docRef.id });
  //       return docRef.id;
  //     }),
  //     catchError(error => {
  //       console.error('Error al crear el examen:', error);
  //       return of(null);
  //     })
  //   );
  // }

  // /**
  //  * Actualiza un examen existente
  //  */
  // updateExam(examId: string, exam: Partial<Exam>): Observable<boolean> {
  //   if (!exam.title?.trim()) {
  //     console.error('El título es requerido');
  //     return of(false);
  //   }
  //   if (!exam.teacherId) {
  //     console.error('El ID del profesor es requerido');
  //     return of(false);
  //   }
  //   if (!exam.questions?.length) {
  //     console.error('Se requiere al menos una pregunta');
  //     return of(false);
  //   }

  //   // Validar preguntas
  //   const invalidQuestion = exam.questions.find(q => !this.isValidQuestion(q));
  //   if (invalidQuestion) {
  //     console.error('Una o más preguntas son inválidas');
  //     return of(false);
  //   }

  //   const examDoc = doc(this.firestore, `exams/${examId}`);
  //   const examData: Partial<Exam> = {
  //     title: exam.title.trim(),
  //     teacherId: exam.teacherId,
  //     teacherName: exam.teacherName?.trim() || undefined,
  //     questions: exam.questions
  //   };

  //   return from(updateDoc(examDoc, examData)).pipe(
  //     map(() => true),
  //     catchError(error => {
  //       console.error('Error al actualizar el examen:', error);
  //       return of(false);
  //     })
  //   );
  // }

  // /**
  //  * Elimina un examen
  //  */
  // deleteExam(examId: string): Observable<boolean> {
  //   const examDoc = doc(this.firestore, `exams/${examId}`);
  //   return from(deleteDoc(examDoc)).pipe(
  //     map(() => true),
  //     catchError(error => {
  //       console.error('Error al eliminar el examen:', error);
  //       return of(false);
  //     })
  //   );
  // }

  // /**
  //  * Verifica si un examen con el mismo título ya existe
  //  */
  // checkExamTitleExists(title: string, excludeExamId?: string): Observable<boolean> {
  //   const q = query(this.examsCollection, where('title', '==', title.trim()));
  //   return from(getDocs(q)).pipe(
  //     map(querySnapshot =>
  //       !querySnapshot.empty &&
  //       !querySnapshot.docs.some(doc => doc.id === excludeExamId)
  //     ),
  //     catchError(error => {
  //       console.error('Error al verificar el título del examen:', error);
  //       return of(false);
  //     })
  //   );
  // }

  // /**
  //  * Verifica si ya existe un examen para el teacherId dado
  //  */
  // checkExamExistsByTeacherId(teacherId: string, excludeExamId?: string): Observable<boolean> {
  //   const q = query(this.examsCollection, where('teacherId', '==', teacherId));
  //   return from(getDocs(q)).pipe(
  //     map(querySnapshot =>
  //       !querySnapshot.empty &&
  //       !querySnapshot.docs.some(doc => doc.id === excludeExamId)
  //     ),
  //     catchError(error => {
  //       console.error('Error al verificar el examen por teacherId:', error);
  //       return of(false);
  //     })
  //   );
  // }

  // /**
  //  * Valida una pregunta: debe tener texto, 6 opciones, 1 correcta, 5 incorrectas
  //  */
  // private isValidQuestion(question: Question): boolean {
  //   if (!question.text?.trim()) {
  //     return false;
  //   }
  //   if (!Array.isArray(question.options) || question.options.length !== 6) {
  //     return false;
  //   }
  //   const correctCount = question.options.filter(opt => opt.isCorrect).length;
  //   if (correctCount !== 1) {
  //     return false;
  //   }
  //   return question.options.every(opt => opt.text?.trim() && typeof opt.isCorrect === 'boolean');
  // }
}
