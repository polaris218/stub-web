import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import styles from './landing-new.module.scss';
import { LandingNavigationV2, Footer2v }  from '../../components/index';
import Landingv2HeaderCustomerLogos from '../../components/landingv2-header/landing2-header-cutomer-logos';
import { Grid, Button, Glyphicon, Modal, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import landingPageData from '../../landingv2-data.json';
import { DefaultHelmet } from '../../helpers/index';
import history from '../../configureHistory';

export default class LandingNew extends Component {
  constructor(props, context) {
    super(props, context);
    this.requestDemo = this.requestDemo.bind(this);
    this.close = this.close.bind(this);
    this.modalRender = this.modalRender.bind(this);

    this.state = {
      active_slide:0,
      showModal: false,
      modalHeader: '',
      modalContent1: '',
      modalContent2: '',
      modalImage1: '',
      modalImage2: '',
    };
  }

  componentWillMount(){
    this.setState({active_slide:0});
  }

  moveSlide(direction='right'){
    let count_slides = landingPageData["new_landing_data"]["slider"].length,
        active_slide = this.state.active_slide,
        next_slide;
    switch (direction) {
      case 'left':
        next_slide = active_slide - 1;
        this.setState({
          active_slide: next_slide >= 0 ? next_slide : count_slides - 1
        });
        break;
      case 'right':
        next_slide = active_slide >= count_slides - 1 ? 0 : active_slide + 1;
        this.setState({
          active_slide: next_slide
        });
        break;
    }
  }

  requestDemo(e){
    e.preventDefault();
    history.push('/book-demo');
  }

  modalRender(clickId) {
    const modalData = landingPageData["features_drilldown"];
    return modalData["features-items"].map((value, key) => {
      if (key === clickId) {
        console.log('check id' + clickId);
        this.setState({
          modalHeader: value["heading"],
          modalContent1: value["text1"],
          modalContent2: value["text2"],
          modalImage1: value["image1"],
          modalImage2: value["image2"],
          showModal: true,
        });
      }
    });
  }

  close() {
    this.setState({ showModal: false, });
  }

  render() {
    const slider = landingPageData["new_landing_data"]["slider"];
    const active_slide = this.state.active_slide;
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigationV2 data={landingPageData} />
          <section className={styles['header']}>
            <div className={styles['container'] + ' ' + styles['girl_bg']}>
              <h1>Connect.<br /> Communicate.<br />Delight.<br /><span className={styles['blue']}>Customers.</span></h1>
              <p>Exceptional field service management software to connect your office, service technicians and customers</p>
              <div className={styles['button-group']}>
                <a href={'/book-demo'} target="_blank" className={'blue-btn ' + styles['btn']}>Book Demo</a>
                <a href={'/signup'} target="_blank" className={'green-btn primary-action-btn ' + styles['btn'] + ' ' + styles['no-credit-needed']}>Try for free</a>
              </div>
            </div>
          </section>
          <Landingv2HeaderCustomerLogos data={landingPageData}/>
          <section className={styles['how_arravy_works']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12}>
                  <h2>Exceptional field service management</h2>
                </Col>
                <Col xs={12} sm={5} className={styles['texts']}>
                  <p>More business, less management</p>
                  <ul className={styles['bus_list']}>
                    <li>
                      <h3>Connect your team</h3>
                      <p>Shared calendars make it easy to schedule work for new crew. Crew members can see their tasks and job details on easy-to-use mobile apps.</p>
                    </li>
                    <li>
                      <h3>Grow your business</h3>
                      <p>Home service companies spend at least 30% of their time in coordination. That's tedious and costs time and money. Save both and focus only on growing your business.</p>
                    </li>
                    <li>
                      <h3>Delight your customers</h3>
                      <p>Your clients can track your crew's arrival times with real-time estimates and email / SMS notifications. Customers love this!</p>
                    </li>
                  </ul>
                </Col>
                <Col xs={12} smPush={1} sm={6}>
                  <div className={styles['movie']}>
                    <iframe src="https://player.vimeo.com/video/229962479" width="100%" height="460" frameborder="0"  allowscriptaccess="always" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>
                  </div>
                </Col>
              </Row>
            </div>
          </section>
          <section className={styles['slideshow']}>
            <div className={styles['container']}>
              <div onClick={(e) => this.moveSlide('left')} className={styles['arrow-left']}><img src="/images/lending/new/Arrow-Left-Icon1.png" /></div>
              {
                slider.map((item, i) => {
                  return (
                      <div key={i} data-active={active_slide === i ? 'true' : 'false'} className={styles['content']}>
                        <img src={item.image} />
                        <p>{item.title}</p>
                        <p className={styles['big-text']}>
                          {item.body}
                        </p>
                        <span className={styles['right-text']}>{item.right_text}</span>
                      </div>
                  );
                })
              }
              <div onClick={(e) => this.moveSlide('right')} className={styles['arrow-right']}>
                <img src="/images/lending/new/Arrow-Left-Icon.png" />
              </div>
            </div>
          </section>
          <section className={styles['advising']}>
            <div className={styles['calendar']}>
              <div className={styles['container']}>
                <Row>
                  <Col xs={12} sm={5} className={styles['texts']}>
                    <h3>Shared Calendars Connect Your Team</h3>
                    <p>Shared calendars make it easy to shedule work for your crew.
                    Crew members can see their tasks and job details on easy-to-use mobile apps.</p>
                    <button onClick={this.modalRender.bind(null, 0)} className={'green-btn primary-action-btn ' + styles['btn']}>Share Your Calendar</button>
                  </Col>
                  <Col xs={12} sm={7}><img className={styles['image']} src="/images/lending/new/calendar.png" /></Col>
                </Row>
              </div>
            </div>

            <div className={styles['uberize']}>
              <div className={styles['container']}>
                <Row>
                  <Col xsHidden xs={12} smPush={2} sm={4}><img className={styles['image']} src="/images/lending/new/uberize.png" /></Col>
                  <Col xs={12} smPush={3} sm={5} className={styles['texts']}>
                    <h3>Uberize Your Business and Delight Your Customers</h3>
                    <p>Your clients can track your crew's arrival times with real-time estimates and email / SMS notifications. As soon as your crew member marks their status as "On our way"</p>
                    <button onClick={this.modalRender.bind(null, 2)} className={'green-btn primary-action-btn ' + styles['btn']}>Uberize Your Business</button>
                  </Col>
                </Row>
              </div>
            </div>

            <div className={styles['track']}>
              <div className={styles['container']}>
                <Row>
                  <Col xs={12} sm={6} className={styles['texts']}>
                    <h3>Track the Status of your Field Teams, Instantly</h3>
                    <p>Ever want a "heads-up" display for your Moving business?
                    Arrive's Activity Feed shows the status of all your jobs as they are happening</p>
                    <button onClick={this.modalRender.bind(null, 5)} className={'green-btn primary-action-btn ' + styles['btn']}>Track Your Status</button>
                  </Col>
                  <Col xsHidden xs={12} sm={6}><img className={styles['image']} src="/images/lending/new/track.png" /></Col>
                </Row>
              </div>
            </div>

            <div className={styles['reviews']}>
              <div className={styles['container']}>
                <Row>
                  <Col xs={12} sm={6}><img className={styles['image']} src="/images/lending/new/reviews.png" /></Col>
                  <Col xs={12}  smPush={1} sm={5} className={styles['texts']}>
                    <h3>Get More and Better Reviews</h3>
                    <p>For home service businesses success or failture is often measured by number of YELP reviews.</p>
                    <button onClick={this.modalRender.bind(null, 3)} className={'green-btn primary-action-btn ' + styles['btn']}>Learn More</button>
                  </Col>
                </Row>
              </div>
            </div>

            <div className={styles['white-paper']}>
              <div className={styles['container']}>
                <Row>
                  <Col xs={12} sm={6} className={styles['texts']}>
                    <h3>White Paper</h3>
                    <p>Your clients can track your crew's arrival times with real-time estimates and email /SMS notifications. As soon as your crew member marks their status as "On our way". the customer is sent an email or SMS.</p>
                    <Link to={'/thesecretsauce'} className={'green-btn primary-action-btn ' + styles['btn']}>Download for Free</Link>
                  </Col>
                  <Col xs={12} sm={6}><img className={styles['image']} src="/images/lending/new/white-paper.png" /></Col>
                </Row>
              </div>
            </div>
          </section>
          <section className={styles['book-demo']}>
            <div className={styles['container']}>
              <div className={styles['texts']}>
                <h2>Start Uberizing Your Business</h2>
                <div className={styles['button-group']}>
                  <a href={'/book-demo'} target="_blank" className={'blue-btn ' + styles['btn']}>Book Demo</a>
                  <a href={'/signup'} target="_blank" className={'green-btn primary-action-btn ' + styles['btn'] + ' ' + styles['no-credit-needed']}>Try for free</a>
              </div>
              </div>
            </div>
          </section>
        </div>
        <Footer2v data={landingPageData} />
        <Modal show={this.state.showModal} onHide={this.close}>
          <Modal.Header closeButton>
            <Modal.Title>
              <h3>{this.state.modalHeader}</h3>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p className={styles.featuresModalsContent}>
              {this.state.modalContent1}
            </p>
            <div className={styles.modalImages}>
              <img className="img-responsive" src={this.state.modalImage1} alt="" />
              {this.state.modalImage2 !== '' &&
              <img className="img-responsive" src={this.state.modalImage2} alt="" />
              }
            </div>
            <p className={styles.featuresModalsContent}>
              {this.state.modalContent2}
            </p>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}
