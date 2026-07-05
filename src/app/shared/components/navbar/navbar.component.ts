import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de navegación compartido para la aplicación.
 * Centraliza el título, navegación de retorno y cierre de sesión (ADR-010).
 */
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService
  ) {}

  /**
   * Determina si se debe mostrar el botón para volver al listado.
   */
  get showBackButton(): boolean {
    return this.router.url.includes('/new');
  }

  /**
   * Cierra la sesión activa y redirige al login.
   */
  async logout(): Promise<void> {
    try {
      await this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
