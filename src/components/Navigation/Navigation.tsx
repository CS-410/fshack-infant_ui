import logo from "../Assets/BCHLogo.png";
import links from "./Links";

function Navigation(): JSX.Element {
  // Add a link to the Results page?
  return (
    <div>
      <a href="#">
        <img className="navBar-Logo" src={logo} alt="Logo" />
      </a>
      <ul className="navBar-Links">{links("Home", "#")}</ul>
    </div>
  );
}

export default Navigation;
