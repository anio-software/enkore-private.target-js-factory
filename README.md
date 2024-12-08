# @fourtune/realm-js

---

This package is used for all fourtune JavaScript/TypeScript projects.

Realm options:

```ts
options: {
	external_npm_packages: [],
	runtime: "node" | "browser" | "agnostic"
}
```

# Basic Folder Structure

```
assets/
src/
    export/
          [module_name]/
                        <export_name>
           <export_name>
```

`src/export` is a special location where every file represents a **named** export.

For example `src/export/MyFunction.mts` would result in a named export `MyFunction` in the default module.

# APIs

The realm exposes three main APIs that are all versioned under the same number. These APIs work dynamically (i.e. by just executing the project's code) as well as when bundling. Special measures are taken so that the resulting bundle size is optimized.

## Runtime

The runtime API provides a way of handling logging.

```js
import {createContext} from "@fourtune/realm-js/v0/runtime"

//
// createContext creates a wrapped context instance
// which then can be passed to libraries supporting
// the fourtune runtime API.
//
const wrapped_context = createContext()
```

The following options can be set to modify the behaviour of the created context:

|Name|Signature|Description
|---|---|---|
|shouldLog|`(context, level, pkg, tag): boolean`|Determine whether to log a message or not.|
|logWithLevel|`(context, level, lines): void`|Log a message with a specified level.|
|getCurrentLogLevel|`(context): LogLevel`|Get the current log level. (possibly from the environment)|
|printLine|`(context, line): void`|Print a line.|

## Asset

```js
import {getAsset} from "@fourtune/realm-js/v0/assets"
```

## Project

(to be written)
