import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LandingNavigationV2 } from '../../components';
import landingPageData from '../../landingv2-data.json';
import styles from './error-page.module.scss';
import config from '../../config/config';
const env = config(self).env;
export default class ErrorPage extends Component {

  constructor(props, context) {
    super(props, context);

    this.navigateToSignup = this.navigateToSignup.bind(this);
  }

  componentDidMount() {
    if(env !== 'Dev') {
      window.Intercom("boot", {
        app_id: "vfdmrett"
      });
    }
  }

  navigateToSignup() {
    this.context.router.history.push('/signup');
  }

  render() {
    return (
      <div>
        <div className={styles.pageContainer}>
          <div className={styles.navbarPlaceholder}>

          </div>
          <h1>
            Error 404
          </h1>
          <p>
            The page you are looking for does not exist.
          </p>
          <p className="text-center">
            <a href="/dashboard">Go to dashboard</a>
          </p>
        </div>
        <LandingNavigationV2 data={landingPageData} />
      </div>
    );
  }

}
