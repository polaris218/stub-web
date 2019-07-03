import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './team-utilization-chart.module.scss';
import { Row, Col, FormControl, ButtonGroup, Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import Keen from 'keen-js';
import { get_report } from '../../../../actions';
import ReportingGraph from '../../../reporting-graph/reporting-graph';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSpinner, faCalendarAlt } from '@fortawesome/fontawesome-free-solid';
import DropdownFilter from '../../../dropdown-filter/dropdown-filter';
import TimeFilterInReports from "../../../time-filter-in-reports/time-filter-in-reports";
import moment from "moment";

export default class TeamUtilizationChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showDialog:false,
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
      startDate:'',
      endDate:'',
      hideDialog: true,
      inputValueStartDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      inputValueEndDate:moment().format('YYYY-MM-DD HH:mm:ss'),
      lowerBound:'',
      upperBound:'',

    };

    this.updateReportDuration = this.updateReportDuration.bind(this);
    this.getTeamUtilizationDataFromKeen = this.getTeamUtilizationDataFromKeen.bind(this);
    this.entitiesFilterChanged = this.entitiesFilterChanged.bind(this);
    this.generateChartData = this.generateChartData.bind(this);
    this.nextPage = this.nextPage.bind(this);
    this.previousPage = this.previousPage.bind(this);
    this.onHide = this.onHide.bind(this);
    this.runCall = this.runCall.bind(this);
    this.getDates = this.getDates.bind(this);
  }

  componentDidMount() {
    this.getTeamUtilizationDataFromKeen();
  }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(this.props.group_ids, nextProps.group_ids)) {
            this.setState({
                group_ids: nextProps.group_ids,
            }, () => {this.getTeamUtilizationDataFromKeen();})
        }
    }

  getDates(startDate, endDate){
    this.setState({
      startDate:startDate,
      endDate:endDate
    },()=>this.runCall());
  }

  runCall(){
    this.getTeamUtilizationDataFromKeen();
  }

  getTeamUtilizationDataFromKeen() {
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
      endDate = '';
    } else if (timeFrame === 'this_30_days'){
      startDate = "";
      endDate = "";
    }

    get_report({reportName: 'team_utilization', params: {timeframe:timeFrame, group_ids, startDate, endDate}})
      .then((res) => {

        const entitiesData = [];
        const filterEntities = [];
        let entity = {
          id: null,
          travel_time: 0,
          task_time: 0,
          name: ''
        };
        while (res.result.length > 0) {
          if (entity.id === res.result[0].entity_id) {
            entity.travel_time = res.result[0].travel_time;
            entity.task_time = res.result[0].task_time;
          } else {
            if (entity.id && (entity.travel_time > 0 || entity.task_time > 0)) {
              const entityForFilter = {
                id: entity.id,
                name: entity.name,
              };
              entitiesData.push(entity);
              filterEntities.push(entityForFilter);
            }
            entity = {
              id: res.result[0].entity_id,
              travel_time: res.result[0].travel_time,
              task_time: res.result[0].task_time,
              name: res.result[0].entity
            };
          }
          res.result.splice(0, 1);
        }
        if ((entity.travel_time > 0 || entity.task_time > 0)) {
          const entityForFilter = {
            id: entity.id,
            name: entity.name,
          };
          entitiesData.push(entity);
          filterEntities.push(entityForFilter);
        }
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

  onHide(){
    this.setState({
      showDialog:false
    });
  }

  generateChartData(entitiesData = this.state.totalDataFromKeen) {
    const ds = new Keen.Dataset();
    const entities = this.state.entitiesToShow;
    let entityIndex = -1;
    const page = this.state.page - 1;
    if (entitiesData) {
      for (let j = (page  * 10); j < entities.length && j < (10 + (page * 10)); j++) {
        entityIndex = entitiesData.map((entityTime) => {
          return entityTime.id;
        }).indexOf(entities[j].id);
        if (entityIndex > -1) {
          ds.set(['Task Time', entities[j].name], (entitiesData[entityIndex].task_time && entitiesData[entityIndex].task_time > 0) ?
            (entitiesData[entityIndex].task_time / 60).toFixed(2) : 0);
          ds.set(['Travel Time', entities[j].name], (entitiesData[entityIndex].travel_time && entitiesData[entityIndex].travel_time > 0) ?
            (entitiesData[entityIndex].travel_time / 60).toFixed(2) : 0);
        } else {
          ds.set(['Task Time', entities[j].name], 0);
          ds.set(['Travel Time', entities[j].name], 0);
        }
      }
      this.setState({
        showPagination: (entities.length > 10) ? true : false,
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
        this.getTeamUtilizationDataFromKeen();
      });
    }  else {
     this.setState({
        viewType: e.target.value,
        hideDialog: true,
      });
      }
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
                <Col md={3} sm={10} xs={8}>
                  <h3>
                    Team Utilization Chart
                  </h3>
                </Col>
              <Col md={1} sm={2} xs={2}>
                <div className={cx('text-right', styles.loadingSpinner)}>
                {this.state.loadingAnalytics &&
                  <FontAwesomeIcon icon={faSpinner} spin />
                }
                </div>
              </Col>
              <Col md={8}>
                <Row>
                  <Col lg={3} md={1} sm={3} xs={12}>
                    <ButtonGroup className={cx(paginationStyleClass, styles.chartPagination)}>
                      <Button disabled={this.state.page === 1} onClick={this.previousPage}><span>&#60;</span> Previous</Button>
                      <Button disabled={((this.state.page * 10) >= this.state.entitiesToShow.length)} onClick={this.nextPage}>Next <span>&#62;</span></Button>
                    </ButtonGroup>
                  </Col>
                  <Col lg={2} md={3} sm={3} xs={12} className={styles.customInlineFormElement}>
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
                  <Col lg={3} md={3} sm={2} xs={12} className={styles.customSelectElement}>
                    <FormControl onChange={(e) => this.updateReportDuration(e)} defaultValue={this.state.viewType}
                                 componentClass="select">
                      <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                      <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                      <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                      <option value="custom" selected={this.state.viewType === 'custom'}>Custom</option>
                    </FormControl>
                  </Col>
                  <Col lg={4} md={4} sm={4} xs={12} className={styles.customSelectElement}>
                      <TimeFilterInReports
                        showDialogBox = {this.state.showDialog}
                        onHide = {this.onHide}
                        view = {this.state.viewType}
                        getDate ={this.getDates}
                        runCalls ={this.runCall}
                        disableFields={this.state.hideDialog}
                        startDate ={this.state.startDate}
                        endDate={this.state.endDate}
                      />
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <div className={styles.reportingBlockBody}>
            <Row>
              <Col md={12}>
                <span className={styles.timeGraphVerticalLabel}>
                  Hours
                </span>
                <ReportingGraph error={this.state.chartError} data={this.state.chartData} type="horizontal-bar" title="Team Time Graph" isStacked="false" chartId="teamChart"/>
              </Col>
            </Row>
          </div>
        </div>
      </div>
    );
  }

}

TeamUtilizationChart.proptTypes = {
  profile: PropTypes.object,
  entities: PropTypes.array
};
