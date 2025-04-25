import { Injectable } from '@angular/core';
import { Firestore, doc, docData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Exam } from '@models/exam';

@Injectable({
  providedIn: 'root'
})

export class ExamService {
  constructor(private firestore: Firestore) {}

  getExamById(examId: string): Observable<Exam | null> {
    const examRef = doc(this.firestore, `exams/${examId}`);
    return docData(examRef, { idField: 'id' }).pipe(
      map(data => {
        if (data && this.isValidExam(data)) {
          return data as Exam;
        }
        return null;
      }),
      catchError(error => {
        console.error('Error al cargar el examen:', error);
        return of(null);
      })
    );
  }

  private isValidExam(data: any): boolean {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.title === 'string' &&
      typeof data.teacherId === 'string' &&
      Array.isArray(data.questions) &&
      data.questions.every((q: any) =>
        typeof q.text === 'string' &&
        Array.isArray(q.options) &&
        q.options.every((o: any) =>
          typeof o.text === 'string' &&
          typeof o.isCorrect === 'boolean'
        )
      )
    );
  }
}
