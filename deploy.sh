#!/bin/bash -xe

docker build -t zengweigang/daydayup:kibana-${TRAVIS_BUILD_NUMBER} .
set +x
docker login -u ${DOCKER_USER} -p ${DOCKER_PASSWORD} -e zengweigang@gmail.com
set -x
docker push zengweigang/daydayup:kibana-${TRAVIS_BUILD_NUMBER}
docker tag zengweigang/daydayup:kibana-${TRAVIS_BUILD_NUMBER}  zengweigang/daydayup:kibana-latest
docker push zengweigang/daydayup:kibana-latest