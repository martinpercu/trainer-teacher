import { Component, Input, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';

// import { CandidateAuthService } from '@services/candidate-auth.service';
import { TranslocoPipe } from '@jsverse/transloco';

import {
  FormControl,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { CandidateService } from '@services/candidate.service';
import { ResumeService } from '@services/resume.service';
import { Candidate } from '@models/candidate';
import { Resume } from '@models/resume';

@Component({
  selector: 'app-candidate-resume-edit',
  imports: [CommonModule, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './candidate-resume-edit.component.html',
  styleUrl: './candidate-resume-edit.component.css'
})
export class CandidateResumeEditComponent {
  @Input() jobId!: string;
  // private candidateAuthService = inject(CandidateAuthService);
  private candidateService = inject(CandidateService);
  private resumeService = inject(ResumeService);
  private formBuilder = inject(FormBuilder);

  form!: FormGroup;

  candidate!: Candidate;
  candidateId!: string;

  resume!: Resume;

  constructor() {
    effect(() => {
      const candidateSigned = this.candidateService.candidateSig();
      console.log('effect:', candidateSigned);
      if (candidateSigned) {
        this.candidate = candidateSigned;
        console.log('estamos');
        if(this.candidate, this.jobId)
        this.getTheResume(this.candidate.candidateUID, this.jobId);
      }
    });
  }

  ngOnInit() {
    console.log('on init');
    console.log(this.jobId);
    console.log(this.candidate);
  }

  async getTheResume(candidateUID: string, jobID: string){
    const resume = await this.resumeService.getOneResume(candidateUID, jobID);
    if(resume){
      this.resume = resume;
      console.log(this.resume);

      this.buildForm();
    }
  }

  // async getOneCandidate() {
  //   console.log('entromos get One candidate');

  //   const candidateGetted = await this.candidateService.getThisCandidate(
  //     this.candidateId
  //   );
  //   this.candidate = candidateGetted;
  //   console.log(this.candidate);

  //   this.buildForm();
  // }


  private buildForm() {
    this.form = this.formBuilder.group({
      name: [this.resume.name, [Validators.required, Validators.minLength(2), Validators.maxLength(30)]],
      email: [this.resume.email, [Validators.required, Validators.email, Validators.maxLength(80)]],
      phone: [this.resume.phone, [Validators.required, Validators.minLength(9), Validators.maxLength(15), Validators.pattern("^[0-9]*$")]],
      // summary: [this.resume.summary, [Validators.minLength(7)]]
    });
  };




  saveResume(event: Event) {
    if (this.form.valid) {
    // console.log(this.form.value);
    const updatedUser = this.candidateService.updateOneUser(this.form.value, this.candidateId);
    // this.candidate = updatedUser
    // this.user = this.form.value;
    // console.log(this.userId);
    // this.getOneCandidate(); // very important each time save!!!
    console.log(updatedUser);
    // window.location.reload();

    // this.editBasicInfo = false;
    // this.editShipping = false;
    // this.editBilling = false;

    } else {
      this.form.markAllAsTouched();
    };
  };


}
