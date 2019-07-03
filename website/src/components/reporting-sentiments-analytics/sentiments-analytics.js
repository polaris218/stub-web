import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './sentiments-analytics.module.scss';
import { Grid, Row, Col, FormControl } from 'react-bootstrap';
import { get_report} from '../../actions';
import ReportingCommentsTable from '../reporting-comments-table/reporting-comments-table';
import Keen from 'keen-js';
import ReportingGraph from '../reporting-graph/reporting-graph';
import cx from "classnames";
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faSpinner, faSmile, faCalendarAlt} from '@fortawesome/fontawesome-free-solid';
import CustomerResponses from '../reporting-customer-engagement/components/reporting-customer-responses-graph/customer-responses';
import LiveTrackGraph from '../reporting-customer-engagement/components/reporting-live-track-views-graph/live-track-views-graph';
import CustomerViews from '../reporting-customer-engagement/components/reporting-customer-views/customer-views';
import ReportingAnalyticsCards from '../reporting-analytic-cards/reporting-analytic-cards';
import TeamRatingChart from '../reporting-team-rating-chart/team-rating-chart';
import DropdownFilter from '../dropdown-filter/dropdown-filter';
import TimeFilterInReports from "../time-filter-in-reports/time-filter-in-reports";
import moment from "moment";

