import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './landing-new-6.module.scss';
import { LandingNavigationV2, Footer3v }  from '../../components/index';
import { Grid, Button, Glyphicon, Modal, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import landingPageData from '../../landingv2-data.json';
import { DefaultHelmet } from '../../helpers/index';
import cx from 'classnames';

export default class LandingNew5 extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const navData = {...landingPageData, ...{isSquareButtons: true}}
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
        
          <LandingNavigationV2 data={navData} />

          <section className={styles['header-top']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12}>
                  <h1>About Arrivy</h1>
                </Col>
              </Row>
            </div>
          </section>

          <section className={styles['why-is-my']}>
            <div className={styles['container']}>
            <Row className={styles['padding-bottom']}>
                <Col sm={12} md={8} mdPush={2} className={cx(styles['clock-at-top'], styles['center-text'])}>
                  <h2>Why is my Appointment Window<br /> 4 Hours… ?</h2>
                  <p>Some businesses need to be dragged kicking and screaming into the 21st century.
                    While Amazon texts me 30 seconds after my purchase is delivered and my grill thermometer
                    notifies me instantly when my steak is done--my furnace repair company needs 4 hours of
                    flexibility for their technician. What’s up with that?</p>
                  </Col>
              </Row>

              <Row>
                <Col xs={12} sm={6} md={5} className={cx(styles['top-line'])}>
                  <p className={cx(styles['padding-bottom-text'])}>Arrivy was founded on the idea that customer engagement will drive satisfaction, 
                    recommendations and ultimately, more business for home service and delivery companies. 
                    Our technology is used by individual home service businesses and large Enterprises 
                    to help shorten time windows and provide transparency for customers to drive greater engagement and satisfaction.</p>
                  <p>And, it works! Our home service businesses report <a href="javascript:void(0)">an increase in positive reviews,
                    and--importantly--a reduction in customer no-shows.</a></p>
                </Col>
                <Col xs={12} sm={6} mdPush={1} className={styles['image-box']}>
                  <img src="/images/lending/landing-last/girl.jpg" />
                </Col>
              </Row>
            </div>
          </section>

          <section className={styles['heaving-a-website']}>
            <div className={styles['container']}>
              <Row className={styles['padding-bottom']}>
                <Col sm={12} md={8} mdPush={2} className={cx(styles['clock-at-top'], styles['center-text'])}>
                  <h2>Having a Web Site Doesn’t Make You “Operationally Excellent”</h2>
                  <p>At the end of the day, your company’s income is the absolute barometer of success. Unfortunately, income statements don’t talk. They can only tell you what happened--not how to improve for the future.</p>
                  </Col>
              </Row>

              <Row>
                <Col xs={12} sm={6} className={styles['image-box']}>
                  <img src="/images/lending/landing-last/black-and-white-broken-car-78793.jpg" />
                </Col>
                <Col xs={12} sm={5} smPush={1} className={cx(styles['top-line'])}>
                  <p>Arrivy helps you plan and optimize your routes. You will understand your task/travel breakdown, employee utilization, as well archived details for every job. We collects granular appointment data, leading to better metrics and prediction. Arrivy’s automated communications tools (email/SMS) provide our businesses with a <a href="javascript:void(0)">30+% savings in coordination time.</a> And, we track how your customers are engaging, through SMS, email and our arrival-tracking technology.</p>
                </Col>
              </Row>
            </div>
          </section>

          <section className={styles['veteran-team']}>
            <div className={styles['container']}>
              <Row className={styles['padding-bottom']}>
                <Col sm={12} md={8} mdPush={2} className={cx(styles['clock-at-top'], styles['center-text'])}>
                  <h2>A Veteran Team</h2>
                  <p>Arrivy is staffed with veterans from Microsoft, eBay, Adobe, Autodesk and other established technology companies.</p>
                  </Col>
              </Row>

              <Row>
                <Col xs={12} sm={6} md={5} className={cx(styles['top-line'])}>
                  <p>We’ve done big logistics systems (eBay Logistics & Shipping), innovative applications (Adobe Photoshop), and groundbreaking cloud tools (the first online spreadsheet). But, our passion is engaging customers through applications and interfaces that make life easier and better. Saving customers time and helping businesses work more effectively is what gets us up in the morning. <a href="javascript:void(0)">It’s one of those opportunities where--if you do it right--everyone smiles.</a></p>
                </Col>
                <Col xs={12} sm={6} mdPush={1} className={styles['image-box']}>
                  <img src="/images/lending/landing-last/team-img.jpg" />
                </Col>
              </Row>
            </div>
          </section>

          <section className={styles['road-to-growing']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12} className={styles['center-text']}>
                  <h2>The road to growing your business takes you through <br />the last-mile. Manage it with Arrivy.</h2>
                  <Link to={'/book-demo'} className={'green-btn ' + styles['btn']}>Book A Demo</Link>
                </Col>
              </Row>
            </div>
          </section>
          
        </div>
        <Footer3v data={landingPageData} />
      </div>
    );
  }
}
