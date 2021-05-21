import { useEffect, useReducer } from "react";
import { Row, Col, ListGroup, Container, Badge, Tab } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton, { getFeedStatus } from "../api/ClientSingleton";
import { overlayTooltip, feedStatusIndicator } from "./UI";
import moment from "moment";
import Client, {
	Feed,
	FeedFile,
	FeedPluginInstanceList,
	PluginInstance,
	PluginInstanceFileList,
	PluginInstanceParameterList,
} from "@fnndsc/chrisapi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../css/FeedView.css";
import { Loading } from "react-loading-dot";
import {
	FileObj,
	SearchParams,
	Parameters,
	FeedViewDispatch,
	FeedViewState,
	FeedViewValue,
	TableBody,
	TableHeader,
	TableStructure,
} from "../shared/interfaces";
import {
	feedPageParameter,
	dircopyPluginName,
	infantFSPluginName,
	med2ImgPluginName,
	initialFeedViewState,
} from "../shared/constants";

function feedViewReducer(
	state: FeedViewState,
	action: {
		type: string;
		value: FeedViewValue;
	}
): FeedViewState {
	const { type, value } = action;
	switch (type) {
		case "setIfsFiles":
			return { ...state, ifsFiles: value as FileObj[] };
		case "setMedFiles":
			return { ...state, medFiles: value as FileObj[] };
		case "setUploadedFileName":
			return { ...state, uploadedFileName: value as string };
		case "setFeed":
			return { ...state, feed: value as Feed };
		case "setFeedStatus":
			return { ...state, feedStatus: value as number };
		case "setFeedAndStatus":
			const { feed, feedStatus } = value as {
				feed: Feed;
				feedStatus: number;
			};
			return {
				...state,
				feed: feed as Feed,
				feedStatus: feedStatus as number,
			};
	}
	return state;
}

export default function FeedView(): JSX.Element {
	const params = useParams<Parameters>();
	const feedId = params[feedPageParameter];
	const [state, dispatch] = useReducer(feedViewReducer, initialFeedViewState);

	useEffect(() => {
		(async function () {
			const client: Client = await ClientSingleton.getInstance();
			const feed: Feed = await client.getFeed(parseInt(feedId));
			const feedStatus = getFeedStatus(feed);
			dispatch({
				type: "setFeedAndStatus",
				value: { feed, feedStatus },
			});
		})();
	}, []);

	useEffect(() => {
		loadFeed(state.feed, state.feedStatus, dispatch);
	}, [state.feed, state.feedStatus, dispatch]);

	return (
		<Container className="py-4">
			{header(state)}
			{results(state)}
		</Container>
	);
}

function renderJobBadges(feed: Feed): JSX.Element {
	const {
		started_jobs,
		waiting_jobs,
		scheduled_jobs,
		cancelled_jobs,
		errored_jobs,
	} = feed.data;

	return (
		<div className="py-2">
			{started_jobs !== 0 && (
				<Badge pill className="bg-secondary">
					Started: {started_jobs}
				</Badge>
			)}
			{` `}
			{waiting_jobs !== 0 && (
				<Badge pill className="bg-primary">
					Waiting: {waiting_jobs}
				</Badge>
			)}
			{` `}
			{scheduled_jobs !== 0 && (
				<Badge pill className="bg-dark">
					Scheduled: {scheduled_jobs}
				</Badge>
			)}
			{` `}
			{cancelled_jobs !== 0 && (
				<Badge pill className="bg-warning">
					Cancelled: {cancelled_jobs}
				</Badge>
			)}
			{` `}
			{errored_jobs !== 0 && (
				<Badge pill className="bg-danger">
					Errored: {errored_jobs}
				</Badge>
			)}
		</div>
	);
}

