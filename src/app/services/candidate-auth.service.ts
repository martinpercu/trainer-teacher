import { Injectable, inject, signal } from '@angular/core';

import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';

import { Candidate } from '@models/candidate';
import { CandidateService } from '@services/candidate.service';


@Injectable({
  providedIn: 'root'
})
export class CandidateAuthService {

  firebaseAuth = inject(Auth);
  candidateService = inject(CandidateService)
  candidate$ = user(this.firebaseAuth);
  currentCandidateSig = signal<Candidate | null | undefined>(undefined);

  candidate!: Candidate;

  constructor() {
    this.candidate$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        const candidate = await this.candidateService.getOneCandidate(firebaseUser.uid);
        this.candidateService.setUserSig(candidate);
        // this.currentUserSig.set(candidate); // Opcional
      } else {
        this.candidateService.setUserSig(null);
        // this.currentUserSig.set(null); // Opcional
      }
    });
  }

  register(
    email: string,
    username: string,
    password: string,
    jobRecruiterId: string,
    jobId: string
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password,
    ).then((response) => {
      updateProfile(response.user, { displayName: username })
      this.addRegisterUsed(email, username, response.user.uid, jobRecruiterId, jobId)
    }
    );
    return from(promise);
  };

  addRegisterUsed(email: string, username: string, userUid:any, jobRecruiterId: string, jobId: string) {
    this.candidate = {
      email: email,
      username: username,
      candidateUID: userUid,
      recruiters: [jobRecruiterId],
      jobs: [jobId],
      lastJobId: jobId
    }
    this.candidateService.addUserWithId(this.candidate, userUid);
    this.candidateService.setUserSig(this.candidate);
  }

  login(email: string, password: string, jobId: string, jobRecruiterId: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (response) => {
        const candidate = await this.candidateService.getThisCandidate(response.user.uid);
        this.candidateService.setUserSig(candidate); // Actualiza el signal en CandidateService
        // this.currentUserSig.set(candidate); // Opcional, si querés mantenerlo aquí también
        this.candidateService.updateCandidateIfNeeded(response.user.uid, jobId, jobRecruiterId)
      })
      .catch((error) => {
        console.error('Error en login:', error);
        throw error; // Propaga el error al observable
      });
    return from(promise);
  }

  logout(): Observable<void> {
    this.candidateService.setUserSigNull();
    const promise = signOut(this.firebaseAuth);
    return from(promise)
  }

}
