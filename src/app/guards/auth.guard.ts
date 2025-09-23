import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RecruiterAuthService } from '@services/recruiter-auth.service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(RecruiterAuthService);
  const router = inject(Router);

  if (authService.isLoggedIn) {
    return true;
  } else {
    router.navigate(['/recruiter']);
    return false;
  }
  return true;
};
