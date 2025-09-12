import { Component } from '@angular/core';


import { TranslocoPipe } from '@jsverse/transloco';

import { RecruiterLoginComponent } from '@components/auth/recruiter-login/recruiter-login.component';
import { RecruiterRegisterComponent } from '@components/auth/recruiter-register/recruiter-register.component';

@Component({
  selector: 'app-login-and-register',
  imports: [TranslocoPipe, RecruiterLoginComponent, RecruiterRegisterComponent],
  templateUrl: './login-and-register.component.html',
  styleUrl: './login-and-register.component.css'
})
export class LoginAndRegisterComponent {

  loginOrRegister: boolean = false

  toggleLoginRegister() {
    this.loginOrRegister = !this.loginOrRegister
  }

}
