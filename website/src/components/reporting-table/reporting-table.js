import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './reporting-table.module.scss';
import { Row, Col, FormControl, ControlLabel, Table } from 'react-bootstrap';
import Keen from 'keen-js';
import moment from 'moment';
import cx from 'classnames';

export default class ReportingTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewType: 'monthly',
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      profile: null,
      analytics: null
    };
    this.updateReportDuration = this.updateReportDuration.bind(this);
    this.renderTableAnalytics = this.renderTableAnalytics.bind(this);
  }

  componentDidMount() {
    this.props.getProfile().then((res) => {
      this.setState({
        profile: JSON.parse(res)
      }, function () { this.getMonthlyReports(); });
    }).catch((err) => {
      console.log(err);
    });
  }

  getMonthlyReports(viewType = this.state.viewType) {
    const client = new Keen({
      projectId: '5a47257446e0fb00018e2cf7',
      readKey: '55FB4DAEB1012EF9273FC290916E6321BDD1B76A13D11BDEDB73766B3B8106612F5E98F9436BFAD669E26E60BABABA2FA2053F9B9211572AFF38F70DD2FECB7EB504A13AD1013C387781B58E0336BC64A0E12616C27F8333D3762B8BB15DF89A'
    });

    let timeFrame = this.state.monthlyInterval;
    if (viewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else if (viewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }

    client
      .query('multi_analysis', {
        event_collection: 'Arrivy Datastore',
        analyses: {
          'Travel Time': {
            analysis_type: 'sum',
            target_property: 'travel_time'
          },
          'Task Time': {
            analysis_type: 'sum',
            target_property: 'task_time'
          },
          'No of Jobs': {
            analysis_type: 'count',
            filters: [{"operator":"eq","property_name":"event_type","property_value":"Task Completed"}]
          }
        },
        timeframe: timeFrame,
        interval: 'daily',
        filters: [{ 'operator':'eq', 'property_name':'owner', 'property_value':5629499534213120 }],
      })
      .then(res => {
        this.setState({
          analytics: res
        });
      })
      .catch(err => {
        console.log(err);
      });
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      viewType: e.target.value
    }, function () { this.getMonthlyReports(); });
  }

  renderTableAnalytics() {
    if (this.state.analytics === null) {
      return (
        <tr>
          <td colSpan={5}>
            <p className="text-center">
              No data available at the moment.
            </p>
          </td>
        </tr>
      );
    } else {
      const analyticsToRender = { ...this.state.analytics };
      const renderedAnalytics = analyticsToRender.result.map((analytics) => {
        const avgTimePerJob = parseInt((analytics.value['Task Time']), 10) / parseInt((analytics.value['No of Jobs']), 10);
        return (
          <tr>
            <td>
              {moment(analytics.timeframe.start).format('DD MMM, YYYY')}
            </td>
            <td>
              {analytics.value['Task Time']}
            </td>
            <td>
              {analytics.value['Travel Time']}
            </td>
            <td>
              {analytics.value['No of Jobs']}
            </td>
            <td>
              {avgTimePerJob ? avgTimePerJob : 0}
            </td>
          </tr>
        );
      });
      return renderedAnalytics;
    }
  }

  render() {
    return (
      <div className={styles.reportingTableContainer}>
        <div className={styles.reportingBlock}>
          <div className={styles.reportingBlockHeader}>
            <Row>
              <Col md={6} sm={12} xs={12}>
                <Row>
                  <Col md={3} sm={6}>
                    <ControlLabel className={styles.controlLabelCustom}>Date Range</ControlLabel>
                  </Col>
                  <Col md={4} sm={6}>
                    <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue="monthly" componentClass="select">
                      <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                      <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                      <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                    </FormControl>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <div className={cx(styles.reportingBlockBody, styles.barGraphContainer)}>
            <Table striped bordered condensed hover>
              <thead>
              <tr>
                <th>
                  Date
                </th>
                <th>
                  Task Time
                </th>
                <th>
                  Travel Time
                </th>
                <th>
                  No. of Jobs
                </th>
                <th>
                  Task Time/Job
                </th>
              </tr>
              </thead>
              <tbody>
              {this.renderTableAnalytics()}
              </tbody>
            </Table>
          </div>
        </div>
      </div>
    );
  }
}

ReportingTable.propTypes = {
  getProfile: PropTypes.func
};
