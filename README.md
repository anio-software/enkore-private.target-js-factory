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

## Asset

(to be written)

## Project

(to be written)
