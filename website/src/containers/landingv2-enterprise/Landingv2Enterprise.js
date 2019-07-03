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

import landingPageData from '../../enterprise-data.json';
import history from '../../configureHistory';
import config from '../../config/config';

const env = config(self).env;
export default class Landingv2Enterprise extends Component {
    constructor(props, context) {
        super(props, context);

        this.navigateToSignup = this.navigateToSignup.bind(this);
    }

    componentDidMount() {
      if (env !== 'Dev') {
        window.Intercom("boot", {
          app_id: "vfdmrett"
        });
      }
    }

    navigateToSignup() {
        history.push('/signup');
    }

    render() {
        return (
            <div>
                <Landingv2Header data={landingPageData} router={this.context.router}/>
                <LandingNavigationV2 data={landingPageData} />
                <Landingv2Slack data={landingPageData} router={this.context.router}/>
                <Landingv2Promo data={landingPageData} />
                <Footer2v data={landingPageData} />
            </div>
        );
    }
}

Landingv2Enterprise.contextTypes = {
    router: PropTypes.object.isRequired
};
