/** URL-safe id for a category name, used as an anchor ("/skills#reseau-securite"). */
export function categoryAnchor(category: string) {
  return category
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/** Groups items by key, keeping the order in which each key first appears. */
export function groupBy<T>(items: T[], getKey: (item: T) => string): Array<[string, T[]]> {
  const groups = new Map<string, T[]>();

  for (const item of items) {
    const key = getKey(item);
    const group = groups.get(key);
    if (group) {
      group.push(item);
    } else {
      groups.set(key, [item]);
    }
  }

  return Array.from(groups.entries());
}
