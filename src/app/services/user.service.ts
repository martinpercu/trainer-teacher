import { Injectable, inject, signal } from '@angular/core';
import { Firestore, addDoc, collection, collectionData, getDoc, deleteDoc, doc, setDoc, updateDoc, DocumentSnapshot, DocumentData } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { User } from '@models/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  firestore = inject(Firestore);
  usersCollection = collection(this.firestore, 'users');

  userSig = signal<User | null>(null);

  user!: User;
  userID!: string;

  constructor() {
   }

  addUserWithId(user: User, userId: any) {
    console.log(user);
    const usersRef = collection(this.firestore, 'users');
    return setDoc(doc(usersRef, userId), user);
  };

  setUserSig(user: User | null){
    this.userSig.set(user)
    console.log(this.userSig());
  };
  setUserSigNull(){
    this.userSig.set(null)
  }

  async getOneUser(userId: string) {
    // const clientDocRef = doc(this.firestore, `clientsjoinedlist/${clientId}`);
    const usersRef = doc(this.firestore, 'users', userId);
    console.log(usersRef);
    const user = (await getDoc(usersRef)).data();
    console.log(user);
    return user as User
  };

  deleteUser(user: User) {
    const userDocRef = doc(this.firestore, `users/${user.userUID}`);
    return deleteDoc(userDocRef)
  };

  updateOneUser(user: any, userId: string) {
    const userDocRef = doc(this.firestore, 'users', userId);
    updateDoc(userDocRef, user)
      .then(() => {
        console.log('User updated');
        // alert('User Updated');
      })
      .catch((error) => {
        console.log(error);
      })
  };

}
