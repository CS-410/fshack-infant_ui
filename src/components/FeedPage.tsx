import { useState, useEffect } from "react";
import { Container, Table, ListGroup, Tab, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton from "../api/ClientSingleton";
import Client, {
	FeedFile,
	PluginInstance,
	PluginInstanceFileList,
} from "@fnndsc/chrisapi";
import {
	infantFSPluginName,
	med2ImgPluginName,
	statsWithTableStructure,
	keyToTextMap,
} from "../shared/Constants";

interface FeedPageParams {
	id: any;
}

interface FileWithBlob {
	fname: string;
	blob: Blob;
	content?: string;
}

interface TableStructure {
	header: string[];
	body: string[][];
}

function FeedPage(): JSX.Element {
	let params = useParams<FeedPageParams>();
	const { id } = params;
	const [fshackPlugin, setFshackPlugin] = useState<PluginInstance>(null);
	const [fshackFiles, setFshackFiles] = useState<FileWithBlob[]>(null);
	const [med2ImgPlugin, setMed2ImgPlugin] = useState<PluginInstance>(null);
	const [med2ImgFiles, setMed2ImgFiles] = useState<FileWithBlob[]>(null);

	useEffect(() => {
		getPluginAndFiles(
			id,
			infantFSPluginName,
			setFshackPlugin,
			setFshackFiles
		);
		getPluginAndFiles(
			id,
			med2ImgPluginName,
			setMed2ImgPlugin,
			setMed2ImgFiles
		);
	}, []);

	return (
		<Container className="py-4">
			<h3>Feed Page</h3>
			<h4>Infant FS plugin results</h4>
			{getPluginContent(fshackPlugin)}
			{getFilesContents(fshackFiles, infantFSPluginName)}

			<h4>Medical image plugin results</h4>
			{getPluginContent(med2ImgPlugin)}

			{/* I can get rid of this once we have pl-multipass set up */}
			{getFilesContents(med2ImgFiles, med2ImgPluginName)}
		</Container>
	);
}

async function getPluginAndFiles(
	id: string,
	pluginName: string,
	pluginSetter: (value: React.SetStateAction<PluginInstance>) => void,
	fileSetter: (value: React.SetStateAction<FileWithBlob[]>) => void
): Promise<void> {
	const client = await ClientSingleton.getInstance();
	const plugin: PluginInstance = await getPlugin(client, id, pluginName);
	pluginSetter(plugin);

	const files: FeedFile[] = await getFiles(plugin);
	const filesWithBlobs: FileWithBlob[] = await getFilesWithBlobs(files);
	fileSetter(filesWithBlobs);
}

async function getPlugin(
	client: Client,
	id: string,
	pluginName: string
): Promise<PluginInstance> {
	const pluginInstance = await client.getPluginInstances({
		limit: 25,
		offset: 0,
		plugin_name: pluginName,
		feed_id: id,
	});

	const plugin: PluginInstance = pluginInstance.getItems()[0];

	return plugin;
}

async function getFiles(plugin: PluginInstance): Promise<FeedFile[]> {
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

	files = files.filter((file: FeedFile) => {
		const { fname } = file.data;
		return fname.endsWith("stats") || fname.endsWith("png");
	});

	return files;
}

async function getFilesWithBlobs(files: FeedFile[]): Promise<FileWithBlob[]> {
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
	return filesWithBlobs;
}

function getPluginContent(plugin: PluginInstance): JSX.Element {
	if (plugin && plugin.data) {
		const { data } = plugin;
		const keys = Object.keys(keyToTextMap);

		return (
			<Table responsive>
				<thead>
					<tr>
						{keys.map((key, index) => (
							<th key={index}>
								{keyToTextMap[key as keyof typeof keyToTextMap]}
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
			? infantFSPluginName
			: files[0].fname.endsWith("png")
			? med2ImgPluginName
			: "link";

		const listGroup = (
			<ListGroup defaultActiveKey={`#${prefix}0`}>
				{files.map(getListGroupItem(prefix))}
			</ListGroup>
		);

		const tabContent = (
			<Tab.Content>
				{files.map(getTabPane(handlePng, handleStats, prefix))}
			</Tab.Content>
		);

		return (
			<Tab.Container id={`list-group-tabs-${pluginName}`}>
				<Row>
					<Col md={2}>{listGroup} </Col>
					<Col md={10}>{tabContent}</Col>
				</Row>
			</Tab.Container>
		);
	}
}

function handleStats(fname: string, content: string): JSX.Element {
	let { header, body }: TableStructure = getTableStructure(fname, content);

	return (
		<>
			<p>
				<b style={{ color: "red" }}>{`STATS: `}</b>
				{fname}
			</p>
			<Table responsive size="sm">
				<thead>
					<tr>
						{header.map((col) => (
							<th>{col}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{body.map((row) => (
						<tr>
							{row.map((col) => (
								<td>{col}</td>
							))}
						</tr>
					))}
				</tbody>
			</Table>
		</>
	);
}

function handlePng(fname: string, content: string): JSX.Element {
	return (
		<>
			<p>
				<b style={{ color: "red" }}>{`PNG: `}</b>
				{fname}
			</p>
			<img src={content} />
		</>
	);
}

function getTableStructure(fname: string, content: string): TableStructure {
	let header: string[] = [];
	let body: string[][] = [];

	if (statsWithTableStructure.some((stat) => fname.includes(stat))) {
		const comments = content
			.split("\n")
			.filter((line) => line.includes("#"));

		header = comments[comments.length - 1]
			.split("ColHeaders")[1]
			.split(/\s+/)
			.filter((col) => col.length !== 0);

		const nonComments = content
			.split("\n")
			.filter((line) => !line.includes("#"));

		body = nonComments.map((line) =>
			line.split(/\s+/).filter((col) => col.length !== 0)
		);
	} else if (false) {
		// left this here as a placeholder for the outlier stats files
	} else {
		console.log(fname, content);
	}
	return { header, body };
}

function getListGroupItem(
	prefix: string
): (value: FileWithBlob, index: number, array: FileWithBlob[]) => JSX.Element {
	return (_, index) => (
		<ListGroup.Item action href={`#${prefix}${index}`}>
			File {index}
		</ListGroup.Item>
	);
}

function getTabPane(
	handlePng: (fname: string, content: string) => JSX.Element,
	handleStats: (fname: string, content: string) => JSX.Element,
	prefix: string
): (value: FileWithBlob, index: number, array: FileWithBlob[]) => JSX.Element {
	return (file, index) => {
		const { fname, content } = file;
		let paneContent = <p>{fname}</p>;

		if (fname.endsWith("png")) {
			paneContent = handlePng(fname, content);
		}

		if (fname.endsWith("stats")) {
			// the other stats files that don't share this whitespace-separated structure are console logged below
			paneContent = handleStats(fname, content);
		}
		return (
			<Tab.Pane eventKey={`#${prefix}${index}`}>{paneContent}</Tab.Pane>
		);
	};
}

export default FeedPage;
