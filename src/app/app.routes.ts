import { Routes } from '@angular/router';

import { TeacherMainPageComponent } from '@pages/teacher-main-page/teacher-main-page.component'
import { LoginComponent } from '@components/auth/login/login.component';
import { ChatComponent } from '@components/chat/chat.component';
import { LeftMenuComponent } from '@components/left-menu/left-menu.component';


export const routes: Routes = [
  {
    path:'',
    component: TeacherMainPageComponent
  },
  {
    path:'login',
    component: LoginComponent
  },
  {
    path:'chat',
    component: ChatComponent
  },
  {
    path:'leftmenu',
    component: LeftMenuComponent
  }
];
