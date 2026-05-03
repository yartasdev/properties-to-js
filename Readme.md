# Properties to JS ![Build Status](https://github.com/yartasdev/properties-to-js/actions/workflows/ci.yml/badge.svg) [![codecov](https://codecov.io/github/yartasdev/properties-to-js/graph/badge.svg?token=VHGMRTS9A7)](https://codecov.io/github/yartasdev/properties-to-js)

Convert `.properties` files to JavaScript, TypeScript, or JSON format with flexible options for key transformation and flattening.

**Package:** [`@yartasdev/properties-to-js`](https://www.npmjs.com/package/@yartasdev/properties-to-js) · **CLI binary:** `properties-to-js`

## Features

- 🔄 **Multiple Output Formats**: Convert to `.js`, `.ts`, or `.json`
- 🎯 **Nested Structure Support**: Automatically unflatten nested keys (e.g., `app.name` → `{ app: { name: ... } }`)
- 📦 **Flatten Option**: Optionally flatten nested keys with a custom delimiter
- 🔤 **Case Transformation**: Convert keys to uppercase or lowercase
- 🛠️ **CLI & Programmatic**: Use as a command-line tool or import as a module
- 📝 **Prettier Formatting**: Auto-formatted output for better readability

## Installation

Global install:

```bash
npm install -g @yartasdev/properties-to-js
```

Project dependency:

```bash
npm install @yartasdev/properties-to-js
```

## Usage

### Command line

After a global install, use the `properties-to-js` binary:

```bash
# Basic usage — output type must match file extension (-t defaults to json)
properties-to-js -i input.properties -o output.js -t js

# TypeScript
properties-to-js -i input.properties -o output.ts -t ts

# JSON (extension .json matches default -t json)
properties-to-js -i input.properties -o output.json

# With options (still set -t to match the output extension)
properties-to-js -i input.properties -o output.js -t js --uppercase --flatted -d "_"
```

### Run with npx (no install)

You can run the CLI without installing the package globally. `npx` downloads and executes the published package; use the scoped name `@yartasdev/properties-to-js`:

```bash
npx @yartasdev/properties-to-js -i input.properties -o output.js -t js
```

More examples:

```bash
npx @yartasdev/properties-to-js -i input.properties -o output.ts -t ts
npx @yartasdev/properties-to-js -i input.properties -o output.json
npx @yartasdev/properties-to-js -i input.properties -o output.js -t js --uppercase --flatted -d "_"
```

If your shell forwards flags incorrectly, put `--` before the CLI arguments:

```bash
npx @yartasdev/properties-to-js -- -i input.properties -o output.js -t js
```

When the package is installed locally, you can also use `npx` from the project root (same binary name):

```bash
npx properties-to-js -i input.properties -o output.js -t js
```

#### CLI options

| Option | Short | Description | Default |
|--------|-------|-------------|---------|
| `--input` | `-i` | Path to the `.properties` file | **Required** |
| `--output` | `-o` | Path to the output file (must include extension) | **Required** |
| `--type` | `-t` | Output format: `json`, `js`, or `ts` (must match file extension) | `json` |
| `--delimiter` | `-d` | Delimiter for flattened keys | `.` |
| `--flatted` | `-f` | Flatten nested keys into a single level | `false` |
| `--uppercase` | `-u` | Convert all keys to uppercase | `false` |
| `--lowercase` | `-l` | Convert all keys to lowercase | `false` |

### Programmatic usage

#### `convertForFile` — read a file, write a file

Paths are resolved relative to `process.cwd()`. The output file extension must match `type` (e.g. `type: 'js'` → `*.js`).

```typescript
import { Converter } from '@yartasdev/properties-to-js';

await Converter.convertForFile({
  input: 'config.properties',
  output: 'config.js',
  type: 'js',
  flatted: false,
  uppercase: false,
  lowercase: false,
  delimiter: '.',
});
```

#### `convertForContent` — string in, string out

Use this when you already have `.properties` text (e.g. from an HTTP body or in-memory config). It does not read or write the filesystem; it returns the formatted module or JSON string (via Prettier), same as the file APIs.

```typescript
import { Converter } from '@yartasdev/properties-to-js';

const propertiesSource = `
app.name=Demo
app.port=3000
`;

const tsModule = await Converter.convertForContent({
  content: propertiesSource,
  type: 'ts',
  flatted: false,
  delimiter: '.',
  uppercase: false,
  lowercase: false,
});

// tsModule is a string like: export default { ... };
```

Optional fields match the CLI: `flatted`, `delimiter`, `uppercase`, `lowercase`. `type` is required and must be `'json'`, `'js'`, or `'ts'`.

## Examples

### Input (config.properties)

```properties
# Application Configuration
app.name=MyApp
app.version=1.0.0
app.debug=true

# Database Settings
database.host=localhost
database.port=5432
database.name=mydb
```

### Output (default - nested structure)

```javascript
{
  app: {
    name: 'MyApp',
    version: '1.0.0',
    debug: 'true',
  },
  database: {
    host: 'localhost',
    port: '5432',
    name: 'mydb',
  },
}
```

### Output (with `--flatted --delimiter="_"`)

```javascript
{
  app_name: 'MyApp',
  app_version: '1.0.0',
  app_debug: 'true',
  database_host: 'localhost',
  database_port: '5432',
  database_name: 'mydb',
}
```

### Output (with `--uppercase`)

```javascript
{
  APP: {
    NAME: 'MyApp',
    VERSION: '1.0.0',
    DEBUG: 'true',
  },
  DATABASE: {
    HOST: 'localhost',
    PORT: '5432',
    NAME: 'mydb',
  },
}
```

## Development

### Build

```bash
npm run build
```

### Watch mode (TypeScript)

```bash
npm run start
```

### Tests

```bash
npm test
npm run test:coverage
```

### Test the CLI locally

```bash
npm link
properties-to-js -i test.properties -o test.js -t js
```

### Documentation site

```bash
npm run docs:dev
```

## Properties file format

Supports standard Java `.properties` format:

- Comments: Lines starting with `#` or `!`
- Key-value pairs: `key=value` or `key:value`
- Multiline values: Use `\` at end of line
- Escape sequences: `\n`, `\r`, `\t`, and Unicode escapes `\uXXXX`

## License

ISC

## Author

@yartasdev
