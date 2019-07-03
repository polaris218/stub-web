import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './pricing.module.scss';


import {
	LandingNavigation,
	LandingHeader,
	LandingFormCalculator,
	LandingCalculator,
	LandingPricingFeatures,
	LandingFAQ,
	Footer3v,
	FooterConfiguration,
	LandingPricingColumns,
	LandingTextStrip,
	LandingImageFeatures,
  LandingNavigationV2
} from '../../components';

import landingPageData, { pricing } from '../../landingv2-data.json';

import { DefaultHelmet } from '../../helpers';

class Pricing extends Component {
	constructor(props) {
		super(props);
		this.nevigateToSignUp = this.nevigateToSignUp.bind(this);
	}

	nevigateToSignUp() {
		window.location.href = landingPageData.textSection2.button.href;
	}

	render() {
		return (
      <div className={styles['full-height']}>
        <DefaultHelmet/>
        <div className={styles['page-wrap']}>
  				<LandingNavigationV2 data={landingPageData} />
  				<LandingHeader image={pricing.header.image} header={pricing.header.header} description={pricing.header.description}/>
  				<LandingPricingColumns plans={ pricing.plans }/>
  				<LandingTextStrip data={landingPageData.textSection2} navigateToSignup={this.nevigateToSignUp} themeInvert/>
  				<LandingImageFeatures data={landingPageData}/>
          <Footer3v data={landingPageData} />
  			</div>
      </div>
		);
	}
}

export default Pricing;