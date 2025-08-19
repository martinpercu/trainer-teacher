import { Component, Input, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { MatIconModule } from '@angular/material/icon';

import { Job } from '@models/job';
import { Candidate } from '@models/candidate';
import { Resume } from '@models/resume';

import { ResumeService } from '@services/resume.service'

import { environment } from '@env/environment';

import { ResumeViewerComponent } from '@recruiter/resume-viewer/resume-viewer.component'


@Component({
  selector: 'app-jobs-list',
  imports: [TranslocoPipe, MatIconModule, ResumeViewerComponent],
  templateUrl: './jobs-list.component.html',
  styleUrl: './jobs-list.component.css'
})
export class JobsListComponent {
  @Input() job!: Job;
  @Input() candidatesForJob!: Candidate[];
  // @Input() results!: Result[];
  @Input() candidatesForJobAndExamPassed!: Candidate[];
  @Input() resumesForJob!: Resume[];

  resumeService = inject(ResumeService);

  magicLink: string = 'Este es el texto super importante que ya tengo en mi variable.';
  copiedSucces: boolean = false; // Para mostrar un mensaje de éxito
  errorInCopy: boolean = false; // Para mostrar un mensaje de error

  showCandidates!: boolean;
  showCandidatesExamPassed!: boolean;
  candidatesWithScores: any[] = [];

  selectedResume: Resume | null = null; // Esta variable guardará el currículum a mostrar

  async ngOnInit() {
    console.log('START OnINIT Job-List');
    console.log(this.job);
    console.log(this.candidatesForJob);
    console.log(this.candidatesForJobAndExamPassed);
    this.showCandidates = false
    this.showCandidatesExamPassed = false
    this.magicLink = `${environment.BASEURL}/job/${this.job.jobId}`;
    console.log(this.magicLink);
    console.log('END OnINIT Job-List');
    console.log(this.resumesForJob);
    this.combineCandidateData();
  };

  private combineCandidateData(): void {
    this.candidatesWithScores = this.candidatesForJob.map(candidate => {
      // Usamos 'find' para buscar el resume correspondiente
      const resume = this.resumesForJob.find(
        (r) => r.candidateUID === candidate.candidateUID
      );

      // Devolvemos un nuevo objeto que combine ambos datos
      return {
        ...candidate, // Copia todas las propiedades del candidato
        scoreToPosition: resume ? resume.scoreToPosition : 'N/A', // Añade el score, o 'N/A' si no se encuentra
      };
    });
  }


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

  // Esta función ahora recibe un objeto Candidate
  showResume(candidate: Candidate): void {
    // 1. Busca el currículum (resume) correspondiente en la lista de resumesForJob
    const resumeToShow = this.resumesForJob.find(resume => resume.candidateUID === candidate.candidateUID);

    // 2. Si se encontró un currículum
    if (resumeToShow) {
      // 3. Compara si el currículum encontrado es el mismo que el que se está mostrando actualmente.
      // Si son el mismo, significa que el usuario está haciendo "toggle" para ocultarlo.
      if (this.selectedResume === resumeToShow) {
        this.selectedResume = null; // Oculta el componente.
      } else {
        // Si es diferente, lo asigna para que se muestre.
        this.selectedResume = resumeToShow;
      }
    } else {
      // En caso de que no haya un currículum para el candidato, lo ocultamos por si acaso.
      this.selectedResume = null;
    }
  }
}
