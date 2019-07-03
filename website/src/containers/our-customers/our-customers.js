import React, { Component } from 'react';
import styles from './our-customers.module.scss';
import { LandingNavigationV2, Footer3v }  from '../../components/index';
import { Row, Col } from 'react-bootstrap';
import { DefaultHelmet } from '../../helpers/index';
import { Link } from 'react-router-dom';
import landingPageData from '../../landingv2-data.json';
import cx from "classnames";

export default class OurCustomers extends Component {
  constructor(props) {
    super(props);
  }

  render () {
    return (
      <div>
        <div className={styles['full-height']}>
          <DefaultHelmet/>
          <div className={cx(styles['page-wrap'], styles['customers-page-wrap'])}>
            <LandingNavigationV2 data={landingPageData}/>
            <div className={styles.header}>
              <div className={styles.container}>
                <div className={styles.headerContentContainer}>
                  <h1>
                    Win The Last Mile…
                  </h1>
                  <p>
                    Nothing succeeds like (customer) success
                  </p>
                  <Link to={'/book-demo'}  className={'green-btn ' + cx(styles['btn'], styles.btnTopMargin)}>Book a Demo</Link>
                </div>
              </div>
            </div>
            <section className={styles['timeline-wrapper']}>
              <div className={styles['container']}>
                <div className={styles['title']}>
                  <div className={styles['title-circle']}>50<span></span></div>
                  <h2>Fewer Missed Appointments</h2>
                </div>
                <div className={styles['timeline']}>
                  <div className={styles['timeline-block']}>
                    <div className={styles['timeline-col']}>
                      <div className={styles['timeline-image']}>
                        <img src="/images/lending/customers/Vector.jpg" alt="image" />
                      </div>
                    </div>
                    <div className={styles['timeline-col']}>
                      <div className={styles['timeline-content']}>
                        <p>
                          We get positive feedback from customers because of the experience Arrivy enables us to provide – they feel more confident in our service! <strong>- Vector Movers</strong> <a href="https://blog.arrivy.com/2017/09/08/arrivy-aims-vector-movers-right-direction/" target="_blank">Learn more</a>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={styles['timeline-block']}>
                    <div className={styles['timeline-col']}>
                      <div className={styles['timeline-image']}>
                        <img src="/images/lending/customers/Global.jpg" alt="image" />
                      </div>
                    </div>
                    <div className={styles['timeline-col']}>
                      <div className={styles['timeline-content']}>
                        <p>
                          Our team loves Arrivy, because it makes everyone's job easier. Our time communicating with customers and each other is cut to a fraction of what it used to be since Arrivy completely automates communication. Most importantly, we are providing a better experience for our customers, and this turns into repeat customers for our business.
                        </p>
                        <p>
                          <strong>GDS Global Document Shredding</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className={cx(styles['timeline-wrapper'], styles['timeline-schedule-wrapper'])}>
              <div className={styles['container']}>
                <div className={styles['title']}>
                  <div className={cx(styles['title-circle'], styles['plus'])}>30<span></span></div>
                  <h2>Time Savings For Dispatchers/Schedulers</h2>
                </div>
                <div className={styles['timeline']}>
                  <div className={styles['timeline-block']}>
                    <div className={styles['timeline-col']}>
                      <div className={styles['timeline-image']}>
                        <img src="/images/lending/customers/Sears.jpg" alt="image" />
                      </div>
                    </div>
                    <div className={styles['timeline-col']}>
                      <div className={styles['timeline-content']}>
                        <p>
                          Arrivy has improved our ability to communicate effectively with our dispatchers, technicians, and customers by leaps and bounds. <strong> - Sears Garage Doors</strong> <a href="https://blog.arrivy.com/2017/06/15/arrivy-drives-customer-engagement-for-sears-garage-door/" target="_blank">Learn more</a>
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className={styles['timeline-block']}>
                    <div className={styles['timeline-col']}>
                      <div className={styles['timeline-image']}>
                        <img src="/images/lending/customers/Move4Less.jpg" alt="image" />
                      </div>
                    </div>
                    <div className={styles['timeline-col']}>
                      <div className={styles['timeline-content']}>
                        <p>
                          We want to save time on operations.
                        </p>
                        <p>
                          That’s what Arrivy brings to us
                        </p>
                        <p>
                          <strong>Move4Less</strong> <a href="https://blog.arrivy.com/2017/11/20/move4less-bets-arrivy/" target="_blank">Learn more</a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className={styles['enterprise-integration']}>
              <div className={styles['container']}>
                <h2>Enterprise Integration: Dead Simple</h2>
                <blockquote>
                  <q>For Mila, the customer experience is crucial… That’s why we wanted to add technology to provide
                    transparency for customer and to attain real-time visibility over operations. We liked the
                    technology of Arrivy when we saw it, and the integration was very easy.</q>
                  <cite>Mila (a division of Swisscom)</cite>
                </blockquote>
                <div className={styles['video-wrapper']}>
                  <img src="/images/lending/customers/MilaVideo.png" alt="image" />
                </div>
              </div>
            </section>
            <section className={styles['our-customer']}>
              <div className={styles['container']}>
                <h2>Listen To<br />Our Customer’s Customers...</h2>
                <Row>
                  <Col xs={12} sm={4}>
                    <div className={styles['box']}>
                      <figure>
                        <img src="/images/lending/customers/cc1.png" alt="image" />
                      </figure>
                      <div className={styles['box-content']}>
                        <p>The crew was fast and efficient, and the process was clear and easy to track. Would use your
                          service again!</p>
                        <p>They also have online tracking of your inventory and status updates of where the crew is,
                          along with other details. This makes things very efficient and their use of the online
                          platform puts them at a competitive advantage.</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div className={styles['box']}>
                      <figure>
                        <img src="/images/lending/customers/cc2.png" alt="image" />
                      </figure>
                      <div className={styles['box-content']}>
                        <p>I really liked your appointment tracking. Very professional service and I will definitely
                          refer family and friends when they need a garage door service.</p>
                        <p>Service tech arrived ahead of schedule, wow, how often does that happen?</p>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div className={styles['box']}>
                      <figure>
                        <img src="/images/lending/customers/cc3.png" alt="image" />
                      </figure>
                      <div className={styles['box-content']}>
                        <p>I appreciate you sending me an email with your employees photo. Thank you!</p>
                        <p>The service was great. They scheduled me very quickly and they showed up within the timeframe
                          they had told me, providing periodic updates regarding their time of arrival.</p>
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
            <Footer3v data={landingPageData} />
          </div>
        </div>
      </div>
    );
  }

}
