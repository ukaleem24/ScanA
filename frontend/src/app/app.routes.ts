import { Routes } from '@angular/router';
import { hasResultGuard, privacyAcceptedGuard } from './core/guards';

export const routes: Routes = [
  { path: '', pathMatch: 'full', title: 'Privacy', loadComponent: () => import('./features/privacy/privacy').then((m) => m.Privacy) },
  {
    path: 'capture',
    title: 'Add your letter',
    canActivate: [privacyAcceptedGuard],
    loadComponent: () => import('./features/capture/capture').then((m) => m.Capture),
  },
  {
    path: 'result',
    title: 'Your letter explained',
    canActivate: [privacyAcceptedGuard, hasResultGuard],
    loadComponent: () => import('./features/result/result').then((m) => m.Result),
  },
  { path: '**', redirectTo: '' },
];
