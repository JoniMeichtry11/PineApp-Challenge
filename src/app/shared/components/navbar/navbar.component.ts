import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

/**
 * Componente de navegación compartido (Navbar).
 * Se extrajo como componente independiente para centralizar la navegación y mantener un
 * esqueleto visual consistente a través de diferentes vistas (listado y formulario),
 * evitando duplicar código HTML en múltiples templates (DRY).
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
   * Evalúa dinámicamente si se debe mostrar el botón "Atrás" basándose en la ruta activa.
   * Evita inyectar inputs adicionales al componente, dejando que la navbar sea 100%
   * consciente del estado de enrutamiento por sí sola.
   */
  get showBackButton(): boolean {
    return this.router.url.includes('/new');
  }

  /**
   * Cierra la sesión activa a través de AuthService y purga el token, previniendo
   * navegaciones accidentales hacia atrás con sesiones inválidas.
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
