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
  async saveResumeDataToFirestore(resumeData: any, candidateUID: string, jobId: string, recruiterId: string): Promise<string> {
    console.log(`Saving resume data for user: ${candidateUID}`);

    const newResume: Resume = {
      candidateUID: candidateUID,
      jobRelated: jobId,
      recruiterId: recruiterId,

      name: resumeData['Name'] || null,
      email: resumeData['Email'] || null,
      phone: resumeData['Phone Number'] || null,
      zipcode: resumeData['Postal Code'] || null,
      city: resumeData['City'] || null,

      summary: resumeData['Summary/Objective'] || null,
      skills: resumeData['Skills'] || null,
      languages: resumeData['Languages'] || null,

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
        graduationYear: edu['Graduation Year'] || null,
      })),
    };

    console.log(newResume);

    const docRef = await addDoc(this.resumesCollection, newResume);
    console.log(`Resume data saved successfully with document ID: ${docRef.id}`);

    return docRef.id;
  };


  async getScore(resumeData: any, description: string): Promise<any> {

    const experience = {
      works: (resumeData['Work Experience'] || []).map((work: any) => ({
        jobtitle: work['Job Title'] || null,
        company: work['Company'] || null,
        dates: work['Dates'] || null,
        description: work['Description'] || null,
      })),
    };

    // Convertir el array de experiencias a un único string
    const experienceString = experience.works
      .map((work: any) => {
        // Une los campos de cada trabajo en una frase
        const jobDetails = [work.jobtitle, work.company, work.dates, work.description]
          .filter(Boolean) // Filtra valores nulos o vacíos
          .join('. '); // Usa un punto para separar los detalles de cada trabajo

        return jobDetails;
      })
      .join(' | '); // Usa un separador distintivo para cada trabajo

    const summary = resumeData['Summary/Objective'] ?? ''; // This is to return something if Summary is NULL
    const skills = resumeData['Skills'] ?? ''; // This is to return something if Summary is NULL

    const body = {
      candidate_summary: summary,
      candidate_experience: experienceString,
      candidate_skills:skills,
      job_description: description
    };

    // return resumeData + description + experienceString + summary
    return firstValueFrom(this.http.post(`${this.apiUrl}/calculate_embedding_score`, body));
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

//   async updatedThisResume(resume: Partial<Resume>, candidateUID: string, jobRelated: string): Promise<void> {
//   const q = query(
//     this.resumesCollection,
//     where('candidateUID', '==', candidateUID),
//     where('jobRelated', '==', jobRelated)
//   );

//   try {
//     const querySnapshot = await getDocs(q);

//     if (querySnapshot.empty) {
//       console.log('No se encontró ningún currículum con esos datos.');
//       throw new Error('Resume not found');
//     }

//     const resumeDocRef = querySnapshot.docs[0].ref;
//     await updateDoc(resumeDocRef, resume);
//     console.log('Resume updated');
//   } catch (error) {
//     console.error('Error updating resume:', error);
//     throw error;
//   }
// }

  async updatedThisResume(
    resume: Partial<Resume>,
    candidateUID: string,
    jobRelated: string
  ): Promise<Resume | null> {
    const q = query(
      this.resumesCollection,
      where('candidateUID', '==', candidateUID),
      where('jobRelated', '==', jobRelated)
    );

    try {
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        console.log('No se encontró ningún currículum con esos datos.');
        throw new Error('Resume not found');
      }

      const resumeDocRef = querySnapshot.docs[0].ref;

      // Primero, actualizamos el documento en Firestore
      await updateDoc(resumeDocRef, resume);
      console.log('Resume updated');

      // Luego, obtenemos el documento actualizado para retornarlo
      const updatedDoc = await getDoc(resumeDocRef);

      if (updatedDoc.exists()) {
        // Obtenemos los datos del documento y se los asignamos a la interfaz Resume.
        // Firebase se encarga de que los datos coincidan.
        const updatedResume = updatedDoc.data() as Resume;

        return updatedResume;
      } else {
        console.log('Documento actualizado no encontrado.');
        return null;
      }
    } catch (error) {
      console.error('Error updating or retrieving resume:', error);
      throw error;
    }
  }

// async updateOneResume(resumeUpdate: Partial<Resume>, resumeId: string) {
//   const resumeDocRef = doc(this.resumesCollection, resumeId);
//   return updateDoc(resumeDocRef, resumeUpdate)
//     .then(() => {
//       console.log('Documento del candidato actualizado correctamente.');
//     })
//     .catch((error) => {
//       console.error('Error al actualizar el documento:', error);
//       throw error; // Propaga el error para manejarlo en la función que llama
//     });
// }
// async updateOneResume(resumeUpdate: Partial<Resume>, resumeId: string): Promise<void> {
//   const resumeDocRef = doc(this.resumesCollection, resumeId);

