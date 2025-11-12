import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { ChatMessage } from '@models/chatMessage';
import { AuthService } from '@services/auth.service';
import { RecruiterService } from '@services/recruiter.service';

@Injectable({
  providedIn: 'root'
})
export class AgentChatService {

  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private recruiterService = inject(RecruiterService);

  private maxThreads!: number;

  constructor() {
    const recruiter = this.recruiterService.recruiterSig()
    console.log(recruiter);

  }


  async getSubscritpionLevel() {
    // Usamos 'await' para esperar que la Promise se resuelva y obtener el valor directo
    console.log(this.recruiterService.currentRecruitersubcriptionLevel());
    const subscriptionLevel = await this.recruiterService.currentRecruitersubcriptionLevel();
    alert('este es el subscription level ' + subscriptionLevel!)
    if (subscriptionLevel) {
      if (subscriptionLevel >= 9) {
        this.maxThreads = 20;
      } else if (subscriptionLevel >= 7) {
        this.maxThreads = 10;
      } else if (subscriptionLevel >= 5) {
        this.maxThreads = 5;
      } else if (subscriptionLevel >= 3) {
        this.maxThreads = 2;
      } else {
        this.maxThreads = 1; // Default para niveles menores a 3
      }
    }
  }

  tester() {
    const aaaa = this.authService.getCurrentUserId()
    console.log(aaaa);
    this.getSubscritpionLevel()
    return this.authService.getCurrentUserId()
  }

  theThreadId() {
    const threadId = `${this.authService.getCurrentUserId()}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    return threadId
  }

  /**
   * Envía un mensaje y recibe la respuesta en modo streaming
   * @param message - Mensaje a enviar
   * @param responseIndex - Índice del mensaje de respuesta en el array
   * @param chatMessages - Referencia al array de mensajes
   * @param onLoadingChange - Callback para cambiar el estado de loading
   * @param onScroll - Callback para hacer scroll
   * @param onSpeakText - Callback para reproducir texto
   */
  streamResponse(
    message: string,
    responseIndex: number,
    chatMessages: ChatMessage[],
    onContentReceived: (content: string) => void,
    onLoadingChange: (loading: boolean) => void,
    onScroll: () => void,
    onSpeakText: (text: string) => void,
    onError: (errorMessage: string) => void
  ): void {
    const threadId = `${this.tester()}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    console.log(threadId);

    const url = `${environment.BACK_AGENT_BRIDGE}/chat_agent/${this.theThreadId()}/stream`;


    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        recruiterId: this.authService.getCurrentUserId(),
        max_threads: this.maxThreads  // 👈 Plan
        // max_threads: 8  // 👈 Plan FREE
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstContentReceived = false;

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('✅ Stream completado');
            console.log("🎯 ACA YA TENGO TODO EL MENSAJE TERMINADO");
            console.log("📝 Mensaje completo:", chatMessages[responseIndex].message);
            const the_message_finished = chatMessages[responseIndex].message;

            if (typeof the_message_finished === 'string' && the_message_finished.trim() !== '') {
              onSpeakText(the_message_finished);
            }
            return;
          }

          // Decodificar el chunk
          buffer += decoder.decode(value, { stream: true });

          // Procesar líneas completas
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));

                if (data.type === 'content') {
                  // Detener el loading cuando llega el primer contenido
                  if (!firstContentReceived) {
                    onLoadingChange(false);
                    firstContentReceived = true;
                    console.log('🚀 Primer contenido recibido - loading detenido');
                  }

                  chatMessages[responseIndex].message += data.content;
                  onContentReceived(data.content);
                  onScroll();
                } else if (data.type === 'error') {
                  console.error('❌ Error del servidor:', data.message);
                  chatMessages[responseIndex].message = "Error getting response. Please try again.";
                  onError("Error getting response. Please try again.");
                  onLoadingChange(false);
                }
              } catch (e) {
                console.error('Error parsing JSON:', e, line);
              }
            }
          }

          readStream();
        }).catch(error => {
          console.error('❌ Error en stream:', error);
          chatMessages[responseIndex].message = "Error getting response. Please try again.";
          onError("Error getting response. Please try again.");
          onLoadingChange(false);
        });
      };

      readStream();
    })
    .catch(error => {
      console.error('❌ Error en fetch:', error);
      chatMessages[responseIndex].message = "Error getting response. Please try again.";
      onError("Error getting response. Please try again.");
      onLoadingChange(false);
    });
  }

  /**
   * Envía un mensaje sin streaming (método alternativo)
   * @param message - Mensaje a enviar
   * @param chatMessages - Referencia al array de mensajes
   * @param onLoadingChange - Callback para cambiar el estado de loading
   * @param onScroll - Callback para hacer scroll
   * @param onSpeakText - Callback para reproducir texto
   */
  sendMessageNoStream(
    message: string,
    chatMessages: ChatMessage[],
    onLoadingChange: (loading: boolean) => void,
    onScroll: () => void,
    onSpeakText: (text: string) => void
  ): void {
    const formData = {
      message: message
    };

    this.http.post<string>(`${environment.BACK_AGENT_BRIDGE}/chat_agent/5858`, formData)
      .subscribe({
        next: (response: string) => {
          console.log('✅ Respuesta recibida:', response);
          console.log('📦 Tipo de respuesta:', typeof response);
          console.log('📏 Longitud:', response?.length);

          // Actualizar el último elemento del array
          const index = chatMessages.length - 1;
          chatMessages[index] = {
            role: "assistant",
            message: response.trim()
          };

          console.log('💬 Mensaje actualizado');
          console.log('📊 chatMessages después de actualizar:', chatMessages);

          onLoadingChange(false);

          setTimeout(() => onScroll(), 10);
          onSpeakText(response);
        },
        error: (err) => {
          console.error('❌ Error:', err);
          const index = chatMessages.length - 1;
          chatMessages[index] = {
            role: "assistant",
            message: "Error getting response. Please try again."
          };
          onLoadingChange(false);
        }
      });
  }

  /**
   * Limpia el historial del chat eliminando todos los checkpoints del thread
   * @param threadId - ID del thread a limpiar (por defecto '5858')
   * @returns Observable con la respuesta del servidor
   */
  clearChatHistory(threadId: string = '5858') {
    const url = `${environment.BACK_AGENT_BRIDGE}/threads/${threadId}`;

    console.log('🗑️ Limpiando historial del thread:', threadId);

    return this.http.delete<{
      status: string;
      thread_id: string;
      checkpoints_deleted?: number;
      writes_deleted?: number;
      message?: string;
    }>(url);
  }
}
