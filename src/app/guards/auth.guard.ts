import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { RecruiterAuthService } from '@services/recruiter-auth.service';
// import { map, take, filter } from 'rxjs/operators';
// import { of } from 'rxjs';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(RecruiterAuthService);
  const router = inject(Router);

  try {
    // Espera a que el estado de autenticación se inicialice completamente
    const isLoggedIn = await authService.isUserLoggedIn();

    if (isLoggedIn) {
      console.log('esta logueado');

      return true;
    } else {
      console.log('IN AUTH Usuario no autenticado, redirigiendo al login');
      router.navigate(['login']);
      return false;
    }
  } catch (error) {
    console.error('Error en auth guard:', error);
    router.navigate(['login']);
    return false;
  }
};

// export const authGuard: CanActivateFn = (route, state) => {
//   const authService = inject(RecruiterAuthService);
//   const router = inject(Router);

//   return authService.user$.pipe(
//     filter(user => user !== undefined), // Espera hasta que Firebase Auth se resuelva
//     take(1), // Solo toma el primer valor válido
//     map(user => {
//       if (user && authService.currentUser()) {
//         return true;
//       } else {
//         router.navigate(['login']);
//         return false;
//       }
//     })
//   );

// };

