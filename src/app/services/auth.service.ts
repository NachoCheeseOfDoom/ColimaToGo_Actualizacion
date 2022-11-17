import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
 
  constructor(public auth: AngularFireAuth) {
  }
  loginGoogle() {
  return  this.auth.signInWithPopup(new auth.GoogleAuthProvider());
  }

  loginFaceBook() {
    return  this.auth.signInWithPopup(new auth.FacebookAuthProvider());
    }
  logout() {
    this.auth.signOut();
  }

  currentUser(): Observable<firebase.User | null> {
    return this.auth.user;
  }

  // Registro con email
  signUpWithEmail(email, pass): Promise<firebase.auth.UserCredential> {
    return this.auth.createUserWithEmailAndPassword(email, pass);
  }
  // Ingreso con email
  signInWithEmail(email, pass): Promise<firebase.auth.UserCredential> {
    return this.auth.signInWithEmailAndPassword(email, pass)
  }

  // Recuperar contraseña
  resetPassword(email): Promise<void> {
    return this.auth.sendPasswordResetEmail(email);
  }

}
