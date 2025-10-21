import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { environment } from '@env/environment';

import { MatIconModule } from '@angular/material/icon';
import { combineLatest } from 'rxjs';

import { CourseCardComponent } from '@school/course-card/course-card.component';
import { StudentListComponent } from '@school/student-list/student-list.component';

import { CourseService } from '@services/course.service';
import { StudentService } from '@services/student.service';
import { UserService } from '@services/user.service';
import { CourseCrudService } from '@services/course-crud.service';
// import { ResultService } from '@services/result.service';
import { TeacherCrudService } from '@services/teacher-crud.service';
import { ExamCrudService } from '@services/exam-crud.service';
import { JobCrudService } from '@services/job-crud.service';

import { Course } from '@models/course';
import { Student } from '@models/student';
import { User } from '@models/user';
import { Result } from '@models/result';
import { Exam } from '@models/exam';
import { Job } from '@models/job';

import { Observable } from 'rxjs';
import { ExamResultListComponent } from '@school/exam-result-list/exam-result-list.component';
import { Teacher } from '@models/teacher';
import { TeacherListComponent } from '@school/teacher-list/teacher-list.component';
import { ExamsListComponent } from '@school/exams-list/exams-list.component';

import { MenuSettingsComponent } from '@recruiter/menu-settings/menu-settings.component';
import { JobsCrudComponent } from '@recruiter/jobs-crud/jobs-crud.component';
import { ExamCrudComponent } from '@superadmin/exam-crud/exam-crud.component';
import { RecruiterAuthService } from '@services/recruiter-auth.service';

import { CandidatesListComponent } from '@recruiter/candidates-list/candidates-list.component';
import { JobsListComponent } from '@recruiter/jobs-list/jobs-list.component';


import { Candidate } from '@models/candidate';
import { CandidateService } from '@services/candidate.service';
import { RecruiterService } from '@services/recruiter.service';
import { AuthService } from '@services/auth.service';
import { ResultService } from '@services/result.service';

import { TranslocoPipe } from '@jsverse/transloco';

import { of, forkJoin } from 'rxjs'; // Import 'of'
import { switchMap, tap, filter, catchError, map, take } from 'rxjs/operators';
// import { map } from 'rxjs/operators';

@Component({
  selector: 'app-recruiter-dashboard',
  imports: [
    CommonModule,
    MatIconModule,
    JobsCrudComponent,
    ExamCrudComponent,
    MenuSettingsComponent,
    TranslocoPipe,
    CandidatesListComponent,
    StudentListComponent,
    ExamResultListComponent,
    TeacherListComponent,
    ExamsListComponent,
    JobsListComponent
  ],
  templateUrl: './recruiter-dashboard.component.html',
})
export class RecruiterDashboardComponent {
  authService = inject(AuthService);
  examCrudService = inject(ExamCrudService);
  recruiterAuthService = inject(RecruiterAuthService);
  candidateService = inject(CandidateService);
  recruiterService = inject(RecruiterService);
  resultService = inject(ResultService);
  jobCrudService = inject(JobCrudService);

  // exams: Exam[] = [];

  candidates: Candidate[] = [];
  results: Result[] = [];
  jobs: Job[] = [];
  jobsOrderedByCandidates: Job[] = [];


  currentView:
    | 'teachers'
    | 'students'
    | 'results'
    | 'config'
    | 'exams'
    | 'jobs'
    | 'jobs_edit'
    | 'candidates' = 'jobs'; // Default to courses

  showSettingMenu: boolean = false;

