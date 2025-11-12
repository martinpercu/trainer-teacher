import { Component, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { FormsModule } from '@angular/forms';

import { MessageWaitingComponent } from '@components/message-waiting/message-waiting.component';

import { ChatMessage } from '@models/chatMessage';

import { VisualStatesService } from '@services/visual-states.service';
import { AgentChatService } from '@services/agent-chat.service';
import { TranslocoPipe } from '@jsverse/transloco';

import { SyncJobComponent } from '@recruiter/sync-job/sync-job.component';
import { SyncResumeComponent } from '@recruiter/sync-resume/sync-resume.component';


@Component({
  selector: 'app-agent-chat',
  imports: [CommonModule, FormsModule, MatIconModule, MessageWaitingComponent, TranslocoPipe, SyncJobComponent, SyncResumeComponent],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLTextAreaElement>;
  private cdr = inject(ChangeDetectorRef);

  visualStatesService = inject(VisualStatesService);
  agentChatService = inject(AgentChatService);


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

    // Usar el servicio para el streaming
    this.agentChatService.streamResponse(
      message,
      responseIndex,
      this.chatMessages,
      (content) => {
        // Callback cuando llega contenido - forzar detección de cambios
        this.chatMessages = [...this.chatMessages];
      },
      (loading) => {
        this.loadingResponse = loading;
      },
      () => this.scrollToBottom(),
      (text) => this.speakText(text),
      (errorMessage) => {
        // Callback de error - forzar detección de cambios
        this.chatMessages = [...this.chatMessages];
      }
    );

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

  clearChatHistory(): void {
    const threadId = '5858'; // Hardcoded por ahora

    // Limpiar mensajes en el frontend inmediatamente
    this.chatMessages = [];

    // Llamar al servicio para borrar el historial del thread
    this.agentChatService.clearChatHistory(threadId).subscribe({
      next: (response) => {
        console.log('✅ Historial borrado correctamente:', response);

        if (response.status === 'deleted') {
          console.log(`🗑️ Checkpoints eliminados: ${response.checkpoints_deleted}`);
          console.log(`🗑️ Writes eliminados: ${response.writes_deleted}`);
        } else if (response.status === 'not_found') {
          console.log('ℹ️ Thread no encontrado en la base de datos');
        }
      },
      error: (err) => {
        console.error('❌ Error al borrar historial:', err);
        // Los mensajes ya se limpiaron en el frontend
        // Podrías mostrar un toast/notification al usuario si quieres
      }
    });
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

  testElChabon() {
    const test = this.agentChatService.tester()
    console.log(test);
  }

}
