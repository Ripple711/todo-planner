import type { Task } from '../types';

const priorityRank: Record<Task['priority'], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

function getDeadlineTime(task: Task) {
  return task.deadline ? new Date(task.deadline).getTime() : Number.POSITIVE_INFINITY;
}

function getStatusRank(task: Task) {
  return task.status === 'done' || task.progress.percent >= 100 ? 1 : 0;
}

export function sortTasksByDeadline(tasks: Task[]) {
  return [...tasks].sort((first, second) => {
    const statusDiff = getStatusRank(first) - getStatusRank(second);

    if (statusDiff !== 0) {
      return statusDiff;
    }

    const deadlineDiff = getDeadlineTime(first) - getDeadlineTime(second);

    if (deadlineDiff !== 0) {
      return deadlineDiff;
    }

    const priorityDiff = priorityRank[first.priority] - priorityRank[second.priority];

    if (priorityDiff !== 0) {
      return priorityDiff;
    }

    return new Date(first.createdAt).getTime() - new Date(second.createdAt).getTime();
  });
}
