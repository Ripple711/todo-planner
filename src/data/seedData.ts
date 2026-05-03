import type { ProgressLog, ScheduleBlock, Tag, Task } from '../types';

const now = new Date();
const today = now.toISOString().slice(0, 10);
const tomorrowDate = new Date(now);
tomorrowDate.setDate(now.getDate() + 1);
const nextWeekDate = new Date(now);
nextWeekDate.setDate(now.getDate() + 7);

const tomorrow = tomorrowDate.toISOString().slice(0, 10);
const nextWeek = nextWeekDate.toISOString().slice(0, 10);

export const seedTags: Tag[] = [
  {
    id: 'tag-study',
    name: '学习',
    color: '#AEB9C9',
    createdAt: now.toISOString(),
  },
  {
    id: 'tag-work',
    name: '工作',
    color: '#AFC0B1',
    createdAt: now.toISOString(),
  },
  {
    id: 'tag-life',
    name: '生活',
    color: '#C7B8A8',
    createdAt: now.toISOString(),
  },
];

export const seedTasks: Task[] = [
  {
    id: 'task-1',
    title: '整理示例任务清单',
    deadline: tomorrow,
    priority: 'high',
    tagIds: ['tag-work'],
    notes: '演示如何把待办事项收进任务池，再安排到日历。',
    progress: { percent: 35, note: '已经整理出几条示例事项' },
    status: 'active',
    estimatedMinutes: 60,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 'task-2',
    title: '阅读前端文档示例',
    deadline: nextWeek,
    priority: 'medium',
    tagIds: ['tag-study'],
    notes: '用于演示学习类任务的标签、截止日期和进度。',
    progress: { percent: 15 },
    status: 'active',
    estimatedMinutes: 90,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 'task-3',
    title: '准备演示素材',
    deadline: today,
    priority: 'low',
    tagIds: ['tag-life'],
    progress: { percent: 0 },
    status: 'inbox',
    estimatedMinutes: 20,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: 'task-4',
    title: '记录示例项目进展',
    deadline: nextWeek,
    priority: 'medium',
    tagIds: ['tag-work', 'tag-study'],
    notes: '演示如何记录阶段进展、问题和下一步计划。',
    progress: { percent: 70 },
    status: 'active',
    estimatedMinutes: 45,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];

export const seedScheduleBlocks: ScheduleBlock[] = [
  {
    id: 'block-1',
    taskId: 'task-1',
    title: '整理示例任务清单',
    plannedDate: today,
    start: `${today}T10:00:00`,
    end: `${today}T11:00:00`,
    allDay: false,
  },
  {
    id: 'block-2',
    taskId: 'task-2',
    title: '阅读前端文档示例',
    plannedDate: tomorrow,
    allDay: true,
  },
];

export const seedProgressLogs: ProgressLog[] = [
  {
    id: 'log-1',
    taskId: 'task-1',
    message: '示例进展：已经整理出初始清单。',
    percent: 35,
    createdAt: now.toISOString(),
  },
];
