#!/bin/sh
# Builds dist/corbit.ocmod.zip for Extensions > Installer.
# The zip name ("corbit") becomes the extension code, so do not rename it.
set -e
cd "$(dirname "$0")"
rm -rf dist
mkdir -p dist
(cd src && zip -r -X ../dist/corbit.ocmod.zip . -x '.*')
echo "Built dist/corbit.ocmod.zip"
