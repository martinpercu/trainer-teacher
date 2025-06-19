import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Candidate } from '@models/candidate';
import { CandidateAuthService } from '@services/candidate-auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-candidate-login',
  imports: [ReactiveFormsModule],
  templateUrl: './candidate-login.component.html'
})
export class CandidateLoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  candidateAuthService = inject(CandidateAuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  errorMessage: string | null = null;

  onSubmit(): void {
    const rawForm = this.form.getRawValue()
    this.candidateAuthService
      .login(rawForm.email, rawForm.password)
      .subscribe({
        next: () => {
          this.router.navigateByUrl('/candidate')
        },
        error: (err) => {
          this.errorMessage = err.code;
        }
      })
  }

}
