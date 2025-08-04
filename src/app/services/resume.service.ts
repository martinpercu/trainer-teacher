import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  getDocs,
  collectionData,
  getDoc,
  deleteDoc,
  doc,
  setDoc,
  updateDoc,
  orderBy,
  query,
  where
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, timeout } from 'rxjs';
import { environment } from '@env/environment';
import { Resume } from '@models/resume'

@Injectable({
  providedIn: 'root'
})

export class ResumeService {
  private firestore = inject(Firestore);
  private http = inject(HttpClient);
  private resumesCollection = collection(this.firestore, 'resumes');

  private apiUrl = environment.BACK_CHAT_URL; // Define esto en tu environment.ts

  async processResumeWithPython(resumeUrl: string, userId: string, fileType: string): Promise<any> {
    const body = { resume_url: resumeUrl, user_id: userId, file_type: fileType };
    return firstValueFrom(this.http.post(`${this.apiUrl}/process_resume_content`, body));
  }

  async processResumeWithPythonTest(resumeUrl: string, userId: string, fileType: string): Promise<any> {
    const body = { resume_url: resumeUrl, user_id: userId, file_type: fileType };
    const timeoutDuration = 30000;
    console.log(body);

    return firstValueFrom(
      this.http.post(`${this.apiUrl}/process_resume_content`, body).pipe(
        timeout(timeoutDuration)
      )
    );
  }

  /**
   * Saves the structured resume data to Firestore.
   * @param resumeData The structured JSON object from the Python backend.
   * @param candidateUID The UID of the candidate.
   * @returns A Promise that resolves when the data is saved.
   */
  async saveResumeDataToFirestore(resumeData: any, candidateUID: string, jobId: string): Promise<string> {
    console.log(`Saving resume data for user: ${candidateUID}`);

    const newResume: Resume = {
      candidateUID: candidateUID,
      jobRelated: jobId,

      name: resumeData['Name'] || null,
      email: resumeData['Email'] || null,
      phone: resumeData['Phone Number'] || null,
      summary: resumeData['Summary/Objective'] || null,

      // Validamos si 'Work Experience' existe antes de mapear
      works: (resumeData['Work Experience'] || []).map((work: any) => ({
        jobtitle: work['Job Title'] || null,
        company: work['Company'] || null,
        dates: work['Dates'] || null,
        description: work['Description'] || null,
      })),

      // <-- CORRECCIÓN AQUÍ: Validamos si 'Certification' existe antes de mapear
      certifications: (resumeData['Certification'] || []).map((cert: any) => ({
        certificate: cert['Certificate'] || null,
        issuingOrganization: cert['Issuing Organization'] || null,
        year: cert['Year'] || null,
      })),

      // <-- CORRECCIÓN AQUÍ: Validamos si 'Education' existe antes de mapear
      education: (resumeData['Education'] || []).map((edu: any) => ({
        degree: edu['Degree'] || null,
        institution: edu['Institution'] || null,
        year: edu['Graduation Year'] || null,
      })),
    };

    console.log(newResume);

    const docRef = await addDoc(this.resumesCollection, newResume);
    console.log(`Resume data saved successfully with document ID: ${docRef.id}`);

    return docRef.id;
  }



  async getOneResume(candidateUID: string, jobRelated: string): Promise<Resume | null> {
    // Usa 'this.resumesCollection' directamente
    const q = query(
      this.resumesCollection,
      where('candidateUID', '==', candidateUID),
      where('jobRelated', '==', jobRelated)
    );

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No se encontró ningún currículum con esos datos.');
        return null;
      }

      const resumeDoc = querySnapshot.docs[0];
      const resumeData = resumeDoc.data();

      return resumeData as Resume;
    } catch (error) {
      console.error('Error al obtener el currículum:', error);
      return null;
    }

  }


}
