import { Injectable, inject, signal } from '@angular/core';
import { Firestore, collection, collectionData, getDoc, deleteDoc, doc, setDoc, updateDoc, orderBy, query  } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Candidate } from '@models/candidate';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private firestore = inject(Firestore);
  private candidatesCollection = collection(this.firestore, 'candidates');

  candidateSig = signal<Candidate | null>(null);

  /**
   * Obtiene todos los usuarios de la colección 'candidates'
   * @returns Observable con un arreglo de usuarios
   */
  getAllUsers(): Observable<Candidate[]> {
    const canidatesRef = collection(this.firestore, 'candidates');
    const candidatesQuery = query(canidatesRef, orderBy('username'));
    return collectionData(candidatesQuery, { idField: 'candidateUID' }).pipe(
      map(candidates => candidates as Candidate[]),
      catchError(error => {
        console.error('Error al obtener usuarios:', error);
        return of([]);
      })
    ) as Observable<Candidate[]>;
  }

  /**
   * Agrega un usuario con un ID específico
   * @param user Datos del usuario
   * @param userId ID del usuario (generalmente el UID de Firebase Auth)
   */
  addUserWithId(user: Candidate, userId: string): Promise<void> {
    console.log(user);
    return setDoc(doc(this.candidatesCollection, userId), user).catch(error => {
      console.error('Error al agregar usuario:', error);
      throw error;
    });
  }

  /**
   * Establece el usuario actual en la señal
   * @param user Usuario o null
   */
  setUserSig(user: Candidate | null) {
    this.candidateSig.set(user);
    console.log(this.candidateSig());
  }

  /**
   * Establece la señal del usuario como null
   */
  setUserSigNull() {
    this.candidateSig.set(null);
  }

  /**
   * Obtiene un usuario por su ID
   * @param userId ID del usuario
   * @returns Promesa con el usuario o null si no existe
   */
  async getOneCandidate(userId: string): Promise<Candidate | null> {
    const usersRef = doc(this.candidatesCollection, userId);
    try {
      const user = (await getDoc(usersRef)).data();
      return user as Candidate | null;
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return null;
    }
  }

  async getThisCandidate(userId: string) {
    // const clientDocRef = doc(this.firestore, `users/${clientId}`);
    const userDocRef = doc(this.firestore, 'candidates', userId);
    console.log(userDocRef);
    const candidate = (await getDoc(userDocRef)).data();
    console.log(candidate);
    return candidate as Candidate
  };



  /**
   * Elimina un usuario por su ID
   * @param user Candidate a eliminar
   */
  deleteCandidate(user: Candidate) {
    const userDocRef = doc(this.candidatesCollection, user.candidateUID);
    return deleteDoc(userDocRef);
  }

  /**
   * Actualiza un usuario por su ID
   * @param user Datos parciales del usuario
   * @param userId ID del usuario
   */
  updateOneUser(user: Partial<Candidate>, userId: string) {
    const userDocRef = doc(this.candidatesCollection, userId);
    return updateDoc(userDocRef, user)
      .then(() => {
        console.log('Candidate updated');
      })
      .catch(error => {
        console.error('Error al actualizar usuario:', error);
        throw error;
      });
  }

}
