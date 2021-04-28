import logo from './Assets/BCHLogo.png';

function navLink(text: string): JSX.Element {
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
				{navLink('Home')}
				{navLink('Results')}
				{navLink('Login')}
			</ul>
		</div>
	);
}

export default Navigation;
