export type Res<T> =
  | {
      status: "success";
      data: T;
    }
  | { status: "error"; message: string };