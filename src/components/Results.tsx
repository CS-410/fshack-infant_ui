import { useState, useEffect } from "react";
import moment from "moment";
import ClientSingleton from "../api/ClientSingleton";
import {
	Badge,
	Button,
	Container,
	OverlayTrigger,
	Table,
	Spinner,
	Tooltip,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import "../css/Results.css";

function Results(): JSX.Element {
	const [feeds, setFeeds] = useState([]);

	async function getFeeds(): Promise<void> {
		let feeds: any = [];

		const client = await ClientSingleton.getInstance();
		const infantfsInstances = await client.getPluginInstances({
			plugin_name: "pl-fshack-infant",
		});

		for (let instance of infantfsInstances.getItems()) {
			const feed = await instance.getFeed();
			feeds.push(feed);
		}

		setFeeds(feeds);
	}

	function tableEntry(feed: any, index: number): JSX.Element {
		function statusIndicator(icon: JSX.Element, text: string): JSX.Element {
			return (
				<OverlayTrigger
					placement="bottom"
					overlay={<Tooltip id="">{text}</Tooltip>}
				>
					{icon}
				</OverlayTrigger>
			);
		}

		const id = feed.data.id;
		const creationDate = moment(feed.data.creation_date);
		const modificationDate = moment(feed.data.modification_date);
		const isNew = creationDate.isAfter(moment().subtract(2, "days"));

		let status: JSX.Element;
		const hasStartedJobs: boolean = feed.data.started_jobs !== 0;
		const hasWaitingJobs: boolean = feed.data.waiting_jobs !== 0;
		const hasErroredJobs: boolean = feed.data.errored_jobs !== 0;
		const hasCancelledJobs: boolean = feed.data.cancelled_jobs !== 0;

		const iconSize = 24;
		if (
			!hasStartedJobs &&
			!hasWaitingJobs &&
			!hasCancelledJobs &&
			!hasErroredJobs
		) {
			status = statusIndicator(
				<Icon.CheckCircleFill
					size={iconSize}
					className="text-success"
				/>,
				"Finished"
			);
		} else if (hasStartedJobs || hasWaitingJobs) {
			status = statusIndicator(
				<Spinner size="sm" animation="border" />,
				"In progress"
			);
		} else if (hasCancelledJobs) {
			status = statusIndicator(
				<Icon.ExclamationCircleFill
					size={iconSize}
					className="text-warning"
				/>,
				"Cancelled"
			);
		} else if (hasErroredJobs) {
			status = statusIndicator(
				<Icon.XCircleFill size={iconSize} className="text-danger" />,
				"Error"
			);
		}

		return (
			<tr key={index}>
				<td>{id}</td>
				<td>{feed.data.name}</td>
				<td>
					{creationDate.fromNow()}
					{isNew && (
						<>
							&nbsp;&nbsp;
							<Badge className="rounded-pill bg-secondary">
								New
							</Badge>
						</>
					)}
				</td>
				<td>{modificationDate.fromNow()}</td>
				<td>{status}</td>
				<td>
					<Button href={"/results/" + id} variant="outline-primary">
						View
					</Button>
				</td>
			</tr>
		);
	}

	useEffect(() => {
		getFeeds();
	}, []);

	return (
		<Container className="py-4">
			<Table hover>
				<thead>
					<tr>
						<th>ID</th>
						<th>Name</th>
						<th>Created</th>
						<th>Updated</th>
						<th>Status</th>
						<th></th>
					</tr>
				</thead>
				<tbody>{feeds.map(tableEntry)}</tbody>
			</Table>
		</Container>
	);
}

export default Results;
