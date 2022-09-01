import Action from "../domain/Action";
import AifexService from "../domain/AifexService";

const OK_STATUS = 200;
const INVALID_PARAMETERS_STATUS = 400;
const FORBIDDEN_STATUS = 403;
const NOT_FOUND_STATUS = 404;
const INTERNAL_SERVER_ERROR_STATUS = 500;

export default class AIFEXServiceHTTP implements AifexService {
    getProbabilityMap(
		serverURL: string,
		modelId: string,
		actions: Action[]
	): Promise<Map<string, number>> {
		const body = {
			interactionList: actions,
		};
		const option = {
			method: "POST",
			body: JSON.stringify(body),
			headers: { 'Content-Type': 'application/json' },
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
}