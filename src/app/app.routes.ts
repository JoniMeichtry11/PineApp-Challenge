import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/** Array principal de enrutamiento que define la navegación y protege las rutas mediante AuthGuard. */
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'customers',
        pathMatch: 'full'
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/customers/customer-list/customer-list.component').then(m => m.CustomerListComponent)
      },
      {
        path: 'customers/new',
        loadComponent: () => import('./features/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
