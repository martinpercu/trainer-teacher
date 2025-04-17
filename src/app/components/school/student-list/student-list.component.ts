import { Component, Input } from '@angular/core';
import { Student } from '@models/student';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './student-list.component.html'
})
export class StudentListComponent {
  @Input() students!: Student[];
}
