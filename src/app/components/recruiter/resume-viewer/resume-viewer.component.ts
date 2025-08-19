import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Resume } from '@models/resume'; // Asegúrate de tener el modelo en el mismo directorio o importar la ruta correcta


@Component({
  selector: 'app-resume-viewer',
  imports: [TranslocoPipe, CommonModule, MatIconModule],
  templateUrl: './resume-viewer.component.html'
})
export class ResumeViewerComponent {
  @Input() resumeForJob!: Resume;

  @Output() closeViewer = new EventEmitter<void>();


  showSummary: boolean = true;
  showSkills: boolean = false;
  showWorks: boolean = false;
  showEducation: boolean = false;
  showCertifications: boolean = false;

    async ngOnInit() {
      console.log(this.resumeForJob);

    }

  // Puedes usar una función genérica o una por cada sección
  toggleSection(section: 'summary' | 'skills' | 'works' | 'education' | 'certifications') {
    switch(section) {
      case 'summary':
        this.showSummary = !this.showSummary;
        break;
      case 'skills':
        this.showSkills = !this.showSkills;
        break;
      case 'works':
        this.showWorks = !this.showWorks;
        break;
      case 'education':
        this.showEducation = !this.showEducation;
        break;
      case 'certifications':
        this.showCertifications = !this.showCertifications;
        break;
    }
  }

  close(): void {
    this.closeViewer.emit();
  }

}
