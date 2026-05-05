import { useMemo, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, PointerEvent, TouchEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import zhCnLocale from '@fullcalendar/core/locales/zh-cn';
import type { EventContentArg, EventDropArg, MoreLinkArg, MoreLinkSimpleAction } from '@fullcalendar/core';
import type { DateClickArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import { ProgressBar } from '../components/ProgressBar';
import { usePlannerData } from '../hooks/usePlannerData';
import type { Tag, Task } from '../types';
import { getTaskColorStyle } from '../utils/colors';
import { sortTasksByDeadline } from '../utils/taskSorting';

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalDateTime(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
}

function addMinutes(date: Date, minutes: number) {
  return formatLocalDateTime(new Date(date.getTime() + minutes * 60_000));
}

function getTaskTags(task: Task, tags: Tag[]) {
  return tags.filter((tag) => task.tagIds.includes(tag.id));
}

const priorityLabels: Record<Task['priority'], string> = {
  low: '低',
  medium: '中',
  high: '高',
};

const calendarViews = [
  { id: 'timeGridDay', label: 'Day' },
  { id: 'timeGridWeek', label: 'Week' },
  { id: 'dayGridMonth', label: 'Month' },
] as const;

type CalendarViewId = (typeof calendarViews)[number]['id'];

function setPlannerDragPerformanceMode(isActive: boolean) {
  document.body.classList.toggle('planner-task-dragging', isActive);
  window.dispatchEvent(new CustomEvent(isActive ? 'planner-task-drag-start' : 'planner-task-drag-end'));
}

export function MainWorkspacePage() {
  const {
    tasks,
    unfinishedTasks,
    tags,
    scheduleBlocks,
    isLoading,
    createScheduleBlock,
    updateScheduleBlockTime,
    deleteTask,
  } = usePlannerData();
  const calendarRef = useRef<FullCalendar | null>(null);
  const schedulingRef = useRef<string | null>(null);
  const [isTaskPoolOpen, setIsTaskPoolOpen] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [openDrawerMenuTaskId, setOpenDrawerMenuTaskId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<CalendarViewId>('dayGridMonth');

  const sortedUnfinishedTasks = useMemo(() => sortTasksByDeadline(unfinishedTasks), [unfinishedTasks]);
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);
  const selectedTask = selectedTaskId ? taskById.get(selectedTaskId) : undefined;

  const events = useMemo(
    () =>
      scheduleBlocks.map((block) => {
        const task = taskById.get(block.taskId);
        const colorStyle = getTaskColorStyle(task, tags);

        return {
          id: block.id,
          title: block.title,
          start: block.allDay ? block.plannedDate : block.start,
          end: block.allDay ? undefined : block.end,
          allDay: block.allDay,
          backgroundColor: colorStyle.surface,
          borderColor: colorStyle.border,
          textColor: colorStyle.text,
          extendedProps: {
            taskId: block.taskId,
            colorBase: colorStyle.base,
            colorSurface: colorStyle.surface,
            colorBorder: colorStyle.border,
          },
        };
      }),
    [scheduleBlocks, tags, taskById],
  );

  function handleDrawerTaskClick(taskId: string) {
    setSelectedTaskId((currentTaskId) => (currentTaskId === taskId ? null : taskId));
  }

  function stopMenuPointer(event: PointerEvent | TouchEvent) {
    event.stopPropagation();
  }

  function stopMenuClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  async function handleDeleteTask(task: Task) {
    setOpenDrawerMenuTaskId(null);

    const confirmed = window.confirm(`确定删除这个任务吗？\n\n${task.title}`);

    if (!confirmed) {
      return;
    }

    if (selectedTaskId === task.id) {
      setSelectedTaskId(null);
    }

    await deleteTask(task.id);
  }

  async function handleEventDrop(info: EventDropArg) {
    if (!info.event.start) {
      return;
    }

    const task = taskById.get(info.event.extendedProps.taskId as string);
    const fallbackEnd =
      !info.event.allDay && !info.event.end ? addMinutes(info.event.start, task?.estimatedMinutes ?? 60) : undefined;

    await updateScheduleBlockTime(
      info.event.id,
      info.event.startStr,
      info.event.endStr || fallbackEnd,
      info.event.allDay,
    );
  }

  async function handleEventResize(info: EventResizeDoneArg) {
    if (!info.event.start) {
      return;
    }

    await updateScheduleBlockTime(
      info.event.id,
      info.event.startStr,
      info.event.endStr || undefined,
      info.event.allDay,
    );
  }

  async function scheduleSelectedTaskForDate(dateStr: string, shouldOpenDay = false) {
    if (!selectedTaskId || !selectedTask) {
      return;
    }

    const plannedDate = dateStr.slice(0, 10);
    const scheduleKey = `${selectedTaskId}:unscheduled:${plannedDate}`;

    if (schedulingRef.current === scheduleKey) {
      return;
    }

    schedulingRef.current = scheduleKey;

    try {
      await createScheduleBlock(selectedTaskId, plannedDate);
      setSelectedTaskId(null);

      if (shouldOpenDay) {
        calendarRef.current?.getApi().changeView('timeGridDay', plannedDate);
      }
    } finally {
      schedulingRef.current = null;
    }
  }

  async function scheduleSelectedTaskForTime(startDate: Date, startStr: string) {
    if (!selectedTaskId || !selectedTask) {
      return;
    }

    const plannedDate = startStr.slice(0, 10);
    const start = startStr;
    const end = addMinutes(startDate, selectedTask.estimatedMinutes ?? 60);
    const scheduleKey = `${selectedTaskId}:timed:${start}`;

    if (schedulingRef.current === scheduleKey) {
      return;
    }

    schedulingRef.current = scheduleKey;

    try {
      await createScheduleBlock(selectedTaskId, plannedDate, start, end);
      setSelectedTaskId(null);
    } finally {
      schedulingRef.current = null;
    }
  }

  async function handleDateClick(info: DateClickArg) {
    if (selectedTaskId) {
      if (info.view.type === 'dayGridMonth' || info.allDay) {
        await scheduleSelectedTaskForDate(info.dateStr, info.view.type === 'dayGridMonth');
        return;
      }

      await scheduleSelectedTaskForTime(info.date, info.dateStr);
      return;
    }

    if (info.view.type === 'dayGridMonth') {
      calendarRef.current?.getApi().changeView('timeGridDay', info.dateStr);
    }
  }

  function handleMoreLinkClick(info: MoreLinkArg): MoreLinkSimpleAction {
    info.jsEvent.preventDefault();
    info.jsEvent.stopPropagation();
    return 'timeGridDay';
  }

  function handleViewChange(viewId: CalendarViewId) {
    calendarRef.current?.getApi().changeView(viewId);
    setCurrentView(viewId);
  }

  function renderEventContent(info: EventContentArg) {
    const task = taskById.get(info.event.extendedProps.taskId as string);
    const eventColor = info.event.extendedProps.colorBase as string | undefined;
    const eventStyle = { '--event-color': eventColor } as CSSProperties;

    if (info.view.type === 'dayGridMonth') {
      return (
        <div className="month-event-pill" style={eventStyle}>
          <span className="month-event-dot" aria-hidden="true" />
          {info.timeText ? <span className="month-event-time">{info.timeText}</span> : null}
          <span className="month-event-title">{info.event.title}</span>
        </div>
      );
    }

    return (
      <div className="time-event-content" style={eventStyle}>
        <strong>{info.event.title}</strong>
        <span>
          {info.timeText || '未安排具体时间'}
          {task ? ` · ${priorityLabels[task.priority]}优先级 · ${task.progress.percent}%` : ''}
        </span>
      </div>
    );
  }

  return (
    <section className={`workspace-page${isTaskPoolOpen ? ' with-pool' : ''}${selectedTask ? ' scheduling-task' : ''}`}>
      <div className="workspace-main">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">主工作台</p>
            <h2>选择任务，点击日历安排</h2>
          </div>
          <div className="workspace-actions">
            <div className={`view-segment view-segment-${currentView}`} aria-label="日历视图">
              <span className="view-segment-indicator" aria-hidden="true" />
              {calendarViews.map((view) => (
                <button
                  key={view.id}
                  type="button"
                  className={`view-segment-button${currentView === view.id ? ' active' : ''}`}
                  onClick={() => handleViewChange(view.id)}
                >
                  {view.label}
                </button>
              ))}
            </div>
            <button type="button" className="secondary-button" onClick={() => setIsTaskPoolOpen((open) => !open)}>
              {isTaskPoolOpen ? '收起任务池' : '打开任务池'}
            </button>
          </div>
        </header>

        <div className="calendar-panel soft-panel">
          {isLoading ? (
            <p>正在加载日历...</p>
          ) : (
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              locale={zhCnLocale}
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: '',
              }}
              buttonText={{
                today: '今天',
                day: 'Day',
                week: 'Week',
                month: 'Month',
              }}
              views={{
                timeGridDay: {
                  type: 'timeGridDay',
                  allDaySlot: true,
                  slotMinTime: '00:00:00',
                  slotMaxTime: '24:00:00',
                },
                timeGridWeek: {
                  type: 'timeGridWeek',
                  allDaySlot: true,
                  slotMinTime: '00:00:00',
                  slotMaxTime: '24:00:00',
                },
                dayGridMonth: {
                  type: 'dayGridMonth',
                },
              }}
              allDayText="未安排具体时间"
              dateClick={(info) => void handleDateClick(info)}
              dayCellClassNames={(arg) =>
                selectedTask?.deadline === formatDateKey(arg.date) ? ['deadline-highlight'] : []
              }
              dayMaxEvents={3}
              displayEventTime
              editable
              eventResizableFromStart
              events={events}
              eventContent={renderEventContent}
              eventDrop={(info) => void handleEventDrop(info)}
              eventDragStart={() => setPlannerDragPerformanceMode(true)}
              eventDragStop={() => setPlannerDragPerformanceMode(false)}
              eventResize={(info) => void handleEventResize(info)}
              eventResizeStart={() => setPlannerDragPerformanceMode(true)}
              eventResizeStop={() => setPlannerDragPerformanceMode(false)}
              datesSet={(info) => setCurrentView(info.view.type as CalendarViewId)}
              height="auto"
              moreLinkClick={handleMoreLinkClick}
              nowIndicator
            />
          )}
        </div>
      </div>

      <aside className={`task-pool-drawer${isTaskPoolOpen ? ' open' : ''}`}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">任务池</p>
            <h3>未完成任务</h3>
          </div>
          <span>{sortedUnfinishedTasks.length} 个</span>
        </div>

        {selectedTask ? (
          <div className="tap-schedule-hint" role="status">
            <span>已选择任务，点击日期安排到当天</span>
            <button type="button" className="tap-schedule-cancel" onClick={() => setSelectedTaskId(null)}>
              取消选择
            </button>
          </div>
        ) : null}

        <div className="drawer-task-list">
          {sortedUnfinishedTasks.map((task) => {
            const colorStyle = getTaskColorStyle(task, tags);
            const taskCardStyle = {
              '--task-color': colorStyle.base,
              '--task-surface': colorStyle.surface,
              '--task-border': colorStyle.border,
            } as CSSProperties;

            return (
              <article
                key={task.id}
                className={`drawer-task priority-${task.priority}${selectedTaskId === task.id ? ' selected-for-schedule' : ''}`}
                style={taskCardStyle}
                aria-pressed={selectedTaskId === task.id}
                onClick={() => handleDrawerTaskClick(task.id)}
              >
                <div className="task-card-top drawer-task-top">
                  <div>
                    <div className="task-title-row">
                      <span className="task-color-dot" aria-hidden="true" />
                      <strong>{task.title}</strong>
                    </div>
                  </div>
                  <div className="task-menu-wrap" onPointerDown={stopMenuPointer} onTouchStart={stopMenuPointer}>
                    <button
                      type="button"
                      className="task-menu-button"
                      aria-label={`${task.title} 更多操作`}
                      aria-expanded={openDrawerMenuTaskId === task.id}
                      onClick={(event) => {
                        stopMenuClick(event);
                        setOpenDrawerMenuTaskId((currentTaskId) => (currentTaskId === task.id ? null : task.id));
                      }}
                    >
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                      <span aria-hidden="true" />
                    </button>
                    {openDrawerMenuTaskId === task.id ? (
                      <div className="task-menu" role="menu">
                        <button
                          type="button"
                          className="task-menu-delete"
                          role="menuitem"
                          onClick={(event) => {
                            stopMenuClick(event);
                            void handleDeleteTask(task);
                          }}
                        >
                          删除
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="task-meta-row">
                  <span className="drawer-task-deadline">截止 {task.deadline}</span>
                  {task.estimatedMinutes ? <span>预计 {task.estimatedMinutes} 分钟</span> : null}
                </div>
                <div className="tag-row">
                  {getTaskTags(task, tags).map((tag) => (
                    <span key={tag.id} className="tag" style={{ '--tag-color': tag.color } as CSSProperties}>
                      {tag.name}
                    </span>
                  ))}
                </div>
                <ProgressBar percent={task.progress.percent} color={colorStyle.base} />
              </article>
            );
          })}
        </div>
      </aside>
    </section>
  );
}
