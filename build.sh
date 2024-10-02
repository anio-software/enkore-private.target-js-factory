#!/bin/bash -eufx

node ./build/runtimeFiles.mjs

node ./build/writeRealmAutoFiles.mjs "$@"
