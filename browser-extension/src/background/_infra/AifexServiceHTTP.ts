import WebSite from "../domain/Website";
import Exploration from "../domain/Exploration";
import AifexService from "../domain/AifexService";
import Session from "../domain/Session";
import AifexPluginInfo from "../domain/AifexPluginInfo";
import ExplorationEvaluation from "../domain/ExplorationEvaluation";
import Action from "../domain/Action";
import Evaluator from "../domain/Evaluator";
import Screenshot from "../domain/Screenshot";
import CommentDistribution from "../domain/CommentDistribution";
import Token from "../domain/Token";




const OK_STATUS = 200;
const INVALID_PARAMETERS_STATUS = 400;
const NOT_FOUND_STATUS = 404;
const INTERNAL_SERVER_ERROR_STATUS = 500;


export default class AifexServiceHTTP implements AifexService {

	ping(serverURL: string): Promise<void> {
		return fetch(`${serverURL}/api/ping`)
			.then(response => {
				console.log(response);
				if (response.ok) {
					console.log('ok');
					return;
				} else {
					console.log('error');
					throw new Error(response.statusText);
				}
			})
	}

	getPluginInfo(serverURL: string): Promise<AifexPluginInfo> {
		const option = {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		};
		return fetch(`${serverURL}/api/plugin-info`, option)
		.then(response => {
			if (!response.ok) {
				throw new Error(response.statusText);
			}
			return response.json();
		})
		.then(details => {
			details.url = `${serverURL}/download`
			return new AifexPluginInfo(details.version, details.name, details.description, details.url);
		})
	}

