import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';


import { CandidateLoginComponent } from '@components/auth/candidate-login/candidate-login.component';
import { CandidateLogoutComponent } from '@components/auth/candidate-logout/candidate-logout.component';
import { CandidateRegisterComponent } from '@components/auth/candidate-register/candidate-register.component';
import { CandidateService } from '@services/candidate.service';
import { JobCrudService } from '@services/job-crud.service';
import { CandidateAuthService } from '@services/candidate-auth.service';

import { CandidateEditComponent } from '@candidate/candidate-edit/candidate-edit.component';

import { UploadComponent } from '@components/candidate/upload/upload.component';


@Component({
  selector: 'app-candidate-page',
  imports: [CandidateLoginComponent, CandidateLogoutComponent, CandidateRegisterComponent, CandidateEditComponent, UploadComponent],
  templateUrl: './candidate-page.component.html'
})
export class CandidatePageComponent {

  private route = inject(ActivatedRoute);
  candidateService = inject(CandidateService);
  jobCrudService = inject(JobCrudService);

  candidateAuthService = inject(CandidateAuthService);

  private router = inject(Router);

  alreadyAccount: boolean = false;

  async ngOnInit() {
    // Extraer el jobPositionId
    const jobPositionId = this.route.snapshot.paramMap.get('jobId'); // Ruta /job/:jobId
    if (jobPositionId) {
      console.log(jobPositionId);
      const thisJob: any = await this.jobCrudService.getJobByIdRaw(jobPositionId);
      if(thisJob) {
        console.log('hay job job job');
      }else {
        console.log(' NO JOB redirecciona a /job sin ID');
        this.router.navigateByUrl(`/job`);
      }
    }
    const algo = this.candidateAuthService.currentCandidateSig()
    console.log(algo);
  }

}
