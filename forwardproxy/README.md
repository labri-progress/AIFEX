## build
docker build -t aifexproxy . 

## run
docker run --env CONNECTION_URL=http://localhost/join?sessionId=aDqKOmrkN&modelId=G8pDzH6lM SCRIPT_LOCATION=http://localhost/static/test.js -v ${PWD}/certificates:/root/.mitmproxy -p 8000:8000 -d aifexproxy