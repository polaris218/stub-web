import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import cx from 'classnames';

import { Grid, Button, Glyphicon, Modal, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import config from '../../config/config';


import styles from './bookdemo.module.scss';

import {
  Landingv2Header,
  LandingNavigationV2,
  Landingv2Reviews,
  LandingHeader,
  Footer3v
} from '../../components';

import { DefaultHelmet } from '../../helpers';


import landingPageData from '../../landingv2-data.json';
const env = config(self).env;

export default class Landingv2 extends Component {
  constructor(props, context) {
    super(props, context);

    this.navigateToSignup = this.navigateToSignup.bind(this);
  }

  //This is hacky. Not recommended to do else-where
  componentWillMount() {
    const script = document.createElement("script");

    script.src = "https://calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }

  componentDidMount() {
    if(env !== 'Dev') {
      window.Intercom("boot", {
        app_id: "vfdmrett"
      });
    }
  }

  navigateToSignup() {
    this.context.router.history.push('/signup');
  }

  render() {
    landingPageData["promo-page"]["whitepaper"] = undefined;
    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigationV2 data={landingPageData} />
          <section className={styles['manage-top']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12} sm={12} md={5} lg={4}>
                  <div className={styles['text-main']}>
                    <h1>Get Started in Minutes</h1>
                    <p>Arrivy connects businesses and their customers in real-time and engages them through the last mile</p>
                  </div>
                </Col>
                <Col xs={12} sm={12} md={7} lg={8}>
                  <div className={styles['calendly-inline-widget-container']}>
                    <div className="calendly-inline-widget" data-url={"https://calendly.com/arrivy/30min"} style={{maxWidth:'1024px', height: "calc(100vh - 155px)", margin: '0 auto'}}/>
                  </div>
                </Col>
              </Row>
            </div>
          </section>
          <Landingv2Reviews data={landingPageData} router={this.context.router}/>
          <Footer3v data={landingPageData} />
      </div>
    </div>
    );
  }
}

Landingv2.contextTypes = {
  router: PropTypes.object.isRequired
};
