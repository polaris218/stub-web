import React, { Component } from 'react';
import styles from './slim-footer.module.scss';
import { Grid, Row, Col } from 'react-bootstrap';

export default class SlimFooter extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div className={styles.slimFooterContainer}>
        <Grid>
          <Row>
            <Col md={6}>
              <p><img className={styles.logoIconFooter} src="/images/logo-icon.png" alt=""/> &copy; Arrivy, Inc. - All Rights Reserved</p>
            </Col>
            <Col md={6}>
              <ul className={styles.footerMenu}>
                <li>
                  <a href="/pricing">Pricing</a>
                </li>
                <li>
                  <a href="/docs">Developer</a>
                </li>
                <li>
                  <a href="mailto:info@arrivy.com">Contact</a>
                </li>
                <li>
                  <a href="/terms">Terms of Service</a>
                </li>
              </ul>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
