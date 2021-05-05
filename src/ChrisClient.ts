import Client from "@fnndsc/chrisapi";

class ChrisClient {
	private client: Client;
	private unauthorizedToken: boolean;

	getInstance(): Client {
		if (!this.client || this.unauthorizedToken) {
			const authToken = window.sessionStorage.getItem("authToken") || "";
			this.unauthorizedToken = authToken === "" ? true : false;
			this.client = new Client(process.env.REACT_APP_API_URL, {
				token: authToken,
			});
		}
		return this.client;
	}
}

export default ChrisClient;
