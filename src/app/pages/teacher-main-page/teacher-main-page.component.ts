import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ChatComponent } from '@teacher/chat/chat.component';
import { LeftMenuComponent } from '@teacher/left-menu/left-menu.component';
import { ModalhowitworksComponent } from '@teacher/modalhowitworks/modalhowitworks.component';

import { AuthService } from '@services/auth.service';
import { VisualStatesService } from '@services/visual-states.service';
import { PagesService } from '@services/pages.service';

import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { Teacher } from '@models/teacher';

import { UserService } from '@services/user.service';


@Component({
  selector: 'app-teacher-main-page',
  imports: [CommonModule, ChatComponent, LeftMenuComponent, ModalhowitworksComponent],
  templateUrl: './teacher-main-page.component.html'
})
export class TeacherMainPageComponent {
  teachers$!: Observable<Teacher[]>;

  authService = inject(AuthService);
  visualStatesService = inject(VisualStatesService);

  pagesService = inject(PagesService);
  private route = inject(ActivatedRoute);


  userService = inject(UserService);


  private firestore = inject(Firestore);

  // currentUser = this.authService.currentUserSig();
  currentUser = this.userService.userSig();

  async ngOnInit() {
    // Extraer el teacherId de la URL
    const teacherId = this.route.snapshot.paramMap.get('id'); // Asumiendo ruta /teacher/:id

    if (teacherId) {
      try {
        // Pasar el teacherId a PagesService
        await this.pagesService.setConfiguration(teacherId);
      } catch (error) {
        alert('problems setting teacher hey Martin!')
        // console.error('Error al configurar el teacher:', error);
        // Redirigir a una ruta de error o por defecto
        // this.router.navigate(['/teacher/error']);
      }
    } else {
      // Manejar caso sin teacherId
      alert('hey no teacher talk to Martin')
      // console.warn('No se proporcionó teacherId en la URL');
      // this.pagesService.initialize();
      // this.router.navigate(['/teacher/supervisors']);
    }
  }

  // async ngOnInit() {
  //   // Extraer el teacherId de la URL
  //   const teacherId = this.route.snapshot.paramMap.get('id'); // Asumiendo ruta /teacher/:id

  //   if (teacherId) {
  //     try {
  //       // Pasar el teacherId a PagesService para que cargue los datos
  //       await this.pagesService.setConfiguration(teacherId);
  //     } catch (error) {
  //       alert('problems setting teacher hey Martin!')
  //       // console.error('Error al configurar el teacher:', error);
  //       // Redirigir a una ruta de error o por defecto
  //       // this.router.navigate(['/teacher/error']);
  //     }
  //   } else {
  //     // Manejar caso sin teacherId
  //     alert('hey no teacher talk to Martin')
  //     // console.warn('No se proporcionó teacherId en la URL');
  //     // this.pagesService.initialize();
  //     // this.router.navigate(['/teacher/supervisors']);
  //   }
  // }

  // ngOnInit() {
  //   // Detectar la ruta actual y configurar el servicio
  //   this.route.url.subscribe(urlSegments => {
  //     const path = urlSegments.map(segment => segment.path).join('/');
  //     if (path.includes('supervisors')) {
  //       this.pagesService.setConfiguration('supervisors');
  //     } else if (path.includes('employee')) {
  //       this.pagesService.setConfiguration('employee');
  //     } else {
  //       this.pagesService.setConfiguration('supervisors'); // Por defecto
  //     }
  //   });
  // }


  // ngOnInit() {
  //   // Cargar la lista de teachers desde Firestore
  //   const teachersCollection = collection(this.firestore, 'teachers');
  //   this.teachers$ = collectionData(teachersCollection, { idField: 'id' }) as Observable<Teacher[]>;

  //   // Detectar la ruta actual y configurar el servicio
  //   this.route.url.subscribe(urlSegments => {
  //     const path = urlSegments.map(segment => segment.path).join('/');
  //     // Intentar extraer un teacherId de la URL (por ejemplo, /teachers/abc123)
  //     const teacherId = urlSegments.length > 0 ? urlSegments[urlSegments.length - 1].path : '';

  //     if (teacherId) {
  //       // Intentar cargar el teacher especificado en la URL
  //       this.pagesService.setConfiguration(teacherId);
  //     } else {
  //       // Cargar el primer teacher disponible
  //       this.teachers$.subscribe(teachers => {
  //         if (teachers.length > 0) {
  //           this.pagesService.setConfiguration(teachers[0].id);
  //         } else {
  //           // No hay teachers, usar estado por defecto
  //           this.pagesService.initialize();
  //         }
  //       });
  //     }
  //   });
  // }


  toggleShowLeftMenuHeader() {
    this.visualStatesService.togleShowLeftMenu()
  }


}
