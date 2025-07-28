import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Recruiter } from '@models/recruiter';
import { RecruiterAuthService } from '@services/recruiter-auth.service';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-recruiter-register',
  imports: [ReactiveFormsModule, TranslocoPipe],
  templateUrl: './recruiter-register.component.html'
})
export class RecruiterRegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  recruiterAuthService = inject(RecruiterAuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    email: ['', Validators.required],
    password: ['', Validators.required],
  });
  errorMessage: string | null = null;

  onSubmit(): void {
    const rawForm = this.form.getRawValue()
    this.recruiterAuthService.register(rawForm.email, rawForm.username, rawForm.password)
      .subscribe({
        next: () => {
        this.router.navigateByUrl('/recruiter')
        },
        error: (err) => {
          this.errorMessage = err.code;
        }
    })
  }

}
