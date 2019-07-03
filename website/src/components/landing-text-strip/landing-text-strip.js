import styles from './landing-text-strip.module.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';

class LandingTextStrip extends Component {

  getBackground(data) {
    if (data.image) {
      return {
        backgroundImage: `url(${data.image})`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover'
      };
    } else {
      return {};
    }
  }

  render() {
    const { data, themeInvert } = this.props;
    return (
      <section className={themeInvert ? styles['textstrip-invert'] : styles.textstrip } style={this.getBackground(data)}>
        <div className={themeInvert ? styles['features-flex-container-invert'] : styles['features-flex-container']}>
          {!themeInvert
            ? <div>
                <div className={styles['main-text']}>{ data.text }</div>
                <div className={styles['contacts-text']}>{ data.contacts }</div>
              </div>
            : <div className={styles['container-invert']}>
                <div className={styles['text-invert']}>
                  <h1 className={styles['main-text']}>{ data.text }</h1>
                  <p className={styles['sub-text']}>{ data.subtext }</p>
                </div>
                <Link to={'/signup'} className={styles['textstrip-btn']}>{data.button.text}</Link>
              </div>
          }
        </div>
      </section>
    );
  }
}

LandingTextStrip.propTypes = {
  navigateToSignup: PropTypes.func,
  data: PropTypes.object.isRequired,
  themeInvert: PropTypes.bool
};

export default LandingTextStrip;
