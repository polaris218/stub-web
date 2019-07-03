import styles from './user-header.module.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Nav, Navbar, NavItem, Button } from 'react-bootstrap';
import { logout } from '../../actions';
import { LevelSidebar } from '../index';
import { ActivityStream } from '../index';
import { Link } from 'react-router-dom';
import history from '../../configureHistory';
import { Cookies } from 'react-cookie';

class UserHeader extends Component {
  state = {}

  constructor(props, context) {
    super(props, context);

    this.cookies = new Cookies();

    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout(e) {
    e.preventDefault();
    e.stopPropagation();

    this.state.activityStreamStateHandler.logout()
    .then(() =>
      logout().then(() => {
        this.cookies.remove('auth');
        history.push('/login');
      }).catch(err => {
        console.log(err);
      })
    );
  }

  logoClicked(e) {
    history.push('/');
  }

  dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  displayTrialStrip(profile){
    if (!profile || (profile.owned_company_id != null) || (!profile.trial_expiration_date) || profile.plan_id === 2) {
      return null;
    }
    const billing_type = profile.billing_info.billing_type;
    let trial_expiration_date = profile.trial_expiration_date;
    trial_expiration_date = new Date(trial_expiration_date);
    var today = new Date();
    const isTrial = today < trial_expiration_date;

    if(billing_type === 'NotFound') {
        if (isTrial) {
          const trialDaysLeft = this.dateDiffInDays(today, trial_expiration_date);
          return <NavItem className={styles['navbar-subscribe-link']}>{trialDaysLeft} Days left in trial <Link to="/settings/plan_details"><Button>Subscribe</Button></Link></NavItem>;
        } else {
          return <NavItem className={styles['navbar-subscribe-expired-link']}>Trial Expired <Link to="/settings/plan_details"><Button>Subscribe</Button></Link></NavItem>;
        }
    }

    return null;
  }

  render() {
    let showAPI = false;
    if (this.props.profile && this.props.profile.plan_id === 2) {
      showAPI = true;
    }
    const trialStrip = this.displayTrialStrip(this.props.profile);
    let permissions = null;
    let is_company = false;
    let view_activity_stream = false;
    if (this.props.profile && this.props.profile.permissions) permissions = this.props.profile.permissions;
    if (permissions && permissions.includes('COMPANY')) is_company = true;
    if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
      view_activity_stream = true;
    }
    return (
      <div>
        {!this.props.hideOptions &&
          <ActivityStream showActivities={view_activity_stream} onStateChange={activityStreamStateHandler => this.setState({activityStreamStateHandler})}/>
        }
        <Navbar className={styles['navbar-custom']} fixedTop={true} fluid>
          <Navbar.Header>
            <img src="/images/logo-dark.png" className={styles['navbar-brand-logo']}  onClick={this.logoClicked}/>
            {!this.props.hideOptions && <Navbar.Toggle />}
          </Navbar.Header>
          {!this.props.hideOptions && <Navbar.Collapse>
            <Nav pullRight>
              { trialStrip }
              {showAPI && <NavItem className={styles['navbar-link']} target="_blank" href="/developer_portal">Developer</NavItem>}
              <NavItem className={styles['navbar-link']} target="_blank" href="https://help.arrivy.com/">Help</NavItem>
              <NavItem className={styles['navbar-link']} href="https://blog.arrivy.com">Blog</NavItem>
              <NavItem className={styles['navbar-link']} onClick={this.handleLogout} href="#">Logout</NavItem>
            </Nav>
          </Navbar.Collapse>}
        </Navbar>
        {!this.props.hideOptions && <LevelSidebar router={this.props.router} activityStreamStateHandler={this.state.activityStreamStateHandler} permissions={permissions} showApi={showAPI}/>}
      </div>
    );
  }
}


UserHeader.propTypes = {
  router: PropTypes.object.isRequired,
  hideOptions: PropTypes.bool
};

export default UserHeader;
