const TAG_COUNT = 8;

export const TAG_COLOR_NAMES = [
  "Gray", "Brown", "Orange", "Yellow", "Green", "Blue", "Purple", "Pink",
] as const;

export function hashTagIndex(tag: string): number {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) & 0xffff;
  }
  return hash % TAG_COUNT;
}

export function getTagStyleByIndex(idx: number): { backgroundColor: string; color: string } {
  return {
    backgroundColor: `var(--tag-${idx}-bg)`,
    color: `var(--tag-${idx}-text)`,
  };
}

export function getTagStyle(tag: string): { backgroundColor: string; color: string } {
  return getTagStyleByIndex(hashTagIndex(tag));
}
