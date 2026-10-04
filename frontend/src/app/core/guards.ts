import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Session } from './session';

export const privacyAcceptedGuard: CanActivateFn = () => {
  const session = inject(Session);
  return session.privacyAccepted() || inject(Router).createUrlTree(['/']);
};

export const hasResultGuard: CanActivateFn = () => {
  const session = inject(Session);
  return session.result() !== null || inject(Router).createUrlTree(['/capture']);
};
