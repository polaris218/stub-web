import React, { Component } from 'react';
import styles from './estimate-widget.module.scss';
import { Row, Col } from 'react-bootstrap';

export default class EstimateWidget extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    const { status, estimate, unscheduled, profile } = this.props;
    let displayEstimate = false;
    if ((status.latestStatus === 'ENROUTE' || status.latestStatus === 'ARRIVING') && estimate !== 'Not available') {
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

    let color = '';
    if (profile && profile.show_brand_color && profile.color) {
      color = profile.color;
    }

    return (
      <div className={styles.estimateWidgetContainer} style={{ backgroundColor: color }}>
        <Row>
          <Col md={6} sm={6} xs={6}>
            <h2 className={styles.latestStatusString}>
              { statusString }
            </h2>
          </Col>
          <Col md={6} sm={6} xs={6}>
            { displayEstimate ? <h2>{estimate}</h2> : null }
          </Col>
        </Row>
      </div>
    );
  }

}
