import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  type QueryKey,
  type UseInfiniteQueryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query'
import redaxios from 'redaxios'
import { ZodType } from 'zod'
import { createMock } from 'zodock'
import { NETWORK_ERROR, QUERYFRAME_ERROR, QueryframeError } from '../error'
import { MethodTypes, pathParams, sleep } from '../utils'
import { AbstractHandler, FirstHandler, type Handler } from './handler'
import { type PartialHandlerParams } from './types'
import {
  DataValidator,
  type DataParser,
  type InferDataParser,
} from './validator'

export class QueryframeHandler<
  Refract extends (...args: any[]) => any = any,
  Output extends DataParser<Record<any, any>> = never,
> extends AbstractHandler {
  private handler: Handler
  public ctx: PartialHandlerParams & {
    refract: Refract
    outputSchema?: Output
  }

  public constructor(
    public config: PartialHandlerParams & {
      refract: Refract
      outputSchema?: Output
    },
  ) {
    super()
    this.ctx = config
    const firstHandler: Handler = new FirstHandler()

    let _handler = firstHandler

    //  TODO: we also need to validate:
    //  1. baseURL is an url
    //  2. endpoint starts with '/'
    if (!this.ctx.skipStrictParse) {
      if (config.paramsSchema)
        _handler = _handler.setNext(
          new DataValidator(config.paramsSchema, 'params'),
        )
      if (config.querySchema)
        _handler = _handler.setNext(
          new DataValidator(config.querySchema, 'query'),
        )
      if (config.bodySchema)
        _handler = _handler.setNext(
          new DataValidator(config.bodySchema, 'body'),
        )
    }

    this.handler = firstHandler
  }

  private throwFormattedError = (
    error: QueryframeError,
    data?: Omit<Parameters<Refract>[0], 'output'>,
  ) => {
    throw new QueryframeError({
      code: error.code,
      message:
        error.message +
        (this.ctx.baseURL
          ? ` at ${this.ctx.method?.toUpperCase()}::${pathParams(
              this.ctx.endpoint,
              data?.params,
            )}`
          : ''),
      cause: error.cause || data,
    })
  }

  private log = (
    message: string,
    data?: Omit<Parameters<Refract>[0], 'output'>,
  ) => {
    // eslint-disable-next-line no-console
    console.info(
      `${this.ctx.method?.toUpperCase()}::${pathParams(
        this.ctx.endpoint,
        data?.params,
      )}: ${message}`,
    )
  }

  /**
   *
   * If the resolver returns an error, we stop the chain and return it
   * otherwise we add the result in the mid data of the next resolver
   * If there is no next handler, we return the last result
   */
  public handle = async (
    data: Omit<Parameters<Refract>[0], 'output'>,
  ): Promise<
    InferDataParser<Output> extends never
      ? ReturnType<Refract>
      : InferDataParser<Output>
  > => {
    const t1 = performance.now()
    let res
    if (!this.ctx.skipStrictParse) {
      //  Runs validations before resolve
      res = await this.handler.handle(data)
      if (res instanceof QueryframeError) this.throwFormattedError(res, data)
    }

    if (
      this.ctx.mock &&
      this.ctx.outputSchema &&
      this.ctx.outputSchema instanceof ZodType
    ) {
      await sleep(Math.floor(Math.random() * (200 - 40 + 1) + 40))
      res = createMock(this.ctx.outputSchema)
    } else {
      //  Begin resolution
      if (this.ctx.baseURL) {
        try {
          const { data: result } = await redaxios({
            headers: this.ctx.headers?.(),
            method: this.ctx.method,
            baseURL: this.ctx.baseURL,
            url: pathParams(this.ctx.endpoint, data.params),
            params: data.query,
            data: data.body,
          })
          res = this.ctx.transformResponse(result)
          res = await this.ctx.refract({ ...data, output: res })
        } catch (error: any) {
          const { status }: { status: keyof typeof NETWORK_ERROR } = error
          this.throwFormattedError(
            new QueryframeError({
              code: NETWORK_ERROR[status] || QUERYFRAME_ERROR.API_ERROR,
              message: error?.message || 'axios error',
              cause: error.data,
            }),
            data,
          )
        }
      } else res = await this.ctx.refract(data)

      //  validate final response if there's an output schema
      if (!this.ctx.skipStrictParse && this.ctx.outputSchema)
        res = await new DataValidator(this.ctx.outputSchema).validate(res)
    }

    if (res instanceof QueryframeError) this.throwFormattedError(res, data)

    if (this.ctx.log)
      this.log(
        `${
          this.ctx.baseURL
            ? this.ctx.mock &&
              this.ctx.outputSchema &&
              this.ctx.outputSchema instanceof ZodType
              ? 'mocked'
              : 'fetched'
            : 'resolved'
        } in: ${Math.floor(performance.now() - t1)}ms`,
      )
    return res
  }

  public getKey = (input?: Omit<Parameters<Refract>[0], 'output'>) => {
    const stringKey = '' + this.ctx.baseURL + +'' + this.ctx.endpoint
    return (input ? [stringKey, input] : [stringKey]) as QueryKey
  }

  public useMutation = (
    input: Omit<Parameters<Refract>[0], 'output'>,
    options?: Pick<
      UseMutationOptions,
      | 'onMutate'
      | 'onError'
      | 'onSuccess'
      | 'onSettled'
      | 'retry'
      | 'retryDelay'
      | 'cacheTime'
      | 'networkMode'
    >,
  ) => {
    if (!this.ctx.baseURL || this.ctx.type !== MethodTypes.MUTATION)
      this.throwFormattedError(
        new QueryframeError({
          code: QUERYFRAME_ERROR.BAD_INPUT,
          message:
            'useMutation is only available for mutations with inbuilt fetcher',
        }),
        input,
      )

    return useMutation(() => this.handle(input), options)
  }

  public invalidate = (input?: Omit<Parameters<Refract>[0], 'output'>) => {
    if (
      !this.ctx.baseURL ||
      this.ctx.type !== MethodTypes.MUTATION ||
      !this.ctx.queryClient
    )
      this.throwFormattedError(
        new QueryframeError({
          code: QUERYFRAME_ERROR.BAD_INPUT,
          message:
            'invalidate is only available for queries with inbuilt fetcher & queryclient',
        }),
        input,
      )

    this.ctx.queryClient?.invalidateQueries(this.getKey(input))
  }

  public useQuery = <
    TQueryFnData extends InferDataParser<Output> extends never
      ? ReturnType<Refract>
      : InferDataParser<Output>,
    SelectFn extends (p: TQueryFnData) => SelectFnData,
    SelectFnData = TQueryFnData,
  >(
    input: Omit<Parameters<Refract>[0], 'output'>,
    option?: Pick<
      UseQueryOptions<TQueryFnData, QueryframeError, ReturnType<SelectFn>>,
      'networkMode' | 'cacheTime' | 'onError' | 'enabled'
    > & {
      select?: (p: TQueryFnData) => SelectFnData
      refetchInterval?: number | false | ((p?: SelectFnData) => number | false)
      onSuccess?: (p?: SelectFnData) => void
    },
  ) => {
    if (!this.ctx.baseURL || this.ctx.type !== MethodTypes.QUERY)
      this.throwFormattedError(
        new QueryframeError({
          code: QUERYFRAME_ERROR.BAD_INPUT,
          message:
            'useQuery is only available for queries with inbuilt fetcher',
        }),
        input,
      )

    return useQuery<TQueryFnData, QueryframeError, SelectFnData>(
      this.getKey(input),
      ({ queryKey }) =>
        this.handle(queryKey?.[1] as Omit<Parameters<Refract>[0], 'output'>),
      option,
    )
  }

  public useInfiniteQuery = <
    TQueryFnData extends InferDataParser<Output> extends never
      ? ReturnType<Refract>
      : InferDataParser<Output>,
  >(
    input: Omit<Parameters<Refract>[0], 'output'>,
    options?: Pick<
      UseInfiniteQueryOptions<TQueryFnData, QueryframeError>,
      'networkMode' | 'enabled' | 'cacheTime'
    >,
  ) => {
    if (!this.ctx.baseURL || this.ctx.type !== MethodTypes.QUERY)
      this.throwFormattedError(
        new QueryframeError({
          code: QUERYFRAME_ERROR.BAD_INPUT,
          message:
            'useQuery is only available for queries with inbuilt fetcher',
        }),
        input,
      )

    return useInfiniteQuery<TQueryFnData, QueryframeError>(
      this.getKey(input),
      ({ queryKey, pageParam = 1 }: { queryKey: any; pageParam?: number }) =>
        this.handle({
          ...queryKey?.[1],
          query: {
            ...queryKey?.[1]?.query,
            page: pageParam,
          },
        } as Omit<Parameters<Refract>[0], 'output'>),
      options,
    )
  }
}
