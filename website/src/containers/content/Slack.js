import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './static.module.scss';

import { Image, Grid } from 'react-bootstrap';

import {
  LandingNavigationV2,
  Footer3v,
} from '../../components';

import { getServerOrigin } from '../../helpers/url';

import landingPageData from '../../landingv2-data.json';
import { DefaultHelmet } from '../../helpers';


export default class Slack extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigationV2 data={landingPageData} />
          <div>
            <div className={styles.topSectionImage} >
              <Image className={styles.topImage} src="/images/slack_hero_1.png" responsive />
              <h2>Introducing Arrivy for Slack</h2>
            </div>
          </div>
          <div className={styles.features}>
            <Grid>
              <p>
                Get live progress of tasks & orders on your team's slack channel and keep connected with your business in real-time. Arrivy sends notifications via slack in following cases:
                <ul className={styles.ulstyling}>
                <li>
                Every time your team members reports completion, exception or any status on a task
                </li>
                <li>
                Crew's arrival at your customer location
                </li>
                <li>
                Order creation and deletion
                </li>
                </ul>
              </p>
            </Grid>
            <div style={{paddingTop: '5px', paddingBottom:'5px'}}>
              <Image className={styles.helpImage} src="/images/help/slack-arrivy.gif" responsive/>
            </div>
          </div>
          <Grid className={styles.features} style={{backgroundColor: '#FFFFFF'}}>
            <div>
              <ul className={styles.ulstyling}>
              <li>
                <h3>Step 1</h3>
                Login to your Arrivy account. Sign up for one if you don't have it yet.
              </li>
              <li>
                <h3>Step 2</h3>
                Go to Settings Page and click 'Add to Slack button' in Integrations Section
              </li>
              <li>
                <h3>Step 3</h3>
                Select the channel where you would like notifications to be posted in Slack
              </li>
              </ul>
            </div>
          </Grid>
        </div>
        <Footer3v data={landingPageData} />
      </div>
    );
  }
}

Slack.contextTypes = {
  router: PropTypes.object.isRequired
};
