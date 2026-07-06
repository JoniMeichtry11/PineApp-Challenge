import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, Subscription } from 'rxjs';

/**
 * Servicio encargado de monitorear el estado de conectividad de la aplicación.
 * Se introdujo para solucionar falsos positivos de Firestore (ADR-018), ya que 
 * Firestore maneja su propio estado interno offline/online silencioso.
 * Este servicio alerta explícitamente al usuario cuando se corta la red física,
 * evitando que la app parezca "colgada" durante operaciones de lectura/escritura.
 */
@Injectable({
  providedIn: 'root'
})
export class ConnectionService implements OnDestroy {
  private readonly onlineStatus = new BehaviorSubject<boolean>(navigator.onLine);
  public isOnline$ = this.onlineStatus.asObservable();

  private onlineSubscription: Subscription;
  private offlineSubscription: Subscription;

  constructor() {
    this.onlineSubscription = fromEvent(window, 'online').subscribe(() => {
      this.onlineStatus.next(true);
    });

    this.offlineSubscription = fromEvent(window, 'offline').subscribe(() => {
      this.onlineStatus.next(false);
    });
  }

  ngOnDestroy(): void {
    this.onlineSubscription.unsubscribe();
    this.offlineSubscription.unsubscribe();
  }
}
