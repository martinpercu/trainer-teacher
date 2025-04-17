import { Routes } from '@angular/router';

import { TeacherMainPageComponent } from '@pages/teacher-main-page/teacher-main-page.component'
import { LoginComponent } from '@components/auth/login/login.component';
import { ChatComponent } from '@teacher/chat/chat.component';
// import { LeftMenuComponent } from '@teacher/left-menu/left-menu.component';
// import { EthicSupervisorsComponent } from '@components/pdfs/ethic-supervisors/ethic-supervisors.component';
import { PdfviewerComponent } from '@components/pdfviewer/pdfviewer.component';
import { MainselectorPageComponent } from '@pages/mainselector-page/mainselector-page.component';


export const routes: Routes = [
  {
    path:'',
    component: MainselectorPageComponent
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
  }
  // {
  //   path:'leftmenu',
  //   component: LeftMenuComponent
  // },
  // {
  //   path:'pdf',
  //   component: EthicSupervisorsComponent
  // }
];