  async ngOnInit() {
    this.authService.user$
      .pipe(
        // Ensure user is authenticated
        filter((user) => !!user),
        // switchMap to get the recruiter's UID and then fetch both candidates and jobs
        switchMap((user) => {
          const recruiterUid = user!.uid;
          console.log('Recruiter UID:', recruiterUid);

          // Use forkJoin to fetch candidates and jobs in parallel
          return forkJoin({
            candidates: this.candidateService.getCandidatesByRecruiter(recruiterUid).pipe(
              take(1), // <--- Add take(1) here
              tap((candidates) => {
                this.candidates = candidates; // Assign candidates here
                console.log('Retrieved candidates (inside forkJoin)::', this.candidates);
              }),
              map((candidates) => candidates.map((c) => c.candidateUID)), // Extract UIDs for results
              catchError((error) => {
                console.error('Error fetching candidates (inside forkJoin)::', error);
                return of([]);
              })
            ),
            jobs: this.jobCrudService.getJobs(recruiterUid).pipe( // Fetch jobs
              take(1), // <--- Add take(1) here
              tap((jobs) => {
                this.jobs = jobs; // Assign jobs here
                console.log('Retrieved jobs (inside forkJoin)::', this.jobs);
              }),
              catchError((error) => {
                console.error('Error fetching jobs (inside forkJoin)::', error);
                return of([]);
              })
            )
          }).pipe(
            tap(forkJoinResults => console.log('forkJoin emitted:', forkJoinResults)) // <-- Add this
          );
        }),
        // Now, process the results of forkJoin (which contains candidateUIDs and jobs)
        switchMap(({ candidates, jobs }) => {
          // If no candidateUIDs, return an empty observable of results
          if (candidates.length === 0) {
            console.log('No candidate UIDs to fetch results for.');
            return of({ results: [], jobs: jobs }); // Pass jobs through even if no results
          }
          // Call the service method with the extracted UIDs for results
          return this.resultService.getResultsByUserUIDs(candidates).pipe(
            map(results => ({ results, jobs })) // Combine results with jobs for the next step
          );
        })
      )
      .subscribe({
        next: ({ results: filteredResults, jobs }) => {
          this.results = filteredResults;
          this.jobs = jobs;
          console.log('Results filtered by candidate UIDs:', this.results);
          console.log('Jobs for recruiter:', this.jobs);
          // Llama a la nueva función para ordenar los trabajos
          this.orderJobsByCandidateCount();
        },
        error: (error) => {
          console.error('Error in main subscription:', error);
        },
        complete: () => {
          console.log('All data subscriptions completed.');
        },
      });

  }

  setView(
    view:
      | 'teachers'
      | 'students'
      | 'results'
      | 'config'
      | 'exams'
      | 'jobs'
      | 'jobs_edit'
      | 'candidates'
  ) {
    this.currentView = view;
  }



  switchExpand() {
    this.showSettingMenu = !this.showSettingMenu;
  }

  goToMain() {
    alert('Gracias totales \nNo va a nngun lado');
    // window.open("https://trainer-teacher.web.app", '_blank');
    // window.open(`${environment.BASEURL}`, '_blank');
    // this.router.navigate(['/main']);
  }

  /**
   * Filters the 'results' array to return only those belonging to a specific candidate.
   * @param candidateUID The UID of the candidate to filter results for.
   * @returns An array of Result objects for the given candidate.
   */
  getResultsForCandidate(candidateUID: string): Result[] {
    return this.results.filter((result) => result.userUID === candidateUID);
  }

  /**
   * Filters the 'results' array to return only those belonging to a specific candidate.
   * @param candidateUID The UID of the candidate to filter results for.
   * @returns An array of Result objects for the given candidate.
   */
  getCandidatesForJob(jobId: string): Candidate[] { // Return type should be Candidate[], not Result[]
    return this.candidates.filter((candidate) =>
      // Check if candidate.jobs exists and if the jobId is included in that array
      candidate.jobs && candidate.jobs.includes(jobId)
    );
  }

  /**
   * Returns results associated with candidates of a specific job.
   * @param jobId The ID of the job to filter results for.
   * @returns An array of Result objects.
   */
  getResultsForJobCandidates(jobId: string): Result[] {
    // 1. Get the candidates for the current job
    const candidatesForThisJob = this.getCandidatesForJob(jobId);
    // 2. Extract their UIDs
    const candidateUIDsForJob = candidatesForThisJob.map(
      (candidate) => candidate.candidateUID
    );
    // 3. Filter the global 'results' array based on these UIDs
    return this.results.filter((result) =>
      candidateUIDsForJob.includes(result.userUID)
    );
  }


