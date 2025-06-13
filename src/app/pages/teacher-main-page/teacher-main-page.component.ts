import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginComponent } from '@components/auth/login/login.component';
import { RegisterComponent } from '@components/auth/register/register.component';
import { LogoutComponent } from '@components/auth/logout/logout.component';
import { ChatComponent } from '@components/chat/chat.component';
import { LeftMenuComponent } from '@components/left-menu/left-menu.component';

import { AuthService } from '@services/auth.service';
import { VisualStatesService } from '@services/visual-states.service';

@Component({
  selector: 'app-teacher-main-page',
  imports: [CommonModule, LoginComponent, RegisterComponent, LogoutComponent, ChatComponent, LeftMenuComponent],
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
