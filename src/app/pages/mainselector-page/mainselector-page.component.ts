import { Component, inject } from '@angular/core';

import { environment } from '@env/environment';

import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

@Component({
  selector: 'app-mainselector-page',
  imports: [MatIconModule, TranslocoPipe],
  templateUrl: './mainselector-page.component.html'
})
export class MainselectorPageComponent {

  router = inject(Router);

  constructor(private translocoService: TranslocoService) {
    // Opcional: Puedes establecer el idioma inicial basado en el navegador
    // const browserLang = this.translocoService.getBrowserLang();
    // this.translocoService.setActiveLang(browserLang?.match(/en|es/) ? browserLang : 'en');
  }


  goToLink(url: string) {
    // window.open(url, "_blank");
    this.router.navigate([`/teacher/${url}`]);
  };

  goToAdmin() {
    // window.open("https://trainer-teacher.web.app/main", '_blank');
    window.open(`${environment.BASEURL}/main`, '_blank');
    // this.router.navigate(['/main']);
  }


  changeLang(lang: string) {
    this.translocoService.setActiveLang(lang);
  }

}
