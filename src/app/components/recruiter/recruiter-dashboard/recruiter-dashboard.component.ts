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
import { switchMap, tap, filter, catchError, map } from 'rxjs/operators';
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


  currentView:
    | 'teachers'
    | 'students'
    | 'results'
    | 'config'
    | 'exams'
    | 'jobs'
    | 'jobs_edit'
    | 'candidates' = 'teachers'; // Default to courses

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
              tap((candidates) => {
                this.candidates = candidates; // Assign candidates here
                console.log('Retrieved candidates:', this.candidates);
              }),
              map((candidates) => candidates.map((c) => c.candidateUID)), // Extract UIDs for results
              catchError((error) => {
                console.error('Error fetching candidates:', error);
                return of([]);
              })
            ),
            jobs: this.jobCrudService.getJobs(recruiterUid).pipe( // Fetch jobs
              tap((jobs) => {
                this.jobs = jobs; // Assign jobs here
                console.log('Retrieved jobs:', this.jobs);
              }),
              catchError((error) => {
                console.error('Error fetching jobs:', error);
                return of([]);
              })
            )
          });
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
        next: ({ results: filteredResults, jobs }) => { // Destructure to get both results and jobs
          this.results = filteredResults;
          this.jobs = jobs; // Re-assign jobs (already assigned in tap, but ensures consistency)
          console.log(
            'Results filtered by candidate UIDs:',
            this.results
          );
          console.log('Jobs for recruiter:', this.jobs);
        },
        error: (error) => {
          console.error('Error in main subscription:', error);
        },
        complete: () => {
          console.log('All data subscriptions completed.');
        },
      });
    // this.authService.user$
    //   .pipe(
    //     // Filter out null users (not authenticated)
    //     filter((user) => !!user),
    //     // switchMap to switch from the user observable to the candidate observable
    //     switchMap((user) => {
    //       const uid = user!.uid; // 'user' is guaranteed to be non-null here due to filter
    //       console.log('UID del reclutador:', uid);
    //       return this.candidateService.getCandidatesByRecruiter(uid).pipe(
    //         // Tap to see the candidates before mapping
    //         tap((candidates) => {
    //           this.candidates = candidates;
    //           console.log('Candidatos recuperados:', this.candidates);
    //         }),
    //         // Map the candidates array to an array of their UIDs
    //         map((candidates) => candidates.map((c) => c.candidateUID)),
    //         // Handle case where no candidates are found
    //         catchError((error) => {
    //           console.error('Error al obtener candidatos:', error);
    //           return of([]); // Return an empty array of UIDs
    //         })
    //       );
    //     }),
    //     // switchMap again to switch from candidate UIDs to results
    //     switchMap((candidateUIDs) => {
    //       // If no candidateUIDs, return an empty observable of results
    //       if (candidateUIDs.length === 0) {
    //         console.log('No hay UIDs de candidatos para buscar resultados.');
    //         return of([]);
    //       }
    //       // Call the new service method with the extracted UIDs
    //       return this.resultService.getResultsByUserUIDs(candidateUIDs);
    //     })
    //   )
    //   .subscribe({
    //     next: (filteredResults) => {
    //       this.results = filteredResults;
    //       console.log(
    //         'Resultados filtrados por UID de candidatos:',
    //         this.results
    //       );
    //     },
    //     error: (error) => {
    //       console.error('Error en la suscripción principal:', error);
    //     },
    //     complete: () => {
    //       console.log('Suscripción de resultados completada.');
    //       // Optional: Add logic for when the observable completes
    //     },
    //   });
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


  /**
   * Filters the 'results' array to return only those belonging to a specific candidate.
   * @param candidateUID The UID of the candidate to filter results for.
   * @returns An array of Result objects for the given candidate.
   */
  getResultsForCandidate(candidateUID: string): Result[] {
    return this.results.filter((result) => result.userUID === candidateUID);
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
}
