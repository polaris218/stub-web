import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';
import styles from './movingv3-components.module.scss';

export default class ReviewsPresentation extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    return (
      <div className={styles.reviewsPresentationContainer}>
        <Grid>
          <Row>
            <Col md={6}>
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
            <Col md={6}>
              <div className={styles.sharedCalenderPresentation}>
                <img src={this.props.data.image} alt="" className="img-responsive pull-right" />
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

}

ReviewsPresentation.PropTypes = {
  data: PropTypes.object.isRequired
};
