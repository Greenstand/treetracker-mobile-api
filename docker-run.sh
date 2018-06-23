#!/bin/bash

docker kill mobile-api
docker rm mobile-api
if [ ! -f config.js ]; then
  echo "Creating empty config file"
  touch config.js
fi
docker run -p3000:3000 -v $PWD/config.js:/opt/server/config.js --name=mobile-api treetracker-mobile-api:1
