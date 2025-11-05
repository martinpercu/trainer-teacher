import { Component, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import { environment } from '@env/environment';

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';

import { FormsModule } from '@angular/forms';

import { MessageWaitingComponent } from '@components/message-waiting/message-waiting.component';

import { ChatMessage } from '@models/chatMessage';

import { VisualStatesService } from '@services/visual-states.service';
import { TranslocoPipe } from '@jsverse/transloco';

import { SyncJobComponent } from '@recruiter/sync-job/sync-job.component'


@Component({
  selector: 'app-agent-chat',
  imports: [CommonModule, FormsModule, MatIconModule, MessageWaitingComponent, TranslocoPipe, SyncJobComponent],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLTextAreaElement>;
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  visualStatesService = inject(VisualStatesService);


  userMessage: string = '';

  chatMessages: ChatMessage[] = [];

  loadingResponse: boolean = false;

  showArrowDown: boolean = false;
  userScrolled: boolean = false; // Nueva bandera para controlar el scroll manual


  // start Voice
  speakIsEnabled: boolean = false; // Controla si TTS está activado
  // End Voice

  message_1: string = "Mensage 1"
  message_2: string = "Mensage 2"
  message_3: string = "easy"
  message_4: string = "hard"



  toggleShowLeftMenuHeader() {
    this.visualStatesService.togleShowLeftMenu()
  }


  scrollToBottomFromArrow(): void {
    console.log('SCROLL BOTTOM METHOD');
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }


  adjustHeight(): void {
    const textarea = this.chatInput.nativeElement;
    textarea.style.height = 'auto'; // Reinicia la altura para reducir si es necesario
    textarea.style.height = `${textarea.scrollHeight}px`;
  }

  scrollToBottom(): void {
    if (!this.userScrolled && this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;  // Solo hacer scroll si el usuario no lo ha detenido
    }
  }

  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage(this.userMessage);
    }
  }

  sendMessage(message: string, showUserMessage: boolean = true): void {
    if (message.trim() === "") return;

    this.loadingResponse = true;

    if (showUserMessage) {
      this.chatMessages.push({ role: "user", message });
    }

    console.log('📤 Mensaje enviado:', message);

    // Crear el mensaje del asistente vacío
    const responseMessage = { role: "assistant", message: "" };
    this.chatMessages.push(responseMessage);
    const responseIndex = this.chatMessages.length - 1;

    // Usar EventSource o fetch con streaming
    this.streamResponse(message, responseIndex);

    this.userMessage = "";
    if (showUserMessage) {
      setTimeout(() => {
        this.userMessage = "";
        this.adjustHeight();
      }, 100);
    }

    setTimeout(() => {
      this.scrollToBottomFromArrow();
    }, 100);
  }

  private streamResponse(message: string, responseIndex: number): void {
    const url = `${environment.BACK_AGENT_BRIDGE}/chat_agent/5858/stream`; // ⚠️ Agregar /stream

    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: message })
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');

      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let firstContentReceived = false; // 👈 Nueva bandera

      const readStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log('✅ Stream completado');
            console.log('✅ Stream completado');
            console.log("🎯 ACA YA TENGO TODO EL MENSAJE TERMINADO");
            console.log("📝 Mensaje completo:", this.chatMessages[responseIndex].message);
            const the_message_finished = this.chatMessages[responseIndex].message
            // ✅ Validación correcta
            if (typeof the_message_finished === 'string' && the_message_finished.trim() !== '') {
              this.speakText(the_message_finished);
            }
            // not needed here the this.loadingResponse. Anyway we keep it.
            // this.loadingResponse = false;
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
                  // 🎯 Detener el loading cuando llega el primer contenido
                  if (!firstContentReceived) {
                    this.loadingResponse = false;
                    firstContentReceived = true;
                    console.log('🚀 Primer contenido recibido - loading detenido');
                  }

                  this.chatMessages[responseIndex].message += data.content;
                  this.chatMessages = [...this.chatMessages];
                  this.scrollToBottom();
                } else if (data.type === 'error') {
                  console.error('❌ Error del servidor:', data.message);
                  this.chatMessages[responseIndex].message = "Error getting response. Please try again.";
                  this.loadingResponse = false;
                }
              } catch (e) {
                console.error('Error parsing JSON:', e, line);
              }
            }
          }

          readStream();
        }).catch(error => {
          console.error('❌ Error en stream:', error);
          this.chatMessages[responseIndex].message = "Error getting response. Please try again.";
          this.chatMessages = [...this.chatMessages];
          this.loadingResponse = false;
        });
      };

      readStream();
    })
    .catch(error => {
      console.error('❌ Error en fetch:', error);
      this.chatMessages[responseIndex].message = "Error getting response. Please try again.";
      this.chatMessages = [...this.chatMessages];
      this.loadingResponse = false;
    });
  }

  // sendMessage_no_stream No in use. Anyway keep it
  sendMessage_no_stream(message: string, showUserMessage: boolean = true): void {
    if (message.trim() === "") return;

    this.loadingResponse = true;

    if (showUserMessage) {
      this.chatMessages.push({ role: "user", message });
    }

    console.log('📤 Mensaje enviado:', message);
    console.log('📊 chatMessages antes:', this.chatMessages);

    // Crear el mensaje del asistente vacío
    const responseMessage = { role: "assistant", message: "" };
    this.chatMessages.push(responseMessage);

    console.log('📊 chatMessages después de push:', this.chatMessages);

    const formData = {
      message: message
    };

    this.http.post<string>(`${environment.BACK_AGENT_BRIDGE}/chat_agent/5858`, formData)
      .subscribe({
        next: (response: string) => {
          console.log('✅ Respuesta recibida:', response);
          console.log('📦 Tipo de respuesta:', typeof response);
          console.log('📏 Longitud:', response?.length);


          // CAMBIO AQUÍ: Actualizar el último elemento del array directamente
          const index = this.chatMessages.length - 1;
          this.chatMessages[index] = {
            role: "assistant",
            // message: ''
            message: response.trim()
          };

          // Forzar recreación del array
          this.chatMessages = [...this.chatMessages];

          console.log('💬 Mensaje actualizado');
          console.log('📊 chatMessages después de actualizar:', this.chatMessages);

          this.loadingResponse = false;

          setTimeout(() => this.scrollToBottom(), 10);
          this.speakText(response);
        },
        error: (err) => {
          console.error('❌ Error:', err);
          const index = this.chatMessages.length - 1;
          this.chatMessages[index] = {
            role: "assistant",
            message: "Error getting response. Please try again."
          };
          this.chatMessages = [...this.chatMessages];
          this.loadingResponse = false;
        }
      });

    this.userMessage = "";

    if (showUserMessage) {
      setTimeout(() => {
        this.userMessage = "";
        this.adjustHeight();
      }, 100);
    }

    setTimeout(() => {
      this.scrollToBottomFromArrow();
    }, 100);
  }

  toggleSpeak(): void {
    this.speakIsEnabled = !this.speakIsEnabled;
  }

  // Nueva función para reproducir texto como voz
  speakText(text: string): void {
    // VERY IMPORTANT ===> Clean the tail ==>  LIMPIAR LA COLA DE SPEECH!!!
    window.speechSynthesis.cancel(); // clean the reproduction queu

    if (!this.speakIsEnabled) return; // No reproducir si TTS está desactivado
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // Idioma Inglés (puedes cambiar a 'es-US' u otros)
    utterance.volume = 1; // Volumen (0 a 1)
    utterance.rate = 1; // Velocidad (0.1 a 10)
    utterance.pitch = 1; // Tono (0 a 2)

    // Opcional: Seleccionar una voz específica
    // List of en-US inChrome: 'Samantha', 'Victoria', 'Alex', 'Fred' and 'Google US English'
    const voices = window.speechSynthesis.getVoices();
    console.log('Voces disponibles en speakText:', voices.map(v => v.name)); // Depuración
    const selectedVoice = voices.find(voice => voice.name === 'Samantha'); // Seleccionar Samantha
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log('Voz seleccionada:', selectedVoice.name, selectedVoice.voiceURI);
    } else {
      console.log('the selected voice not found , use en-US by default');
    }

    window.speechSynthesis.speak(utterance);
  }
  // End Voice


}
