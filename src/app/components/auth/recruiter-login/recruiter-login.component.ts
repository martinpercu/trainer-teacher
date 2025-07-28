import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Recruiter } from '@models/recruiter';
import { RecruiterAuthService } from '@services/recruiter-auth.service';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-recruiter-login',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './recruiter-login.component.html',
})
export class RecruiterLoginComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  recruiterAuthService = inject(RecruiterAuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  errorMessage: string | null = null;

  onSubmit(): void {
    const rawForm = this.form.getRawValue();
    this.recruiterAuthService.login(rawForm.email, rawForm.password).subscribe({
      next: () => {
        // this.router.navigateByUrl('/recruiter');
      },
      error: (err) => {
        this.errorMessage = err.code;
      },
    });
  }
}
