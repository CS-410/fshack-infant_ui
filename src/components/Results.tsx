import { useState, useEffect } from "react";
import { useSharedState } from "../state";
import moment from "moment";
import { Feed } from "@fnndsc/chrisapi";
import { overlayTooltip, feedStatusIndicator } from "./UI";
import ClientSingleton from "../api/ClientSingleton";
import { LinkContainer } from "react-router-bootstrap";
import { Badge, Button, Container, Table, Pagination } from "react-bootstrap";
import "../css/Results.css";

export default function Results(): JSX.Element {
	const [state] = useSharedState();
	const [feeds, setFeeds] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		// TODO: fix duplicate feeds
		(async function getFeeds(): Promise<void> {
			let feeds: Feed[] = [];
			let searchParams = {
				plugin_name: "pl-fshack-infant",
				offset: 0,
				limit: 10,
			};
			const client = await ClientSingleton.getInstance();
			let infantfsInstanceList = await client.getPluginInstances({
				searchParams,
			});
			let infantfsInstances = await infantfsInstanceList.getItems();
			while (infantfsInstanceList.hasNextPage) {
				searchParams.offset += searchParams.limit;
				infantfsInstanceList = await client.getPluginInstances(
					searchParams
				);
				infantfsInstances = infantfsInstances.concat(
					await infantfsInstanceList.getItems()
				);
			}
			for (let instance of infantfsInstances) {
				feeds.push(await instance.getFeed());
			}
			setFeeds(feeds);
		})();
	}, []);

	const feedsPerPage = 10;
	const lastPage = Math.ceil(feeds.length / feedsPerPage);
	const lastFeedIndex = currentPage * feedsPerPage;
	const firstFeedIndex = lastFeedIndex - feedsPerPage;
	const currentFeeds = feeds.slice(firstFeedIndex, lastFeedIndex);

	function tableEntry(feed: Feed, index: number): JSX.Element {
		const { id, name, creation_date, modification_date } = feed.data;
		const creationDate = moment(creation_date);
		const modificationDate = moment(modification_date);
		const isNew = creationDate.isAfter(moment().subtract(2, "days"));

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
						<Badge pill className="bg-secondary mx-2">
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
