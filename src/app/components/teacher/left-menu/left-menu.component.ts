import { Component, inject } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';

import { PagesService } from '@services/pages.service';

@Component({
  selector: 'app-left-menu',
  standalone: true,
  imports: [CommonModule, KeyValuePipe],
  templateUrl: './left-menu.component.html'
})
export class LeftMenuComponent {
  pagesService = inject(PagesService);

  // bookIndex = this.pagesService.getIndexSubtext();
  // Usar la señal indexSubtext para reactividad
  bookIndex = this.pagesService.indexSubtext;
  boldKey: string | null = null;

  toggleBold(key: string, value: string) {
    this.boldKey = this.boldKey === key ? null : key;
    console.log(key);
    this.pagesService.definePages(key, value);
  }

  selectAll() {
    this.pagesService.defineAll();
    console.log(this.pagesService.pagesSelected());
    this.boldKey = null;
  }

}
