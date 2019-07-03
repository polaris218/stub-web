import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid } from 'react-bootstrap';
import styles from './landing-platform-users.module.scss';

class LandingPlatformUsers extends Component {
  renderFeatures(features) {
    return features.map((feature) => {
      const { heading, text, image } = feature;

      return (
        <div key={heading} className={styles['features-flex-item']} >
            <div className={styles['features-flex-item-container']}>
            <div className={styles['features-flex-text-container']}>
              <div className={styles['features-flex-text']}>
                <p className={styles['features-flex-item-text']} dangerouslySetInnerHTML={{ __html: text }}></p>
                <div className={styles['features-flex-item-logo-container']}>
                  <img className={styles['features-flex-item-image']} src={image}/>
                  <p className={styles['features-flex-item-heading']}>--{ heading }</p>
                </div>
              </div>
            </div>
            </div>
        </div>
      );
    });
  }

  render() {
    const { data } = this.props;
    const paltformUsers = data && data.paltformUsers;

    return (
      <section className={styles.features} id="features-4">
        <div className={styles['features-flex-item-intro']}>{paltformUsers.intro}</div>
        <div className={styles['features-flex-container']}>
          { paltformUsers && this.renderFeatures(paltformUsers.items) }
        </div>
      </section>
    );
  }
}

LandingPlatformUsers.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingPlatformUsers;
