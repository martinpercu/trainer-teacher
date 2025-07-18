import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslocoPipe } from '@jsverse/transloco';

import { CandidateLoginComponent } from '@components/auth/candidate-login/candidate-login.component';
import { CandidateLogoutComponent } from '@components/auth/candidate-logout/candidate-logout.component';
import { CandidateRegisterComponent } from '@components/auth/candidate-register/candidate-register.component';
import { CandidateService } from '@services/candidate.service';
import { JobCrudService } from '@services/job-crud.service';
import { CandidateAuthService } from '@services/candidate-auth.service';

import { CandidateEditComponent } from '@candidate/candidate-edit/candidate-edit.component';

import { UploadComponent } from '@components/candidate/upload/upload.component';

import { Job } from '@models/job';
import { Candidate } from '@models/candidate';


@Component({
  selector: 'app-candidate-page',
  imports: [TranslocoPipe, CandidateLoginComponent, CandidateLogoutComponent, CandidateRegisterComponent, CandidateEditComponent, UploadComponent],
  templateUrl: './candidate-page.component.html'
})
export class CandidatePageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  candidateService = inject(CandidateService);
  jobCrudService = inject(JobCrudService);
  candidateAuthService = inject(CandidateAuthService);

  alreadyAccount: boolean = false;
  withJobId: boolean = false;

  job!: Job;
  showRegister: boolean = true;
  showLogin: boolean = false;



  async ngOnInit() {
    // Extraer el jobPositionId
    const jobPositionId = this.route.snapshot.paramMap.get('jobId'); // Ruta /job/:jobId
    if (jobPositionId) {
      console.log(jobPositionId);
      this.withJobId = true
      const thisJob: any = await this.jobCrudService.getJobByIdRaw(jobPositionId);
      if(thisJob) {
        console.log('hay job job job');
        this.job = thisJob
      }else {
        console.log(' NO JOB redirecciona a /job sin ID');
        this.router.navigateByUrl(`/job`);
      }
    }
  }

  switchLoginRegister() {
    this.showLogin = !this.showLogin;
    this.showRegister = !this.showRegister;
  }


}
