import styles from './header.module.scss';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Nav, Navbar, NavItem, MenuItem, NavDropdown } from 'react-bootstrap';
import { logout } from '../../actions';
import history from '../../configureHistory';


class Header extends Component {
  constructor(props, context){
    super(props, context);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout(e) {
    e.preventDefault();
    e.stopPropagation();

    logout().then( () => {
      history.push('/login');
    }).catch( err => {
      console.log(err);
    });
  }

  navigateToPage(value, e) {
    history.push(value);
  }

  logoClicked(e) {
    history.push('/');
  }

  render() {


    const title = <img style={{ width: '24px' }} src="/images/user.png"/>;
    return (
      <Navbar className={styles['navbar-custom']} fluid>
        <Navbar.Header>
          <Navbar.Brand className={styles['navbar-brand-custom']}>
            <img src="/images/logo-dark.png" style={{cursor:'pointer'}}  onClick={this.logoClicked}/>
          </Navbar.Brand>
        </Navbar.Header>
        <Nav pullRight>
          { !this.props.hideMenu ? 
          <NavDropdown eventKey={3} title={title} id="basic-nav-dropdown">
            <MenuItem eventKey={3.3} onClick={this.navigateToPage.bind(this, 'dashboard')}>Dashboard</MenuItem>
            <MenuItem eventKey={3.2} onClick={this.navigateToPage.bind(this, 'settings')}>Settings</MenuItem>
            <MenuItem divider />
            <MenuItem eventKey={3.4} onClick={this.handleLogout}>Logout</MenuItem>
          </NavDropdown> : null }
        </Nav> 
      </Navbar>
    );
  }
}


Header.PropTypes = {
  router: PropTypes.object.isRequired,
  hideMenu: PropTypes.bool,
};

export default Header;
