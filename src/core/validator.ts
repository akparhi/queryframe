import { QUERYFRAME_ERROR, QueryframeError } from '../error'
import { AbstractHandler, type Handler, type HandlerParams } from './handler'

type ZodParser<T = any> = {
  parse: (input: any) => T
}

export type DataParser<T = any> = ZodParser<T>

export type InferDataParser<Val extends DataParser> = Val extends DataParser<
  infer Output
>
  ? Output
  : any

/**
 *  This handler is used to validate data from the params, query, body or output
 */
export class DataValidator<Output = any> extends AbstractHandler {
  public output!: Output

  constructor(
    private parser: DataParser<Output>,
    private dataToValidate: 'params' | 'query' | 'body' | 'schema' = 'schema',
  ) {
    super()
  }

  public handle: Handler['handle'] = async data => {
    if (this.dataToValidate === 'schema') return super.handle(data)

    try {
      this.parser.parse(data[this.dataToValidate])

      return super.handle(data)
    } catch (error) {
      return new QueryframeError({
        code: QUERYFRAME_ERROR.BAD_INPUT,
        message: `${this.dataToValidate} schema validation error`,
        cause: error,
      })
    }
  }

  public validate: Handler['handle'] = async data => {
    try {
      const output = this.parser.parse(data)

      return super.handle(output as HandlerParams)
    } catch (error) {
      return new QueryframeError({
        code: QUERYFRAME_ERROR.BAD_OUTPUT,
        message: `output schema validation error`,
        cause: error,
      })
    }
  }
}
