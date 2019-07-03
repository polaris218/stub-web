import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Row, Col } from 'react-bootstrap';
import styles from './movingv3-components.module.scss';

export default class Uberize extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    return (
      <div className={styles.uberizeBusinessContainer}>
        <Row>
          <Col md={6}>
            <div className={styles.uberizeDescription}>
              <h2>
                {this.props.data.title}
                <br />
                {this.props.data.subtitle}
              </h2>
              <p>
                <img src={this.props.data.icon} alt="" />
                {this.props.data.description}
              </p>
            </div>
          </Col>
          <Col md={6} className="text-center">
            <img src={this.props.data.image} alt="" />
          </Col>
        </Row>
      </div>
    );
  }

}

Uberize.PropTypes = {
  data: PropTypes.object.isRequired
};
