import { useState, useEffect } from "react";
import moment from "moment";
import ClientSingleton from "../api/ClientSingleton";
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

function Results(): JSX.Element {
	const [feeds, setFeeds] = useState<Feed[]>([]);

	useEffect(() => {
		getFeeds(setFeeds);
	}, []);

	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 5;
	const totalPosts = feeds.length;

	const pagination = getPagination(
		currentPage,
		postsPerPage,
		totalPosts,
		setCurrentPage
	);
	const posts = getPosts(currentPage, postsPerPage, feeds);

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
				<tbody>{posts}</tbody>
			</Table>
			{pagination}
		</Container>
	);
}

async function getFeeds(
	feedsSetter: (value: React.SetStateAction<Feed[]>) => void
): Promise<void> {
	let feeds: Feed[] = [];

	const client = await ClientSingleton.getInstance();
	const infantfsInstances = await client.getPluginInstances({
		plugin_name: "pl-fshack-infant",
	});

	for (let instance of infantfsInstances.getItems()) {
		const feed = await instance.getFeed();
		feeds.push(feed);
	}

	feedsSetter(feeds);
}

function getPagination(
	currentPage: number,
	postsPerPage: number,
	totalPosts: number,
	currentPageSetter: (value: React.SetStateAction<number>) => void
): JSX.Element {
	const paginate = (pageNum: number) => currentPageSetter(pageNum);
	const nextPage = () => currentPageSetter(currentPage + 1);
	const prevPage = () => currentPageSetter(currentPage - 1);

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

function getPosts(
	currentPage: number,
	postsPerPage: number,
	feeds: Feed[]
): JSX.Element[] {
	const indexOfLastPost = currentPage * postsPerPage;
	const indexOfFirstPost = indexOfLastPost - postsPerPage;
	const currentPosts = feeds.slice(indexOfFirstPost, indexOfLastPost);
	const posts = currentPosts.map(getTableEntry);
	return posts;
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

function getStatus(feed: Feed): JSX.Element {
	const {
		started_jobs,
		waiting_jobs,
		errored_jobs,
		cancelled_jobs,
	} = feed.data;

	let status: JSX.Element;
	const hasStartedJobs = started_jobs !== 0;
	const hasWaitingJobs = waiting_jobs !== 0;
	const hasErroredJobs = errored_jobs !== 0;
	const hasCancelledJobs = cancelled_jobs !== 0;

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

function getTableEntry(feed: Feed, index: number): JSX.Element {
	const { id, name, creation_date, modification_date } = feed.data;

	const creationDate = moment(creation_date);
	const modificationDate = moment(modification_date);
	const isNew = creationDate.isAfter(moment().subtract(2, "days"));
	const status: JSX.Element = getStatus(feed);

	return (
		<tr key={index}>
			<td>{id}</td>
			<td>{name}</td>
			<td>
				{creationDate.fromNow()}
				{isNew && (
					<Badge className="rounded-pill bg-secondary mx-2 text-white">
						New
					</Badge>
				)}
			</td>
			<td>{modificationDate.fromNow()}</td>
			<td>{status}</td>
			<td>
				<LinkContainer to={"/results/" + id}>
					<Button variant="outline-primary">View</Button>
				</LinkContainer>
			</td>
		</tr>
	);
}

export default Results;
