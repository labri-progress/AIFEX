let evaluationComponent = document.getElementById("evaluation-component");
let evaluationStatusValid = document.getElementById("evaluation-status-valid");
let evaluationStatusInvalid = document.getElementById("evaluation-status-invalid");

let enteringActionDiv = document.getElementById("evaluation-entering");
let continuingActionDiv = document.getElementById("evaluation-continuing");
let finishingActionDiv = document.getElementById("evaluation-finishing");

let evaluationDescription = document.getElementById("evaluation-scenario");

let enteringActionListDiv = document.getElementById("evaluation-entering-actions");
let continuingActionListDiv = document.getElementById("evaluation-continuing-actions");
let finishingActionListDiv = document.getElementById("evaluation-finishing-actions");

function renderEvaluation(state) {
    let evaluation = state.evaluation;
    if (evaluation) {
        evaluationComponent.hidden = false;

        if (evaluation.validated) {
            evaluationStatusValid.hidden = false;
            evaluationStatusInvalid.hidden = true;
        } else {
            evaluationStatusValid.hidden = true;
            evaluationStatusInvalid.hidden = false;
        }
        while(enteringActionListDiv.hasChildNodes()) {
            enteringActionListDiv.firstChild.remove()
        }
        while(continuingActionListDiv.hasChildNodes()) {
            continuingActionListDiv.firstChild.remove()
        }
        while(finishingActionListDiv.hasChildNodes()) {
            finishingActionListDiv.firstChild.remove()
        }
        evaluationDescription.innerText = state.evaluatorScenario;
        
        if (Array.isArray(evaluation.enteringInteractionList) && evaluation.enteringInteractionList.length > 0) {
            enteringActionDiv.hidden = false;
            evaluation.enteringInteractionList.forEach((action) => {
                const enteringElement = this.createActionElementForEvaluationView(action);
                enteringActionListDiv.appendChild(enteringElement);
            });
        } else {
            enteringActionDiv.hidden = true;
        }

        if (Array.isArray(evaluation.continuingActionList) && evaluation.continuingActionList.length > 0) {
            continuingActionDiv.hidden = false;
            evaluation.continuingActionList.forEach((action) => {
                const continuingElement = this.createActionElementForEvaluationView(action);
                continuingActionListDiv.appendChild(continuingElement);
            });

        }else {
            continuingActionDiv.hidden = true;
        }

        if (Array.isArray(evaluation.finishingInteractionList) && evaluation.finishingInteractionList.length > 0) {
            finishingActionDiv.hidden = false;
            evaluation.finishingInteractionList.forEach((action) => {
                const finishingElement = this.createActionElementForEvaluationView(action);
                finishingActionListDiv.appendChild(finishingElement);
            });
        }else {
            finishingActionDiv.hidden = true;
        }
    } else {
        evaluationComponent.hidden = true;
    }
}

function createActionElementForEvaluationView(action) {
    const actionDiv = document.createElement("div");
    actionDiv.classList.add("aifex_stepAction")

    const actionName = document.createElement("span");
    actionName.classList.add("aifex_action_name");

    const actionDescription = document.createElement("p");
    actionDescription.classList.add("aifex_action_description");

    const descriptionUl = document.createElement("ul");
    descriptionUl.classList.add("aifex_definition_ul");
    actionDiv.appendChild(descriptionUl);
    for (const description of action.descriptions) {
        if (description !== undefined) {
            const descriptionLi = document.createElement("li");
            descriptionLi.classList.add("aifex_definition_li");
            descriptionUl.appendChild(descriptionLi);
            descriptionLi.innerText = description;
        }
    }
    actionDiv.appendChild(actionDescription);
    return actionDiv;
}