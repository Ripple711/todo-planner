import { FormEvent, useState } from 'react';
import { TagPicker } from '../components/TagPicker';
import { TaskList } from '../components/TaskList';
import { usePlannerData } from '../hooks/usePlannerData';
import type { TaskPriority } from '../types';

export function QuickCapturePage() {
  const { tasks, tags, isLoading, createTask, createTag } = usePlannerData();
  const [title, setTitle] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().slice(0, 10));
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !deadline) {
      return;
    }

    await createTask({
      title: title.trim(),
      deadline,
      priority,
      tagIds: selectedTagIds,
      notes: notes.trim() || undefined,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
    });

    setTitle('');
    setPriority('medium');
    setSelectedTagIds([]);
    setNotes('');
    setEstimatedMinutes('');
  }

  const recentTasks = tasks.slice(0, 4);

  return (
    <section className="page">
      <header className="page-header">
        <p className="eyebrow">快速收集</p>
        <h2>把想到的事情先放进任务池</h2>
      </header>

      <form className="capture-form soft-panel" onSubmit={handleSubmit}>
        <label>
          任务标题
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="例如：整理课程笔记"
          />
        </label>

        <div className="form-grid">
          <label>
            截止日期
            <input type="date" value={deadline} onChange={(event) => setDeadline(event.target.value)} />
          </label>

          <label>
            优先级
            <select value={priority} onChange={(event) => setPriority(event.target.value as TaskPriority)}>
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
            </select>
          </label>

          <label>
            预计时长（分钟）
            <input
              type="number"
              min="5"
              step="5"
              value={estimatedMinutes}
              onChange={(event) => setEstimatedMinutes(event.target.value)}
              placeholder="可选"
            />
          </label>
        </div>

        <label>
          标签
          <TagPicker
            tags={tags}
            selectedTagIds={selectedTagIds}
            onChange={setSelectedTagIds}
            onCreateTag={createTag}
          />
        </label>

        <label>
          备注
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="可选：补充背景、链接或想法"
            rows={4}
          />
        </label>

        <button type="submit">加入任务池</button>
      </form>

      <section className="content-section soft-panel">
        <h3>最近收集</h3>
        {isLoading ? <p>正在加载任务...</p> : <TaskList tasks={recentTasks} tags={tags} compact />}
      </section>
    </section>
  );
}
