import Client from "@fnndsc/chrisapi";

class ClientSingleton {
	private static instance: ClientSingleton;
	private static token: string = null;
	private static username: string = null;
	private static client: Client = null;

	private constructor() {}

	public static getInstance(): ClientSingleton {
		if (!ClientSingleton.client || !ClientSingleton.token) {
			ClientSingleton.token = window.localStorage.getItem("authToken");
			ClientSingleton.username = window.localStorage.getItem("username");
			ClientSingleton.client = new Client(process.env.REACT_APP_API_URL, {
				token: ClientSingleton.token,
			});
			ClientSingleton.instance = new ClientSingleton();
		}
		return ClientSingleton.instance;
	}

	public isAuthorized() {
		return ClientSingleton.token ? true : false;
	}

	public getClient() {
		return ClientSingleton.client;
	}

	public getToken() {
		return ClientSingleton.token;
	}

	public getUsername() {
		return ClientSingleton.username;
	}
}

export default ClientSingleton;
