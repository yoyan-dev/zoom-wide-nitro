import { getQuery, type H3Event } from "h3";

type QueryParser<T> = (value: unknown, field: string) => T;

type QueryShape<T> = {
  [K in keyof T]: QueryParser<T[K]>;
};

export function parseQuery<T>(event: H3Event, shape: QueryShape<T>): T {
  const query = getQuery(event);
  const result = {} as T;

  for (const key of Object.keys(shape) as Array<keyof T>) {
    const parser = shape[key];
    result[key] = parser(query[key as string], String(key));
  }

  return result;
}
