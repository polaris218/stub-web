import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Grid, Row, Col } from 'react-bootstrap';
import { Footer3v, LandingNavigationV2, LandingHeader } from '../../components';
import { DefaultHelmet } from '../../helpers';
import styles from './static.module.scss';
import landingPageData from '../../landingv2-data.json';

export default class AntiSpam extends Component {
  
  constructor(props, context){
    super(props, context);
  }

  render() {
    return (
      <div className={styles['full-height']}>
      <DefaultHelmet />
      <LandingNavigationV2 data={landingPageData}/>
        <div className={styles['page-wrap']}>
          <LandingHeader image={'images/pricing_hero_1.png'} header='ANTI-SPAM POLICY'
                           description=''/>
            <Grid>
              <Row>
                <Col md={12}>
                  <div className={styles.TOSCotentContainer}>
                    <h3>Overview</h3>
                    <p>Arrivy follows a zero-tolerance spam policy and prohibits its users from using Arrivy email and SMS notification components from commercial unsolicited emails. The notifications components are meant for transactional use on Arrivy to run deliveries and service calls efficiently.</p>
                    <div class="mlg-u-sm-1-1">
                    <h3>Policy Enforcement</h3>
                    <h4>&nbsp;</h4>
                    <h4>1. Accurate Business Address</h4>
                    </div>
                    <p>&nbsp;</p>
                    <p>The Customer must provide their true and accurate business address that will be included in each message footer. The Customer is required to maintain and promptly update this data to ensure it is current, complete and accurate. We manually verify this data to ensure it matches with Google results on searching your business. Arrivy actively monitors all outgoing messages to verify that the proper sender's information is included in the message content.</p>
                    <h4>&nbsp;</h4>
                    <h4>2. Unscubscribe / Opt-out</h4>
                    <p>&nbsp;</p>
                    <p>Every email, whether text or HTML, contains a mandatory unsubscribe/opt-out link at the bottom of the message, which automatically stops your customer from getting any more information about the specific service using available communication channels.</p>
                    <h4>&nbsp;</h4>
                    <h4>3. Appointment Reviews</h4>
                    <p>&nbsp;</p>
                    <p>Arrivy provides the functionality to get feedback (review) from the Customer's client who has just received the service. A unique link for each job (including the review experience) is created and it's shared with the client. Once the client leaves the reviews, it's relayed back to the business. We ensure that only clients have access to these link and no-one else can alter the review in the middle.</p>
                    <h4>&nbsp;</h4>
                    <h4>4. Subscriber handling</h4>
                    <p>&nbsp;</p>
                    <p>We maintain the IP address and date subscribed for every new user.</p>
                    <h4>&nbsp;</h4>
                    <h4>5. Monitoring</h4>
                    <p>&nbsp;</p>
                    <p>All notifications activity is being monitored by our experienced team (and our automation) and if we discover that you have a high unsubscribe rate compared to other customers, we will investigate your account. In case you are sending out spam notifications to people without their permissions, we will terminate your account immediately without any notice.</p>
                    <h4>&nbsp;</h4>
                    <h4>What happens, if you SPAM?</h4>
                    <p>&nbsp;</p>
                    <p>If we find out that you're spamming using your Arrivy account or intervening in any way the regular flow to get reviews from your clients then you can expect all or some of the following to occur.</p>
                    <ul>
                    <li>We will shut down your account immediately.</li>
                    <li>We will not refund your account.</li>
                    <li>We might ask you to compensate us if your spamming activity causes any interruptions in our ability to service our other customers.</li>
                    </ul>
                    <div class="innerText">&nbsp;</div>
                    <div class="innerText"><br />Last Edited on 2019-02-02</div>
                  </div>
                  <br/><span id='ourCon'></span><br/>
                </Col>
              </Row>
            </Grid>
          </div>
          <Footer3v data={landingPageData} />
        </div>);
  }
}

AntiSpam.contextTypes = {
  router: PropTypes.object.isRequired
};
