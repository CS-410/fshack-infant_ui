import Client, { Feed } from "@fnndsc/chrisapi";

export default class ClientSingleton {
	private static token: string = null;
	private static client: Client = null;

	private constructor() {}

	public static async getInstance(): Promise<Client> {
		if (!ClientSingleton.client || !ClientSingleton.token) {
			ClientSingleton.token = window.localStorage.getItem("authToken");
			ClientSingleton.client = await new Client(
				process.env.REACT_APP_API_URL,
				{
					token: ClientSingleton.token,
				}
			);
		}
		return ClientSingleton.client;
	}
}

export function getFeedStatus(feed: Feed): number {
	const {
		started_jobs,
		scheduled_jobs,
		waiting_jobs,
		cancelled_jobs,
		errored_jobs,
	} = feed.data;

	const hasStartedJobs: boolean = started_jobs !== 0;
	const hasScheduledJobs: boolean = scheduled_jobs !== 0;
	const hasWaitingJobs: boolean = waiting_jobs !== 0;
	const hasCancelledJobs: boolean = cancelled_jobs !== 0;
	const hasErroredJobs: boolean = errored_jobs !== 0;

	let status: number = -1;
	if (
		!hasStartedJobs &&
		!hasScheduledJobs &&
		!hasWaitingJobs &&
		!hasCancelledJobs &&
		!hasErroredJobs
	) {
		status = 0;
	} else if (hasStartedJobs || hasScheduledJobs || hasWaitingJobs) {
		status = 1;
	} else if (hasCancelledJobs) {
		status = 2;
	} else if (hasErroredJobs) {
		status = 3;
	}
	return status;
}
