import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Candidate } from '@models/candidate';
import { Job } from '@models/job';
import { CandidateAuthService } from '@services/candidate-auth.service';
import { Router, ActivatedRoute } from '@angular/router';

import { JobCrudService } from '@services/job-crud.service';

@Component({
  selector: 'app-candidate-register',
  imports: [ReactiveFormsModule],
  templateUrl: './candidate-register.component.html',
})
export class CandidateRegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  candidateAuthService = inject(CandidateAuthService);
  router = inject(Router);

  private route = inject(ActivatedRoute);
  jobCrudService = inject(JobCrudService);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;

  jobRecruiterId: string = '';
  jobId: string = '';

  async ngOnInit() {
    // Extraer el jobPositionId
    const jobPositionId = this.route.snapshot.paramMap.get('jobId'); // Ruta /job/:jobId
    if (jobPositionId) {
      this.jobId = jobPositionId
      const ownerId: string | undefined =
        await this.jobCrudService.getJobOwnerId(jobPositionId);
      if (ownerId) {
        console.log(ownerId); // "I8oITrIOHDX2rkMvJmtU6iUHqkn1"
        // Use ownerId as a string
        this.jobRecruiterId = ownerId;
        console.log(this.jobRecruiterId, this.jobId); // "I8oITrIOHDX2rkMvJmtU6iUHqkn1"
      }
    }
  }

  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    this.candidateAuthService
      .register(rawForm.email, rawForm.username, rawForm.password, this.jobRecruiterId, this.jobId)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/job');
        },
        error: (err) => {
          this.errorMessage = err.code;
        },
      });
  }
}
