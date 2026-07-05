import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { Observable } from 'rxjs';

/**
 * Servicio que gestiona la autenticación con Firebase Auth.
 * Expone el estado de sesión como Observable de solo lectura (ADR-009, ADR-015).
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  /** Observable con el estado de sesión actual (User si hay sesión, null si no) */
  readonly currentUser$: Observable<User | null>;

  constructor(private readonly auth: Auth) {
    this.currentUser$ = user(this.auth);
  }

  /**
   * Inicia sesión con email y password contra Firebase Auth.
   *
   * @param email Correo electrónico del usuario.
   * @param password Contraseña del usuario.
   * @returns Promesa que se resuelve al autenticar exitosamente.
   */
  login(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password).then(() => {});
  }

  /**
   * Cierra la sesión actual.
   *
   * @returns Promesa que se resuelve al cerrar la sesión.
   */
  logout(): Promise<void> {
    return signOut(this.auth);
  }
}
