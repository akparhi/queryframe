import * as z from 'zod'
import { createQueryframe, createQueryframeBuilder } from '../'

const coreApiSchema = z.object({
  status: z.boolean(),
  statusCode: z.number(),
  message: z.string(),
  data: z
    .object({
      id: z.string().uuid(),
    })
    .array(),
})

const builder = createQueryframeBuilder({
  baseURL: 'https://stage.alaanpay.com/accounting',
  headers: () => ({
    'X-Access-Platform': 'CORPORATE_DASHBOARD_WEB',
  }),
})
const helloEndpoint = builder.createQuery({
  refract: () => 'Hello World',
})

const updateMe = builder.createMutation({
  query: z.object({ a: z.string() }),
  body: z.object({
    name: z.string(),
  }),
  output: z.object({
    a: z.number(),
  }),
  refract: data => data.output,
})

const getExpenseCategories = builder.createQuery({
  endpoint: '/expense-category',
  mock: true,
  query: z.object({
    name: z.string(),
  }),
  output: coreApiSchema,
})

//
const { queryframe } = createQueryframe({
  hello: helloEndpoint,
  update: updateMe,
  getExpenseCategories,
})

export default queryframe

export const init = async () => {
  setTimeout(async () => {
    try {
      // const result = await api.update.handle({
      //   query: { a: 'f' },
      //   body: {
      //     name: 'hu',
      //   },
      // })
      const { data } = await queryframe.getExpenseCategories.useInfiniteQuery({
        query: {
          name: 'hu',
        },
      })
      // eslint-disable-next-line no-console
      console.log(data)
      // const {data} =api.update.useQuery({
      //   headers: { a: 'f' },
      //   query: { a: 'f' },
      //   body: {
      //     name: 'hu',
      //   },
      // })
    } catch (error) {
      console.error(error)
    }
  }, 500)
}
