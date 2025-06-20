export interface Job {
  jobId: string;
  name: string;
  description: string;
  ownerId: string;
  active: boolean;
  examActive?: boolean;
  examId?: string;
}
