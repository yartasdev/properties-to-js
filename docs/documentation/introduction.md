# Introduction

**properties-to-js** is a small Node.js tool and npm package (`@yartasdev/properties-to-js`) that reads Java `.properties` files and produces **JavaScript**, **TypeScript**, or **JSON** output.

## What it does

- Turn config files (`application.properties`, etc.) into modules you can use in front-end or Node projects.
- Automatically expand flat dotted keys (`db.host`, `db.port`) into nested objects.
- Optionally flatten keys (`flatted`) and transform key casing to upper or lower case.

## Flow at a glance

1. Parse a `.properties` file or string (comments, escapes, multiline values).
2. Process the flat key–value map with `unflatten` or `flatten`, depending on options.
3. Format for the chosen output type and write to a file or return a string.

Next steps: [Installation](./installation), [CLI](./cli), or [Programmatic API](./programmatic).
