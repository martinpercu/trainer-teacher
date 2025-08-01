import { Component, inject } from '@angular/core';
import { CandidateLogoutComponent } from '@auth/candidate-logout/candidate-logout.component';
import { MatIconModule } from '@angular/material/icon';

import { CandidateService } from '@services/candidate.service'


@Component({
  selector: 'app-candidate-header',
  imports: [MatIconModule, CandidateLogoutComponent],
  templateUrl: './candidate-header.component.html',
  styleUrl: './candidate-header.component.css'
})
export class CandidateHeaderComponent {
  candidateService = inject(CandidateService);

}
