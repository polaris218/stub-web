import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Row, Col } from 'react-bootstrap';


import styles from './bookdemo.module.scss';

import {
  LandingNavigationV2,
  Footer3v
} from '../../components';

import { DefaultHelmet } from '../../helpers';


import landingPageData from '../../landingv2-data.json';


export default class BookDemoAtConference extends Component {
  constructor(props, context) {
    super(props, context);
  }

  //This is hacky. Not recommended to do else-where
  componentWillMount() {
    const script = document.createElement("script");

    script.src = "https://calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
  }

  componentDidMount() {
  }

  render() {
   const navData = {
      "navigation": [
      { "text": "Customers", "href": "/our-customers" },
      { "text": "Blog", "href": "http://blog.arrivy.com", "target": "_blank" },
      { "text": "Enterprise", "href": "/enterprise" }
    ]};

    return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
          <LandingNavigationV2 data={navData} />
          <section className={styles['manage-top']}>
            <div className={styles['container']}>
              <Row>
                <Col xs={12} sm={12} md={5} lg={4}>
                  <div className={styles['text-main']} style={{marginTop:'120px'}}>
                    <h1>Home Delivery World 2019</h1>
                    <p>Meet Arrivy team and get an in-person product tour at our Booth # S24</p>
                  </div>
                </Col>
                <Col xs={12} sm={12} md={7} lg={8}>
                  <div className={styles['calendly-inline-widget-container']}>
                    <div className="calendly-inline-widget" data-url={"https://calendly.com/arrivy-conf/20min"} style={{maxWidth:'1024px', height: "calc(100vh - 155px)", margin: '0 auto'}}/>
                  </div>
                </Col>
              </Row>
            </div>
          </section>
          <Footer3v data={landingPageData} />
      </div>
    </div>
    );
  }
}

BookDemoAtConference.contextTypes = {
  router: PropTypes.object.isRequired
};
