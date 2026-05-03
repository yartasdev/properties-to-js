# Programmatic API

Main class: **`Converter`** (`@yartasdev/properties-to-js`).

## File to file

`convertForFile` reads the input file, processes it, and writes the output.

```typescript
import { Converter } from '@yartasdev/properties-to-js';

await Converter.convertForFile({
  input: 'config.properties',
  output: 'config.json',
  type: 'json',
  flatted: false,
  delimiter: '.',
  uppercase: false,
  lowercase: false,
});
```

- `input` and `output` paths are joined with `process.cwd()`.
- On success, a green confirmation line is printed to the console.

## String in, string out

`convertForContent` does not touch the filesystem; it returns the result.

```typescript
import { Converter } from '@yartasdev/properties-to-js';

const out = await Converter.convertForContent({
  content: 'app.name=Demo\napp.port=3000',
  type: 'ts',
  flatted: false,
  delimiter: '.',
  uppercase: false,
  lowercase: false,
});
```

The return value is Prettier-formatted module or JSON text.

## The `type` field

| `type` | Output shape |
| ------ | -------------- |
| `json` | Formatted JSON text |
| `js` | `module.exports = { ... };` |
| `ts` | `export default { ... };` |

For the full field list, see [Options](./options) and [API reference](./api).
