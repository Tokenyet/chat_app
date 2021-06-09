import 'utility-types/dist/mapped-types';

declare module 'utility-types/dist/mapped-types' {

  export type FunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? K : never;
  }[keyof T];
  export type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;
  export type NonFunctionPropertyNames<T> = {
    [K in keyof T]: T[K] extends Function ? never : K;
  }[keyof T];
  export type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;
}

import 'utility-types/dist/index';

declare module 'utility-types/dist/index' {
  export type None = null | undefined
  export type Nullable<T> = T | None
}