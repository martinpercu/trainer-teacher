// import { Component, OnInit, inject } from '@angular/core';
// import { Auth, authState } from '@angular/fire/auth';
// import { Observable, of } from 'rxjs';
// import { catchError } from 'rxjs/operators';
// import { FormsModule } from '@angular/forms';
// import { CommonModule, AsyncPipe } from '@angular/common';

// import { JobCrudService } from '@services/job-crud.service';
// import { Job } from '@models/job';
// import { ExamCrudService } from '@services/exam-crud.service';
// import { Exam } from '@models/exam';
import { Component, OnInit, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FormsModule } from '@angular/forms';
import { CommonModule, AsyncPipe } from '@angular/common';

import { JobCrudService } from '@services/job-crud.service';
import { Job } from '@models/job';
import { ExamCrudService } from '@services/exam-crud.service';
import { Exam } from '@models/exam';


@Component({
  selector: 'app-jobs-crud',
  imports: [FormsModule, CommonModule, AsyncPipe],
  templateUrl: './jobs-crud.component.html',
})
export class JobsCrudComponent {


  // --- Inyección de Dependencias ---
  auth = inject(Auth);
  jobCrudService = inject(JobCrudService);
  examCrudService = inject(ExamCrudService);

  // --- Propiedades del Componente ---
  jobs$!: Observable<Job[]>;
  exams$!: Observable<Exam[]>;

  // Modelo del formulario, ahora incluye los nuevos campos
  newJob: Partial<Job> = {
    name: '',
    description: '',
    ownerId: '',
    active: true, // Valor por defecto para nuevos trabajos
    examId: '',
    examActive: false,
  };

  errorMessage: string = '';
  editingJobId: string | undefined = undefined;
  selectedJobId: string = '';
  isAuthenticated: boolean = false;
  private recruiterId!: string;

  ngOnInit() {
    authState(this.auth).subscribe((user) => {
      this.isAuthenticated = !!user;
      if (user && user.uid) {
        this.recruiterId = user.uid;
      }

      if (!this.isAuthenticated) {
        this.errorMessage = 'Debes iniciar sesión para acceder a los trabajos';
        this.jobs$ = of([]);
        return;
      }

      // Cargar trabajos y exámenes del reclutador
      this.jobs$ = this.jobCrudService.getJobs(this.recruiterId).pipe(
        catchError((error) => {
          console.error('Error al cargar trabajos:', error);
          this.errorMessage = 'Error al cargar trabajos: permisos insuficientes';
          return of([]);
        })
      );

      this.exams$ = this.examCrudService.getExamsByRecruiterId(this.recruiterId).pipe(
        catchError((error) => {
            console.error('Error al cargar exámenes:', error);
            // Opcional: mostrar un mensaje si falla la carga de exámenes
            return of([]);
        })
      );
    });
  }

  // --- Funciones CRUD ---

  loadJob(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const jobId = selectElement.value;
    this.selectedJobId = jobId;

    if (jobId) {
      this.jobCrudService.getJobById(jobId).subscribe({
        next: (job) => {
          if (job) {
            // Poblar el formulario con todos los datos del trabajo, incluyendo los nuevos
            this.newJob = {
              name: job.name,
              description: job.description,
              ownerId: job.ownerId, // Usar el ownerId del trabajo cargado
              active: job.active || false, // Fallback a false si no está definido
              examId: job.examId || '', // Fallback a string vacío
              examActive: job.examActive || false, // Fallback a false
            };
            this.editingJobId = jobId;
            this.errorMessage = '';
          } else {
            this.errorMessage = 'Trabajo no encontrado';
            this.resetForm();
          }
        },
        error: (error) => {
          console.error('Error al cargar el trabajo:', error);
          this.errorMessage = 'Error al cargar el trabajo: permisos insuficientes';
          this.resetForm();
        },
      });
    } else {
      this.resetForm();
    }
  }

