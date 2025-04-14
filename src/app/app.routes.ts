import { Routes } from '@angular/router';

import { TeacherMainPageComponent } from '@pages/teacher-main-page/teacher-main-page.component'
import { LoginComponent } from '@components/auth/login/login.component';
import { ChatComponent } from '@components/chat/chat.component';
import { LeftMenuComponent } from '@components/left-menu/left-menu.component';
import { EthicSupervisorsComponent } from '@components/pdfs/ethic-supervisors/ethic-supervisors.component';
import { PdfviewerComponent } from '@components/pdfviewer/pdfviewer.component'


export const routes: Routes = [
  {
    path:'',
    redirectTo: 'teacher/supervisors',
    pathMatch: 'full'
  },
  { path: 'teacher/supervisors',
    component: TeacherMainPageComponent
  },
  { path: 'teacher/employee',
    component: TeacherMainPageComponent
  },
  { path: 'pdf-viewer',
    component: PdfviewerComponent
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
  },
  {
    path:'pdf',
    component: EthicSupervisorsComponent
  }
];
