import localforage from 'localforage';
import { seedProgressLogs, seedScheduleBlocks, seedTags, seedTasks } from '../data/seedData';
import type { ProgressLog, ScheduleBlock, Tag, Task } from '../types';

const TASKS_KEY = 'tasks';
const TAGS_KEY = 'tags';
const SCHEDULE_BLOCKS_KEY = 'scheduleBlocks';
const PROGRESS_LOGS_KEY = 'progressLogs';
const SEED_VERSION_KEY = 'seedVersion';
const CURRENT_SEED_VERSION = 3;

localforage.config({
  name: 'personal-todo-planner',
  storeName: 'planner_data',
  description: 'Local data for the personal todo planner app',
});

export async function seedInitialData() {
  const seedVersion = await localforage.getItem<number>(SEED_VERSION_KEY);

  if (seedVersion === CURRENT_SEED_VERSION) {
    return;
  }

  const [storedTasks, storedTags, storedScheduleBlocks, storedProgressLogs] = await Promise.all([
    localforage.getItem<Task[]>(TASKS_KEY),
    localforage.getItem<Tag[]>(TAGS_KEY),
    localforage.getItem<ScheduleBlock[]>(SCHEDULE_BLOCKS_KEY),
    localforage.getItem<ProgressLog[]>(PROGRESS_LOGS_KEY),
  ]);

  const nextTags = storedTags ? mergeSeedTagColors(storedTags) : seedTags;

  await Promise.all([
    localforage.setItem(TASKS_KEY, storedTasks ?? seedTasks),
    localforage.setItem(TAGS_KEY, nextTags),
    localforage.setItem(SCHEDULE_BLOCKS_KEY, storedScheduleBlocks ?? seedScheduleBlocks),
    localforage.setItem(PROGRESS_LOGS_KEY, storedProgressLogs ?? seedProgressLogs),
    localforage.setItem(SEED_VERSION_KEY, CURRENT_SEED_VERSION),
  ]);
}

function mergeSeedTagColors(tags: Tag[]) {
  return tags.map((tag) => {
    const seedTag = seedTags.find((item) => item.id === tag.id);
    return seedTag ? { ...tag, color: seedTag.color } : tag;
  });
}

export async function getTasks() {
  return (await localforage.getItem<Task[]>(TASKS_KEY)) ?? [];
}

export async function saveTasks(tasks: Task[]) {
  await localforage.setItem(TASKS_KEY, tasks);
}

export async function getTags() {
  return (await localforage.getItem<Tag[]>(TAGS_KEY)) ?? [];
}

export async function saveTags(tags: Tag[]) {
  await localforage.setItem(TAGS_KEY, tags);
}

export async function getScheduleBlocks() {
  return (await localforage.getItem<ScheduleBlock[]>(SCHEDULE_BLOCKS_KEY)) ?? [];
}

export async function saveScheduleBlocks(scheduleBlocks: ScheduleBlock[]) {
  await localforage.setItem(SCHEDULE_BLOCKS_KEY, scheduleBlocks);
}

export async function getProgressLogs() {
  return (await localforage.getItem<ProgressLog[]>(PROGRESS_LOGS_KEY)) ?? [];
}

export async function saveProgressLogs(progressLogs: ProgressLog[]) {
  await localforage.setItem(PROGRESS_LOGS_KEY, progressLogs);
}