  /**
   * Obtiene una lista de candidatos que han aprobado el examen para un trabajo específico.
   * Un candidato se considera "aprobado" si tiene un `Result` asociado a ese `jobId`
   * donde `examPassed` es `true`.
   * @param jobId El ID del trabajo.
   * @returns Un array de objetos Candidate que han aprobado el examen para el trabajo dado.
   */
  getApprovedCandidatesForJob(jobId: string): Candidate[] {
    // 1. Encontrar el objeto Job para obtener su examId
    const job = this.jobs.find(j => j.jobId === jobId);
    if (!job || !job.examId) {
      // Si el trabajo no existe o no tiene un examId, no hay candidatos aprobados por examen
      return [];
    }

    // 2. Obtener todos los resultados asociados a los candidatos de este trabajo
    const resultsForJobCandidates = this.getResultsForJobCandidates(jobId);

    // 3. Filtrar los resultados para encontrar aquellos que pasaron el examen y corresponden al examId del trabajo
    const approvedResultsForThisJob = resultsForJobCandidates.filter(result =>
      result.examPassed === true && result.examId === job.examId
    );

    // 4. Extraer los userUID (IDs de candidatos) de los resultados aprobados
    const approvedCandidateUIDs = new Set(approvedResultsForThisJob.map(result => result.userUID));

    // 5. Filtrar la lista global de candidatos para obtener solo los que tienen un UID aprobado
    // Se usa 'this.candidates' para obtener los objetos Candidate completos.
    return this.candidates.filter(candidate =>
      approvedCandidateUIDs.has(candidate.candidateUID)
    );
  }

  /**
   * Orders the 'jobs' array by the number of candidates assigned to each job
   * and assigns the result to 'jobsOrderedByCandidates'.
   * Jobs with more candidates will appear first.
   */
  // orderJobsByCandidateCount(): void {
  //   // Crea una copia de la lista de trabajos para no modificar la original directamente
  //   this.jobsOrderedByCandidates = [...this.jobs];

  //   this.jobsOrderedByCandidates.sort((a, b) => {
  //     const candidatesA = this.getCandidatesForJob(a.jobId).length;
  //     const candidatesB = this.getCandidatesForJob(b.jobId).length;
  //     // Orden descendente: b - a
  //     return candidatesB - candidatesA;
  //   });

  //   console.log('Jobs ordered by candidate count:', this.jobsOrderedByCandidates);
  // }

  //   /**
  //  * Filters the 'jobs' array to include only active jobs (active: true),
  //  * then orders them by the number of candidates assigned to each job,
  //  * and assigns the result to 'jobsOrderedByCandidates'.
  //  * Jobs with more candidates will appear first.
  //  */
  // orderJobsByCandidateCount(): void {
  //   // 1. Filtrar solo los trabajos activos
  //   const activeJobs = this.jobs.filter(job => job.active === true);

  //   // 2. Crear una copia de los trabajos activos para ordenar
  //   this.jobsOrderedByCandidates = [...activeJobs];

  //   // 3. Ordenar los trabajos activos por la cantidad de candidatos
  //   this.jobsOrderedByCandidates.sort((a, b) => {
  //     const candidatesA = this.getCandidatesForJob(a.jobId).length;
  //     const candidatesB = this.getCandidatesForJob(b.jobId).length;
  //     // Orden descendente: b - a
  //     return candidatesB - candidatesA;
  //   });

  //   console.log('Jobs filtered (active) and ordered by candidate count:', this.jobsOrderedByCandidates);
  // }

    orderJobsByCandidateCount(): void {
    // 1. Dividir los trabajos en activos e inactivos
    const activeJobs = this.jobs.filter(job => job.active === true);
    const inactiveJobs = this.jobs.filter(job => job.active === false);

    // Función auxiliar para ordenar por cantidad de candidatos (descendente)
    const sortByCandidateCount = (jobsArray: Job[]): Job[] => {
      // Crear una copia para ordenar y no mutar el array original
      return [...jobsArray].sort((a, b) => {
        const candidatesA = this.getCandidatesForJob(a.jobId).length;
        const candidatesB = this.getCandidatesForJob(b.jobId).length;
        return candidatesB - candidatesA; // Orden descendente (más candidatos primero)
      });
    };

    // 2. Ordenar los trabajos activos
    const sortedActiveJobs = sortByCandidateCount(activeJobs);

    // 3. Ordenar los trabajos inactivos
    const sortedInactiveJobs = sortByCandidateCount(inactiveJobs);

    // 4. Combinar las listas: activos primero, luego inactivos
    this.jobsOrderedByCandidates = [...sortedActiveJobs, ...sortedInactiveJobs];

    console.log('Jobs ordered (Active first, then Inactive, both by candidate count):', this.jobsOrderedByCandidates);
  }



}
