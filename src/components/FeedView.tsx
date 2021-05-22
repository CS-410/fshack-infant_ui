import { useState, useEffect } from "react";
import { Row, Col, ListGroup, Container, Badge, Tab } from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton, { getFeedStatus } from "../api/ClientSingleton";
import { overlayTooltip, feedStatusIndicator } from "../shared/UI";
import moment from "moment";
import Client, {
	Feed,
	FeedPluginInstanceList,
	PluginInstanceFileList,
	PluginInstanceParameterList,
} from "@fnndsc/chrisapi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../css/FeedView.css";
import { Loading } from "react-loading-dot";
import { FileObj, SearchParams } from "../shared/interfaces";
import { pluginName, timeFormat } from "../shared/constants";

export default function FeedView(): JSX.Element {
	const params = useParams<{ id: any }>();
	const [ifsFiles, setIfsFiles] = useState(null);
	const [medFiles, setMedFiles] = useState(null);
	const [uploadedFileName, setUploadedFileName] = useState<string>("");
	const [feed, setFeed] = useState<Feed>(null);
	const [feedStatus, setFeedStatus] = useState<number>(-1);

	useEffect(() => {
		(async function () {
			const client: Client = await ClientSingleton.getInstance();
			const feed: Feed = await client.getFeed(parseInt(params.id));
			setFeed(feed);
			setFeedStatus(getFeedStatus(feed));
		})();
	}, []);

	useEffect(() => {
		(async function () {
			if (feed) {
				const pluginList: FeedPluginInstanceList = await feed.getPluginInstances();
				for (const plugin of await pluginList.getItems()) {
					if (plugin.data.plugin_name === pluginName.dircopy) {
						const dircopyParams: PluginInstanceParameterList = await plugin.getParameters();
						const path: string = await dircopyParams.getItems()[0]
							.data.value;
						const name: string = path.replace(/^.*[\\\/]/, "");
						setUploadedFileName(name);
					} else if (feedStatus === 0) {
						const searchParams: SearchParams = {
							offset: 0,
							limit: 200,
						};
						let fileList: PluginInstanceFileList = await plugin.getFiles(
							searchParams
						);
						let files = await fileList.getItems();
						while (fileList.hasNextPage) {
							searchParams.offset += searchParams.limit;
							fileList = await plugin.getFiles(searchParams);
							files = files.concat(await fileList.getItems());
						}

						let fileObjs: FileObj[] = [];
						for (const file of files) {
							const path: string = file.data.fname;
							const name: string = path.replace(/^.*[\\\/]/, "");
							const ext: string = name.split(".").pop();
							if (!["png", "jpg", "stats"].includes(ext))
								continue;
							const blob: Blob = await file.getFileBlob();
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
									fileObj.content = window.URL.createObjectURL(
										blob
									);
									break;
							}
							fileObjs.push(fileObj);
						}

						switch (plugin.data.plugin_name) {
							case pluginName.infantFs:
								setIfsFiles(fileObjs);
								break;
							case pluginName.med2img:
								setMedFiles(fileObjs);
								break;
						}
					}
				}
			}
		})();
	}, [feedStatus, setFeedStatus]);

	function header(): JSX.Element {
		if (feed) {
			const {
				id,
				creation_date,
				modification_date,
				started_jobs,
				waiting_jobs,
				scheduled_jobs,
				cancelled_jobs,
				errored_jobs,
			} = feed.data;

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
							Created{" "}
							{overlayTooltip(
								<span>{creationDate.fromNow()}</span>,
								creationDate.format(timeFormat)
							)}
							, updated{" "}
							{overlayTooltip(
								<span>{modificationDate.fromNow()}</span>,
								modificationDate.format(timeFormat)
							)}
						</div>
						<div className="py-2">
							{started_jobs !== 0 && (
								<Badge pill className="bg-dark">
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
								<Badge pill className="bg-secondary">
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
					</Col>
					<Col className="d-flex justify-content-end align-items-center mb-4">
						{feedStatusIndicator(feed, 92)}
					</Col>
					<hr />
				</Row>
			);
		}
	}

	function results(): JSX.Element {
		function itemList(fileObjs: FileObj[]) {
			return fileObjs.map((fileObj: FileObj) => {
				return (
					<ListGroup.Item href={`#${fileObj.name}`} action>
						{fileObj.name}
					</ListGroup.Item>
				);
			});
		}

		function itemContent(fileObjs: FileObj[]) {
			return fileObjs.map((fileObj: FileObj) => {
				let content: any;
				if (fileObj.ext === "stats") {
					content = processStats(fileObj.content);
				} else if (fileObj.ext === "png") {
					content = <img width="75%" src={fileObj.content} />;
				} else {
					content = fileObj.content;
				}
				return (
					<Tab.Pane
						style={{ height: "900px" }}
						eventKey={`#${fileObj.name}`}
					>
						{content}
					</Tab.Pane>
				);
			});
		}

		function processStats(content: string) {
			if (content[0] === "#") {
				const lines: string[] = content.split("\n");
				let mainHead: any = [];
				let mainBody: any = [];
				let measure: any = [];
				for (const line of lines) {
					if (line.startsWith("# TableCol")) {
						const row: string[] = line
							.split("# TableCol")[1]
							.split(" ")
							.filter((i: string) => i);
						const index: number = parseInt(row[0]);
						const title: string = row[1];
						const data: string = row.slice(2).join(" ");
						if (!mainHead[index - 1]) mainHead[index - 1] = {};
						mainHead[index - 1][title] = data;
					} else if (line.startsWith("# Measure")) {
						const row = line
							.split("# Measure")[1]
							.split(", ")
							.slice(1);
						row[2] = parseFloat(row[2]).toFixed(3);
						measure.push(row);
					} else if (!line.startsWith("#")) {
						mainBody.push(line.split(" ").filter((i: string) => i));
					}
				}

				const getColumnNames = (
					array: [],
					descCol: string,
					unitCol: string
				) =>
					array.map((col: any) => {
						const unit: string = ![
							"NA",
							"unitless",
							"unknown",
							"none",
						].includes(eval(unitCol))
							? ` (${eval(unitCol)})`
							: "";
						return eval(descCol) + unit;
					});

				const headColumnNames: string[] = getColumnNames(
					mainHead,
					"col.FieldName",
					"col.Units"
				);

				const measureColumnNames: string[] = getColumnNames(
					measure,
					"col[1]",
					"col[3]"
				);
				const measureBody = measureColumnNames.map(
					(row: string, i: any) => {
						return [row, measure[i][2]];
					}
				);

				/*
				const table: JSX.Element = (
					<Table responsive size="sm">
						<thead>
							<tr>
								{mainHead.map((col: any) => (
									<th>{col}</th>
								))}
							</tr>
						</thead>
						<tbody>
							{mainBody.map((row: any) => (
								<tr>
									{row.map((col: any) => (
										<td>{col}</td>
									))}
								</tr>
							))}
						</tbody>
					</Table>
				);
				*/

				const doc = new jsPDF({ orientation: "landscape" });

				if (measure) {
					autoTable(doc, {
						theme: "plain",
						styles: { font: "courier" },
						showHead: false,
						columnStyles: {
							0: { fontStyle: "bold" },
						},
						head: [["", ""]],
						body: measureBody,
					});
				}

				autoTable(doc, {
					theme: "plain",
					styles: { font: "courier" },
					head: [headColumnNames],
					body: mainBody,
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
			const statusText = (text: any) => {
				return (
					<h4 className="py-5 d-flex justify-content-center">
						{text}
					</h4>
				);
			};

			let text: any = (
				<Col className="d-flex justify-content-center">
					<Row>
						Loading results...
						<div id="loadingDots">
							<Loading dots="3" background="#000" size="1rem" />
						</div>
					</Row>
				</Col>
			);
			if (feed && feedStatus === 1) {
				text = "This analysis hasn't finished running yet.";
			} else if (feed && feedStatus === 2) {
				text = "This analysis was cancelled.";
			} else if (feed && feedStatus === 3) {
				text = "This analysis encountered an error. Please try again.";
			}

			return statusText(text);
		}
	}

	return (
		<Container className="py-4">
			{header()}
			{results()}
		</Container>
	);
}
