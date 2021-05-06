import Client from "@fnndsc/chrisapi";

class ClientSingleton {
	private static token: string = null;
	private static client: Client = null;

	private constructor() {}

	public static getInstance(): Client {
		if (!ClientSingleton.client || !ClientSingleton.token) {
			ClientSingleton.token = window.localStorage.getItem("authToken");
			ClientSingleton.client = new Client(process.env.REACT_APP_API_URL, {
				token: ClientSingleton.token,
			});
		}
		return ClientSingleton.client;
	}
}

export default ClientSingleton;
