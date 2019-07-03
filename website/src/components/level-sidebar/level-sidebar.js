import styles from './level-sidebar.module.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { NavLink } from 'react-router-dom';
import { ActivityStreamButton } from '../index';

class LevelSidebar extends Component {

  render() {
    const dashboard = {
      href: '/dashboard',
      title: 'Dashboard'
    };
    const task = {
      href: '/tasks',
      title: 'Tasks'
    };
    const team = {
      href: '/crew',
      title: 'Team'
    };
    const equipment = {
      href: '/equipment',
      title: 'Equipment'
    };
    const customers = {
      href: '/customers',
      title: 'Customers'
    };
    const reviews = {
      href: '/reviews',
      title: 'Reviews'
    };
    const  settings = {
      href: '/settings',
      title: 'Settings'
    };
    const  api = {
      href: '/api_info',
      title: 'API'
    };
    const  reporting = {
      href: '/reporting',
      title: 'Reporting'
    };
    const links = [];
    links.push(dashboard);
    links.push(task);
    let view_activity_stream = true;
    if (this.props.permissions) {
      let is_company = false;
      if (this.props.permissions && this.props.permissions.includes('COMPANY')) is_company = true;
      if (is_company || this.props.permissions.includes('VIEW_FULL_TEAM_MEMBER_DETAILS')) links.push(team);
      if (is_company || this.props.permissions.includes('VIEW_FULL_EQUIPMENT_DETAILS')) links.push(equipment);
      if (is_company || this.props.permissions.includes('VIEW_CUSTOMER')) links.push(customers);
      if (is_company || this.props.permissions.includes('VIEW_REPORTING')) links.push(reporting);
      links.push(reviews);
      if (is_company || this.props.permissions.includes('VIEW_SETTING')) links.push(settings);
      if ((is_company || this.props.permissions.includes('ACCESS_API')) &&
      this.props.showApi) links.push(api);
      if (!is_company && !this.props.permissions.includes('SHOW_OWN_ACTIVITY_STREAM') && !this.props.permissions.includes('SHOW_ALL_ACTIVITY_STREAM')) {
        view_activity_stream = false;
      }
    } else {
      links.push(team);
      links.push(equipment);
      links.push(customers);
      links.push(reporting);
      links.push(reviews);
      links.push(settings);
      links.push(api);
    }
    return (
      <div className={styles['level-sidebar']}>
        <ul className={' list-inline container'}>
          {links.map((link, idx) => {
            return (
              <li key={idx} id={'sidebar-' + link.title}>
                <NavLink activeClassName={styles.active} to={link.href}> {link.title} </NavLink>
              </li>
            );
          })}
          {view_activity_stream &&
          <li className={styles['level-sidebar-right']}>
            <ActivityStreamButton activityStreamStateHandler={this.props.activityStreamStateHandler}/>
          </li>
          }
        </ul>
      </div>
    );
  }
}

LevelSidebar.propTypes = {
  router: PropTypes.object.isRequired,
  activityStreamStateHandler: PropTypes.object,
  permissions: PropTypes.array,
  showApi: PropTypes.bool
};

export default LevelSidebar;
