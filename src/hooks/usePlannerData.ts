import { useEffect, useMemo, useState } from 'react';
import {
  getProgressLogs,
  getScheduleBlocks,
  getTags,
  getTasks,
  saveProgressLogs,
  saveScheduleBlocks,
  saveTags,
  saveTasks,
  seedInitialData,
} from '../services/storage';
import type { NewTaskInput, ProgressLog, ScheduleBlock, Tag, Task, TaskStatus } from '../types';
import { morandiTagColors } from '../utils/colors';

type PlannerData = {
  tasks: Task[];
  unfinishedTasks: Task[];
  tags: Tag[];
  scheduleBlocks: ScheduleBlock[];
  progressLogs: ProgressLog[];
  isLoading: boolean;
  createTask: (input: NewTaskInput) => Promise<void>;
  createTag: (name: string) => Promise<Tag>;
  createScheduleBlock: (taskId: string, plannedDate: string, start?: string, end?: string) => Promise<void>;
  updateScheduleBlockTime: (blockId: string, start: string, end?: string, allDay?: boolean) => Promise<void>;
  updateTaskProgress: (taskId: string, percent: number) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
};

export function usePlannerData(): PlannerData {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [scheduleBlocks, setScheduleBlocks] = useState<ScheduleBlock[]>([]);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      await seedInitialData();

      const [storedTasks, storedTags, storedScheduleBlocks, storedProgressLogs] = await Promise.all([
        getTasks(),
        getTags(),
        getScheduleBlocks(),
        getProgressLogs(),
      ]);

      setTasks(storedTasks);
      setTags(storedTags);
      setScheduleBlocks(storedScheduleBlocks);
      setProgressLogs(storedProgressLogs);
      setIsLoading(false);
    }

    void loadData();
  }, []);

  const unfinishedTasks = useMemo(
    () => tasks.filter((task) => task.status !== 'done' && task.progress.percent < 100),
    [tasks],
  );

  async function createTask(input: NewTaskInput) {
    const timestamp = new Date().toISOString();
    const task: Task = {
      id: crypto.randomUUID(),
      title: input.title,
      deadline: input.deadline,
      priority: input.priority,
      tagIds: input.tagIds,
      notes: input.notes,
      estimatedMinutes: input.estimatedMinutes,
      progress: { percent: 0 },
      status: 'inbox',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    const nextTasks = [task, ...tasks];
    setTasks(nextTasks);
    await saveTasks(nextTasks);
  }

  async function createTag(name: string) {
    const trimmedName = name.trim();
    const existingTag = tags.find((tag) => tag.name === trimmedName);

    if (existingTag) {
      return existingTag;
    }

    const tag: Tag = {
      id: crypto.randomUUID(),
      name: trimmedName,
      color: morandiTagColors[tags.length % morandiTagColors.length],
      createdAt: new Date().toISOString(),
    };
    const nextTags = [...tags, tag];
    setTags(nextTags);
    await saveTags(nextTags);
    return tag;
  }

  async function createScheduleBlock(taskId: string, plannedDate: string, start?: string, end?: string) {
    const task = tasks.find((item) => item.id === taskId);

    if (!task) {
      return;
    }

    const block: ScheduleBlock = {
      id: crypto.randomUUID(),
      taskId,
      title: task.title,
      plannedDate,
      start,
      end,
      allDay: !start,
    };
    const nextBlocks = [...scheduleBlocks, block];
    setScheduleBlocks(nextBlocks);
    await saveScheduleBlocks(nextBlocks);
  }

  async function updateScheduleBlockTime(blockId: string, start: string, end?: string, allDay = false) {
    const plannedDate = start.slice(0, 10);
    const nextBlocks = scheduleBlocks.map((block) =>
      block.id === blockId
        ? {
            ...block,
            plannedDate,
            start,
            end,
            allDay,
          }
        : block,
    );

    setScheduleBlocks(nextBlocks);
    await saveScheduleBlocks(nextBlocks);
  }

  async function updateTaskProgress(taskId: string, percent: number) {
    const safePercent = Math.min(100, Math.max(0, percent));
    const timestamp = new Date().toISOString();
    const nextTasks = tasks.map((task) => {
      const nextStatus: TaskStatus = safePercent === 100 ? 'done' : task.status === 'done' ? 'active' : task.status;

      return task.id === taskId
        ? {
            ...task,
            progress: { ...task.progress, percent: safePercent },
            status: nextStatus,
            updatedAt: timestamp,
          }
        : task;
    });
    const nextLogs = [
      {
        id: crypto.randomUUID(),
        taskId,
        message: `进度更新到 ${safePercent}%`,
        percent: safePercent,
        createdAt: timestamp,
      },
      ...progressLogs,
    ];

    setTasks(nextTasks);
    setProgressLogs(nextLogs);
    await Promise.all([saveTasks(nextTasks), saveProgressLogs(nextLogs)]);
  }

  async function deleteTask(taskId: string) {
    const nextTasks = tasks.filter((task) => task.id !== taskId);
    const nextBlocks = scheduleBlocks.filter((block) => block.taskId !== taskId);
    const nextLogs = progressLogs.filter((log) => log.taskId !== taskId);

    setTasks(nextTasks);
    setScheduleBlocks(nextBlocks);
    setProgressLogs(nextLogs);
    await Promise.all([saveTasks(nextTasks), saveScheduleBlocks(nextBlocks), saveProgressLogs(nextLogs)]);
  }

  return {
    tasks,
    unfinishedTasks,
    tags,
    scheduleBlocks,
    progressLogs,
    isLoading,
    createTask,
    createTag,
    createScheduleBlock,
    updateScheduleBlockTime,
    updateTaskProgress,
    deleteTask,
  };
}
