import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './task-duration-report.module.scss';
import { Grid, Row, Col, FormControl } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faBan, faClock, faListUl, faTasks, faRoad, faSpinner } from '@fortawesome/fontawesome-free-solid';
import cx from 'classnames';
import { get_report } from '../../actions';
import ReportingAnalyticsCards from '../reporting-analytic-cards/reporting-analytic-cards';
import ReportingGraph from '../reporting-graph/reporting-graph';
import Keen from 'keen-js';

export default class TaskDurationReport extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingAnalytics: false,
      viewType: 'monthly',
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      taskSummaryData: null,
      taskTypeData: null,
      pieChartError: null,
      pieChartData: null,
      barChartError: null,
      barChartData: null,
      taskCompletionColors:['#4472C4','#ED7D31','#A5A5A5','#FFC000','#00bbde'],
      taskCompletionTimesColors:['#2E75B6']
    };

    this.updateReportDuration = this.updateReportDuration.bind(this);
    this.generateAnalyticsMultipleForTaskCompletionTimes = this.generateAnalyticsMultipleForTaskCompletionTimes.bind(this);
  }

  componentDidMount() {
    this.generateAnalyticsMultipleForTaskCompletionTimes();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.group_ids, nextProps.group_ids)) {
      this.setState({
          group_ids: nextProps.group_ids,
      }, () => {this.generateAnalyticsMultipleForTaskCompletionTimes();})
    }
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      viewType: e.target.value
    }, () => { this.generateAnalyticsMultipleForTaskCompletionTimes();  });
  }

  generateAnalyticsMultipleForTaskCompletionTimes() {
    this.setState({
      loadingAnalytics: true
    });

    let timeFrame = this.state.monthlyInterval;
    if (this.state.viewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (this.state.viewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }

    const group_ids = this.props.scheduler_group_id ? this.props.scheduler_group_id : this.state.group_ids ? this.state.group_ids.join(',') : '';

      get_report({reportName: 'task_completion_percentage', params: {timeframe: timeFrame, group_ids}})
      .then((res) => {
        const chartDataset = new Keen.Dataset();
        if(res.result.length > 0 ){
            let response = res.result;
            const earlyOrOnTime = (response[1] +response[2]+response[3]);
            const lessThanThirty = (response[4]);
            const lessThanOneHour = (response[5]+response[6]);
            const lessThanTwoHour = (response[7]+response[8]);
            const greaterThanTwoHour = (response[9]+response[10]+response[11]);


            chartDataset.set(['early or on-time', 'early or on-time'], earlyOrOnTime);
            chartDataset.set(['<30min late', '<30min late'], lessThanThirty);
            chartDataset.set(['<1 hr late', '<1 hr late'], lessThanOneHour);
            chartDataset.set(['<2 hr late', '<2 hr late'], lessThanTwoHour);
            chartDataset.set(['>2hr late', '>2hr late'], greaterThanTwoHour);

}
        this.setState({
          loadingAnalytics: false,
          pieChartData: chartDataset,
          pieChartError: null
        });
      })
      .catch(err => {
        this.setState({
          pieChartError: err,
          pieChartData: null
        });
      });
  }


  render() {
    return (
      <div className={styles.analyticsBlocksContainer}>
        <div className={styles.analyticsBlocksHead}>
          <Row>
            <Col md={8} sm={5} xs={10}>
              <h3>
                Task Duration Report
              </h3>
            </Col>
            <Col md={1} sm={1} xs={2}>
              {this.state.loadingAnalytics &&
              <div className={cx('text-right', styles.loadingSpinner)}>
                <FontAwesomeIcon icon={faSpinner} spin />
              </div>
              }
            </Col>
            <Col md={3} sm={6} xs={12} className={styles.customSelectElement}>
              <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue="monthly" componentClass="select">
                <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
              </FormControl>
            </Col>
          </Row>
        </div>
        <div className={styles.analyticsBlocksBody}>
          <Grid>
            <Row>
              <Col md={12}>
              <div className={styles.textCenter}>
                <h4>
                    Task Completion%
                </h4>
                </div>
                <ReportingGraph colors={this.state.taskCompletionColors} type="pie" isStacked={false} title="On-Time Chart" data={this.state.pieChartData} error={this.state.pieChartError} chartId="TaskDurationReportPieChart"/>
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

TaskDurationReport.propTypes = {
  profile: PropTypes.object
};
