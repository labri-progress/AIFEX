#!/bin/bash
echo
echo ======= Removing previous container =========
docker rm $(docker stop $(docker ps -a -q --filter ancestor=aifexproxy --format="{{.ID}}"))
echo ======= Building new container =========
docker build -t aifexproxy . 
echo ======= Running new container =========
docker run --env CONNECTION_URL=$1 --env SCRIPT_LOCATION=http://localhost/static/AIFEXScript.js -v ${PWD}/certificates:/root/.mitmproxy -p 8000:8000 -d aifexproxy