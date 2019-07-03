import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

import { Grid, Carousel } from 'react-bootstrap';
import styles from './landing-additional-features.module.scss';

class LandingAdditionalFeatures extends Component {
  render() {
    return (
        <section className={styles.features2} id="features-2">
          <div className={styles.integrationImageContainer}>
            {/* <Image src="/images/integrations.png" responsive /> */}
            <div className={styles.integrationText}>
              <div className={styles['features2-link']}>
                <Link to="/slack"><img src="images/slack-logo.png"/></Link>
                <Link to="/slack"> Integration</Link> and custom webhooks enable you to run your business the way you like.</div>
              {/*<div className={styles['features2-link']}>Learn more about <Link to="/slack">Slack Integration.</Link></div>*/}
            </div>
          </div>
        </section>
    );
  }
}

LandingAdditionalFeatures.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingAdditionalFeatures;
