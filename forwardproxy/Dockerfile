FROM mitmproxy/mitmproxy

# Create app directory
WORKDIR /root
RUN /usr/local/bin/python -m pip install --upgrade pip
RUN pip install bs4 
COPY ./addons addons

CMD mitmdump -p 8000 --anticache --set console_eventlog_verbosity="error" -s addons/injecterAddon.py --set connectionURL=$CONNECTION_URL --set scriptlocation=$SCRIPT_LOCATION --set block_global=false '~t "text/html"'