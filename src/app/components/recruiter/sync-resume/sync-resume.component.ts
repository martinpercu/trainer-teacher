
import { Component, inject } from '@angular/core';
import { AuthService } from '@services/auth.service';
import { ResumeService } from '@services/resume.service';
import { AgentSyncService } from '@services/agent-sync.service';
import { firstValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-sync-resume',
  imports: [],
  templateUrl: './sync-resume.component.html'
})
export class SyncResumeComponent {
  authService = inject(AuthService);
  resumeService = inject(ResumeService);
  agentSyncService = inject(AgentSyncService);

  userId = this.authService.getCurrentUserId();

  syncing = false;


    async syncAllResumeToAgent() {
      this.syncing = true;

      if(this.userId) {
        try {
          // Obtener jobs del owner actual
          const allResumes = await firstValueFrom(
            this.resumeService.getResumesForRecruiter(this.userId)
          );

          // ← AGREGAR ESTO PARA VER QUÉ SE ENVÍA
          const payload = {
            resumes: allResumes.map(r => ({
              resumeId: r.resumeId,
              candidateUID: r.candidateUID,
              recruiterId: r.recruiterId,
              jobRelated: r.jobRelated,
              scoreToPosition: r.scoreToPosition,
              thumbUp: r.thumbUp,
              name: r.name,
              email: r.email,
              phone: r.phone,
              city: r.city,
              zipcode: r.zipcode,
              summary: r.summary,
              skills: r.skills || [],
              languages: r.languages || [],
              works: r.works || [],
              certifications: r.certifications || [],
              education: r.education || []
            }))
          };

          console.log('📤 Payload que se va a enviar:', JSON.stringify(payload, null, 2));



          console.log('🔍 Jobs obtenidos de Firebase:', allResumes.length);
          console.log('📦 Datos completos:', allResumes);

          // ← AGREGAR ESTE CHECK
          if (allResumes.length === 0) {
            alert('⚠️ No hay jobs para sincronizar');
            this.syncing = false;
            return;
          }


          const result = await this.agentSyncService.syncResumes(allResumes);

          alert(`✅ ${allResumes.length} jobs sincronizados correctamente`);

        } catch (error) {
          console.error('Error sincronizando:', error);
          // ← AGREGAR ESTO PARA VER EL DETALLE DEL ERROR
          if (error instanceof HttpErrorResponse) {
            console.error('📛 Detalle del error 422:', error.error);
          }
          alert('❌ Error al sincronizar jobs');
        } finally {
          this.syncing = false;
        }
      }

    }

    async syncOneResumeToAgent() {
      this.syncing = true;

      const theResume = await this.resumeService.getResumeByIdRaw("Sy9BXQge6OeimsT5toNm")
      console.log(theResume);

      const result = await this.agentSyncService.syncResumes([theResume]);
      console.log(result);

      this.syncing = false;
    }



    async syncDeleteOneResumeToAgent() {

      // 2. LLAMADA A FASTAPI/AGENTE AI (DB Secundaria)
      try {
          // Usamos await porque deleteJobFromAgent devuelve una Promise (por .toPromise())
          await this.agentSyncService.deleteResumeFromAgent("8AG4N29gtTdDWF7pDXu8");
          console.log('✅ Job eliminado del Agente AI exitosamente.');
          // alert('✅ Job eliminado del Agente AI exitosamente.');

      } catch (error) {
          // Si el Agente AI no lo encuentra o falla por otra razón,
          // registramos el error pero no bloqueamos el flujo, pues ya se eliminó de la fuente principal.
          console.error('⚠️ Error al eliminar job en Agente AI:', error);
      }

    }
    // En tu componente .ts
    // Suponiendo que tienes inyectado el AgentSyncService
    // constructor(private agentSyncService: AgentSyncService) {}

    async handleAgentToggle(resumeId: string, useWithAgent: boolean) {
      if (!useWithAgent) { // Si el usuario desmarca la opción
        try {
          console.log(`Intentando eliminar job ${resumeId} del agente AI...`);

          // La llamada al servicio
          await this.agentSyncService.deleteResumeFromAgent(resumeId);

          console.log(`✅ Job ${resumeId} eliminado correctamente del agente AI.`);
          // Opcional: mostrar una notificación al usuario

        } catch (error) {
          console.error(`❌ Error al eliminar job ${resumeId} del agente AI:`, error);
          // Opcional: Manejar el error, como un 404 si ya no existía
        }
      }
    }


    async runMigration() {
    console.log("Iniciando la migración de datos...");
    try {
      // Llama a la nueva función del servicio
      await this.resumeService.migrateResumesAddId();
      alert('¡Migración de IDs completada!');

      // ⚠️ IMPORTANTE: Deshabilita o elimina esta llamada después de verificar que funcionó.

    } catch (error) {
      console.error('Fallo la migración:', error);
      alert('Hubo un error en la migración. Revisa la consola.');
    }
  }
}
