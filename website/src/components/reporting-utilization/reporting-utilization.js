import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './reporting-utilization.module.scss';
import { Grid, Row, Col, FormControl } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faBan, faClock, faListUl, faTasks, faRoad, faSpinner, faCalendarAlt } from '@fortawesome/fontawesome-free-solid';
import cx from 'classnames';
import { get_report } from '../../actions';
import ReportingAnalyticsCards from '../reporting-analytic-cards/reporting-analytic-cards';
import ReportingGraph from '../reporting-graph/reporting-graph';
import Keen from 'keen-js';
import TimeFilterInReports from '../time-filter-in-reports/time-filter-in-reports';
import moment from "moment";

export default class ReportingUtilization extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDialog: false,
      loadingAnalytics: false,
      viewType: 'monthly',
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      taskSummaryData: null,
      taskTypeData: null,
      chartError: null,
      chartData: null,
      startDate:'',
      endDate:'',
      hideDialog: true,
      inputValueStartDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      inputValueEndDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      lowerBound:'',
      upperBound:'',

    };

    this.updateReportDuration = this.updateReportDuration.bind(this);
    this.generateAnalyticsMultiple = this.generateAnalyticsMultiple.bind(this);
    this.runCall = this.runCall.bind(this);
    this.getDates =  this.getDates.bind(this);
  }

  componentDidMount() {
    this.generateAnalyticsMultiple();
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.group_ids, nextProps.group_ids)) {
      this.setState({
          group_ids: nextProps.group_ids,
      }, () => {this.generateAnalyticsMultiple();})
    }
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.value === 'custom') {
      this.setState({
        viewType: e.target.value,
        hideDialog:false,
      }, () => {
        this.generateAnalyticsMultiple();
      });
    }
    else {
      this.setState({
        viewType: e.target.value,
        hideDialog: true,
      });
    }
  }


  getDates(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.runCall());
  }

  runCall(){
    this.generateAnalyticsMultiple();
  }

  generateAnalyticsMultiple() {
    this.setState({
      loadingAnalytics: true
    });

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
    }
    else if(timeFrame === 'this_24_hours') {
      startDate = "";
      endDate = "";
    } else if (timeFrame === 'this_7_days'){
      startDate = "";
      endDate = "";
    } else if (timeFrame === 'this_30_days'){
      startDate = "";
      endDate = "";
    }


      get_report({reportName: 'overview', params: {timeframe: timeFrame, group_ids, startDate, endDate}})
      .then((res) => {
        let total_created_tasks = res[0].created_tasks;
        let completed_tasks = res[0].completed_tasks;
        let total_time = res[0].task_durations.total_time;
        let travel_time = res[0].task_durations.travel_time;
        let avg_travel_time = res[0].task_durations.avg_travel_time;
        let taskTypeWithSummary = res[0].task_durations.count;

        const taskCreated = {
          title: 'Total Tasks',
          icon: faListUl,
          color: '#008BF8',
          value: total_created_tasks
        };
        const taskCompleted = {
          title: 'Completed Tasks',
          icon: faTasks,
          color: '#00d494',
          value: completed_tasks
        };
        const incompleteTasks = {
          title: 'Others',
          icon: faBan,
          color: '#FFC024',
          value: (total_created_tasks - completed_tasks),
          tooltipText: 'This includes Not Started, Cancelled and Declined Tasks'
        };
        const totalTime = {
          title: 'Total Task Time ',
          icon: faClock,
          color: '#FF8448',
          value: (total_time && total_time > 0) ? (total_time / 60).toFixed(2) : 0
        };
        const travelTime = {
          title: 'Total Travel Time ',
          icon: faRoad,
          color: '#FF4E4C',
          value: (travel_time && travel_time > 0) ? (travel_time / 60).toFixed(2)  : 0
        };
        const avgTravelTime = {
          title: 'Avg. Travel Time Per Task ',
          icon: faRoad,
          color: '#142046',
          value: (avg_travel_time && avg_travel_time > 0) ? (avg_travel_time / 60).toFixed(2) : 0
        };
        const taskTypeData = [];
        taskTypeData.push(taskCreated, taskCompleted, incompleteTasks);
        const taskSummaryData = [];
        taskSummaryData.push(totalTime, travelTime, avgTravelTime);
        const chartDataset = new Keen.Dataset();
        chartDataset.set(['Incomplete Tasks', 'Incomplete Tasks'], total_created_tasks - completed_tasks);
        chartDataset.set(['Completed Tasks', 'Completed Tasks'], completed_tasks);
        this.setState({
          taskTypeData,
          taskSummaryData,
          loadingAnalytics: false,
          chartData: chartDataset,
          chartError: null
        });
      })
      .catch(err => {
        this.setState({
          chartError: err,
          chartData: null
        });
      });
  }

  render() {
    return (
      <div className={styles.analyticsBlocksContainer}>
        <div className={styles.analyticsBlocksHead}>
          <Row>
            <Col md={5} sm={5} xs={10}>
              <h3>Overview</h3>
            </Col>
            <Col md={1} sm={1} xs={2}>
              {this.state.loadingAnalytics &&
              <div className={cx('text-right', styles.loadingSpinner)}>
                <FontAwesomeIcon icon={faSpinner} spin />
              </div>
              }
            </Col>

            <Col md={2} sm={4} xs={12} className={styles.customSelectElement}>
              <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue={this.state.viewType} componentClass="select">
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
              <Col md={5} sm={6} xs={12}>
                <ReportingGraph type="pie" isStacked={false} title="Overview Chart" data={this.state.chartData} error={this.state.chartError} chartId="overviewChart"/>
              </Col>
              <Col md={7} sm={6} xs={12}>
                <Row>
                  <ReportingAnalyticsCards cardsData={this.state.taskTypeData} singleCardWidth={4}/>
                </Row>
                <Row>
                  <ReportingAnalyticsCards cardsData={this.state.taskSummaryData} singleCardWidth={4} isTime/>
                </Row>
              </Col>
            </Row>

          </Grid>
        </div>
      </div>
    );
  }
}

ReportingUtilization.propTypes = {
  profile: PropTypes.object
};
