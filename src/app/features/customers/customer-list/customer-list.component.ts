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
import { combineLatest, Observable, of } from 'rxjs';
import { map, startWith, catchError, shareReplay } from 'rxjs/operators';
import { CustomerService } from '../../../core/services/customer.service';
import { AuthService } from '../../../core/services/auth.service';
import { StatisticsService } from '../../../core/services/statistics.service';
import { Customer } from '../../../shared/models/customer.model';
import { FechaPersonalizadaPipe } from '../../../shared/pipes/fecha-personalizada.pipe';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Componente que muestra el listado de clientes.
 * La arquitectura de este componente se basa en observables derivados para separar la lectura 
 * de la base de datos de la lógica de filtrado en memoria, reduciendo lecturas a Firestore.
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    FechaPersonalizadaPipe,
    NavbarComponent
  ],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  /** Formulario reactivo para manejar los criterios de búsqueda (nombre, apellido, rango de edad). */
  filterForm!: FormGroup;

  /** 
   * Flujo reactivo final que emite la lista de clientes a renderizar. 
   * Se deriva de combinar el estado de la base de datos con los valores actuales del formulario,
   * permitiendo filtrado instantáneo en el cliente sin re-consultar Firestore.
   */
  filteredCustomers$!: Observable<Customer[]>;

  /** Flujo reactivo que calcula métricas poblacionales (promedio y desviación estándar) sobre la lista sin filtrar. */
  kpis$!: Observable<{ average: number; stdDev: number; total: number }>;

  /** Indicador reactivo que refleja si la petición inicial a Firestore está en curso. */
  isLoading$!: Observable<boolean>;

  /** Definición de las columnas visibles en la tabla de Angular Material. */
  displayedColumns: string[] = ['nombre', 'apellido', 'edad', 'fechaNacimiento'];

  constructor(
    private readonly fb: FormBuilder,
    private readonly customerService: CustomerService,
    public readonly authService: AuthService,
    private readonly statisticsService: StatisticsService,
    private readonly snackBar: MatSnackBar
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

    /**
     * customersState$ encapsula la petición a Firestore.
     * Se aplica shareReplay(1) porque este mismo flujo es consumido por múltiples
     * observables derivados (filteredCustomers$, kpis$, isLoading$).
     * Sin shareReplay, cada pipe asíncrono en el HTML y cada combineLatest dispararía
     * una suscripción independiente, causando pérdida de datos, race conditions y 
     * errores de permisos en Firebase por exceso de lecturas concurrentes (ADR-019).
     */
    const customersState$ = this.customerService.getCustomers().pipe(
      map(data => ({ loading: false, error: false, data })),
      startWith({ loading: true, error: false, data: [] as Customer[] }),
      catchError(err => {
        console.error('Error al leer de Firestore:', err);
        this.snackBar.open('Error al conectar con Firestore. Reintentando...', 'Cerrar', { duration: 5000 });
        return of({ loading: false, error: true, data: [] as Customer[] });
      }),
      shareReplay(1)
    );

    // Derivamos el estado de carga de forma 100% reactiva (Fase 6)
    this.isLoading$ = customersState$.pipe(map(state => state.loading));

    // Extraemos la colección de datos limpia
    const customers$ = customersState$.pipe(map(state => state.data));

    // Cálculos estadísticos independientes y puramente reactivos (ADR-008, ADR-017)
    this.kpis$ = customers$.pipe(
      map(list => {
        const ages = list.map(c => c.edad);
        const average = this.statisticsService.calculateAverage(ages);
        const stdDev = this.statisticsService.calculatePopulationStdDev(ages);
        return { average, stdDev, total: list.length };
      })
    );

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
}
