import React, { Component } from 'react';
import { Grid, Col, Row, Image } from 'react-bootstrap';
import styles from './company-profile.module.scss';

export default class CompanyProfile extends Component {
  constructor(props) {
    super(props);
  }


  render() {

    return (
      <div className={styles['company-section']} id="profileBranding">
        <Grid>
          <Row>
            <Col md={12} className="text-center">
              <Image src={'/images/enterprise/mila_logo.png'} className={styles.companyLogo} responsive />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
