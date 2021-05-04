import Client from "@fnndsc/chrisapi";

class ChrisClient {
  getInstance() {
    if (!this.client || this.unauthorizedToken) {
      const authToken = window.sessionStorage.getItem("authToken") || "";
      this.unauthorizedToken = authToken === "" ? true : false;
      this.client = new Client(process.env.REACT_APP_API_URL, { authToken });
    }
    return this.client;
  }
}

export default ChrisClient;