	signin(serverURL: string, username: string, password: string): Promise<Token | "Unauthorized"> {
		const SIGNIN_URL = serverURL + '/api/signin';
		const option = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, password })
		};
		return fetch(SIGNIN_URL, option)
			.then(response => {
				if (response.ok) {
					return response.json().then(data => new Token(data.bearerToken));
				} else {
					return "Unauthorized"
				}
			});
		
	}

	getSession(serverURL: string, sessionId : string): Promise<Session | undefined> {
		return fetch(`${this.getSessionURL(serverURL)}/session/${sessionId}`)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return response
					.json()
					.then((session: {
						id: string,
						webSite: { id: string },
						overlayType: "rainbow" | "bluesky" | "shadow",
						useTestScenario: boolean,
						baseURL: string
					}) => {
					return new Session(session.id, session.webSite.id, session.overlayType, session.useTestScenario, session.baseURL);
				});
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(`sessionId is malformed`);
			}
			if (response.status === NOT_FOUND_STATUS) {
				return;
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(`server error`);
			}
		})
	}

	getWebSite(serverURL: string, webSiteId: string): Promise<WebSite | undefined> {
		return fetch(`${this.getWebSiteURL(serverURL)}/website/${webSiteId}`)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return response
				.json()
				.then(websiteData => {
					return new WebSite(websiteData.id, websiteData.name, websiteData.mappingList);
				})
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(`sessionId is malformed`);
			}
			if (response.status === NOT_FOUND_STATUS) {
				return;
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(`server error`);
			}
		})		
	}

	hasModel(serverURL: string, modelId: string): Promise<boolean>  {
		return fetch(`${this.getModelURL(serverURL)}/model/${modelId}`)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return true;
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(`modelId is malformed`);
			}
			if (response.status === NOT_FOUND_STATUS) {
				return false;
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(`server error`);
			}
			return false;
		})	
	}

	getProbabilityMap(
		serverURL: string,
		modelId: string,
		exploration: Exploration
	): Promise<Map<string, number>> {
		const body = {
			interactionList: exploration.interactionsToJSON(),
		};
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		};
		return fetch(
			`${this.getModelURL(serverURL)}/model/${modelId}/getprobabilitymap`,
			option
		)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return response
				.json()
				.then((jsonMap) => {
					return new Map(jsonMap);
				});
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(`modelId and/or interaction list is malformed`);
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(`server error`);
			}
			return new Map();
		})
	}

	addExploration(
		serverURL: string,
		sessionId: string,
		testerName: string,
		exploration: Exploration
	): Promise<number> {
		const body = {
			testerName,
			interactionList: exploration.interactionsToJSON(),
			startDate: exploration.startDate,
			stopDate: exploration.stopDate
		};
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		};
		return fetch(
			`${this.getSessionURL(serverURL)}/session/${sessionId}/exploration/add`,
			option)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return response.json();
			}
			if (response.status === NOT_FOUND_STATUS) {
				return Promise.reject(new Error(`sessionId not found`));
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(new Error(`sessionId and/or exploration is malformed`));
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(new Error(`server error`));
			}
		});
	}

	getCommentDistributions(serverURL: string, modelId: string, exploration: Exploration): Promise<CommentDistribution[] | undefined> {
		const body = {
			interactionList: exploration.interactionsToJSON()
		};
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		};
		return fetch(
			`${this.getModelURL(serverURL)}/model/${modelId}/getcommentdistributions`,
			option)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return response
				.json()
				.then((commentDistributionsData : { 
					note : string, 
					distributions : { 
						commentOccurence: number,
						contextOccurece: number,
						context: string[] 
					}[]
				}[]) => {
					return commentDistributionsData.map(commentDistributionData => {
						return new CommentDistribution(commentDistributionData.note, commentDistributionData.distributions)

					})
				})
			}
			if (response.status === NOT_FOUND_STATUS) {
				return Promise.reject(new Error(`sessionId not found`));
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(new Error(`sessionId and/or exploration is malformed`));
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(new Error(`server error`));
			}
		});
	}

	addScreenshotList(serverURL: string, sessionId: string, explorationNumber : number, list : Screenshot[]): Promise<void> {
		const screenshotList = list.map((screenshot) => {
			screenshot.sessionId = sessionId;
			screenshot.explorationNumber = explorationNumber;
			return screenshot;
		});
		const body = {
			screenshotList,
		};
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		};
		return fetch(`${this.getSessionURL(serverURL)}/session/addscreenshotlist`, option)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return;
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(new Error(`screenshotList is malformed`));
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(new Error(`server error`));
			}
		});
	}

	addVideo(serverURL: string, sessionId: string, explorationNumber:number, video:Blob): Promise<void> {
		const fd = new FormData();
		fd.append('video', video, 'video.webm');

		const option = {
			method: "POST",
			body: fd
		};
		return fetch(`${this.getSessionURL(serverURL)}/session/addVideo/${sessionId}/${explorationNumber}`, option)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return;
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(new Error(`sessionId and/or explorationNumber and/or video is malformed`));
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(new Error(`server error`));
			}
		});
	}

	evaluateSequence(serverURL: string, webSite: WebSite, exploration: Exploration): Promise<ExplorationEvaluation> {
		const interactionList = exploration.evaluableInteractions.map(action => action.toString());
		const option = {
			method: "POST",
			body: JSON.stringify({
				webSiteId: webSite.id,
				interactionList
			}),
			headers: { "Content-Type": "application/json" },
		};
		return fetch(`${this.getEvaluatorURL(serverURL)}/evaluator/evaluateSequence`, option)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return response.json();
			} else {
				return Promise.reject(new Error(`Evaluator error`));
			}
		})
		.then((evaluationData : {
			evaluation: {
				continuingActionList: {prefix: string, suffix?: string}[],
				enteringInteractionList: {prefix: string, suffix?: string}[],
				finishingInteractionList: {prefix: string, suffix?: string}[],
				isAccepted: boolean,
			}}) => {
			const evaluation = evaluationData.evaluation;
			if (!evaluation) {
				return Promise.reject(new Error(`Evaluator error`));
			} else {
				return new ExplorationEvaluation(
					evaluation.isAccepted,
					evaluation.enteringInteractionList.map(interaction => new Action(interaction.prefix, interaction.suffix)),
					evaluation.continuingActionList.map(interaction => new Action(interaction.prefix, interaction.suffix)),
					evaluation.finishingInteractionList.map(interaction => new Action(interaction.prefix, interaction.suffix)),
				);
			}
		})
		
	}

	getEvaluator(serverURL: string, webSiteId : string) : Promise<Evaluator | undefined> {
		const option = {
			method: "GET",
			headers: { "Content-Type": "application/json" },
		};
		return fetch(`${this.getEvaluatorURL(serverURL)}/evaluator/getEvaluator/${webSiteId}`, option)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return response.json();
			}
			if (response.ok) {
				return;
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(`webSiteId is malformed`);
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(`server error`);
			}
		})
		.then((evaluatorJSON: {
			webSiteId: string,
			description: string,
			expression: String,
			id: string,
		}) => {
			if (evaluatorJSON){
				return new Evaluator(evaluatorJSON.description);
			} else {
				return;
			}
		})
	}

	getNumberOfExplorationForTesterName(serverURL: string, sessionId: string, testerName: string): Promise<number> {
		return fetch(`${this.getSessionURL(serverURL)}/session/${sessionId}/numberOfTesterExploration/${testerName}`)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return response.json();
			}
			if (response.ok) {
				return;
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(`webSiteId is malformed`);
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(`server error`);
			}
		}).then((data: {numberOfExplorations: number}) => {
			return data.numberOfExplorations
		}) 
	}

	private getDashboardURL(serverURL: string) {
		const SERVER_URL = new URL(serverURL);
		return SERVER_URL.origin;
	}

	private getWebSiteURL(serverURL: string) {
		const SERVER_URL = new URL(serverURL);
		const SERVER_IN_PRODUCTION = SERVER_URL.protocol === 'https:';
		if (SERVER_IN_PRODUCTION) {
			return SERVER_URL.origin + '/website';
		} else {
			SERVER_URL.port = '5000';
			return SERVER_URL.origin;
		}
	}
	
	private getSessionURL(serverURL: string) {
		const SERVER_URL = new URL(serverURL);
		const SERVER_IN_PRODUCTION = SERVER_URL.protocol === 'https:';
		if (SERVER_IN_PRODUCTION) {
			return SERVER_URL.origin + '/session';
		} else {
			SERVER_URL.port = '5001';
			return SERVER_URL.origin;
		}
	}

	private getModelURL(serverURL: string) {
		const SERVER_URL = new URL(serverURL);
		const SERVER_IN_PRODUCTION = SERVER_URL.protocol === 'https:';
		if (SERVER_IN_PRODUCTION) {
			return SERVER_URL.origin + '/model';
		} else {
			SERVER_URL.port = '5002';
			return SERVER_URL.origin;
		}
	}

	private getEvaluatorURL(serverURL: string) {
		const SERVER_URL = new URL(serverURL);
		const SERVER_IN_PRODUCTION = SERVER_URL.protocol === 'https:';
		if (SERVER_IN_PRODUCTION) {
			return SERVER_URL.origin + '/evaluator';
		} else {
			SERVER_URL.port = '5003';
			return SERVER_URL.origin;
		}
	}
}
