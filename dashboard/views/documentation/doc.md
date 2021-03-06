Overview
=========

AIFEX (_AI For Exploratory testing_) is dedicated to exploratory testing.
It helps testers to collaborate during exploratory test sessions.
It advises them to perform interactions that have rarely or never been explored. 
The main advantage is that it promotes diversity of tests.

AIFEX consists of two main elements:

* A central server that stores all interactions performed by testers, integrates them into an AI and returns predictions calculated by the AI indicating future interactions that should be performed by testers.
* A chrome plugin that listens to all interactions performed by testers, transmits them to the server, requests predictions for future interactions and visually highlights the expected interaction.

The following figure shows an exploratory session with three testers. Each tester uses a (chrome) browser to perform certain tests. The server receives all interactions performed by the testers and forms an AI. The server then gives predictions to the testers, advising them to perform new or poorly explored interactions.

![Image](/static/images/connexion.png){.mx-auto .d-block width=50%} 

Quick Start
===========

Install the Chrome extension
----------------------------

<video controls width="700">
    <source src="/static/video/aifex-chrome-plugin.mp4" type="video/mp4">
</video>

To install the Chrome extension on your Chrome browser follow these steps:

1. Download the [Chrome Extenstion](/static/dist.zip)
2. Unpack it where you want in your computer (you should have a **dist** directory) 
3. On a chrome browser, open the extension management chrome://extensions/. The extension management page can also be opened by clicking on the Chrome menu, hovering over Other Tools and then selecting Extensions.
4. Activate the Developer mode by clicking on the toggle switch next to the Developer mode.
5. Click on the **LOAD UNPACKED** button and select the **dist** directory. 
6. Load extension


Join the Demo session
-----------------------

<video controls width="700">
    <source src="/static/video/aifex-user-guide-eng.mp4" type="video/mp4">
</video>

A demo session is available. You can join it and perform some explorations:

1. Go to [Demo session main page](/demo)
2. Copy the **session key** 
3. Open a new chrome window (**with only one tab**)
4. Open the AIFEX extension and connect it
5. Set your name and restart a new exploration
6. Interact with the marked elements 
7. Stop your exploration so that it can be stored by the server





New Session
===========

To start a new session:

**STEP 1**: Go to the New Session page.

![Image](/static/images/session/NewSession.png){.mx-auto .d-block width=50%}

**STEP 2**: Select a **website** that defines which parts of the web site are under test. Set the **baseURL** of the session that will be used as a starting point for all test cases. The **depth** defines the maximum length of sequence of actions that are used by the AI. The **interpolation** defines if long sequences are more important that short ones.

![Image](/static/images/session/NewSessionPage.png){.mx-auto .d-block width=50%}

**STEP 3:** Create the session. The dashboard gives you a connection code. Share this code among all testers, so that they can join the test session.

![Image](/static/images/session/NewSessionDashboard.png){.mx-auto .d-block width=50%}


New Website
============

AIFEX only listens to some of the actions that are performed by a tester.
These actions must be configured by [creating a new WebSite](/config/create).

The WebSite form contains three input fields:
* The **name** of the WebSite is just a given name for the WebSite.
* The **mappingList** is a json document that contains an array of **mapping rules**.



Write your own mapping rules
----------------------------------

A mapping rule has :
* a  `match` part that specifies which kind of JavaScript events should be captured, 
* an `output` part that explains how the captured events are translated to AIFEX actions, which can be learnt by the AI.

```json{.line-numbers}
{
        "match": { 
            "event":"click",
            "selector":"input.btGreen.btS.jsValidForm"
        },
        "output": {
            "prefix":"AddToBasket"
        }
}
```     

In this example, the **click** events are captured but only if the target that emits them is reachable by the **input.btGreen.btS.jsValidForm** CSS selector.
If such an event is emitted, it is translated to an AIFEX action whose name is composed by the **AddToBasket** prefix.

### Match definition

The `match` part is used to specify how JavaScript events are captured:

* event (required). The kind of the JavaScript. We handle the following kinds: "change", "click", "input", "scroll", "submit", "keypress", "keyup", "keydown", "reset", "drag", "drop", "mousedown", "mouseup"
* selector (required). A CSS selector used to identify which elements must be a target of the event.
* code (optional): If the event is "keypress", "keyup" ou "keydown", this field specifies the code of the key.

### Output definition

The `output` part defines how events are translated into AIFEX actions. An AIFEX action has a name that is composed of two parts: a prefix and a suffix.

*   **prefix**: A string that names the AIFEX action. For example "AddToBasket" or "SendMail" or "SearchFor".
*   **suffix**: 
    *   **value** The suffix will contain the value of the element target of the captured event. 
    *   **index** The suffix will correspond to the index of the element if the `match.selector` returns a list of elements.
    *   **innerText** The suffix will contain the innerText of the element target of the captured event.

### Example 1

```json{.line-numbers}
{
    "match": {
        "event":"click",
        "selector":"#hBskt"
    },
    "output": {
        "prefix":"BasketButtonClicked"
    }
}
```      

This rule captures a click on performed on the element with id = hBskt
The AIFEX action will be named BasketButtonClicked.

### Example 2

The purpose of this rule is to create a specific AIFEX action when the user fills in the search bar and presses the Enter key. 
This rule captures a keyup event on the Enter key, and creates an action consisting of the Search prefix, and the value contained in the element recognized by the `.hSrcInput > input` selector.

```json{.line-numbers}
{
    "match": {
        "event":"keyup",
        "code":"Enter",
        "selector":".hSrcInput > input"
    },
    "output": {
        "prefix":"Search",
        "suffix":"value"
    }
}
```

