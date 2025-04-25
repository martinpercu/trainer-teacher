import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, getDocs } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Course } from '@models/course';


@Injectable({
  providedIn: 'root'
})
export class CourseCrudService {
  private coursesCollection;

  constructor(private firestore: Firestore) {
    this.coursesCollection = collection(this.firestore, 'courses');
  }

  /**
   * Obtiene todos los cursos como un Observable
   */
  getCourses(): Observable<Course[]> {
    return collectionData(this.coursesCollection, { idField: 'id' }).pipe(
      map(courses => courses as Course[]),
      catchError(error => {
        console.error('Error al obtener cursos:', error);
        return of([]);
      })
    );
  }

  /**
   * Obtiene un curso específico por su ID
   */
  getCourseById(courseId: string): Observable<Course | null> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);
    return from(getDoc(courseDoc)).pipe(
      map(docSnap => (docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Course : null)),
      catchError(error => {
        console.error('Error al obtener el curso:', error);
        return of(null);
      })
    );
  }

  /**
   * Crea un nuevo curso
   */
  createCourse(course: Partial<Course>): Observable<string | null> {
    if (!course.title?.trim()) {
      console.error('El título es requerido');
      return of(null);
    }

    const courseData: Partial<Course> = {
      name: course.name?.trim() || undefined,
      title: course.title.trim(),
      teacherId: course.teacherId || undefined,
      teacherName: course.teacherName || undefined,
      enabled: course.enabled ?? false,
      startDate: course.startDate || undefined,
      endDate: course.endDate || undefined,
      description: course.description?.trim() || undefined
    };

    return from(addDoc(this.coursesCollection, courseData)).pipe(
      map(docRef => {
        // Actualizar el documento para incluir el ID
        updateDoc(doc(this.firestore, `courses/${docRef.id}`), { id: docRef.id });
        return docRef.id;
      }),
      catchError(error => {
        console.error('Error al crear el curso:', error);
        return of(null);
      })
    );
  }

  /**
   * Actualiza un curso existente
   */
  updateCourse(courseId: string, course: Partial<Course>): Observable<boolean> {
    if (!course.title?.trim()) {
      console.error('El título es requerido');
      return of(false);
    }

    const courseDoc = doc(this.firestore, `courses/${courseId}`);
    const courseData: Partial<Course> = {
      name: course.name?.trim() || undefined,
      title: course.title.trim(),
      teacherId: course.teacherId || undefined,
      teacherName: course.teacherName || undefined,
      enabled: course.enabled ?? false,
      startDate: course.startDate || undefined,
      endDate: course.endDate || undefined,
      description: course.description?.trim() || undefined
    };

    return from(updateDoc(courseDoc, courseData)).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error al actualizar el curso:', error);
        return of(false);
      })
    );
  }

  /**
   * Elimina un curso
   */
  deleteCourse(courseId: string): Observable<boolean> {
    const courseDoc = doc(this.firestore, `courses/${courseId}`);
    return from(deleteDoc(courseDoc)).pipe(
      map(() => true),
      catchError(error => {
        console.error('Error al eliminar el curso:', error);
        return of(false);
      })
    );
  }

  /**
   * Verifica si un curso con el mismo título ya existe
   */
  checkCourseTitleExists(title: string, excludeCourseId?: string): Observable<boolean> {
    const q = query(this.coursesCollection, where('title', '==', title.trim()));
    return from(getDocs(q)).pipe(
      map(querySnapshot =>
        !querySnapshot.empty &&
        !querySnapshot.docs.some(doc => doc.id === excludeCourseId)
      ),
      catchError(error => {
        console.error('Error al verificar el título del curso:', error);
        return of(false);
      })
    );
  }
}
