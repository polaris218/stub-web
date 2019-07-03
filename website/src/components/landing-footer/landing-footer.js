import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';
import styles from './landing-footer.module.scss';

class LandingFooter extends Component {
  render() {
    const { data } = this.props;
    const copyright = data.footer && data.footer.copyright;

    return (
      <footer className={styles.footer}>
        <Grid className={styles['footer-container']}>
          <Row className={styles['footer-wrapper']}>
            <Col sm={12}>
              { copyright && <p>{ copyright }</p> }
              <div className={styles['footer-badges']}>
                <a href="https://play.google.com/store/apps/details?id=com.muhio.haramapp.android">
                  <img className={styles['footer-storage-badge']} src="landing/assets/haramtracker/google_badge.png" />
                </a>
                <a href="https://itunes.apple.com/app/haramtracker/id1127800087?l=vi&mt=8">
                <img className={styles['footer-storage-badge']} src="landing/assets/haramtracker/appstore_badge.png" />
                </a>
              </div>
            </Col>
          </Row>
        </Grid>
      </footer>
    );
  }
}

LandingFooter.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingFooter;
