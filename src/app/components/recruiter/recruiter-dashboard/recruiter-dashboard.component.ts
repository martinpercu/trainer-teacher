import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { environment } from '@env/environment';

import { MatIconModule } from '@angular/material/icon';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import { CourseCardComponent } from '@school/course-card/course-card.component';
import { StudentListComponent } from '@school/student-list/student-list.component';

import { CourseService } from '@services/course.service';
import { StudentService } from '@services/student.service';
import { UserService } from '@services/user.service';
import { CourseCrudService } from '@services/course-crud.service';
import { ResultService } from '@services/result.service';
import { TeacherCrudService } from '@services/teacher-crud.service';
import { ExamCrudService } from '@services/exam-crud.service';

import { Course } from '@models/course';
import { Student } from '@models/student';
import { User } from '@models/user';
import { Result } from '@models/result';
import { Exam } from '@models/exam';

import { Observable } from 'rxjs';
import { ExamResultListComponent } from '@school/exam-result-list/exam-result-list.component';
import { Teacher } from '@models/teacher';
import { TeacherListComponent } from '@school/teacher-list/teacher-list.component';
import { ExamsListComponent } from '@school/exams-list/exams-list.component';

import { MenuSettingsComponent } from '@recruiter/menu-settings/menu-settings.component';
import { JobsCrudComponent } from '@recruiter/jobs-crud/jobs-crud.component';
import { ExamCrudComponent } from '@superadmin/exam-crud/exam-crud.component';
import { RecruiterAuthService } from '@services/recruiter-auth.service';

import { CandidatesListComponent } from '@recruiter/candidates-list/candidates-list.component';
import { Candidate } from '@models/candidate';
import { CandidateService } from '@services/candidate.service';
import { RecruiterService } from '@services/recruiter.service';
import { AuthService } from '@services/auth.service';

@Component({
  selector: 'app-recruiter-dashboard',
  imports: [
    CommonModule,
    MatIconModule,
    JobsCrudComponent,
    ExamCrudComponent,
    MenuSettingsComponent,
    StudentListComponent,
    CandidatesListComponent,
    ExamResultListComponent,
    TeacherListComponent,
    ExamsListComponent,
  ],
  templateUrl: './recruiter-dashboard.component.html',
})
export class RecruiterDashboardComponent {
  authService = inject(AuthService);
  examCrudService = inject(ExamCrudService);
  recruiterAuthService = inject(RecruiterAuthService);
  candidateService = inject(CandidateService);
  recruiterService = inject(RecruiterService);

  // exams: Exam[] = [];

  candidates: Candidate[] = [];

  currentView:
    | 'teachers'
    | 'students'
    | 'results'
    | 'config'
    | 'exams'
    | 'jobs'
    | 'candidates' = 'teachers'; // Default to courses

  showSettingMenu: boolean = false;

  async ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        const uid = user.uid;
        console.log('UID:', uid);
        // Usa el uid aquí

        this.candidateService.getCandidatesByRecruiter(uid).subscribe((candidates) => {
          this.candidates = candidates;
          console.log(this.candidates);
        });
      } else {
        console.log('No hay usuario autenticado');
      }
    });
    // const pepe = await this.authService.user$()
    // if(pepe) {
    //   alert('hay pepe')
    // }
    // this.candidateService.getAllUsers().subscribe((candidates) => {
    //   this.candidates = candidates;
    //   console.log(this.candidates);
    // });
  }

  setView(
    view:
      | 'teachers'
      | 'students'
      | 'results'
      | 'config'
      | 'exams'
      | 'jobs'
      | 'candidates'
  ) {
    this.currentView = view;
  }

  switchExpand() {
    this.showSettingMenu = !this.showSettingMenu;
  }

  goToMain() {
    alert('Gracias totales \nNo va a nngun lado');
    // window.open("https://trainer-teacher.web.app", '_blank');
    // window.open(`${environment.BASEURL}`, '_blank');
    // this.router.navigate(['/main']);
  }
}
