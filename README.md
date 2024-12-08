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

# APIs

The realm exposes three main APIs that are all versioned under the same number. These APIs work dynamically (i.e. by just executing the project's code) as well as when bundling. Special measures are taken so that the resulting bundle size is optimized.

## Runtime

The runtime API provides a way of handling logging.

## Asset

(to be written)

## Project

(to be written)
