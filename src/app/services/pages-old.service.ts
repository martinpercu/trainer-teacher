import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagesService {

  pagesSelected = signal<number[]>([0, 1]);
  sectionSelected = signal<string>('');
  titleSelected = signal<string>('');

  private pageMap: { [key: string]: number[] } = {
    "Section 0": [0, 1],
    "Section 1": [2, 3, 4, 5, 6, 7, 8],
    "Section 2": [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
    "Section 3": [19, 20, 21, 22, 23, 24, 25, 26],
    "Section 4": [27, 28, 29, 30, 31, 32, 33],
    "Section 5": [34, 35, 36, 37, 38, 39, 40, 41],
    "Section 6": [42, 43, 44, 45, 46, 47, 48, 49, 50],
  };

  indexSubtext = {
    "Section 0": "Main intro",
    "Section 1": "Defining Business Ethics",
    "Section 2": "Factors that Influence Ethical Behavior",
    "Section 3": "Ethical & Unethical Practices",
    "Section 4": "Recognizing Unethical Behavior",
    "Section 5": "Ethical Decision Making",
    "Section 6": "Ethical Best Practices"
  }

  constructor() {
    this.defineAll()
   }

  definePages(section: string, title: string) {
    console.log(section, "sdfqsdf");
    const pages = this.pageMap[section];
    if (pages) {
      this.pagesSelected.set(pages);
      this.sectionSelected.set(section);
      this.titleSelected.set(title);
    }
    console.log(this.pagesSelected());
  }

  defineAll() {
    const totalPages = 51; // Ajusta esto según el número real de páginas del PDF
    const allPages = Array.from({ length: totalPages }, (_, i) => i); // [0, 1, 2, ..., 33]
    this.pagesSelected.set(allPages);
    this.sectionSelected.set('All');
    this.titleSelected.set('Ethics Management for Supervisors');

    console.log(this.pagesSelected());
  };


}
