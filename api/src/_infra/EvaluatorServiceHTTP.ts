import config from "./config";
import fetch from "node-fetch";

import EvaluatorService from "../domain/EvaluatorService";
import Action from "../domain/Action";
import Evaluation from "../domain/Evaluation";
import Evaluator from "../domain/Evaluator";

const EVALUATOR_URL : string = `http://${config.evaluator.host}:${config.evaluator.port}/evaluator/`;

export default class EvaluatorServiceHTTP implements EvaluatorService {

    getEvaluator(sessionId: string): Promise<Evaluator | undefined> {
        const evaluatorGetURL = EVALUATOR_URL + sessionId;
        return fetch(evaluatorGetURL).then(response => {
            if (response.ok) {
                return response.json().then(evaluatorData => {
                    return new Evaluator(evaluatorData.sessionId, evaluatorData.id, evaluatorData.expression, evaluatorData.description);
                })
            } else {
                return undefined;
            }
        });
    }

    updateEvaluator(sessionId: string, description: string, expression: string): Promise<void> {
        const evaluatorGetURL = EVALUATOR_URL + "update/" + sessionId;
        let optionModelCreate = {
            method: 'POST',
            body:    JSON.stringify({
                description,
                expression
            }),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(evaluatorGetURL, optionModelCreate).then(response => {
            if (!response.ok) {
                throw new Error("Error"+response.statusText);
            }
        });    
    }

    createEvaluator(sessionId: string, description: string, expression: string): Promise<void> {
        const evaluatorGetURL = EVALUATOR_URL + "create/" + sessionId;
        let optionModelCreate = {
            method: 'POST',
            body:    JSON.stringify({
                sessionId,
                description,
                expression
            }),
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(evaluatorGetURL, optionModelCreate).then(response => {
            if (!response.ok) {
                throw new Error("Error"+response.statusText);
            }
        });        
    }

    removeEvaluator(sessionId: string) {
        const evaluatorGetURL = EVALUATOR_URL + "remove/" + sessionId;
        let optionModelCreate = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
        }
        return fetch(evaluatorGetURL, optionModelCreate).then(response => {
            if (!response.ok) {
                throw new Error("Error"+response.statusText);
            }
            return;
        });       
    }

    evaluate(sessionId: string, actionList: Action[]): Promise<Evaluation> {
        const evaluatorGetURL = EVALUATOR_URL + "evaluate/";
        let optionModelCreate = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                sessionId,
                actionList
            })
        }
        return fetch(evaluatorGetURL, optionModelCreate).then(response => {
            if (!response.ok) {
                throw new Error("Error"+response.statusText);
            } else {
                return response.json()
            }
        }).then(data => {
            const actionList = data.nextActionList.map((actionData: any, index: number) => {
                return new Action(index, actionData.prefix, actionData.suffix);
            })
            return new Evaluation(actionList, data.isAccepted);
        });         
    }

    evaluateSequenceByExpression(expression: string, actionList: Action[]): Promise<Evaluation> {
        const evaluatorGetURL = EVALUATOR_URL + "evaluate-expression/";
        let optionModelCreate = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                expression,
                actionList
            })
        }
        return fetch(evaluatorGetURL, optionModelCreate).then(response => {
            if (!response.ok) {
                throw new Error("Error"+response.statusText);
            } else {
                return response.json()
            }
        }).then(data => {
            const actionList = data.nextActionList.map((actionData: any, index: number) => {
                return new Action(index, actionData.prefix, actionData.suffix);
            })
            return new Evaluation(actionList, data.isAccepted);
        });         
    }

    expressionToDot(expression: string): Promise<{ expressionIsValid: boolean, dot: string }> {
        const evaluatorGetURL = EVALUATOR_URL + "expressionToDot/";
        let option = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify({
                expression
            })
        }
        return fetch(evaluatorGetURL, option).then(response => {
            if (!response.ok) {
                throw new Error("Error"+response.statusText);
            } else {
                return response.json()
            }
        }).then(data => {
           return {
               expressionIsValid: data.expressionIsValid,
               dot: data.dot
           }
        });             
    }
        
}
