import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-bootstrap';
import styles from './landing-explanation.module.scss';

class LandingExplanation extends Component {
  renderFeatures(features) {
    return features.map((feature, i) => {
      const { heading, text, type, image } = feature;

      return (
        <div key={heading + '-' + i} className={styles['features-flex-item']}>
          <div className={styles['features-flex-item-col-2']}>
            <div>
              <Image src={image} className={styles['features-flex-image']} />
              <h3 className={styles['features-flex-item-heading']}>{ heading }</h3>
              <p className={styles['features-flex-item-text']}>{ text }</p>
              { type === 'mobile' ?
                <div style={{ paddingTop: '10px', textAlign:'center' }}><a href={"https://play.google.com/store/apps/details?id=com.insac.can.pinthatpoint&hl=en"}><img className={styles['footer-storage-badge']} src="images/google_badge.png" /></a>
                <a href={"https://itunes.apple.com/us/app/pinthatpoint-go/id1177367972?ls=1&mt=8"}><img className={styles['footer-storage-badge']} src="images/appstore_badge.png" /></a></div>
                : null
              }
            </div>
          </div>
        </div>
      );
    });
  }

  render() {
    const { data } = this.props;
    const explanation = data && data.explanation;


    return (
      <div>
        <section className={styles.features} id="features-1">
          <div className={styles['features-flex-item-intro']}>{explanation.intro}</div>
          <div className={styles['features-flex-container']}>
            { explanation && this.renderFeatures(explanation.items) }
          </div>
        </section>
      </div>
    );
  }
}

LandingExplanation.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingExplanation;
