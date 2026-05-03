import { useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { Draggable } from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import zhCnLocale from '@fullcalendar/core/locales/zh-cn';
import type { EventContentArg, EventDropArg } from '@fullcalendar/core';
import type { DateClickArg, EventReceiveArg, EventResizeDoneArg } from '@fullcalendar/interaction';
import { ProgressBar } from '../components/ProgressBar';
import { usePlannerData } from '../hooks/usePlannerData';
import type { Tag, Task } from '../types';
import { getTaskColorStyle } from '../utils/colors';
import { sortTasksByDeadline } from '../utils/taskSorting';

function formatDuration(minutes?: number) {
  if (!minutes) {
    return '00:45';
  }

  const hours = Math.floor(minutes / 60);
  const restMinutes = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(restMinutes).padStart(2, '0')}`;
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

export function MainWorkspacePage() {
  const {
    tasks,
    unfinishedTasks,
    tags,
    scheduleBlocks,
    isLoading,
    createScheduleBlock,
    updateScheduleBlockTime,
  } = usePlannerData();
  const calendarRef = useRef<FullCalendar | null>(null);
  const taskPoolRef = useRef<HTMLDivElement | null>(null);
  const [isTaskPoolOpen, setIsTaskPoolOpen] = useState(true);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<CalendarViewId>('dayGridMonth');

  const sortedUnfinishedTasks = useMemo(() => sortTasksByDeadline(unfinishedTasks), [unfinishedTasks]);
  const activeTask = unfinishedTasks.find((task) => task.id === activeTaskId);

  useEffect(() => {
    if (!taskPoolRef.current) {
      return undefined;
    }

    const draggable = new Draggable(taskPoolRef.current, {
      itemSelector: '.draggable-task',
      eventData: (eventElement) => ({
        title: eventElement.getAttribute('data-title') ?? '未命名任务',
        duration: eventElement.getAttribute('data-duration') ?? '00:45',
        extendedProps: {
          taskId: eventElement.getAttribute('data-task-id'),
        },
      }),
    });

    return () => draggable.destroy();
  }, []);

  const events = useMemo(
    () =>
      scheduleBlocks.map((block) => {
        const task = tasks.find((item) => item.id === block.taskId);
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
    [scheduleBlocks, tags, tasks],
  );

  async function handleEventReceive(info: EventReceiveArg) {
    const taskId = info.event.extendedProps.taskId as string | undefined;

    if (!taskId || !info.event.start) {
      info.event.remove();
      return;
    }

    const plannedDate = info.event.startStr.slice(0, 10);
    const startText = info.event.allDay ? undefined : info.event.startStr;
    const endText = info.event.allDay || !info.event.end ? undefined : info.event.endStr;

    info.event.remove();
    await createScheduleBlock(taskId, plannedDate, startText, endText);
    setActiveTaskId(null);

    if (info.event.allDay) {
      calendarRef.current?.getApi().changeView('timeGridDay', plannedDate);
    }
  }

  async function handleEventDrop(info: EventDropArg) {
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

  function handleDateClick(info: DateClickArg) {
    if (info.view.type === 'dayGridMonth') {
      calendarRef.current?.getApi().changeView('timeGridDay', info.dateStr);
    }
  }

  function handleViewChange(viewId: CalendarViewId) {
    calendarRef.current?.getApi().changeView(viewId);
    setCurrentView(viewId);
  }

  function renderEventContent(info: EventContentArg) {
    const task = tasks.find((item) => item.id === info.event.extendedProps.taskId);
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
          {info.timeText || '未排具体时间'}
          {task ? ` · ${priorityLabels[task.priority]}优先级 · ${task.progress.percent}%` : ''}
        </span>
      </div>
    );
  }

  return (
    <section className={`workspace-page${isTaskPoolOpen ? ' with-pool' : ''}`}>
      <div className="workspace-main">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">主工作台</p>
            <h2>把任务拖到日历里</h2>
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
              allDayText="未排具体时间"
              dateClick={handleDateClick}
              dayCellClassNames={(arg) =>
                activeTask?.deadline === formatDateKey(arg.date) ? ['deadline-highlight'] : []
              }
              dayMaxEvents={3}
              displayEventTime
              droppable
              editable
              eventResizableFromStart
              events={events}
              eventContent={renderEventContent}
              eventReceive={(info) => void handleEventReceive(info)}
              eventDrop={(info) => void handleEventDrop(info)}
              eventResize={(info) => void handleEventResize(info)}
              datesSet={(info) => setCurrentView(info.view.type as CalendarViewId)}
              height="auto"
              moreLinkClick="day"
              nowIndicator
            />
          )}
        </div>
      </div>

      <aside className={`task-pool-drawer${isTaskPoolOpen ? ' open' : ''}`} ref={taskPoolRef}>
        <div className="drawer-header">
          <div>
            <p className="eyebrow">任务池</p>
            <h3>未完成任务</h3>
          </div>
          <span>{sortedUnfinishedTasks.length} 个</span>
        </div>

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
                className={`drawer-task draggable-task priority-${task.priority}`}
                style={taskCardStyle}
                data-task-id={task.id}
                data-title={task.title}
                data-duration={formatDuration(task.estimatedMinutes)}
                onMouseDown={() => setActiveTaskId(task.id)}
                onMouseUp={() => setTimeout(() => setActiveTaskId(null), 500)}
                onTouchStart={() => setActiveTaskId(task.id)}
              onTouchEnd={() => setTimeout(() => setActiveTaskId(null), 500)}
            >
                <div className="task-card-top drawer-task-top">
                  <div>
                    <div className="task-title-row">
                      <span className="task-color-dot" aria-hidden="true" />
                      <strong>{task.title}</strong>
                    </div>
                  </div>
                  <span className="task-card-grip drawer-task-grip" aria-hidden="true" />
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
