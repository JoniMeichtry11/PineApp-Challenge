import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { noNumericValidator } from '../../../shared/validators/no-numeric.validator';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { calculateAge } from '../../../shared/utils/age-calculation';

/**
 * Componente que maneja el formulario para dar de alta un cliente.
 * El requerimiento exige guardar la edad exacta junto a la fecha de nacimiento. En lugar
 * de pedirle la edad al usuario (lo que genera redundancia y posibles inconsistencias),
 * este componente captura solo la fecha y delega el cálculo exacto a una utilidad pura.
 */
@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NavbarComponent
  ],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit, OnDestroy {
  customerForm!: FormGroup;
  calculatedAge: number | null = null;
  isLoading = false;

  // Límites para la fecha de nacimiento
  maxDate = new Date();
  minDate = new Date(this.maxDate.getFullYear() - 120, this.maxDate.getMonth(), this.maxDate.getDate());

  private dateSubscription?: Subscription;

  constructor(
    private readonly fb: FormBuilder,
    private readonly customerService: CustomerService,
    private readonly router: Router,
    private readonly snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      nombre: ['', [Validators.required, noNumericValidator()]],
      apellido: ['', [Validators.required, noNumericValidator()]],
      fechaNacimiento: [null as Date | null, [Validators.required]]
    });

    /** 
     * Suscripción reactiva para re-calcular la edad en tiempo real mientras el usuario tipea o
     * usa el calendario. Esto evita tener lógica de cálculo directamente embebida en el template
     * y garantiza que el valor interno de la edad esté siempre sincronizado con el control de fecha.
     */
    this.dateSubscription = this.customerForm.get('fechaNacimiento')?.valueChanges.subscribe((date: Date | null) => {
      this.updateCalculatedAge(date);
    });
  }

  ngOnDestroy(): void {
    this.dateSubscription?.unsubscribe();
  }

  /**
   * Delega el cálculo preciso de edad (por mes y día) a la función pura `calculateAge` en shared.
   */
  private updateCalculatedAge(birthDate: Date | null): void {
    if (!birthDate || isNaN(birthDate.getTime())) {
      this.calculatedAge = null;
      return;
    }
    this.calculatedAge = calculateAge(birthDate);
  }

  /**
   * Ejecuta el alta del cliente en Firestore interceptando el submit del formulario.
   * La edad, al no ser un form control directo (para evitar manipulaciones del usuario),
   * se inyecta manualmente en el payload final justo antes de guardar (ADR-014).
   * 
   * @returns Promise que se resuelve al terminar la escritura en Firestore o rechaza en error.
   */
  async onSubmit(): Promise<void> {
    if (this.customerForm.invalid || this.calculatedAge === null) {
      return;
    }

    this.isLoading = true;
    const formValue = this.customerForm.value;

    const newCustomer = {
      nombre: formValue.nombre.trim(),
      apellido: formValue.apellido.trim(),
      fechaNacimiento: formValue.fechaNacimiento,
      edad: this.calculatedAge, // Añadido manualmente en el submit (ADR-014)
      createdAt: new Date()
    };

    try {
      await this.customerService.addCustomer(newCustomer);
      this.snackBar.open('Cliente dado de alta correctamente', 'Cerrar', { duration: 3000 });
      this.router.navigate(['/customers']);
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
      this.snackBar.open('Error al registrar el cliente en Firestore', 'Cerrar', { duration: 5000 });
    } finally {
      this.isLoading = false;
    }
  }
}
