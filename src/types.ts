export type TaskStatus = 'inbox' | 'active' | 'done';

export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskProgress = {
  percent: number;
  note?: string;
};

export type Task = {
  id: string;
  title: string;
  deadline: string;
  priority: TaskPriority;
  tagIds: string[];
  notes?: string;
  progress: TaskProgress;
  status: TaskStatus;
  estimatedMinutes?: number;
  createdAt: string;
  updatedAt: string;
};

export type ScheduleBlock = {
  id: string;
  taskId: string;
  title: string;
  plannedDate: string;
  start?: string;
  end?: string;
  allDay: boolean;
  notes?: string;
};

export type ProgressLog = {
  id: string;
  taskId: string;
  message: string;
  percent: number;
  createdAt: string;
};

export type Tag = {
  id: string;
  name: string;
  color: string;
  createdAt: string;
};

export type NewTaskInput = {
  title: string;
  deadline: string;
  priority: TaskPriority;
  tagIds: string[];
  notes?: string;
  estimatedMinutes?: number;
};
