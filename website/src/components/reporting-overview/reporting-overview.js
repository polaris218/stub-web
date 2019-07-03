import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './reporting-overview.module.scss';
import PieChart from '../reporting-pie-chart/pie-chart';
import CountBlocks from '../reporting-count-blocks/count-blocks';
import { Grid, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';

export default class ReportingOverview extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewType: 'monthly'
    };
    this.updateReportDuration = this.updateReportDuration.bind(this);
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      viewType: e.target.value
    });
  }

  render() {
    let taskOverviewInterval = null;
    if (this.state.viewType === 'daily') {
      taskOverviewInterval = 'today';
    } else if (this.state.viewType === 'weekly') {
      taskOverviewInterval = 'in last 7 days';
    } else {
      taskOverviewInterval = 'in last 30 days';
    }
    const viewTypeLocal = this.state.viewType;
    return (
      <div className={styles.reportingOverviewContainer}>
        <div className={styles.reportingBlockContainer}>
          <div className={styles.reportingBlockHeader}>
            <Row>
              <Col md={10} sm={6} xs={12}>
                <h3>
                  Tasks
                  &nbsp;<small>
                  { taskOverviewInterval }
                </small>
                </h3>
              </Col>
              <Col md={2} sm={6} xs={12} className={styles.customSelectElement}>
                <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue="monthly" componentClass="select">
                  <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                  <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                  <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                </FormControl>
              </Col>
            </Row>
          </div>
          <div className={styles.reportingBlockBody}>
            <Grid>
              <Row>
                <Col md={4} sm={6} xs={12}>
                  <PieChart viewType={viewTypeLocal} profile={this.props.profile} />
                </Col>
                <Col md={8} sm={6} xs={12}>
                  <CountBlocks viewType={viewTypeLocal} profile={this.props.profile} />
                </Col>
              </Row>
            </Grid>
          </div>
        </div>
      </div>
    );
  }
}

ReportingOverview.propTypes = {
  getProfile: PropTypes.func,
  profile: PropTypes.object
};