  saveJob() {
    if (!this.isAuthenticated) {
      this.errorMessage = 'Debes iniciar sesión para realizar esta acción';
      return;
    }

    if (!this.newJob.name?.trim() || !this.newJob.description?.trim()) {
      this.errorMessage = 'El nombre y la descripción son requeridos';
      return;
    }

    // El chequeo de nombre existente se mantiene igual
    this.jobCrudService.checkJobNameExists(this.newJob.name, this.editingJobId).subscribe({
      next: (exists) => {
        if (exists) {
          this.errorMessage = 'Ya existe un trabajo con este nombre';
          return;
        }

        // Construir el objeto con todos los datos del formulario
        const jobData: Partial<Job> = {
          name: this.newJob.name!.trim(),
          description: this.newJob.description!.trim(),
          active: this.newJob.active,
          examId: this.newJob.examId,
          examActive: !!this.newJob.examId && this.newJob.examActive, // examActive solo puede ser true si hay un examId
        };

        if (this.editingJobId) {
          // Lógica de Actualización
          if (this.newJob.ownerId !== this.recruiterId) {
            this.errorMessage = 'No tienes permisos para editar este trabajo.';
            return;
          }
          this.jobCrudService.updateJob(this.editingJobId, jobData).subscribe({
            next: () => this.resetForm(),
            error: (err) => {
              console.error('Error al actualizar:', err);
              this.errorMessage = 'Error al actualizar el trabajo.';
            }
          });
        } else {
          // Lógica de Creación
          jobData.ownerId = this.recruiterId; // Asignar propietario
          this.jobCrudService.createJob(jobData as Job).subscribe({
            next: () => this.resetForm(),
            error: (err) => {
                console.error('Error al crear:', err);
                this.errorMessage = 'Error al crear el trabajo.';
            }
          });
        }
      },
      error: (error) => {
        console.error('Error al verificar el nombre:', error);
        this.errorMessage = 'Error al verificar el nombre del trabajo';
      }
    });
  }

  deleteJob() {
    if (!this.isAuthenticated || !this.editingJobId) return;

    if (this.newJob.ownerId !== this.recruiterId) {
      this.errorMessage = 'No tienes permisos para eliminar este trabajo.';
      return;
    }
    // NOTA: Reemplazar confirm por un modal custom en una app real
    if (confirm('¿Estás seguro de que quieres eliminar este trabajo?')) {
      this.jobCrudService.deleteJob(this.editingJobId).subscribe({
        next: () => this.resetForm(),
        error: (err) => {
            console.error('Error al eliminar:', err);
            this.errorMessage = 'Error al eliminar el trabajo.';
        }
      });
    }
  }

  // --- Funciones Auxiliares ---

  resetForm() {
    this.newJob = {
      name: '',
      description: '',
      ownerId: '',
      active: true, // Valor por defecto
      examId: '',
      examActive: false,
    };
    this.editingJobId = undefined;
    this.selectedJobId = '';
    this.errorMessage = '';
  }
}


//   auth = inject(Auth);
//   jobCrudService = inject(JobCrudService);
//   examCrudService = inject(ExamCrudService);

//   jobs$!: Observable<Job[]>;
//   newJob: Partial<Job> = {
//     name: '',
//     description: '',
//     ownerId: '', // <-- Inicializa ownerId
//   };
//   exams$!: Observable<Exam[]>;
//   errorMessage: string = '';
//   editingJobId: string | undefined = undefined;
//   selectedJobId: string = '';
//   isAuthenticated: boolean = false;
//   private recruiterId!: string;

//   async ngOnInit() {
//     authState(this.auth).subscribe((user) => {
//       this.isAuthenticated = !!user;
//       console.log(user);
//       if (user && user.uid) {
//         this.recruiterId = user.uid;
//         console.log(this.recruiterId);
//       }

//       if (!this.isAuthenticated) {
//         this.errorMessage = 'Debes iniciar sesión para acceder a los trabajos';
//         this.jobs$ = of([]);
//         return;
//       }

//       this.jobs$ = this.jobCrudService.getJobs(this.recruiterId).pipe(
//         // <-- Usa el servicio para obtener trabajos
//         catchError((error) => {
//           console.error('Error al cargar trabajos:', error);
//           this.errorMessage =
//             'Error al cargar trabajos: permisos insuficientes';
//           return of([]);
//         })
//       );

//       console.log(this.jobs$);

//       console.log(this.recruiterId);

//       this.exams$ = this.examCrudService.getExamsByRecruiterId(this.recruiterId);
//       console.log(this.exams$);
//     });
//   }

//   // --- Funciones CRUD ---

//   loadJob(event: Event) {
//     const selectElement = event.target as HTMLSelectElement;
//     const jobId = selectElement.value;
//     this.selectedJobId = jobId;

