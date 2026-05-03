# API reference

## `Converter`

Static class; do not instantiate.

### `convertForFile(options): Promise<void>`

Reads from disk and writes the result to a file.

**Parameter:** `OptionsForFile`

- `input`, `output`, and `type` are required in practice.
- The `output` extension must match `.${type}`.

**Errors:** May throw `Error` on read/write failure or unsupported extension.

### `convertForContent(options): Promise<string>`

Parses the given string and returns formatted text.

**Parameter:** `OptionsForContent` — at least `content` and `type`.

## Types (`src/options.ts`)

- **`Options`** — `type`, optional `flatted`, `delimiter`, `uppercase`, `lowercase`
- **`OptionsForFile`** — `Options` plus `input`, `output`
- **`OptionsForContent`** — `Options` plus `content`
- **`JsonObject`**, **`JsonValue`** — generic JSON-compatible types

## Implementation note

Parsing and `flat` transforms live on private `Converter` methods; they are not part of the public API. Tests may use `(Converter as any).parse`; in application code, stick to the two public methods above.
