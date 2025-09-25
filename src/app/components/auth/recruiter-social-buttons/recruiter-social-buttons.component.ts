import { Component, inject } from '@angular/core';
import { RecruiterAuthService } from '@services/recruiter-auth.service';

import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-recruiter-social-buttons',
  imports: [TranslocoPipe],
  templateUrl: './recruiter-social-buttons.component.html'
})
export class RecruiterSocialButtonsComponent {
  recruiterAuthService = inject(RecruiterAuthService);


  // private translocoService = inject(TranslocoService);

    errorMessage: string | null = null;



  async loginWithGoogle() {
    try {
      this.errorMessage = '';
      await this.recruiterAuthService.loginWithGoogle();
      // here do something if OK
    } catch (error: any) {
      this.errorMessage = error;
    }
  }

}
