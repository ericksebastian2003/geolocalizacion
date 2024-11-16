import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AngularFireModule } from '@angular/fire/compat'; // Importar AngularFireModule
import { AngularFireAuthModule } from '@angular/fire/compat/auth'; // Importar el módulo de autenticación
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getDatabase, provideDatabase } from '@angular/fire/database';
import { getStorage, provideStorage } from '@angular/fire/storage';
import {environment} from '../environments/environment'

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule, 
    IonicModule.forRoot(), 
    AppRoutingModule , 
    AngularFireModule.initializeApp(environment.firebaseConfig), // Configuración de Firebase
    AngularFireAuthModule,
  ],
  providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideFirebaseApp(() => 
    initializeApp(environment.firebaseConfig), 
    provideAuth(() => getAuth()),
     provideFirestore(() => getFirestore()),
      provideDatabase(() => getDatabase()), 
      provideStorage(() => getStorage())), provideFirebaseApp(() => initializeApp({"projectId":"b-470cb","appId":"1:901764449978:web:e69f6f8a6f900815cfe483","storageBucket":"b-470cb.firebasestorage.app","apiKey":"AIzaSyAbMFYNMV63u8MY_EB9cWnjeN495wAkOz8","authDomain":"b-470cb.firebaseapp.com","messagingSenderId":"901764449978","measurementId":"G-JTVSPGD292"})), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()), provideDatabase(() => getDatabase()), provideStorage(() => getStorage())],
  bootstrap: [AppComponent],
})
export class AppModule {}
