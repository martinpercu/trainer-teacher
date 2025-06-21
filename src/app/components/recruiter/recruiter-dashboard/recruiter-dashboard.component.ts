import { Component, OnInit, inject } from '@angular/core';
import { CommonModule} from '@angular/common';

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
import { ExamResultListComponent } from "@school/exam-result-list/exam-result-list.component";
import { Teacher } from '@models/teacher';
import { TeacherListComponent } from "@school/teacher-list/teacher-list.component";
import { ExamsListComponent } from "@school/exams-list/exams-list.component";

import { JobsCrudComponent } from "@recruiter/jobs-crud/jobs-crud.component";
import { ExamCrudComponent } from '@superadmin/exam-crud/exam-crud.component'
import { RecruiterAuthService } from '@services/recruiter-auth.service'




@Component({
  selector: 'app-recruiter-dashboard',
  imports: [CommonModule, MatIconModule, JobsCrudComponent, ExamCrudComponent, StudentListComponent, ExamResultListComponent, TeacherListComponent, ExamsListComponent],
  templateUrl: './recruiter-dashboard.component.html'
})
export class RecruiterDashboardComponent {

  examCrudService = inject(ExamCrudService);
  RecruiterAuthService = inject(RecruiterAuthService);

  // exams: Exam[] = [];

  currentView: 'teachers' | 'students' | 'results' | 'config' | 'exams' | 'jobs' = 'teachers'; // Default to courses


  ngOnInit() {
    console.log('here in dash recruiter');
  }

  setView(view: 'teachers' | 'students' | 'results' | 'config' | 'exams'  | 'jobs') {
    this.currentView = view;
  }


  goToMain() {
    alert('Gracias totales \nNo va a nngun lado')
    // window.open("https://trainer-teacher.web.app", '_blank');
    // window.open(`${environment.BASEURL}`, '_blank');
    // this.router.navigate(['/main']);
  }

}
