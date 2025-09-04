import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
// import { TranslocoPipe } from '@jsverse/transloco';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Resume } from '@models/resume'; // Asegúrate de tener el modelo en el mismo directorio o importar la ruta correcta

import { ResumeService } from '@services/resume.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';


@Component({
  selector: 'app-resume-viewer',
  imports: [TranslocoPipe, CommonModule, MatIconModule],
  templateUrl: './resume-viewer.component.html'
})
export class ResumeViewerComponent {
  @Input() resumeForJob!: Resume;

  @Output() updateResumeList = new EventEmitter<void>();
  @Output() closeViewer = new EventEmitter<void>();

  resumeService = inject(ResumeService);

  showSummary: boolean = true;
  showSkills: boolean = false;
  showWorks: boolean = false;
  showEducation: boolean = false;
  showCertifications: boolean = false;
  showLanguages: boolean = false;

    // async ngOnInit() {
    //   console.log(this.resumeForJob);

    // }

  constructor(private translocoService: TranslocoService){

  }

  async ngOnInit() {
  console.log(this.resumeForJob);
  console.log("Componente hijo inicializado");
  console.log("updateResumeList observers al init:", this.updateResumeList.observers?.length || 'no observers property');
}

  // Puedes usar una función genérica o una por cada sección
  toggleSection(section: 'summary' | 'skills' | 'works' | 'education' | 'certifications' | 'languages') {
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
      case 'languages':
        this.showLanguages = !this.showLanguages;
        break;
    }
  }

  close(): void {
    this.closeViewer.emit();
    // alert('exit resume show')
    // this.thumbUpResume();
  }

  async thumbUpResume(): Promise<void> {
    console.log('THUMB THUMB !!!!!\nTHUMB UPUPUP!!');
    // this.updateResumeList.emit();
    console.log(this.resumeForJob);
    // Asigna el valor 'true' al campo thumbUp del objeto resumeForJob
    this.resumeForJob.thumbUp = true;
    console.log('Resume actualizado:', this.resumeForJob);

    try {
      // Espera a que se complete la actualización en Firestore
      await this.resumeService.updatedThisResume(
        { thumbUp: true },
        this.resumeForJob.candidateUID,
        this.resumeForJob.jobRelated
      );
      console.log('Resume actualizado en Firestore exitosamente');
      // Ahora sí emite el evento para actualizar la lista en el padre
      this.updateResumeList.emit();
    } catch (error) {
      console.error('Error actualizando resume:', error);
      // Opcional: podrías revertir el cambio local si falla
      // this.resumeForJob.thumbUp = false;
    }
  }

  async thumbUpHandleResume(data: boolean): Promise<void> {
    console.log('THUMB THUMB !!!!!\nTHUMB UPUPUP!!');
    // this.updateResumeList.emit();
    console.log(this.resumeForJob);
    // Asigna el valor 'false' al campo thumbUp del objeto resumeForJob
    this.resumeForJob.thumbUp = data;
    console.log(this.resumeForJob.thumbUp);

    console.log('Resume actualizado:', this.resumeForJob);

    try {
      // Espera a que se complete la actualización en Firestore
      await this.resumeService.updatedThisResume(
        { thumbUp: data },
        this.resumeForJob.candidateUID,
        this.resumeForJob.jobRelated
      );
      console.log('Resume actualizado en Firestore exitosamente');
      // Ahora sí emite el evento para actualizar la lista en el padre
      this.updateResumeList.emit();
    } catch (error) {
      console.error('Error actualizando resume:', error);
      // Opcional: podrías revertir el cambio local si falla
      // this.resumeForJob.thumbUp = false;
    }
  }

  // emailToCandidate() {
  //   alert("email ?")
  // }
  // smsToCandidate() {
  //   alert("SMS ?")
  // }
  // callToCandidate() {
  //   alert("llamamos ?")
  // }
  emailToCandidate() {
    // Obtiene la traducción para la clave "email"
    const emailTranslation = this.translocoService.translate('candidate_profile.send_email');
    alert(emailTranslation + "?"); // Mostrará "correo electrónico?" o "email?" dependiendo del idioma

    // Si quieres usarla en la lógica de envío de email:
    const emailAddress = this.resumeForJob.email;
    const subject = `${emailTranslation}?`; // Usando la traducción en el asunto
    const body = `${emailTranslation}:\n\n`; // Usando la traducción en el cuerpo

    const encodedSubject = encodeURIComponent(subject);
    const encodedBody = encodeURIComponent(body);

    console.log(emailAddress + '\n' + encodedSubject + '\n' + encodedBody);


    window.location.href = `mailto:${emailAddress}?subject=${encodedSubject}&body=${encodedBody}`;
  }

  smsToCandidate() {
    // Obtiene la traducción para la clave "sms"
    const smsTranslation = this.translocoService.translate('sms');
    alert(smsTranslation + "?"); // Mostrará "SMS?" o "mensaje de texto?" dependiendo del idioma

    // Si quieres usarla en la lógica de envío de SMS:
    const phoneNumber = '+1234567890'; // Reemplaza con el número de teléfono deseado
    const messagePrefix = `${smsTranslation}:\n\n`; // Usando la traducción como prefijo del mensaje

    const encodedMessage = encodeURIComponent(messagePrefix);

    // El esquema `sms:` permite especificar el número y, opcionalmente, el mensaje.
    // La sintaxis puede variar ligeramente entre dispositivos, pero `?body=` es común.
    window.location.href = `sms:${phoneNumber}?body=${encodedMessage}`;
  }

  callToCandidate() {
    // Definimos el número de teléfono
    const phoneNumber = '+1234567890';

    // Obtenemos la traducción del texto del botón o mensaje, si es necesario.
    // Aunque para esta función solo necesitas el número.
    const callTranslation = this.translocoService.translate('call_button');

    // La parte clave: usar window.location.href con el esquema tel:
    window.location.href = `tel:${phoneNumber}`;

    // Opcionalmente, puedes mostrar una alerta con la traducción
    alert(callTranslation + ` al ${phoneNumber}?`);
  }



  // thumbUpResume(): void {
  //   console.log(("befare call"));
  //   this.updateResumeList.emit();
  // }

//   thumbUpResume(): void {
//   console.log("thumbUpResume ejecutándose...");
//   console.log("Número de observers:", this.updateResumeList.observers.length);
//   this.updateResumeList.emit();
//   console.log("updateResumeList emitido");
// }


}
