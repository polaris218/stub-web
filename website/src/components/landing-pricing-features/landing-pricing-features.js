import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';
import styles from './landing-pricing-features.module.scss';

class LandingPricingFeatures extends Component {
  renderFeatures(features) {
    return features.map((feature, idx) => {
      const {iconClass, label, helpText, price} = feature;
      return (<li key={label} className={styles['mb20']}>
                {/*TBD: uncomment and add icons
                <i className={iconClass}></i> */}
                <div className={styles['text']}>
                  <h2>{label}</h2>
                  {helpText && (<span className={styles['help-text']}>{helpText}</span>)}
                  {price && (<p className={styles['price-text']}>{price}</p>)}
                </div>
              </li>)
    });
  }
  
  render() {
    const {features, addons} = this.props;
    return (
      <section className={styles.features}>
        <Grid>
          <Row>
            <Col sm={12} md={6}>
              <h2 className={styles['feature-header']}>What's included</h2>
              <ul className="list-unstyled">
                {this.renderFeatures(features)}
              </ul>
            </Col>
            <Col sm={12} md={6}>
              <h2 className={styles['feature-header']}>Extras</h2>
              <ul className="list-unstyled">
                {this.renderFeatures(addons)}
              </ul>
            </Col>
          </Row>
        </Grid>
      </section>
    );
  }
}

LandingPricingFeatures.propTypes = {
  features: PropTypes.array.isRequired,
  addons: PropTypes.array.isRequired
};

export default LandingPricingFeatures;
