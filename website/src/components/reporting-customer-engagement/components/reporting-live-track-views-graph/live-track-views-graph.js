import React, { Component } from 'react';
import styles from './live-track-views-graph.module.scss';
import { Row, Col, FormControl } from 'react-bootstrap';
import ReportingGraph from '../../../reporting-graph/reporting-graph';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faCalendarAlt, faSpinner} from '@fortawesome/fontawesome-free-solid';
import C3Chart from 'react-c3js';
import 'c3/c3.css';
import Keen from 'keen-js';
import { get_report} from '../../../../actions';
import PropTypes from 'prop-types';
import moment from "moment/moment";
import TimeFilterInReports from "../../../time-filter-in-reports/time-filter-in-reports";


export default class LiveTrackGraph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDialog:false,
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
    this.generateAnalyticsData = this.generateAnalyticsData.bind(this);
    this.onHide =  this.onHide.bind(this);
    this.getDates = this.getDates.bind(this);
    this.runCall = this.runCall.bind(this);
  }

  componentDidMount() {
    this.generateAnalyticsData();
  }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.group_ids, nextProps.group_ids)) {
            this.setState({
                group_ids: nextProps.group_ids,
            }, () => {this.generateAnalyticsData();})
        }
    }

  onHide(){
    this.setState({
      showDialog:false
    });
  }

  getDates(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.runCall());
  }

  runCall(){
    this.generateAnalyticsData();
  }




  generateAnalyticsData() {

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

    const liveTrackViews = ['Views'];
    const totalTasks = ['Tasks'];
    const dates = ['Date'];
    const emailLiveTrackViews = ['Email Views'];
    const smsLiveTrackViews = ['SMS Views'];

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


    get_report({reportName: 'live_track_views', params: {timeframe: timeFrame, group_ids, startDate, endDate}})
      .then((res) => {
        let totalTaskInDay;
        let totalViewsInDay;
        let totalEmailViewsInDay;
        let totalSMSViewsInDay;
        if (res.result !== null && res.result.length > 0) {
            res.result.map((taskData) => {
                totalTaskInDay = 0;
                totalViewsInDay = 0;
                totalEmailViewsInDay = 0;
                totalSMSViewsInDay = 0;
                dates.push(moment(taskData.date).format('MMM DD'));
                if(taskData.tasks)totalTaskInDay=taskData.tasks;
                if(taskData.views)totalViewsInDay=taskData.views;
                if(taskData.email_views)totalEmailViewsInDay=taskData.email_views;
                if(taskData.sms_views)totalSMSViewsInDay=taskData.sms_views;
                totalTasks.push(totalTaskInDay);
                liveTrackViews.push(totalViewsInDay);
                emailLiveTrackViews.push(totalEmailViewsInDay);
                smsLiveTrackViews.push(totalSMSViewsInDay);
            });
        }
        const ds = {
          columns: [
            totalTasks,
            liveTrackViews,
            emailLiveTrackViews,
            smsLiveTrackViews,
            dates,
          ],
          type: 'bar',
          groups: [
              ['Views', 'Email Views', 'SMS Views']
          ],
          types: {
            Tasks: 'area'
          },
          xFormat: '%m-%d',
          x: 'Date'
        };
        this.setState({
          chartData: ds,
          chartError: null,
          loadingAnalytics: false,
        });
      })
      .catch((err) => {
        this.setState({
          chartData: null,
          chartError: err,
          loadingAnalytics: false,
        });
      });
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.value === 'custom') {
      this.setState({
        viewType: e.target.value,
        hideDialog: false
      }, () => {
        this.generateAnalyticsData();
      });
    } else {
      this.setState({
        viewType: e.target.value,
        hideDialog: true,
      });
    }
  }

  render() {
    const axis = {
      x: {
        type: 'categorized',
      }
    };
    return (
      <div>
        <div className={styles.reportingBlockContainer}>
          <div className={styles.reportingBlockHeader}>
            <Row>
                <Col md={5} sm={5} xs={10}>
                  <h3>
                    Live Track Views
                  </h3>
                  <p>This chart illustrates the number of times customers use Arrivy’s Live Track map page to view approaching crews.</p>
                </Col>
              <Col md={1} sm={1} xs={2}>
                {this.state.loadingAnalytics &&
                <div className={cx('text-right', styles.loadingSpinner)}>
                  <FontAwesomeIcon icon={faSpinner} spin />
                </div>
                }
              </Col>
                <Col md={2} sm={2} xs={10} className={styles.customSelectElement}>
                  <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue={this.state.viewType} componentClass="select">
                    <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                    <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                    <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                    <option value="custom" selected={this.state.viewType === 'custom'}>Custom</option>
                  </FormControl>
                </Col>
                <Col md={4} sm={4} xs={12} >
                  <TimeFilterInReports
                      showDialogBox = {this.state.showDialog}
                      onHide = {this.onHide}
                      view = {this.state.viewType}
                      getDate={this.getDates}
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
                {this.state.chartData &&
                  <C3Chart data={this.state.chartData} axis={axis}/>
                }
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }

}

LiveTrackGraph.propTypes = {
  profile: PropTypes.object
};
