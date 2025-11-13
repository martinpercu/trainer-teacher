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

  // Seleccionar un thread
  selectThread(threadId: string) {
    this.agentChatListService.selectThread(threadId);
  }

}