//   // Devuelve la promesa completa para que el código que llama pueda usarla
//   return updateDoc(resumeDocRef, resumeUpdate);
// }
  async updateOneResume(resumeUpdate: Partial<Resume>, resumeId: string): Promise<Resume | null> {
    const resumeDocRef = doc(this.resumesCollection, resumeId);
    try {
      await updateDoc(resumeDocRef, resumeUpdate);
      console.log('Documento del candidato actualizado correctamente.');

      const docSnap = await getDoc(resumeDocRef);

      if (docSnap.exists()) {
        // ✅ Solución: Realiza el cast a `unknown` primero
        // Esto le dice a TypeScript que confíe en la estructura de los datos que vienen de Firestore
        const updatedResume = { id: docSnap.id, ...(docSnap.data() as unknown as Resume) };
        return updatedResume;
      } else {
        console.warn('El documento no se encontró después de la actualización.');
        return null;
      }
    } catch (error) {
      console.error('Error al actualizar y leer el documento:', error);
      throw error;
    }
  }


  /**
   * Obtiene todos los resumes que corresponden a una lista de IDs de trabajos.
   *
   * @param jobIds Un array de strings con los IDs de los trabajos.
   * @returns Un Promise que resuelve con un array de objetos Resume.
   */
  async getResumesForJobs(jobIds: string[]): Promise<Resume[]> {
    console.log('IN GET RESU FOR JOS SERVICE');

    // Si la lista de jobIds está vacía, no hay nada que buscar.
    if (jobIds.length === 0) {
      return [];
    }
    // Usamos una consulta `where('jobRelated', 'in', jobIds)`
    // para buscar todos los documentos que tengan el campo `jobRelated`
    // en la lista de `jobIds` que proporcionamos.
    // Nota: Firestore limita la cláusula 'in' a un máximo de 10 elementos.
    // Si tu lista de trabajos puede ser más larga, necesitarías hacer
    // múltiples consultas. Por ahora, asumimos que es 10 o menos.
    const resumesQuery = query(
      this.resumesCollection,
      where('jobRelated', 'in', jobIds)
    );

    // `getDocs` devuelve una instantánea de la consulta.
    const snapshot = await getDocs(resumesQuery);

    // Mapeamos los documentos de la instantánea a nuestro modelo `Resume`.
    const resumes: Resume[] = snapshot.docs.map((doc) => {
      // Usamos `doc.data()` para obtener los datos del documento
      // y `doc.id` para obtener el ID del documento.
      return { id: doc.id, ...doc.data() } as Resume;
    });

    return resumes;
  }


  async getResumesForJob(jobId: string): Promise<Resume[]> {
    // Si el jobId no es válido, no hay nada que buscar.
    if (!jobId) {
      return [];
    }

    // Consulta que busca documentos donde `jobRelated` es IGUAL al jobId proporcionado.
    const resumesQuery = query(
      this.resumesCollection,
      where('jobRelated', '==', jobId)
    );

    // Ejecuta la consulta.
    const snapshot = await getDocs(resumesQuery);

    // Mapea los resultados al modelo Resume, incluyendo el ID del documento.
    const resumes: Resume[] = snapshot.docs.map((doc) => {
      return { id: doc.id, ...doc.data() } as Resume;
    });

    return resumes;
  }


  // async getResumesForRecruiter(recruiterId: string): Promise<Resume[]> {
  //   // Si el jobId no es válido, no hay nada que buscar.
  //   if (!recruiterId) {
  //     return [];
  //   }

  //   // Consulta que busca documentos donde `jobRelated` es IGUAL al jobId proporcionado.
  //   const resumesQuery = query(
  //     this.resumesCollection,
  //     where('recruiterId', '==', recruiterId)
  //   );

  //   // Ejecuta la consulta.
  //   const snapshot = await getDocs(resumesQuery);

  //   // Mapea los resultados al modelo Resume, incluyendo el ID del documento.
  //   const resumes: Resume[] = snapshot.docs.map((doc) => {
  //     return { id: doc.id, ...doc.data() } as Resume;
  //   });

  //   return resumes;
  // }



  /**
   * Obtiene todos los trabajos.
   * @returns Un Observable de un array de Resumes.
   */
  getResumesForRecruiter(recruiterId: string): Observable<Resume[]> {
    const q = query(this.resumesCollection, where('recruiterId', '==', recruiterId));
    return collectionData(q, { idField: 'recruiterId' }) as Observable<Resume[]>;
  }


}
