import logo from './Assets/BCHLogo.png';

function links(text: string): JSX.Element {
	return (
		<li>
			<a href={'#' + text.toLowerCase()}>{text}</a>
		</li>
	);
}

function Navigation(): JSX.Element {
	return (
		<div>
			<a href="#">
				<img className="navBar-Logo" src={logo} alt="Logo" />
			</a>
			<ul className="navBar-Links">
				{links('Home')}
				{links('Results')}
			</ul>
		</div>
	);
}

export default Navigation;
