import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './static.module.scss';

import { Image, Grid, Col, Row } from 'react-bootstrap';

import landingPageDataMoreReviews from '../../landingv2-data.json';
import { Footer3v }  from '../../components/index';

import {
  LandingNavigation,
  FooterComponent,
  FooterConfiguration,
  LandingHeader
} from '../../components';

import { getServerOrigin } from '../../helpers/url';

import landingPageData from '../../landing-page.json';
import { DefaultHelmet } from '../../helpers';


export default class MoreReviews extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigation data={landingPageData} />
          <LandingHeader image={'images/pricing_hero_1.png'} header='More reviews, more business…'
                       description=''/>
          <div className={styles.features} style={{backgroundColor: '#FFFFFF'}}>
            <Grid>
              <div>
                <h2></h2>
                <i>Arrivy users are getting more and better reviews from their customers. Why?</i>
              </div>
              <div className={styles.flexContainer}>
                <div className={styles.flexText} style={{padding: '0px'}}>
                  <h3 style={{marginTop: '50px'}}>Arrivy makes appointments predictable</h3>
                  <p>
                    When your crew drives to an appointment, they click Arrivy’s “on our way” button, sending an email or SMS to let the customer know they’re enroute. Customers can click on the included link to see the crew’s progress. Arrivy automatically alerts the customer when the crew is about a mile from their location.
                   <strong> It’s like Uber for service appointments. Customers love it.</strong>
                  </p>

                  <h3 style={{marginTop: '50px'}}>Arrivy makes appointments personal</h3>
                  <p>
                    Communications from Arrivy include pictures of the service crew, helping the customer understand, personally, who is doing the work.
                  </p>
                </div>
                <div className={styles.flexImage} style={{padding: '0px', textAlign: 'center'}}>
                  <img className={styles.ImageStyle} src='images/customer_view.jpg' />
                </div>
              </div>
              <div className={styles.flexContainer}>
                <div className={styles.flexImage}  style={{padding: '0px', textAlign: 'center'}}>
                  <img className={styles.ImageStyle} src='images/customer_view_2.jpg' />
                </div>
                <div className={styles.flexText} style={{padding: '0px'}}>
                  <h3 style={{marginTop: '50px'}}>Arrrivy prompts for reviews right away</h3>
                  <p>
                    Out-of-sight, out-of-mind. If you don’t get a review the day your service is provided, you probably won’t get one. When your crew marks a job as complete, the customer is automatically prompted to review your service. If they give you 4 stars or more, they are also prompted to post it to social media sites like Yelp. 
                  </p>
                </div>
              </div>
           </Grid>
          </div>
        </div>
          <Footer3v links={FooterConfiguration} data={landingPageDataMoreReviews}/>
      </div>
    );
  }
}

MoreReviews.contextTypes = {
  router: PropTypes.object.isRequired
};
