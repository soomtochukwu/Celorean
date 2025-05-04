export interface Course {
  name: string;
  lecturer: string;
  capacity: number;
  enrolledStudents: number;
  sessionId: string;
  description: string;
  students: { id: string }[];
}
