export type Role = "programador" | "marcador" | "administrador" | "trabajador";

export type DocType = "CC" | "CE" | "TI" | "PA" | "PE";
export type ContractType = "INDEFINIDO" | "FIJO" | "OBRA" | "APRENDIZAJE";
export type SalaryMode = "mensual" | "integral";
export type RiskClass = 1 | 2 | 3 | 4 | 5;

export type Company = {
  name: string;
  nit: string;
  dv: string;
  city: string;
  departmentCode: string;
  cityCode: string;
  address: string;
  phone: string;
  email: string;
  ciiu: string;
  arlCode: string;
  exonerated: boolean;
  personType: "J" | "N";
};

export type Employee = {
  id: string;
  docType: DocType;
  documentNumber: string;
  firstSurname: string;
  secondSurname: string;
  firstName: string;
  secondName: string;
  jobTitle: string;
  monthlySalary: number;
  dailyHours: number;
  hireDate: string;
  contractType: ContractType;
  salaryMode: SalaryMode;
  riskClass: RiskClass;
  epsCode: string;
  afpCode: string;
  ccfCode: string;
  active: boolean;
};

export type Period = {
  year: number;
  month: number;
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

export type NoveltyKind = "AUS" | "SLN" | "VAC" | "IGE" | "IRL" | "LMA";

export type Novelty = {
  id: string;
  workerId: string;
  kind: NoveltyKind;
  start: string;
  end: string;
  note: string;
};

export type EmpresasState = {
  company: Company | null;
  employees: Employee[];
  period: Period;
  role: Role;
  workerId: string;
  assignments: Assignment[];
  clocks: ClockRecord[];
  notifications: WorkerNotification[];
  pendingRemovals: PendingRemoval[];
  novedades: Novelty[];
};

export type ShiftRow = {
  workerId: string;
  plannedStart: string;
  plannedEnd: string;
};

export function employeeName(employee: Pick<Employee, "firstName" | "secondName" | "firstSurname" | "secondSurname">): string {
  return [employee.firstName, employee.secondName, employee.firstSurname, employee.secondSurname].filter(Boolean).join(" ");
}
