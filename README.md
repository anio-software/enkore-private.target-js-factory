# @fourtune/realm-js-and-web

This repository contains the implementation of realm-js and realm-web.

The two realms are in one repository because they share lots of code.

Structure:

```
./src/realm-js/    contains realm-js files

./src/runtime/     contains runtime files (that are shared between realm-js and realm-web)
```

### Notes

- The runtime is not provided in a separate package to reduce friction between the runtime and realm implementations.
