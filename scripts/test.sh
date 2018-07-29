#!/bin/bash

./scripts/parallel --tag <<EOF
cd test-apps/basic-app && yarn test:fastboot
yarn test:browser
EOF
