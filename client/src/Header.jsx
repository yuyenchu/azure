import React from 'react';
import logo from './logo.png';
import user from './user.png';
import NavDropdown from 'react-bootstrap/NavDropdown';

function Header(props) {
  return (
    <>
    <nav className="navbar bg-dark">
        <a className="navbar-brand mb-0 text-white" style={{"marginLeft":"10px"}} href="../home">
            <img className="d-inline-block" width="36" height="36" viewBox="0 0 612 612" src={logo} alt="logo"/> 
            Andrew's Azure
        </a>
        <div className="dropdown" >
            <NavDropdown style={{"color": "white"}} title={
                <img className="d-inline-block text-white" width="36" height="36" viewBox="0 0 612 612" src={user} alt="user"/> 
            } id="navbarDropdown">
                <p className="dropdown-item" id="username">{props.userName}</p>
                <div className="dropdown-divider"></div>
                <a className="dropdown-item" href="/manage">Manage Devices</a>
                <form action="out" method="POST">
                    <a className="dropdown-item " href="/logout" type="submit">Log out</a>
                </form>
            </NavDropdown>
        </div>
    </nav>
    </>
  );
};

export default Header;