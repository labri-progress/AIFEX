import Action from "../domain/Action";
import AifexService from "../domain/AifexService";
import Session from "../domain/Session";


const OK_STATUS = 200;
const INVALID_PARAMETERS_STATUS = 400;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INTERNAL_SERVER_ERROR_STATUS = 500;
export default class AifexServiceHTTP implements AifexService {

	ping(serverURL: string): Promise<void> {
		return fetch(`${serverURL}/api/ping`, {
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

	getSession(serverURL: string, sessionId: string): Promise<Session | undefined | "Unauthorized"> {
		const SESSION_URL = serverURL + '/api/sessions/' + sessionId;
		return fetch(SESSION_URL, {
			method: 'GET',
			headers: { 'Content-Type': 'application/json'},
		})
			.then((response) => {
				if (response.status === OK_STATUS) {
					return response
						.json()
						.then((session: {
							id: string,
							webSite: { id: string },
							baseURL: string,
							name: string,
							description: string,
							overlayType: "rainbow" | "bluesky" | "shadow",
							recordingMode: "byexploration" | "byinteraction"

						}) => {
							return new Session(session.id, session.webSite.id, session.baseURL, session.name, session.description, session.overlayType, session.recordingMode);
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

	createEmptyExploration(testerName: string, serverURL: string, sessionId: string): Promise<number> {
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

	sendAction(explorationNumber: number, action: Action, serverURL: string, sessionId: string): Promise<void> {

		const body = {
			interactionList: [{
				concreteType: "Action",
				kind: action.prefix,
				value: action.suffix,
				date: new Date()
			}]
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
}