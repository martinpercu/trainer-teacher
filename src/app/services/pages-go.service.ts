import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PagesService {

  pagesSelected = signal<number[]>([0, 1]);
  sectionSelected = signal<string>('');
  titleSelected = signal<string>('');
  defaultTitleSelected = signal<string>('');

  // Señal para indexSubtext
  indexSubtext = signal<Record<string, string>>({});

  // Configuraciones para diferentes rutas
  private configurations: {
    [key: string]: {
      pageMap: { [key: string]: number[] };
      indexSubtext: { [key: string]: string };
      defaultTitle: string;
      doc_path: string
    }
  } = {
      supervisors: {
        pageMap: {
          "Section 0": [0, 1],
          "Section 1": [2, 3, 4, 5, 6, 7, 8],
          "Section 2": [9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
          "Section 3": [19, 20, 21, 22, 23, 24, 25, 26],
          "Section 4": [27, 28, 29, 30, 31, 32, 33],
          "Section 5": [34, 35, 36, 37, 38, 39, 40, 41],
          "Section 6": [42, 43, 44, 45, 46, 47, 48, 49, 50],
        },
        indexSubtext: {
          "Section 0": "Main intro",
          "Section 1": "Defining Business Ethics",
          "Section 2": "Factors that Influence Ethical Behavior",
          "Section 3": "Ethical & Unethical Practices",
          "Section 4": "Recognizing Unethical Behavior",
          "Section 5": "Ethical Decision Making",
          "Section 6": "Ethical Best Practices"
        },
        defaultTitle: "Ethics Management for Supervisors",
        doc_path: "pdfs/ethics-supervisors.pdf"
      },
      employee: {
        pageMap: {
          "Section 0": [0, 1],
          "Section 1": [2, 3, 4],
          "Section 2": [5, 6, 7, 8],
          // Ejemplo: ajusta según las necesidades
        },
        indexSubtext: {
          "Section 0": "Employee Intro",
          "Section 1": "Basic Responsibilities",
          "Section 2": "Workplace Guidelines"
        },
        defaultTitle: "Employee Guidelines",
        doc_path: "pdfs/ethics-employees.pdf"
      }
    };

  private currentConfig: string = 'supervisors'; // Configuración por defecto


  constructor() {
    this.defineAll();
    this.updateIndexSubtext();
  }

  // Configura el servicio según el tipo (supervisors, employee, etc.)
  setConfiguration(type: string) {
    if (this.configurations[type]) {
      this.currentConfig = type;
      this.defineAll();
    } else {
      console.warn(`Configuración ${type} no encontrada. Usando por defecto: supervisors.`);
      this.currentConfig = 'supervisors';
      this.defineAll();
    }
  }

  definePages(section: string, title: string) {
    const pages = this.configurations[this.currentConfig].pageMap[section];
    if (pages) {
      this.pagesSelected.set(pages);
      this.sectionSelected.set(section);
      this.titleSelected.set(title);
    } else {
      console.warn(`Sección ${section} no encontrada en configuración ${this.currentConfig}.`);
    }
  }

  defineAll() {
    const config = this.configurations[this.currentConfig];
    const allPages = Object.values(config.pageMap).flat();
    this.pagesSelected.set([...new Set(allPages)].sort((a, b) => a - b));
    this.sectionSelected.set('All');
    this.titleSelected.set(config.defaultTitle);
  }

  // Método para obtener el subtítulo de una sección
  getSubtext(section: string): string {
    return this.configurations[this.currentConfig].indexSubtext[section] || 'Sin subtítulo';
  }

  // Nuevo método para obtener todo el indexSubtext
  getIndexSubtext(): Record<string, string> {
    return this.configurations[this.currentConfig].indexSubtext;
  }

  private updateIndexSubtext() {
    this.indexSubtext.set(this.configurations[this.currentConfig].indexSubtext);
  }

}
