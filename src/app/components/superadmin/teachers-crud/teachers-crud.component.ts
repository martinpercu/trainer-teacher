import { Component, OnInit } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, query, where, getDocs, doc, updateDoc, getDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { PagesService } from '@services/pages.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { Teacher } from '@models/teacher';
import { Section } from '@models/section';



// interface Teacher {
//   id: string;
//   name: string;
//   pageMap: { [key: string]: number[] };
//   indexSubtext: { [key: string]: string };
//   defaultTitle: string;
//   doc_path: string;
// }

// interface Section {
//   name: string;
//   pages: string; // Input como string, se convierte a number[]
//   subtext: string;
// }

@Component({
  selector: 'app-teachers-crud',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './teachers-crud.component.html'
})

export class TeachersCRUDComponent implements OnInit {
  teachers$!: Observable<Teacher[]>;
  newTeacher: Partial<Teacher> = {
    name: '',
    defaultTitle: '',
    doc_path: ''
  };
  sections: Section[] = [
    { name: 'Section 0', subtext: 'Introducción', pages: '0' }
  ];
  errorMessage: string = '';
  editingTeacherId: string | null = null;

  constructor(
    private firestore: Firestore,
    private pagesService: PagesService
  ) {}

  ngOnInit() {
    const teachersCollection = collection(this.firestore, 'teachers');
    this.teachers$ = collectionData(teachersCollection, { idField: 'id' }) as Observable<Teacher[]>;
    this.pagesService.initialize();
  }

  async loadTeacher(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    const teacherId = selectElement.value;
    if (teacherId) {
      try {
        // Cargar el teacher en el servicio
        await this.pagesService.setConfiguration(teacherId);

        // Obtener los datos del teacher para el formulario
        const teacherDoc = doc(this.firestore, `teachers/${teacherId}`);
        const docSnap = await getDoc(teacherDoc);
        if (docSnap.exists()) {
          const teacherData = docSnap.data() as Teacher;
          this.newTeacher = {
            name: teacherData.name,
            defaultTitle: teacherData.defaultTitle,
            doc_path: teacherData.doc_path
          };
          this.sections = Object.keys(teacherData.pageMap).map(key => ({
            name: key,
            subtext: teacherData.indexSubtext[key] || '',
            pages: teacherData.pageMap[key].join(',')
          }));
          this.editingTeacherId = teacherId;
          this.errorMessage = '';
        } else {
          this.errorMessage = 'Teacher no encontrado';
        }
      } catch (error) {
        console.error('Error al cargar el teacher:', error);
        this.errorMessage = 'Error al cargar el teacher';
      }
    } else {
      // Si se selecciona "Selecciona un teacher", resetear el formulario
      this.resetForm();
    }
  }

  async saveTeacher() {
    if (!this.newTeacher.name || !this.newTeacher.defaultTitle || !this.newTeacher.doc_path) {
      this.errorMessage = 'Todos los campos son requeridos';
      return;
    }

    // Validar que el nombre del teacher no esté duplicado (excepto si es el mismo teacher que estamos editando)
    const teachersCollection = collection(this.firestore, 'teachers');
    const q = query(teachersCollection, where('name', '==', this.newTeacher.name));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty && !querySnapshot.docs.some(doc => doc.id === this.editingTeacherId)) {
      this.errorMessage = 'Ya existe un teacher con este nombre';
      return;
    }

    // Convertir secciones a pageMap e indexSubtext
    const pageMap: { [key: string]: number[] } = {};
    const indexSubtext: { [key: string]: string } = {};
    for (const section of this.sections) {
      if (!section.name || !section.subtext || !section.pages) {
        this.errorMessage = 'Todas las secciones deben tener nombre, subtítulo y páginas';
        return;
      }
      const pages = section.pages
        .split(',')
        .map(page => parseInt(page.trim()))
        .filter(page => !isNaN(page));
      if (pages.length === 0) {
        this.errorMessage = `Páginas inválidas en la sección ${section.name}`;
        return;
      }
      pageMap[section.name] = pages;
      indexSubtext[section.name] = section.subtext;
    }

    try {
      const teacherData: Partial<Teacher> = {
        name: this.newTeacher.name!,
        defaultTitle: this.newTeacher.defaultTitle!,
        doc_path: this.newTeacher.doc_path!,
        pageMap,
        indexSubtext
      };

      if (this.editingTeacherId) {
        // Actualizar teacher existente
        const teacherDoc = doc(this.firestore, `teachers/${this.editingTeacherId}`);
        await updateDoc(teacherDoc, teacherData);
        console.log(`Teacher ${this.editingTeacherId} actualizado exitosamente`);
      } else {
        // Crear nuevo teacher
        const newDocRef = await addDoc(teachersCollection, teacherData);
        // Actualizar el documento para incluir el id
        await updateDoc(doc(this.firestore, `teachers/${newDocRef.id}`), {
          id: newDocRef.id
        });
        console.log(`Teacher creado con ID: ${newDocRef.id}`);
      }

      // Resetear el formulario
      this.resetForm();
    } catch (error) {
      console.error('Error al guardar el teacher:', error);
      this.errorMessage = 'Error al guardar el teacher';
    }
  }

  async deleteTeacher() {
    if (this.editingTeacherId) {
      const confirmDelete = window.confirm('¿Estás seguro de que quieres eliminar este teacher?');
      if (confirmDelete) {
        try {
          const teacherDoc = doc(this.firestore, `teachers/${this.editingTeacherId}`);
          await deleteDoc(teacherDoc);
          console.log(`Teacher ${this.editingTeacherId} eliminado exitosamente`);
          this.resetForm();
        } catch (error) {
          console.error('Error al eliminar el teacher:', error);
          this.errorMessage = 'Error al eliminar el teacher';
        }
      }
    }
  }

  resetForm() {
    this.newTeacher = {
      name: '',
      defaultTitle: '',
      doc_path: ''
    };
    this.sections = [{ name: 'Section 0', subtext: 'Introducción', pages: '0' }];
    this.editingTeacherId = null;
    this.errorMessage = '';
  }

  addSection() {
    this.sections.push({
      name: `Section ${this.sections.length}`,
      subtext: '',
      pages: ''
    });
  }

  removeSection(index: number) {
    this.sections.splice(index, 1);
  }
}
