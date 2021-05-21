import { useState, useEffect } from "react";
import { useSharedState } from "../shared/state";
import moment from "moment";
import Client, { Feed, PluginInstance } from "@fnndsc/chrisapi";
import { overlayTooltip, feedStatusIndicator } from "./UI";
import ClientSingleton from "../api/ClientSingleton";
import { LinkContainer } from "react-router-bootstrap";
import { Badge, Button, Container, Table, Pagination } from "react-bootstrap";
import "../css/Results.css";
import { infantFSPluginName } from "../shared/constants";

export default function Results(): JSX.Element {
	const [state] = useSharedState();
	const [feeds, setFeeds] = useState<Feed[]>([]);
	const [currentPage, setCurrentPage] = useState<number>(1);

	useEffect(() => {
		getFeeds(setFeeds);
	}, [feeds, setFeeds]);

	const feedsPerPage: number = 10;
	const lastPage: number = Math.ceil(feeds.length / feedsPerPage);
	const lastFeedIndex: number = currentPage * feedsPerPage;
	const firstFeedIndex: number = lastFeedIndex - feedsPerPage;
	const currentFeeds: any[] = feeds.slice(firstFeedIndex, lastFeedIndex);

	function tableEntry(feed: Feed, index: number): JSX.Element {
		const { id, name, creation_date, modification_date } = feed.data;
		const creationDate: moment.Moment = moment(creation_date);
		const modificationDate: moment.Moment = moment(modification_date);
		const isNew: boolean = creationDate.isAfter(
			moment().subtract(2, "days")
		);

		return (
			<tr key={index}>
				<td>{id}</td>
				<td>{name}</td>
				<td>
					{overlayTooltip(
						<span>{creationDate.fromNow()}</span>,
						creationDate.format()
					)}
					{isNew && (
						<Badge className="bg-secondary mx-2" pill>
							New
						</Badge>
					)}
				</td>
				<td>
					{overlayTooltip(
						<span>{modificationDate.fromNow()}</span>,
						modificationDate.format()
					)}
				</td>
				<td>{feedStatusIndicator(feed, 24)}</td>
				<td className="text-end">
					<LinkContainer to={`/results/${id}`}>
						<Button variant="outline-primary">View</Button>
					</LinkContainer>
				</td>
			</tr>
		);
	}

	function pagination(): JSX.Element {
		let pages: JSX.Element[] = [];
		for (let i = 1; i <= lastPage; i++) {
			pages.push(
				<Pagination.Item
					key={i}
					active={i === currentPage}
					onClick={() => setCurrentPage(i)}
				>
					{i}
				</Pagination.Item>
			);
		}

		return (
			<Pagination>
				<Pagination.First onClick={() => setCurrentPage(1)} />
				<Pagination.Prev
					onClick={() => setCurrentPage(currentPage - 1)}
					disabled={currentPage === 1}
				/>
				{pages}
				<Pagination.Next
					onClick={() => setCurrentPage(currentPage + 1)}
					disabled={currentPage === lastPage}
				/>
				<Pagination.Last onClick={() => setCurrentPage(lastPage)} />
			</Pagination>
		);
	}

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
				<tbody>{state.username && currentFeeds.map(tableEntry)}</tbody>
			</Table>
			<div className="d-flex justify-content-center">{pagination()}</div>
		</Container>
	);
}

async function getFeeds(
	feedsSetter: (value: React.SetStateAction<Feed[]>) => void
): Promise<void> {
	const client = await ClientSingleton.getInstance();
	const instanceParams = {
		plugin_name: infantFSPluginName,
		limit: 10,
		offset: 0,
	};

	let instances: PluginInstance[] = await getPluginInstances(
		client,
		instanceParams
	);
	let feeds: Feed[] = [];

	for (let instance of instances) {
		const feed = await instance.getFeed();
		feeds.push(feed);
	}

	feedsSetter(feeds);
}

async function getPluginInstances(
	client: Client,
	instanceParams: { plugin_name: string; limit: number; offset: number }
): Promise<PluginInstance[]> {
	let infantfsInstances = await client.getPluginInstances(instanceParams);
	let instances: PluginInstance[] = infantfsInstances.getItems();

	while (infantfsInstances.hasNextPage) {
		try {
			instanceParams.offset += instanceParams.limit;
			infantfsInstances = await client.getPluginInstances(instanceParams);
			instances = instances.concat(infantfsInstances.getItems());
		} catch (error) {
			throw new Error("Error while paginating feeds");
		}
	}
	return instances;
}
