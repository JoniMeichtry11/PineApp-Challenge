import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth, user } from '@angular/fire/auth';
import { map, take } from 'rxjs/operators';

/**
 * Guard funcional que protege las rutas de la aplicación.
 * Redirige a /login si el usuario no está autenticado (ADR-009, ADR-015).
 */
export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  return user(auth).pipe(
    take(1),
    map(currentUser => {
      if (currentUser) {
        return true;
      }
      return router.createUrlTree(['/login']);
    })
  );
};
