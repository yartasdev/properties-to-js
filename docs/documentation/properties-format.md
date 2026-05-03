# .properties format

The package supports typical Java `.properties` syntax.

## Comments

Lines starting with `#` or `!` are treated as comments and ignored.

## Keys and values

- Assignment uses `=` or `:` (the first unescaped delimiter on the line wins).
- Leading and trailing whitespace is trimmed.

## Multiline values

A trailing `\` joins the next physical line (the newline and following whitespace are removed as part of continuation handling).

## Escape sequences

| Sequence | Meaning |
| -------- | ------- |
| `\n` | Newline |
| `\r` | Carriage return |
| `\t` | Tab |
| `\uXXXX` | Unicode code point |
| `\ ` `\=` `\:` `\!` `\#` | Literal space, equals, colon, bang, hash |

## Example

```properties
# Application
app.name=Demo
app.features.enabled=true

# Multiline
message=Hello world \
    continued text
```

This text is first turned into a flat `key → string value` map, then into a nested or flat structure according to the [options](./options).
