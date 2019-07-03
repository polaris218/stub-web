import React, { Component } from 'react';
import styles from './landing-marketing.module.scss';
import {Footer3v, UserHeader, SubscribeModal} from '../../components/index';
import { DefaultHelmet, parseQueryParams } from '../../helpers/index';
import { Grid, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faAngleDoubleRight} from '@fortawesome/fontawesome-free-solid';
import landingPageData from '../../landingv2-data.json';

export default class LandingMarketing extends Component {
  constructor(props, context) {
    super(props, context);

    this.openSubscribeModal  = this.openSubscribeModal.bind(this);
    this.closeSubscribeModal = this.closeSubscribeModal.bind(this);

    this.state = {
      showSubscribeModal: false,
      company_name: 'there',
      video_url: 'https://player.vimeo.com/video/199490948'
    }
  }

  openSubscribeModal   = () => {
    this.setState({ showSubscribeModal: true   });
  }

  closeSubscribeModal  = () => this.setState({ showSubscribeModal: false  })

  componentDidMount() {
    const query = parseQueryParams(this.props.location.search);
    let company_name = this.state.company_name,
        video_url = this.state.video_url;

    if (query && query.company_name) {
      company_name = query.company_name
    }

    if (query && query.video_url) {
      video_url = query.video_url
    }

    this.setState({ company_name, video_url });
  }

  render() {
    return (
      <div className={styles["full-height"]}>
        <DefaultHelmet/>
        <div className={cx(styles["page-wrap"], styles["marketing-page-wrap"])}>
          <UserHeader router={this.context.router} hideOptions/>
          <SubscribeModal showModal={this.state.showSubscribeModal} closeModal={this.closeSubscribeModal}/>
          <section className={styles["welcome-section"]}>
            <div className={styles.container}>
              <p className={styles.steps}><strong>Step 1:</strong> Hi {this.state.company_name}, watch this demo to learn how Arrivy works</p>
              <div className={styles.videoContainer}>
                <div className={styles.videoWrapper}>
                  <iframe src={this.state.video_url} width="560" height="315" frameBorder="0" allow="autoplay;" allowFullScreen />
                </div>
              </div>
            </div>
          </section>
          <section className={styles.contentSection}>
            <div className={styles.container}>
              <p className={styles.steps}><strong>Step 2:</strong> Talk to Us!</p>
              <Grid>
              <Col md={2}>
                <img className={styles.teampic} src="/images/ash.png" alt="Arrivy Team"/>
              </Col>
              <Col md={10}>
                <p className={styles.stepdetail}>Now that you've watched the demo, find time for a discovery call with Arrivy team. We'll cover your pain-points and possible solutions based on our experience working with businesses like yours.</p>
                <Button onClick={this.openSubscribeModal} className={cx(styles.btn, styles["btn-blue"])}>Learn More <FontAwesomeIcon icon={faAngleDoubleRight} /></Button>
              </Col>
              </Grid>
            </div>
          </section>
          <section className={styles["case-study-section"]}>
            <div className={styles.container}>
              <h4>Outcomes from other business who spoke with us in past</h4>&nbsp;
              <div className={styles.videoContainer}>
                <div className={styles.videoWrapper}>
                  <iframe src="https://www.youtube.com/embed/-0kXYANBndc" width="560" height="315" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                </div>
              </div>
            </div>
          </section>
          <Footer3v data={landingPageData}/>
        </div>
      </div>
    );
  }
}
