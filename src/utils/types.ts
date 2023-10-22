//  Util types
export type AnyObject = Record<any, any>

export type Prettify<T> = {
  [K in keyof T]: T[K]
} & object

export type ExcludeNeverKeysObj<T> = {
  [key in KeysWithValNotEmptyObject<T> & keyof T]: T[key]
}

export type KeysWithValNotEmptyObject<T> = keyof {
  [P in keyof T as keyof T[P] extends never ? never : P]: P
}

//  misc types
export type Header = () => AnyObject

//  enums
export enum MethodTypes {
  QUERY = 'QUERY',
  MUTATION = 'MUTATION',
}

export enum HttpMethods {
  'get' = 'get',
  'post' = 'post',
  'put' = 'put',
  'patch' = 'patch',
  'delete' = 'delete',
}
