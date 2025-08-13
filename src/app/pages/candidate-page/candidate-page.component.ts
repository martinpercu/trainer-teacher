import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { TranslocoPipe } from '@jsverse/transloco';

import { CandidateLoginComponent } from '@components/auth/candidate-login/candidate-login.component';
import { CandidateLogoutComponent } from '@components/auth/candidate-logout/candidate-logout.component';
import { CandidateRegisterComponent } from '@components/auth/candidate-register/candidate-register.component';
import { CandidateService } from '@services/candidate.service';
import { JobCrudService } from '@services/job-crud.service';
import { CandidateAuthService } from '@services/candidate-auth.service';
import { CandidateVisualService } from '@services/candidate-visual.service';

import { CandidateEditComponent } from '@candidate/candidate-edit/candidate-edit.component';
import { CandidateHeaderComponent } from '@candidate/candidate-header/candidate-header.component';
import { CandidateResumeEditComponent } from '@candidate/candidate-resume-edit/candidate-resume-edit.component';

import { UploadComponent } from '@components/candidate/upload/upload.component';

import { Job } from '@models/job';
import { Candidate } from '@models/candidate';


@Component({
  selector: 'app-candidate-page',
  imports: [TranslocoPipe, CandidateLoginComponent, CandidateLogoutComponent, CandidateRegisterComponent, CandidateEditComponent, UploadComponent, CandidateHeaderComponent, CandidateResumeEditComponent],
  templateUrl: './candidate-page.component.html'
})
export class CandidatePageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  candidateService = inject(CandidateService);
  jobCrudService = inject(JobCrudService);
  candidateAuthService = inject(CandidateAuthService);
  candidateVisualService = inject(CandidateVisualService);

  alreadyAccount: boolean = false;
  withJobId: boolean = false;

  job!: Job;
  showRegister: boolean = true;
  showLogin: boolean = false;
  recruiterId!: string;

  // candidate!: Candidate;

  async ngOnInit() {
    // Extraer el jobPositionId
    const jobPositionId = this.route.snapshot.paramMap.get('jobId'); // Ruta /job/:jobId
    if (jobPositionId) {
      console.log(jobPositionId);
      this.withJobId = true
      const thisJob: any = await this.jobCrudService.getJobByIdRaw(jobPositionId);
      const ownerId: string | undefined =
          await this.jobCrudService.getJobOwnerId(jobPositionId);
      if(ownerId && thisJob && this.candidateService.candidateSig()) {
        // alert('hay de SUPER TODOOOOO todooooooo')
        console.log(this.candidateService.candidateSig()?.candidateUID);
        const candidateUID = this.candidateService.candidateSig()?.candidateUID
        console.log(ownerId);
        this.recruiterId = ownerId
        console.log(jobPositionId);
        if(candidateUID){
          const tipoUpdateado = await this.candidateService.updateCandidateIfNeeded(
            candidateUID,
            jobPositionId,
            ownerId
          );
          console.log(tipoUpdateado);
        }
      }
      // if(ownerId && thisJob) {
      //   alert('hay de todooooooo')
      // }
      if(ownerId) {
        console.log('hay OWNER ! ! ! \n\n' + ownerId);
        this.recruiterId = ownerId
      }
      if(thisJob) {
        // alert(thisJob)
        console.log('hay job job job');
        this.job = thisJob
      }
      else {
        console.log(' NO JOB redirecciona a /job sin ID');
        this.router.navigateByUrl(`/job`);
      }
    }
  }

  switchLoginRegister() {
    this.showLogin = !this.showLogin;
    this.showRegister = !this.showRegister;
  }

  async testeo() {
    console.log(this.candidateService.candidateSig());

    // const resumeUrl = "https://firebasestorage.googleapis.com/v0/b/trainer-teacher.firebasestorage.app/o/resumes%2Fy5qcLmxLWEfPoq6gV39UNUrketA3%2F1753979962452_Resume-SUMsmall-skil6.pdf?alt=media&token=d5157d1a-cc5d-489d-a9f6-5cd1921fa022";
    // const userId = "IoUuFFIjqK8cv8lR1vQR";
    // const fileType = "application/pdf";
    // const texho = await this.candidateService.processResumeWithPythonTest(resumeUrl, userId, fileType)
    // console.log(texho);
  }

}
