FROM mitmproxy/mitmproxy

# Create app directory
WORKDIR /root

RUN pip install bs4 
COPY ./addons addons

CMD mitmdump -p 8000 --anticache -s addons/injecterAddon.py --set scriptlocation="http://localhost/static/AIFEXScript.js" --set block_global=false '~t "text/html"'