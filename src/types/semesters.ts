export interface Semester {
  semesterId: number;
  code: string;
  name: string;
  year: number;
  term: string;
  startDate: string; 
  endDate: string; 
  isActive: boolean;
  totalClasses: number;
  totalProjects?: number;
  classes?: any[];
}

export interface CreateSemesterDto {
  code: string;
  name: string;
  year: number;
  term: string;
  startDate: string; 
  endDate: string; 
  isActive: boolean;
}

export interface UpdateSemesterDto {
  name: string;
  year: number;
  term: string;
  startDate: string; 
  endDate: string; 
  isActive: boolean;
}
