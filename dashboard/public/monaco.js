const MONACO_TAG_ID = 'monaco';
const MONACO_CODE_TAG_ID = 'monaco-code';
const HTML_FORM_ID = 'htmlFormId';
const FORM_FIELD_NAME = 'formFieldName';

window.addEventListener("load", (ev) => {
    // console.log('monaco script loaded');
    let monacoTag = document.getElementById(MONACO_TAG_ID);
    let monacoCodeTag = document.getElementById(MONACO_CODE_TAG_ID);
    if (monacoTag) {
        let htmlIdForm = monacoTag.getAttribute(HTML_FORM_ID);
        let formFieldName = monacoTag.getAttribute(FORM_FIELD_NAME);
        if (monacoCodeTag) {
            let code = monacoCodeTag.innerText;
            createMonacoEditorForCode(String.raw`${code.trim()}`, MONACO_TAG_ID, htmlIdForm, formFieldName );
        }
    }
})

function createMonacoEditorForCode(code, htmlIdOfLocation, htmlIdForm, formFieldName ) {
    const JSONSchemaURL = '/static/schema.json';
    fetch(JSONSchemaURL)
        .then(response => {
            if (response.ok) {
                return response.json();
            }
            else {
                throw new Error('cannot fetch JSON Schema');
            }
        })
        .then( jsonSchema => {
            require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.20.0/min/vs' } })
            require(['vs/editor/editor.main'], () => {
                createMonaco(code, jsonSchema, htmlIdOfLocation, htmlIdForm, formFieldName);
            })
        })
        .catch(e => {
            console.log(e);
        })
}

function createMonaco(code, jsonSchema, htmlIdOfLocation, htmlIdForm, formFieldName) {
    // console.log('createMonaco');
    // console.log('code:',code);
    // console.log('jsonSchema:',jsonSchema);
    // console.log('htmlIdOfLocation:',htmlIdOfLocation);
    // console.log('htmlIdForm:',htmlIdForm);
    // console.log('formFieldName:',formFieldName);
    let modelUri = monaco.Uri.parse("json://aifex.fr/model"); // unique URI for our model
    let model = monaco.editor.createModel(code, "json", modelUri);
    let config = {
        schemas: [{
            uri: "json://aifex.fr/schema.json",
            fileMatch: [modelUri.toString()],
            schema: jsonSchema
        }],
        validate: true,
        allowComments: false
    }

    monaco.languages.json.jsonDefaults.setDiagnosticsOptions(config)
    let editor = monaco.editor.create(document.getElementById(htmlIdOfLocation), {
        model: model,
        formatOnType: true,
        formatOnPaste: true,
        automaticLayout: true,
        autoIndent: "full"
    })

    setTimeout(function () {
        editor.getAction('editor.action.formatDocument').run()
    }, 500);

    setTimeout(function () {
        editor.getAction('editor.action.formatDocument').run()
    }, 500);

    //console.log("attach on content Change")

    model.onDidChangeContent(() => {
        const code = document.getElementById('monaco-code');
        if (code) {
            const event = new Event("change")
            event.value = model.getValue()
            code.dispatchEvent(event)
        }
    });

    const form = document.getElementById(htmlIdForm);
    form.addEventListener("formdata", e => {
        e.formData.append(formFieldName, editor.getValue())
    });
}


