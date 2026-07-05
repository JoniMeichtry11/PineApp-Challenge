import { Component } from '@angular/core';

/**
 * Componente placeholder temporal para la ruta protegida de clientes.
 * Será reemplazado en la Fase 4 por el listado real de clientes.
 */
@Component({
  selector: 'app-customers-placeholder',
  standalone: true,
  template: `
    <div style="padding: 20px; font-family: Roboto, sans-serif;">
      <h2>InFinanceXP — Panel de Clientes</h2>
      <p>Sesión iniciada correctamente. Esta es un área protegida (ADR-015).</p>
    </div>
  `
})
export class CustomersPlaceholderComponent {}
