import React, { Component } from 'react';
import styles from './customer-views.module.scss';
import { Row, Col, FormControl } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faSpinner, faComments, faVideo, faUsers, faStar, faCalendarAlt} from '@fortawesome/fontawesome-free-solid';
import cx from 'classnames';
import ReportingAnalyticsCards from '../../../reporting-analytic-cards/reporting-analytic-cards';
import { get_report } from '../../../../actions';
import PropTypes from 'prop-types';
import TimeFilterInReports from "../../../time-filter-in-reports/time-filter-in-reports";
import moment from "moment";

export default class CustomerViews extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loadingAnalytics: false,
      viewType: 'monthly',
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      totalAnalyticData: null,
      percentileAnalyticData: null,
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
    this.onHide = this.onHide.bind(this);
    this.getDates = this.getDates.bind(this);
    this.runCall = this.runCall.bind(this);
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


    get_report({reportName: 'customer_engagement', params: {timeframe: timeFrame, group_ids, startDate, endDate}})
      .then((res) => {

        let total_live_track_views = res[0].live_track_views;
        let total_sms_email_responses = res[0].sms_email_responses;
        let total_ratings = res[0].ratings;
        let unique_tasks_with_sms_email_live_track_responses = res[0].unique_task_with_reply;
        let unique_tasks_with_live_track_views = res[0].unique_task_with_live_track_views;
        let total_tasks = res[0].total_tasks_excluding_deleted - res[0].rescheduled_tasks_count;

        const customerUsingArrivyLiveTrack = {
          title: 'Customer using Arrivy to track crew',
          icon: faUsers,
          color: '#008BF8',
          value: total_tasks ? ((unique_tasks_with_live_track_views / total_tasks) * 100).toFixed(2) + '%' : '0.00%'
        };
        const customerSmsEmailLiveTrackResponses = {
          title: 'Customers responding to Arrivy\'s SMS/Email /Live Track',
          icon: faComments,
          color: '#00d494',
          value: total_tasks ? ((unique_tasks_with_sms_email_live_track_responses / total_tasks) * 100).toFixed(2) + '%' : '0.00%'
        };
        const totalLiveTrackViews = {
          title: 'Total Live Track Views',
          icon: faVideo,
          color: '#FFC024',
          value: total_live_track_views,
          tooltip: 'This includes Not Started, Cancelled, Declined Tasks'
        };
        const totalSmsEmailResponses = {
          title: 'Total SMS/Email ',
          icon: faComments,
          color: '#FF8448',
          value: total_sms_email_responses
        };
        const totalRatings = {
          title: 'Total Ratings ',
          icon: faStar,
          color: '#FF4E4C',
          value: total_ratings
        };
        const totalAnalyticData = [];
        const percentileAnalyticData = [];
        totalAnalyticData.push(totalLiveTrackViews, totalSmsEmailResponses, totalRatings);
        percentileAnalyticData.push(customerUsingArrivyLiveTrack, customerSmsEmailLiveTrackResponses);

        this.setState({
          totalAnalyticData,
          percentileAnalyticData,
          loadingAnalytics: false,
        });
      })
      .catch(() => {
        this.setState({
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
      this.generateAnalyticsMultiple();
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
    this.generateAnalyticsMultiple();
  }

  render() {
    return (
      <div>
        <div className={styles.analyticsBlocksContainer}>
          <div className={styles.analyticsBlocksHead}>
            <Row>
              <Col md={5} sm={3} xs={10}>
                <h3>
                  Customer Engagement
                </h3>
              </Col>
              <Col md={1} sm={1} xs={2}>
                {this.state.loadingAnalytics &&
                <div className={cx('text-right', styles.loadingSpinner)}>
                  <FontAwesomeIcon icon={faSpinner} spin />
                </div>
                }
              </Col>
              <Col md={2} sm={4} xs={12}>
                <FormControl className={styles.customSelectElement} onChange={(e) => this.updateReportDuration(e)}
                             defaultValue={this.state.viewType} componentClass="select">
                  <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                  <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                  <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                  <option value="custom" selected={this.state.viewType === 'custom'}>Custom</option>
                </FormControl>
              </Col>
                <Col md={4} sm={4} xs={12}>
                  <TimeFilterInReports
                    showDialogBox = {this.state.showDialog}
                    onHide = {this.onHide}
                    view={this.state.viewType}
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
              <Col md={5}>
                <Row>
                  <ReportingAnalyticsCards cardsData={this.state.percentileAnalyticData} singleCardWidth={6}/>
                </Row>
              </Col>
              <Col md={7}>
                <Row>
                  <ReportingAnalyticsCards cardsData={this.state.totalAnalyticData} singleCardWidth={4}/>
                </Row>
              </Col>
            </Row>
          </div>
        </div>

      </div>
    );
  }

}

CustomerViews.propTypes = {
  profile: PropTypes.object
};
