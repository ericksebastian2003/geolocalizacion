import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { Observable } from 'rxjs';
import { switchMap, map } from 'rxjs/operators';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import {Geolocation} from '@capacitor/geolocation';
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

// Define la interfaz para los usuarios que incluye UID y correo electrónico.
export interface User {
  uid: string;
  email: string;
}

// Define la interfaz para los mensajes del chat, incluyendo un mensaje opcional de ubicación.
export interface Message {
  createdAt: firebase.firestore.FieldValue; // Marca de tiempo de Firebase.
  id?: string; // Campo opcional para el identificador del mensaje.
  from: string; // UID del remitente.
  msg: string; // Contenido del mensaje.
  fromName: string; // Nombre o correo del remitente.
  myMsg: boolean; // Booleano para identificar si el mensaje es del usuario actual.
  latitude?: number; // Coordenada opcional de latitud.
  longitude?: number; // Coordenada opcional de longitud.
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  currentUser: User | null = null; // Variable que almacena el usuario actual.
  messages!: Observable<Message[]>; // Observable para manejar mensajes.
  messageInput: string = ''; // Variable para el mensaje de entrada del usuario.

  constructor(private afAuth: AngularFireAuth, private afs: AngularFirestore) {}

  ngOnInit() {
    // Se suscribe al estado de autenticación para obtener el usuario actual.
    this.afAuth.authState.subscribe((user) => {
      if (user) {
        this.currentUser = {
          uid: user.uid ?? '', // Utiliza el operador de coalescencia para manejar valores nulos.
          email: user.email ?? ''
        };
        this.getMessages(); // Llama a la función para obtener mensajes después de la autenticación.
      }
    });
  }

  // Función para obtener mensajes desde Firestore y asociar nombres de usuarios.
  getMessages() {
    let users: User[] = []; // Almacena usuarios para asociar mensajes.
    this.messages = this.getUsers().pipe(
      switchMap(res => {
        users = res; // Asigna los usuarios obtenidos.
        return this.afs.collection<Message>('messages', ref => ref.orderBy('createdAt')).valueChanges({ idField: 'id' });
      }),
      // Mapea cada mensaje para agregar el nombre del remitente y verificar si es un mensaje propio.
      map((messages: Message[]) => {
        return messages.map(m => {
          m.fromName = this.getUserForMsg(m.from, users);
          m.myMsg = this.currentUser?.uid === m.from;
          return m;
        });
      })
    );
  }

  // Función para enviar un mensaje.
  sendMessage() {
    if (this.messageInput.trim()) {
      // Agrega el mensaje a Firestore.
      this.afs.collection('messages').add({
        msg: this.messageInput,
        from: this.currentUser?.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      }).then(() => {
        this.messageInput = ''; // Limpia el campo de entrada después de enviar el mensaje.
      }).catch(err => console.error('Error al enviar el mensaje', err));
    }
  }

  // Método para enviar la ubicación del usuario.
  async sendLocation() {
    try {
      // Obtiene las coordenadas actuales del dispositivo.
      const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const latitude = coordinates.coords.latitude;
      const longitude = coordinates.coords.longitude;

      // Envía un mensaje con la ubicación.
      this.afs.collection('messages').add({
        msg: 'Ubicación compartida',
        from: this.currentUser?.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        latitude,
        longitude
      }).then(() => {
        console.log('Ubicación enviada correctamente');
      }).catch(err => console.error('Error al enviar la ubicación', err));
    } catch (error) {
      console.error('Error al obtener la ubicación:', error);
    }
  }

  // Función privada para obtener usuarios desde Firestore.
  private getUsers(): Observable<User[]> {
    return this.afs.collection<User>('users').valueChanges({ idField: 'uid' });
  }

  // Función para obtener el nombre del remitente de un mensaje.
  private getUserForMsg(msgFromId: string, users: User[]): string {
    for (let usr of users) {
      if (usr.uid === msgFromId) {
        return usr.email;
      }
    }
    return 'Deleted'; // Si el usuario no se encuentra, se devuelve 'Deleted'.
  }

  signOut(): Promise<void> {
    return this.afAuth.signOut()
      .then(() => {
        console.log('User signed out successfully');
        // Puedes redirigir al usuario o ejecutar cualquier otra lógica adicional aquí.
      })
      .catch(error => {
        console.error('Error signing out:', error);
      });
  }
  
  
}