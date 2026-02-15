export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;

export interface Loadable<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export type AsyncState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: string };

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
