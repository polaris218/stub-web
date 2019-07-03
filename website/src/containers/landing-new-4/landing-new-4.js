import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './landing-new-4.module.scss';
import { LandingNavigationV2, Footer3v }  from '../../components/index';
import { Grid, Button, Glyphicon, Modal, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import landingPageData from '../../landingv2-data.json';
import { DefaultHelmet } from '../../helpers/index';
import cx from 'classnames';
import Carousel from 'nuka-carousel';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faArrowUp } from '@fortawesome/fontawesome-free-solid';
import config from '../../config/config';
const env = config(self).env;
export default class LandingNew4 extends Component {
  constructor(props, context) {
    super(props, context);
    this.close = this.close.bind(this);
    this.modalRender = this.modalRender.bind(this);

    this.state = {
      showModal: false,
      widePhoto: false,
      modalHeader: '',
      modalContent: '',
      modalImage1: '',
      width: 0,
      height: 0
    };

    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
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

  modalRender(event, clickId, widePhoto) {
    event.preventDefault();
    if(typeof clickId !== 'undefined'){
      const modalData = landingPageData["LandingNew3_data"]["popups"][clickId];
      this.setState({
        modalHeader: modalData["title"],
        modalHeader2: modalData["title2"],
        modalContent: modalData["body"],
        modalImage: modalData["image"],
        widePhoto: widePhoto,
        showModal: true,
      });
    }
  }

  close() {
    this.setState({ showModal: false, });
  }

  render() {
    const navData = {...landingPageData, ...{isSquareButtons: true}}
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigationV2 data={navData} />
          <section className={cx(styles['header'], styles['people-bg'])}>
            <div className={styles['container']}>
              <h1>Deliver Perfect Customer Experiences</h1>
              <p>Arrivy connects service businesses and their customers in real-time and engages them through the last mile</p>
              <div className={styles['button-group']}>
                <Link to={'/book-demo'} className={'green-btn ' + styles['btn']}>Book A Demo</Link>
                <Link to={'/signup'}  className={'blue-btn ' + cx(styles['btn'])}>Try for free</Link>
              </div>
              <div className={styles['laptop']}>
                <img src="/images/lending/landing-last/Layer-21.png" />
                <div className={styles['laptop-shadow']} />
              </div>
            </div>
          </section>
          <section className={styles['partners']}>
            <Grid>
              <p>Join the smart businesses using Arrivy today, including:</p>
              <div className={styles['customer_icon_section']}>
                <Row className={styles.customerLogos}>
                  <Col md={6} sm={12} xs={12} >
                    <div>
                      <div><img src='/images/lending/landing-last/image_1-copy-2.png' /></div>
                      <div><img src='/images/lending/landing-last/image_4-copy-2.png' /></div>
                    </div>
                    <div>
                      <div><img src='/images/lending/landing-last/image_2-copy-2.png' /></div>
                      <div><img src='/images/lending/landing-last/mila.png' /></div>
                    </div>
                  </Col>
                  <Col md={6} sm={12} xs={12}>
                    <div>
                      <div><img src='/images/lending/landing-last/image_3-copy-2.png' /></div>
                      <div><img src='/images/lending/landing-last/my_porter.png' /></div>
                    </div>
                    <div>
                      <div><img src='/images/lending/landing-last/cleaning_plus.png' /></div>
                      <div><img className={styles.bostonBestRatesLogo} src='/images/lending/landing-last/boston-best-rate.png' /></div>
                    </div>
                  </Col>
                </Row>
                <Row className={styles.customerLogosMobileResolution}>
                  <Col md={12}>
                    <Carousel
                      className={cx(styles.slider)}
                      renderCenterLeftControls={null}
                      renderCenterRightControls={null}
                      slidesToShow={this.state.width < 768 ? (this.state.width < 440 ? 2 : 3) : 4}
                      slidesToScroll={this.state.width < 768 ? (this.state.width < 440 ? 2 : 3) : 2}
                      slideWidth={1}
                    >
                      <img src='/images/lending/landing-last/image_1-copy-2.png' />
                      <img src='/images/lending/landing-last/image_4-copy-2.png' />
                      <img src='/images/lending/landing-last/image_2-copy-2.png' />
                      <img src='/images/lending/landing-last/mila.png' />
                      <img src='/images/lending/landing-last/image_3-copy-2.png' />
                      <img src='/images/lending/landing-last/my_porter.png' />
                      <img src='/images/lending/landing-last/cleaning_plus.png' />
                      <img className={styles.bostonBestRatesLogo} src='/images/lending/landing-last/boston-best-rate.png' />
                    </Carousel>
                  </Col>
                </Row>
              </div>
            </Grid>
          </section>
          <section className={styles['delight_customers']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12} className={styles['center-text']}>
                  <h2>Connect your Office, Crew <br />
                    and Customers</h2>
                  <p>Drive customer satisfaction, enhance your internal communications and improve operations</p>
                </Col>
                <Col xs={12} sm={3}>
                  <div className={cx(styles["text_block"], styles["align_right"])}>
                    <img src='/images/lending/landing-last/Delight-your-customers_icon.png' />
                    <h4>Delight your customers</h4>
                    <p>Give your customers a personalized experience powered by real-time location tracking and automated alerts.</p>
                  </div>
                  <div className={cx(styles["text_block"], styles["align_right"])}>
                    <img src='/images/lending/landing-last/Connect-your-team_icon.png' />
                    <h4>Connect your team</h4>
                    <p>Arrivy aligns your team members with easy scheduling, automated communications, notifications and intra-company chat.</p>
                  </div>
                </Col>
                <Col xs={12} sm={6} className={styles['person']}>
                    <img src="/images/lending/landing-last/Businessman_img.png"/>
                </Col>
                <Col xs={12} sm={3}>
                  <div className={cx(styles["text_block"], styles["align_left"])}>
                    <img src='/images/lending/landing-last/Grow-your-business_icon.png' />
                    <h4>Grow your business</h4>
                    <p>Love making phone calls? Home service companies spend at least 30% of their time in coordination. Arrivy's automation lets you focus on growing your business.</p>
                  </div>
                  <div className={cx(styles["text_block"], styles["align_left"])}>
                    <img src='/images/lending/landing-last/Dead-simple-integration.png' />
                    <h4>Dead simple integration</h4>
                    <p>Use Arrivy’s built-in applications or integrate Arrivy’s location and communications tools into your own Enterprise apps.</p>
                  </div>
                </Col>
              </Row>
            </div>
          </section>
          <section className={styles['customerExperienceSection']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12}>
                  <div className={styles['textarea']}>
                    <h2>
                      <span>Customer Service</span>
                      Customer Experience
                    </h2>
                    <p>"Service" is no longer enough. The benefits of engaging customers lead directly to cost savings, increased revenue and operational efficiencies.</p>
                  </div>
                </Col>
                <Col xs={12} sm={4}>
                  <div className={styles['customerExperience']}>
                    <div className={cx(styles['imageHolder'], styles.item_1)}>
                      <img src="/images/lending/landing-last/dinosaurs-go-extinct.png" alt="Dinosaurs go extinct" />
                    </div>
                    <h4>Dinosaurs go extinct</h4>
                    <p>5-hour time windows? I don’t think so. <strong>Arrivy customers see 50% fewer missed appointments.</strong></p>
                  </div>
                </Col>
                <Col xs={12} sm={4}>
                  <div className={styles['customerExperience']}>
                    <div className={cx(styles['imageHolder'], styles.item_2)}>
                      <img src="/images/lending/landing-last/customer-service.jpg" alt="Life is short..." />
                    </div>
                    <h4>Life is short...</h4>
                    <p>Tired of spending all day confirming appointments. <strong>Arrivy’s automated email/SMS saves 30%+ scheduler time.</strong></p>
                  </div>
                </Col>
                <Col xs={12} sm={4}>
                  <div className={styles['customerExperience']}>
                    <div className={cx(styles['imageHolder'], styles.item_3)}>
                      <img src="/images/lending/landing-last/like-pulling-teeth.png" alt="Like pulling teeth" />
                    </div>
                    <h4>Like pulling teeth</h4>
                    <p>Having a hard time getting enough good reviews? <strong>Arrivy customers get 5x more, better reviews</strong></p>
                  </div>
                </Col>
              </Row>
              <hr/>
            </div>
          </section>
          <section className={styles['uberize-business']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12} className={styles['center-heading']}>
                  <h2>Finger-on-the-pulse<br/>Goodness</h2>
                  <p>Improve visibility and drive alignment across your business with Arrivy’s  team-oriented toolset</p>
                </Col>
                <Col xs={8} sm={12} className={styles['center-text']}>
                  <h4>Uberize Your Business</h4>
                    <p>Your clients can track your crew's arrival times with real-time
                      estimates and email / SMS notifications. <a href="#" onClick={(e) => this.modalRender(e, 3, false)}>Learn more</a></p>
                </Col>
                <Col xs={8} sm={4} md={3} className={styles['align_right']}>
                  <h4>Team Communications<br /> on Steroids</h4>
                  <p>Shared calendars make it easy to schedule work for your crew.
                    Crew members can see their tasks and job details on easy-to-use mobile apps. <a href="#" onClick={(e) => this.modalRender(e, 1, false)}>Learn more</a></p>
                </Col>
                <Col xs={8} sm={4} smPush={4} md={3} mdPush={6} className={styles['align_left']}>
                  <h4>Track the Status of your Field Teams, Instantly</h4>
                  <p>Ever want a "heads-up" display for your service business? Arrivy's Activity Feed shows the status of all your jobs as they are happening. <a href="/" onClick={(e) => this.modalRender(e, 2, true)}>Learn more</a></p>
                </Col>
              </Row>
            </div>
          </section>
          <section className={styles['better-reviews']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12} sm={5} smPush={7} lg={6} lgPush={6} className={styles['text-block']}>
                  <div className={styles['heading-text']}>
                    <h2>Reviews <FontAwesomeIcon icon={faArrowUp} className={styles.upArrow}/> Business <FontAwesomeIcon icon={faArrowUp} className={styles.upArrow} />
                      <FontAwesomeIcon icon={faArrowUp} className={styles.upArrow} /><FontAwesomeIcon icon={faArrowUp} className={styles.upArrow} />
                      <FontAwesomeIcon icon={faArrowUp} className={styles.upArrow} /><FontAwesomeIcon icon={faArrowUp} className={styles.upArrow} /></h2>
                  </div>
                </Col>
              </Row>
              <Row>
                <Col xs={8} sm={5} smPush={7} lg={6} lgPush={6} className={styles['text-block']}>
                  <img src="/images/lending/landing-last/Shape-3-copy-5.png" />
                  <h4>Better reviews, instant feedback</h4>
                  <p>Arrivy customers have seen significant increases in positive reviews.
                    Arrivy automatically prompts customers to rate you on Facebook,
                    Yelp, Google, on task completion</p>
                  <button className={cx(styles['btn'], styles['btn-green-transp'])} onClick={(e) => this.modalRender(e, 0, false)}>Learn More</button>
                </Col>
              </Row>
            </div>
          </section>
          <section className={styles['simple-integration']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12} className={styles['center-text']}>
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
                <Col xs={12} className={styles['center-text']}>
                  <Link className={cx(styles['btn'], styles['btn-green-transp'])} to="/enterprise">Learn More</Link>
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
        <Modal show={this.state.showModal} className={styles['modal-container']} onHide={this.close}>
          <Modal.Body className={cx(styles['container'], styles['modal'])}>
            <Row>
                <Col xs={12} sm={5}>
                  <div className={cx(styles.modalImages, this.state.widePhoto === true ? styles.widePhoto : '')}>
                    <img className="img-responsive" src={this.state.modalImage} alt="" />
                  </div>
                </Col>
                <Col xs={12} sm={7}>
                  <h4>{this.state.modalHeader}<br /> {this.state.modalHeader2}</h4>
                  <p className={styles.featuresModalsContent}>
                    {this.state.modalContent}
                  </p>
                  <button className={cx(styles['btn'], styles['btn-green-transp'])} onClick={this.close}>OK</button>
                </Col>
            </Row>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
