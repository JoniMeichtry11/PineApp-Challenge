import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { ConnectionService } from './core/services/connection.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MatSnackBarModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'pinapp-challenge';
  private connectionSubscription?: Subscription;

  constructor(
    private readonly connectionService: ConnectionService,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    // Monitoreo global de conexión (BUG-05 / ADR-018)
    this.connectionSubscription = this.connectionService.isOnline$.subscribe(isOnline => {
      if (!isOnline) {
        this.snackBar.open(
          'Estás desconectado. Revisa tu conexión a internet.', 
          'Cerrar', 
          { panelClass: ['offline-snackbar'] }
        );
      }
    });
  }

  ngOnDestroy(): void {
    this.connectionSubscription?.unsubscribe();
  }
}
