import { Injectable, inject, signal } from '@angular/core';

import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, user } from '@angular/fire/auth';
import { Observable, from } from 'rxjs';

import { User } from '@models/user';
import { UserService } from '@services/user.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  firebaseAuth = inject(Auth);
  userService = inject(UserService)
  user$ = user(this.firebaseAuth);
  currentUserSig = signal<User | null | undefined>(undefined);

  user!: User;

  constructor() { }

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
    this.user = {
      email: email,
      username: username,
      userUID: userUid
    }
    this.userService.addUserWithId(this.user, userUid);
    this.userService.setUserSig(this.user);
  }

  login(email: string, password: string) {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {

    });

    return from(promise)
  }

  logout(): Observable<void> {
    this.userService.setUserSigNull();
    const promise = signOut(this.firebaseAuth);
    return from(promise)
  }

}
