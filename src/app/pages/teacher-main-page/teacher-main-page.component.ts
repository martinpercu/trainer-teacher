import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatComponent } from '@components/chat/chat.component';
import { LeftMenuComponent } from '@components/left-menu/left-menu.component';
import { ModalhowitworksComponent } from '@components/modalhowitworks/modalhowitworks.component';

import { AuthService } from '@services/auth.service';
import { VisualStatesService } from '@services/visual-states.service';

@Component({
  selector: 'app-teacher-main-page',
  imports: [CommonModule, ChatComponent, LeftMenuComponent, ModalhowitworksComponent],
  templateUrl: './teacher-main-page.component.html'
})
export class TeacherMainPageComponent {
  authService = inject(AuthService);
  visualStatesService = inject(VisualStatesService);

  currentUser = this.authService.currentUserSig();


  toggleShowLeftMenuHeader() {
    this.visualStatesService.togleShowLeftMenu()
  }


}
