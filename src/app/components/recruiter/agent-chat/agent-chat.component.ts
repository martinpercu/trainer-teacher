import { Component, inject, ViewChild, ElementRef, ChangeDetectorRef, OnInit, effect } from '@angular/core';

import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';

import { FormsModule } from '@angular/forms';

import { MessageWaitingComponent } from '@components/message-waiting/message-waiting.component';

import { ChatMessage } from '@models/chatMessage';

import { VisualStatesService } from '@services/visual-states.service';
import { AgentChatService } from '@services/agent-chat.service';
import { AgentChatListService } from '@services/agent-chat-list.service';
import { TranslocoPipe } from '@jsverse/transloco';

import { SyncJobComponent } from '@recruiter/sync-job/sync-job.component';
import { SyncResumeComponent } from '@recruiter/sync-resume/sync-resume.component';
import { AgentChatsListComponent } from '@recruiter/agent-chats-list/agent-chats-list.component';


@Component({
  selector: 'app-agent-chat',
  imports: [CommonModule, FormsModule, MatIconModule, MessageWaitingComponent, TranslocoPipe, SyncJobComponent, SyncResumeComponent, AgentChatsListComponent],
  templateUrl: './agent-chat.component.html',
  styleUrl: './agent-chat.component.css'
})
export class AgentChatComponent implements OnInit {

  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('chatInput') chatInput!: ElementRef<HTMLTextAreaElement>;
  private cdr = inject(ChangeDetectorRef);

  visualStatesService = inject(VisualStatesService);
  agentChatService = inject(AgentChatService);
  agentChatListService = inject(AgentChatListService);


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

  // Para rastrear el thread anterior
  private previousThreadId: string | null = null;

  constructor() {
    // 👂 Escuchar cambios en el threadId seleccionado
    effect(() => {
      const threadId = this.agentChatListService.currentThreadId();
      if (threadId) {
        this.loadMessagesForThread(threadId);
      }
    });
  }

  ngOnInit(): void {
    // El effect ya se encargará de cargar los mensajes iniciales
  }

  /**
   * Carga los mensajes para un thread específico usando estrategia híbrida:
   * 1. Muestra inmediatamente mensajes del caché (si existen)
   * 2. En paralelo, pide al backend el historial
   * 3. Actualiza con los mensajes del backend
   * @param threadId - ID del thread
   */
  private loadMessagesForThread(threadId: string): void {
    console.log('🔄 Cambiando a thread:', threadId);

    // Guardar los mensajes actuales en el caché del thread anterior (si existe)
    if (this.previousThreadId && this.previousThreadId !== threadId && this.chatMessages.length > 0) {
      console.log(`💾 Guardando ${this.chatMessages.length} mensajes del thread anterior: ${this.previousThreadId}`);
      this.agentChatListService.saveMessagesToCache(this.previousThreadId, this.chatMessages);
    }

    // 1️⃣ PASO 1: Cargar inmediatamente desde caché (respuesta instantánea)
    const cachedMessages = this.agentChatListService.getMessagesFromCache(threadId);
    if (cachedMessages.length > 0) {
      console.log(`⚡ Mostrando ${cachedMessages.length} mensajes desde caché`);
      this.chatMessages = [...cachedMessages];
      setTimeout(() => this.scrollToBottomFromArrow(), 100);
    } else {
      // Si no hay caché, limpiar la pantalla
      this.chatMessages = [];
    }

    // 2️⃣ PASO 2: Pedir al backend en paralelo (para sincronizar)
    console.log('🌐 Solicitando historial al backend...');
    this.agentChatService.getThreadHistory(threadId, 50).subscribe({
      next: (response) => {
        console.log(`✅ Historial recibido del backend: ${response.messages.length} mensajes`);

        // Actualizar con los mensajes del backend
        this.chatMessages = [...response.messages];

        // Guardar en caché para la próxima vez
        this.agentChatListService.saveMessagesToCache(threadId, response.messages);

        // Hacer scroll al final
        setTimeout(() => this.scrollToBottomFromArrow(), 100);
      },
      error: (err) => {
        console.error('❌ Error al obtener historial del backend:', err);
        // Si falla, mantener los mensajes del caché (si los había)
        if (cachedMessages.length === 0) {
          console.log('ℹ️ No hay mensajes en caché ni en el backend para este thread');
        } else {
          console.log('ℹ️ Manteniendo mensajes del caché a pesar del error');
        }
      }
    });

    // Actualizar el thread anterior
    this.previousThreadId = threadId;
  }

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

    // Obtener el threadId actual del servicio
    const threadId = this.agentChatListService.getCurrentThreadId();
    if (!threadId) {
      console.error('❌ No hay threadId seleccionado');
      return;
    }

    // Mover este thread al principio de la lista (más reciente)
    this.agentChatListService.moveThreadToTop(threadId);

    this.loadingResponse = true;

    if (showUserMessage) {
      this.chatMessages.push({ role: "user", message });
    }

    console.log('📤 Mensaje enviado:', message);
    console.log('🔵 ThreadId usado:', threadId);

    // Crear el mensaje del asistente vacío
    const responseMessage = { role: "assistant", message: "" };
    this.chatMessages.push(responseMessage);
    const responseIndex = this.chatMessages.length - 1;

    // Usar el servicio para el streaming
    this.agentChatService.streamResponse(
      message,
      threadId,
      responseIndex,
      this.chatMessages,
      (content) => {
        // Callback cuando llega contenido - forzar detección de cambios
        this.chatMessages = [...this.chatMessages];
        // 💾 Guardar en caché cada vez que llega contenido
        this.agentChatListService.saveMessagesToCache(threadId, this.chatMessages);
      },
      (loading) => {
        this.loadingResponse = loading;
        // 💾 Guardar en caché cuando termina el loading
        if (!loading) {
          this.agentChatListService.saveMessagesToCache(threadId, this.chatMessages);
        }
      },
      () => this.scrollToBottom(),
      (text) => this.speakText(text),
      (errorMessage) => {
        // Callback de error - forzar detección de cambios
        this.chatMessages = [...this.chatMessages];
        // 💾 Guardar en caché incluso si hay error
        this.agentChatListService.saveMessagesToCache(threadId, this.chatMessages);
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
    const threadId = this.agentChatListService.getCurrentThreadId();
    if (!threadId) {
      console.error('❌ No hay threadId seleccionado');
      return;
    }

    console.log('🗑️ Limpiando historial del thread:', threadId);

    // Limpiar mensajes en el frontend inmediatamente
    this.chatMessages = [];

    // 💾 Limpiar también el caché del thread
    this.agentChatListService.clearThreadCache(threadId);

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

  // testElChabon() {
  //   const test = this.agentChatService.tester()
  //   console.log(test);
  // }

}
