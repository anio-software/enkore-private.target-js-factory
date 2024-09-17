#!/bin/bash -euf

node ./build.mjs "$RELEASE_VERSION"

cd src/realm-js && npm publish --provenance --access public