//     if (jobId) {
//       this.jobCrudService.getJobById(jobId).subscribe({
//         // <-- Usa el servicio para cargar un trabajo
//         next: (job) => {
//           if (job) {
//             this.newJob = {
//               name: job.name,
//               description: job.description,
//               ownerId: this.recruiterId
//             };
//             this.editingJobId = jobId;
//             this.errorMessage = '';
//           } else {
//             this.errorMessage = 'Trabajo no encontrado';
//             this.resetForm();
//           }
//         },
//         error: (error) => {
//           console.error('Error al cargar el trabajo:', error);
//           this.errorMessage =
//             'Error al cargar el trabajo: permisos insuficientes';
//           this.resetForm();
//         },
//       });
//     } else {
//       this.resetForm();
//     }
//   }



//   saveJob() {
//     if (!this.isAuthenticated) {
//       this.errorMessage = 'Debes iniciar sesión para realizar esta acción';
//       return;
//     }

//     if (!this.newJob.name?.trim()) {
//       this.errorMessage = 'El nombre es requerido';
//       return;
//     }
//     if (!this.newJob.description?.trim()) {
//       this.errorMessage = 'La descripción es requerida';
//       return;
//     }

//     this.jobCrudService.checkJobNameExists(this.newJob.name, this.editingJobId).subscribe({
//       next: (exists) => {
//         if (exists) {
//           this.errorMessage = 'Ya existe un trabajo con este nombre';
//           return;
//         }

//         const jobData: Partial<Job> = {
//           name: this.newJob.name!.trim(),
//           description: this.newJob.description!.trim()
//         };

//         if (this.editingJobId) {
//           // Si estamos editando, verifica que el usuario actual sea el propietario
//           if (this.newJob.ownerId !== this.recruiterId) {
//             this.errorMessage = 'No tienes permisos para editar este trabajo.';
//             return;
//           }
//           this.jobCrudService.updateJob(this.editingJobId, jobData).subscribe({
//             next: (success) => {
//               if (success) {
//                 this.resetForm();
//               } else {
//                 this.errorMessage = 'Error al actualizar el trabajo';
//               }
//             },
//             error: (error) => {
//               console.error('Error al actualizar el trabajo:', error);
//               this.errorMessage = 'Error al actualizar el trabajo: permisos insuficientes';
//             }
//           });
//         } else {
//           // Al crear, asigna el ownerId del usuario actual
//           jobData.ownerId = this.recruiterId;
//           this.jobCrudService.createJob(jobData).subscribe({
//             next: (id) => {
//               if (id) {
//                 this.resetForm();
//               } else {
//                 this.errorMessage = 'Error al crear el trabajo';
//               }
//             },
//             error: (error) => {
//               console.error('Error al crear el trabajo:', error);
//               this.errorMessage = 'Error al crear el trabajo: permisos insuficientes';
//             }
//           });
//         }
//       },
//       error: (error) => {
//         console.error('Error al verificar el nombre:', error);
//         this.errorMessage = 'Error al verificar el nombre del trabajo';
//       }
//     });
//   }

//   deleteJob() {
//     if (!this.isAuthenticated) {
//       this.errorMessage = 'Debes iniciar sesión para realizar esta acción';
//       return;
//     }

//     if (this.editingJobId) {
//       // Verifica que el usuario actual sea el propietario antes de intentar eliminar
//       if (this.newJob.ownerId !== this.recruiterId) {
//         this.errorMessage = 'No tienes permisos para eliminar este trabajo.';
//         return;
//       }

//       const confirmDelete = confirm('¿Estás seguro de que quieres eliminar este trabajo?');
//       if (confirmDelete) {
//         this.jobCrudService.deleteJob(this.editingJobId).subscribe({
//           next: (success) => {
//             if (success) {
//               this.resetForm();
//             } else {
//               this.errorMessage = 'Error al eliminar el trabajo';
//             }
//           },
//           error: (error) => {
//             console.error('Error al eliminar el trabajo:', error);
//             this.errorMessage = 'Error al eliminar el trabajo: permisos insuficientes';
//           }
//         });
//       }
//     }
//   }

//   // --- Funciones Auxiliares ---

//   resetForm() {
//     this.newJob = {
//       name: '',
//       description: '',
//       ownerId: '' // Limpia el ownerId al resetear
//     };
//     this.editingJobId = undefined;
//     this.selectedJobId = '';
//     this.errorMessage = '';
//   }

//   // Helper para deshabilitar botones si el usuario no es el propietario
//   isOwner(): boolean {
//     return this.isAuthenticated && this.recruiterId === this.newJob.ownerId;
//   }
// }
