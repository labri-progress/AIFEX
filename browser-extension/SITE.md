# How To Customize A Web Site

Our plugin can be customized for any web site.

We describe here the two steps of the customization process:
1. Declare the web site in the sites' list (siteList.json)
2. Create a mapping JSON file for the web site.

These two steps can be done:
* At development time. The file siteList.json and the mapping JSON file should be in the "./src/website" directory. Once modified, the plugin must be built and deployed.
* At deployment time. The file siteList.json and the mapping JSON file should be in the "./dist/website" directory. The plugin must be reloaded in Chrome.

We strongly encourage to perform these steps at development time, as any new build will erase the "./dist/website" directory !
You can perform the customization at deployment time just to perform some experimentations.

## 1 - Declare the web site in sites' list (siteList.json)

The file **siteList.json** lists all the web sites for which the plugin has been customized.

To declare a new web site, a new JSON object must be added **at the top of the list**:

```json
{
    "name":"ShortNameOfTheWebSite",
    "mappingFile":"sitename.json",
    "isActive":true
}
```

The JSON object should contain:
* name: a short name for the web site
* mappingFile: the name of the mapping JSON file (step 2).
* isActive: a boolean that states if the plugin must handle the web site.

## 2 - Create a mapping JSON file

This file should be in the "./website" directory and should be named as it is declared by the __mappingFile__ property of the **siteList.json** file.

This file contains an array of mapping. Here are some mappings for [cdiscount](http://www.cdiscount.com):

```json
[
    {
        "signature":"AddToBasket",
        "eventType":"click",
        "querySelector":"input.btGreen.btS.jsValidForm", 
        "isMulti":true
    },
    {
        "signature":"BasketButtonClick",
        "eventType":"click",
        "querySelector":"#hBskt", 
        "isMulti":false
    },
    {
        "signature":"FilterClick",
        "eventType":"change",
        "querySelector":"#facetsList label",
        "isMulti":true
    },
    {
        "signature":"QuantitySelect",
        "eventType":"change",
        "querySelector":"div.bProductLineDescBottomQuantity.jsBProductLineDescBottomQuantity > select",
        "isMulti":false,
        "addValue":true
    },
    {
        "signature":"Search",
        "eventType":"keyup",
        "eventCode":"Enter",
        "querySelector":".hSrcInput > input",
        "isMulti":false,
        "addValue":true
    }
]
```

A mapping is a bidirectional relationship between an abstract action performed by a tester when he explores the web site, and the DOM event that does occur.

With our example, **AddToBasket** is an abstraction of the action that is done by the tester when he adds an item to his basket. This abstraction is performed by clicking (click event) on a button identified by the "input.btGreen.btS.jsValidForm" CSS path.

A mapping is described by the following properties:
* signature: the symbolic name.
* eventType: the type of the DOM event (click, change, keyup, etc.).
* eventCode: the code of the key in case of keyboard event (Enter, etc).
* querySelector: the target of the DOM event should be contained at least in one element returned by the query  document.querySelectorAll(querySelector).
* isMulti: true means that there are several similar targets for the DOM event. Hence, the signature distinguishes them by their index number (i.e. AddToBasket$1, AddToBasket$2).
* addValue (only if isMulti is false): add the value of the target in the signature. This is useful in caise of change event, when the signature should contain the chosen value.


Here is a simple process we advise to create a mapping:
1. Give a unique name to the abstract action you want to define
   * this name is the **signature** of the mapping
2. Identify the DOM element(s) that should be targeted by the tester to perform the abstract action. 
    * If there is only one element then **isMulti** is false, otherwise it is true.
3. Create the query that would find the targeted element(s). Use Chrome devtool to check the query : document.querySelectorAll(selector)
   * the selector of that query is the **querySelector** of the mapping
4. Identify the DOM Event type raised when the tester interacts with the target element(s) (click, change, keyup, etc.)
   * The type of the DOM Event is the **eventType** of the mapping
5. If the DOM Event is a keyboard event, you may specify which input key triggers the abstract action.
   * The **eventCode** specifies the code of that key.
6. If there is only one target element (isMulti=false) and if that target element has a value (it is a text field, a select input, etc.), you may want to add the value to the signature.
   * The **addValue** specifies if the value should be added to the signature (true or false). 