import { useState, useEffect } from "react";
import {
	Row,
	Col,
	ListGroup,
	Container,
	Table,
	Accordion,
	Card,
	Spinner,
	Badge,
	Tab,
} from "react-bootstrap";
import { useParams } from "react-router-dom";
import ClientSingleton, { feedStatus } from "../api/ClientSingleton";
import {
	FeedFile,
	FeedFileList,
	PluginInstance,
	PluginInstanceFileList,
} from "@fnndsc/chrisapi";
import * as Icon from "react-bootstrap-icons";
import { toolTip } from "../api/interfaces";
import moment from "moment";

function endsWith(suffixes: string[], text: string) {
	return suffixes.some(function (suffix: string) {
		return text.endsWith(suffix);
	});
}

export default function FeedPage(): JSX.Element {
	let params = useParams<{ id: any }>();
	const [ifsFiles, setIfsFiles] = useState(null);
	const [medFiles, setMedFiles] = useState(null);
	const [feed, setFeed] = useState(null);

	useEffect(() => {
		(async function () {
			const client = await ClientSingleton.getInstance();
			setFeed(await client.getFeed(parseInt(params.id)));

			if (feed) {
				const pluginList = await feed.getPluginInstances();
				for (let plugin of await pluginList.getItems()) {
					const params = { offset: 0, limit: 200 };
					let fileList = await plugin.getFiles(params);
					let files = fileList.getItems();
					while (fileList.hasNextPage) {
						params.offset += params.limit;
						fileList = await plugin.getFiles(params);
						files = files.concat(fileList.getItems());
					}

					let fileObjs = [];
					for (const file of files) {
						const path = file.data.fname;
						const name = path.replace(/^.*[\\\/]/, "");
						const ext = name.split(".").pop();
						if (!["png", "jpg", "stats"].includes(ext)) continue;
						const blob = await file.getFileBlob();
						let fileObj = {
							path: path,
							name: name,
							ext: ext,
							blob: blob,
							content: "",
						};
						switch (ext) {
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
		})();
	}, []);

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
			const status: number = feedStatus(feed);
			const iconSize = 96;
			let indicator: JSX.Element;

			switch (status) {
				case 0:
					indicator = toolTip(
						<Icon.CheckCircleFill
							className="text-success"
							size={iconSize}
						/>,
						"Finished"
					);
					break;
				case 1:
					indicator = toolTip(
						<Spinner size="sm" animation="border" />,
						"In progress"
					);
					break;
				case 2:
					indicator = toolTip(
						<Icon.ExclamationCircleFill
							className="text-warning"
							size={iconSize}
						/>,
						"Cancelled"
					);
					break;
				case 3:
					indicator = toolTip(
						<Icon.XCircleFill
							className="text-danger"
							size={iconSize}
						/>,
						"Error"
					);
					break;
			}

			return (
				<Row>
					<Col>
						<div>
							<h1>Feed {id}</h1>
							Created{" "}
							{toolTip(
								<span>{moment(creation_date).fromNow()}</span>,
								moment(creation_date).format()
							)}
							, updated{" "}
							{toolTip(
								<span>
									{moment(modification_date).fromNow()}
								</span>,
								moment(modification_date).format()
							)}
						</div>
						<div className="py-2">
							{started_jobs != 0 && (
								<Badge pill className="bg-secondary">
									Started: {started_jobs}
								</Badge>
							)}
							{` `}
							{waiting_jobs != 0 && (
								<Badge pill className="bg-primary">
									Waiting: {waiting_jobs}
								</Badge>
							)}
							{` `}
							{scheduled_jobs != 0 && (
								<Badge pill className="bg-dark">
									Scheduled: {scheduled_jobs}
								</Badge>
							)}
							{` `}
							{cancelled_jobs != 0 && (
								<Badge pill className="bg-warning">
									Cancelled: {cancelled_jobs}
								</Badge>
							)}
							{` `}
							{errored_jobs != 0 && (
								<Badge pill className="bg-danger">
									Errored: {errored_jobs}
								</Badge>
							)}
						</div>
					</Col>
					<Col className="mb-4 d-flex justify-content-end align-items-center">
						<div>{indicator}</div>
					</Col>
					<hr />
				</Row>
			);
		}
	}

	function getResults(): JSX.Element {
		function listGroupItem(files: any) {
			return files.map((file: any) => {
				return (
					<ListGroup.Item action href={`#${file.name}`}>
						{file.name}
					</ListGroup.Item>
				);
			});
		}

		function parse(file: any) {
			const lines = file.split("\n");
			let header: any = [];
			let body: any = [];
			for (const line of lines) {
				if (line.startsWith("# TableCol")) {
					const row = line
						.split("# TableCol")[1]
						.split(" ")
						.filter((i: string) => i);
					const index = row[0];
					const title = row[1];
					const data = row.slice(2).join(" ");
					if (!header[index - 1]) header[index - 1] = {};
					header[index - 1][title] = data;
				} else if (!line.startsWith("#")) {
					body.push(line.split(" ").filter((i: string) => i));
				}
			}
			return (
				<Table responsive size="sm">
					<thead>
						<tr>
							{header.map((col: any) => (
								<th>
									{col.FieldName}{" "}
									{!["NA", "unitless"].includes(
										col.Units
									) && <span>({col.Units})</span>}
								</th>
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
		}

		function tabContent(files: any) {
			return files.map((file: any) => {
				let pane = file.content;
				if (file.ext === "stats") {
					pane = parse(file.content);
				}
				return <Tab.Pane eventKey={`#${file.name}`}>{pane}</Tab.Pane>;
			});
		}

		if (ifsFiles && medFiles) {
			return (
				<Tab.Container
					id="list-group-tabs-example"
					defaultActiveKey="#1"
				>
					<Row>
						<Col sm={3}>
							<ListGroup>{listGroupItem(ifsFiles)}</ListGroup>
						</Col>
						<Col sm={8}>
							<Tab.Content>{tabContent(ifsFiles)}</Tab.Content>
						</Col>
					</Row>
				</Tab.Container>
			);
		} else {
			return <span>Loading...</span>;
		}
	}

	return (
		<Container className="container-fluid py-4">
			{header()}
			{getResults()}
		</Container>
	);
}
