import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { CandidateLoginComponent } from '@components/auth/candidate-login/candidate-login.component';
import { CandidateLogoutComponent } from '@components/auth/candidate-logout/candidate-logout.component';
import { CandidateRegisterComponent } from '@components/auth/candidate-register/candidate-register.component';
import { CandidateService } from '@services/candidate.service';

import { CandidateEditComponent } from '@candidate/candidate-edit/candidate-edit.component';


@Component({
  selector: 'app-candidate-page',
  imports: [CandidateLoginComponent, CandidateLogoutComponent, CandidateRegisterComponent, CandidateEditComponent],
  templateUrl: './candidate-page.component.html'
})
export class CandidatePageComponent {

  private route = inject(ActivatedRoute);
  candidateService = inject(CandidateService);

  alreadyAccount: boolean = false;

  async ngOnInit() {
    // Extraer el examId de la URL.. OJO esta en /teacher/:id
    const jobPositionId = this.route.snapshot.paramMap.get('jobId'); // Ruta /teacher/:id

    if (jobPositionId) {
      console.log(jobPositionId);
    }
  }

}
