import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface TableOptions {
  /** Applied in order, e.g. [['order_index', true], ['created_at', false]]. */
  orderBy: Array<[column: string, ascending: boolean]>;
  /** Equality filters, e.g. [['published', true]]. */
  filters?: Array<[column: string, value: string | number | boolean]>;
}

interface Row {
  id: string;
  order_index?: number;
}

/**
 * Loads a table and exposes create / update / remove / reorder helpers that keep the local list in sync.
 * `options` must be stable (declare it outside the component or memoize it).
 */
export function useTable<T extends Row, Input extends object>(table: string, options: TableOptions) {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let query = supabase.from(table).select('*');
    for (const [column, value] of options.filters ?? []) {
      query = query.eq(column, value);
    }
    for (const [column, ascending] of options.orderBy) {
      query = query.order(column, { ascending });
    }

    void query.then(({ data, error: fetchError }) => {
      if (cancelled) return;
      if (fetchError) {
        console.error(`${table} error:`, fetchError);
        setError(fetchError.message);
      } else {
        setItems((data ?? []) as T[]);
        setError(null);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [table, options]);

  /** New rows go to the end of the list unless an order_index is given. */
  const create = useCallback(
    async (payload: Input & { order_index?: number }) => {
      const nextIndex = items.reduce((max, item) => Math.max(max, item.order_index ?? 0), 0) + 1;
      const { data, error: createError } = await supabase
        .from(table)
        .insert({ ...payload, order_index: payload.order_index ?? nextIndex })
        .select()
        .single();

      if (createError) throw createError;
      setItems((current) => [...current, data as T]);
      return data as T;
    },
    [table, items],
  );

  const update = useCallback(
    async (id: string, payload: Partial<Input>) => {
      const { data, error: updateError } = await supabase
        .from(table)
        .update(payload as Record<string, unknown>)
        .eq('id', id)
        .select()
        .single();

      if (updateError) throw updateError;
      setItems((current) => current.map((item) => (item.id === id ? (data as T) : item)));
      return data as T;
    },
    [table],
  );

  const remove = useCallback(
    async (id: string) => {
      const { error: deleteError } = await supabase.from(table).delete().eq('id', id);

      if (deleteError) throw deleteError;
      setItems((current) => current.filter((item) => item.id !== id));
    },
    [table],
  );

  /**
   * Saves a new order for the given ids (a whole list or one group of it).
   * Updates the UI immediately and rolls back if the database refuses.
   */
  const reorder = useCallback(
    async (orderedIds: string[]) => {
      const previous = items;
      const position = new Map(orderedIds.map((id, index) => [id, index + 1]));
      const applyOrder = (list: T[]) =>
        list
          .map((item) => (position.has(item.id) ? { ...item, order_index: position.get(item.id) } : item))
          .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

      setItems(applyOrder);
      const results = await Promise.all(
        orderedIds.map((id, index) => supabase.from(table).update({ order_index: index + 1 }).eq('id', id)),
      );
      const failed = results.find((result) => result.error);
      if (failed?.error) {
        setItems(previous);
        throw failed.error;
      }
    },
    [table, items],
  );

  return { items, loading, error, create, update, remove, reorder };
}
