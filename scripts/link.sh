#!/bin/bash

set -e

# Copied from https://github.com/ef4/ember-auto-import/blob/9e48e9ec9639ce05ca2a2688581ea41fdd627c5c/scripts/link-them.sh

# All packages get a node_modules directory and a .bin link
for package in "01-basic-app" "02-app-that-excludes-mirage"; do
    mkdir -p ./test-projects/$package/node_modules
    pushd ./test-projects/$package/node_modules > /dev/null
    rm -rf .bin
    ln -s ../../../node_modules/.bin .bin
    popd > /dev/null
done

# These packages get to depend on ember-cli-mirage
for package in "01-basic-app" "02-app-that-excludes-mirage"; do
    pushd ./test-projects/$package/node_modules > /dev/null
    rm -rf ./ember-cli-mirage
    ln -s ../../.. ./ember-cli-mirage
    popd > /dev/null
done
