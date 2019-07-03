import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';
import styles from './movingv3-components.module.scss';

export default class WhitePaper extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    return (
      <div className={styles.whitePaperPresentationContainer}>
        <Grid>
          <Row>
            <Col md={8}>
              <div className={styles.sharedCalendarDescription}>
                <h2>
                  {this.props.data.title}
                </h2>
                <p>
                  <img src={this.props.data.icon} alt="" />
                  {this.props.data.description}
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className={styles.sharedCalenderPresentation}>
                <img src={this.props.data.image} alt="" className="img-responsive" />
                <span>
                  <a href={this.props.data.button_url}>{this.props.data.button}</a>
                </span>
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

}

WhitePaper.PropTypes = {
  data: PropTypes.object.isRequired
};
