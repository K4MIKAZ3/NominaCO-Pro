export type Role = "programador" | "marcador" | "administrador" | "trabajador";

export type Worker = {
  id: string;
  name: string;
  documentId: string;
  jobTitle: string;
  monthlySalary: number;
  dailyHours: number;
};

export type AssignmentStatus = "borrador" | "publicado";

export type Assignment = {
  id: string;
  date: string;
  workerId: string;
  plannedStart: string;
  plannedEnd: string;
  status: AssignmentStatus;
  publishedAt: string | null;
};

export type ClockRecord = {
  assignmentId: string;
  clockIn: string;
  clockOut: string;
  markedBy: string;
  markedAt: string;
};

export type WorkerNotification = {
  id: string;
  workerId: string;
  date: string;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
};

export type PendingRemoval = {
  workerId: string;
  date: string;
  plannedStart: string;
  plannedEnd: string;
};

export type EmpresasState = {
  role: Role;
  workerId: string;
  assignments: Assignment[];
  clocks: ClockRecord[];
  notifications: WorkerNotification[];
  pendingRemovals: PendingRemoval[];
};

export type ShiftRow = {
  workerId: string;
  plannedStart: string;
  plannedEnd: string;
};
