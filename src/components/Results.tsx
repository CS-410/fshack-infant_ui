import { useState, useEffect } from "react";
import moment from "moment";
import ClientSingleton, { feedStatus } from "../api/ClientSingleton";
import { LinkContainer } from "react-router-bootstrap";
import {
	Badge,
	Button,
	Container,
	OverlayTrigger,
	Table,
	Spinner,
	Tooltip,
	Pagination,
} from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";
import "../css/Results.css";
import { Feed } from "@fnndsc/chrisapi";
import { toolTip } from "../api/interfaces";
import { useSharedState } from "../State";

export default function Results(): JSX.Element {
	const [state, setState] = useSharedState();
	const [feeds, setFeeds] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);

	useEffect(() => {
		(async function getFeeds(): Promise<void> {
			let feeds: Feed[] = [];

			const client = await ClientSingleton.getInstance();
			const infantfsInstances = await client.getPluginInstances({
				plugin_name: "pl-fshack-infant",
			});

			for (let instance of infantfsInstances.getItems()) {
				feeds.push(await instance.getFeed());
			}

			setFeeds(feeds);
		})();
	}, []);

	const postsPerPage = 10;
	const lastFeedIndex = currentPage * postsPerPage;
	const firstFeedIndex = lastFeedIndex - postsPerPage;
	const currentPosts = feeds.slice(firstFeedIndex, lastFeedIndex);

	function getPagination(): JSX.Element {
		let pages = [];
		const lastPage = Math.ceil(feeds.length / postsPerPage);

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
				<tbody>{state.username && currentPosts.map(getTableEntry)}</tbody>
			</Table>
			{getPagination()}
		</Container>
	);
}

function getTableEntry(feed: Feed, index: number): JSX.Element {
	const { id, name, creation_date, modification_date } = feed.data;
	const creationDate = moment(creation_date);
	const modificationDate = moment(modification_date);
	const isNew = creationDate.isAfter(moment().subtract(2, "days"));

	function statusIndicator(): JSX.Element {
		const status: number = feedStatus(feed);
		const iconSize = 24;
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

		return indicator;
	}

	return (
		<tr key={index}>
			<td>{id}</td>
			<td>{name}</td>
			<td>
				{toolTip(<span>{creationDate.fromNow()}</span>, creationDate.format())}
				{isNew && (
					<Badge pill className="bg-secondary mx-2">
						New
					</Badge>
				)}
			</td>
			<td>{toolTip(<span>{modificationDate.fromNow()}</span>, modificationDate.format())}</td>
			<td>{statusIndicator()}</td>
			<td>
				<LinkContainer to={"/results/" + id}>
					<Button variant="outline-primary">View</Button>
				</LinkContainer>
			</td>
		</tr>
	);
}