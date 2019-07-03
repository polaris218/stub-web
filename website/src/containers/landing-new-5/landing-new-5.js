import React, { Component } from 'react';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router-dom';
import styles from './landing-new-5.module.scss';
import { LandingNavigationV2, Footer3v }  from '../../components/index';
import { Grid, Button, Glyphicon, Modal, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import landingPageData from '../../landingv2-data.json';
import { DefaultHelmet } from '../../helpers/index';
import cx from 'classnames';

export default class LandingNew5 extends Component {
  constructor(props, context) {
    super(props, context);
  }

  componentDidMount() {
    // window.Intercom("boot", {
    //   app_id: "vfdmrett"
    // });

    const { hash } = window.location;
    if (hash !== '') {
      setTimeout(() => {
        const id = hash.replace('#', '');
        if (id == 'integrations') {
          findDOMNode(this.refs.integrations).scrollIntoView();
        }

      }, 2);
    }
  }

  render() {
    const navData = {...landingPageData, ...{isSquareButtons: true}}
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigationV2 data={navData} />
          <section className={styles['manage-top']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12} sm={12} md={5} className={styles['text-main']}>
                  <h1>Last Mile Experience Platform for Enterprises</h1>
                  <p>Arrivy connects businesses and their customers in real-time and engages them through the last mile</p>
                  <Link to={'/book-demo'}  className={'green-btn ' + cx(styles['btn'])}>See arrivy in action</Link>
                </Col>
              </Row>
            </div>
          </section>
          
          <section className={styles['extraordinary-cap']}>
            <div className={styles['container']}>
              <div className={styles['text-center']}>
                <h2>Add Extraordinary Capabilities</h2>
              </div>
              <Row>
                <Col smPull={1} smPush={2} xs={12} sm={3} className={styles['text-right']}>
                  <h4>UBER-ize Customer<br /> Experience</h4>
                  <p>Arrivy lets clients track your crew’s arrival times with real-time estimates, 
                    crew photos, map locations and automatic email/SMS notifications.</p>
                </Col>
                <Col smPush={4} xs={12} sm={3} className={styles['text-left']}>
                  <h4>Automated<br /> Communications</h4>
                  <p>With automated appointment reminders and in-job status messages, 
                    customers can get information in the modern way they prefer</p>
                </Col>
              </Row>

              <Row className={styles['padding-top-row']}>
                <Col xs={12} sm={3} className={styles['text-right']}>
                  <h4>Permanent<br /> record</h4>
                  <p>Arrivy’s Task Journal provides a permanent record of all job activities</p>
                  <h4>Prediction<br /> & Alerting</h4>
                  <p>Arrivy uses intelligent tracking to identify 
                    events that occur on a job--such as crew arrival and departure</p>
                </Col>
                <Col xs={12} sm={6} className={styles['text-center']}>
                  <img />
                </Col>
                <Col xs={12} sm={3} className={styles['text-left']}>
                  <h4>Finger-on-the-pulse</h4>
                  <p>All job events are instantly available to Schedule/Dispatch in the Activity Feed</p>
                  <h4>Automated<br /> crew reminders</h4>
                  <p>Team notifications provides day-before job reminders (with acceptance/decline) for crew members</p>
                </Col>
              </Row>
            </div>
          </section>

          <section className={styles['simple-integration']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12} className={styles['text-center']}>
                  <h2>Dead Simple Integration</h2>
                  <p>Use Arrivy as is, or leverage our API to integrate our services with your own applications.</p>
                </Col>
                <Col xs={12} sm={4} md={3} mdPush={1}>
                  <div className={cx(styles['box'], styles['padding-top'])}>
                    <img src="/images/lending/landing-last/API_icon.png" />
                    <h4>Five API Calls</h4>
                    <p>That’s right. Get basic integration up and running in days.</p>
                  </div>
                </Col>
                <Col xs={12} sm={4} md={4} mdPush={1}>
                  <div className={styles['box']}>
                    <img src="/images/lending/landing-last/Enterprise-tools_icon.png" />
                    <h4>Integrates with Enterprise tools</h4>
                    <p>Have your own calendaring and task-management tool? Arrivy can work with that. 
                      Customer lists? Employee contact lists? 
                      Use your own tools or leverage Arrivy’s built-in features.</p>
                  </div>
                </Col>
                <Col xs={12} sm={4} md={3} mdPush={1}>
                  <div className={cx(styles['box'], styles['padding-top'])}>
                    <img src="/images/lending/landing-last/SDK_icon.png" />
                    <h4>Components SDK</h4>
                    <p>Add the Activity Feed or Map-based crew tracking to your own apps with a single line of markup.</p>
                  </div>
                </Col>
              </Row>
            </div>
          </section>

          <section className={styles['customizable-exp']}>
          
            <div className={styles['container']}>
              <div className={cx(styles['top-box'], styles['text-center'])}>
                <h3>A Customizable Experience</h3>
                <p>Use Arrivy’s UX for monitoring jobs or integrate our components into your own apps. </p>
              </div>
              <Row>
                <Col xs={12} sm={6} className={styles['image-right']}>
                  <img />
                </Col>
                <Col xs={12} smPush={1}  sm={4} className={cx(styles['text-left'], styles['padding-top-box'])}>
                  <h4>Customer Communications</h4>
                  <p>All customer communications (email/SMS) can be customized or rewritten.
                     All job types (e.g. estimates) can have customizable task templates. </p>
                </Col>
              </Row>
              <Row className={styles['padding-box']}>
                <Col xs={12} smPush={2} sm={4} className={cx(styles['text-right'], styles['padding-top-box'])}>
                  <h4>Mobile Apps</h4>
                  <p>Integrate Arrivy into your own mobile offerings or brand our iOS and Android apps </p>
                </Col>
                <Col xs={12} mdPush={2} smPush={2} sm={6} className={styles['image-left']}>
                  <img />
                </Col>
              </Row>
              <Row>
                <Col xs={12} smPush={2} sm={8} className={cx(styles['testing-env'], styles['text-center'])}>
                  <h3>Docs and Testing Environment</h3>
                  <p>Created by developers, for developers, 
                    Arrivy provides comprehensive API documentation and code samples 
                    that make it straightforward to understand and integrate our “last-mile” functionality. 
                    A sandboxed environment for development and testing makes it easy to try 
                    out your integrations without risking production data. </p>
                    <div className={styles['portal-btn-section']}>
                      <Link to={'/developer_portal'}  className={'green-btn ' + cx(styles['btn'], styles['btn-green-transp'])}>Developer Portal</Link>
                    </div>
                </Col>
              </Row>
            </div>
          </section>
          <section className={styles['our-customer']} id="integrations" ref="integrations">
              <div className={styles['container']}>
                <div className={styles['title']}>
                  <h3>From the First Step to the Last Mile</h3>
                  <p>Arrivy integrations make extraordinary products, more complete, more powerful. To learn more email us at <a target='_blank' href='mailto:support@arrivy.com?subject=Arrivy Integration Query'>support@arrivy.com</a></p>
                </div>
                <Row>
                  <Col xs={12} sm={4} lg={3}>
                    <div className={styles['box']}>
                      <figure>
                        <img src="/images/lending/integrations/integ-sla.png" alt="image" />
                      </figure>
                      <div className={styles['box-content']}>
                        <h4>Slack</h4>
                        <p>Get important Activity Feed messages directly in your Slack channels. <Link to='/slack'>Learn more</Link></p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={4} lg={3}>
                    <div className={styles['box']}>
                      <figure>
                        <img src="/images/lending/integrations/integ-zap.png" alt="image" />
                      </figure>
                      <div className={styles['box-content']}>
                        <h4>Zapier</h4>
                        <p>Leverage Arrivy’s Zapier integration to connect to hundred of different applications and easily create tasks in Arrivy. <Link to='/zapier'>Learn more</Link></p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={4} lg={3}>
                    <div className={styles['box']}>
                      <figure>
                        <img src="/images/lending/integrations/integ-mov.png" alt="image" />
                      </figure>
                      <div className={styles['box-content']}>
                        <h4>MoveBoard</h4>
                        <p>Elromco MoveBoard users can manage customer experience through the last mile using Arrivy’s mapping and automated communications technology. <Link to='/moveboard'>Learn more</Link></p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={4} lg={3}>
                    <div className={styles['box']}>
                      <figure>
                        <img src="/images/lending/integrations/integ-mil.png" alt="image" />
                      </figure>
                      <div className={styles['box-content']}>
                        <h4>Mila</h4>
                        <p>The “Geek Squad” of Switzerland helps thousands of customers each month get predictable help with their technology setup and maintenance. <Link to='/our-customers'>Learn more</Link></p>
                      </div>
                    </div>
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
