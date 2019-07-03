import React, { Component } from 'react';
import styles from './landing-zapier.module.scss';
import { LandingNavigationV2, Footer3v }  from '../../components/index';
import { Row, Col } from 'react-bootstrap';
import { DefaultHelmet } from '../../helpers/index';
import { Link } from 'react-router-dom';
import landingPageData from '../../landingv2-data.json';
import cx from "classnames";

export default class ElromcoPage extends Component {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div>
        <div className={styles['full-height']}>
          <DefaultHelmet/>
          <div className={cx(styles['page-wrap'], styles['elromco-page-wrap'])}>
            <LandingNavigationV2 data={landingPageData}/>
            <div className={styles['header']}>
              <div className={styles['container']}>
                <h1>Arrivy Integrates with Zapier.<br />ZAP! - You're Productive</h1>
                <p>Link your business to Arrivy thru Zapier and rule the last mile</p>
                <div className={styles['button-group']}>
                  <Link to={'/book-demo'} className={cx(styles['green-btn'], styles.btn )}>BOOK A DEMO</Link>
                  <Link to={'/signup'} className={cx(styles['blue-btn'], styles.btn )}>Try for free</Link>
                </div>
              </div>
            </div>
            <section className={styles['elromco-section']}>
              <div className={styles['container']}>
                <div className={styles['inner']}>
                  <i className={styles['brand']}>
                    <img src="/images/lending/zapier/zapier-logo.png" alt="elromco" />
                  </i>
                  <h2>Now, hundreds of zapier apps can be connected with Arrivy to manage customer experience through the “last mile” using Arrivy’s mapping and automated communications technology.</h2>
                  <p>Arrivy Zaps integrates your system with Arrivy providing the ability to use SMS (or email) to text customers appointment status and details. With Arrivy, customers get an UBER-like experience viewing the crew’s approach on a map.</p>
                </div>
              </div>
            </section>
            <section className={styles['contentSection']}>
              <div className={styles['container']}>
                <h2>Automatically synchronize appointments, leads, existing customers from any zapier enabled application to Arrivy</h2>
                <div className={styles.intro}>
                  <Row className={styles.row}>
                    <Col xs={12} sm={6}>
                      <blockquote>
                        <q>The salesforce zap saves us time, keeps our team connected and enables us to provide our customers with a modern moving experience.</q>
                        <cite><strong>John</strong> - Everything Moving</cite>
                      </blockquote>
                    </Col>
                    <Col xs={12} sm={6}>
                      <div className={styles.vectorWrapper}>
                        <img src="/images/lending/elromco/vector-mov.png" alt="icon" />
                       </div>
                    </Col>
                  </Row>
                </div>
                <div className={styles.featuresWrapper}>
                  <Row className={styles.row}>
                    <Col xs={12} sm={6}>
                      <img src="/images/lending/zapier/arrivy-dash.png" alt="image" className={styles.screenLeft} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <h3>Use any CRM <br/>Arrivy will handle your Dispatch and Customer Experience:</h3>
                      <p>A 5-min setup brings all your data in Arrivy’s Dashboard, where you can manage your jobs and see the location of all your crews on a map.</p>
                    </Col>
                  </Row>
                  <Row className={styles.row}>
                    <Col xs={12} sm={6}>
                      <img src="/images/lending/elromco/mobile-journal.png" alt="image" />
                    </Col>
                    <Col xs={12} sm={6}>
                      <h3>Capture activities and communications <br />in Job Journals:</h3>
                      <p>Arrivy captures, communicates and archives job start times, status changes, notes, photos and voice annotations in real-time.</p>
                    </Col>
                  </Row>
                  <Row className={styles.row}>
                    <Col xs={12} sm={6}>
                      <img src="/images/lending/elromco/map-mobile.png" alt="image" />
                    </Col>
                    <Col xs={12} sm={6}>
                      <h3>Customers can see crew progress <br />with notifications:</h3>
                      <p>Your clients can track your crew's arrival times with real-time estimates and email / SMS notifications. They can see the crew’s progress on a map.</p>
                    </Col>
                  </Row>
                  <Row className={styles.row}>
                    <Col xs={12} sm={6}>
                      <img src="/images/lending/elromco/charts.png" alt="image" className={styles.screenRight} />
                    </Col>
                    <Col xs={12} sm={6}>
                      <h3>Measure your progress. <br />Rinse. Repeat.</h3>
                      <p>Detailed charts let you gauge your time spent on job, in transit and mileage. Our customer engagement reports help you understand customer touchpoints</p>
                    </Col>
                  </Row>
                </div>
              </div>
            </section>
            <section className={styles['waiting-for-section']}>
              <div className={styles['container']}>
                <Row>
                  <Col xs={12} sm={8} md={6} smPush={2} mdPush={6}>
                    <h2>What are you waiting for?</h2>
                    <p>Make your business more efficient and effective. If you’re already using zapier or exploring it, you simply must see this extraordinary integration for yourself. Sign up for a demo or get started with 2 weeks of free trial <span>(no credit card needed)</span></p>
                    <div className={styles['button-group']}>
                      <a href={'mailto:info@arrivy.com?subject=Arrivy | Zapier | Demo'} target="_blank" className={cx(styles['green-btn'], styles.btn )}>Attend a webinar</a>
                      <Link to={'/signup'} className={cx(styles['blue-btn'], styles.btn )}>Try for free</Link>
                    </div>
                  </Col>
                </Row>
              </div>
            </section>
          </div>
          <Footer3v data={landingPageData} />
        </div>
      </div>
    );
  }
}
