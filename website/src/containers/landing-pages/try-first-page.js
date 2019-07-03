import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './landings-pages.module.scss';

import { Footer3v }  from '../../components/index';
import landingPageDataTryFirstPage from '../../landingv2-data.json';

import { LandingNavigationV2, Footer2v }  from '../../components/index';
import { Grid, Button, Glyphicon, Modal, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import landingPageData from '../../landingv2-data.json';
import { DefaultHelmet } from '../../helpers/index';
import history from '../../configureHistory';

export default class TryFirstPage extends Component {
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
              <div style={{marginTop:'80px'}}>
                <div className={styles['garage']}>
                  <div className={styles['container']}>
                    <div className={styles['image-container']}>
                      <img src="/images/lending/try-pages/92304b64-hero-homeservices_0fw09c0fw09c000000.png" />
                    </div>
                  </div>
                </div>
                <div className={styles["blue-part"]}>
                  <div className={styles['container']}>
                    <h1>Arrivy provides Field Service Management for modern Home Service Companies</h1>
                    <div className={styles['text-part']}>
                      <div><img src="/images/lending/try-pages/663c0dc5-quote-1-02_01a01401a014000000.png" /></div>
                      <p><b>Arrivy</b> has improved our ability to communicate effectively with our dispatchers, technicians, and customers by <b className={styles['underline']}>leaps and bounds</b></p>
                      <div className={styles['image-centered']}><img src="/images/lending/try-pages/a1c9e896-company-logo_039010039010000000.png" /></div>
                    </div>
                    <div className={styles["button-center-block"]}>
                      <button onClick={this.requestDemo}>Request your demo</button>
                    </div>
                  </div>
                </div>

                <div className={styles["grey-part"]}>
                  <div className={styles['container']}>
                    <h2>Arrivy powers top service companies to provide</h2>
                    <Row>
                      <Col xs={12} sm={6} className={styles['box']}>
                        <div className={styles['img-cont']}><img src="/images/lending/try-pages/1d9f30a6-icon-communicator.png" /></div>
                        <h3>Automated Customer Communications</h3><p>think uber</p></Col>
                      <Col xs={12} sm={6} className={styles['box']}>
                        <div className={styles['img-cont']}><img src="/images/lending/try-pages/9f6d8b39-icon-realtime.png" /></div>
                          <h3>Real-time Arrival Estimates</h3><p>crew location tracking</p></Col>
                    </Row>
                    <Row>
                      <Col xs={12} sm={6} className={styles['box']}>
                        <div className={styles['img-cont']}><img src="/images/lending/try-pages/c0f3fcbe-icon-graph.png" /></div>
                          <h3>Uptick in Referral and Reviews</h3><p>yelp, fb & direct</p></Col>
                      <Col xs={12} sm={6} className={styles['box']}>
                        <div className={styles['img-cont']}><img src="/images/lending/try-pages/19d4812b-icon-schedule.png" /></div>
                          <h3>Shared Team Scheduling</h3><p>crew mobile apps</p></Col>
                    </Row>
                  </div>
                </div>

                <div className={styles["green-part"]}>
                  <div className={styles['container']}>
                    <h2>Find out how arrivy can<br /> help your business</h2>
                    <button onClick={this.requestDemo}>Request your demo</button>
                    <img src="/images/lending/try-pages/840e73b9-shs-mel-4.png" />
                  </div>
                </div>

                <div className={styles["testimonial-part"]}>
                  <div className={styles['container']}>
                    <h2>Detailed Testimonial</h2>
                    <div className={styles['box-rounded']}>
                      <p>Arrivy has been an immeasurable asset to our team and company.
                        The program has improved our ability to communicate effectively with our dispatchers,
                        technicians, and customers by leaps and bounds.
                        It provides a sense of security and accountability to our clients with the assurance of knowing
                        when the technician is on his way, due to the options of email and text alerts that it provides.
                        It's been invaluable when it comes to keeping the office staff in the know of
                        where our technicians are on their routes for the day, enabling us to be able to gauge where
                        they are without potentially interrupting any job they may be at or heading to.
                      </p>
                      <p>The interface has continually been refined and polished as the app itself has been updated,
                        and indeed provides a means of efficiently collecting and displaying all routing information
                        in a clear manner for the dispatch staff and technicians both.
                        The team members at Arrivy are incredibly responsive; they have been taking our feedback
                        and responding with prompt and adequate support if any issues arise.
                        Overall, Arrivy has been monumental in the way it's made us a more productive and communicative team.
                      </p>
                    </div>
                  </div>
                </div>

                <div className={styles["monumental-part"]}>
                  <div className={styles['container']}>
                    <div className={styles['text-part']}>
                      <div><div className={styles['img-cont']}><img src="/images/lending/try-pages/663c0dc5-quote-1-02_01w01n01w01n000000.png" /></div> <p>Arrivy has been monumental in the way it's made us a more productive and communicative team</p></div>
                      <img className={styles['decorated-image']} src="/images/lending/try-pages/ef1b1ee4-techrepairjosh2408-515.jpg" />
                    </div>
                  </div>
                </div>

                <div className={styles["features-part"]}>
                  <div className={styles['container']}>
                    <h2>Arrivy Features</h2>
                    <Row>
                      <Col xs={12} sm={6}>
                        <img src="/images/lending/try-pages/19d2f871-icon-tabs.png" />
                        <h3>Keep tabs on all team
                          and customer communications</h3>
                        <p>Per job journal along with a messaging interface enables you to communicate contextually
                          with your team. Customer is updated at all the right times.</p>
                      </Col>
                      <Col xs={12} sm={6}>
                        <img src="/images/lending/try-pages/f20c6399-icon-pin.png" />
                        <h3>Know where
                          your crew is at anytime</h3>
                        <p>Offices managers can see at any instance where the crew member is</p>
                          </Col>
                    </Row>
                    <Row>
                      <Col xs={12} sm={6}>
                        <img src="/images/lending/try-pages/4828e7b2-icon-target.png" />
                        <h3>Let customers
                          track service calls</h3>
                        <p>Real-time estimates of arrival for your customers.
                          Let them track your crew when they are en-route to  service calls.</p>
                      </Col>
                      <Col xs={12} sm={6}>
                        <img src="/images/lending/try-pages/ef2ad4c2-icon-nocall.png" />
                        <h3>Say bye to making
                          phone calls all day</h3>
                        <p>No more calling service team to check on status and relaying it to customers.
                          Arrivy automates this entire communication for you.</p>
                      </Col>
                    </Row>
                  </div>
                </div>

                <div className={styles["game-part"]}>
                  <div className={styles['container']}>
                    <div className={styles['button-center-block']}>
                      <h2>Arrivy can change the game for your business</h2>
                      <button onClick={this.requestDemo}>Request your demo</button>
                    </div>
                  </div>
                </div>

                </div>
            </div>
            <Footer3v data={landingPageDataTryFirstPage} />
          </div>
        );
    }
}
