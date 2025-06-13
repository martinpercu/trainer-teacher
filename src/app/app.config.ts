import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { firebaseConfig } from '@env/environment';

import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';

import { getFirestore, provideFirestore } from '@angular/fire/firestore';

import { routes } from './app.routes';

import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { provideAnimations } from '@angular/platform-browser/animations'; // Necesario para Angular Material
import { HttpClient } from '@angular/common/http'; // Necesario para MatIconRegistry
import { DomSanitizer } from '@angular/platform-browser';
import { ErrorHandler } from '@angular/core'; // Importa ErrorHandler
import { DOCUMENT } from '@angular/common'; // Importa DOCUMENT

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideAnimations(), // Requerido por Angular Material
    importProvidersFrom(MatIconModule), // Importa el módulo de íconos
  ]
};
