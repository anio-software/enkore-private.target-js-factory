#!/bin/bash -euf

if [[ "$RELEASE_VERSION" == vp* ]]; then
	npm publish --provenance --access public
else
	npm publish --access public
fi
