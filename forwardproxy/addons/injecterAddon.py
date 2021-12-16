# Usage: mitmdump -s "js_injector.py src"
# (this script works best with --anticache)
from bs4 import BeautifulSoup
from bs4.element import Script
from mitmproxy import ctx


class JSInjector:

    def load(self, loader):

        loader.add_option(
            name = "scriptlocation",
            typespec = str,
            default = "",
            help = "Define the path for the script that must be injected in the webpage",
        )

    def response(self, flow):
        html = BeautifulSoup(flow.response.content, features="html.parser")
        
        # To Allow CORS
        if "Content-Security-Policy" in flow.response.headers:
            del flow.response.headers["Content-Security-Policy"]

        if html.body and ('text/html' in flow.response.headers["content-type"]):
            scriptTag = BeautifulSoup('<script src="{script}" defer></script>'.format(script=ctx.options.scriptlocation))

            html.body.insert(len(html.body.contents), scriptTag)
            flow.response.text = str(html)

addons = [
    JSInjector()
]