import { Component, inject } from '@angular/core';
import { StorageService } from '@services/storage.service';
import { TranslocoPipe } from '@jsverse/transloco';

import { CandidateService } from '@services/candidate.service';
import { AuthService } from '@services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MessageWaitingComponent } from '@components/message-waiting/message-waiting.component';
import { LoadingBarComponent } from '@shared/loading-bar/loading-bar.component'


@Component({
  selector: 'app-upload',
  imports: [TranslocoPipe, CommonModule, FormsModule, LoadingBarComponent],
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

  showLoadingBar: boolean = false;

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


  // --- NEW METHOD: Handles only the upload to Firebase Storage ---
  async uploadResume() {
    if (this.selectedFile && this.userId) {
      const path = `resumes/${this.userId}/${Date.now()}_${this.selectedFile.name}`;
      const fileName = this.selectedFile.name;
      const fileType = this.selectedFile.type; // Keep fileType here as we need it later

      console.log('Uploading file to Firebase Storage:', path);

      this.storageService.uploadFile(this.selectedFile, path).subscribe({
        next: (url) => {
          console.log('Received URL from Firebase Storage:', url, typeof url);
          if (url && typeof url === 'string') {
            // Save the Firebase Storage URL and file name to the candidate's record
            this.candidateService.updateOneUser({ resumePath: url, resumeDocName: fileName }, this.userId)
              .then(() => {
                console.log('Resume URL and name saved to candidate record in Firebase.');
                alert('Resume uploaded successfully!');

                // --- CALL NEW METHOD TO TRIGGER PROCESSING AFTER SUCCESSFUL UPLOAD AND DB SAVE ---
                // this.triggerResumeProcessing(url, this.userId, fileType);
                // const resumeUrl = "https://firebasestorage.googleapis.com/v0/b/trainer-teacher.firebasestorage.app/o/resumes%2Fy5qcLmxLWEfPoq6gV39UNUrketA3%2F1753979962452_Resume-SUMsmall-skil6.pdf?alt=media&token=d5157d1a-cc5d-489d-a9f6-5cd1921fa022";
                // const userId = "IoUuFFIjqK8cv8lR1vQR";
                // const fileType = "application/pdf";

                // this.triggerResumeProcessing(resumeUrl, userId, fileType);
                this.triggerResumeProcessing(url, this.userId, fileType);

                // ----------------------------------------------------------------------------------

                // Optional: Consider if you truly need to reload the page immediately after upload
                // A better UX might be to show a "Processing..." message.
                // window.location.reload();
              })
              .catch((err) => {
                console.error('Error saving resume URL to candidate record in Firebase:', err);
                alert('Error saving resume details. Please try again.');
              });
          } else {
            console.error('Invalid URL received from storage service after upload:', url);
            alert('Error during file upload. Invalid URL.');
          }
        },
        error: (err) => {
          console.error('Error uploading file to Firebase Storage:', err);
          alert('Error uploading resume file. Please check your connection.');
        }
      });
    } else {
      console.error('No file selected or user not authenticated for upload process.');
      alert('Please select a file and ensure you are logged in.');
    }
  }

  // // --- NEW METHOD: Calls your FastAPI server to process the resume ---
  // async triggerResumeProcessing(resumeUrl: string, userId: string, fileType: string) {
  //   console.log('Sending request to Python server for resume processing...');
  //   this.candidateService.processResumeWithPython(resumeUrl, userId, fileType)
  //     .then((response) => {
  //       console.log('Resume processing request sent. Response from FastAPI:', response);
  //       // You might want to update the UI here to show "Processing complete"
  //       // or store the parsed data in Firebase if the FastAPI endpoint returns it
  //       // and you want Angular to handle that update.
  //     })
  //     .catch((err) => {
  //       console.error('Error triggering resume processing on Python server:', err);
  //       console.log('Error details:', JSON.stringify(err));
  //       alert('An error occurred while processing your resume. Please contact support.');
  //     });
  // }

  // async triggerResumeProcessing(resumeUrl: string, userId: string, fileType: string){
  //   // const resumeUrl = "https://firebasestorage.googleapis.com/v0/b/trainer-teacher.firebasestorage.app/o/resumes%2Fy5qcLmxLWEfPoq6gV39UNUrketA3%2F1753979962452_Resume-SUMsmall-skil6.pdf?alt=media&token=d5157d1a-cc5d-489d-a9f6-5cd1921fa022";
  //   // const userId = "IoUuFFIjqK8cv8lR1vQR";
  //   // const fileType = "application/pdf";
  //   console.log(resumeUrl);
  //   console.log(userId);
  //   console.log(fileType);

  //   const texho = await this.candidateService.processResumeWithPythonTest(resumeUrl, userId, fileType)
  //   console.log(texho);
  //   window.location.reload();
  // }

  async triggerResumeProcessing(resumeUrl: string, userId: string, fileType: string): Promise<any> {
  console.log('Sending request to Python server for resume processing...');
  try {
    const response = await this.candidateService.processResumeWithPython(resumeUrl, userId, fileType);
    console.log('Resume processing request sent. Response from FastAPI:', response);
    return response; // Devuelve la respuesta para usarla en el componente
  } catch (err) {
    console.error('Error triggering resume processing:', err);
    console.log('Error details:', JSON.stringify(err)); // Más detalles del error
    alert('An error occurred while processing your resume. Please contact support.');
    throw err; // Propaga el error para manejarlo en el llamador
  }
}



  // uploadResume() {
  //   if (this.selectedFile && this.userId) {
  //     const path = `resumes/${this.userId}/${Date.now()}_${this.selectedFile.name}`;
  //     const fileName = this.selectedFile.name
  //     console.log(path);

  //     this.storageService.uploadFile(this.selectedFile, path).subscribe({
  //       next: (url) => {
  //         console.log('Received URL:', url, typeof url); // Debug
  //         if (url && typeof url === 'string') {
  //           this.candidateService.updateOneUser({ resumePath: url, resumeDocName:fileName }, this.userId)
  //             .then(() => {
  //               console.log('Resume URL saved to candidate')
  //               alert('Resume uploaded OK')
  //               window.location.reload();
  //             })
  //             .catch((err) => console.error('Error saving URL:', err));
  //         } else {
  //           console.error('Invalid URL:', url);
  //         }
  //       },
  //       error: (err) => console.error('Upload error:', err)
  //     });
  //   } else {
  //     console.error('No file selected or user not authenticated');
  //   }
  // }



}
