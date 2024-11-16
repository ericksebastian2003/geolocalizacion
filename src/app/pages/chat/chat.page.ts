import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
/*
// Definimos la interfaz para el usuario
export interface User {
  uid: string;
  email: string;
}

// Definimos la interfaz para los mensajes del chat
export interface Message {
  createdAt: firebase.firestore.FieldValue;
  id: string;
  from: string;
  msg: string;
  fromName: string;
  myMsg: boolean;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  currentUser: User | null = null;

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid ?? '', // Si 'user.uid' es null, se asigna una cadena vacía
          email: user.email ?? '' // Si 'user.email' es null, se asigna una cadena vacía
        };
      }
    });
    
  }

  async signup({ email, password }: { email: string; password: string }): Promise<any> {
    try {
      const credential = await this.afAuth.createUserWithEmailAndPassword(email, password);
      const uid = credential.user?.uid;
      const userEmail = credential.user?.email;
      if (uid && userEmail) {
        return this.afs.doc(`users/${uid}`).set({
          uid,
          email: userEmail,
        });
      } else {
        throw new Error('User data is incomplete.');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
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
      throw new Error('User is not authenticated.');
    }

    return this.afs.collection('messages').add({
      msg: msg,
      from: this.currentUser.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }

  getChatMessages() {
    let users: User[] = [];
    return this.getUsers().pipe(
      switchMap(res => {
        users = res;
        return this.afs.collection<Message>('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' });
      }),
      map((messages: Message[]) => {
        for (let m of messages) {
          if (m && m.from) {
            m.fromName = this.getUserForMsg(m.from, users);
            m.myMsg = this.currentUser?.uid === m.from;
          }
        }
        return messages;
      })
    );
  }

  private getUsers(): Observable<User[]> {
    return this.afs.collection('users').valueChanges({ idField: 'uid' }) as Observable<User[]>;
  }

  private getUserForMsg(msgFromId: string, users: User[]): string {
    for (let usr of users) {
      if (usr.uid === msgFromId) {
        return usr.email;
      }
    }
    return 'Deleted';
  }
}
*/


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

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  currentUser: User | null = null; // Usuario actual
  messages!: Observable<Message[]>; // Usar '!' para indicar que será inicializado más tarde
  messageInput: string = ''; // Propiedad para almacenar lo que el usuario escribe

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  ngOnInit() {
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid ?? '',
          email: user.email ?? ''
        };
        this.getMessages(); // Inicializa los mensajes después de la autenticación
      }
    });
  }

  // Método para obtener los mensajes desde Firestore
  getMessages() {
    let users: User[] = [];
    this.messages = this.getUsers().pipe(
      switchMap(res => {
        users = res; // Asignar usuarios obtenidos
        return this.afs.collection<Message>('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' });
      }),
      map((messages: Message[]) => {
        // Mapear los mensajes con el nombre de usuario y si es un mensaje propio
        return messages.map(m => {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser?.uid === m.from;
          return m;
        });
      })
    );
  }


  // Método para enviar un mensaje
  sendMessage() {
    if (this.messageInput.trim()) {
      this.afs.collection('messages').add({
        msg: this.messageInput,
        from: this.currentUser?.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }).then(() => {
        this.messageInput = ''; // Limpiar el campo de texto después de enviar el mensaje
      }).catch(err => console.error('Error al enviar el mensaje', err));
    }
  }

  // Método privado para obtener los usuarios desde Firestore
  private getUsers(): Observable<User[]> {
    return this.afs.collection<User>('users').valueChanges({ idField: 'uid' });
  }

  // Método privado para obtener el nombre del remitente
  private getUserForMsg(msgFromId: string, users: User[]): string {
    for (let usr of users) {
      if (usr.uid === msgFromId) {
        return usr.email;
      }
    }
    return 'Deleted';
  }

  // Método para cerrar sesión
  signOut() {
    this.afAuth.signOut();
  }
}
