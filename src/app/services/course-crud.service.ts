// import { Injectable, inject } from '@angular/core';
// import { Firestore, collection, collectionData, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where, getDocs, deleteField } from '@angular/fire/firestore';
// import { Observable, from, of } from 'rxjs';
// import { map, catchError } from 'rxjs/operators';
// import { Course } from '@models/course';

import { Injectable, inject } from '@angular/core';
import { Firestore, collection, collectionData, doc, setDoc, updateDoc, deleteDoc, getDoc, query, where, getDocs, deleteField } from '@angular/fire/firestore';
import { Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Course } from '@models/course';


@Injectable({
  providedIn: 'root'
})
export class CourseCrudService {


  private firestore = inject(Firestore);

  /**
   * Obtiene todos los cursos como un Observable
   */
  getCourses(): Observable<Course[]> {
    const coursesCollection = collection(this.firestore, 'courses');
    return collectionData(coursesCollection, { idField: 'id' }).pipe(
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
    const courseDoc = doc(this.firestore, 'courses', courseId);
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

    const courseData: { [key: string]: any } = {
      title: course.title.trim(),
      enabled: course.enabled ?? false,
      difficulty: course.difficulty ?? 2
    };

    // Only include optional fields if they have valid values
    if (course.name?.trim()) courseData['name'] = course.name.trim();
    if (course.teacherId?.trim()) courseData['teacherId'] = course.teacherId.trim();
    if (course.teacherName?.trim()) courseData['teacherName'] = course.teacherName.trim();
    if (course.startDate?.trim()) courseData['startDate'] = course.startDate.trim();
    if (course.endDate?.trim()) courseData['endDate'] = course.endDate.trim();
    if (course.description?.trim()) courseData['description'] = course.description.trim();

    const coursesCollection = collection(this.firestore, 'courses');
    const newDocRef = doc(coursesCollection);
    courseData['id'] = newDocRef.id;

    return from(setDoc(newDocRef, courseData)).pipe(
      map(() => newDocRef.id),
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

    const courseDoc = doc(this.firestore, 'courses', courseId);
    const courseData: { [key: string]: any } = {
      name: course.name?.trim() || deleteField(),
      title: course.title.trim(),
      teacherId: course.teacherId || deleteField(),
      teacherName: course.teacherName || deleteField(),
      enabled: course.enabled ?? false,
      startDate: course.startDate?.trim() || deleteField(),
      endDate: course.endDate?.trim() || deleteField(),
      description: course.description?.trim() || deleteField(),
      difficulty: course.difficulty ?? 2
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
    const courseDoc = doc(this.firestore, 'courses', courseId);
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
    const coursesCollection = collection(this.firestore, 'courses');
    const q = query(coursesCollection, where('title', '==', title.trim()));
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





  // private coursesCollection = collection(inject(Firestore), 'courses');

  // /**
  //  * Obtiene todos los cursos como un Observable
  //  */
  // getCourses(): Observable<Course[]> {
  //   return collectionData(this.coursesCollection, { idField: 'id' }).pipe(
  //     map(courses => courses as Course[]),
  //     catchError(error => {
  //       console.error('Error al obtener cursos:', error);
  //       return of([]);
  //     })
  //   );
  // }

  // /**
  //  * Obtiene un curso específico por su ID
  //  */
  // getCourseById(courseId: string): Observable<Course | null> {
  //   const courseDoc = doc(this.coursesCollection, courseId);
  //   return from(getDoc(courseDoc)).pipe(
  //     map(docSnap => (docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as Course : null)),
  //     catchError(error => {
  //       console.error('Error al obtener el curso:', error);
  //       return of(null);
  //     })
  //   );
  // }


  // /**
  //  * Crea un nuevo curso
  //  */
  // createCourse(course: Partial<Course>): Observable<string | null> {
  //   if (!course.title?.trim()) {
  //     console.error('El título es requerido');
  //     return of(null);
  //   }

  //   const courseData: Partial<Course> = {
  //     name: course.name?.trim() || undefined,
  //     title: course.title.trim(),
  //     teacherId: course.teacherId || undefined,
  //     teacherName: course.teacherName || undefined,
  //     enabled: course.enabled ?? true,
  //     startDate: course.startDate?.trim() || undefined,
  //     endDate: course.endDate?.trim() || undefined,
  //     description: course.description?.trim() || undefined,
  //     difficulty: course.difficulty ?? 2
  //   };

  //   const newDocRef = doc(this.coursesCollection);
  //   return from(setDoc(newDocRef, { ...courseData, id: newDocRef.id })).pipe(
  //     map(() => newDocRef.id),
  //     catchError(error => {
  //       console.error('Error al crear el curso:', error);
  //       return of(null);
  //     })
  //   );
  // }

  // /**
  //  * Actualiza un curso existente
  //  */
  // updateCourse(courseId: string, course: Partial<Course>): Observable<boolean> {
  //   if (!course.title?.trim()) {
  //     console.error('El título es requerido');
  //     return of(false);
  //   }

  //   const courseDoc = doc(this.coursesCollection, courseId);
  //   const courseData: { [key: string]: any } = {
  //     name: course.name?.trim() || deleteField(),
  //     title: course.title.trim(),
  //     teacherId: course.teacherId || deleteField(),
  //     teacherName: course.teacherName || deleteField(),
  //     enabled: course.enabled ?? true,
  //     startDate: course.startDate?.trim() || deleteField(),
  //     endDate: course.endDate?.trim() || deleteField(),
  //     description: course.description?.trim() || deleteField(),
  //     difficulty: course.difficulty ?? 2
  //   };

  //   return from(updateDoc(courseDoc, courseData)).pipe(
  //     map(() => true),
  //     catchError(error => {
  //       console.error('Error al actualizar el curso:', error);
  //       return of(false);
  //     })
  //   );
  // }

  // /**
  //  * Elimina un curso
  //  */
  // deleteCourse(courseId: string): Observable<boolean> {
  //   const courseDoc = doc(this.coursesCollection, courseId);
  //   return from(deleteDoc(courseDoc)).pipe(
  //     map(() => true),
  //     catchError(error => {
  //       console.error('Error al eliminar el curso:', error);
  //       return of(false);
  //     })
  //   );
  // }

  // /**
  //  * Verifica si un curso con el mismo título ya existe
  //  */
  // checkCourseTitleExists(title: string, excludeCourseId?: string): Observable<boolean> {
  //   const q = query(this.coursesCollection, where('title', '==', title.trim()));
  //   return from(getDocs(q)).pipe(
  //     map(querySnapshot =>
  //       !querySnapshot.empty &&
  //       !querySnapshot.docs.some(doc => doc.id === excludeCourseId)
  //     ),
  //     catchError(error => {
  //       console.error('Error al verificar el título del curso:', error);
  //       return of(false);
  //     })
  //   );
  // }


}
