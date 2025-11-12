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

  menuItems = [
    { icon: 'robot_2', translationKey: 'top_right.dark', action: 'dark' },
    { icon: 'robot_2', translationKey: 'top_right.light', action: 'light' },
    { icon: 'robot_2', translationKey: 'top_right.logout', action: 'logout' }
  ];

  handleMenuClick(action: string) {
    switch(action) {
      case 'dark':
        // TODO: Implementar lógica para modo oscuro
        console.log('Dark mode clicked');
        break;
      case 'light':
        // TODO: Implementar lógica para modo claro
        console.log('Light mode clicked');
        break;
      case 'logout':
        // TODO: Implementar lógica para logout
        console.log('Logout clicked');
        break;
    }
  }
}
