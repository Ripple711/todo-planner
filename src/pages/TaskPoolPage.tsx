import { useMemo, useState } from 'react';
import { TaskList } from '../components/TaskList';
import { usePlannerData } from '../hooks/usePlannerData';
import { sortTasksByDeadline } from '../utils/taskSorting';

export function TaskPoolPage() {
  const { tasks, tags, isLoading, updateTaskProgress, deleteTask } = usePlannerData();
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);

  const unfinishedTasks = useMemo(
    () => sortTasksByDeadline(tasks.filter((task) => task.status !== 'done' && task.progress.percent < 100)),
    [tasks],
  );
  const completedTasks = useMemo(
    () =>
      tasks
        .filter((task) => task.status === 'done' || task.progress.percent >= 100)
        .sort((firstTask, secondTask) => {
          return new Date(secondTask.updatedAt).getTime() - new Date(firstTask.updatedAt).getTime();
        }),
    [tasks],
  );

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">任务管理</p>
        <h2>任务池</h2>
      </header>

      <section className="content-section soft-panel">
        <h3>未完成任务</h3>
        {isLoading ? (
          <p>正在加载任务...</p>
        ) : (
          <TaskList
            tasks={unfinishedTasks}
            tags={tags}
            onProgressChange={updateTaskProgress}
            onDeleteTask={deleteTask}
          />
        )}
      </section>

      <section className="content-section soft-panel completed-task-section">
        <button
          type="button"
          className="completed-section-toggle"
          aria-expanded={isCompletedOpen}
          onClick={() => setIsCompletedOpen((open) => !open)}
        >
          <span className={`completed-section-triangle${isCompletedOpen ? ' open' : ''}`} aria-hidden="true" />
          <span>已完成任务（{completedTasks.length}）</span>
        </button>
        {isCompletedOpen ? (
          isLoading ? (
            <p>正在加载任务...</p>
          ) : (
            <div className="completed-task-list">
              <TaskList
                tasks={completedTasks}
                tags={tags}
                onProgressChange={updateTaskProgress}
                onDeleteTask={deleteTask}
              />
            </div>
          )
        ) : null}
      </section>
    </section>
  );
}
