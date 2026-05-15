/**
 * Deterministic tag color assignment using Notion's semantic color palette.
 * Each tag consistently maps to the same color based on its name.
 */

const TAG_COUNT = 8;

function tagIndex(tag: string): number {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) {
    hash = (hash * 31 + tag.charCodeAt(i)) & 0xffff;
  }
  return hash % TAG_COUNT;
}

export function getTagStyle(tag: string): { backgroundColor: string; color: string } {
  const idx = tagIndex(tag);
  return {
    backgroundColor: `var(--tag-${idx}-bg)`,
    color: `var(--tag-${idx}-text)`,
  };
}
