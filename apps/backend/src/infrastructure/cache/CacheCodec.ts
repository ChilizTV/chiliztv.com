/**
 * JSON codec for cache values that round-trips `bigint` and `Date` losslessly.
 * Plain `JSON.stringify` throws on `bigint` and silently degrades `Date` to a
 * string; both types are common in this codebase (token amounts, computedAt
 * timestamps), so the cache layer normalises them via tagged markers.
 *
 * The marker shape `{ __t: 'bigint' | 'date', v: '...' }` is deliberately
 * unlikely to collide with caller payloads.
 */
const BIGINT_TAG = 'bigint';
const DATE_TAG = 'date';

interface TaggedValue {
  __t: typeof BIGINT_TAG | typeof DATE_TAG;
  v: string;
}

// JSON.stringify invokes `Date.prototype.toJSON` before the replacer sees the
// value, so the `value` parameter is already an ISO string for Date instances.
// Accessing the parent via `this[key]` recovers the raw Date so we can tag it.
function replacer(this: unknown, key: string, value: unknown): unknown {
  const parent = this as Record<string, unknown> | unknown[] | null;
  const raw = parent != null && typeof parent === 'object'
    ? (parent as Record<string, unknown>)[key]
    : value;
  if (raw instanceof Date) {
    return { __t: DATE_TAG, v: raw.toISOString() } satisfies TaggedValue;
  }
  if (typeof value === 'bigint') {
    return { __t: BIGINT_TAG, v: value.toString() } satisfies TaggedValue;
  }
  return value;
}

function reviver(_key: string, value: unknown): unknown {
  if (value && typeof value === 'object' && '__t' in value && 'v' in value) {
    const { __t, v } = value as TaggedValue;
    if (typeof v !== 'string') return value;
    if (__t === BIGINT_TAG) return BigInt(v);
    if (__t === DATE_TAG) return new Date(v);
  }
  return value;
}

export function encodeForCache(value: unknown): string {
  return JSON.stringify(value, replacer);
}

export function decodeFromCache<T>(raw: string): T {
  return JSON.parse(raw, reviver) as T;
}
