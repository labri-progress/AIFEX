import Action from "../domain/Action";
import AifexService from "../domain/AifexService";
import Token from "../domain/Token";
import WebSite from "../domain/Website";
import Session from "../domain/Session";
const OK_STATUS = 200;
const INVALID_PARAMETERS_STATUS = 400;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INTERNAL_SERVER_ERROR_STATUS = 500;



export default class AifexServiceHTTP implements AifexService {

	serverURL: string;
	sessionId: string;
	websiteId: string;
	token: Token;

	constructor(serverURL: string, token: Token) {
		this.serverURL = serverURL;
		this.token = this.token
	}

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

	getSession(token?: Token): Promise<Session | undefined | "Unauthorized"> {
		const SESSION_URL = this.serverURL + '/api/sessions/' + this.sessionId;
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

	getWebSite(webSiteId: string, token?: Token): Promise<WebSite | undefined | "Unauthorized"> {
		return fetch(`${this.serverURL}/api/websites/${webSiteId}`, {
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

	createEmptyExploration(testerName :string): Promise<number> {
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
			`${this.serverURL}/api/sessions/${this.sessionId}/explorations`,
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

	sendAction(explorationNumber: number, actionList: Action[]): Promise<void> {
		const body = {
			interactionList: actionList.map((action: Action) => ({
				concreteType: action.getConcreteType(),
				kind: action.prefix,
				value: action.suffix,
				date: action.date
			}))
		}
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "Content-Type": "application/json" },
		};
		return fetch(
			`${this.serverURL}/api/sessions/${this.sessionId}/explorations/${explorationNumber}/interactions`,
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
}
