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
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default class AifexServiceHTTP implements AifexService {

	ping(serverURL: string): Promise<void> {
		return fetch(`${serverURL}/api/ping`,{
			method: "GET",
			headers: { "Content-Type": "application/json" },
		})
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

	getSession(serverURL: string, sessionId: string, token?: Token): Promise<Session | undefined | "Unauthorized"> {
		const SESSION_URL = serverURL + '/api/sessions/' + sessionId;
		return fetch(SESSION_URL, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token?.token}` },
		})
			.then((response) => {
				if (response.status === OK_STATUS) {
					return response
						.json()
						.then((session: {
							id: string,
							webSite: { id: string },
							overlayType: "rainbow" | "bluesky" | "shadow",
							useTestScenario: boolean,
							baseURL: string,
							recordingMode: "byexploration" | "byinteraction"

						}) => {
							return new Session(session.id, session.webSite.id, session.overlayType, session.recordingMode, session.baseURL);
						});
				}
				if (response.status === INVALID_PARAMETERS_STATUS) {
					return undefined;
				}
				if (response.status === NOT_FOUND_STATUS) {
					return undefined;
				}
				if (response.status === FORBIDDEN_STATUS) {
					return "Unauthorized";
				}
				if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
					return Promise.reject(`server error`);
				}
			})
	}

	getWebSite(serverURL: string, webSiteId: string, token?: Token): Promise<WebSite | undefined | "Unauthorized"> {
		return fetch(`${serverURL}/api/websites/${webSiteId}`, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token?.token}` },
		})
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

	hasModel(serverURL: string, modelId: string, token?:Token): Promise<boolean | "Unauthorized"> {
		return fetch(`${serverURL}/api/models/${modelId}`,{
			method: 'GET',
			headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token?.token}` },
		})
			.then((response) => {
				if (response.status === OK_STATUS) {
					return true;
				}
				if (response.status === INVALID_PARAMETERS_STATUS) {
					return false;
				}
				if (response.status === NOT_FOUND_STATUS) {
					return false;
				}
				if (response.status === FORBIDDEN_STATUS) {
					return "Unauthorized";
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
		exploration: Exploration,
		token?: Token
	): Promise<Map<string, number>> {
		const body = {
			interactionList: exploration.interactionsToJSON(),
		};
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token?.token}` },
		};
		return fetch(
			`${serverURL}/api/models/${modelId}/probabilities`,
			option
		)
			.then((response) => {
				if (response.status === OK_STATUS) {
					return response
						.json()
						.then((jsonMap) => {
							return new Map(jsonMap.probabilities);
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

	createEmptyExploration(serverURL: string, sessionId: string, testerName :string): Promise<number> {
		const body = {
			testerName,
			interactionList: [],
		};
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		};
		return fetch(
			`${serverURL}/api/sessions/${sessionId}/explorations`,
			option
		)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return response.json().then(data => {
					return data.explorationNumber
				})
			}
			if (response.status === NOT_FOUND_STATUS) {
				return Promise.reject(new Error(`no session not found for Id`));
			}
			if (response.status === INVALID_PARAMETERS_STATUS) {
				return Promise.reject(new Error(`sessionId and/or exploration is malformed`));
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(new Error(`server error`));
			}
		})
	}

	createFullExploration(
		serverURL: string,
		sessionId: string,
		testerName: string,
		exploration: Exploration,
		token?:Token
	): Promise<number> {
		const body = {
			testerName,
			interactionList: exploration.interactionsToJSON(),
			startDate: exploration.startDate,
			stopDate: exploration.stopDate,
			submissionAttempt: exploration.submissionAttempt,
		};
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token?.token}` },
		};
		return fetch(
			`${serverURL}/api/sessions/${sessionId}/explorations`,
			option)
			.then((response) => {
				if (response.status === OK_STATUS) {
					return response.json().then(json => json.explorationNumber);
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

	pushActionList(serverURL: string, sessionId: string, explorationNumber: number, actionList: Action[]): Promise<void> {
		const body = {
			interactionList: actionList.map((action: Action) => ({
				index: action.index,
				concreteType: action.getConcreteType(),
				kind: action.kind,
				value: action.value,
				date: action.date
			}))
		}
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		};
		return fetch(
			`${serverURL}/api/sessions/${sessionId}/explorations/${explorationNumber}/interactions`,
			option)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return;
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
		}).catch(error => {
			console.error(error);
			throw new Error("Service Failed to push new action");
		})
	}

	notifySubmissionAttempt(serverURL: string, sessionId: string, explorationNumber: number) {		
		const option = {
			method: "POST",
			headers: { "Content-Type": "application/json" },
		};
		return fetch(
			`${serverURL}/api/session/${sessionId}/exploration/${explorationNumber}/notifySubmision`,
			option)
		.then((response) => {
			if (response.status === OK_STATUS) {
				return;
			}
			if (response.status === NOT_FOUND_STATUS) {
				return Promise.reject(new Error(`sessionId not found`));
			}
			if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
				return Promise.reject(new Error(`server error`));
			}
		});	
	}

	getCommentDistributions(serverURL: string, modelId: string, exploration: Exploration, token?:Token): Promise<CommentDistribution[] | undefined> {
		const body = {
			interactionList: exploration.interactionsToJSON()
		};
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token?.token}` },
		};
		return fetch(
			`${serverURL}/api/models/${modelId}/comment-distributions`,
			option)
			.then((response) => {
				if (response.status === OK_STATUS) {
					return response
						.json()
						.then((commentDistributionsData: {
							commentDistributions: any[]}) => {
								console.log(JSON.stringify(commentDistributionsData));
								return commentDistributionsData.commentDistributions.map(commentDistributionData => {
									return new CommentDistribution(commentDistributionData[0], commentDistributionData[1]);
								})
						})
				}
				if (response.status === NOT_FOUND_STATUS) {
					return Promise.reject(new Error(`modelId not found`));
				}
				if (response.status === INVALID_PARAMETERS_STATUS) {
					return Promise.reject(new Error(`modelId and/or exploration is malformed`));
				}
				if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
					return Promise.reject(new Error(`server error`));
				}
			});
	}

	addScreenshotList(serverURL: string, sessionId: string, explorationNumber: number, list: Screenshot[]): Promise<void> {
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
		return fetch(`${serverURL}/api/sessions/${sessionId}/screenshots`, option)
			.then((response) => {
				if (response.status === OK_STATUS) {
					return;
				}
				else if (response.status === INVALID_PARAMETERS_STATUS) {
					return Promise.reject(new Error(`screenshotList is malformed`));
				}
				else if (response.status === INTERNAL_SERVER_ERROR_STATUS) {
					return Promise.reject(new Error(`server error`));
				} else {
					return Promise.reject(new Error('error'+response.status));
				}
			});
	}

	addVideo(serverURL: string, sessionId: string, explorationNumber: number, video: Blob): Promise<void> {
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

	evaluateSequence(serverURL: string, evaluator: Evaluator, exploration: Exploration): Promise<ExplorationEvaluation> {
		const option = {
			method: "POST",
			body: JSON.stringify({
				sessionId: evaluator.sessionId,
				actionList: exploration.evaluableInteractions.map(action => ({
					prefix: action.kind,
					suffix: action.value
				}))
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
			.then((evaluationData: {
				evaluation: {
					nextActionList: { prefix: string, suffix?: string }[],
					isAccepted: boolean,
				}
			}) => {
				const evaluation = evaluationData.evaluation;
				if (!evaluation) {
					return Promise.reject(new Error(`Evaluator error`));
				} else {
					return new ExplorationEvaluation(
						evaluation.isAccepted,
						evaluation.nextActionList.map(interaction => new Action(interaction.prefix, interaction.suffix))
					);
				}
			})

	}

	getEvaluator(serverURL: string, webSiteId: string): Promise<Evaluator | undefined> {
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
				sessionId: string,
				description: string,
				expression: string,
				id: string,
			}) => {
				if (evaluatorJSON) {
					return new Evaluator(evaluatorJSON.description, evaluatorJSON.expression, evaluatorJSON.sessionId);
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
			}).then((data: { numberOfExplorations: number }) => {
				return data.numberOfExplorations
			})
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
