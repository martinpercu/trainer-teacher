import { Component, inject } from '@angular/core';
import { StorageService } from '@services/storage.service';
import { TranslocoPipe } from '@jsverse/transloco';

import { CandidateService } from '@services/candidate.service';
import { AuthService } from '@services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-upload',
  imports: [TranslocoPipe, CommonModule, FormsModule],
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  authService = inject(AuthService);
  storageService = inject(StorageService);
  candidateService = inject(CandidateService);

  selectedFile: File | null = null;
  fileSizeError: boolean = false; // Nueva propiedad para el mensaje de error
  readonly MAX_FILE_SIZE_MB = 2; // Tamaño máximo permitido en MB

  userId!: string;

  constructor() {}

  async ngOnInit() {
    this.authService.user$.subscribe((user) => {
      if (user) {
        this.userId = user.uid;
        console.log('UID:', this.userId);
      } else {
        console.error('No user authenticated');
      }
    });
  }

  // onFileSelected(event: Event) {
  //   const input = event.target as HTMLInputElement;
  //   if (input.files && input.files.length > 0) {
  //     this.selectedFile = input.files[0];
  //     this.uploadResume()
  //   }
  // }
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileSizeError = false; // Resetear cualquier error previo

      // Validar size of file
      if (file.size > this.MAX_FILE_SIZE_MB * 1024 * 1024) {
        this.fileSizeError = true;
        this.selectedFile = null; // Limpiar el archivo seleccionado si es demasiado grande
        input.value = ''; // Limpiar el input file para permitir al usuario seleccionar otro
        return; // Detener la ejecución si el archivo es muy grande
      }
      this.selectedFile = file;
      this.uploadResume(); // Proceder con la subida si la validación pasa
    } else {
      this.selectedFile = null;
      this.fileSizeError = false;
    }
  }

  uploadResume() {
  if (this.selectedFile && this.userId) {
    const path = `resumes/${this.userId}/${Date.now()}_${this.selectedFile.name}`;
    const fileName = this.selectedFile.name
    console.log(path);

    this.storageService.uploadFile(this.selectedFile, path).subscribe({
      next: (url) => {
        console.log('Received URL:', url, typeof url); // Debug
        if (url && typeof url === 'string') {
          this.candidateService.updateOneUser({ resumePath: url, resumeDocName:fileName }, this.userId)
            .then(() => {
              console.log('Resume URL saved to candidate')
              window.location.reload();
            })
            .catch((err) => console.error('Error saving URL:', err));
        } else {
          console.error('Invalid URL:', url);
        }
      },
      error: (err) => console.error('Upload error:', err)
    });
  } else {
    console.error('No file selected or user not authenticated');
  }
  // alert('esto está ok subido');
  // this.reLoadSamePage();
  // this.router.navigateByUrl(this.router.url, { onSameUrlNavigation: 'reload' });
  }

}
