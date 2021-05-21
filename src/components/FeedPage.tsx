import { useState, useEffect } from "react";
import { Container, Table, ListGroup, Tab, Row, Col } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton from "../api/ClientSingleton";
import Client, {
	Feed,
	FeedFile,
	PluginInstance,
	PluginInstanceFileList,
} from "@fnndsc/chrisapi";
import {
	infantFSPluginName,
	med2ImgPluginName,
	feedPageParameter,
	statsWithTableStructure,
	keyToTextMap,
} from "../shared/Constants";

interface Parameters {
	[key: string]: string;
}

interface File {
	fname: string;
	blob: Blob;
	content?: string;
}

interface TableStructure {
	header: string[];
	body: string[][];
}

function FeedPage(): JSX.Element {
	let params = useParams<Parameters>();
	const feedId = params[feedPageParameter];
	const [instances, setInstances] = useState<PluginInstance[]>([]);
	const [files, setFiles] = useState<File[][]>([]);

	useEffect(() => {
		setPluginAndFiles(feedId, setInstances, setFiles);
	}, []);

	return (
		<Container className="py-4">
			<h3>Feed Page</h3>
			{instances.map((instance, index) => {
				const infoDisplay = renderPluginInfo(instance);
				const pluginFiles: File[] = files[index];
				const pluginName: string = instance.data.plugin_name;
				const filesDisplay = renderPluginFiles(pluginFiles, pluginName);
				return (
					<Row>
						<h4>{pluginName} results</h4>
						{infoDisplay}
						{filesDisplay}
					</Row>
				);
			})}
		</Container>
	);
}

async function setPluginAndFiles(
	feedId: string,
	instancesSetter: (value: React.SetStateAction<PluginInstance[]>) => void,
	filesSetter: (value: React.SetStateAction<File[][]>) => void
): Promise<void> {
	const client = await ClientSingleton.getInstance();
	const id = parseInt(feedId);
	const feed = await client.getFeed(id);

	const instances: PluginInstance[] = (
		await feed.getPluginInstances()
	).getItems();
	const files: File[][] = [];

	for (let instance of instances) {
		const instanceFeedFiles = await getFeedFiles(instance);
		const instanceFiles = await getFiles(instanceFeedFiles);
		files.push(instanceFiles);
	}

	instancesSetter(instances);
	filesSetter(files);
}

async function getFeedFiles(instance: PluginInstance): Promise<FeedFile[]> {
	const fileParams = { limit: 25, offset: 0 };
	let pluginInstanceFiles: PluginInstanceFileList = await instance.getFiles(
		fileParams
	);
	let feedFiles: FeedFile[] = pluginInstanceFiles.getItems();

	while (pluginInstanceFiles.hasNextPage) {
		try {
			fileParams.offset += fileParams.limit;
			pluginInstanceFiles = await instance.getFiles(fileParams);
			feedFiles = feedFiles.concat(pluginInstanceFiles.getItems());
		} catch (error) {
			throw new Error("Error while paginating files");
		}
	}

	feedFiles = feedFiles.filter(isStatsOrPng);
	return feedFiles;
}

function isStatsOrPng(feedFile: FeedFile): boolean {
	const { fname } = feedFile.data;
	return fname.endsWith("stats") || fname.endsWith("png");
}

async function getFiles(feedFiles: FeedFile[]): Promise<File[]> {
	const files: File[] = [];

	for (let feedFile of feedFiles) {
		const fname = feedFile.data.fname;
		const blob: Blob = await feedFile.getFileBlob();
		const file: File = { fname: fname, blob: blob };

		if (fname.endsWith("stats")) {
			file.content = await blob.text();
		} else {
			file.content = window.URL.createObjectURL(blob);
		}
		files.push(file);
	}
	return files;
}

function renderPluginInfo(instance: PluginInstance): JSX.Element {
	if (instance && instance.data) {
		const { data } = instance;
		const keys = Object.keys(keyToTextMap);

		return (
			<Table responsive size="sm">
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
								{instance.data[key as keyof typeof data]}
							</td>
						))}
					</tr>
				</tbody>
			</Table>
		);
	}
}

function renderPluginFiles(files: File[], pluginName: string): JSX.Element {
	if (files && files.length !== 0) {
		const first = files[0];
		const prefix = first.fname.endsWith("stats")
			? infantFSPluginName
			: first.fname.endsWith("png")
			? med2ImgPluginName
			: "link";

		const listGroup = (
			<ListGroup defaultActiveKey={`#${prefix}0`}>
				{files.map(renderListGroupItem(prefix))}
			</ListGroup>
		);

		const tabContent = (
			<Tab.Content>{files.map(renderTabPane(prefix))}</Tab.Content>
		);

		return (
			<Tab.Container id={`list-group-tabs-${pluginName}`}>
				<Col md={3}>{listGroup} </Col>
				<Col md={9}>{tabContent}</Col>
			</Tab.Container>
		);
	}
}

function handleStats(fname: string, content: string): JSX.Element {
	let { header, body }: TableStructure = getTableStructure(fname, content);

	return (
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
	);
}

function handlePng(fname: string, content: string): JSX.Element {
	return <img src={content} />;
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

function renderListGroupItem(
	prefix: string
): (value: File, index: number) => JSX.Element {
	return (value, index) => {
		return (
			<ListGroup.Item action href={`#${prefix}${index}`}>
				{getShortFilename(value.fname)}
			</ListGroup.Item>
		);
	};
}

function renderTabPane(
	prefix: string
): (value: File, index: number, array: File[]) => JSX.Element {
	return (file, index) => {
		const { fname, content } = file;
		let paneContent = null;
		const filenameContent = renderFilename(fname);

		if (fname.endsWith("png")) {
			paneContent = handlePng(fname, content);
		}

		if (fname.endsWith("stats")) {
			// the other stats files that don't share this whitespace-separated structure are console logged below
			paneContent = handleStats(fname, content);
		}
		return (
			<Tab.Pane eventKey={`#${prefix}${index}`}>
				{filenameContent}
				{paneContent}
			</Tab.Pane>
		);
	};
}

function renderFilename(fname: string) {
	return (
		<p>
			<b>{`Filename: `}</b>
			{getShortFilename(fname)}
		</p>
	);
}

function getShortFilename(fname: string): string {
	return fname.split("/").pop();
}

export default FeedPage;
