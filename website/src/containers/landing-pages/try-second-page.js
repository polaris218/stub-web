import React, { Component } from 'react';
import styles from './landings-pages.module.scss';
import { Grid, Button, Glyphicon, Modal, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import { LandingNavigationV2, Footer2v }  from '../../components/index';

import { Footer3v }  from '../../components/index';
import landingPageDataTrySecondPage from '../../landingv2-data.json';

import landingPageData from '../../landingv2-data.json';
import { DefaultHelmet } from '../../helpers/index';
import history from '../../configureHistory';

export default class TrySecondPage extends Component {
    constructor(props, context) {
        super(props, context);
        this.requestDemo = this.requestDemo.bind(this);
    }

    requestDemo(e){
      e.preventDefault();
      history.push('/book-demo');
    }

    render() {
        return (
          <div className={styles['full-height']}>
            <DefaultHelmet/>
            <div className={styles['page-wrap']}>
              <LandingNavigationV2 data={landingPageData} />
              <div  style={{marginTop:'80px'}}>
                <div className={styles['uberiz']}>
                  <div className={styles['container']}>
                    <h1>UBER-ize Your Service Business</h1>
                    <div  className={styles['media-player']}>
                      <iframe src="//player.vimeo.com/video/199490948?title=0&byline=0&portrait=0&wmode=opaque" height="100%" width="100%"  frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                    </div>
                  </div>
                </div>
                <div className={styles["u-blue-part"]}>
                  <div className={styles['container']}>
                    <ul>
                      <li>Arrivy helps home service businesses provide a more UBER-like experience for customers which <b>drives better reviews and more business.</b> No more guessing when your crew is going to arrive.</li>
                      <li><b>Your customer gets a text/email and can see your crew on a map</b> once the crew says they are on their way.</li>
                      <li>Arrivy does an <b>exceptional job of coordinating crews and customers.</b></li>
                    </ul>
                  </div>
                </div>

                <div className={styles["u-grey-part"]}>
                  <div className={styles['container']}>
                    <Row>
                      <Col xs={12} sm={6} className={styles['box']}>
                        <div><img src="/images/lending/try-pages/30fd15e1-slice6_02501w02301u000000.png" /></div>
                        <h3>Shared calendars keep everyone in synch</h3><p>Schedule work on your calendar in Arrivy and assign it to crew members. Crew members can see their tasks on easy-to-use mobile apps.</p></Col>
                      <Col xs={12} sm={6} className={styles['box']}>
                        <div><img src="/images/lending/try-pages/7435ea98-slice5_023023023023000000.png" /></div>
                        <h3>Track crew and job status</h3><p>See live location of drivers in real-time on a map. No GPS required. Keep connected with your crew/drivers on the go to check on orders, report status and interact with customers.</p></Col>
                    </Row>
                    <Row>
                      <Col xs={12} sm={6} className={styles['box']}>
                        <div><img src="/images/lending/try-pages/ce794f4b-slice3_01t02w01t02w000000.png" /></div>
                        <h3>Get MORE (and better) reviews</h3><p>Arrivy automatically prompts customers for reviews immediately when jobs are completed and those reviews are emailed directly to you. If they give you 4-5 stars, they are prompted to post on Yelp and Facebook.</p></Col>
                      <Col xs={12} sm={6} className={styles['box']}>
                        <div><img src="/images/lending/try-pages/dfe8e66f-slice4_03701o03701o000000.png" /></div>
                        <h3>Customers never have to wonder when you'll get there</h3><p>Once your crew is on their way, your customers can track their progress with real-time estimates and email / SMS notifications.</p></Col>
                    </Row>
                  </div>
                </div>

                <div className={styles["u-phone-part"]}>
                  <div className={styles['container']}>
                    <h2>Try Arrivy for Free</h2>
                    <div className={styles['text-part']}>
                      <div className={styles['white-line']}>
                        <h4>Affordable at pennies a day</h4>
                        <p>Arrivy offers an incredible set of field service management tools that will delight your customers and bring you better reviews, for only $10/month per user. Try it for free, now!</p>
                      </div>
                      <a className={styles['learn-more']} href="/">Learn more</a>
                      <div className={styles['button-center-block']}>
                        <button onClick={this.requestDemo}>Request your demo</button>
                        <p className={styles["small"]}>No credit card needed</p>
                      </div>
                    </div>
                    <div className={styles['h-phone']}>
                      <img src="/images/lending/try-pages/f05222c0-uber-taxi-service-1200x686_07y0al07y0al000000.png" />
                    </div>
                  </div>
                </div>

                <div className={styles["u-reviews"]}>
                  <div className={styles['container']}>
                    <div className={styles['review']}>
                      <img src="/images/lending/try-pages/3bba81b6-sears_02c02c02b02c000000.png"/>
                      <p><b>Arrivy</b> has improved our ability to communicate effectively with our dispatchers,
                        technicians, and customers by <b>leaps and bounds.</b></p>
                      <p>We've seen a BIG increase in <b>positive</b> customer reviews.</p>
                    </div>
                    <div className={styles['after-review']}>
                      <span>-- Sears Garage doors</span>
                    </div>
                    <div className={styles['review']}>
                      <img src="/images/lending/try-pages/019b0598-gds_02d02d02c02d000000.png"/>
                      <p>Our team loves Arrivy, because it makes everyone's job easier.
                        Our time communicating with customers and each other is <b>cut to
                          a fraction</b> of what it used to be since <b>Arrivy completely automates communication.</b>
                        Most importantly, we are providing a <b>better experience for our customers</b>,
                        and this turns into <b>repeat customers for our business.</b></p>
                    </div>
                    <div className={styles['after-review']}>
                      <span>-- GDS Atlanta</span>
                    </div>
                   </div>
                </div>

              </div>
            </div>
            <Footer3v data={landingPageDataTrySecondPage}/>
          </div>
        );
    }
}