async function handleCompletedFeed(
	plugin: PluginInstance,
	dispatch: FeedViewDispatch
) {
	let files = await getFeedFiles(plugin);

	let fileObjs: FileObj[] = [];
	for (const file of files) {
		const path: string = file.data.fname;
		const name: string = path.replace(/^.*[\\/]/, "");
		const ext: string = name.split(".").pop();

		if (!["png", "jpg", "stats"].includes(ext)) {
			continue;
		}

		const blob: Blob = await file.getFileBlob();
		let fileObj: FileObj = await getFileObj(path, name, ext, blob);
		fileObjs.push(fileObj);
	}

	switch (plugin.data.plugin_name) {
		case infantFSPluginName:
			dispatch({ type: "setIfsFiles", value: fileObjs });
			break;
		case med2ImgPluginName:
			dispatch({ type: "setMedFiles", value: fileObjs });
			break;
	}
}

async function handleDircopyPlugin(
	plugin: PluginInstance,
	dispatch: FeedViewDispatch
): Promise<void> {
	const dircopyParams: PluginInstanceParameterList = await plugin.getParameters();
	const path: string = await dircopyParams.getItems()[0].data.value;
	const name: string = path.replace(/^.*[\\/]/, "");
	dispatch({ type: "setUploadedFileName", value: name });
}

async function getFileObj(
	path: string,
	name: string,
	ext: string,
	blob: Blob
): Promise<FileObj> {
	let fileObj: FileObj = {
		path: path,
		name: name,
		ext: ext,
		blob: blob,
		content: "",
	};

	switch (fileObj.ext) {
		case "stats":
			fileObj.content = await blob.text();
			break;
		case "png":
		case "jpg":
			fileObj.content = window.URL.createObjectURL(blob);
			break;
	}

	return fileObj;
}

async function getFeedFiles(plugin: PluginInstance): Promise<FeedFile[]> {
	const searchParams: SearchParams = {
		offset: 0,
		limit: 20,
	};
	let fileList: PluginInstanceFileList = await plugin.getFiles(searchParams);
	let files: FeedFile[] = await fileList.getItems();

	while (fileList.hasNextPage) {
		try {
			searchParams.offset += searchParams.limit;
			fileList = await plugin.getFiles(searchParams);
			files = files.concat(await fileList.getItems());
		} catch (error) {
			throw new Error("Error while fetching files");
		}
	}

	return files;
}

async function loadFeed(
	feed: Feed,
	feedStatus: number,
	dispatch: FeedViewDispatch
): Promise<void> {
	if (feed) {
		const pluginList: FeedPluginInstanceList = await feed.getPluginInstances();
		const plugins: PluginInstance[] = await pluginList.getItems();
		for (const plugin of plugins) {
			console.log(plugin.data.plugin_name);

			if (plugin.data.plugin_name === dircopyPluginName) {
				await handleDircopyPlugin(plugin, dispatch);
			} else if (feedStatus === 0) {
				await handleCompletedFeed(plugin, dispatch);
			}
		}
	}
}

function header(state: FeedViewState): JSX.Element {
	if (state.feed) {
		const { feed, uploadedFileName } = state;
		const { id, creation_date, modification_date } = feed.data;

		const creationDate: moment.Moment = moment(creation_date);
		const modificationDate: moment.Moment = moment(modification_date);

		return (
			<Row>
				<Col>
					<div>
						<h1>Feed {id}</h1>
						<h3>
							<b>{uploadedFileName}</b>
						</h3>
						{`Created `}
						{overlayTooltip(
							<span>{creationDate.fromNow()}</span>,
							creationDate.format()
						)}
						{`, updated `}
						{overlayTooltip(
							<span>{modificationDate.fromNow()}</span>,
							modificationDate.format()
						)}
					</div>
					{renderJobBadges(feed)}
				</Col>
				<Col className="d-flex justify-content-end align-items-center mb-4">
					{feedStatusIndicator(feed, 92)}
				</Col>
				<hr />
			</Row>
		);
	}
}

