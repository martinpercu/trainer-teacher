import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Candidate } from '@models/candidate';
import { CandidateAuthService } from '@services/candidate-auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-candidate-register',
  imports: [ReactiveFormsModule],
  templateUrl: './candidate-register.component.html'
})
export class CandidateRegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  candidateAuthService = inject(CandidateAuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;

  onSubmit(): void {
    const rawForm = this.form.getRawValue()
    this.candidateAuthService.register(rawForm.email, rawForm.username, rawForm.password)
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
