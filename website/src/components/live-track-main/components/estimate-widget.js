import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Col, Image } from 'react-bootstrap';
import styles from './estimate-widget.module.scss';

export default class EstimateWidget extends Component {
  constructor(props) {
    super(props);
  }


  render() {
    const { status, estimate, unscheduled } = this.props;
    let displayEstimate = false;
    if (status.latestStatus === 'ENROUTE' || status.latestStatus === 'ARRIVING') {
      displayEstimate = true;
    }

    let statusString = status.latestStatus;
    if (typeof status.latestStatusTitle !== 'undefined' && status.latestStatusTitle && status.latestStatusTitle !== '' && status.latestStatusTitle !== null) {
      statusString = status.latestStatusTitle;
    }

    if (status.latestStatus === 'NOTSTARTED') {
      if (unscheduled) {
        statusString = 'UNSCHEDULED';
      } else {
        statusString = 'SCHEDULED';
      }
    } else if (status.latestStatus === 'AUTO_START') {
      statusString = 'STARTED';
    } else if (status.latestStatus === 'AUTO_COMPLETE') {
      statusString = 'COMPLETED';
    }

    return (
      <div id="estimateWidget" className={styles['estimate-section']}>
        <Grid>
          <Col className={styles['estimate-col']} xs={6}>
            <h3>Status: {statusString}</h3>
          </Col>
          <Col className={styles['estimate-col']} xs={6}>
            { displayEstimate ? <h3>Estimate: {estimate}</h3> : null }
          </Col>
        </Grid>
      </div>
    );
  }
}

EstimateWidget.propTypes = {
  status: PropTypes.object.isRequired,
  estimate: PropTypes.string.isRequired,
  unscheduled: PropTypes.bool
};
