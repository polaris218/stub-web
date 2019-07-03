import React, { Component } from 'react';
import styles from './customer-responses.module.scss';
import { Row, Col, FormControl } from 'react-bootstrap';
import { get_report} from '../../../../actions';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faCalendarAlt, faSpinner} from '@fortawesome/fontawesome-free-solid';
import C3Chart from 'react-c3js';
import 'c3/c3.css';
import moment from 'moment';
import PropTypes from 'prop-types';
import TimeFilterInReports from "../../../time-filter-in-reports/time-filter-in-reports";

export default class CustomerResponses extends Component {
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
    this.onHide = this.onHide.bind(this);
    this.getDates = this.getDates.bind(this);
    this.runCall = this.runCall.bind(this);
  }

  componentWillMount() {
    this.generateAnalyticsData();
  }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.group_ids, nextProps.group_ids)) {
            this.setState({
                group_ids: nextProps.group_ids,
            }, () => {this.generateAnalyticsData();})
        }
    }

    getDates(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.runCall());
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

    const emailResponses = ['Email'];
    const smsResponses = ['SMS'];
    const liveTrackResponses = ['Journal'];
    const totalTasks = ['Tasks'];
    const dates = ['Date'];
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

      get_report({reportName: 'customer_responses', params: {timeframe: timeFrame, group_ids, startDate, endDate}})
      .then((res) => {
        let totalTaskInDay;
        let totalLiveTrackResponsesInDay;
        let totalEmailResponsesInDay;
        let totalSmsResponsesInDay;

        if (res.result !== null && res.result.length > 0) {
          res.result.map((dayData) => {
              totalTaskInDay = 0;
              totalLiveTrackResponsesInDay = 0;
              totalEmailResponsesInDay = 0;
              totalSmsResponsesInDay = 0;
              dates.push(moment(dayData.date).format('MMM DD'));
              if(dayData.tasks)totalTaskInDay=dayData.tasks;
              if(dayData.livetrack)totalLiveTrackResponsesInDay=dayData.livetrack;
              if(dayData.email)totalEmailResponsesInDay=dayData.email;
              if(dayData.sms)totalSmsResponsesInDay=dayData.sms;
              totalTasks.push(totalTaskInDay);
              liveTrackResponses.push(totalLiveTrackResponsesInDay);
              smsResponses.push(totalSmsResponsesInDay);
              emailResponses.push(totalEmailResponsesInDay);
          });
        }

        const ds = {
          columns: [
            totalTasks,
            liveTrackResponses,
            emailResponses,
            smsResponses,
            dates,
          ],
          type: 'bar',
          groups: [
            ['Journal', 'Email', 'SMS']
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

  onHide(){
    this.setState({
      showDialog:false
    });
  }


  runCall(){
    this.generateAnalyticsData();
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
              <Col md={5} sm={3} xs={10}>
                <h3>
                  Customer Responses
                </h3>
                <p>This chart shows how many times customers engage with a business by responding to Arrivy-generated emails,
                  SMS texts and messages posted through the Task Journal (shown on the customer’s Live Track page).</p>
              </Col>
              <Col md={1} sm={1} xs={2}>
                {this.state.loadingAnalytics &&
                <div className={cx('text-right', styles.loadingSpinner)}>
                  <FontAwesomeIcon icon={faSpinner} spin />
                </div>
                }
              </Col>
              <Col md={2} sm={4} xs={10} className={styles.customSelectElement}>
                <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue={this.state.viewType} componentClass="select">
                  <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                  <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                  <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                  <option value="custom" selected={this.state.viewType === 'custom'}>Custom</option>
                </FormControl>
              </Col>
              <Col md={4} sm={4} xs={12} >
                <TimeFilterInReports
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

CustomerResponses.propTypes = {
  profile: PropTypes.object
};
