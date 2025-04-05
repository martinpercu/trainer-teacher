import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesService } from '@services/pages.service';

@Component({
  selector: 'app-left-menu',
  imports: [CommonModule],
  templateUrl: './left-menu.component.html',
  styleUrl: './left-menu.component.css'
})
export class LeftMenuComponent {
  private pagesService = inject(PagesService);

  bookIndex = this.pagesService.indexSubtext;

  boldKey: string | null = null;

  toggleBold(key: string) {
    this.boldKey = this.boldKey === key ? null : key;
    console.log(key);
    this.pagesService.definePages(key)
  }
}
