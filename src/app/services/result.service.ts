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

  /**
   * Obtiene todos los resultados de la colección 'examsresults'
   * @returns Observable con un arreglo de resultados
   */
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

  /**
   * Obtiene los resultados de un usuario específico por su userUID
   * @param userId ID del usuario (userUID)
   * @returns Observable con un arreglo de resultados del usuario
   */
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



}
