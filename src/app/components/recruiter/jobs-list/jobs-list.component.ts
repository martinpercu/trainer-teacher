import { Component, Input } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatIconModule } from '@angular/material/icon';

import { Job } from '@models/job';
import { Candidate } from '@models/candidate';

import { environment } from '@env/environment';

@Component({
  selector: 'app-jobs-list',
  imports: [TranslocoPipe, MatIconModule],
  templateUrl: './jobs-list.component.html',
  styleUrl: './jobs-list.component.css'
})
export class JobsListComponent {
  @Input() job!: Job;
  @Input() candidatesForJob!: Candidate[];
  // @Input() results!: Result[];
  @Input() candidatesForJobAndExamPassed!: Candidate[];

  magicLink: string = 'Este es el texto super importante que ya tengo en mi variable.';
  copiedSucces: boolean = false; // Para mostrar un mensaje de éxito
  errorInCopy: boolean = false; // Para mostrar un mensaje de error

  showCandidates!: boolean;
  showCandidatesExamPassed!: boolean;

  ngOnInit() {
    console.log('START OnINIT Job-List');
    console.log(this.job);
    console.log(this.candidatesForJob);
    console.log(this.candidatesForJobAndExamPassed);
    this.showCandidates = false
    this.showCandidatesExamPassed = false
    this.magicLink = `${environment.BASEURL}/job/${this.job.jobId}`;
    console.log(this.magicLink);
    console.log('END OnINIT Job-List');
  };

  switchShowCandidates(){
    this.showCandidates = !this.showCandidates
  };

  switchShowCandidatesExamPassed(){
    this.showCandidatesExamPassed = !this.showCandidatesExamPassed
  };

  async copyMagicString(): Promise<void> {
    this.copiedSucces = false;
    this.errorInCopy = false;
    // Check if API Clipboard is ready on Browser
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        // Intentar escribir el texto en el portapapeles
        await navigator.clipboard.writeText(this.magicLink);
        console.log('String copiado exitosamente al portapapeles:', this.magicLink);
        this.copiedSucces = true;
        // hide succes message after 2 secs.
        setTimeout(() => {
          this.copiedSucces = false;
        }, 2000);
      } catch (err) {
        // Catch error if copy problem (ej. denied permits)
        console.error('Error trying copy:', err);
        this.errorInCopy = true;
        // hide error message after 3 secs
        setTimeout(() => {
          this.errorInCopy = false;
        }, 3000);
      }
    } else {
      // Show warning if API is not available (very old browsers)
      console.warn('API Clipboard not compatible with this browser.');
      this.errorInCopy = true; // Podrías usar un mensaje diferente aquí si quieres
      alert('Tu navegador no soporta la copia automática. Por favor, copia manualmente el texto: \n\n' + this.magicLink);
    }
  }

}
