# Examples

## Input (`config.properties`)

```properties
# Application
app.name=MyApp
app.version=1.0.0
app.debug=true

# Database
database.host=localhost
database.port=5432
database.name=mydb
```

## Default (nested)

`flatted: false` — dotted keys become nested objects:

```json
{
  "app": {
    "name": "MyApp",
    "version": "1.0.0",
    "debug": "true"
  },
  "database": {
    "host": "localhost",
    "port": "5432",
    "name": "mydb"
  }
}
```

Values stay **strings** (for example the literal `"true"`).

## Flattened (`flatted`, `delimiter: "_"`)

```json
{
  "app_name": "MyApp",
  "app_version": "1.0.0",
  "app_debug": "true",
  "database_host": "localhost",
  "database_port": "5432",
  "database_name": "mydb"
}
```

## Uppercase (`uppercase: true`)

Keys are transformed; shape stays nested or flat depending on options:

```json
{
  "APP": {
    "NAME": "MyApp",
    "VERSION": "1.0.0",
    "DEBUG": "true"
  },
  "DATABASE": {
    "HOST": "localhost",
    "PORT": "5432",
    "NAME": "mydb"
  }
}
```