export default class SentimentsAnalytics extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDialog:false,
      ratingViewType: 'monthly',
      mostFavorableViewType: 'monthly',
      leastFavorableViewType: 'monthly',
      chartData: null,
      chartError: null,
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      fetchingLeastFavorableComments: false,
      fetchingMostFavorableComments: false,
      mostFavorableCommentsResults: null,
      mostFavorableCommentsError: null,
      leastFavorableCommentsResults: null,
      leastFavorableCommentsError: null,
      fetchingRatings: false,
      npsScore: null,
      monthlyNpsChartData: null,
      monthlyNpsChartError: null,
      selectedGroupsFilter: null,
      startDate:'',
      endDate:'',
      showDialogForLeastFavComment: true,
      showDialogForMostFavComment: true,
      hideDialog:true,
      inputValueStartDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      inputValueEndDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      lowerBound:'',
      upperBound:'',

    };

    this.updateReportRatingDuration = this.updateReportRatingDuration.bind(this);
    this.updateReportMostFavorableCommentsDuration = this.updateReportMostFavorableCommentsDuration.bind(this);
    this.updateReportLeastFavorableCommentsDuration = this.updateReportLeastFavorableCommentsDuration.bind(this);
    this.generateRatings = this.generateRatings.bind(this);
    this.generateLeastFavorableComments = this.generateLeastFavorableComments.bind(this);
    this.generateMostFavorableComments = this.generateMostFavorableComments.bind(this);
    this.initializeRatingsArray = this.initializeRatingsArray.bind(this);
    this.convertRatings = this.convertRatings.bind(this);
    this.generateNPSOverTime = this.generateNPSOverTime.bind(this);
    this.groupsFilterChanged = this.groupsFilterChanged.bind(this);
    this.onHide = this.onHide.bind(this);
    // this.isSetstate = this.isSetstate.bind(this);
    // this.isSetStateForMostFavComments = this.isSetStateForMostFavComments.bind(this);
    // this.isSetStateForLeastFavComments = this.isSetStateForLeastFavComments.bind(this);
    this.getDates = this.getDates.bind(this);
    this.getDatesForLeastFav =  this.getDatesForLeastFav.bind(this);
    this.getDatesForMostFav =  this.getDatesForMostFav.bind(this);
    this.runCallForStarRating = this.runCallForStarRating.bind(this);
    this.runCallForStarRating = this.runCallForStarRating.bind(this);

  }

  componentDidMount() {
    this.generateRatings();
    this.generateLeastFavorableComments();
    this.generateMostFavorableComments();
    this.generateNPSOverTime();
  }

  groupsFilterChanged(selectedGroups) {
    this.setState({
      selectedGroupsFilter: selectedGroups.map(group => group.id)
    }, () => {
        this.generateRatings();
        this.generateLeastFavorableComments();
        this.generateMostFavorableComments();
        this.generateNPSOverTime();
    });
  }

  initializeRatingsArray() {
    if (this.props.profile.rating_type === null || typeof this.props.profile.rating_type === 'undefined' || this.props.profile.rating_type === 'FiveStar' || this.props.profile.rating_type === 'NoRating') {
      return [0, 0, 0, 0, 0];
    } else if (this.props.profile.rating_type === 'NPS') {
      return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    } else if (this.props.profile.rating_type === 'ThumbsUpDown') {
      return [0, 0];
    }
  }

  convertRatings(rating, rating_type, company_rating_type) {
    if (company_rating_type === null || company_rating_type === 'undefined' || company_rating_type === 'FiveStar' || company_rating_type === 'NoRating') {
      if (rating_type === null || typeof rating_type === 'undefined' || rating_type === 'FiveStar' || rating_type === 'NoRating') {
        if (rating <= 5) {
          return rating;
        } else {
          return 5;
        }
      } else if (rating_type === 'NPS') {
        if (rating == 0) {
          return 1;
        } else {
          return Math.ceil(rating / 2);
        }
      } else if (rating_type === 'ThumbsUpDown') {
        if (rating === 0) {
          return 2;
        } else{
          return 4;
        }
      }
    } else if (company_rating_type === 'NPS') {
      if (rating_type === null || typeof rating_type === 'undefined' || rating_type === 'FiveStar' || rating_type === 'NoRating') {
        if (rating <= 5) {
          return (rating * 2);
        } else {
          return 10;
        }
      } else if (rating_type === 'NPS') {
        return rating;
      } else if (rating_type === 'ThumbsUpDown') {
        if (rating === 0) {
          return 3;
        } else{
          return 9;
        }
      }
    } else if (company_rating_type === 'ThumbsUpDown') {
      if (rating_type === null || typeof rating_type === 'undefined' || rating_type === 'FiveStar' || rating_type === 'NoRating') {
        if (rating < 4) {
          return 0;
        } else {
          return 1;
        }
      } else if (rating_type === 'NPS') {
        if (rating < 8) {
          return 0;
        } else {
          return 1;
        }
      } else if (rating_type === 'ThumbsUpDown') {
        return rating;
      }
    }
  }


  getDatesForLeastFav(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    }, ()=>this.generateLeastFavorableComments());
  }

  getDatesForMostFav(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.generateMostFavorableComments());
  }

  getDates(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.generateRatings());
  }

  generateLeastFavorableComments() {
    this.setState({
      fetchingLeastFavorableComments: true,
    });
    let timeFrame = this.state.monthlyInterval;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;
    if (this.state.leastFavorableViewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (this.state.leastFavorableViewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }

    const group_ids = this.props.groups ? (this.state.selectedGroupsFilter ? this.state.selectedGroupsFilter.join(',') : '') : this.props.profile.group_id;

    if (!this.state.showDialogForLeastFavComment){
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


    get_report({reportName: 'least_favorable_comments', params: {timeframe:timeFrame, group_ids, startDate, endDate}})
      .then(res => {
        const leastFavorableComments = [];
        let badComment = null;
        for (let j = 0; j < res.result.length; j++) {
          badComment = {
            task_rating_text: res.result[j].task_rating_text,
            customer_name: res.result[j].customer_name,
            taskId: res.result[j].id
          };
          leastFavorableComments.push(badComment);
        }
        this.setState({
          leastFavorableCommentsResults: leastFavorableComments,
          fetchingLeastFavorableComments: false,
          leastFavorableCommentsError: null
        });
      })
      .catch(err => {
        this.setState({
          leastFavorableCommentsResults: null,
          fetchingLeastFavorableComments: false,
          leastFavorableCommentsError: err
        });
      });
  }

  generateMostFavorableComments() {
    this.setState({
      fetchingMostFavorableComments: true,
    });
    let timeFrame = this.state.monthlyInterval;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;
    if (this.state.mostFavorableViewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (this.state.mostFavorableViewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }

    const group_ids = this.props.groups ? (this.state.selectedGroupsFilter ? this.state.selectedGroupsFilter.join(',') : '') : this.props.profile.group_id;

    if (!this.state.showDialogForMostFavComment){
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


    get_report({reportName: 'most_favorable_comments', params: {timeframe:timeFrame, group_ids, startDate, endDate}})
      .then(res => {
        const mostFavorableComments = [];
        let goodComment = null;
        for (let j = 0; j < res.result.length; j++) {
          goodComment = {
            task_rating_text: res.result[j].task_rating_text,
            customer_name: res.result[j].customer_name,
            taskId: res.result[j].id
          };
          mostFavorableComments.push(goodComment);
        }
        this.setState({
          mostFavorableCommentsResults: mostFavorableComments,
          fetchingMostFavorableComments: false,
          mostFavorableCommentsError: null
        });
      })
      .catch(err => {
        this.setState({
          mostFavorableCommentsResults: null,
          fetchingMostFavorableComments: false,
          mostFavorableCommentsError: err
        });
      });
  }

  generateRatings() {
    this.setState({
      fetchingRatings: true
    });

    let timeFrame = this.state.dailyInterval;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;
    if (this.state.ratingViewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else if (this.state.ratingViewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }

    const group_ids = this.props.groups ? (this.state.selectedGroupsFilter ? this.state.selectedGroupsFilter.join(',') : '') : this.props.profile.group_id;

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


        get_report({reportName: 'rating', params: {timeframe:timeFrame, group_ids, startDate, endDate}})
          .then(res => {
            let npsScore = null;
            let rating = 0;
            let ratings = [];
            const ds = new Keen.Dataset();
            ratings = res[0].result;

            if (this.props.profile.rating_type === 'ThumbsUpDown') {
              ds.set(['ThumbsUp', 'ThumbsUp'], ratings[1]);
              ds.set(['ThumbsDown', 'ThumbsDown'], ratings[0]);
            } else if (this.props.profile.rating_type === 'NPS') {
              const detractors = ratings[0] + ratings[1] + ratings[2] + ratings[3] + ratings[4] + ratings[5] + ratings[6];
              const passives = ratings[7] + ratings[8];
              const promoters = ratings[9] + ratings[10];
              const total = promoters + passives + detractors;
              ds.set(['Promoter', 'Promoter'], Math.round((promoters/total) * 100));
              ds.set(['Passive', 'Passive'], Math.round((passives/total) * 100));
              ds.set(['Detractor', 'Detractor'], Math.round((detractors/total) * 100));
              npsScore = [{
                title: 'NPS Score ',
                icon: faSmile,
                color: '#142046',
                value: ((promoters/total) * 100) - ((detractors/total) * 100) ? Math.round(((promoters/total) * 100) - ((detractors/total) * 100)) : 0,
              }];
            } else {
              for (let j = 0; j < ratings.length; j++) {
                ds.set(['Ratings', ((j + 1) + ' Star')], ratings[j]);
              }
            }
            this.setState({
              npsScore,
              chartData: ds,
              fetchingRatings: false
            });
          })
        .catch(err => {
          this.setState({
            chartError: err,
            fetchingRatings: false
          });
        });
  }

  generateNPSOverTime() {
    this.setState({
      fetchingRatings: true
    });

    const group_ids = this.props.groups ? (this.state.selectedGroupsFilter ? this.state.selectedGroupsFilter.join(',') : '') : this.props.profile.group_id;
    let startDate = this.state.startDate;
    let endDate = this.state.endDate;
      get_report({reportName: 'nps_rating_monthly', params: {timeframe: 'this_12_months', group_ids, startDate, endDate}})
      .then(res => {
        let rating = 0;
        let promoters = 0;
        let passives = 0;
        let detractors = 0;
        let total = 0;
        const ds = new Keen.Dataset();
        let npsMonthlyScore = null;
        let npsRatings = null;

        let data = res[0].result;
        for (let i = 0; i < 12; i++) {
          npsRatings = data[i].result;
          detractors = npsRatings[0] + npsRatings[1] + npsRatings[2] + npsRatings[3] + npsRatings[4] + npsRatings[5] + npsRatings[6];
          promoters = npsRatings[9] + npsRatings[10];
          passives = npsRatings[7] + npsRatings[8];
          total = promoters + passives + detractors;
          npsMonthlyScore = (((promoters / total) * 100) - ((detractors / total) * 100)) ? Math.round(((promoters / total) * 100) - ((detractors / total) * 100)) : 0;
          ds.set(['NPS Score', data[i].date], npsMonthlyScore);
        }
        this.setState({
          monthlyNpsChartData: ds,
          fetchingRatings: false
        });
      })
      .catch(err => {
        this.setState({
          monthlyNpsChartError: err,
          fetchingRatings: false
        });
      });
  }

  updateReportMostFavorableCommentsDuration(e) {
    e.preventDefault();
    e.stopPropagation();

    if (e.target.value === 'custom') {
    this.setState({
      mostFavorableViewType: e.target.value,
      showDialogForMostFavComment: false
    }, () => {
      this.generateMostFavorableComments();
    });
    } else {
        this.setState({
        mostFavorableViewType: e.target.value,
        showDialogForMostFavComment: true,
      });
    }
  }

  updateReportLeastFavorableCommentsDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.value === 'custom') {
      this.setState({
        leastFavorableViewType: e.target.value,
        showDialogForLeastFavComment: false,
      }, () => {
        this.generateLeastFavorableComments();
      });
    } else {
      this.setState({
      leastFavorableViewType: e.target.value,
      showDialogForLeastFavComment:true
        });
    }
  }

  updateReportRatingDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.value === 'custom') {
      this.setState({
        ratingViewType: e.target.value,
        hideDialog: false
      }, () => {
        this.generateRatings();
      });
    } else {
      this.setState({
        ratingViewType: e.target.value,
        hideDialog: true
      });
    }
  }
  onHide(){
    this.setState({
      showDialog:false
    });
  }

  runCallForStarRating(){
    this.generateRatings();
  }


  runCallForMostFav(){
    this.generateMostFavorableComments();
  }

  runCallForLeastFav(){
    this.generateLeastFavorableComments();
  }


  render() {
    let chartColors;
    if (this.props.profile.rating_type === 'NPS') {
      chartColors = ['#00DC9A','#ffc024','#ff4e4c'];
    } else if (this.props.profile.rating_type === 'ThumbsUpDown') {
      chartColors = ['#00DC9A', '#ff4e4c'];
    } else {
      chartColors = ['#FF9800','#FFC107','#FFEB3B','#CDDC39','#4CAF50'];
    }
    this.can_view_group_filter = false;
    if (this.props.groups !== null && typeof this.props.groups !== 'undefined') {
      this.can_view_group_filter = true;
    }
    const groups = [];
      this.props.groups && this.props.groups.map(group => {
      groups.push({
        name: group.name,
        id: group.id
      });
    });

    let showGroupDropdown = false;
    if (this.props.groups && (this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 1) {
      showGroupDropdown = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 0) {
      showGroupDropdown = true;
    }

    return (
      <div className={styles.sentimentsAnalyticsContainer}>
        <Grid>
          <Row className={styles.pageIntroContainer}>
            <Col md={6}>
              <h2>Customer Ratings</h2>
            </Col>
            <Col sm={3} smOffset={3} className={styles.groupFilter}>
              {this.can_view_group_filter && showGroupDropdown &&
              <div>
                <DropdownFilter
                  name="groupFilter"
                  data={groups}
                  handleChange={this.groupsFilterChanged}
                  title="Groups"
                  searchable
                  minWidth="120px"/>
              </div>
              }
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <CustomerViews
                profile={this.props.profile}
                group_ids={this.state.selectedGroupsFilter}
                scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <div className={styles.reportingBlockContainer}>
                <div className={styles.reportingBlockHeader}>
                  <Row>
                    <Col md={4} sm={5} xs={10}>
                      <h3>
                        {this.props.profile.rating_type === 'NPS' ? 'NPS Scores' : 'Star Ratings'}
                      </h3>
                    </Col>
                    <Col md={2} smt={1} xs={2}>
                      {this.state.fetchingRatings &&
                      <div className={cx('text-right', styles.loadingSpinner)}>
                        <FontAwesomeIcon icon={faSpinner} spin />
                      </div>
                      }
                    </Col>
                    <Col md={2} sm={2} xs={10} className={styles.customSelectElement}>
                      <FormControl onChange={(e) => this.updateReportRatingDuration(e)} defaultValue={this.state.ratingViewType} componentClass="select">
                        <option value="monthly" selected={this.state.ratingViewType === 'monthly'}>Last 30 Days</option>
                        <option value="weekly" selected={this.state.ratingViewType === 'weekly'}>Last 7 Days</option>
                        <option value="daily" selected={this.state.ratingViewType === 'daily'}>Last 24 Hours</option>
                        <option value="custom" selected={this.state.ratingViewType === 'custom'}>Custom</option>
                      </FormControl>
                    </Col>
                    <Col md={4} sm={4} xs={12} >
                      <TimeFilterInReports
                          view = {this.state.ratingViewType}
                          getDate ={this.getDates}
                          runCalls={this.runCallForStarRating}
                          disableFields={this.state.hideDialog}
                          startDate ={this.state.startDate}
                          endDate={this.state.endDate}
                      />
                    </Col>
                  </Row>
                </div>
                <div className={styles.reportingBlockBodyAlt}>
                  <Row>
                    <Col md={this.props.profile.rating_type === 'NPS' ? 6 : 4} sm={this.props.profile.rating_type === 'NPS' ? 12 : 6} xs={12}>
                      <div>
                          <ReportingGraph error={this.state.chartError} data={this.state.chartData} type="pie"
                                          title="Rating Pie Graph" isStacked="false" chartId="ratingPieChart"
                                          colors={chartColors}/>

                      </div>
                    </Col>
                    <Col md={this.props.profile.rating_type === 'NPS' ? 6 : 8} sm={this.props.profile.rating_type === 'NPS' ? 12 : 6} xs={12}>
                      {this.props.profile.rating_type === 'NPS' &&
                      <div className={styles.npsScoreCard}>
                        <ReportingAnalyticsCards cardsData={this.state.npsScore} singleCardWidth={12}/>
                      </div>}
                      {this.props.profile.rating_type !== 'NPS' &&
                      <div>
                        <span className={styles.timeGraphVerticalLabel}>
                          {this.props.profile.rating_type === 'NPS' ? 'NPS' : 'Number of Ratings'}
                        </span>
                        <ReportingGraph error={this.state.chartError} data={this.state.chartData} type="bar"
                                        title="Rating Bar Graph" isStacked="false" chartId="ratingBarChart"
                                        colors={(this.props.profile.rating_type === 'NPS' || this.props.profile.rating_type === 'ThumbsUpDown') ? chartColors : null}/>
                      </div>}
                    </Col>
                  </Row>
                  {this.props.profile.rating_type === 'NPS' &&
                  <div style={{ marginTop: '50px' }}>
                    <span className={styles.timeGraphVerticalLabel}>
                      {this.props.profile.rating_type === 'NPS' ? 'NPS' : 'Number of Ratings'}
                    </span>
                    <ReportingGraph error={this.state.chartError} data={this.state.chartData} type="bar"
                                    title="Rating Bar Graph" isStacked="false" chartId="ratingBarChart"
                                    colors={(this.props.profile.rating_type === 'NPS' || this.props.profile.rating_type === 'ThumbsUpDown') ? chartColors : null}/>
                  </div>}
                </div>
              </div>
            </Col>
          </Row>
          {this.props.profile.rating_type === 'NPS' && <div className={styles.reportingBlockContainer}>
            <Row>
              <ReportingGraph error={this.state.monthlyNpsChartError} data={this.state.monthlyNpsChartData} type="bar"
                              title="Monthly NPS Chart" isStacked="false" chartId="monthlyNpsChart"/>
            </Row>
          </div>}
          <Row>
            <TeamRatingChart profile={this.props.profile}
                             convertRatings={this.convertRatings} initializeRatingsArray={this.initializeRatingsArray} group_ids={this.state.selectedGroupsFilter}
                             scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}/>
          </Row>
          <Row>
            <Col md={6}>
              <div className={styles.reportingBlockContainer}>
                <div className={styles.reportingBlockHeader}>
                  <Row>
                    <Col md={12} sm={12} xs={12}>
                      <h3>Most Favorable Comments</h3>
                    </Col>
                      <Col md={6} sm={6} xs={12} className={styles.customSelectElement}>
                        <FormControl onChange={(e) => this.updateReportMostFavorableCommentsDuration(e)}
                                     defaultValue={this.state.mostFavorableViewType} componentClass="select">
                          <option value="monthly" selected={this.state.mostFavorableViewType === 'monthly'}>Last 30Days</option>
                          <option value="weekly" selected={this.state.mostFavorableViewType === 'weekly'}>Last 7 Days</option>
                          <option value="daily" selected={this.state.mostFavorableViewType === 'daily'}>Last 24 Hours</option>
                          <option value="custom" selected={this.state.mostFavorableViewType === 'custom'}>Custom</option>
                        </FormControl>
                      </Col>
                        <Col md={6} sm={6} xs={12} >
                          <TimeFilterInReports
                              view = {this.state.mostFavorableViewType}
                              getDate={this.getDatesForMostFav}
                              runCalls={() => this.runCallForMostFav()}
                              disableFields={this.state.showDialogForMostFavComment}
                              startDate ={this.state.startDate}
                              endDate={this.state.endDate}
                          />
                        </Col>
                  </Row>
                </div>
                <div className={styles.reportingBlockBodyAlt}>
                  <ReportingCommentsTable
                    analyticsError={this.state.mostFavorableCommentsError}
                    analyticsResults={this.state.mostFavorableCommentsResults}
                    fetchingAnalytics={this.state.fetchingMostFavorableComments}/>
                </div>
              </div>
            </Col>
            <Col md={6}>
              <div className={styles.reportingBlockContainer}>
                <div className={styles.reportingBlockHeader}>
                  <Row>
                    <Col md={12} sm={12} xs={12}>
                      <h3>
                        Least Favorable Comments
                      </h3>
                    </Col>
                    <Col md={6} sm={6} xs={12} className={styles.customSelectElement}>
                      <FormControl onChange={(e) => this.updateReportLeastFavorableCommentsDuration(e)}
                                   defaultValue={this.state.leastFavorableViewType} componentClass="select">
                        <option value="monthly" selected={this.state.leastFavorableViewType === 'monthly'}>Last 30
                          Days
                        </option>
                        <option value="weekly" selected={this.state.leastFavorableViewType === 'weekly'}>Last 7 Days
                        </option>
                        <option value="daily" selected={this.state.leastFavorableViewType === 'daily'}>Last 24 Hours
                        </option>
                        <option value="custom" selected={this.state.leastFavorableViewType === 'custom'}>Custom</option>
                      </FormControl>
                    </Col>
                        <Col md={6} sm={6} xs={12}>
                          <TimeFilterInReports
                              view = {this.state.leastFavorableViewType}
                              getDate={this.getDatesForLeastFav}
                              runCalls={()=>this.runCallForLeastFav()}
                              disableFields={this.state.showDialogForLeastFavComment}
                              startDate ={this.state.startDate}
                              endDate={this.state.endDate}
                          />
                        </Col>
                  </Row>
                </div>
                <div className={styles.reportingBlockBodyAlt}>
                  <ReportingCommentsTable
                    analyticsError={this.state.leastFavorableCommentsError}
                    analyticsResults={this.state.leastFavorableCommentsResults}
                    fetchingAnalytics={this.state.fetchingLeastFavorableComments}/>
                </div>
              </div>
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <LiveTrackGraph
                profile={this.props.profile}
                group_ids={this.state.selectedGroupsFilter}
                scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}
              />
            </Col>
          </Row>
          <Row>
            <Col md={12}>
              <CustomerResponses
                profile={this.props.profile}
                group_ids={this.state.selectedGroupsFilter}
                scheduler_group_id={this.props.profile.group_id && [this.props.profile.group_id]}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }

}

SentimentsAnalytics.propTypes = {
  profile: PropTypes.object,
};
