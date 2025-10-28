import { Component, signal, inject, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';

import { environment } from '@env/environment';

import { CommonModule } from '@angular/common';
import { HttpClient, HttpDownloadProgressEvent, HttpEvent, HttpEventType } from '@angular/common/http';

import { MatIconModule } from '@angular/material/icon';

import { FormsModule } from '@angular/forms';

import { MessageWaitingComponent } from '@components/message-waiting/message-waiting.component';

import { ChatMessage } from '@models/chatMessage';

import { VisualStatesService } from '@services/visual-states.service';
import { PagesService } from '@services/pages.service';
import { UserService } from '@services/user.service';
import { TranslocoPipe } from '@jsverse/transloco';


@Component({
  selector: 'app-agent-chat',
  imports: [CommonModule, FormsModule, MatIconModule, MessageWaitingComponent, TranslocoPipe],
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
  startingResponse: boolean = false;

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
    console.log('hello');
    const container = this.messagesContainer.nativeElement;
    container.scrollTop = container.scrollHeight;
  }


  adjustHeight(): void {
    const textarea = this.chatInput.nativeElement;
    textarea.style.height = 'auto'; // Reinicia la altura para reducir si es necesario
    textarea.style.height = `${textarea.scrollHeight}px`;
  }


  handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage(this.userMessage);
    }
  }


  scrollToBottom(): void {
    if (!this.userScrolled && this.messagesContainer) {
      const container = this.messagesContainer.nativeElement;
      container.scrollTop = container.scrollHeight;  // Solo hacer scroll si el usuario no lo ha detenido
    }
  }

  sendMessage(message: string, showUserMessage: boolean = true): void {
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

    this.http.post<string>(`${environment.BACK_CHAT_URL}/chat_agent/5858`, formData)
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


//   sendMessage(message: string, showUserMessage: boolean = true): void {
//   if (message.trim() === "") return;

//   this.loadingResponse = true;

//   if (showUserMessage) {
//     this.chatMessages.push({ role: "user", message });
//   }

//   console.log('📤 Mensaje enviado:', message);
//   console.log('📊 chatMessages antes:', this.chatMessages);

//   // Crear el mensaje del asistente vacío
//   const responseMessage = { role: "assistant", message: "" };
//   this.chatMessages.push(responseMessage);

//   console.log('📊 chatMessages después de push:', this.chatMessages);

//   const formData = {
//     message: message
//   };

//   this.http.post<string>(`${environment.BACK_CHAT_URL}/chat_agent/5858`, formData)
//     .subscribe({
//       next: (response: string) => {
//         console.log('✅ Respuesta recibida:', response);
//         console.log('📦 Tipo de respuesta:', typeof response);
//         console.log('📏 Longitud:', response?.length);

//         responseMessage.message = response.trim();

//         console.log('💬 responseMessage actualizado:', responseMessage);
//         console.log('📊 chatMessages después de actualizar:', this.chatMessages);

//         this.loadingResponse = false;

//         setTimeout(() => this.scrollToBottom(), 10);
//         // this.speakText(response);
//       },
//       error: (err) => {
//         console.error('❌ Error:', err);
//         responseMessage.message = "Error getting response. Please try again.";
//         this.loadingResponse = false;
//       }
//     });

//   this.userMessage = "";

//   if (showUserMessage) {
//     setTimeout(() => {
//       this.userMessage = "";
//       this.adjustHeight();
//     }, 100);
//   }

//   setTimeout(() => {
//     this.scrollToBottomFromArrow();
//   }, 100);
// }

  // sendMessage(message: string, showUserMessage: boolean = true): void {
  // if (message.trim() === "") return;

  // this.loadingResponse = true;

  // if (showUserMessage) {
  //   this.chatMessages.push({ role: "user", message });
  // }

  // const responseMessage = { role: "assistant", message: "" };
  // this.chatMessages.push(responseMessage);

  // const formData = {
  //   message: message
  // };

  // this.http.post<string>(`${environment.BACK_CHAT_URL}/chat_agent/5858`, formData)
  //   .subscribe({
  //     next: (response: string) => {
  //       responseMessage.message = response.trim();
  //       this.loadingResponse = false;
  //       this.scrollToBottom();
  //       this.speakText(response);
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       responseMessage.message = "Error getting response. Please try again.";
  //       this.loadingResponse = false;
  //     }
  //   });

  // this.userMessage = "";

  // if (showUserMessage) {
  //   setTimeout(() => {
  //     this.userMessage = "";
  //     this.adjustHeight();
  //   }, 100);
  // }

  // setTimeout(() => {
  //   this.scrollToBottomFromArrow();
  // }, 100);
  // }


  // sendMessageStreaming(message: string, showUserMessage: boolean = true): void {
  // if (message.trim() === "") return;

  // this.loadingResponse = true;

  // if (showUserMessage) {
  //   this.chatMessages.push({ role: "user", message });
  // }

  // const responseMessage = { role: "assistant", message: "" };
  // this.chatMessages.push(responseMessage);

  // let completeResponse = "";

  // const formData = {
  //   message: message
  // };

  // this.http.post(`${environment.BACK_CHAT_URL}/chat_agent/5858/stream`, formData, {
  //   responseType: 'text',
  //   observe: 'events',
  //   reportProgress: true,
  // })
  //   .subscribe({
  //     next: (event: HttpEvent<string>) => {
  //       if (event.type === HttpEventType.DownloadProgress) {
  //         const rawText = (event as HttpDownloadProgressEvent).partialText ?? "";
  //         completeResponse = rawText.trim();
  //         responseMessage.message = completeResponse;
  //         this.loadingResponse = false;
  //         setTimeout(() => this.scrollToBottom(), 10);
  //       } else if (event.type === HttpEventType.Response) {
  //         completeResponse = (event.body as string)?.trim() || completeResponse;
  //         responseMessage.message = completeResponse;
  //         this.speakText(completeResponse);
  //       }
  //     },
  //     error: (err) => {
  //       console.error('Error:', err);
  //       responseMessage.message = "Error getting response. Please try again.";
  //       this.loadingResponse = false;
  //     }
  //   });

  // this.userMessage = "";

  // if (showUserMessage) {
  //   setTimeout(() => {
  //     this.userMessage = "";
  //     this.adjustHeight();
  //   }, 100);
  // }

  // setTimeout(() => {
  //   this.scrollToBottomFromArrow();
  // }, 100);
  // }




  sendMessageOld_from_teacher_chat(message: string, showUserMessage: boolean = true): void {
    if (message.trim() === "") return;

    this.loadingResponse = true;
    if (showUserMessage) {
      this.chatMessages.push({ role: "user", message });
    }

    const responseMessage = { role: "assistant", message: "" };
    this.chatMessages.push(responseMessage);

    let completeResponse = "";
    let displayedChars = 0;
    let typingInterval: any = null;

    const charsPerTick = 3; // Puedes ajustarlo o hacerlo dinámico más adelante

    const simulateTyping = () => {
      if (displayedChars < completeResponse.length) {
        const nextChunk = Math.min(displayedChars + charsPerTick, completeResponse.length);
        responseMessage.message = completeResponse.substring(0, nextChunk);
        displayedChars = nextChunk;
        this.loadingResponse = false;
        setTimeout(() => this.scrollToBottom(), 10);
      } else {
        clearInterval(typingInterval);
        responseMessage.message = completeResponse;
        this.loadingResponse = false;
        this.startingResponse = false;
      }
    };

    const formData = {
      message,
      session_id: "id-sesson",
      pages: "page para szaber que temario"
    };

    const timeout = setTimeout(() => {
      clearInterval(typingInterval);
      responseMessage.message = completeResponse;
      this.loadingResponse = false;
    }, 10000);

    // this.http.post("https://assistant-chat-backend-production.up.railway.app/stream_chat_test", formData, {
    // this.http.post("http://127.0.0.1:8000/stream_chat_test", formData, {
    this.http.post(`${environment.BACK_CHAT_URL}/chat/5858`, formData, {
      responseType: 'text',
      observe: 'events',
      reportProgress: true,
    })
      .subscribe({
        next: (event: HttpEvent<string>) => {
          if (event.type === HttpEventType.DownloadProgress) {
            const rawText = (event as HttpDownloadProgressEvent).partialText ?? "";
            completeResponse = rawText.trim();
            if (!typingInterval) {
              typingInterval = setInterval(simulateTyping, 80);
            }
          } else if (event.type === HttpEventType.Response) {
            completeResponse = (event.body as string)?.trim() || completeResponse;
            this.speakText(completeResponse); // Solo reproducimos el texto, no lo mostramos
          }
        },
        error: (err) => {
          console.error('Error:', err);
          clearInterval(typingInterval);
          clearTimeout(timeout);
          responseMessage.message = "Error getting response. Please try again.";
          this.loadingResponse = false;
        },
        complete: () => {
          clearTimeout(timeout);
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
