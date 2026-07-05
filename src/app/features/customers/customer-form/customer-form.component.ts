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
import { Subscription } from 'rxjs';
import { CustomerService } from '../../../core/services/customer.service';
import { noNumericValidator } from '../../../shared/validators/no-numeric.validator';

/**
 * Componente que maneja el formulario para dar de alta un cliente.
 * El campo edad es de solo lectura y calculado en base a la fecha de nacimiento (ADR-014).
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
    MatProgressSpinnerModule
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
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.customerForm = this.fb.group({
      nombre: ['', [Validators.required, noNumericValidator()]],
      apellido: ['', [Validators.required, noNumericValidator()]],
      fechaNacimiento: [null as Date | null, [Validators.required]]
    });

    // Escuchamos los cambios en la fecha de nacimiento para calcular la edad reactivamente (ADR-014)
    this.dateSubscription = this.customerForm.get('fechaNacimiento')?.valueChanges.subscribe((date: Date | null) => {
      this.updateCalculatedAge(date);
    });
  }

  ngOnDestroy(): void {
    this.dateSubscription?.unsubscribe();
  }

  /**
   * Calcula la edad precisa considerando año, mes y día (requisito de verificación).
   */
  private updateCalculatedAge(birthDate: Date | null): void {
    if (!birthDate || isNaN(birthDate.getTime())) {
      this.calculatedAge = null;
      return;
    }

    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    // Si no ha cumplido años en el año actual todavía, restamos 1
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    this.calculatedAge = age >= 0 ? age : 0;
  }

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
      this.router.navigate(['/customers']);
    } catch (error) {
      console.error('Error al guardar el cliente:', error);
    } finally {
      this.isLoading = false;
    }
  }
}
