import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './mileage-reports.module.scss';
import {Row, Col, FormControl, Grid} from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner, faRoad, faCalendarAlt } from '@fortawesome/fontawesome-free-solid';
import ReportingGraph from '../reporting-graph/reporting-graph';
import cx from 'classnames';
import ReportingAnalyticsCards from '../reporting-analytic-cards/reporting-analytic-cards';
import { get_report } from '../../actions';
import Keen from "keen-js";
import moment from "moment/moment";
import TimeFilterInReports from "../time-filter-in-reports/time-filter-in-reports";

export default class MileageReports extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDialog: false,
      viewType: 'monthly',
      profile: null,
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      chartError: null,
      chartData: null,
      taskSummaryData: null,
      taskMileageData: null,
      startDate:'',
      endDate:'',
      hideDialog: true,
      inputValueStartDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      inputValueEndDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      lowerBound:'',
      upperBound:'',
    };

    this.generateMileageGraph = this.generateMileageGraph.bind(this);
    this.updateReportDuration = this.updateReportDuration.bind(this);
    this.generateAnalyticsMultiple = this.generateAnalyticsMultiple.bind(this);
    this.onHide = this.onHide.bind(this);
    this.runCall = this.runCall.bind(this);
    this.getDates = this.getDates.bind(this);
  }

  componentDidMount() {
    this.generateMileageGraph();
    this.generateAnalyticsMultiple();
  }

  componentWillReceiveProps(nextProps) {
      if (!_.isEqual(this.props.group_ids, nextProps.group_ids)) {
          this.setState({
              group_ids: nextProps.group_ids,
          }, () => {this.generateMileageGraph();
              this.generateAnalyticsMultiple();})
      }
  }


  getDates(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.runCall());
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


    get_report({reportName: 'mileage_and_travel', params: {timeframe:timeFrame, group_ids, startDate, endDate}})
      .then((res) => {

        let travel_time = res[0].travel_time.travel_time;
        let avg_travel_time = res[0].travel_time.avg_travel_time;
        let taskTypeWithSummary = res[0].travel_time.count;
        let total_mileage = res[0].mileage.total_mileage;
        let avg_mileage = res[0].mileage.avg_mileage;
        let taskTypeWithMileage = res[0].mileage.count;

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
        const totalMileage = {
          title: 'Total Mileage ',
          icon: faRoad,
          color: '#00d494',
          value: (total_mileage && total_mileage > 0) ? (total_mileage).toFixed(2)  : 0
        };
        const avgMileage = {
          title: 'Avg. Mileage Per Task ',
          icon: faRoad,
          color: '#FFC024',
          value: (avg_mileage && avg_mileage > 0) ? (avg_mileage).toFixed(2) : 0
        };
        const taskMileageData = [];
        taskMileageData.push(totalMileage, avgMileage);
        const taskSummaryData = [];
        taskSummaryData.push(travelTime, avgTravelTime);
        this.setState({
          taskMileageData,
          taskSummaryData,
          loadingAnalytics: false
        });
      });
  }

  generateMileageGraph() {
    let profileID = this.props.profile.owner;
    let profile = this.props.profile;
    let mileageUnit = (profile && profile.mileage_unit) ? profile.mileage_unit.toLowerCase() : ' miles';
    mileageUnit = mileageUnit.replace('s', '(s)');
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


    get_report({reportName: 'mileage_daily', params: {timeframe:timeFrame, group_ids, startDate, endDate}})
      .then(res => {
        let dailyMileage = 0;
        const ds = new Keen.Dataset();
        if (res.result && res.result.length > 0) {
          res.result.map((dailyData) => {
            dailyMileage = dailyData.value;
              ds.set([mileageUnit, dailyData.date], (dailyMileage && dailyMileage > 0) ? (dailyMileage).toFixed(2) : 0);
              dailyMileage = 0;
          });
        }
        this.setState({
          chartData: ds,
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

  onHide(){
    this.setState({
      showDialog:false
    });
  }

  runCall(){
    this.generateAnalyticsMultiple();
    this.generateMileageGraph();
  }



  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.value === 'custom') {
      this.setState({
        viewType: e.target.value,
        hideDialog: false,
      }, () => {
        this.generateMileageGraph();
        this.generateAnalyticsMultiple();
      });
    } else {
       this.setState({
        viewType: e.target.value,
        hideDialog: true,
      });
    }
  }

  render() {
    let profile = this.props.profile;
    let mileageUnit = (profile && profile.mileage_unit) ? profile.mileage_unit.toLowerCase() : ' miles';
    return (
      <div className={styles.taskMileageReportsContainer}>
        <div className={styles.analyticsBlocksContainer}>
          <div className={styles.analyticsBlocksHead}>
            <Row>
              <Col md={4} sm={5} xs={10}>
                <h3>Mileage</h3>
              </Col>
              <Col md={2} sm={2} xs={2}>
                {this.state.loadingAnalytics &&
                <div className={cx('text-right', styles.loadingSpinner)}>
                  <FontAwesomeIcon icon={faSpinner} spin />
                </div>
                }
              </Col>
                <Col md={2} sm={12} xs={10}>
                  <FormControl className={styles.customSelectElement} onChange={(e) => this.updateReportDuration(e)}
                               defaultValue={this.state.viewType} componentClass="select">
                    <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                    <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                    <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                    <option value="custom" selected={this.state.viewType === 'custom'}>Custom</option>
                  </FormControl>
                </Col>
                <Col md={4} sm={4} xs={12} >
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
          <div className={styles.analyticsBlocksBodyAlt}>
            <Row>
              <Col md={6} xs={12}>
                <div>
                  <ReportingGraph type="bar" isStacked={false} title="Mileage Chart" data={this.state.chartData} error={this.state.chartError} chartId="mileageChart" mapLabel={mileageUnit}/>
                </div>
              </Col>
              <Col md={6} xs={12}>
                <Row>
                  <ReportingAnalyticsCards cardsData={this.state.taskMileageData} singleCardWidth={6}/>
                </Row>
                <Row>
                  <ReportingAnalyticsCards cardsData={this.state.taskSummaryData} singleCardWidth={6} isTime/>
                </Row>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }

}

MileageReports.propTypes = {
  profile: PropTypes.object
};
