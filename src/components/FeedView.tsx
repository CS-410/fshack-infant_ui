import { useState, useEffect } from "react";
import {
	Row,
	Col,
	ListGroup,
	Container,
	Table,
	Badge,
	Tab,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton, { getFeedStatus } from "../api/ClientSingleton";
import { overlayTooltip, feedStatusIndicator } from "./UI";
import moment from "moment";
import { Feed } from "@fnndsc/chrisapi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "../css/FeedView.css";
import { Loading } from "react-loading-dot";

export default function FeedView(): JSX.Element {
	const params = useParams<{ id: any }>();
	const [ifsFiles, setIfsFiles] = useState(null);
	const [medFiles, setMedFiles] = useState(null);
	const [uploadedFileName, setUploadedFileName] = useState<string>("");
	const [feed, setFeed] = useState<Feed>(null);
	const [feedStatus, setFeedStatus] = useState<number>(-1);

	useEffect(() => {
		(async function () {
			const client = await ClientSingleton.getInstance();
			const feed = await client.getFeed(parseInt(params.id));
			setFeed(feed);
			setFeedStatus(getFeedStatus(feed));
		})();
	}, []);

	useEffect(() => {
		(async function () {
			if (feed) {
				const pluginList = await feed.getPluginInstances();
				for (const plugin of await pluginList.getItems()) {
					console.log(plugin.data.plugin_name);
					if (plugin.data.plugin_name === "pl-dircopy") {
						const dircopyParams = await plugin.getParameters();
						const path = await dircopyParams.getItems()[0].data
							.value;
						const name = path.replace(/^.*[\\\/]/, "");
						setUploadedFileName(name);
					} else if (feedStatus === 0) {
						const fileParams = { offset: 0, limit: 200 };
						let fileList = await plugin.getFiles(fileParams);
						let files = await fileList.getItems();
						while (fileList.hasNextPage) {
							fileParams.offset += fileParams.limit;
							fileList = await plugin.getFiles(fileParams);
							files = files.concat(await fileList.getItems());
						}

						let fileObjs = [];
						for (const file of files) {
							const path = file.data.fname;
							const name = path.replace(/^.*[\\\/]/, "");
							const ext = name.split(".").pop();
							if (!["png", "jpg", "stats"].includes(ext))
								continue;
							const blob = await file.getFileBlob();
							let fileObj = {
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
							case "pl-fshack-infant":
								setIfsFiles(fileObjs);
								break;
							case "pl-med2img":
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

			const creationDate = moment(creation_date);
			const modificationDate = moment(modification_date);

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
								creationDate.format()
							)}
							, updated{" "}
							{overlayTooltip(
								<span>{modificationDate.fromNow()}</span>,
								modificationDate.format()
							)}
						</div>
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
		function itemList(files: any) {
			return files.map((file: any) => {
				return (
					<ListGroup.Item href={`#${file.name}`} action>
						{file.name}
					</ListGroup.Item>
				);
			});
		}

		function itemContent(fileObjs: any) {
			return fileObjs.map((fileObj: any) => {
				let pane = fileObj.content;
				if (fileObj.ext === "stats") {
					pane = parseStats(fileObj.content);
				} else if (fileObj.ext === "png") {
					pane = <img width="75%" src={fileObj.content} />;
				}
				return (
					<Tab.Pane
						style={{ height: "900px" }}
						eventKey={`#${fileObj.name}`}
					>
						{pane}
					</Tab.Pane>
				);
			});
		}

		function parseStats(content: string) {
			const lines = content.split("\n");
			let head: any = [];
			let body: any = [];
			for (const line of lines) {
				if (line.startsWith("# TableCol")) {
					const row = line
						.split("# TableCol")[1]
						.split(" ")
						.filter((i: string) => i);
					const index: number = parseInt(row[0]);
					const title: string = row[1];
					const data: string = row.slice(2).join(" ");
					if (!head[index - 1]) head[index - 1] = {};
					head[index - 1][title] = data;
				} else if (!line.startsWith("#")) {
					body.push(line.split(" ").filter((i: string) => i));
				}
			}

			try {
				if (head[0]["ColHeader"] === "Index") {
					head = head.slice(1);
					body = body.slice(1);
				}
			} catch {}

			const columnNames = head.map((col: any) => {
				const unit = !["NA", "unitless"].includes(col.Units)
					? ` (${col.Units})`
					: "";
				return col.FieldName + unit;
			});

			const table = (
				<Table responsive size="sm">
					<thead>
						<tr>
							{head.map((col: any) => (
								<th>{col}</th>
							))}
						</tr>
					</thead>
					<tbody>
						{body.map((row: any) => (
							<tr>
								{row.map((col: any) => (
									<td>{col}</td>
								))}
							</tr>
						))}
					</tbody>
				</Table>
			);

			const doc = new jsPDF({
				orientation: "landscape",
			});

			autoTable(doc, {
				theme: "plain",
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
							<Tab.Content className="text-center">
								{itemContent(ifsFiles)}
								{itemContent(medFiles)}
							</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			);
		} else {
			let text: any = (
				<Col className="d-flex justify-content-center">
					<Row>Loading results...</Row>
					<Row>
						<Loading dots="3" background="#000" size="1rem" />
					</Row>
				</Col>
			);
			const statusText = (text: any) => {
				return (
					<h4 className="py-5 d-flex justify-content-center">
						{text}
					</h4>
				);
			};
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
