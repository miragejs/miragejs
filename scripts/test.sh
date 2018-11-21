#!/bin/bash

./scripts/parallel --tag <<EOF
yarn test:browser
cd test-projects/01-basic-app && yarn test:fastboot
cd test-projects/02-app-that-excludes-mirage && yarn test
EOF
