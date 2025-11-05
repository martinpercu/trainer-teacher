import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { JobCrudService } from '@services/job-crud.service';


@Injectable({
  providedIn: 'root'
})
export class AgentSyncService {
  private apiUrl = environment.BACK_AGENT_BRIDGE; // 'http://localhost:8000'

  constructor(private http: HttpClient) {}

  syncAllJobs(jobs: any[]) {
    return this.http.post(`${this.apiUrl}/jobs/sync`, {
      jobs: jobs.map(j => ({
        jobId: j.jobId,
        ownerId: j.ownerId,
        name: j.name,
        description: j.description,
        showSalary: j.showSalary || false,
        showRange: j.showRange || false,
        minSalary: j.minSalary ? String(j.minSalary) : null,  // ← Convertir a string
        maxSalary: j.maxSalary ? String(j.maxSalary) : null,  // ← Convertir a string
        fixSalary: j.fixSalary ? String(j.fixSalary) : null,  // ← Convertir a string
        salaryHour: j.salaryHour || false,
        salaryWeek: j.salaryWeek || false,
        salaryMonth: j.salaryMonth || false,
        salaryYear: j.salaryYear || false,
        hoursPerWeek: j.hoursPerWeek ? String(j.hoursPerWeek) : null, // ← Convertir a string
        currencySalary: j.currencySalary
      }))
    }).toPromise();
  }

  /**
   * Elimina un job específico de la DB del Agente AI.
   * @param jobId El ID del job a eliminar.
   * @returns Una Promise que se resuelve al finalizar la eliminación.
   */
  deleteJobFromAgent(jobId: string): Promise<any> {
    // 1. Construir la URL: ${this.apiUrl}/jobs/{job_id}
    const url = `${this.apiUrl}/jobs/${jobId}`;

    // 2. Usar HttpClient.delete() para hacer la petición DELETE
    //    y convertir el Observable resultante a Promise.
    return this.http.delete(url).toPromise();
  }




}
