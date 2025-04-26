import { Component, OnInit, inject } from '@angular/core';
import { CommonModule} from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { CourseCardComponent } from '../course-card/course-card.component';
import { StudentListComponent } from '../student-list/student-list.component';

import { CourseService } from '@services/course.service';
import { StudentService } from '@services/student.service';
import { UserService } from '@services/user.service';
import { CourseCrudService } from '@services/course-crud.service';
import { ResultService } from '@services/result.service';

import { Course } from '@models/course';
import { Student } from '@models/student';
import { User } from '@models/user';
import { Result } from '@models/result';

import { Observable } from 'rxjs';
import { ExamResultListComponent } from "../exam-result-list/exam-result-list.component";


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, CourseCardComponent, StudentListComponent, ExamResultListComponent],
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit {

  userService = inject(UserService);
  courseService = inject(CourseService);
  studentService = inject(StudentService);
  courseCrudService = inject(CourseCrudService);
  resultService = inject(ResultService);

  courses: Course[] = [];
  students: Student[] = [];
  users: User[] = [];
  results: Result[] = [];

  currentView: 'courses' | 'students' | 'results' | 'config' = 'courses'; // Default to courses

  ngOnInit() {
    this.userService.getAllUsers().subscribe(users => {
      this.users = users;
      console.log(this.users);
    })
    this.courseCrudService.getCourses().subscribe(courses => {
      this.courses = courses;
      console.log(this.courses);
    })
    this.resultService.getAllResults().subscribe(results => {
      this.results = results;
      console.log(this.results);
    })
  }

  setView(view: 'courses' | 'students' | 'results' | 'config') {
    this.currentView = view;
  }
}

