#!/bin/bash -euf

npm run build "$RELEASE_VERSION"

cd src/realm-js && npm publish --provenance --access public
