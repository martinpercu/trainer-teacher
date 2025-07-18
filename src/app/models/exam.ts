export interface Option {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  text: string; // Texto de la pregunta
  options: Option[]; // 6 opciones: 1 correcta, 5 incorrectas
}

export interface Exam {
  id: string; // ID del documento en Firestore
  title: string; // Título del examen, requerido
  teacherId: string; // ID del profesor, requerido
  teacherName?: string; // Nombre del profesor, opcional
  questions: Question[]; // Lista de preguntas
}
