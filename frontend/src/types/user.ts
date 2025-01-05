export interface User {
  userId: string;
  nickname: string;
  level: number;
  job: string;
  jobCode: string;
  meso: number;
  playTime: string;
  exp: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  key: keyof User | 'action';
  label: string;
  sortable?: boolean;
  width?: string;
} 