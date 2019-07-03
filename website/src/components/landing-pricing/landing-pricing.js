import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './landing-pricing.module.scss';

class LandingPricing extends Component {
  renderFeatures(features) {
    return features.map((feature) => {
      const { heading, text, image } = feature;

      return (
        <div key={heading} className={styles['features-flex-item']}>
          <img className={styles['features-flex-item-image']} src={image} />
          <div>
            <h3 className={styles['features-flex-item-heading']}>{ heading }</h3>
            <p className={styles['features-flex-item-text']}>{ text }</p>
          </div>
        </div>
      );
    });
  }

  changeValue(e){
    console.log(e);
  }

  render() {
    const { data } = this.props;
    const features = data && data.features;

    return (
      <section className={styles.features} id="features-1">
        <div className={styles.featuresIntro}>{features.intro}</div>
        <div className={styles['features-flex-container']}>
          { features && this.renderFeatures(features.items) }
        </div>
      </section>
    );
  }
}

LandingPricing.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingPricing;
