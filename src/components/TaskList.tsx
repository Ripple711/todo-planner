import { useState } from 'react';
import type { CSSProperties, MouseEvent, PointerEvent, TouchEvent } from 'react';
import { ProgressBar } from './ProgressBar';
import type { Tag, Task } from '../types';
import { getTaskColorStyle } from '../utils/colors';

type TaskListProps = {
  tasks: Task[];
  tags: Tag[];
  onProgressChange?: (taskId: string, percent: number) => Promise<void>;
  onDeleteTask?: (taskId: string) => Promise<void>;
  compact?: boolean;
};

const statusLabels: Record<Task['status'], string> = {
  inbox: '收集箱',
  active: '进行中',
  done: '已完成',
};

const priorityLabels: Record<Task['priority'], string> = {
  low: '低优先级',
  medium: '中优先级',
  high: '高优先级',
};

function stopDragEvent(event: PointerEvent | TouchEvent) {
  event.stopPropagation();
}

function stopMenuEvent(event: MouseEvent) {
  event.preventDefault();
  event.stopPropagation();
}

export function TaskList({ tasks, tags, onProgressChange, onDeleteTask, compact = false }: TaskListProps) {
  const [openMenuTaskId, setOpenMenuTaskId] = useState<string | null>(null);

  if (tasks.length === 0) {
    return <p className="empty-state">还没有任务。雨声很轻，任务池也很安静。</p>;
  }

  async function handleDeleteTask(task: Task) {
    setOpenMenuTaskId(null);

    if (!onDeleteTask) {
      return;
    }

    const confirmed = window.confirm(`确定删除这个任务吗？\n\n${task.title}`);

    if (!confirmed) {
      return;
    }

    await onDeleteTask(task.id);
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const taskTags = tags.filter((tag) => task.tagIds.includes(tag.id));
        const colorStyle = getTaskColorStyle(task, tags);
        const taskCardStyle = {
          '--task-color': colorStyle.base,
          '--task-surface': colorStyle.surface,
          '--task-border': colorStyle.border,
        } as CSSProperties;
        const isCompleted = task.status === 'done' || task.progress.percent >= 100;

        return (
          <article
            key={task.id}
            className={`task-card priority-${task.priority}${isCompleted ? ' task-card-completed' : ''}`}
            style={taskCardStyle}
          >
            <div className="task-card-top">
              <div className="task-title-row">
                <span className="task-color-dot" aria-hidden="true" />
                <h3>{task.title}</h3>
              </div>
              <div className="task-card-actions">
                <span className="task-card-grip" aria-hidden="true" />
                {onDeleteTask ? (
                  <div className="task-menu-wrap" onPointerDown={stopDragEvent} onTouchStart={stopDragEvent}>
                    <button
                      type="button"
                      className="task-menu-button"
                      aria-label={`${task.title} 更多操作`}
                      aria-expanded={openMenuTaskId === task.id}
                      onClick={(event) => {
                        stopMenuEvent(event);
                        setOpenMenuTaskId((currentTaskId) => (currentTaskId === task.id ? null : task.id));
                      }}
                    >
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                    </button>
                    {openMenuTaskId === task.id ? (
                      <div className="task-menu" role="menu">
                        <button
                          type="button"
                          className="task-menu-delete"
                          role="menuitem"
                          onClick={(event) => {
                            stopMenuEvent(event);
                            void handleDeleteTask(task);
                          }}
                        >
                          删除
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            <div className="task-meta-row">
              <span>{isCompleted ? '已完成' : statusLabels[task.status]}</span>
              <span>{priorityLabels[task.priority]}</span>
              <span>截止 {task.deadline}</span>
              {task.estimatedMinutes ? <span>预计 {task.estimatedMinutes} 分钟</span> : null}
            </div>
            {!compact && task.notes ? (
              <div className="task-note">
                <p>{task.notes}</p>
              </div>
            ) : null}
            <div className="tag-row">
              {taskTags.map((tag) => (
                <span key={tag.id} className="tag" style={{ '--tag-color': tag.color } as CSSProperties}>
                  {tag.name}
                </span>
              ))}
            </div>
            <div className="task-progress-row">
              <ProgressBar percent={task.progress.percent} color={colorStyle.base} />
            </div>
            {onProgressChange ? (
              <label className="range-label">
                调整进度
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={task.progress.percent}
                  onChange={(event) => void onProgressChange(task.id, Number(event.target.value))}
                />
              </label>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
