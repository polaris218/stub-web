import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './bar-graph.module.scss';
import { Row, Col, ControlLabel, FormControl, Form, FormGroup } from 'react-bootstrap';
import cx from 'classnames';
import Keen from 'keen-js';
import style from 'keen-js/dist/keen.min.css';
import DropdownFilter from '../dropdown-filter/dropdown-filter';

export default class BarGraph extends Component {
  constructor(props) {
    super(props);
    this.state = {
      monthlyReport: null,
      viewType: 'monthly',
      dailyInterval: 'this_24_hours',
      weeklyInterval: 'this_7_days',
      monthlyInterval: 'this_30_days',
      profile: null,
      selectedEquipmentsFilter: [],
      selectedEntitiesFilter: [],
      interval: 'daily',
      entities: props.entities,
      equipments: props.equipments
    };
    this.updateReportDuration = this.updateReportDuration.bind(this);
    this.equipmentFilterChanged = this.equipmentFilterChanged.bind(this);
    this.entitiesFilterChanged = this.entitiesFilterChanged.bind(this);
    this.handleIntervalChange = this.handleIntervalChange.bind(this);
  }

  componentDidMount() {
    this.getMonthlyReports();
    this.setState({
      entities: this.props.entities,
      equipments: this.props.equipments
    });
  }

  getMonthlyReports(viewType = this.state.viewType) {
    const client = new Keen({
      projectId: '5a47257446e0fb00018e2cf7',
      readKey: '55FB4DAEB1012EF9273FC290916E6321BDD1B76A13D11BDEDB73766B3B8106612F5E98F9436BFAD669E26E60BABABA2FA2053F9B9211572AFF38F70DD2FECB7EB504A13AD1013C387781B58E0336BC64A0E12616C27F8333D3762B8BB15DF89A'
    });

    let timeFrame = this.state.monthlyInterval;
    if (viewType === 'weekly') {
      timeFrame = this.state.weeklyInterval;
    } else if (viewType === 'daily') {
      timeFrame = this.state.dailyInterval;
    } else {
      timeFrame = this.state.monthlyInterval;
    }
    let profileID = this.props.profile.owned_company_id || this.props.profile.owner;

    const filters = [{ 'operator':'eq', 'property_name':'owner', 'property_value':5629499534213120 }];
    if (this.state.selectedEntitiesFilter.length > 0) {
      this.state.selectedEntitiesFilter.map((enFilter) => {
        filters.push({
          'operator':'eq',
          'property_name':'entity_ids',
          'property_value': enFilter
        });
      });
    }
    if (this.state.selectedEquipmentsFilter.length > 0) {
      this.state.selectedEquipmentsFilter.map((eqFilter) => {
        filters.push({
          'operator':'eq',
          'property_name':'resource_ids',
          'property_value': eqFilter
        });
      });
    }
    const interval = this.state.interval || 'daily';
    Keen.ready(function () {
      const element = document.getElementById('keen-stacked-column-chart');
      const chart = new Keen.Dataviz()
        .el(element)
        .type('bar')
        .stacked(true)
        .height(400)
        .prepare();
      client
        .query('count', {
          event_collection: profileID + '',
          filters: filters,
          timeframe: timeFrame,
          interval: interval,
          group_by: ['event_type'],
          timezone: 18000,
        })
        .then(res => {
          chart
            .data(res)
            .title(null)
            .render();
        })
        .catch(err => {
          chart
            .message(err.message);
        });
    });
  }

  handleIntervalChange(e) {
    this.setState({
      interval: e.target.value
    }, () => { this.getMonthlyReports(); });
  }

  updateReportDuration(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      viewType: e.target.value
    }, () => { this.getMonthlyReports(); });
  }

  equipmentFilterChanged(selectedEquipments) {
    this.setState({ selectedEquipmentsFilter: selectedEquipments.map(item => item.id) }, function () { this.getMonthlyReports(); });
  }

  entitiesFilterChanged(selectedEntities) {
    this.setState({ selectedEntitiesFilter: selectedEntities.map(item => item.id) }, function () { this.getMonthlyReports(); });
  }

  render() {
    return (
      <div>
        <div className={styles.reportingBlock}>
          <div className={styles.reportingBlockHeader}>
            <Row>
              <Col md={6} sm={12} xs={12}>
                <Row>
                  <Col md={4} sm={6}>
                    <FormGroup className={styles.customInlineFormElement}>
                      <FormControl  onChange={(e) => this.updateReportDuration(e)} defaultValue="monthly" componentClass="select">
                        <option value="monthly" selected={this.state.viewType === 'monthly'}>Last 30 Days</option>
                        <option value="weekly" selected={this.state.viewType === 'weekly'}>Last 7 Days</option>
                        <option value="daily" selected={this.state.viewType === 'daily'}>Last 24 Hours</option>
                      </FormControl>
                    </FormGroup>
                  </Col>
                  <Col md={4} sm={6}>
                    <FormGroup className={styles.customInlineFormElement}>
                      <FormControl onChange={(e) => this.handleIntervalChange(e)} defaultValue="daily" componentClass="select">
                        <option value="hourly" selected={this.state.interval === 'hourly'}>Hourly</option>
                        <option value="daily" selected={this.state.interval === 'daily'}>Daily</option>
                        <option value="weekly" selected={this.state.interval === 'weekly'}>Weekly</option>
                      </FormControl>
                    </FormGroup>
                  </Col>
                </Row>
              </Col>
              <Col md={6} sm={12} xs={12}>
                <Row>
                  <Col md={4}>
                    &nbsp;
                  </Col>
                  <Col md={4} className={styles.customInlineFormElement}>
                    <DropdownFilter
                      name="equipmentFilter"
                      ref={instance => {
                        this.equipmentFilterInstance = instance;
                      }}
                      data={this.state.equipments}
                      handleChange={this.equipmentFilterChanged}
                      title="Equipment"
                      minWidth="120px"
                      maxWidth="180px"
                      searchable
                    />
                  </Col>
                  <Col md={4} className={styles.customInlineFormElement}>
                    <DropdownFilter
                      name="equipmentFilter"
                      ref={instance => {
                        this.equipmentFilterInstance = instance;
                      }}
                      data={this.state.entities}
                      handleChange={this.entitiesFilterChanged}
                      title="Entities"
                      minWidth="120px"
                      maxWidth="180px"
                      searchable
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
          <div className={cx(styles.reportingBlockBody, styles.barGraphContainer)}>
            <div id="keen-stacked-column-chart">

            </div>
          </div>
        </div>
      </div>
    );
  }
}

BarGraph.propTypes = {
  entities: PropTypes.array,
  equipments: PropTypes.array,
  profile: PropTypes.object
};
