# AIFEX - Artificial Intelligence For Exploratory Testing

AIFEX makes Exploratory Simpler and efficient.

It starts and trains an AI model that will guide you while your are testing your web site.

## Run the AIFEX server

AIFEX is designed as a docker compose platform. 

To run it, you have to have a Docker Server that supports docker-compose, then just execute: 

    ./dev.sh

Then open http://localhost to create a new session.


## Use the online free server

Go to https://www.aifex.fr


## Look a the source code

AIFEX is composed of two main components:
* An extension for chrome or firefox that records tester's actions and that sends them to the Session and AI components (browser-extension directory).
* A server that manages exploratory testing sessions. The server is composed on several containers:
    * account : this container handles users' accounts.
    * dashboard : a web server that provides HTML pages for starting new exploratory session and looking at some analytics.
    * evaluator : this container helps tester to follow expected behavior when they test
    * initialization : this container creates the anonymous account and adds some websites and sessions to it
    * model : this container manages AI that will guide testers
    * printer : this container prints session into source code to replay them
    * reverseproxy : this container is a reverse proxy (nginx)
    * session : this container manages sessions of exploratory testing
    * test : this container runs tests
    * website : this container manages website configuraitons


## Citing AIFEX

We are researchers, therefore if you use AIFEX in an academic work we would be really glad if you cite our seminal paper using the following bibtex:

```
@inproceedings{DBLP:conf/icst/Leveau0RFR20,
  author    = {Julien Leveau and
               Xavier Blanc and
               Laurent R{\'{e}}veill{\`{e}}re and
               Jean{-}R{\'{e}}my Falleri and
               Romain Rouvoy},
  title     = {Fostering the Diversity of Exploratory Testing in Web Applications},
  booktitle = {13th {IEEE} International Conference on Software Testing, Validation
               and Verification, {ICST} 2020, Porto, Portugal, October 24-28, 2020},
  pages     = {164--174},
  publisher = {{IEEE}},
  year      = {2020},
  url       = {https://doi.org/10.1109/ICST46399.2020.00026},
  doi       = {10.1109/ICST46399.2020.00026},
  timestamp = {Wed, 12 Aug 2020 12:59:51 +0200},
  biburl    = {https://dblp.org/rec/conf/icst/Leveau0RFR20.bib},
  bibsource = {dblp computer science bibliography, https://dblp.org}
}
```