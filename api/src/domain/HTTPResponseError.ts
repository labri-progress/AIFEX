export class HTTPResponseError extends Error {

	status: number;
	message: string;

	constructor(response, ...args) {
		super(`HTTP Error Response: ${response.status} ${response.statusText}`);
		this.status = response.status;
	}
}
