import { Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';


import { LightdarkthemeService } from '@services/lightdarktheme.service';
import { AuthService } from '@services/auth.service';
import { ModalinfoService } from '@services/modalinfo.service';
import { VisualStatesService } from '@services/visual-states.service';
import { PagesService } from '@services/pages.service';

import { RegisterComponent } from '@components/auth/register/register.component';
import { LoginComponent } from '@components/auth/login/login.component';

@Component({
  selector: 'app-top-right',
  imports: [MatIconModule, RegisterComponent, LoginComponent],
  templateUrl: './top-right.component.html',
  styleUrl: './top-right.component.css'
})
export class TopRightComponent {

  themeService = inject(LightdarkthemeService);
  authService = inject(AuthService);
  modalinfoService = inject(ModalinfoService);
  visualStatesService = inject(VisualStatesService);

  pagesService = inject(PagesService);

  router = inject(Router);

  showlist: boolean = false;
  // showRegisterOrLogin: boolean = false;
  showRegisterOrLogin = signal<boolean | undefined>(undefined);

  switchShowList() {
    this.showlist = !this.showlist
    this.showRegisterOrLogin.set(undefined)
  }

  goToLink(url: string) {
    window.open(url, "_blank");
  };

  pdfNotAcces() {
    alert('Your mobile device cannot load the files. Please use a desktop device to access the documents')
  }

  // toPdf() {
  //   this.router.navigate(['/pdf'])
  // }

  toPdf() {
    const pdfPath = this.pagesService.docPath();
    if (pdfPath) {
      window.open(`/assets/${pdfPath}`, '_blank');
      this.router.navigate(['/pdf-viewer']);
    } else {
      alert('No hay PDF disponible');
    }
  }

  changeTheme() {
    this.themeService.toggleDarkMode();
  }


  changeViewRegisterOrLogin() {
    this.showRegisterOrLogin.set(!this.showRegisterOrLogin());
  }

  setShowLoginAndSwitch() {
    if (this.showRegisterOrLogin()) {
      this.changeViewRegisterOrLogin();
    } else {
      this.showRegisterOrLogin.set(true);
    }
  }

  logout() {
    if (confirm('Sure to logout?')) {
      console.log('joya');
      this.authService.logout();
    } else {
      console.log('naranja');
    }
  }

  showModalInfo() {
    this.visualStatesService.showModalInfo.set(true);
    this.switchShowList();
  }


}
