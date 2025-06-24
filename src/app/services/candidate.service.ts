import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  getDoc,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  orderBy,
  query,
  where
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Candidate } from '@models/candidate';

@Injectable({
  providedIn: 'root',
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
      map((candidates) => candidates as Candidate[]),
      catchError((error) => {
        console.error('Error al obtener usuarios:', error);
        return of([]);
      })
    ) as Observable<Candidate[]>;
  }

  /**
 * Obtiene todos los candidatos que tienen un recruiter específico en su array recruiters
 * @param recruiterUid UID del recruiter a buscar
 * @returns Observable con un arreglo de candidatos
 */
getCandidatesByRecruiter(recruiterUid: string): Observable<Candidate[]> {
  const candidatesRef = collection(this.firestore, 'candidates');
  const candidatesQuery = query(
    candidatesRef,
    where('recruiters', 'array-contains', recruiterUid)
  );
  return collectionData(candidatesQuery, { idField: 'candidateUID' }).pipe(
    map((candidates) => candidates as Candidate[]),
    catchError((error) => {
      console.error('Error:', error);
      return of([]);
    })
  );
}

  /**
   * Agrega un usuario con un ID específico
   * @param user Datos del usuario
   * @param userId ID del usuario (generalmente el UID de Firebase Auth)
   */
  addUserWithId(user: Candidate, userId: string): Promise<void> {
    console.log(user);
    return setDoc(doc(this.candidatesCollection, userId), user).catch(
      (error) => {
        console.error('Error al agregar usuario:', error);
        throw error;
      }
    );
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
    return candidate as Candidate;
  }

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
      .catch((error) => {
        console.error('Error al actualizar usuario:', error);
        throw error;
      });
  }

  async updateCandidateIfNeeded(
    userId: string,
    jobId: string,
    jobRecruiterId: string
  ) {
    const candidate = await this.getThisCandidate(userId);
    console.log(candidate);
    candidate.lastJobId = jobId;

    if (candidate.jobs) {
      // --- 1. Lógica para el array 'jobs' ---

      // Primero, manejamos un caso especial: si el array solo contiene un string vacío [''],
      // lo vaciamos para empezar de forma limpia. Esto es opcional pero recomendable.
      if (candidate.jobs.length === 1 && candidate.jobs[0] === '') {
        candidate.jobs = [];
      }

      // Verificamos si el jobId NO está incluido en el array de trabajos.
      if (!candidate.jobs.includes(jobId)) {
        // Si no está, lo agregamos al final del array.
        candidate.jobs.push(jobId);
        console.log(`'${jobId}' agregado al array 'jobs'.`);
      } else {
        console.log(
          `'${jobId}' ya existe en el array 'jobs'. No se realizaron cambios.`
        );
      }
    }
    if (candidate.recruiters) {
      // --- 2. Lógica para el array 'recruiters' ---

      // Hacemos lo mismo para el array de reclutadores.
      if (candidate.recruiters.length === 1 && candidate.recruiters[0] === '') {
        candidate.recruiters = [];
      }

      // Verificamos si el jobRecruiterId NO está incluido en el array de reclutadores.
      if (!candidate.recruiters.includes(jobRecruiterId)) {
        // Si no está, lo agregamos.
        candidate.recruiters.push(jobRecruiterId);
        console.log(`'${jobRecruiterId}' agregado al array 'recruiters'.`);
      } else {
        console.log(
          `'${jobRecruiterId}' ya existe en el array 'recruiters'. No se realizaron cambios.`
        );
      }
    }
    console.log('\n\neste estaría updateado si necesario\n');
    console.log(candidate);

    this.updateOneUser(candidate, userId);



    console.log(jobId, jobRecruiterId);
  }
}
