export type RichNode =
  | { kind: 'text'; value: string }
  | { kind: 'element'; tag: string; children: RichNode[] }
  | { kind: 'slot'; index: number; children: RichNode[] };

const inlineTags = new Set([
  'strong', 'b', 'em', 'i', 'u', 's', 'small', 'code', 'mark', 'sub', 'sup', 'span'
]);
const voidTags = new Set(['br']);
const tokenPattern = /<(\/?)([a-z]+|\d)\s*(\/?)>/gi;

const parseCache = new Map<string, RichNode[]>();

export function hasRichMarkup(text: string): boolean {
  if (!text.includes('<')) return false;
  tokenPattern.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(text)) !== null) {
    const name = match[2].toLowerCase();
    if (/^\d$/.test(name) || inlineTags.has(name) || voidTags.has(name)) return true;
  }

  return false;
}

export function parseRichText(text: string): RichNode[] {
  const cached = parseCache.get(text);
  if (cached) return cached;

  const parsed = buildNodes(text);
  parseCache.set(text, parsed);
  return parsed;
}

function buildNodes(text: string): RichNode[] {
  const root: RichNode[] = [];
  const stack: RichNode[][] = [root];
  const openTags: string[] = [];
  let cursor = 0;

  const top = () => stack[stack.length - 1];

  // Appends to the trailing text node when there is one, so literal tokens and the prose
  // around them do not split into fragments the renderer would space out.
  const pushText = (value: string) => {
    if (!value) return;
    const siblings = top();
    const last = siblings[siblings.length - 1];
    if (last?.kind === 'text') last.value += value;
    else siblings.push({ kind: 'text', value });
  };

  tokenPattern.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = tokenPattern.exec(text)) !== null) {
    const [token, closer, rawName, selfClosing] = match;
    const name = rawName.toLowerCase();
    const isSlot = /^\d$/.test(name);
    const known = isSlot || inlineTags.has(name) || voidTags.has(name);

    pushText(text.slice(cursor, match.index));
    cursor = match.index + token.length;

    if (!known) {
      pushText(token);
      continue;
    }

    if (closer) {
      const depth = openTags.lastIndexOf(name);
      if (depth === -1) {
        pushText(token);
        continue;
      }
      stack.length = depth + 1;
      openTags.length = depth;
      continue;
    }

    if (voidTags.has(name)) {
      top().push({ kind: 'element', tag: name, children: [] });
      continue;
    }

    const children: RichNode[] = [];
    top().push(
      isSlot
        ? { kind: 'slot', index: Number(name), children }
        : { kind: 'element', tag: name, children }
    );

    if (!selfClosing) {
      stack.push(children);
      openTags.push(name);
    }
  }

  pushText(text.slice(cursor));
  return root;
}
