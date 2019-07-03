import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './on-time-performance-chart.module.scss';
import { Grid, Row, Col, FormControl } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner, faCalendarAlt } from '@fortawesome/fontawesome-free-solid';
import cx from 'classnames';
import { get_report } from '../../actions';
import ReportingAnalyticsCards from '../reporting-analytic-cards/reporting-analytic-cards';
import ReportingGraph from '../reporting-graph/reporting-graph';
import Keen from 'keen-js';
import TimeFilterInReports from "../time-filter-in-reports/time-filter-in-reports";
import moment from "moment";

export default class OnTimePerformanceChart extends Component {
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
      hideDialog: true,
      startDate:'',
			endDate:'',
      inputValueStartDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      inputValueEndDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      lowerBound:'',
      upperBound:'',
      withTimeWindowColors:['#548235','#FF9933', '#FF5050','#e17e45','#e25822'],
      WithoutTimeWindowColors:['#548235','#fdc70f', '#f28f1f','#ec6224','#e42426']
    };

    this.updateReportDuration = this.updateReportDuration.bind(this);
    this.generateAnalyticsMultipleForTasksWithTimeWindow = this.generateAnalyticsMultipleForTasksWithTimeWindow.bind(this);
    this.generateAnalyticsMultipleForTasksWithoutTimeWindow = this.generateAnalyticsMultipleForTasksWithoutTimeWindow.bind(this);
    this.onHide =  this.onHide.bind(this);
    // this.isSetstate = this.isSetstate.bind(this);
    this.runCall = this.runCall.bind(this);
    this.getDates = this.getDates.bind(this);
  }

  componentDidMount() {
    this.generateAnalyticsMultipleForTasksWithTimeWindow();
    this.generateAnalyticsMultipleForTasksWithoutTimeWindow();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.group_ids, nextProps.group_ids)) {
      this.setState({
          group_ids: nextProps.group_ids,
      }, () => {
        this.generateAnalyticsMultipleForTasksWithTimeWindow();
        this.generateAnalyticsMultipleForTasksWithoutTimeWindow();
      })
    }
  }

  getDates(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.runCall());
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.value === 'custom'){
      this.setState({
      viewType: e.target.value,
      hideDialog:false,
    });
    }
    else{
    this.setState({
      viewType: e.target.value,
      hideDialog:true,
    });
   }
  }


  generateAnalyticsMultipleForTasksWithTimeWindow() {
    this.setState({
      loadingAnalytics: true
    });
    let sum;
    let timeFrame = this.state.monthlyInterval;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;
    if (this.state.viewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (this.state.viewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }

    const group_ids = this.props.scheduler_group_id ? this.props.scheduler_group_id : this.state.group_ids ? this.state.group_ids.join(',') : '';

    if (!this.state.hideDialog){
      startDate = this.state.startDate;
      endDate = this.state.endDate;
       timeFrame = '';
    } else if(timeFrame === 'this_24_hours') {
      startDate = "";
      endDate = "";
    } else if (timeFrame === 'this_7_days'){
      startDate = "";
      endDate = "";
    } else if (timeFrame === 'this_30_days'){
      startDate = "";
      endDate = "";
    }

      get_report({reportName: 'task_with_time_window', params: { timeframe: timeFrame, group_ids, startDate, endDate}})
      .then((res) => {
          const chartDataset = new Keen.Dataset();
      if(res.result.length > 0){
            let response = res.result;
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            sum = response.reduce(reducer);
            const onTime = response[1];
            const lateUnderThirty = (response[2]);
            const halfToHour = (response[3]);
            const oneToTwoHour = (response[4]);
            const greaterThanTwoHour = (response[5]);

     if(sum > 0) {
        chartDataset.set(['On-time', 'On-time'], onTime);
        chartDataset.set(['Late(under 30min)', 'Late(under 30min)'], lateUnderThirty);
        chartDataset.set(['Late(30-60min)', 'Late(30-60min)'], halfToHour);
        chartDataset.set(['Late(1-2hr)', 'Late(1-2hr)'], oneToTwoHour);
        chartDataset.set(['Late(>2hr)', 'Late(>2hr)'], greaterThanTwoHour);
        }

      }
        this.setState({
          loadingAnalytics: false,
          pieChartData: chartDataset,
          pieChartError: null,
        });
      })
      .catch(err => {
        this.setState({
          pieChartError: err,
          pieChartData: null
        });
      });
  }

  onHide(){
    this.setState({
      showDialog:false
    });
  }


  generateAnalyticsMultipleForTasksWithoutTimeWindow() {
    this.setState({
      loadingAnalytics: true
    });

    let sum;
    let timeFrame = this.state.monthlyInterval;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;
    if (this.state.viewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (this.state.viewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }

    const group_ids = this.props.scheduler_group_id ? this.props.scheduler_group_id : this.state.group_ids ? this.state.group_ids.join(',') : '';


    if (!this.state.hideDialog) {
      startDate = this.state.startDate;
      endDate = this.state.endDate;
      timeFrame = '';
    } else if (timeFrame === 'this_24_hours') {
      startDate = "";
      endDate = "";
    } else if (timeFrame === 'this_7_days') {
      startDate = "";
      endDate = "";
    } else if (timeFrame === 'this_30_days') {
      startDate = "";
      endDate = "";
    }


      get_report({reportName: 'task_without_time_window', params: {timeframe: timeFrame, group_ids, startDate, endDate}})
      .then((res) => {
        const chartDataset = new Keen.Dataset();
        if(res.result.length>0){
              let response = res.result;
              const reducer = (accumulator, currentValue) => accumulator + currentValue;
              sum = response.reduce(reducer);
              const onTime = response[1];
              const uptothirtymins = (response[2]);
              const longerThirtyToSixty = (response[3]);
              const oneToTwoHour = (response[4]);
              const greaterThanTwoHour = (response[5]);

            if(sum > 0) {
              chartDataset.set(['Shorter than Schedule and On-time', 'Shorter than Schedule and On-time'], onTime);
              chartDataset.set(['Longer(0 - 30min)', 'Longer(0 - 30min)'], uptothirtymins);
              chartDataset.set(['Longer(30 - 60min)', 'Longer(30 - 60min)'], longerThirtyToSixty);
              chartDataset.set(['Longer(1 - 2hr)', 'Longer(1 - 2hr)'], oneToTwoHour);
              chartDataset.set(['Longer(>2hr)', 'Longer(>2hr)'], greaterThanTwoHour);
            }
      }
      this.setState({
          loadingAnalytics: false,
          barChartData: chartDataset,
          barChartError: null,
        });
      })
      .catch(err => {
        console.log(err);
        this.setState({
          barChartData: null,
          barChartError: err
        });
      });
  }

  runCall(){
    this.generateAnalyticsMultipleForTasksWithTimeWindow();
    this.generateAnalyticsMultipleForTasksWithoutTimeWindow();
  }

  render() {
    return (
      <div className={styles.analyticsBlocksContainer}>
        <div className={styles.analyticsBlocksHead}>
          <Row>
            <Col md={5} sm={5} xs={10}>
              <h3>
                On-Time Performance
              </h3>
            </Col>
            <Col md={1} sm={1} xs={2}>
              {this.state.loadingAnalytics &&
              <div className={cx('text-right', styles.loadingSpinner)}>
                <FontAwesomeIcon icon={faSpinner} spin />
              </div>
              }
            </Col>
              <Col md={2} sm={4} xs={10} className={styles.customSelectElement}>
                <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue={this.state.viewType}
                             componentClass="select">
                  <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                  <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                  <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                  <option value="custom" selected={this.state.viewType === 'custom'}>Custom</option>
                </FormControl>
              </Col>
              <Col md={4} sm={2} xs={12} >
                <TimeFilterInReports
                  view = {this.state.viewType}
                  getDate ={this.getDates}
                  runCalls ={this.runCall}
                  disableFields={this.state.hideDialog}
                  startDate ={this.state.startDate}
                  endDate={this.state.endDate}
                />
              </Col>
          </Row>
        </div>
        <div className={styles.analyticsBlocksBody}>
          <Grid>
            <Row>
                <Col md={6}>
              <div className={styles.textCenter}>
                <h4>
                  <b>On-Time Arrivals</b>
                </h4>
                <h4>
                  Actual vs. Scheduled Start Time
                </h4>
                </div>
                    <ReportingGraph colors={this.state.withTimeWindowColors} type="pie" isStacked={false}
                                    title="On-Time Chart" data={this.state.pieChartData}
                                    error={this.state.pieChartError} chartId="OnTimePerformancePieChart"/>

                  <div className={styles.textCenter}>
                    <p>This chart compares the actual start time with the scheduled start time.<br/>
                    For Tasks with a time window, a Task is considered to start<br/>
                    on-time if it falls within the time window.</p>
                  </div>
                </Col>
                <Col md={6}>
                      <div className={styles.textCenter}>
                          <h4>
                              <b>On-Schedule Completion</b>
                          </h4>
                          <h4>
                              Actual vs. Scheduled Task Length
                          </h4>
                      </div>
                    <ReportingGraph colors={this.state.WithoutTimeWindowColors} type="pie" isStacked={false}
                                    title="On-Time Chart" data={this.state.barChartData}
                                    error={this.state.barChartError} chartId="OnTimePerformanceBarChart"/>
                  <div className={styles.textCenter}>
                    <p>This chart compares the actual Task duration<br/>
                      (end time - start time) with the scheduled duration.<br/>
                      Tasks marked early took less time than budgeted.</p>
                  </div>
                </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

OnTimePerformanceChart.propTypes = {
  profile: PropTypes.object
};
