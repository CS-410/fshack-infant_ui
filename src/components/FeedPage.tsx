import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton from "../api/ClientSingleton";
import {
	Feed,
	FeedFileList,
	PluginInstance,
	PluginInstanceFileList,
} from "@fnndsc/chrisapi";

function FeedPage(): JSX.Element {
	let params = useParams<{ id: any }>();
	const { id } = params;
	const [plugin, setPlugin] = useState<PluginInstance>(null);
	const [files, setFiles] = useState<any[]>(null);

	async function getPluginAndFiles(): Promise<void> {
		const client = await ClientSingleton.getInstance();
		const pluginInstance = await client.getPluginInstances({
			limit: 25,
			offset: 0,
			plugin_name: "pl-fshack-infant",
		});
		const plugin: PluginInstance = pluginInstance.getItems()[0];
		setPlugin(plugin);

		const pluginInstanceFiles: PluginInstanceFileList = await plugin.getFiles(
			{
				limit: 25,
				offset: 0,
			}
		);
		const files = pluginInstanceFiles.getItems();
		setFiles(files);
	}

	useEffect(() => {
		getPluginAndFiles();
	}, []);

	function getPluginContent(): JSX.Element {
		if (plugin && plugin.data) {
			const {
				id,
				title,
				previous_id,
				plugin_id,
				plugin_name,
				plugin_version,
				pipeline_inst,
				feed_id,
				start_date,
				end_date,
				status,
				owner_username,
				compute_resource_identifier,
				cpu_limit,
				memory_limit,
				number_of_workers,
				gpu_limit,
			} = plugin.data;
			const elements: JSX.Element[] = [];

			return (
				<>
					<p>ID: {id}</p>
					<p>Title: {title}</p>
					<p>Previous ID: {previous_id}</p>
					<p>Plugin ID: {plugin_id}</p>
					<p>Plugin name: {plugin_name}</p>
					<p>Plugin version: {plugin_version}</p>
					<p>Pipeline instance: {pipeline_inst}</p>
					<p>Feed ID: {feed_id}</p>
					<p>Start date: {start_date}</p>
					<p>End date: {end_date}</p>
					<p>Status: {status}</p>
					<p>Owner username: {owner_username}</p>
					<p>
						Compute resource identifier:{" "}
						{compute_resource_identifier}
					</p>
					<p>CPU limit: {cpu_limit}</p>
					<p>Memory limit: {memory_limit}</p>
					<p>Number of workers: {number_of_workers}</p>
					<p>GPU limit: {gpu_limit}</p>
				</>
			);
		}

		return <></>;
	}

	function getFilesContents(): JSX.Element {
		if (files) {
			console.log(files);
			return (
				<>
					{files.map((file) => (
						<p>{file.data.fname}</p>
					))}
				</>
			);
		}
		return <></>;
	}

	return (
		<Container className="py-4">
			<h3>Feed Page</h3>
			<h4>Plugin content</h4>
			{getPluginContent()}
			<h4>Plugin files</h4>
			{getFilesContents()}
		</Container>
	);
}

export default FeedPage;
