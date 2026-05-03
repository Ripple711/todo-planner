import { TaskList } from '../components/TaskList';
import { usePlannerData } from '../hooks/usePlannerData';
import { sortTasksByDeadline } from '../utils/taskSorting';

export function TaskPoolPage() {
  const { tasks, tags, isLoading, updateTaskProgress } = usePlannerData();
  const sortedTasks = sortTasksByDeadline(tasks);

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">任务管理</p>
        <h2>任务池</h2>
      </header>

      <section className="content-section soft-panel">
        <h3>全部任务</h3>
        {isLoading ? (
          <p>正在加载任务...</p>
        ) : (
          <TaskList tasks={sortedTasks} tags={tags} onProgressChange={updateTaskProgress} />
        )}
      </section>
    </section>
  );
}
