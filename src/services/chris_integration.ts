import ClientSingleton from "../api/ClientSingleton";
import {
	UploadedFile,
	PluginInstance,
	IPluginCreateData,
} from "@fnndsc/chrisapi";

interface DirCreateData extends IPluginCreateData {
	dir: string;
}

interface PlcovidnetData extends IPluginCreateData {
	imagefile: string;
}

enum PluginPollStatus {
	CREATED = "created",
	SCHEDULED = "scheduled",
	WAITING = "waitingForPrevious",
	STARTED = "started",
	SUCCESS = "finishedSuccessfully",
	ERROR = "finishedWithError",
	CANCELLED = "cancelled",
}

export interface BackendPollResult {
	plugin: string;
	status?: PluginPollStatus;
	error?: Error;
}

export const pollingBackend = async (
	pluginInstance: PluginInstance
): Promise<BackendPollResult> => {
	const maxWaitInterval = 600000; // 10 minutes
	let waitInterval = 1000;
	const timeout = (ms: number) => {
		return new Promise((resolve) => setTimeout(resolve, ms));
	};
	await timeout(waitInterval);
	let res: any = await pluginInstance.get();

	const shouldWait = () =>
		waitInterval < maxWaitInterval &&
		![
			PluginPollStatus.CANCELLED,
			PluginPollStatus.ERROR,
			PluginPollStatus.SUCCESS,
		].includes(res.data.status);

	while (shouldWait()) {
		await timeout(waitInterval);
		res = await pluginInstance.get(); // This is not async!!
		console.log(`${res.data.plugin_name}: ${res.data.status}`);
		waitInterval *= 2;
	}

	const result = {
		plugin: res.data.plugin_name,
		status: res.data.status,
	};

	if (waitInterval > maxWaitInterval) {
		return { error: new Error("terminated due to timeout"), ...result };
	} else if (
		[PluginPollStatus.CANCELLED, PluginPollStatus.ERROR].includes(
			res.data.status
		)
	) {
		return {
			error: new Error(`exited with status '${res.data.status}'`),
			...result,
		};
	} else {
		return result;
	}
};

class ChrisIntegration {
	static async createFeed(uploadedFile: UploadedFile): Promise<boolean> {
		const client = await ClientSingleton.getInstance();

		try {
			const dircopyPlugin = (
				await client.getPlugins({ name_exact: "pl-dircopy" })
			).getItems()[0];

			const data: DirCreateData = { dir: uploadedFile.data.fname };

			const dircopyInstance: PluginInstance = await client.createPluginInstance(
				dircopyPlugin.data.id,
				data
			);

			const filename = uploadedFile.data.fname.split("/").pop();

			const plcovidnet_data: PlcovidnetData = {
				previous_id: dircopyInstance.data.id,
				imagefile: filename,
			};

			const plcovidnet = await client.getPlugins({
				name_exact: "pl-covidnet",
			});

			const covidnetPlugin = plcovidnet.getItems()[0];

			const covidnetInstance: PluginInstance = await client.createPluginInstance(
				covidnetPlugin.data.id,
				plcovidnet_data
			);
			console.log("Covidnet Running");

			await pollingBackend(covidnetInstance);
		} catch (error) {
			console.log(error);
			return false;
		}

		return true;
	}
}

export default ChrisIntegration;
