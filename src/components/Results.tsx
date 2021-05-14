import { useState, useEffect } from "react";
import moment from "moment";
import ClientSingleton from "../api/ClientSingleton";

import {
	Badge,
	Button,
	Container,
	Table,
} from "react-bootstrap";
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

	function tableEntry(feed: any, index: any): JSX.Element {
		let status = "";
		if (
			feed.data.waiting_jobs == 0 &&
			feed.data.errored_jobs == 0 &&
			feed.data.cancelled_jobs == 0
		) {
			status = "Finished";
		} else if (feed.data.errored_jobs > 0 || feed.data.cancelled_jobs > 0) {
			status = "Error";
		} else if (feed.data.waiting_jobs > 0) {
			status = "Running";
		}

		let creationDate = moment(feed.data.creation_date);
		let modificationDate = moment(feed.data.modification_date);
		let isNew = creationDate.isAfter(moment().subtract(3, "days"));

		return (
			<tr key={index}>
				<td>{feed.data.id}</td>
				<td>{feed.data.name}</td>
				<td>
					{creationDate.fromNow()}
					{isNew && (
						<Badge className="rounded-pill bg-secondary">New</Badge>
					)}
				</td>
				<td>{modificationDate.fromNow()}</td>
				<td>{status}</td>
				<td>
					<Button variant="outline-primary">View</Button>
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
