import { Injectable, inject, signal } from '@angular/core';

import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';

import { Recruiter } from '@models/recruiter';
import { RecruiterService } from '@services/recruiter.service';


@Injectable({
  providedIn: 'root'
})
export class RecruiterAuthService {

  firebaseAuth = inject(Auth);
  recruiterService = inject(RecruiterService)
  recruiter$ = user(this.firebaseAuth);
  currentRecruiterSig = signal<Recruiter | null | undefined>(undefined);

  recruiter!: Recruiter;

  constructor() {
    this.recruiter$.subscribe(async (firebaseUser) => {
      if (firebaseUser) {
        const recruiter = await this.recruiterService.getOneRecruiter(firebaseUser.uid);
        this.recruiterService.setRecruiterSig(recruiter);
        // this.currentUserSig.set(recruiter); // Opcional
      } else {
        this.recruiterService.setRecruiterSig(null);
        // this.currentUserSig.set(null); // Opcional
      }
    });
  }

  register(
    email: string,
    username: string,
    password: string,
  ): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password,
    ).then((response) => {
      updateProfile(response.user, { displayName: username })
      this.addRegisterUsed(email, username, response.user.uid)
    }
    );
    return from(promise);
  };

  addRegisterUsed(email: string, username: string, userUid:any) {
    this.recruiter = {
      email: email,
      username: username,
      recruiterUID: userUid
    }
    this.recruiterService.addUserWithId(this.recruiter, userUid);
    this.recruiterService.setRecruiterSig(this.recruiter);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(this.firebaseAuth, email, password)
      .then(async (response) => {
        const recruiter = await this.recruiterService.getOneRecruiter(response.user.uid);
        this.recruiterService.setRecruiterSig(recruiter); // Actualiza el signal en CandidateService
        // this.currentUserSig.set(recruiter); // Opcional, si querés mantenerlo aquí también
      })
      .catch((error) => {
        console.error('Error en login:', error);
        throw error; // Propaga el error al observable
      });
    return from(promise);
  }

  logout(): Observable<void> {
    this.recruiterService.setUserSigNull();
    const promise = signOut(this.firebaseAuth);
    return from(promise)
  }

}
