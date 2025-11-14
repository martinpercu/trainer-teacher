import { Component, inject } from '@angular/core';
import { VisualStatesService } from '@services/visual-states.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

import { AgentChatListService, ChatThread } from '@services/agent-chat-list.service';

@Component({
  selector: 'app-agent-chats-list',
  imports: [CommonModule, MatIconModule, TranslocoPipe],
  templateUrl: './agent-chats-list.component.html'
})
export class AgentChatsListComponent {
  visualStatesService = inject(VisualStatesService);
  agentChatListService = inject(AgentChatListService);

  // Obtener threads desde el servicio
  get chatThreads(): ChatThread[] {
    return this.agentChatListService.getThreads();
  }

  // Obtener el thread actual
  get currentThreadId(): string | null {
    return this.agentChatListService.getCurrentThreadId();
  }

  // Verificar si se puede crear un nuevo thread
  get canCreateNewThread(): boolean {
    const threads = this.agentChatListService.getThreads();
    const maxThreads = this.agentChatListService.getMaxThreads();
    return threads.length < maxThreads;
  }

  // Verificar si se alcanzó el máximo de threads
  get isMaxThreadsReached(): boolean {
    return !this.canCreateNewThread;
  }

  // Seleccionar un thread
  selectThread(threadId: string) {
    this.agentChatListService.selectThread(threadId);
  }

  // Método para el botón "ADD NEW CHAT"
  onAddNewChat(): void {
    if (this.isMaxThreadsReached) {
      console.log('❌ Máximo de threads alcanzado');
      return;
    }

    console.log('➕ Preparando nuevo chat...');

    // Deseleccionar thread actual (limpia pantalla)
    this.agentChatListService.deselectThread();

    // Cerrar el sidebar de la lista
    this.visualStatesService.handleShowChatList();

    console.log('✅ Listo para crear nuevo chat. Envía un mensaje para crearlo.');
  }

}
