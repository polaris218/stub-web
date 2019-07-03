import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './team-rating-chart.module.scss';
import { Row, Col, FormControl, ButtonGroup, Button } from 'react-bootstrap';
import Keen from 'keen-js';
import { get_report} from '../../actions';
import ReportingGraph from '../reporting-graph/reporting-graph';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faCalendarAlt, faSpinner} from '@fortawesome/fontawesome-free-solid';
import DropdownFilter from '../dropdown-filter/dropdown-filter';
import TimeFilterInReports from "../time-filter-in-reports/time-filter-in-reports";
import moment from "moment";


export default class TeamRatingChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      profile: null,
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      viewType: 'monthly',
      chartError: null,
      chartData: null,
      loadingAnalytics: false,
      selectedEntitiesFilter: [],
      page: 1,
      totalDataFromKeen: null,
      entitiesToShow: [],
      showPagination: false,
      entities: null,
      showDialog:false,
      startDate:'',
      endDate:'',
      hideDialog: true,
      inputValueStartDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      inputValueEndDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      lowerBound:'',
      upperBound:'',
    };

    this.updateReportDuration = this.updateReportDuration.bind(this);
    this.getTeamRatingDataFromKeen = this.getTeamRatingDataFromKeen.bind(this);
    this.entitiesFilterChanged = this.entitiesFilterChanged.bind(this);
    this.generateChartData = this.generateChartData.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.getEntityGraphValue = this.getEntityGraphValue.bind(this);
    this.onHide = this.onHide.bind(this);
    this.getDates =  this.getDates.bind(this);
    this.runCall = this.runCall.bind(this);
  }

  componentDidMount() {
    this.getTeamRatingDataFromKeen();
  }

  componentWillReceiveProps(nextProps) {
      if (!_.isEqual(this.props.group_ids, nextProps.group_ids)) {
          this.setState({
              group_ids: nextProps.group_ids,
          }, () => {this.getTeamRatingDataFromKeen();})
      }
  }

  getEntityGraphValue(ratings, rating_type) {
    if (rating_type === 'NPS') {
      let detractor = ratings[0] + ratings[1] + ratings[2] + ratings[3] + ratings[4] + ratings[5] + ratings[6];
      let passives = ratings[7] + ratings[8];
      let promoters = ratings[9] + ratings[10];
      let total = promoters + passives + detractor;
      return Math.round(((promoters / total) * 100) - ((detractor / total) * 100));
    } else if (rating_type === 'ThumbsUpDown') {
      const totalThumbsUpDownRatings = ratings[0] + ratings[1];
      return (ratings[1] / totalThumbsUpDownRatings) >= 0 ? (ratings[1] / totalThumbsUpDownRatings).toFixed(2) : 0;
    } else {
      const totalFiveStarRatings = ratings[0] + ratings[1] + ratings[2] + ratings[3] + ratings[4];
      const avgRatings = ((ratings[0] * 1) + (ratings[1] * 2) + (ratings[2] * 3) + (ratings[3] * 4) + (ratings[4] * 5)) / totalFiveStarRatings;
      return (avgRatings >= 0) ? avgRatings.toFixed(2) : 0;
    }
  }

    getDates(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.runCall());
  }

  getTeamRatingDataFromKeen() {
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

      const group_ids = this.props.scheduler_group_id ? this.props.scheduler_group_id : (this.state.group_ids ? this.state.group_ids.join(',') : '');

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


      get_report({reportName: 'rating_group_by_entities', params: {timeframe: timeFrame, group_ids, startDate, endDate}})
      .then((res) => {
        let entitiesData = res[0].result;
        const filterEntities = [];
        entitiesData.map(entity => {
          const entityForFilters = {
            id: entity.id,
            name: entity.entity
          };
          filterEntities.push(entityForFilters);
        });
        const entitiesToShow = this.state.selectedEntitiesFilter.length > 0 ? this.state.entitiesToShow : filterEntities;
        this.setState({
          totalDataFromKeen: entitiesData,
          chartError: null,
          entities: filterEntities,
          entitiesToShow
        }, () => {
          this.generateChartData(entitiesData);
        });
      }).catch((err) => {
      this.setState({
        chartError: err,
        loadingAnalytics: false,
        chartData: null,
        totalDataFromKeen: null
      });
    });
  }

  nextPage() {
    const page = this.state.page;
    this.setState({
      page: page + 1,
    }, () => { this.generateChartData(); });
  }

  previousPage() {
    const page = this.state.page;
    this.setState({
      page: page - 1,
    }, () => { this.generateChartData(); });
  }

  generateChartData(entitiesData = this.state.totalDataFromKeen) {
    const ds = new Keen.Dataset();
    const entities = this.state.entitiesToShow;
    let entity = null;
    const page = this.state.page - 1;
    const ratingTypeText = (this.props.profile.rating_type === 'NPS') ? 'NPS Score' : 'Average Ratings';
    if (entitiesData) {
      for (let j = (page  * 10); j < entities.length && j < (10 + (page * 10)); j++) {
        entity = entitiesData.find((entityData) => {
          return entityData.id === entities[j].id;
        });
        if (entity) {
          ds.set([ratingTypeText, entities[j].name], this.getEntityGraphValue(entity.ratings, this.props.profile.rating_type));
        } else {
          ds.set([ratingTypeText, entities[j].name], 0);
        }
      }
      this.setState({
        showPagination: entities.length > 10,
        chartError: null,
        loadingAnalytics: false,
        chartData: ds,
      });
    }
  }

  entitiesFilterChanged(selectedEntities) {
    const maxEntitiesPerPage = 10;
    let entitiesToShow = null;
    let page = 1;
    if (selectedEntities.length > 1) {
      page = this.state.page;
    }
    if (selectedEntities.length !== 0 && selectedEntities.length <= ((this.state.page - 1) * maxEntitiesPerPage)) {
      page = this.state.page - 1;
    }
    if (selectedEntities.length > 0) {
      entitiesToShow = selectedEntities.map(item => item);
    } else {
      entitiesToShow = this.state.entities;
    }
    this.setState({
      selectedEntitiesFilter: (selectedEntities.length > 0) ? entitiesToShow : selectedEntities.map(item => item),
      entitiesToShow,
      page
    }, () => { this.generateChartData(); });
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    if (e.target.value === 'custom') {
      this.setState({
        viewType: e.target.value,
        hideDialog: false,
      }, () => {
        this.getTeamRatingDataFromKeen();
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
    this.getTeamRatingDataFromKeen();
  }

  render() {
    let paginationStyleClass = null;

    if (!this.state.showPagination) {
      paginationStyleClass = styles.paginationButtons;
    }

    return (
      <div className={styles.teamUtilizationChartContainer}>
        <div className={styles.reportingBlockContainer}>
          <div className={styles.reportingBlockHeader}>
            <Row>
              <Col md={3} sm={8} xs={12}>
                <h3>Team Rating Chart</h3>
              </Col>
              <Col md={1} sm={4} xs={12}>
                {this.state.loadingAnalytics &&
                <div className={cx('text-right', styles.loadingSpinner)}>
                  <FontAwesomeIcon icon={faSpinner} spin />
                </div>
                }
              </Col>
              <Col md={8} sm={12} xs={12}>
                <Row>
                  <Col md={3}>
                    <ButtonGroup className={cx(paginationStyleClass, styles.chartPagination)}>
                      <Button disabled={this.state.page === 1} onClick={this.previousPage}><span>&#60;</span> Previous</Button>
                      <Button disabled={((this.state.page * 10) >= this.state.entitiesToShow.length)} onClick={this.nextPage}>Next <span>&#62;</span></Button>
                    </ButtonGroup>
                  </Col>
                  <Col md={3} className={styles.customInlineFormElement}>
                    <DropdownFilter
                      name="entityFilter"
                      data={this.state.entities}
                      handleChange={this.entitiesFilterChanged}
                      title="Team"
                      minWidth="120px"
                      maxWidth="180px"
                      searchable
                    />
                  </Col>
                  <Col md={6}>
                    <div className={styles.customSelectElementWrapper}>
                        <div className={styles.customSelectElement}>
                          <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue={this.state.viewType} componentClass="select">
                            <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                            <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                            <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                            <option value="custom" selected={this.state.viewType === 'custom'}>Custom</option>
                          </FormControl>
                        </div>
                        <div className={styles.customSelectElement}>
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
                        </div>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <Row>
              <Col md={12}>
                <span className={styles.timeGraphVerticalLabel}>
                  {this.props.profile.rating_type === 'NPS' ? 'NPS Score' : 'Ratings'}
                </span>
                <ReportingGraph error={this.state.chartError} data={this.state.chartData} type="horizontal-bar" title="Team Time Graph" isStacked="true" chartId="teamChart"/>
              </Col>
            </Row>
        </div>
      </div>
    );
  }

}

TeamRatingChart.proptTypes = {
  profile: PropTypes.object,
  entities: PropTypes.array,
  convertRatings: PropTypes.func,
  initializeRatingsArray: PropTypes.func
};
