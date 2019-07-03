import React, { Component } from 'react';
import { LandingNavigation } from '../../components';
import landingPageData from '../../landingv2-data.json';
import styles from './api.module.scss';
import history from '../../configureHistory';

export default class API extends Component {

  constructor(props, context) {
    super(props, context);

    this.navigateToSignup = this.navigateToSignup.bind(this);
  }

  componentDidMount() {
    window.Intercom("boot", {
      app_id: "vfdmrett"
    });
  }

  navigateToSignup() {
    history.push('/signup');
  }

  render() {
    return (
      <div>
        <div className={styles.pageContainer}>
          <p>
            Arrivy API platform has an invite-only program for Enterprises. If you would like to learn more please reach out to us at info@arrivy.com
          </p>
          <p className="text-center">
            <a href="mailto:info@arrivy.com?subject=Interested%20in%20learning%20about%20Arrivy%20API">Connect with Arrivy</a>
          </p>
        </div>
        <LandingNavigation data={landingPageData} />
      </div>
    );
  }

}
