import { Component, Input } from '@angular/core';
import { Course } from '@models/course';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-course-card',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './course-card.component.html'
})
export class CourseCardComponent {
  @Input() course!: Course;
}
