import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ChatComponent } from '@teacher/chat/chat.component';
import { LeftMenuComponent } from '@teacher/left-menu/left-menu.component';
import { ModalhowitworksComponent } from '@teacher/modalhowitworks/modalhowitworks.component';

import { AuthService } from '@services/auth.service';
import { VisualStatesService } from '@services/visual-states.service';
import { PagesService } from '@services/pages.service';
import { CourseCrudService } from '@services/course-crud.service';

import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { Teacher } from '@models/teacher';
import { Course } from '@models/course';

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
  courseCrudService = inject(CourseCrudService);

  private firestore = inject(Firestore);

  currentUser = this.userService.userSig();

  course!: Course;

  async ngOnInit() {
    // Extraer el courseId de la URL.. OJO esta en /teacher/:id
    const courseId = this.route.snapshot.paramMap.get('id'); // Ruta /teacher/:id

    if (courseId) {

      this.pagesService.setExamPath(courseId);

      this.courseCrudService.getCourseById(courseId).pipe(
        catchError(error => {
          console.error('Error fetching course:', error);
          return of(null);
        })
      ).subscribe(course => {
        if (course) {
          this.course = course;
          // Usar teacherId del curso para PagesService
          if (course.teacherId) {
            this.pagesService.setConfiguration(course.teacherId).catch(error => {
              console.error('Error setting configuration:', error);
            });
          } else {
            console.error('No teacherId found for course:', courseId);
          }
        } else {
          console.error('Course not found for ID:', courseId);
        }
      });
    } else {
      console.error('No course ID provided in URL');
    }
  }

  // async ngOnInit() {
  //   // Extraer el teacherId de la URL
  //   const courseId = this.route.snapshot.paramMap.get('id'); // Asumiendo ruta /teacher/:id

  //   if (courseId) {
  //     try {
  //       // this.course = this.courseCrudService.getCourseById(courseId)
  //       this.course = this.courseCrudService.getCourseById(courseId)
  //       // Pasar el teacherId a PagesService
  //       await this.pagesService.setConfiguration(this.teacherId);
  //     } catch (error) {
  //       alert('problems setting teacher hey Martin!')
  //     }
  //   } else {
  //     alert('hey no teacher talk to Martin')
  //   }
  // }




  toggleShowLeftMenuHeader() {
    this.visualStatesService.togleShowLeftMenu()
  }


}
