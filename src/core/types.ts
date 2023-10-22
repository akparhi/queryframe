import { type QueryClient } from '@tanstack/react-query'
import {
  type ExcludeNeverKeysObj,
  type Header,
  type HttpMethods,
  type MethodTypes,
  type Prettify,
} from '../utils'
import { type QueryframeHandler } from './queryframe'
import { type DataParser, type InferDataParser } from './validator'

export interface QueryframeParams<
  Refract = any,
  Params extends DataParser<Record<any, any>> = never,
  Query extends DataParser<Record<any, any>> = never,
  Body extends DataParser<Record<any, any>> = never,
  Output extends DataParser<Record<any, any>> = never,
> {
  transformResponse?: (data: any) => any
  method?: HttpMethods
  endpoint?: string
  mock?: boolean
  params?: Params
  query?: Query
  body?: Body
  refract?: Refract
  output?: Output
}

export type CreateHandler = <
  Refract extends (
    p: Prettify<
      ExcludeNeverKeysObj<{
        params: InferDataParser<Params> extends never
          ? object
          : InferDataParser<Params>
        query: InferDataParser<Query> extends never
          ? object
          : InferDataParser<Query>
        body: InferDataParser<Body> extends never
          ? object
          : InferDataParser<Body>
        output: InferDataParser<Output> extends never
          ? object
          : InferDataParser<Output>
      }>
    >,
  ) => InferDataParser<Output> extends never ? Res : InferDataParser<Output>,
  Res,
  Params extends DataParser<Record<string, any>> = never,
  Query extends DataParser<Record<string, any>> = never,
  Body extends DataParser<Record<any, any>> = never,
  Output extends DataParser<Record<any, any>> = never,
>(
  p: QueryframeParams<Refract, Params, Query, Body, Output>,
) => QueryframeHandler<Refract, Output>

export type PartialHandlerParams = {
  queryClient?: QueryClient
  skipStrictParse?: boolean
  type: MethodTypes

  baseURL?: string
  headers?: Header
  endpoint?: string
  transformResponse: (data: any) => any
  method?: HttpMethods
  mock?: boolean

  paramsSchema?: DataParser
  querySchema?: DataParser
  bodySchema?: DataParser
}
