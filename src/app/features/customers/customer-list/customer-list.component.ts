import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { Customer } from '../../../shared/models/customer.model';
import { FechaPersonalizadaPipe } from '../../../shared/pipes/fecha-personalizada.pipe';

/**
 * Componente que muestra el listado de clientes.
 * Implementa filtrado y ordenamiento reactivo en el cliente mediante combineLatest (ADR-007).
 */
@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTableModule,
    MatIconModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    FechaPersonalizadaPipe
  ],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  filterForm!: FormGroup;
  filteredCustomers$!: Observable<Customer[]>;
  displayedColumns: string[] = ['nombre', 'apellido', 'edad', 'fechaNacimiento'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly customerService: CustomerService,
    public readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    // Formulario reactivo para agrupar criterios de filtros y ordenamiento
    this.filterForm = this.fb.group({
      searchTerm: [''],
      minAge: [null as number | null],
      maxAge: [null as number | null],
      sortBy: ['apellido'], // Campo por defecto para ordenar
      sortDirection: ['asc'] // Dirección por defecto
    });

    // Flujo reactivo derivado que combina los clientes de Firestore y los cambios del formulario
    const customers$ = this.customerService.getCustomers();
    const filters$ = this.filterForm.valueChanges.pipe(
      startWith(this.filterForm.value)
    );

    this.filteredCustomers$ = combineLatest([customers$, filters$]).pipe(
      map(([customers, filters]) => {
        let result = [...customers];

        // 1. Aplicar filtro por búsqueda de texto (nombre o apellido)
        const term = (filters.searchTerm || '').trim().toLowerCase();
        if (term) {
          result = result.filter(
            c =>
              c.nombre.toLowerCase().includes(term) ||
              c.apellido.toLowerCase().includes(term)
          );
        }

        // 2. Aplicar filtro por rango de edad
        if (filters.minAge !== null && filters.minAge !== undefined) {
          result = result.filter(c => c.edad >= filters.minAge);
        }
        if (filters.maxAge !== null && filters.maxAge !== undefined) {
          result = result.filter(c => c.edad <= filters.maxAge);
        }

        // 3. Aplicar ordenamiento
        const sortBy = filters.sortBy || 'apellido';
        const direction = filters.sortDirection || 'asc';

        result.sort((a: any, b: any) => {
          let valA = a[sortBy];
          let valB = b[sortBy];

          // Manejo especial para cadenas (insensible a mayúsculas/minúsculas)
          if (typeof valA === 'string') {
            valA = valA.toLowerCase();
            valB = (valB || '').toLowerCase();
          }

          // Comparación estándar
          if (valA < valB) return direction === 'asc' ? -1 : 1;
          if (valA > valB) return direction === 'asc' ? 1 : -1;
          return 0;
        });

        return result;
      })
    );
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
