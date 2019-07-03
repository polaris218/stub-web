import React, { Component } from 'react';
import PropTypes from 'prop-types';
import config from '../../config/config';
import {
    Landingv2Header,
    LandingNavigationV2,
    Landingv2Promo,
    Landingv2Reviews,
    Landingv2Slack,
    Footer2v
} from '../../components';

import landingPageData from '../../moving-data.json';
import history from '../../configureHistory';
const env = config(self).env;

export default class Landingv2Moving extends Component {
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
                <Landingv2Promo data={landingPageData} />
                <Landingv2Reviews data={landingPageData} router={this.context.router}/>
                {/*<Landingv2Slack data={landingPageData} router={this.context.router}/>*/}
                <Footer2v data={landingPageData} />
            </div>
        );
    }
}

Landingv2Moving.contextTypes = {
    router: PropTypes.object.isRequired
};
