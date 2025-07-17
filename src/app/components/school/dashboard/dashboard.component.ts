import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { CourseCardComponent } from '../course-card/course-card.component';
import { StudentListComponent } from '../student-list/student-list.component';

import { CourseService } from '@services/course.service';
import { StudentService } from '@services/student.service';

import { Course } from '@models/course';
import { Student } from '@models/student';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, CourseCardComponent, StudentListComponent],
  templateUrl: './dashboard.component.html'
})

export class DashboardComponent implements OnInit {
  courses: Course[] = [];
  students: Student[] = [];
  currentView: 'courses' | 'students' | 'config' = 'courses'; // Default to courses

  constructor(
    private courseService: CourseService,
    private studentService: StudentService
  ) {}

  ngOnInit() {
    this.courses = this.courseService.getCourses();
    this.students = this.studentService.getStudents();
  }

  setView(view: 'courses' | 'students' | 'config') {
    this.currentView = view;
  }
}