### Example 3

This rule captures a click event on the items of a list. 
The CSS selector selects every li of the list. 
Clicking on any element of the list will trigger this rule. The created word, is made of the prefix `SearchSelect` and the index of item clicked in the list. 
Clicking on the first element of the list will create a word containing `SearchSelect`, and the value `1`.

```json{.line-numbers}
{
    "match": {
        "event":"click",
        "selector":".hSrcComp > ul > li"
    },
    "output": {
        "prefix":"SearchSelect",
        "suffix":"index"
    }
}
```

### Example 4

This rule captures a click on the title of a product. The created word contains the prefix `ProductTitleClick`, and as value the text contained in the element. In this case, the value is the title of the product.

```json{.line-numbers}
{
    "match": {
        "event":"click",
        "selector":"#fpZnPrdMain > div.fpTMain > div.fpDesCol > h1"
    },
    "output": {
        "prefix":"ProductTitleClick",
        "suffix":"innerText"
    }
}
```



Annex 1 - Create a CSS selector with Chrome{data-toc-text="Annex 1 - Create a CSS selector"}
===========================================

The chrome dev tools can create the CSS selector needed to create your own configuration. Let us consider that you want to create a mapping rule for a given element The match part of the mapping rule requires a CSS selector, this selector can easily be obtained following these steps :

![Image](/static/images/css-selector1.png){.mx-auto .d-block width=50%}

STEP 1 : Open Chrome Dev Tools : Press F12 to open the Chrome Dev Tools, or right-click / inspect, on the element you want to map.

STEP 2: Use the Chrome Dev Tools Selector to select the target element

![Image](/static/images/css-selector2.png){.mx-auto .d-block width=50%}

STEP 3: Get the CSS Selector

![Image](/static/images/css-selector3.png){.mx-auto .d-block width=50%}

STEP 4: Tune and test the copied selector The selector provided by chrome is maybe too specific. You may want to tune it First test the copied selector (in the console of the Chrome Dev Tools) enter: document.querySelector(‘copiedSelector’) Second, check that is does select the element you want to target. Third, tune the selector and test it again until it is short and still matches the element(s) you want to be matched.

The following figure shows two tries. The second one is shorter and still matches the target element.

![Image](/static/images/css-selector4.png){.mx-auto .d-block width=50%}

Annex 2 - Extended Example
===============================

```json{.line-numbers}
[
    {
        "match": {
            "event":"click",
            "selector":"input.btGreen.btS.jsValidForm"
        },
        "output": {
            "prefix":"AddToBasket",
            "suffix": "index"
        }
    },
    {
        "match": {
            "event":"click",
            "selector":"#hBskt"
        },
        "output": {
            "prefix":"BasketButtonClick"
        }
    },
    {
        "match": {
            "event":"change",
            "selector":"#facetsList label"
        },
        "output": {
            "prefix":"FilterClick",
            "suffix":"index"
        }       
    },
    {
        "match": {
            "event":"click",
            "selector":"#lpBloc img.prdtBImg"
        },
        "output": {
            "prefix":"ItemPictureClick",
            "suffix":"index"
        }
    },
    {
        "match": {
            "event":"click",
            "selector":"div.prdtBILDetails > a"
        },
        "output": {
            "prefix": "ItemTitleClick",
            "suffix": "index"
        }
    },
    {
        "match": {
            "event":"click",
            "selector":".bSummaryOrderLink"
        },
        "output": {
            "prefix":"OrderClick"
        }
    },
    {
        "match": {
            "event":"change",
            "selector":"div.bProductLineDescBottomQuantity.jsBProductLineDescBottomQuantity > select"
        },
        "output": {
            "prefix":"QuantitySelect",
            "suffix":"value"
        }
    },
    {
        "match": {
            "event":"click",
            "selector":"div.bProductLineDescBloc > div.bProductLineDescBottom > form > span:nth-child(7)"
        },
        "output": {
            "prefix": "RemoveItemClick",
            "suffix": "index"
        }
    },
    {
        "match": {
            "event":"click",
            "selector":".hSrcInput > input"
        },
        "output": {
            "prefix":"SearchClick"
        }
    },
    {
        "match": {
            "event":"keyup",
            "code":"Enter",
            "selector":".hSrcInput > input"
        },
        "output": {
            "prefix":"Search",
            "suffix":"value"
        }
    },
    {
        "match": {
            "event":"click",
            "selector":".hSrcComp > ul > li"
        },
        "output": {
            "prefix":"SearchSelect",
            "suffix":"index"
        }
    },
    {
        "match": {
            "event":"click",
            "selector": "#hFull > div.hSearch > div.hSrcInput > button"
        },
        "output": {
            "prefix":"SearchButtonClick"
        }
    },
    {
        "match": {
            "event": "click",
            "selector": ".btGreen.btF"
        },
        "output": {
            "prefix": "ShowBasket"
        } 
    },
    {
        "match": {
            "event": "click",
            "selector":"#lpBloc div.prdtBILDetails > div.prdtBILDesc.jsPrdtBILLink"
        },
        "output": {
            "prefix": "ShowDescription",
            "suffix": "index"
        }
    },
    {
        "match": {
            "event": "change",
            "selector":"#lpSort > form > select"
        },
        "output": {
            "prefix": "ChangeSortMode",
            "suffix":"value"
        }
    },
    {
        "match": {
            "event": "change",
            "selector": "#lpBloc div.prdtBILDetails div.prdtBILTwoSel select"
        },
        "output": {
            "prefix": "ChangeSize",
            "suffix":"value"
        }       
    }
]
```
