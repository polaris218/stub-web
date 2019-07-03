import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Grid, Row, Col } from 'react-bootstrap';
import { Footer3v, LandingNavigationV2, LandingHeader } from '../../components';
import { DefaultHelmet } from '../../helpers';
import styles from './static.module.scss';
import landingPageData from '../../landingv2-data.json';

export default class Terms extends Component {
  
  constructor(props, context){
    super(props, context);
  }

  render() {
    return (
      <div className={styles['full-height']}>
      <DefaultHelmet />
      <LandingNavigationV2 data={landingPageData}/>
        <div className={styles['page-wrap']}>
          <LandingHeader image={'images/pricing_hero_1.png'} header='PRIVACY POLICY'
                           description=''/>
            <Grid>
              <Row>
                <Col md={12}>
                  <div className={styles.TOSCotentContainer}>
                    <h3>Overview</h3>
                    <p>&nbsp;</p>
                    <p>Arrivy is committed to honoring the privacy of our Users and Visitors. This privacy policy, part of our overall Terms and Conditions, covers personally identifiable information shared through the Arrivy service.</p>
                    <p>&nbsp;</p>
                    <h3>What information does Arrivy receive and how is it used?</h3>
                    <p>&nbsp;</p>
                    <p>If you sign up for the Arrivy service, we require information regarding your company and team including name, contact information, preferences, and certain demographic information. This information allows us to provide personalized services and communicate directly with you or your team. Also, for your team members, if they are logged into Arrivy apps and they have allowed Arrivy to track their geo-location, we collect that information to build up experience for your company and your customers.<br /><br />The other information we receive from you is about your clients when they use our service e.g. tracking a service appointment or sending your client notifications.<br /><br />Also, like most websites, we use small bits of data called "cookies" stored on users' computers to simulate a continuous connection. Cookies allow us to "remember" information about your preferences and let you move within our Service without reintroducing yourself. Most browsers permit you to easily view and control cookies.<br /><br />We may collect other information such as crash reports, usage logs to continuously improve our service.<br /><br />We use collected information to:<br /><br />1. Render Customer Support - This helps us resolve support issues in a timely manner that may affect your or other platform users usage of the service.<br /><br />2. Build New Features - As we monitor and learn from your usage and identify gaps in our service, we build new features to improve the service experience.<br /><br />3. Work with our subprocessors to achieve business activities. We only provide bare minimum information that's required to render a specific function. Examples include sending an SMS via&nbsp; SMS gateway service to send out the customer notifications on your behalf.</p>
                    <p>&nbsp;</p>
                    <h3>Can I choose what information I disclose?</h3>
                    <p>&nbsp;</p>
                    <p>While we need certain information to register you as a unique user and let you access personalized services, other requested information is optional and may be given at your discretion.</p>
                    <p>&nbsp;</p>
                    <h3>Who has access to my information?</h3>
                    <p>&nbsp;</p>
                    <p>We do not share personally identifiable data with other companies unless you specifically permit us to do so.</p>
                    <p>&nbsp;</p>
                    <h3>The Bottom Line</h3>
                    <p>&nbsp;</p>
                    <p>Maintaining the privacy of your information is of paramount importance to us as it helps foster confidence, goodwill, and stronger relationships with you, our customers. If, at any time, you have questions or concerns about our privacy practices, please feel free to contact us using the information below:</p>
                    <div class="innerText">Arrivy, Inc.</div>
                    <div class="innerText">10400 NE 4th St<br />Bellevue, WA 98004<br />USA</div>
                    <div class="innerText">support@arrivy.com</div>
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

Terms.contextTypes = {
  router: PropTypes.object.isRequired
};
