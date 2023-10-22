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
import { HttpMethods, MethodTypes, type Header } from './utils'

type QueryframeBuilderParams = {
  baseURL?: string
  headers?: Header
  skipStrictParse?: boolean
  queryClientConfig?: QueryClientConfig
}

class QueryframeBuilder {
  public ctx: QueryframeBuilderParams
  public queryClient?: QueryClient

  constructor(public config: QueryframeBuilderParams) {
    this.ctx = config
    this.queryClient = new QueryClient(config.queryClientConfig)
  }

  public createQuery: CreateHandler = routeParams =>
    new QueryframeHandler({
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
}

export const createQueryframeBuilder = (config: QueryframeBuilderParams) =>
  new QueryframeBuilder(config)

//  Queryframe routes & Queryframe initiator
export type QueryframeRoutes<T extends QueryframeRoutes = object> = {
  [key: string]: T | QueryframeHandler | any
}

class Queryframe<Routes extends QueryframeRoutes> {
  constructor(public queryframe: Routes) {}
}

export const createQueryframe = <Routes extends QueryframeRoutes>(
  routes: Routes,
): Queryframe<Routes> => new Queryframe(routes)

export {
  QueryClientProvider,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
  z,
  redaxios,
}
