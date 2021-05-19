import { useState, useEffect } from "react";
import { Container, Table } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton from "../api/ClientSingleton";
import {
	FeedFile,
	PluginInstance,
	PluginInstanceFileList,
} from "@fnndsc/chrisapi";

function FeedPage(): JSX.Element {
	let params = useParams<{ id: any }>();
	const { id } = params;
	const [fshackPlugin, setFshackPlugin] = useState<PluginInstance>(null);
	const [fshackFiles, setFshackFiles] = useState<FeedFile[]>(null);
	const [med2ImgPlugin, setMed2ImgPlugin] = useState<PluginInstance>(null);
	const [med2ImgFiles, setMed2ImgFiles] = useState<FeedFile[]>(null);

	async function getPluginAndFiles(
		pluginName: string,
		pluginSetter: (value: React.SetStateAction<PluginInstance>) => void,
		fileSetter: (value: React.SetStateAction<FeedFile[]>) => void
	): Promise<void> {
		const client = await ClientSingleton.getInstance();
		const pluginInstance = await client.getPluginInstances({
			limit: 25,
			offset: 0,
			plugin_name: pluginName,
			feed_id: id,
		});
		const plugin: PluginInstance = pluginInstance.getItems()[0];
		pluginSetter(plugin);

		const pluginInstanceFiles: PluginInstanceFileList = await plugin.getFiles(
			{
				limit: 25,
				offset: 0,
			}
		);
		const files: FeedFile[] = pluginInstanceFiles.getItems();
		fileSetter(files);

		console.log("files", files);
		for (let file of files) {
			// console.log("file.data", file.data);

			const blob = await file.getFileBlob();
			console.log("file.getFileBlob()", blob);

			const url = window.URL.createObjectURL(blob);
			console.log("url", url);
		}
	}

	useEffect(() => {
		getPluginAndFiles("pl-fshack-infant", setFshackPlugin, setFshackFiles);
		getPluginAndFiles("pl-med2img", setMed2ImgPlugin, setMed2ImgFiles);
	}, []);

	function getPluginContent(plugin: PluginInstance): JSX.Element {
		const keyToTextMap = {
			id: "ID",
			title: "Title",
			previous_id: "Previous ID",
			plugin_id: "Plugin ID",
			plugin_name: "Plugin name",
			plugin_version: "Plugin version",
			pipeline_inst: "Pipeline instance",
			feed_id: "Feed ID",
			start_date: "Start date",
			end_date: "End date",
			status: "Status",
			owner_username: "Owner username",
			compute_resource_identifier: "Compute resource identifier",
			cpu_limit: "CPU limit",
			memory_limit: "Memory limit",
			number_of_workers: "Number of workers",
			gpu_limit: "GPU limit",
		};

		if (plugin && plugin.data) {
			const { data } = plugin;

			const keys = Object.keys(keyToTextMap);

			return (
				<Table responsive>
					<thead>
						<tr>
							{keys.map((key) => (
								<th>
									{
										keyToTextMap[
											key as keyof typeof keyToTextMap
										]
									}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						<tr>
							{keys.map((key) => (
								<td>{plugin.data[key as keyof typeof data]}</td>
							))}
						</tr>
					</tbody>
				</Table>
			);
		}
	}

	function getFilesContents(files: FeedFile[]): JSX.Element {
		if (files) {
			return (
				<Table responsive>
					<thead>
						<tr>
							{files.map((_, index) => (
								<th>{`File ${index}`}</th>
							))}
						</tr>
					</thead>
					<tbody>
						<tr>
							{files.map((file) => {
								const filename: string = file.data.fname
									.split("/")
									.pop()
									.split(".")
									.pop();

								if (filename.toLowerCase() === "png") {
									return (
										<td>
											<b style={{ color: "red" }}>
												{`PNG: `}
											</b>
											{file.data.fname}
										</td>
									);
								}
								return <td>{file.data.fname}</td>;
							})}
						</tr>
					</tbody>
				</Table>
			);
		}
	}

	return (
		<Container className="py-4">
			<h3>Feed Page</h3>
			<h4>Infant FS plugin results</h4>
			{getPluginContent(fshackPlugin)}
			{getFilesContents(fshackFiles)}

			<h4>Medical image plugin results</h4>
			{getPluginContent(med2ImgPlugin)}
			{getFilesContents(med2ImgFiles)}
		</Container>
	);
}

export default FeedPage;
