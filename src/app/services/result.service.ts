import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Result } from '@models/result';

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  constructor(private firestore: Firestore) {}

  saveResult(result: Omit<Result, 'id'>): Promise<string> {
    const resultsCollection = collection(this.firestore, 'examsresults');
    return addDoc(resultsCollection, result).then(docRef => docRef.id);
  }
}
