import { useState, useEffect } from "react";
import {
	Container,
	Table,
	ListGroup,
	Tab,
	TabContainer,
	ListGroupItem,
	Row,
	Col,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton from "../api/ClientSingleton";
import {
	FeedFile,
	PluginInstance,
	PluginInstanceFileList,
} from "@fnndsc/chrisapi";

interface FileWithBlob {
	fname: string;
	blob: Blob;
	content?: string;
}

function FeedPage(): JSX.Element {
	let params = useParams<{ id: any }>();
	const { id } = params;
	const [fshackPlugin, setFshackPlugin] = useState<PluginInstance>(null);
	const [fshackFiles, setFshackFiles] = useState<FileWithBlob[]>(null);
	const [med2ImgPlugin, setMed2ImgPlugin] = useState<PluginInstance>(null);
	const [med2ImgFiles, setMed2ImgFiles] = useState<FileWithBlob[]>(null);

	const fshackName = "pl-fshack-infant";
	const med2ImgName = "pl-med2img";

	async function getPluginAndFiles(
		pluginName: string,
		pluginSetter: (value: React.SetStateAction<PluginInstance>) => void,
		fileSetter: (value: React.SetStateAction<FileWithBlob[]>) => void
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

		const fileParams = { limit: 200, offset: 0 };
		let pluginInstanceFiles: PluginInstanceFileList = await plugin.getFiles(
			fileParams
		);
		let files: FeedFile[] = pluginInstanceFiles.getItems();
		while (pluginInstanceFiles.hasNextPage) {
			try {
				fileParams.offset += fileParams.limit;
				pluginInstanceFiles = await plugin.getFiles(fileParams);
				files = files.concat(pluginInstanceFiles.getItems());
			} catch (e) {
				throw new Error("Error while paginating files");
			}
		}
		files = files.filter(
			(file: FeedFile) =>
				file.data.fname.endsWith("stats") ||
				file.data.fname.endsWith("png")
		);

		const filesWithBlobs: FileWithBlob[] = [];
		for (let file of files) {
			const fname = file.data.fname;
			const blob: Blob = await file.getFileBlob();
			const fileWithBlob: FileWithBlob = { fname: fname, blob: blob };
			if (fname.endsWith("stats")) {
				fileWithBlob.content = await blob.text();
			} else {
				fileWithBlob.content = window.URL.createObjectURL(blob);
			}
			filesWithBlobs.push(fileWithBlob);
		}
		fileSetter(filesWithBlobs);
	}

	useEffect(() => {
		getPluginAndFiles(fshackName, setFshackPlugin, setFshackFiles);
		getPluginAndFiles(med2ImgName, setMed2ImgPlugin, setMed2ImgFiles);
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
							{keys.map((key, index) => (
								<th key={index}>
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
							{keys.map((key, index) => (
								<td key={index}>
									{plugin.data[key as keyof typeof data]}
								</td>
							))}
						</tr>
					</tbody>
				</Table>
			);
		}
	}

	function getFilesContents(
		files: FileWithBlob[],
		pluginName: string
	): JSX.Element {
		if (files) {
			const prefix = files[0].fname.endsWith("stats")
				? fshackName
				: files[0].fname.endsWith("png")
				? med2ImgName
				: "link";

			const listGroup = (
				<ListGroup horizontal defaultActiveKey={`#${prefix}0`}>
					{files.map((_, index) => (
						<ListGroup.Item action href={`#${prefix}${index}`}>
							File {index}
						</ListGroup.Item>
					))}
				</ListGroup>
			);

			const tabContent = (
				<Tab.Content>
					{files.map((file, index) => {
						const { fname, content } = file;
						let tabContent = <p>{fname}</p>;

						if (fname.endsWith("png")) {
							tabContent = (
								<>
									<p>
										<b style={{ color: "red" }}>
											{`PNG: `}
										</b>
										{fname}
									</p>
									<img src={content} />
								</>
							);
						}

						if (fname.endsWith("stats")) {
							tabContent = (
								<>
									<p>
										<b style={{ color: "red" }}>
											{`STATS: `}
										</b>
										{fname}
									</p>
									<p>{content}</p>
								</>
							);
						}
						return (
							<Tab.Pane eventKey={`#${prefix}${index}`}>
								{tabContent}
							</Tab.Pane>
						);
					})}
				</Tab.Content>
			);

			return (
				<Tab.Container id={`list-group-tabs-${pluginName}`}>
					<Row>
						<Col>{listGroup} </Col>
						<Col>{tabContent}</Col>
					</Row>
				</Tab.Container>
			);
		}
	}

	return (
		<Container className="py-4">
			<h3>Feed Page</h3>
			<h4>Infant FS plugin results</h4>
			{getPluginContent(fshackPlugin)}
			{getFilesContents(fshackFiles, fshackName)}

			<h4>Medical image plugin results</h4>
			{getPluginContent(med2ImgPlugin)}

			{/* I can get rid of this once we have pl-multipass set up */}
			{getFilesContents(med2ImgFiles, med2ImgName)}
		</Container>
	);
}

export default FeedPage;
