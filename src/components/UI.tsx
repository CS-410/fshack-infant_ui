import { getFeedStatus } from "../api/ClientSingleton";
import { Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import * as Icon from "react-bootstrap-icons";

export function overlayTooltip(element: any, text: string): JSX.Element {
	return (
		<OverlayTrigger
			placement="bottom"
			overlay={<Tooltip id="">{text}</Tooltip>}
		>
			{element}
		</OverlayTrigger>
	);
}

export function feedStatusIndicator(feed: any, size: number): JSX.Element {
	let indicator: JSX.Element;
	if (feed) {
		const status: number = getFeedStatus(feed);
		switch (status) {
			case 0:
				indicator = overlayTooltip(
					<Icon.CheckCircleFill
						className="text-success"
						size={size}
					/>,
					"Finished"
				);
				break;
			case 1:
				indicator = overlayTooltip(
					size >= 39 ? (
						<Spinner animation="border" />
					) : (
						<Spinner animation="border" size="sm" />
					),
					"In progress"
				);
				break;
			case 2:
				indicator = overlayTooltip(
					<Icon.ExclamationCircleFill
						className="text-warning"
						size={size}
					/>,
					"Cancelled"
				);
				break;
			case 3:
				indicator = overlayTooltip(
					<Icon.XCircleFill className="text-danger" size={size} />,
					"Error"
				);
				break;
		}
	}
	return indicator;
}
