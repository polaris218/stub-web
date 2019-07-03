var braintree = require('braintree-web');
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Grid } from 'react-bootstrap';
import { routeToLogin } from '../../helpers/route';
import { encode } from 'querystring';
import styles from './braintree.module.scss';
import { UserHeaderV2, ActivityStream, PaymentManager, SlimFooterV2 }  from '../../components';
import {
  getProfileInformation,
  createBraintreeCustomer,
  getActiveSubscriptions,
  getEntities,
  getCompanyProfileInformation
} from '../../actions';

export default class BraintreePage extends Component {
  constructor(props, context) {
    super(props, context);

    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);

    const { location } = this.props;
    this.state = {
      total_amount: 20,
      profile: null,
      companyProfile: null,
      internetIssue: undefined,
      activityStreamStateHandler: null,
      view_activity_stream: false
    }
  }

  componentWillMount() {
    getCompanyProfileInformation().then((res) => {
      let companyProfile = JSON.parse(res);
      this.setState({ companyProfile });
    }).catch((err) => {
      if(err.status === 0) {
        this.setState({
          internetIssue: true,
        });
      }
    });

    getProfileInformation().then((res) => {
      const profile = JSON.parse(res);
      let permissions = null;
      let is_company = false;
      let view_activity_stream = false;
      if (profile) {
        if (profile && profile.permissions) {
          permissions = profile.permissions
        }
        if (permissions && permissions.includes('COMPANY')) {
          is_company = true
        }
        if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
          view_activity_stream = true;
        }
      }
      this.setState({ profile, view_activity_stream });
    }).catch((error) => {
      if (error.status === 401) {
        routeToLogin(this.props.location, this.context.router);
      }
    });
  }

  activityStreamStateChangeHandler(activityStreamStateHandler) {
    this.setState({
      activityStreamStateHandler
    });
  }

  activityStreamLogoutHandler() {
    this.state.activityStreamStateHandler && this.state.activityStreamStateHandler.logout();
  }

  render() {
    return (
      <div className={styles['full-height'] + ' activity-stream-right-space'}>
        <div className={styles['page-wrap']}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile}/>
          <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
          <Grid className={styles['payment-manager']}>
            <PaymentManager
              getEntities={getEntities}
              total_amount={this.state.total_amount}
              profile={this.state.companyProfile}
            />
          </Grid>
        </div>
        <div className={styles.footer}>
          <SlimFooterV2 />
        </div>
      </div>
    );
  }
}

BraintreePage.contextTypes = {
  router: PropTypes.object.isRequired
};
