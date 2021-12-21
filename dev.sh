#!/bin/bash
build=true
removeVolumes=false

echo $build
echo $removeVolumes
echo \

while getopts ":b|v" option; do
   case $option in
      b) # display Help
        build=false ;;
      v) 
        removeVolumes=true ;;
   esac
done

echo $build
echo $removeVolumes

echo ========================== PLUGIN COMPILATION ==================================
cd browser-extension/ 
npm install
export HOST_ADDR="localhost"
export PROTOCOL="http"
export NODE_ENV="development"
export ELASTIC_PASSWORD="el@st!c"
export TOKEN_SECRET="changeme"

npm run development
cd dist/firefox
zip -qr ../../firefoxExtension .
cd ..
rm -fr firefox
zip -qr ../chromeExtension ./chrome
cd ..
mv -f chromeExtension.zip ../dashboard/public
mv -f firefoxExtension.zip ../dashboard/public
cd ..

cd browser-extension/ 


export PLUGIN_INFO="$(node -e 'console.log(JSON.stringify(require("./src/manifest.chrome.json")))')"
cd ..

rm -rf .logs
mkdir .logs

echo ========================== CONTAINER DOWN ==================================
if [ $removeVolumes = true ]
then
    echo removing volumes
    docker-compose -f docker-compose.yml -f docker-compose.development.yml down -v --remove-orphans
else
    echo not removing volumes
    docker-compose -f docker-compose.yml -f docker-compose.development.yml down --remove-orphans
fi

echo ========================== CONTAINER BUILDING ==================================
if [ $build = true ]
then
    echo Building images
    docker-compose -f docker-compose.yml -f docker-compose.development.yml up --build
else
    echo No Build of images
    docker-compose -f docker-compose.yml -f docker-compose.development.yml up
fi