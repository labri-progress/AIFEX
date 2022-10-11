Overview
=========

AIFEX (_AI For Exploratory testing_) is dedicated to exploratory testing.
It helps testers to collaborate during exploratory test sessions.
It advises them to perform interactions that have rarely or never been explored. 
The main advantage is that it promotes diversity of tests.

AIFEX consists of two main elements:

* A central server that stores all interactions performed by testers, integrates them into an AI and returns predictions calculated by the AI indicating future interactions that should be performed by testers.
* A chrome plugin that listens to all interactions performed by testers, transmits them to the server, requests predictions for future interactions and visually highlights the expected interaction.

The following figure shows an exploratory session with three testers. Each tester participate to the same Exploratory Testing session. They use the AIFEX browser extension to send their tests, called explorations, to the AIFEX server. The server receives all interactions performed by the testers and train an AI. The server then gives predictions to the testers, advising them to perform new or poorly explored interactions.

![Image](/static/images/doc/aifex_doc1.png){.mx-auto .d-block width=100%} 



Try AIFEX by creating a new session
===========

**STEP 0**: Create your own account and log in.

**STEP 1**: Go to the New Session page <http://localhost/account/account>.

![Image](/static/images/doc/create.png){.mx-auto .d-block width=75%}

**STEP 2**: Give a **Name** to your session. Set the **Web Application URL** of the session that will be used by AIFEX to record the actions. Give a **Description**.

![Image](/static/images/doc/createSessionForm.png){.mx-auto .d-block width=75%}

**STEP 3:** Create the session. The dashboard gives you a connection URL. Share this URL among all testers, so that they can join the test session.
The URL.
It is also this URL that allows testers to connect to the session on the browser extension.
![Image](/static/images/doc/connexionURL.png){.mx-auto .d-block width=50%}


Use the plugin
-----------

Stop / Save : Stop your exploration and send it to the server.

Add a new observation to your exploration : Adds a observation to your exploration, which will be available in the dashboard. You can add a screenshot to your observation by checking the corresponding checkbox.

