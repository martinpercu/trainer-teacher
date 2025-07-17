import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { ChatComponent } from '@teacher/chat/chat.component';
import { LeftMenuComponent } from '@teacher/left-menu/left-menu.component';
import { ModalhowitworksComponent } from '@teacher/modalhowitworks/modalhowitworks.component';

import { AuthService } from '@services/auth.service';
import { VisualStatesService } from '@services/visual-states.service';
import { PagesService } from '@services/pages.service';

@Component({
  selector: 'app-teacher-main-page',
  imports: [CommonModule, ChatComponent, LeftMenuComponent, ModalhowitworksComponent],
  templateUrl: './teacher-main-page.component.html'
})
export class TeacherMainPageComponent {
  authService = inject(AuthService);
  visualStatesService = inject(VisualStatesService);

  pagesService = inject(PagesService);
  private route = inject(ActivatedRoute);

  currentUser = this.authService.currentUserSig();

  ngOnInit() {
    // Detectar la ruta actual y configurar el servicio
    this.route.url.subscribe(urlSegments => {
      const path = urlSegments.map(segment => segment.path).join('/');
      if (path.includes('supervisors')) {
        this.pagesService.setConfiguration('supervisors');
      } else if (path.includes('employee')) {
        this.pagesService.setConfiguration('employee');
      } else {
        this.pagesService.setConfiguration('supervisors'); // Por defecto
      }
    });
  }


  toggleShowLeftMenuHeader() {
    this.visualStatesService.togleShowLeftMenu()
  }


}
