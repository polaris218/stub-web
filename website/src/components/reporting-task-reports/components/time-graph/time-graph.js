import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './time-graph.module.scss';
import {Row, Col, FormControl, Grid} from 'react-bootstrap';
import Keen from 'keen-js';
import { get_report } from '../../../../actions';
import ReportingGraph from '../../../reporting-graph/reporting-graph';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner, faCalendarAlt  } from '@fortawesome/fontawesome-free-solid';
import moment from "moment/moment";
import TimeFilterInReports from "../../../time-filter-in-reports/time-filter-in-reports";

export default class TimeGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDialog: false,
      profile: null,
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      viewType: 'monthly',
      chartData: null,
      chartError: null,
      loadingAnalytics: false,
      startDate:'',
      endDate:'',
      hideDialog: true,
      inputValueStartDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      inputValueEndDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      lowerBound:'',
      upperBound:'',


    };

    this.updateReportDuration = this.updateReportDuration.bind(this);
    this.generateTimeGraph = this.generateTimeGraph.bind(this);
    this.onHide = this.onHide.bind(this);
    this.runCall = this.runCall.bind(this);
    this.getDates = this.getDates.bind(this);

  }

  componentDidMount() {
    this.generateTimeGraph();
  }

  componentWillReceiveProps(nextProps) {
      if (!_.isEqual(this.props.group_ids, nextProps.group_ids)) {
          this.setState({
              group_ids: nextProps.group_ids,
          }, () => {this.generateTimeGraph();})
      }
  }

  getDates(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.runCall());
  }

  generateTimeGraph() {
    this.setState({
      loadingAnalytics: true,
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

    get_report({reportName: 'time', params: {timeframe:timeFrame, group_ids, startDate, endDate}})
      .then((res) => {
        let total_time = 0;
        let travel_time = 0;
        const ds = new Keen.Dataset();
        if (res.result && res.result.length > 0) {
          res.result.map((dailyData) => {
            total_time = dailyData.task_time > 0 ? dailyData.task_time:0;
            travel_time = dailyData.travel_time > 0 ? dailyData.travel_time:0;
            ds.set(['Task Time', dailyData.date], (total_time && total_time > 0) ? (total_time / 60).toFixed(2) : 0);
            ds.set(['Travel Time', dailyData.date], (travel_time && travel_time > 0) ? (travel_time / 60).toFixed(2) : 0);
          });
        }

        this.setState({
          chartData: ds,
          chartError: null,
          loadingAnalytics: false
        });
      })
      .catch((err) => {
        this.setState({
          chartError: err,
          loadingAnalytics: false,
          chartData: null
        });
      });
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.value === 'custom') {
      this.setState({
        viewType: e.target.value,
        hideDialog:false,
      }, () => {
        this.generateTimeGraph();
      });
    } else {
     this.setState({
        viewType: e.target.value,
        hideDialog: true,
      });
      }
    }

  onHide(){
  this.setState({
    showDialog:false
  });
  }

  runCall(){
    this.generateTimeGraph();
  }


  render() {
    return (
      <div className={styles.timeGraphContainer}>
        <div className={styles.reportingBlockContainer}>
          <div className={styles.reportingBlockHeader}>
            <Row>
              <Col md={5} sm={5} xs={10}>
                <h3>Time Report</h3>
              </Col>
              <Col md={1} sm={1} xs={2}>
                {this.state.loadingAnalytics &&
                <div className={cx('text-right', styles.loadingSpinner)}>
                  <FontAwesomeIcon icon={faSpinner} spin />
                </div>
                }
              </Col>
              <Col md={2} sm={4} xs={12} className={styles.customSelectElement}>
                <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue={this.state.viewType}
                             componentClass="select">
                  <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                  <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                  <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                  <option value="custom" selected={this.state.viewType === 'custom'}>Custom</option>
                </FormControl>
              </Col>
              <Col md={4} sm={2} xs={12} className={styles.customSelectElement}>
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
          <div className={styles.reportingBlockBody}>
            <Row>
              <Col md={12}>
                <span className={styles.timeGraphVerticalLabel}>
                  Hours
                </span>
                <ReportingGraph error={this.state.chartError} data={this.state.chartData} type="bar" title="Task Time Graph" isStacked="true" chartId="timeChart"/>
              </Col>
            </Row>
          </div>
        </div>

      </div>
    );
  }

}

TimeGraph.propTypes = {
  profile: PropTypes.object
};
