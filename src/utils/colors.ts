import type { Tag, Task } from '../types';

export const neutralTaskColor = '#A7B3AA';

export const morandiTagColors = ['#8FA6B7', '#8EA27F', '#B79B86', '#80956F', '#A39AB4', '#A98076'];

const legacyColorMap: Record<string, string> = {
  '#8FA397': '#8EA27F',
  '#8191A3': '#8FA6B7',
  '#A59C8F': '#B79B86',
  '#9C9F83': '#80956F',
  '#B99B86': '#B79B86',
  '#8A9A9A': '#A7B3AA',
  '#AFC0B1': '#8EA27F',
  '#AEB9C9': '#8FA6B7',
  '#C7B8A8': '#B79B86',
  '#B7C5B3': '#80956F',
  '#B8B1C8': '#A39AB4',
  '#C5AFA6': '#A98076',
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
