import { Component, inject } from '@angular/core';
import { StorageService } from '@services/storage.service';

import { CandidateService } from '@services/candidate.service';
import { AuthService } from '@services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-upload',
  imports: [CommonModule, FormsModule],
  templateUrl: './upload.component.html',
})
export class UploadComponent {
  authService = inject(AuthService);
  storageService = inject(StorageService);
  candidateService = inject(CandidateService);

  selectedFile: File | null = null;

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

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  uploadResume() {
  if (this.selectedFile && this.userId) {
    const path = `resumes/${this.userId}/${Date.now()}_${this.selectedFile.name}`;
    this.storageService.uploadFile(this.selectedFile, path).subscribe({
      next: (url) => {
        console.log('Received URL:', url, typeof url); // Debug
        if (url && typeof url === 'string') {
          this.candidateService.updateOneUser({ resumePath: url }, this.userId)
            .then(() => console.log('Resume URL saved to candidate'))
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
}


}
