import { Component, Input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';


// import { Student } from '@models/student';
import { MatIconModule } from '@angular/material/icon';

import { Job } from '@models/job';
import { Candidate } from '@models/candidate';
import { Result } from '@models/result';

@Component({
  selector: 'app-jobs-list',
  imports: [TranslocoPipe, MatIconModule],
  templateUrl: './jobs-list.component.html',
  styleUrl: './jobs-list.component.css'
})
export class JobsListComponent {

  @Input() job!: Job;
  @Input() candidatesForJob!: Candidate[];
  @Input() results!: Result[]


  ngOnInit() {
    console.log(this.job);
    console.log(this.candidatesForJob);
    console.log(this.results);
  }


}
