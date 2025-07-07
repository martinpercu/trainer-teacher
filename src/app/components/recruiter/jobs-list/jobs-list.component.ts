import { Component, Input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';


// import { Student } from '@models/student';
import { MatIconModule } from '@angular/material/icon';

import { Job } from '@models/job';

@Component({
  selector: 'app-jobs-list',
  imports: [TranslocoPipe, MatIconModule],
  templateUrl: './jobs-list.component.html',
  styleUrl: './jobs-list.component.css'
})
export class JobsListComponent {

  @Input() job!: Job;


  ngOnInit() {
    console.log(this.job);
  }


}
