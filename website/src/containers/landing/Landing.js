import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Helmet from "react-helmet";

import {
  LandingAdditionalFeatures,
  LandingNavigation,
  LandingCarousel,
  LandingCustomersFeedback,
  LandingFeatures,
  LandingImageFeatures,
  LandingPlatformUsers,
  LandingTextStrip,
  LandingExplanation,
  FooterComponent,
  FooterConfiguration,
  SubscribeModal
} from '../../components';
import landingPageData from '../../landing-page.json';
import { DefaultHelmet } from '../../helpers';
import history from '../../configureHistory';

export default class Landing extends Component {
  constructor(props, context) {
    super(props, context);

    this.navigateToSignup = this.navigateToSignup.bind(this);

    this.openSubscribeModal  = this.openSubscribeModal.bind(this);
    this.closeSubscribeModal = this.closeSubscribeModal.bind(this);
  }

  state = {
    showSubscribeModal: false
  }
  openSubscribeModal   = () => {
    this.setState({ showSubscribeModal: true   });
  }
  closeSubscribeModal  = () => this.setState({ showSubscribeModal: false  })

  navigateToSignup() {
    history.push('/signup');
  }

  render() {
    return (
      <div>
        <DefaultHelmet/>
        <Helmet
          script={[
              {src: "/dist/libs/drift.js", type: "text/javascript"}
          ]}
        />
        <LandingNavigation data={landingPageData} />
        <LandingCarousel data={landingPageData} navigateToSignup={this.navigateToSignup} openSubscribeModal={this.openSubscribeModal} />
        <LandingExplanation data={landingPageData} />
        <LandingImageFeatures data={landingPageData} />
        <LandingFeatures data={landingPageData} />
        <LandingPlatformUsers data={landingPageData} />
        <LandingCustomersFeedback data={landingPageData} />
        <LandingTextStrip data={landingPageData.textSection1} />
        <LandingAdditionalFeatures />
        <LandingTextStrip data={landingPageData.textSection2} themeInvert navigateToSignup={this.navigateToSignup} />
        <FooterComponent links={FooterConfiguration}/>
        <SubscribeModal showModal={this.state.showSubscribeModal} closeModal={this.closeSubscribeModal}/>
      </div>
    );
  }
}

Landing.contextTypes = {
  router: PropTypes.object.isRequired
};
