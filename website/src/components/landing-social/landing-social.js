import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Col, Row } from 'react-bootstrap';
import classNames from 'classnames';
import styles from './landing-social.module.scss';

class LandingSocial extends Component {
  renderSocialLinks(socialLinks) {
    return socialLinks.map((social) => {
      const { type, href, title } = social;

      return (
        <a key={title} className={classNames(styles['social-icons-icon'], styles[`social-icons-icon-${type}`])} title={title} href={href} target="_blank">
          <i className={classNames('fa', `fa-${type}`)} />
        </a>
      );
    });
  }

  render() {
    const { data } = this.props;
    const social = data && data.social;

    return (
      <section className={styles.social}>
        <Grid className={styles['social-container']}>
          <Row className={styles['social-header']}>
              <h3 className={styles['social-header-text']}>FOLLOW US</h3>
              { this.renderSocialLinks(social) }
          </Row>
        </Grid>
      </section>
    );
  }
}

LandingSocial.propTypes = {
  data: PropTypes.object.isRequired
};

export default LandingSocial;
