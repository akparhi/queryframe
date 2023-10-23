import {
  QueryClient,
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClientConfig,
} from '@tanstack/react-query'
import redaxios from 'redaxios'
import { z } from 'zod'
import { QueryframeHandler, type CreateHandler } from './core'
import { type ErrorHandler } from './error'
import { HttpMethods, MethodTypes, type Header } from './utils'

//  Queryframe routes & Queryframe initiator
export type QueryframeRoutes<T extends QueryframeRoutes = object> = {
  [key: string]: T | QueryframeHandler | any
}

class Queryframe<Routes extends QueryframeRoutes> {
  constructor(public queryframe: Routes) {}
}

//  Exposed class
//  Query builder
type QueryframeBuilderParams = {
  onError?: ErrorHandler
  log?: boolean
  baseURL?: string
  headers?: Header
  skipStrictParse?: boolean
  queryClient?: QueryClient
  queryClientConfig?: QueryClientConfig
}

class QueryframeBuilder {
  public ctx: QueryframeBuilderParams
  public queryClient: QueryClient

  constructor(public config: QueryframeBuilderParams) {
    this.ctx = config
    this.queryClient =
      config.queryClient || new QueryClient(config.queryClientConfig)
  }

  public createQuery: CreateHandler = routeParams =>
    new QueryframeHandler({
      onError:
        this.ctx.onError ||
        (err => {
          throw err
        }),
      log: this.ctx.log || false,
      queryClient: this.queryClient,
      skipStrictParse: this.ctx.skipStrictParse || false,
      type: MethodTypes.QUERY,

      //  inbuilt request handler
      method: HttpMethods.get,
      baseURL: this.ctx.baseURL || '',
      headers: this.ctx.headers || (() => ({})),
      endpoint: routeParams.endpoint || '',
      transformResponse: routeParams.transformResponse || (data => data),

      //  handler config params
      mock: routeParams.mock || false,
      //  handler fixed params
      refract: routeParams.refract || (((data: any) => data.output) as any),
      outputSchema: routeParams.output,

      //  dynamic params
      paramsSchema: routeParams.params,
      querySchema: routeParams.query,
      bodySchema: routeParams.body,
    })

  public createMutation: CreateHandler = routeParams =>
    new QueryframeHandler({
      onError:
        this.ctx.onError ||
        (err => {
          throw err
        }),
      log: this.ctx.log || false,
      queryClient: this.queryClient,
      skipStrictParse: this.ctx.skipStrictParse || false,
      type: MethodTypes.MUTATION,

      //  inbuilt request handler
      method: routeParams.method || HttpMethods.post,
      baseURL: this.ctx.baseURL || '',
      headers: this.ctx.headers || (() => ({})),
      endpoint: routeParams.endpoint || '',
      transformResponse: routeParams.transformResponse || (data => data),

      //  handler config params
      mock: routeParams.mock || false,
      //  handler fixed params
      refract: routeParams.refract || (((data: any) => data.output) as any),
      outputSchema: routeParams.output,

      //  dynamic params
      paramsSchema: routeParams.params,
      querySchema: routeParams.query,
      bodySchema: routeParams.body,
    })

  public createQueryframe = <Routes extends QueryframeRoutes>(
    routes: Routes,
  ): Queryframe<Routes> => new Queryframe(routes)
}

export const createQueryframeBuilder = (config: QueryframeBuilderParams) =>
  new QueryframeBuilder(config)

export {
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  z,
  redaxios,
}
