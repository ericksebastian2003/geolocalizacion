import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import firebase from 'firebase/compat/app'; 
import 'firebase/compat/firestore'; 


export interface User {
  uid: string;
  email: string;
}

export interface Message {
  createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  currentUser: User | null = null; 

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid ?? '', 
          email: user.email ?? '',
        };
      } else {
        this.currentUser = null;
      }
    });
  }

  async signup({ email, password }: { email: string; password: string }): Promise<any> {
    const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
    const uid = credential.user?.uid;
    const emailAddress = credential.user?.email;

    if (uid && emailAddress) {
      return this.afs.doc(`users/${uid}`).set({
        uid,
        email: emailAddress,
      });
    } else {
      throw new Error('No se pudo crear el usuario correctamente.');
    }
  }

  signIn({ email, password }: { email: string; password: string }) {
    return this.afAuth.signInWithEmailAndPassword(email, password);
  }

  signOut(): Promise<void> {
    return this.afAuth.signOut();
  }

  addChatMessage(msg: string) {
    if (!this.currentUser) {
      throw new Error('No hay un usuario autenticado.');
    }
    return this.afs.collection('messages').add({
      msg,
      from: this.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  getChatMessages() {
    let users: User[] = [];
    return this.getUsers().pipe(
      switchMap((res) => {
        users = res;
        return this.afs.collection<Message>('messages', (ref) => ref.orderBy('createdAt')).valueChanges({ idField: 'id' });
      }),
      map((messages: Message[]) => {
        for (let m of messages) {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser ? this.currentUser.uid === m.from : false;
        }
        return messages;
      })
    );
  }

  private getUsers(): Observable<User[]> {
    return this.afs.collection<User>('users').valueChanges({ idField: 'uid' });
  }

  private getUserForMsg(msgFromId: string, users: User[]): string {
    const user = users.find((usr) => usr.uid === msgFromId);
    return user ? user.email : 'Deleted';
  }
}
