
Create or Update a Website
==========================

A WebSite is defined by three mandatory fields:
* A **name** that is just a given name for the WebSite.
* A **mappingList** that contains a list of **mapping rules** (in JSON) that will be executed by the AIFEX chrome extension while any testers will perform some explorations.


Write your own mapping rules
----------------------------

When a tester explores a web site, he/she performes some actions (click, change, etc.) that trigger some JavaScript events.
For each event, the AIFEX Chrome extension then tries to execute the first mapping rule that matches the event. 
An executed rules then build one abstract action that will be stored by AIFEX and that will be used by its AI to learn how tester behave. 

A mapping rule has three parts:
* the  `match` part that specifies the kind of JavaScript events that can execute the rule (eg click, change, etc.) and the CSS selector of their target DOM element, 
* the `output` part that explains how is built the AIFEX abstract action.


```json{.line-numbers}
{
        "match": { 
            "event":"click",
            "css":"input.btGreen"
        },
        "output": {
            "prefix":"AddToBasket"
        }
}
```     

In this example, if a **click** event is performed on a taget DOM element whose CSS selector is **input.btGreen**.
This rule will build an AIFEX abstract action composed by the **AddToBasket** prefix and that has no suffix.

### Match definition

The `match` part is used to specify how JavaScript events are captured:

* event (required). We handle the following kinds: "change", "click", "input", "scroll", "submit", "keypress", "keyup", "keydown", "reset", "drag", "drop", "mousedown", "mouseup"
* css or xpath (required). A CSS or XPath selector used to identify the target of the event.
* code (optional): If the event is "keypress", "keyup" or "keydown", this field specifies the code of the key. This is the physical key that was pressed, and not the character. For example, the key Enter from the numpad has a different code than the standard Enter key.
* key (optional): If the event is "keypress", "keyup" or "keydown",This field is related to the character that was typed. For example, if the key attribute is set to Enter, both numpad Enter and standard Enter will me matched by the rule. 
* attributeName (optional): The target must have the specified attribute defined in order to be selected. 

### Output definition

The `output` part defines how events are translated into AIFEX abstract actions. An AIFEX abstract action has a name that is composed of two parts: a prefix and a suffix.

*   **prefix**: A string. For example "AddToBasket" or "SendMail" or "SearchFor".
*   **suffix**: 
    *   **value** The suffix will contain the value of the target element. 
    *   **index** The suffix will correspond to the index of the target element if the `match.selector` returns a list of elements.
    *   **innerText** The suffix will contain the innerText of the target element.
    *   **cssSelector** The suffix will contain the CSS Selector of the target element (automatically generated)
    *   **attributeValue** The suffix will contain the value of the specified attribute for the target element. This suffix requires that the **attributeName** is defined in the match part

### Context (optional)

The `context` part defines the context where the rule can be executed. A context can be defined by a CSS or XPath selector or an URL
* css or xpath or url. A CSS or XPath selector or an URL used to identify the context.

*   **context**: 
    *   **url** The rule only applies if the current page url starts with the specified value.
    *   **css** The rule only applies on the elements that are children of the elements captured by the specified css selector.
    *   **xpath** The rule only applies on the elements that are children of the elements captured by the specified xpath selector.

### Example 1

```json{.line-numbers}
{
    "match": {
        "event":"click",
        "css":"#hBskt"
    },
    "output": {
        "prefix":"BasketButtonClicked"
    },
    "context": {
        "url":"https://www.cdiscount.com/"
    }
}
```      

This rule is executed if a click is performed on the cdiscount homepage, on the element with id = hBskt
The AIFEX action will be BasketButtonClicked.

### Example 2

The purpose of this rule is to create a specific AIFEX action when the user fills in the search bar and presses the Enter key. 
This rule is executed if keyup event on the Enter key is performed on element recognized by the `.hSrcInput > input` CSS selector.

```json{.line-numbers}
{
    "match": {
        "event":"keyup",
        "key":"Enter",
        "css":".hSrcInput > input"
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
        "css":".hSrcComp > ul > li"
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
        "css":"#fpZnPrdMain > div.fpTMain > div.fpDesCol > h1"
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
            "css":"input.btGreen.btS.jsValidForm"
        },
        "output": {
            "prefix":"AddToBasket",
            "suffix": "index"
        }
    },
    {
        "match": {
            "event":"click",
            "css":"#hBskt"
        },
        "output": {
            "prefix":"BasketButtonClick"
        }
    },
    {
        "match": {
            "event":"change",
            "css":"#facetsList label"
        },
        "output": {
            "prefix":"FilterClick",
            "suffix":"index"
        }       
    },
    {
        "match": {
            "event":"click",
            "css":"#lpBloc img.prdtBImg"
        },
        "output": {
            "prefix":"ItemPictureClick",
            "suffix":"index"
        }
    },
    {
        "match": {
            "event":"click",
            "css":"div.prdtBILDetails > a"
        },
        "output": {
            "prefix": "ItemTitleClick",
            "suffix": "index"
        }
    },
    {
        "match": {
            "event":"click",
            "css":".bSummaryOrderLink"
        },
        "output": {
            "prefix":"OrderClick"
        }
    },
    {
        "match": {
            "event":"change",
            "css":"div.bProductLineDescBottomQuantity.jsBProductLineDescBottomQuantity > select"
        },
        "output": {
            "prefix":"QuantitySelect",
            "suffix":"value"
        }
    },
    {
        "match": {
            "event":"click",
            "css":"div.bProductLineDescBloc > div.bProductLineDescBottom > form > span:nth-child(7)"
        },
        "output": {
            "prefix": "RemoveItemClick",
            "suffix": "index"
        }
    },
    {
        "match": {
            "event":"click",
            "css":".hSrcInput > input"
        },
        "output": {
            "prefix":"SearchClick"
        }
    },
    {
        "match": {
            "event":"keyup",
            "key":"Enter",
            "css":".hSrcInput > input"
        },
        "output": {
            "prefix":"Search",
            "suffix":"value"
        }
    },
    {
        "match": {
            "event":"click",
            "css":".hSrcComp > ul > li"
        },
        "output": {
            "prefix":"SearchSelect",
            "suffix":"index"
        }
    },
    {
        "match": {
            "event":"click",
            "css": "#hFull > div.hSearch > div.hSrcInput > button"
        },
        "output": {
            "prefix":"SearchButtonClick"
        }
    },
    {
        "match": {
            "event": "click",
            "css": ".btGreen.btF"
        },
        "output": {
            "prefix": "ShowBasket"
        } 
    },
    {
        "match": {
            "event": "click",
            "css":"#lpBloc div.prdtBILDetails > div.prdtBILDesc.jsPrdtBILLink"
        },
        "output": {
            "prefix": "ShowDescription",
            "suffix": "index"
        }
    },
    {
        "match": {
            "event": "change",
            "css":"#lpSort > form > select"
        },
        "output": {
            "prefix": "ChangeSortMode",
            "suffix":"value"
        }
    },
    {
        "match": {
            "event": "change",
            "css": "#lpBloc div.prdtBILDetails div.prdtBILTwoSel select"
        },
        "output": {
            "prefix": "ChangeSize",
            "suffix":"value"
        }       
    }
]
```
