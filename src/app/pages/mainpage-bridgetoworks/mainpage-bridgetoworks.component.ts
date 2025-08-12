import { Component, inject } from '@angular/core';
import { environment } from '@env/environment';

import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-mainpage-bridgetoworks',
  imports: [MatIconModule, TranslocoPipe],
  templateUrl: './mainpage-bridgetoworks.component.html',
  styleUrl: './mainpage-bridgetoworks.component.css'
})
export class MainpageBridgetoworksComponent {
  router = inject(Router);

  goToRecruiter() {
    // window.open(url, "_blank");
    this.router.navigate([`/recruiter`]);
  }

  goToCandidate() {
    // window.open(url, "_blank");
    this.router.navigate([`/candidate`]);
  }


}
