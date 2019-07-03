import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Col, Image } from 'react-bootstrap';
import styles from './company-profile.module.scss';

export default class CompanyProfile extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const { profile } = this.props;

    return (
      <div className={styles['company-section']} id="profileBranding">
        <Grid>
          <div className={styles['powered_by_arrivy']}>
            <a href="https://arrivy.com" target="_blank">
              <Image src={'/images/powered_by_arrivy.png'} responsive />
            </a>
          </div>
          <Col className={styles['company-col']} sm={2}>
            <div className={styles['account-image']}>
              <Image src={profile.image_path || '/images/user.png'} thumbnail responsive />
            </div>
          </Col>
          <Col className={styles['company-col']} sm={10}>
            <h2>{profile.fullname}</h2>
            <p><i>{profile.intro}</i></p>
              { profile.address ? <p className={styles['details-field']}>{profile.address}</p> : null }
              { profile.mobile_number ? <p className={styles['details-field']}>Phone: {profile.mobile_number}</p> : null }
              { profile.support_email ? <p className={styles['details-field']}>Email: {profile.support_email}</p> : null }
          </Col>
        </Grid>
      </div>
    );
  }
}

CompanyProfile.propTypes = {
  profile: PropTypes.object.isRequired
};
