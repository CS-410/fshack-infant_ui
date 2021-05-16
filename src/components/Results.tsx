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
	Pagination,
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

	useEffect(() => {
		getFeeds();
	}, []);

	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 5;
	const indexOfLastPost = currentPage * postsPerPage;
	const indexOfFirstPost = indexOfLastPost - postsPerPage;
	const currentPosts = feeds.slice(indexOfFirstPost, indexOfLastPost);
	const totalPosts = feeds.length;

	const paginate = (pageNum: number) => setCurrentPage(pageNum);
	const nextPage = () => setCurrentPage(currentPage + 1);
	const prevPage = () => setCurrentPage(currentPage - 1);

	const pagination = getPagination(
		currentPage,
		postsPerPage,
		totalPosts,
		paginate,
		nextPage,
		prevPage
	);
	const posts = <tbody>{currentPosts.map(getTableEntry)}</tbody>;

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
				{posts}
				{pagination}
			</Table>
		</Container>
	);
}

function getPagination(
	currentPage: number,
	postsPerPage: number,
	totalPosts: number,
	paginate: (pageNum: number) => void,
	nextPage: () => void,
	prevPage: () => void
): JSX.Element {
	let active = currentPage;
	let items = [];
	const lastPage = Math.ceil(totalPosts / postsPerPage);

	for (let i = 1; i <= lastPage; i++) {
		items.push(
			<Pagination.Item
				key={i}
				active={i === active}
				onClick={() => paginate(i)}
			>
				{i}
			</Pagination.Item>
		);
	}
	return (
		<Pagination>
			<Pagination.First onClick={() => paginate(1)} />
			<Pagination.Prev onClick={prevPage} disabled={currentPage === 1} />
			{items}
			<Pagination.Next
				onClick={nextPage}
				disabled={currentPage === lastPage}
			/>
			<Pagination.Last onClick={() => paginate(lastPage)} />
		</Pagination>
	);
}

function getStatusIndicator(icon: JSX.Element, text: string): JSX.Element {
	return (
		<OverlayTrigger
			placement="bottom"
			overlay={<Tooltip id="">{text}</Tooltip>}
		>
			{icon}
		</OverlayTrigger>
	);
}

function getStatus(feed: any): JSX.Element {
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
		status = getStatusIndicator(
			<Icon.CheckCircleFill size={iconSize} className="text-success" />,
			"Finished"
		);
	} else if (hasStartedJobs || hasWaitingJobs) {
		status = getStatusIndicator(
			<Spinner size="sm" animation="border" />,
			"In progress"
		);
	} else if (hasCancelledJobs) {
		status = getStatusIndicator(
			<Icon.ExclamationCircleFill
				size={iconSize}
				className="text-warning"
			/>,
			"Cancelled"
		);
	} else if (hasErroredJobs) {
		status = getStatusIndicator(
			<Icon.XCircleFill size={iconSize} className="text-danger" />,
			"Error"
		);
	}
	return status;
}

function getTableEntry(feed: any, index: number): JSX.Element {
	const id = feed.data.id;
	const creationDate = moment(feed.data.creation_date);
	const modificationDate = moment(feed.data.modification_date);
	const isNew = creationDate.isAfter(moment().subtract(2, "days"));
	const status: JSX.Element = getStatus(feed);

	return (
		<tr key={index}>
			<td>{id}</td>
			<td>{feed.data.name}</td>
			<td>
				{creationDate.fromNow()}
				{isNew && (
					<Badge className="rounded-pill bg-secondary mx-2">
						New
					</Badge>
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

export default Results;
