# Findings

## Project Notes
- Workspace: `C:\Users\79863\Documents\New project 3`
- Existing Vite-style project files are present.
- Dependencies already include React, Vite, TypeScript, React Router, localForage, and FullCalendar packages.
- Existing implementation has routes, pages, seed data, types, and storage service, but user-facing copy is mostly English.
- New direction requires merging Calendar and Planner into a single Main Workspace with calendar plus collapsible task pool.
- FullCalendar interaction plugin can support external dragging from task cards into the calendar.
- FullCalendar `timeGridWeek` is the correct 7-day vertical time-axis view; `dayGridMonth` remains the month grid for dropping tasks onto a day.
- `dayMaxEvents={3}` plus `moreLinkClick="day"` gives a compact month overview while keeping Day view as the detail surface.
- Calendar color inheritance should be computed from persisted task/tag data at event generation time: `ScheduleBlock.taskId` -> `Task.tagIds[0]` -> `Tag.color`.
- FullCalendar accepts per-event `backgroundColor`, `borderColor`, and `textColor`; using these avoids one global CSS event color overriding every scheduled block.
- The old CSS rain-line approach was removed. The rain-glass effect is now canvas-based: droplets and trails are drawn as particles, and the background image is sampled with small offsets inside droplet shapes to simulate refraction.
- The local `references/rain-shader-reference.glsl` file is currently empty, so the shader port preserves Heartfelt attribution from the known original source and adapts the core DropLayer/StaticDrops/Drops logic into WebGL1-compatible GLSL.
