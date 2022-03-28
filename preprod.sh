#!/bin/bash
echo ========================== PLUGIN COMPILATION ==================================

cd browser-extension/ 
npm install


export HOST_ADDR="aifexpreprod.ovh" #Domain name
export PROTOCOL="https"

export CERTIFICAT_SOURCE="/etc/letsencrypt" #Certificat source path
export CERTIFICAT_TARGET="/etc/letsencrypt" #Certificat target path
export NODE_ENV="production"

export PLUGIN_INFO="$(node -e 'console.log(JSON.stringify(require("./src/manifest.chrome.json")))')"

echo "PLUGIN_INFO = $PLUGIN_INFO"

npm run production
cd dist/firefox
zip -r ../../firefoxExtension .
cd ..
rm -fr firefox
zip -r ../chromeExtension ./chrome
cd ..
mv -f chromeExtension.zip ../dashboard/public
mv -f firefoxExtension.zip ../dashboard/public
cd ..

echo ========================== BROWSER SCRIPT COMPILATION ==================================
cd browser-script/ 
npm install

npm run production
cd dist
mv -f AIFEXScript.js ../../dashboard/public
cd ../..



echo ========================== CONTAINER DOWN ==================================

docker-compose -f docker-compose.yml -f docker-compose.production.yml down

VOLUMES=$(docker volume ls | awk '{if(NR>1) print $NF}')

echo ========================== VOLUMES CLEANING ==================================

VOLUMES_TO_KEEP[0]=db-data
VOLUMES_TO_KEEP[1]=screenshot
 
for volume in $VOLUMES
do
    must_be_deleted=true
    for volume_to_keep in ${VOLUMES_TO_KEEP[*]}
    do
      if [[ $volume =~ .*$volume_to_keep.* ]];
      then
        must_be_deleted=false
      fi
    done
    if $must_be_deleted = true; then
        docker volume rm $volume 
    fi
done

echo ========================== CONTAINER BUILDING ==================================
docker-compose -f docker-compose.yml -f docker-compose.production.yml up --build
