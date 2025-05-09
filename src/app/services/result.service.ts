import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, where } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Result } from '@models/result';

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private firestore = inject(Firestore);

  saveResult(result: Omit<Result, 'id'>): Promise<string> {
    const resultsCollection = collection(this.firestore, 'examsresults');
    return addDoc(resultsCollection, result).then(docRef => docRef.id);
  }

  getAllResults(): Observable<Result[]> {
    const resultsCollection = collection(this.firestore, 'examsresults');
    return collectionData(resultsCollection, { idField: 'id' }).pipe(
      map(results => results as Result[]),
      catchError(error => {
        console.error('Error al obtener resultados:', error);
        return of([]);
      })
    );
  }

  getResultsByUserId(userId: string): Observable<Result[]> {
    const resultsCollection = collection(this.firestore, 'examsresults');
    const resultsQuery = query(resultsCollection, where('userUID', '==', userId));
    return collectionData(resultsQuery, { idField: 'id' }).pipe(
      map(results => results as Result[]),
      catchError(error => {
        console.error('Error al obtener resultados del usuario:', error);
        return of([]);
      })
    );
  }

  getLastResultByUserAndExam(userId: string, examId: string): Observable<Result | null> {
    const resultsCollection = collection(this.firestore, 'examsresults');
    const resultsQuery = query(
      resultsCollection,
      where('userUID', '==', userId),
      where('examId', '==', examId)
    );
    return collectionData(resultsQuery, { idField: 'id' }).pipe(
      map((results: any[]) => {
        if (results.length === 0) return null;
        // Ordenar por 'time' descendente en el cliente
        const sortedResults = (results as Result[]).sort((a, b) => {
          const dateA = new Date(a.time).getTime();
          const dateB = new Date(b.time).getTime();
          return dateB - dateA; // Más reciente primero
        });
        return sortedResults[0];
      }),
      catchError(error => {
        console.error('Error al obtener el último resultado:', error);
        return of(null);
      })
    );
  }





  // saveResult(result: Omit<Result, 'id'>): Promise<string> {
  //   const resultsCollection = collection(this.firestore, 'examsresults');
  //   return addDoc(resultsCollection, result).then(docRef => docRef.id);
  // }

  // /**
  //  * Obtiene todos los resultados de la colección 'examsresults'
  //  * @returns Observable con un arreglo de resultados
  //  */
  // getAllResults(): Observable<Result[]> {
  //   const resultsCollection = collection(this.firestore, 'examsresults');
  //   return collectionData(resultsCollection, { idField: 'id' }).pipe(
  //     map(results => results as Result[]),
  //     catchError(error => {
  //       console.error('Error al obtener resultados:', error);
  //       return of([]);
  //     })
  //   );
  // }

  // /**
  //  * Obtiene los resultados de un usuario específico por su userUID
  //  * @param userId ID del usuario (userUID)
  //  * @returns Observable con un arreglo de resultados del usuario
  //  */
  // getResultsByUserId(userId: string): Observable<Result[]> {
  //   const resultsCollection = collection(this.firestore, 'examsresults');
  //   const resultsQuery = query(resultsCollection, where('userUID', '==', userId));
  //   return collectionData(resultsQuery, { idField: 'id' }).pipe(
  //     map(results => results as Result[]),
  //     catchError(error => {
  //       console.error('Error al obtener resultados del usuario:', error);
  //       return of([]);
  //     })
  //   );
  // }



}