function results(state: FeedViewState): JSX.Element {
	const { feed, ifsFiles, medFiles, feedStatus } = state;

	if (ifsFiles && medFiles) {
		return (
			<Tab.Container>
				<Row>
					<Col sm={3}>
						<ListGroup>
							{itemList(ifsFiles)}
							{itemList(medFiles)}
						</ListGroup>
					</Col>
					<Col sm={9}>
						<Tab.Content>
							{itemContent(ifsFiles)}
							{itemContent(medFiles)}
						</Tab.Content>
					</Col>
				</Row>
			</Tab.Container>
		);
	} else {
		const text: JSX.Element | string = getText(feed, feedStatus);
		const statusText = (
			<h4 className="py-5 d-flex justify-content-center">{text}</h4>
		);

		return statusText;
	}
}

function getText(feed: Feed, feedStatus: number): string | JSX.Element {
	let text: JSX.Element | string = (
		<Col className="d-flex justify-content-center">
			<Row>Loading results...</Row>
			<Row>
				<Loading dots="3" background="#000" size="1rem" />
			</Row>
		</Col>
	);

	if (feed) {
		if (feedStatus === 1) {
			text = "This analysis hasn't finished running yet.";
		} else if (feedStatus === 2) {
			text = "This analysis was cancelled.";
		} else if (feedStatus === 3) {
			text = "This analysis encountered an error. Please try again.";
		}
	}
	return text;
}

function itemList(fileObjs: FileObj[]): JSX.Element[] {
	return fileObjs.map((fileObj: FileObj) => {
		return (
			<ListGroup.Item href={`#${fileObj.name}`} action>
				{fileObj.name}
			</ListGroup.Item>
		);
	});
}

function itemContent(fileObjs: FileObj[]): JSX.Element[] {
	return fileObjs.map((fileObj: FileObj) => {
		let content: JSX.Element | any;
		if (fileObj.ext === "stats") {
			content = parseStats(fileObj.content);
		} else if (fileObj.ext === "png") {
			content = <img width="75%" src={fileObj.content} />;
		} else {
			content = fileObj.content;
		}
		return (
			<Tab.Pane style={{ height: "900px" }} eventKey={`#${fileObj.name}`}>
				{content}
			</Tab.Pane>
		);
	});
}

function parseStats(content: string): JSX.Element {
	if (content.includes("# ColHeaders")) {
		const lines: string[] = content.split("\n");
		let { head, body }: TableStructure = getTableStructure(lines);

		const columnNames: string[] = getColumnNames(head);

		const doc = new jsPDF({ orientation: "landscape" });
		autoTable(doc, {
			theme: "plain",
			styles: { font: "courier" },
			head: [columnNames],
			body: body,
		});

		return (
			<embed
				width="100%"
				height="100%"
				src={`${doc.output("dataurlstring")}#navpanes=0`}
			/>
		);
	} else {
		return (
			<pre>
				<code>{content}</code>
			</pre>
		);
	}
}

function getTableStructure(lines: string[]): TableStructure {
	let head: TableHeader = [];
	let body: TableBody = [];
	for (const line of lines) {
		if (line.startsWith("# TableCol")) {
			const row: string[] = line
				.split("# TableCol")[1]
				.split(" ")
				.filter((i: string) => i);
			const index: number = parseInt(row[0]);
			const title: string = row[1];
			const data: string = row.slice(2).join(" ");

			if (!head[index - 1]) {
				head[index - 1] = {};
			}

			head[index - 1][title] = data;
		} else if (!line.startsWith("#")) {
			body.push(line.split(" ").filter((i: string) => i));
		}
	}

	return { head, body };
}

function getColumnNames(head: any): string[] {
	return head.map((col: any) => {
		const unit: string = !["NA", "unitless", "unknown", "none"].includes(
			col.Units
		)
			? ` (${col.Units})`
			: "";
		return col.FieldName + unit;
	});
}
