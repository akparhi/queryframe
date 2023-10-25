[![NPM][npm-shield]][npm-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]

## Documentation

> This library implements a highly opinionated way of fetching and managing API data.

Queryframe is a typesafe API SDK generator for REST endpoints and exposes hooks from the amazing @tanstack/react-query.

## Tech

Queryframe uses a number of open source projects under the hood:

- [ReactQuery] - v5!
- [Zod] - for schemas
- [Zocker] - 2kb library to generate mock data
- [Redaxios] - minimal fetch wrapper with axios interface

## Installation

Install the dependencies and follow the guide below.

```sh
pnpm add @inkheart/queryframe
```

## Example Usage

```typescript
import { createQueryframeBuilder, z } from '@inkheart/queryframe'

const builder = createQueryframeBuilder({
  baseURL: 'https://api.sampleapis.com',
})

const getAvatars = builder.createQuery({
  endpoint: '/avatar/info',
  output: z
    .object({
      synopsis: z.string(),
    })
    .array(),
})

const { queryframe } = builder.createQueryframe({
  getAvatars,
})

export default queryframe
export const queryClient = builder.queryClient
export { QueryClientProvider } from '@inkheart/queryframe'
```

#### useQuery interface

```typescript
import queryframe from '...'

const { data } = await queryframe.getExpenseCategories.useQuery(
  {},
  {
    refetchInterval: data => 1000,
  },
)
```

#### Handle interface

```typescript
import queryframe from '...'

try {
  const result = await queryframe.getExpenseCategories.handle({})
} catch (error) {
  console.error(error)
}
```

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[npm-shield]: https://img.shields.io/npm/v/@inkheart/queryframe?style=for-the-badge
[npm-url]: https://www.npmjs.com/package/@inkheart/queryframe
[contributors-shield]: https://img.shields.io/github/contributors/akparhi/queryframe.svg?style=for-the-badge
[contributors-url]: https://github.com/akparhi/queryframe/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/akparhi/queryframe.svg?style=for-the-badge
[forks-url]: https://github.com/akparhi/queryframe/network/members
[stars-shield]: https://img.shields.io/github/stars/akparhi/queryframe.svg?style=for-the-badge
[stars-url]: https://github.com/akparhi/queryframe/stargazers
[issues-shield]: https://img.shields.io/github/issues/akparhi/queryframe.svg?style=for-the-badge
[issues-url]: https://github.com/akparhi/queryframe/issues
[license-shield]: https://img.shields.io/github/license/akparhi/queryframe.svg?style=for-the-badge
[license-url]: https://github.com/akparhi/queryframe/blob/main/LICENSE
[ReactQuery]: https://tanstack.com/query/v5
[Zod]: https://zod.dev/
[Redaxios]: https://github.com/developit/redaxios
[Zocker]: https://github.com/LorisSigrist/zocker/
