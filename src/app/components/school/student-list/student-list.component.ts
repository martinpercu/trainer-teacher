import { Component, Input, inject } from '@angular/core';
// import { Student } from '@models/student';
import { MatIconModule } from '@angular/material/icon';

import { User } from '@models/user';
// import { UserService } from '@services/user.service';


@Component({
  selector: 'app-student-list',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './student-list.component.html'
})
export class StudentListComponent {
  // @Input() students!: Student[];
  @Input() user!: User;
  // userService = inject(UserService);
  // users: User[] = [];

  ngOnInit() {
    console.log(this.user);
    // this.userService.getAllUsers().subscribe(users => {
    //   this.users = users;
    //   console.log(this.users);
    // })
  }
}
