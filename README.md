# @fourtune/realm-js

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

```ts
import {createContext} from "@fourtune/realm-js/v0/runtime"

//
// createContext creates a wrapped context instance
// which then can be passed to libraries supporting
// the fourtune runtime API.
//
const wrapped_context = createContext({
    // example where the created context would log 
    // all messages regardless of log level
    shouldLog() {
        return true
    }
})

// ----- a package using the fourtune runtime api will do something like this internally: ----- 
import {useContext} from "@fourtune/realm-js/runtime"
//                                           ^ not versioned because
//                                             useContext is designed to work
//                                             with any API version

//
// useContext asserts that the wrapped_context
// is of the specified version
//
const context = useContext(wrapped_context, 0)

// package actually using the context
context.log.info("Hello from the package")
```

The following options can be set to modify the behaviour of the created context:

|Name|Signature|Description
|:---|:---|:---|
|tag|`string`|A string that identifies the context.|
|shouldLog|`(ctx, level, pkg, tag): boolean`|Determine whether to log a message or not.|
|logWithLevel|`(ctx, level, lines): void`|Log a message with a specified level.|
|getCurrentLogLevel|`(ctx): LogLevel`|Get the current log level. (possibly from the environment)|
|printLine|`(ctx, line): void`|Print a line.|

---

### Log Levels

Log levels are represented, not by a number, but by a string:

|Name|Description|
|:---|:---|
|`emerg` (to be implemented)|Unrecoverable error.|
|`error`||
|`warn`||
|`info`||
|`debug`||
|`trace`||

	
## Asset

The asset API provides a simple way to embed static resources in the resulting product.

Assets must be located inside the `/assets/` folder and can be of any type.

Every asset can be loaded through a different protocol yielding different representations of the same asset:

```ts
getAsset("protocol://path/to/asset")
```

For example, a TypeScript asset can be bundled up before being embedded into the product or accessed in its raw form with `text://`:

```ts
import {getAsset} from "@fourtune/realm-js/v0/assets"

// result: bundled javascript code
getAsset("js-bundle://test.mts")

// result: source code of "test.mts" as is
getAsset("text://test.mts")
```

> [!WARNING]  
> It's advised to only ever pass string literals into `getAsset` in order for the bundle optimization to work.
> 
> If a dynamic variable is passed, **every** asset going through **every** protocol will be embedded into the product. 

---

### Protocols

|Protocol|Description|
|:---|:---|
|`text://`|Return the file contents as a string.|
|`js-bundle://`|Strip TypeScript types, bundle JavaScript code.|

## Project

(to be written)
