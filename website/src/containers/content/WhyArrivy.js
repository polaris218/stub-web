import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './static.module.scss';

import { Image, Grid } from 'react-bootstrap';

import {
  LandingNavigation,
  Footer3v,
  LandingHeader,
  LandingNavigationV2
} from '../../components';

import { getServerOrigin } from '../../helpers/url';

import landingPageData from '../../landingv2-data.json';
import { DefaultHelmet } from '../../helpers';


export default class WhyArrivy extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigationV2 data={landingPageData} />
          <LandingHeader image={'images/pricing_hero_1.png'} header='Arrivy is a modern way of running your business'
                       description=''/>
          <div className={styles.features} style={{backgroundColor: '#FFFFFF'}}>
            <Grid>
              <h2>Why Arrivy</h2>
                <p>
                Do you spend <strong>too much time</strong> coordinating customers and services/deliveries?
                </p>
                <p>
                Did you ever wish that you knew <strong>exactly where your people were</strong> and what their status was? 
                </p>
                <p>
                Could you <strong>be more effective</strong> with a tool that automatically let customers know exactly when their deliveries or services would arrive?
                </p>
                <p>
                Would it help to have a searchable <strong>log of all communications</strong> with your staff and customers for every job?
                </p>
                <p>
                Could you get more leads and jobs if customers were <strong>automatically texted or emailed</strong> with Yelp and Facebook links when a job was complete?
                </p>
                <blockquote style={{fontSize:'20px'}}>
                  If answer is “yes” to any of these questions, then you need Arrivy.
                </blockquote>
                <p>
                Before Arrivy, most of our users said they spent at least 30% of their time coordinating customers and delivery or service personnel—phoning customers letting them know when team members would arrive. And, tracking personnel to figure out their status and making adjustments to schedules, people, customers then communicating that to everyone involved. All that manual work keeps you from focusing on successfully growing your business.
                </p>
                <p>Arrivy automates and tracks deliveries and service calls.</p>
                <p>
                  <ul className={styles.ulstylingnobullets}>
                  <li>
                    <strong>Integrates into your workflow:</strong> Schedule work on your calendar in Arrivy and assign it to crew members. Crew members can see their tasks on easy-to-use mobile apps. Arrivy works with popular calendars like Google Calendar.
                  </li>
                  <li>
                    <strong>You always know the location and status of your people:</strong> See live location of drivers in real-time on a map. Keep connected with your crew/drivers on the go to check on orders, report status and interact with customers via iOS and Android mobile apps.
                  </li>
                  <li>
                    <strong>Automatic customer status communications:</strong> Your customers are alerted via text or email with real-time estimates and notifications.
                  </li>
                  <li>
                    <strong>Data to help you run your business effectively:</strong> Arrivy keeps a log of all correspondence and status messages for your records.
                  </li>
                  <li>
                    <strong>Get more work:</strong> On job completion, Arrivy sends the customer links to easily rate you on Facebook, Yelp, Google.
                  </li>
                  </ul>
                </p>
           </Grid>
          </div>
        </div>
        <Footer3v data={landingPageData} />
      </div>
    );
  }
}

WhyArrivy.contextTypes = {
  router: PropTypes.object.isRequired
};
