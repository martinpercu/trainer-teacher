import { Component, inject } from '@angular/core';
import { VisualStatesService } from '@services/visual-states.service';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-agent-chats-list',
  imports: [CommonModule, MatIconModule, TranslocoPipe],
  templateUrl: './agent-chats-list.component.html'
})
export class AgentChatsListComponent {
  visualStatesService = inject(VisualStatesService);



  chatItems = [
    { text: 'Buenos dias' },
    { text: 'Estamos aca' },
    { text: 'Me llamo roque' }
  ];
}
