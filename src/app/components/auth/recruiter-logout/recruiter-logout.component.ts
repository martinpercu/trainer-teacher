import { Component, inject } from '@angular/core';
import { RecruiterAuthService } from '@services/recruiter-auth.service';

@Component({
  selector: 'app-recruiter-logout',
  imports: [],
  templateUrl: './recruiter-logout.component.html'
})
export class RecruiterLogoutComponent {

  recruiterAuthService = inject(RecruiterAuthService);

  logout(){
    this.recruiterAuthService.logout();
  }

}
