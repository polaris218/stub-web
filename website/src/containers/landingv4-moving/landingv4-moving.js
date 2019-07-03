import React, { Component } from 'react';
import styles from './landingv4-moving.module.scss';
import { LandingNavigationV2, Footer3v } from '../../components/index';
import { Row, Col } from 'react-bootstrap';
import { DefaultHelmet } from '../../helpers/index';
import { Link } from 'react-router-dom';
import landingPageData from '../../landingv2-data.json';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faBullhorn } from '@fortawesome/fontawesome-free-solid';

import config from '../../config/config';
const env = config(self).env;
export default class Landingv4Moving extends Component {
  constructor(props) {
    super(props);

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);

    this.state = {
      width: 0,
      height: 0
    };

  }

  componentDidMount() {
    if (env !== 'Dev') {
      window.Intercom("boot", {
        app_id: "vfdmrett"
      });
      this.updateWindowDimensions();
      window.addEventListener('resize', this.updateWindowDimensions);
    }
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  render() {
    return (
      <div className={styles["full-height"]}>
        <DefaultHelmet/>
        <div className={cx(styles["page-wrap"], styles["moving-page-wrap"])}>
          <LandingNavigationV2 data={landingPageData}/>
          <section className={styles.header}>
            <div className={styles.container}>
              <div className={styles.headerContentContainer}>
                <h1>Deliver PERFECT Moving Experience</h1>
                <p>Arrivy automates communications, drives customer engagement and improves operations</p>
                <div className={cx(styles.btnWrapper)}>
                  <Link to={"/book-demo"} className={"green-btn " + styles["btn"]}>Book A Demo</Link>
                  <Link to={"/signup"} className={"blue-btn " + styles["btn"]}>Try for free</Link>
                </div>
              </div>
            </div>
          </section>
          <div className={styles["partners"]}>
            <div className={styles["container"]}>
              <p>Join the smart businesses using Arrivy today, including:</p>
              <div className={cx(styles.partnersLogos)}>
                <div className={cx(styles.logo)}><img src="/images/lending/moving/logo-1.png" alt="Logo" /></div>
                <div className={cx(styles.logo)}><img src="/images/lending/moving/logo-2.png" alt="Logo" /></div>
                <div className={cx(styles.logo)}><img src="/images/lending/moving/logo-3.png" alt="Logo" /></div>
                <div className={cx(styles.logo)}><img src="/images/lending/moving/logo-4.png" alt="Logo" /></div>
              </div>
            </div>
          </div>
          <section className={cx(styles.howArrivyWorks)}>
            <div className={cx(styles.container)}>
              <Row className={cx(styles.inner)}>
                <Col xs={12} sm={6}>
                  <blockquote>
                    <q>Customers used to call us non-stop. They always wanted to know–where are the guys? They’re worried about people showing up. Now we are a click-away from our customers. <strong>We get positive feedback from customers–they feel more confident in our service!</strong></q>
                    <cite><strong>Numan</strong> - Vector Movers</cite>
                  </blockquote>
                </Col>
                <Col xs={12} sm={6}>
                  <div className={cx(styles.videoWrapper)}>
                    <iframe src="https://player.vimeo.com/video/316159641" frameBorder="0" />
                  </div>
                </Col>
              </Row>
            </div>
          </section>
          <section className={cx(styles.delightCustomers)}>
            <div className={cx(styles.container)}>
              <h2>Connect your Office,<br />Movers and Customers</h2>
              <Row>
                <Col xs={12} sm={3}>
                  <div className={cx(styles["text_block"], styles["align_right"])}>
                    <img src="/images/lending/landing-last/Delight-your-customers_icon.png" alt="icon" />
                    <h4>Delight your customers</h4>
                    <p>Exceptional service management software to connect your office, service technicians and customers.</p>
                  </div>
                  <div className={cx(styles["text_block"], styles["align_right"])}>
                    <img src="/images/lending/landing-last/Connect-your-team_icon.png" alt="icon" />
                    <h4>Connect your team</h4>
                    <p>Arrivy aligns your team members with easy scheduling, automated communications, notifications and intra-company chat.</p>
                  </div>
                </Col>
                <Col xs={12} sm={6} className={styles["person"]}>
                  <img src="/images/lending/moving/businessman.png" alt="Business Man" />
                </Col>
                <Col xs={12} sm={3}>
                  <div className={cx(styles["text_block"], styles["align_left"])}>
                    <img src="/images/lending/landing-last/Grow-your-business_icon.png" alt="icon" />
                    <h4>Grow your business</h4>
                    <p>Love making phone calls? Home service companies spend at least 30% of their time in coordination. Arrivy's automation lets you focus on growing your business.</p>
                  </div>
                  <div className={cx(styles["text_block"], styles["align_left"])}>
                    <img src="/images/lending/landing-last/Dead-simple-integration.png" alt="icon" />
                    <h4>Dead simple integration</h4>
                    <p>Use Arrivy’s built-in applications or integrate Arrivy’s location and communications tools into your own Enterprise apps.</p>
                  </div>
                </Col>
              </Row>
            </div>
          </section>
          <section className={cx(styles.whyLoveArrivy)}>
            <div className={cx(styles.container)}>
              <div className={cx(styles.intro)}>
                <h2>Why do moving companies love Arrivy?</h2>
                <p>Arrivy has the features and functionality that helps moving companies operate move efficiently, increases customer engagement and drives better, more positive reviews.</p>
              </div>
              <div className={cx(styles.reasonWrapper)}>
                <div className={cx(styles.reason)}>
                  <div className={cx(styles.imageWrapper)}>
                    <img src="/images/lending/moving/task-crew.png" alt="Task Crew" />
                  </div>
                  <div className={cx(styles.content)}>
                    <div className={cx(styles.inner)}>
                      <h3>Replace 100’s of phone calls <br />with a few button clicks</h3>
                      <p>Arrivy automates communication and lets customers the track crew's approach on a map. <strong>The result:</strong> greater customer engagement and satisfaction.</p>
                    </div>
                  </div>
                </div>
                <div className={cx(styles.reason)}>
                  <div className={cx(styles.imageWrapper)}>
                    <img src="/images/lending/moving/dashboard.png" alt="Dashboard" />
                  </div>
                  <div className={cx(styles.content)}>
                    <div className={cx(styles.inner)}>
                      <h3>Team communication on steroids</h3>
                      <p>Arrivy's Dashboard lets Dispatchers track your crew's progress and location throughout the day. And, the Activity Feed flags important activities and issues in real time.</p>
                    </div>
                  </div>
                </div>
                <div className={cx(styles.reason)}>
                  <div className={cx(styles.imageWrapper)}>
                    <img src="/images/lending/moving/job-journal.png" alt="Job Journal" />
                  </div>
                  <div className={cx(styles.content)}>
                    <div className={cx(styles.inner)}>
                      <h3>Don’t rely on memory - record <br />and archive move details</h3>
                      <p>Arrivy's mobile apps let crew members take photos, make notes and record customer signatures. These are shared with Dispatch for instant collaboration and saved with the customer record for future reference.</p>
                    </div>
                  </div>
                </div>
                <div className={cx(styles.reason)}>
                  <div className={cx(styles.imageWrapper)}>
                    <img src="/images/lending/moving/customers-rating.png" alt="Customers Rating" />
                  </div>
                  <div className={cx(styles.content)}>
                    <div className={cx(styles.inner)}>
                      <h3>Know  if  your customers<br /> are happy, instantly</h3>
                      <p>Arrivy automatically prompts customers to rate you on move completion so you know immediately if you have achieved customer delight or customer despair.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className={cx(styles.caseStudiesSection)}>
            <div className={cx(styles.container)}>
              <div className={cx(styles.intro)}>
                <h2>Case Studies</h2>
              </div>
              <div className={cx(styles.caseStudiesWrapper)}>
                <Row>
                  <Col xs={12} sm={4}>
                    <div className={cx(styles.caseStudy)}>
                      <a href="https://blog.arrivy.com/2017/11/20/move4less-bets-arrivy/" target="_blank">
                        <figure>
                          <img src="/images/lending/moving/case-study-1.jpg" />
                        </figure>
                        <div className={cx(styles.detail)}>
                          <p>Move4Less Doubles-Down on Arrivy</p>
                        </div>
                      </a>
                    </div>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div className={cx(styles.caseStudy)}>
                      <a href="https://blog.arrivy.com/2017/09/08/arrivy-aims-vector-movers-right-direction/" target="_blank">
                        <figure>
                          <img src="/images/lending/moving/case-study-2.jpg" />
                        </figure>
                        <div className={cx(styles.detail)}>
                          <p>Arrivy Aims Vector Movers in the right direction</p>
                        </div>
                      </a>
                    </div>
                  </Col>
                  <Col xs={12} sm={4}>
                    <div className={cx(styles.caseStudy)}>
                      <a href="https://blog.arrivy.com/2018/11/13/myporter-uber-izing-moving-storage/" target="_blank">
                        <figure>
                          <img src="/images/lending/moving/case-study-3.jpg" />
                        </figure>
                        <div className={cx(styles.detail)}>
                          <p>MyPorter, UBER-izing Moving & Storage</p>
                        </div>
                      </a>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
          </section>
          <section className={styles["road-to-growing"]}>
            <div className={styles["container"]}>
              <Row>
                <Col xs={12} className={styles["center-text"]}>
                  <h2>The road to growing your business takes you through <br />the last-mile. Manage it with Arrivy.</h2>
                  <Link to={"/book-demo"} className={"green-btn " + styles["btn"]}>Book A Demo</Link>
                </Col>
              </Row>
            </div>
          </section>
          <Footer3v data={landingPageData}/>
        </div>
      </div>
    );
  }
}
