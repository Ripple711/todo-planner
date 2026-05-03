import type { Tag, Task } from '../types';

export const neutralTaskColor = '#BCC7BE';

export const morandiTagColors = ['#AFC0B1', '#AEB9C9', '#C7B8A8', '#B7C5B3', '#B8B1C8', '#C5AFA6'];

const legacyColorMap: Record<string, string> = {
  '#8FA397': '#AFC0B1',
  '#8191A3': '#AEB9C9',
  '#A59C8F': '#C7B8A8',
  '#9C9F83': '#B7C5B3',
  '#B99B86': '#C7B8A8',
  '#8A9A9A': '#BCC7BE',
};

export type TaskColorStyle = {
  base: string;
  surface: string;
  border: string;
  text: string;
};

export function getPrimaryTag(task: Task, tags: Tag[]) {
  return tags.find((tag) => task.tagIds.includes(tag.id));
}

export function getTaskBaseColor(task: Task, tags: Tag[]) {
  const tagColor = getPrimaryTag(task, tags)?.color;

  if (!tagColor) {
    return neutralTaskColor;
  }

  return legacyColorMap[tagColor.toUpperCase()] ?? tagColor;
}

export function getTaskColorStyle(task: Task | undefined, tags: Tag[]): TaskColorStyle {
  const base = task ? getTaskBaseColor(task, tags) : neutralTaskColor;

  return {
    base,
    surface: mixWithWhite(base, 0.76),
    border: mixWithWhite(base, 0.38),
    text: '#34413A',
  };
}

function mixWithWhite(hex: string, whiteAmount: number) {
  const normalized = hex.replace('#', '');
  const red = parseInt(normalized.slice(0, 2), 16);
  const green = parseInt(normalized.slice(2, 4), 16);
  const blue = parseInt(normalized.slice(4, 6), 16);

  const mix = (value: number) => Math.round(value * (1 - whiteAmount) + 255 * whiteAmount);

  return `rgb(${mix(red)}, ${mix(green)}, ${mix(blue)})`;
}
