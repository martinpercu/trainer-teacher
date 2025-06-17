import { Component, inject } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mainselector-page',
  imports: [MatIconModule],
  templateUrl: './mainselector-page.component.html',
  styleUrl: './mainselector-page.component.css'
})
export class MainselectorPageComponent {

  router = inject(Router);


  goToLink(url: string) {
    // window.open(url, "_blank");
    this.router.navigate([`/teacher/${url}`]);
  };

}
