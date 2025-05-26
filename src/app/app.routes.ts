import { Routes } from '@angular/router';

import { TeacherMainPageComponent } from '@pages/teacher-main-page/teacher-main-page.component'
import { LoginComponent } from '@components/auth/login/login.component';
import { ChatComponent } from '@teacher/chat/chat.component';
// import { LeftMenuComponent } from '@teacher/left-menu/left-menu.component';
// import { EthicSupervisorsComponent } from '@components/pdfs/ethic-supervisors/ethic-supervisors.component';
import { PdfviewerComponent } from '@components/pdfviewer/pdfviewer.component';
import { MainselectorPageComponent } from '@pages/mainselector-page/mainselector-page.component';
import { SchoolMainPageComponent } from '@pages/school-main-page/school-main-page.component';
import { TeachersCRUDComponent } from '@superadmin/teachers-crud/teachers-crud.component';
import { SchoolsCrudComponent } from '@superadmin/schools-crud/schools-crud.component';
import { CoursesCRUDComponent } from '@superadmin/course-crud/course-crud.component';
import { ExamCrudComponent } from '@superadmin/exam-crud/exam-crud.component';

import { ExamComponent } from '@evaluation/exam/exam.component';


export const routes: Routes = [
  {
    path:'crud',
    component: TeachersCRUDComponent
  },
  {
    path:'school-crud',
    component: SchoolsCrudComponent
  },
  {
    path:'course-crud',
    component: CoursesCRUDComponent
  },
  {
    path:'exam-crud',
    component: ExamCrudComponent
  },
  {
    path:'exam/:id',
    component: ExamComponent
  },
  // {
  //   path: 'exam/:id',
  //   component: ExamComponent,
  //   children: [
  //     { path: 'question/:index', component: QuestionComponent },
  //     { path: 'summary', component: SummaryComponent }
  //   ]
  // },
  // {
  //   path:'',
  //   component: ExamComponent
  // },
  {
    path:'main',
    component: SchoolMainPageComponent
  },
  {
    path:'',
    component: MainselectorPageComponent
  },
  // { path: 'teacher/supervisors',
  //   component: TeacherMainPageComponent
  // },
  // { path: 'teacher/employee',
  //   component: TeacherMainPageComponent
  // },
  { path: 'teacher/:id',
    component: TeacherMainPageComponent
  },
  { path: 'school',
    component: SchoolMainPageComponent
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
