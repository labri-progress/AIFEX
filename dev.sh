#!/bin/bash

echo ========================== PLUGIN COMPILATION ==================================
cd browser-extension/ 
npm install
export HOST_ADDR="localhost"
export PROTOCOL="http"
export NODE_ENV="development"
export ELASTIC_PASSWORD="elastic"


npm run development
cd dist/firefox
zip -r ../../firefoxExtension .
cd ..
rm -fr firefox
zip -r ../chromeExtension ./chrome
cd ..
mv -f chromeExtension.zip ../dashboard/public
mv -f firefoxExtension.zip ../dashboard/public
cd ..

cd browser-extension/ 


export PLUGIN_INFO="$(node -e 'console.log(JSON.stringify(require("./src/manifest.chrome.json")))')"
cd ..

echo "PLUGIN_INFO = $PLUGIN_INFO"

echo ========================== CONTAINER DOWN ==================================

docker-compose -f docker-compose.yml -f docker-compose.development.yml down -v --remove-orphans

echo ========================== CONTAINER BUILDING ==================================

docker-compose -f docker-compose.yml -f docker-compose.development.yml up --build 
