import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RecruiterAuthService } from '@services/recruiter-auth.service';

export const publicGuard: CanActivateFn = async (route, state) => {
  const authService = inject(RecruiterAuthService);
  const router = inject(Router);

  try {
    // Espera a que el estado de autenticación se inicialice completamente
    const isLoggedIn = await authService.isUserLoggedIn();

    if (!isLoggedIn) {
      console.log('IN publicAuth Usuario no autenticado, redirigiendo al login');
      return true;
    } else {
      console.log('IN publicAuth \n esta logueado');
      router.navigate(['recruiter']);
      // router.navigate(['login']);
      return false;
    }
  } catch (error) {
    console.error('Error en auth guard:', error);
    router.navigate(['login']);
    return false;
  }
};


