import React from 'react';
import "./Footer.css";

// import footerpic from './Assets/loginbg_2000.png';

const Footer = () => {
    return (
        <div className="main-footer">
            {/* <img src={footerpic} /> */}
            <div className="footer-links">
                <div className="footer-link">
                    <a href="https://chrisproject.org">About ChRIS</a>
                </div>
            </div>
        </div>
    )
}

export default Footer;