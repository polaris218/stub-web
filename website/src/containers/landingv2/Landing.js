import React, { Component } from 'react';
import PropTypes from 'prop-types';

import {
  Landingv2Header,
  LandingNavigationV2,
  Landingv2Promo,
  Landingv2Reviews,
  Landingv2Slack,
  Footer2v
} from '../../components';
import config from '../../config/config';
import landingPageData from '../../landingv2-data.json';

const env = config(self).env;

export default class Landingv2 extends Component {
  constructor(props, context) {
    super(props, context);

    this.navigateToSignup = this.navigateToSignup.bind(this);
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
    return (
      <div>
        <Landingv2Header data={landingPageData} router={this.context.router}/>
        <LandingNavigationV2 data={landingPageData} />
        <Landingv2Promo data={landingPageData} />
        <Landingv2Reviews data={landingPageData} router={this.context.router}/>
        {/*<Landingv2Slack data={landingPageData} router={this.context.router}/>*/}
        <Footer2v data={landingPageData} />
      </div>
    );
  }
}

Landingv2.contextTypes = {
  router: PropTypes.object.isRequired
};