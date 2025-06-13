import { Component, inject } from '@angular/core';

import { VisualStatesService } from '@services/visual-states.service';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-modalhowitworks',
  imports: [MatIconModule],
  templateUrl: './modalhowitworks.component.html',
  styleUrl: './modalhowitworks.component.css'
})
export class ModalhowitworksComponent {

  visualStatesService = inject(VisualStatesService);

  closeModal() {
    this.visualStatesService.showModalInfo.set(false)
  };

}
