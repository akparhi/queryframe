import { type AnyObject } from './types'

// Originally taken from pillarjs/path-to-regexp package:
const PATH_REGEXP = new RegExp(
  [
    // Match escaped characters that would otherwise appear in future matches.
    // This allows the user to escape special characters that won't transform.
    '(\\\\.)',
    // Match express-style parameters and un-named parameters with a prefix
    // and optional suffixes. Matches appear as:
    //
    // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
    // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
    // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
    '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))',
  ].join('|'),
  'g',
)

function parse(str: string) {
  const tokens = []
  let key = 0
  let index = 0
  let path = ''
  let res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    const m = res[0]
    const escaped = res[1]
    const offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    const prefix = res[2]
    const name = res[3]
    const suffix = res[6]

    const repeat = suffix === '+' || suffix === '*'
    const optional = suffix === '?' || suffix === '*'
    const delimiter = prefix || '/'

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
    })
  }

  // Match any characters still remaining.
  if (index < str.length) path += str.substr(index)

  // If the path exists, push it onto the end.
  if (path) tokens.push(path)

  return tokens
}

export const pathParams = (path: string = '', params: AnyObject = {}) =>
  parse(path).reduce(function (acc: string, curr) {
    if (typeof curr === 'string') return acc

    const value = params[curr.name]
    if (!value) throw new Error(`missing path param in ${path}: ` + curr.name)

    const type = typeof value
    if (type !== 'string' && type !== 'number')
      throw new Error(
        `invalid type for path param in ${path}: ` + curr.name + ' = ' + type,
      )

    const replace = new RegExp(':' + curr.name, 'g')
    return acc.replace(replace, value)
  }, path)
