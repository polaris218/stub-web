import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Table, Grid } from 'react-bootstrap';
import { routeToLogin } from '../../helpers/route';

import landingPageDataBranTreeAdminSubscript from '../../landingv2-data.json';
import { Footer3v }  from '../../components/index';

import { getProfileInformation, getActiveSubscriptions,
         adminRemoveSubscription, adminChangeSubscription } from '../../actions';

import styles from './braintree-admin-subscriptionlist.module.scss';

import { FooterComponent, FooterConfiguration, UserHeader }  from '../../components';

export default class BraintreeAdminSubscriptionList extends Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            subscriptions: null
        };

        this.removeSubscription = this.removeSubscription.bind(this);
        this.disableSubscription = this.disableSubscription.bind(this);
        this.enableSubscription = this.enableSubscription.bind(this);
    }

    disableSubscription(subscription) {
        subscription.disabled = true;
        adminChangeSubscription(subscription).then((res) => {
            this.updateSubscriptions();
        })
    }

    enableSubscription(subscription) {
        subscription.disabled = false;
        adminChangeSubscription(subscription).then((res) => {
            this.updateSubscriptions();
        })
    }

    removeSubscription(subscription) {
        adminRemoveSubscription(subscription).then((res) => {
            this.updateSubscriptions();
        })
    }

    updateSubscriptions() {
        getActiveSubscriptions().
            then((subscriptions) => {
              this.setState({
                subscriptions: JSON.parse(subscriptions).list
              });
            });
    }

    componentWillMount() {
        getProfileInformation().then((res) => {
          const profile = JSON.parse(res);
          this.setState({ profile });
          this.updateSubscriptions();
        }).catch((error) => {
          console.log(error);
          if (error.status === 401) {
            routeToLogin(this.props.location, this.context.router);
          }
        });
    }

    renderSubscription(subscription) {
        const removeSubscription = () => { this.removeSubscription(subscription) };
        const disableSubscription = () => { this.disableSubscription(subscription) };
        const enableSubscription = () => { this.enableSubscription(subscription) };

        return (
            <tr key={subscription.subscription_id}>
                <td>{subscription.owner}</td>
                <td>{subscription.subscription_date}</td>
                <td>{subscription.disabled ? "Disabled" : ""}</td>
                <td>
                    <a href="#" onClick={removeSubscription}>Remove</a>&nbsp;
                    <a href="#" onClick={disableSubscription} disabled={subscription.disabled? "disabled": ""}>Disable</a>&nbsp;
                    <a href="#" onClick={enableSubscription} disabled={!subscription.disabled? "none": ""}>Enable</a>
                </td>
            </tr>
        );
    }

    render() {
        if (this.state.subscriptions) {
            this.state.subscriptionList = (this.state.subscriptions.map((subscription) => {
              return this.renderSubscription(subscription);
            }));
        }

        return (
          <div className={styles['full-height'] + ' activity-stream-right-space'}>
            <div className={styles['page-wrap']}>
              <UserHeader router={this.context.router} profile={this.state.profile}/>
              <Grid>
              <h3>
                <span>Subscriptions</span>&nbsp;
                <Link to="/transactions">Transactions</Link>
              </h3>

              <Table>
                  <thead>
                      <tr>
                          <th>User</th>
                          <th>Subscription Date</th>
                          <th>Disabled</th>
                          <th>Action</th>
                      </tr>
                  </thead>
                  <tbody>
                  {this.state.subscriptionList}
                  </tbody>
              </Table>
              </Grid>
            </div>
              <Footer3v links={FooterConfiguration} data={landingPageDataBranTreeAdminSubscript}/>
          </div>
        )
    }
}

BraintreeAdminSubscriptionList.contextTypes = {
  router: PropTypes.object.isRequired
};
