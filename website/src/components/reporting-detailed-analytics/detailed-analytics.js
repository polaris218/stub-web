import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './detailed-analytics.module.scss';
import { Grid, Row, Col, Checkbox, FormControl, ControlLabel, Alert } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faAngleDown, faAngleUp } from '@fortawesome/fontawesome-free-solid';
import moment from 'moment/moment';
import DatePicker from 'react-bootstrap-date-picker';
import Keen from 'keen-js';
import cx from 'classnames';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { MultiSelect } from 'react-selectize';

export default class DetailedAnalytics extends Component {
  constructor(props) {
    super(props);

    const entities = [
      {
        title: 'Tasks',
        description: 'Filter based on Task Title'
      },
      {
        title: 'Customers',
        description: 'Filters based on Customers'
      },
      {
        title: 'Entities',
        description: 'Filters based on Entities/Assignees/Crew'
      }
    ];

    const taskFilters = [
      {
        title: 'Start Date',
        type: 'lt',
        fieldType: 'datetime',
        entityType: 'Task Filters',
        property_name: 'start_datetime_original_iso_str',
        value: new Date()
      },
      {
        title: 'End Date',
        type: 'gt',
        fieldType: 'datetime',
        entityType: 'Task Filters',
        property_name: 'end_datetime_original_iso_str',
        value: new Date()
      },
      {
        title: 'Title',
        type: 'eq',
        fieldType: 'text',
        entityType: 'Task Filters',
        property_name: 'title',
        value: ''
      },
      {
        title: 'Status',
        type: 'eq',
        fieldType: 'text',
        entityType: 'Task Filters',
        property_name: 'status',
        value: ''
      },
      {
        title: 'Assignees',
        type: 'eq',
        fieldType: 'select',
        entityType: 'Task Filters',
        property_name: 'entity_ids',
        value: []
      },
      {
        title: 'Resources',
        type: 'eq',
        fieldType: 'select',
        entityType: 'Task Filters',
        property_name: 'resource_ids',
        value: []
      },
      {
        title: 'Mileage',
        type: 'eq',
        fieldType: 'text',
        entityType: 'Task Filters',
        property_name: 'mileage',
        value: ''
      },
    ];

    const customersFilters = [
      {
        title: 'First Name',
        type: 'eq',
        fieldType: 'text',
        entityType: 'Customers Filters',
        property_name: 'customer_first_name',
        value: ''
      },
      {
        title: 'Last Name',
        type: 'eq',
        fieldType: 'text',
        entityType: 'Customers Filters',
        property_name: 'customer_last_name',
        value: ''
      },
      {
        title: 'Address',
        type: 'eq',
        fieldType: 'text',
        entityType: 'Customers Filters',
        property_name: 'customer_address',
        value: ''
      },
      {
        title: 'Email',
        type: 'eq',
        fieldType: 'text',
        entityType: 'Customers Filters',
        property_name: 'customer_email',
        value: ''
      },
      {
        title: 'Company',
        type: 'eq',
        fieldType: 'text',
        entityType: 'Customers Filters',
        property_name: 'customer_company_name',
        value: ''
      },
    ];

    const teamFilters = [
      {
        title: 'Name',
        type: 'eq',
        fieldType: 'select',
        entityType: 'Team Filters',
        property_name: 'entity_ids',
        value: ''
      },
    ];

    const outputFilters = [
      { title: 'Title', value: 'title' },
      { title: 'Start Datetime', value: 'start_datetime' },
      { title: 'End Datetime', value: 'end_datetime' },
      { title: 'Status', value: 'status' },
      { title: 'Customer First Name', value: 'customer_first_name' },
      { title: 'Customer Last Name', value: 'customer_last_name' },
      { title: 'Customer Company', value: 'customer_company_name' },
      { title: 'Customer Address Line 1', value: 'customer_address_line_1' },
      { title: 'Customer Address Line 2', value: 'customer_address_line_2' },
      { title: 'Customer Mobile Number', value: 'customer_mobile_number' },
      { title: 'Customer State', value: 'customer_state' },
      { title: 'Customer Zip Code', value: 'customer_zipcode' },
      { title: 'Mileage', value: 'mileage' }];

    this.state = {
      availableEntities: entities,
      availableTaskFilters: taskFilters,
      availableCustomersFilters: customersFilters,
      availableTeamFilters: teamFilters,
      availableOutputFilters: outputFilters,
      selectedOutputFilters: [],
      selectedOutputFiltersForQuery: [],
      renderedFiltersInSelectionContainer: {
        tasksFilters: [],
        customersFilters: [],
        entitiesFilters: []
      },
      queryFilters: [],
      showEntities: true,
      showFilters: true,
      showOutputFilters: true,
      selectedEntities: {
        Tasks: false,
        Customers: false,
        Equipments: false,
        Entities: false
      },
      selectedFilters: [],
      queryResults: null,
      runningQuery: false,
      querySuccessful: false,
      errorMessage: '',
    };

    this.renderEntitesSelection = this.renderEntitesSelection.bind(this);
    this.switchAccordian = this.switchAccordian.bind(this);
    this.onEntitiesSelectionChange = this.onEntitiesSelectionChange.bind(this);
    this.handleFilterSelection = this.handleFilterSelection.bind(this);
    this.renderSelectedFilters = this.renderSelectedFilters.bind(this);
    this.onSelectedFilterOperatorChange = this.onSelectedFilterOperatorChange.bind(this);
    this.onSelectedFilterValueChange = this.onSelectedFilterValueChange.bind(this);
    this.onSelectedFilterDateValueChanged = this.onSelectedFilterDateValueChanged.bind(this);
    this.generateMonthlyReports = this.generateMonthlyReports.bind(this);
    this.renderOutputFilters = this.renderOutputFilters.bind(this);
    this.handleOutputFilterSelection = this.handleOutputFilterSelection.bind(this);
    this.renderDataTable = this.renderDataTable.bind(this);
    this.renderTableHeads = this.renderTableHeads.bind(this);
    this.onEntitiesFilterValueChange = this.onEntitiesFilterValueChange.bind(this);
    this.generateQueryFilters = this.generateQueryFilters.bind(this);
    this.onInBetweenFilterDateValueChange = this.onInBetweenFilterDateValueChange.bind(this);
    this.generateQueryTimeFrame = this.generateQueryTimeFrame.bind(this);

  }

  generateQueryTimeFrame() {
    const oneMonthAgo = moment(new Date()).subtract(30, 'days');
    let startDate = oneMonthAgo;
    let endDate = new Date();
    const selectedFilter = [...this.state.selectedFilters];
    const startDateTimeFilterIndex = selectedFilter.findIndex((e) => { if (e.property_name === 'start_datetime_original_iso_str') { return e; } });
    const endDateTimeFilterIndex = selectedFilter.findIndex((e) => { if (e.property_name === 'end_datetime_original_iso_str') { return e; } });
    if (startDateTimeFilterIndex !== -1 && selectedFilter[startDateTimeFilterIndex].type === 'between') {
      startDate = selectedFilter[startDateTimeFilterIndex].value.leftField;
    } else if (startDateTimeFilterIndex !== -1 && selectedFilter[startDateTimeFilterIndex].type !== 'between') {
      startDate = selectedFilter[startDateTimeFilterIndex].value;
    }
    if (endDateTimeFilterIndex !== -1 && selectedFilter[endDateTimeFilterIndex].type === 'between') {
      endDate = selectedFilter[endDateTimeFilterIndex].value.rightField;
    } else if (endDateTimeFilterIndex !== -1 && selectedFilter[endDateTimeFilterIndex].type !== 'between') {
      endDate = selectedFilter[endDateTimeFilterIndex].value;
    }

    if (startDateTimeFilterIndex !== -1 && endDateTimeFilterIndex === -1) {
      if (selectedFilter[startDateTimeFilterIndex].type === 'between') {
        endDate = selectedFilter[startDateTimeFilterIndex].value.rightField ? selectedFilter[startDateTimeFilterIndex].value.rightField : new Date();
      }
    } else if (startDateTimeFilterIndex === -1 && endDateTimeFilterIndex !== -1) {
      if (selectedFilter[endDateTimeFilterIndex].type === 'between') {
        startDate = selectedFilter[endDateTimeFilterIndex].value.leftField ? selectedFilter[endDateTimeFilterIndex].value.leftField : new Date();
      }
    }

    const comulatedStartDate = moment(startDate).subtract(24, 'hours').format('YYYY-MM-DDTHH:mm:ss');
    const comulatedEndDate = moment(endDate).add(24, 'hours').format('YYYY-MM-DDTHH:mm:ss');
    const queryTimeFrame = {
      'end' : comulatedEndDate,
      'start' : comulatedStartDate
    };
    return queryTimeFrame;

  }

  onInBetweenFilterDateValueChange(filter, e, dateField) {
    const selectedFilters = [...this.state.selectedFilters];
    const toBeEditedFilter = selectedFilters[selectedFilters.indexOf(filter)];
    if (toBeEditedFilter.value.leftField === null) {
      toBeEditedFilter.value.leftField = new Date();
    }
    if (toBeEditedFilter.value.leftField === null) {
      toBeEditedFilter.value.rightField = new Date();
    }
    const leftFieldDateValue = dateField === 'left' ? e : toBeEditedFilter.value.leftField;
    const rightFieldDateValue = dateField === 'right' ? e : toBeEditedFilter.value.rightField;
    toBeEditedFilter.value = {
      leftField: leftFieldDateValue ? leftFieldDateValue : moment(new Date()).toISOString(),
      rightField: rightFieldDateValue ? rightFieldDateValue : moment(new Date()).toISOString()
    };
    selectedFilters[selectedFilters.indexOf(filter)] = toBeEditedFilter;
    this.setState({
      selectedFilters
    });
  }

  generateQueryFilters() {
    const selectedFilters = [...this.state.selectedFilters];
    const queryFilters = [];
    selectedFilters.map((filter) => {
      if (filter.property_name === 'entity_ids' || filter.property_name === 'resource_ids') {
        const values = filter.value;
        values.map((IDsFilterValue) => {
          queryFilters.push({
            operator: filter.type,
            property_name: filter.property_name,
            property_value: IDsFilterValue.value
          });
        });
      } else if (filter.fieldType === 'datetime' && filter.type === 'between') {
        queryFilters.push({
          operator: 'gte',
          property_name: filter.property_name,
          property_value: filter.value.leftField ? filter.value.leftField : moment(new Date()).format('YYYY-MM-DDTHH:mm:ss')
        });
        queryFilters.push({
          operator: 'lte',
          property_name: filter.property_name,
          property_value: filter.value.rightField ? filter.value.rightField : moment(new Date()).format('YYYY-MM-DDTHH:mm:ss')
        });
      } else {
        queryFilters.push({
          operator: filter.type,
          property_name: filter.property_name,
          property_value: filter.value
        });
      }
    });
    return queryFilters;
  }

  onEntitiesFilterValueChange(filter, values) {
    const selectedFilters = [...this.state.selectedFilters];
    const valueArray = [];
    values.map((filterValue) => {
      valueArray.push(filterValue);
    });
    const editedFilter = selectedFilters[selectedFilters.indexOf(filter)];
    editedFilter.value = valueArray;
    selectedFilters[selectedFilters.indexOf(filter)] = editedFilter;
    this.setState({
      selectedFilters
    });
  }

  renderTableHeads() {
    const outputFilters = [...this.state.selectedOutputFilters];
    if (outputFilters.length > 0) {
      const renderedTableHeads = outputFilters.map((filter, i) => {
        return (
          <th key={i}>
            {filter.title}
          </th>
        );
      });
      return renderedTableHeads;
    } else if (outputFilters.length === 0 && this.state.queryResults !== null) {
      const defaultOutPutFilters = [{ title: 'Title', value: 'title' }, { title: 'Start Datetime', value: 'start_datetime' }, { title: 'End Datetime', value: 'end_datetime' }, { title: 'Status', value: 'status' }];
      const renderedTableHeads = defaultOutPutFilters.map((filter, i) => {
        return (
          <th key={i}>
            {filter.title}
          </th>
        );
      });
      return renderedTableHeads;
    } else {
      return;
    }
  }

  renderDataTable() {
    const results = { ...this.state.queryResults };
    if (results.result && results.result.length > 0) {
      const queryResults = results.result;
      let selectedOutPutFilters = [...this.state.selectedOutputFiltersForQuery];
      if (selectedOutPutFilters.length === 0) {
        selectedOutPutFilters = ['title', 'start_datetime', 'end_datetime', 'status'];
      }
      const renderedQueryResults = queryResults.map((resultRow, i) => {
        return (
          <tr>
            {
              selectedOutPutFilters.map((filter) => {
                return (
                  <td>
                    {resultRow[filter]}
                  </td>
                );
              })
            }
          </tr>
        );
      });
      return renderedQueryResults;
    } else {
      return (
        <tr>
          <td className="text-center" colSpan={ this.state.selectedOutputFiltersForQuery.length }>
            No results found.
          </td>
        </tr>
      );
    }
  }

  switchAccordian(acc) {
    if (acc === 'entities') {
      this.setState({
        showEntities: !this.state.showEntities
      });
    } else if (acc === 'filters') {
      this.setState({
        showFilters: !this.state.showFilters
      });
    } else if (acc === 'output') {
      this.setState({
        showOutputFilters: !this.state.showOutputFilters
      });
    }
  }

  generateMonthlyReports() {
    this.setState({
      runningQuery: true,
      querySuccessful: false,
      errorMessage: ''
    });
    const client = new Keen({
      projectId: '5a47257446e0fb00018e2cf7',
      readKey: '55FB4DAEB1012EF9273FC290916E6321BDD1B76A13D11BDEDB73766B3B8106612F5E98F9436BFAD669E26E60BABABA2FA2053F9B9211572AFF38F70DD2FECB7EB504A13AD1013C387781B58E0336BC64A0E12616C27F8333D3762B8BB15DF89A'
    });

    let profileID = this.props.profile.owned_company_id || this.props.profile.owner;

    const filters = { 'operator':'eq', 'property_name':'owner', 'property_value':profileID };
    const filtersArray = this.generateQueryFilters();
    filtersArray.push(filters);
    let propertyNames = [...this.state.selectedOutputFiltersForQuery];
    if (propertyNames.length === 0) {
      propertyNames = ['title', 'start_datetime', 'end_datetime', 'status'];
    }
    const timeFrame = this.generateQueryTimeFrame();
    // const element = document.getElementById('keen-table-chart');
    client
      .query('extraction', {
        event_collection: profileID + '',
        timeframe: timeFrame,
        timezone: 18000,
        filters: filtersArray,
        property_names: propertyNames
      })
      .then(res => {
        this.setState({
          queryResults: res,
          runningQuery: false,
          querySuccessful: true
        }, () => { this.renderDataTable(); });
      })
      .catch(err => {
        this.setState({
          errorMessage: err.message,
          runningQuery: false,
          querySuccessful: false
        }, () => { this.renderDataTable(); });
      });
  }

  onSelectedFilterDateValueChanged(filter, e) {
    const selectedFilters = [...this.state.selectedFilters];
    selectedFilters[selectedFilters.indexOf(filter)].value = e;
    this.setState({
      selectedFilters
    });
  }

  handleFilterSelection(val, checked) {
    const filterData = val;
    const selectedFilters = [...this.state.selectedFilters];
    const queryFilters = [...this.state.queryFilters];
    if (checked) {
      if (filterData.property_name === 'entity_ids' || filterData.property_name === 'resource_ids') {
        selectedFilters.splice(selectedFilters.indexOf(filterData), 1);
        queryFilters.forEach((qFilter) => {
          queryFilters.splice(queryFilters.findIndex((e) => { return e.property_name === filterData.property_name; }), 1);
        });
      } else {
        selectedFilters.splice(selectedFilters.indexOf(filterData), 1);
        const toBeRemovedQueryFilter =  {
          'operator': filterData.type,
          'property_name': filterData.property_name,
          'property_value': filterData.value
        };
        queryFilters.splice(queryFilters.indexOf(toBeRemovedQueryFilter), 1);
      }
    } else {
      selectedFilters.push(filterData);
      const newQueryFilter =  {
        'operator': filterData.type,
        'property_name': filterData.property_name,
        'property_value': filterData.value
      };
      queryFilters.push(newQueryFilter);
    }
    this.setState({
      selectedFilters,
      queryFilters
    }, () => { this.renderSelectedFilters(); });
  }

  handleOutputFilterSelection(val, checked) {
    const filterData = val;
    const selectedOutputFilters = [...this.state.selectedOutputFilters];
    const selectedOutputFiltersForQuery = [...this.state.selectedOutputFiltersForQuery];
    if (checked) {
      selectedOutputFilters.splice(selectedOutputFilters.indexOf(filterData), 1);
      selectedOutputFiltersForQuery.splice(selectedOutputFiltersForQuery.indexOf(filterData.value), 1);
    } else {
      selectedOutputFilters.push(filterData);
      selectedOutputFiltersForQuery.push(filterData.value);
    }
    this.setState({
      selectedOutputFilters,
      selectedOutputFiltersForQuery
    }, function () { this.renderSelectedFilters(); });
  }

  onSelectedFilterValueChange(filter, e) {
    const selectedFilters = [...this.state.selectedFilters];
    selectedFilters[selectedFilters.indexOf(filter)].value = e.target.value;
    this.setState({
      selectedFilters
    });
  }

  onSelectedFilterOperatorChange(filter, e) {
    const selectedFilters = [...this.state.selectedFilters];
    selectedFilters[selectedFilters.indexOf(filter)].type = e.target.value;
    this.setState({
      selectedFilters
    });
  }

  renderSelectedFilters() {
    const selectedFilters = this.state.selectedFilters;
    const renderedSelectedFilters = selectedFilters.map((filter, i) => {
      let date = new Date();
      if (filter.fieldType === 'datetime' && filter.value !== '') {
        date = filter.value;
      }
      let leftDate = new Date();
      let rightDate = new Date();
      if (filter.fieldType === 'datetime' && filter.type === 'between' && typeof filter.value.leftField !== 'undefined') {
        leftDate = filter.value.leftField;
      }
      if (filter.fieldType === 'datetime' && filter.type === 'between' && typeof filter.value.rightField !== 'undefined') {
        rightDate = filter.value.rightField;
      }
      const entitiesList = [...this.props.entities];
      const equipmentsList = [...this.props.equipments];
      let renderedOperator = null;
      if (filter.type === 'eq' && filter.fieldType !== 'datetime') {
        renderedOperator = (
          <FormControl defaultValue={filter.type} onChange={(e) => this.onSelectedFilterOperatorChange(filter, e)} componentClass="select">
            <option value="eq">&#61; Equals</option>
          </FormControl>
        );
      } else if (filter.fieldType === 'datetime') {
        renderedOperator = (
          <FormControl defaultValue={filter.type} onChange={(e) => this.onSelectedFilterOperatorChange(filter, e)} componentClass="select">
            <option value="eq">&#61; Equals</option>
            <option value="gt">&#62; Greater Than</option>
            <option value="lt">&#60; Less Than</option>
            <option value="between">&#8812; In Between</option>
          </FormControl>
        );
      } else {
        renderedOperator = (
          <FormControl defaultValue={filter.type} onChange={(e) => this.onSelectedFilterOperatorChange(filter, e)} componentClass="select">
            <option value="eq">&#61; Equals</option>
            <option value="gt">&#62; Greater Than</option>
            <option value="lt">&#60; Less Than</option>
          </FormControl>
        );
      }
      return (
        <Row className={styles.filterOptionsContainer}>
          <Col md={filter.type === 'datetime' ? 3 : 4}>
            <ControlLabel className={styles.filterOptionslabel}>
              {filter.title}
            </ControlLabel>
          </Col>
          <Col md={filter.type === 'datetime' ? 3 : 4}>
            {renderedOperator}
          </Col>
          <Col md={filter.type === 'datetime' ? 3 : 4}>
            {filter.fieldType === 'text' &&
              <FormControl onChange={(e) => this.onSelectedFilterValueChange(filter, e)} type="text" value={filter.value} />
            }
            {filter.fieldType === 'datetime' && filter.type !== 'between' &&
              <DatePicker id="start_date" value={moment(date).local().format()} onChange={(e) => this.onSelectedFilterDateValueChanged(filter, e)} showClearButton={false} showTodayButton />
            }
            {filter.fieldType === 'datetime' && filter.type === 'between' &&
              <Row>
                <Col md={6}>
                  <DatePicker id="start_date" value={moment(leftDate).local().format()} onChange={(e) => this.onInBetweenFilterDateValueChange(filter, e, 'left')} showClearButton={false} showTodayButton />
                </Col>
                <Col md={6}>
                  <DatePicker id="start_date" value={moment(rightDate).local().format()} onChange={(e) => this.onInBetweenFilterDateValueChange(filter, e, 'right')} showClearButton={false} showTodayButton />
                </Col>
              </Row>
            }
            {filter.property_name === 'entity_ids' &&
            <MultiSelect
              placeholder = "Select Entities"
              className={styles.selectizeMultiSelect}
              options = {entitiesList.map(
                entity => ({ label: entity.name, value: entity.id })
              )}
              onValuesChange = {value => this.onEntitiesFilterValueChange(filter, value)}
            />
            }
            {filter.property_name === 'resource_ids' &&
            <MultiSelect
              placeholder = "Select Resources"
              className={styles.selectizeMultiSelect}
              options = {equipmentsList.map(
                entity => ({ label: entity.name, value: entity.id })
              )}
              onValuesChange = {value => this.onEntitiesFilterValueChange(filter, value)}
            />
            }
          </Col>
        </Row>
      );
    });
    return renderedSelectedFilters;
  }

  onEntitiesSelectionChange(entity, checked) {
    const value = entity.title;
    const toBeRenderedFilters = { ...this.state.renderedFiltersInSelectionContainer };
    const selectedFilters = [...this.state.selectedFilters];
    if (value === 'Tasks' && !checked) {
      toBeRenderedFilters.tasksFilters = [...this.state.availableTaskFilters];
    } else if (value === 'Tasks' && checked) {
      toBeRenderedFilters.tasksFilters = [];
      const availableTaskFilters = [...this.state.availableTaskFilters];
      availableTaskFilters.map((filter) => {
        if (selectedFilters.indexOf(filter) !== -1) {
          selectedFilters.splice(selectedFilters.indexOf(filter), 1);
        }
      });
    }
    if (value === 'Customers' && !checked) {
      toBeRenderedFilters.customersFilters = [...this.state.availableCustomersFilters];
    } else if (value === 'Customers' && checked) {
      toBeRenderedFilters.customersFilters = [];
      const availableCustomersFilters = [...this.state.availableCustomersFilters];
      availableCustomersFilters.map((filter) => {
        if (selectedFilters.indexOf(filter) !== -1) {
          selectedFilters.splice(selectedFilters.indexOf(filter), 1);
        }
      });
    }
    if (value === 'Entities' && !checked) {
      toBeRenderedFilters.entitiesFilters = [...this.state.availableTeamFilters];
    } else if (value === 'Entities' && checked) {
      toBeRenderedFilters.entitiesFilters = [];
      const availableTeamFilters = [...this.state.availableTeamFilters];
      availableTeamFilters.map((filter) => {
        if (selectedFilters.indexOf(filter) !== -1) {
          selectedFilters.splice(selectedFilters.indexOf(filter), 1);
        }
      });
    }
    const selectedEntities = { ...this.state.selectedEntities };
    selectedEntities[value] = !selectedEntities[value];
    this.setState({
      renderedFiltersInSelectionContainer: toBeRenderedFilters,
      selectedEntities,
      selectedFilters
    });
  }

  renderEntitesSelection() {
    const entities = this.state.availableEntities;
    const renderedEntitiesSelectionModals = entities.map((entity, i) => {
      let checkCheckbox = false;
      const selectedEntities = { ...this.state.selectedEntities };
      checkCheckbox = selectedEntities[entity.title];
      return (
        <div key={i}>
          <Checkbox checked={this.state.selectedEntities[entity.title]} onChange={() => this.onEntitiesSelectionChange(entity, checkCheckbox)} value={entity.title}>{entity.title}</Checkbox>
        </div>
      );
    });
    return renderedEntitiesSelectionModals;
  }

  renderOutputFilters() {
    const renderFilters = [...this.state.availableOutputFilters];
    if (renderFilters.length > 0) {
      const renderedFilters = renderFilters.map((filter, i) => {
        let checkCheckbox = false;
        const selectedFilters = [...this.state.selectedOutputFilters];
        if (selectedFilters.indexOf(filter) !== -1) {
          checkCheckbox = true;
        }
        return (
          <div key={i}>
            <Checkbox checked={checkCheckbox} onClick={() => this.handleOutputFilterSelection(filter, checkCheckbox)} value={filter.value}>{filter.title}</Checkbox>
          </div>
        );
      });
      return renderedFilters;
    } else {
      return (<p>No filters available.</p>);
    }
  }

  renderTasksFiltersSelection() {
    const renderFilters = [...this.state.renderedFiltersInSelectionContainer.tasksFilters];
    if (renderFilters.length > 0) {
      const renderedFilters = renderFilters.map((filter, i) => {
        let checkCheckbox = false;
        const selectedFilters = this.state.selectedFilters;
        if (selectedFilters.indexOf(filter) !== -1) {
          checkCheckbox = true;
        }
        return (
          <div key={i}>
            <Checkbox checked={checkCheckbox} onClick={() => this.handleFilterSelection(filter, checkCheckbox)} value={filter}>{filter.title}</Checkbox>
          </div>
        );
      });
      return renderedFilters;
    }
  }

  renderCustomersFiltersSelection() {
    const renderFilters = [...this.state.renderedFiltersInSelectionContainer.customersFilters];
    if (renderFilters.length > 0) {
      const renderedFilters = renderFilters.map((filter, i) => {
        let checkCheckbox = false;
        const selectedFilters = this.state.selectedFilters;
        if (selectedFilters.indexOf(filter) !== -1) {
          checkCheckbox = true;
        }
        return (
          <div key={i}>
            <Checkbox checked={checkCheckbox} onClick={() => this.handleFilterSelection(filter, checkCheckbox)} value={filter}>{filter.title}</Checkbox>
          </div>
        );
      });
      return renderedFilters;
    }
  }

  renderEntitiesFiltersSelection() {
    const renderFilters = [...this.state.renderedFiltersInSelectionContainer.entitiesFilters];
    if (renderFilters.length > 0) {
      const renderedFilters = renderFilters.map((filter, i) => {
        let checkCheckbox = false;
        const selectedFilters = this.state.selectedFilters;
        if (selectedFilters.indexOf(filter) !== -1) {
          checkCheckbox = true;
        }
        return (
          <div key={i}>
            <Checkbox checked={checkCheckbox} onClick={() => this.handleFilterSelection(filter, checkCheckbox)} value={filter}>{filter.title}</Checkbox>
          </div>
        );
      });
      return renderedFilters;
    }
  }

  render() {
    return (
      <div className={styles.detailedAnalyticsPageContainer}>
        <Grid>
          <Row className={styles.pageIntroContainer}>
            <Col md={6}>
              <h2>Detailed Reports</h2>
              <p>Custom Analytics</p>
            </Col>
          </Row>
          <Row>
            <Col md={3} sm={5} xs={6}>
              <div className={styles.filterEntitiesContainer}>
                <div onClick={() => this.switchAccordian('entities')} className={cx(styles.customAccordianHead, this.state.showEntities && styles.customAccordianHeadActive)}>
                  Entities
                  {this.state.showEntities
                    ?
                    <FontAwesomeIcon className={styles.accordianIcon} icon={faAngleUp} />
                    :
                    <FontAwesomeIcon className={styles.accordianIcon} icon={faAngleDown} />
                  }
                </div>
                {this.state.showEntities &&
                  <div className={styles.entitesSelectionContainer}>
                    {this.renderEntitesSelection()}
                  </div>
                }
                <div onClick={() => this.switchAccordian('filters')} className={cx(styles.customAccordianHead, this.state.showFilters && styles.customAccordianHeadActive)}>
                  Filters
                  {this.state.showFilters
                    ?
                    <FontAwesomeIcon className={styles.accordianIcon} icon={faAngleUp} />
                    :
                    <FontAwesomeIcon className={styles.accordianIcon} icon={faAngleDown} />
                  }
                </div>
                {this.state.showFilters &&
                  <div className={cx(styles.entitesSelectionContainer, styles.filtersContainer)}>
                    {this.state.renderedFiltersInSelectionContainer.tasksFilters.length > 0 &&
                    <div>
                      <h3 className={styles.inlineFiltersGrouping}>Tasks Filters</h3>
                      {this.renderTasksFiltersSelection()}
                    </div>
                    }
                    {this.state.renderedFiltersInSelectionContainer.customersFilters.length > 0 &&
                    <div>
                      <h3 className={styles.inlineFiltersGrouping}>Customers Filters</h3>
                      {this.renderCustomersFiltersSelection()}
                    </div>
                    }
                    {this.state.renderedFiltersInSelectionContainer.entitiesFilters.length > 0 &&
                    <div>
                      <h3 className={styles.inlineFiltersGrouping}>Entities Filters</h3>
                      {this.renderEntitiesFiltersSelection()}
                    </div>
                    }
                    {
                      this.state.renderedFiltersInSelectionContainer.tasksFilters.length === 0 &&
                      this.state.renderedFiltersInSelectionContainer.customersFilters.length === 0 &&
                      this.state.renderedFiltersInSelectionContainer.entitiesFilters.length === 0 &&
                      <p>No filters available. Please select an entity above.</p>
                    }
                  </div>
                }
                <div onClick={() => this.switchAccordian('output')} className={cx(styles.customAccordianHead, this.state.showOutputFilters && styles.customAccordianHeadActive)}>
                  Output
                  {this.state.showOutputFilters
                    ?
                    <FontAwesomeIcon className={styles.accordianIcon} icon={faAngleUp} />
                    :
                    <FontAwesomeIcon className={styles.accordianIcon} icon={faAngleDown} />
                  }
                </div>
                {this.state.showOutputFilters &&
                <div className={cx(styles.entitesSelectionContainer, styles.outPutFiltersContainer)}>
                  {this.renderOutputFilters()}
                </div>
                }
              </div>
            </Col>
            <Col md={9} sm={7} xs={6}>
              <div>
                <div className={styles.entitiesValuesContainer}>
                  <h1>
                    Selected Entities
                  </h1>
                  <ul className={styles.selectedEntitiesName}>
                    {this.state.selectedEntities.Tasks && <li>Tasks</li>}
                    {this.state.selectedEntities.Customers && <li>Customers</li>}
                    {this.state.selectedEntities.Entities && <li>Entities</li>}
                  </ul>
                  {!this.state.selectedEntities.Tasks && !this.state.selectedEntities.Customers && !this.state.selectedEntities.Entities &&
                  <p className={styles.noEntitySelectionMessage}>Nothing selected.</p>
                  }
                </div>
                <div className={styles.filtersValuesContainer}>
                  <h1>
                    Selected Filters
                  </h1>
                  <div className={styles.selectedFilersContainer}>
                    {this.state.selectedFilters.length === 0 && <p className={styles.noEntitySelectionMessage}>Nothing selected.</p>}
                    <Grid>
                      {this.renderSelectedFilters()}
                    </Grid>
                  </div>
                </div>
                <div className={styles.expectedOutputValuesContainer}>
                  <h1>
                    Expected Output
                  </h1>
                  <ul className={styles.selectedEntitiesName}>
                    {this.state.selectedOutputFilters.map((filter) => {
                      return (<li>{filter.title}</li>);
                    })}
                  </ul>
                  { this.state.selectedOutputFilters.length === 0 && <p className={styles.noEntitySelectionMessage}>Nothing selected.</p> }
                </div>
                <div className="text-right">
                  <button onClick={() => this.generateMonthlyReports()} className={styles.generateAnalyticsButton}>Go</button>
                </div>
              </div>
            </Col>
          </Row>
        </Grid>
        <Grid>
          <Row>
            <Col md={12}>
              <div className={styles.outputContainer}>
                {!this.state.runningQuery && this.state.querySuccessful && this.state.queryResults !== null &&
                  <table className="table table-condensed table-hover table-bordered">
                    <thead>
                    <tr>
                      {this.renderTableHeads()}
                    </tr>
                    </thead>
                    <tbody>
                    {this.renderDataTable()}
                    </tbody>
                  </table>
                }
                {this.state.runningQuery &&
                  <SavingSpinner title="Running Query" borderStyle="none" />
                }
                {!this.state.runningQuery && !this.state.querySuccessful && this.state.errorMessage !== '' &&
                  <Alert bsStyle="danger">
                    {this.state.errorMessage}
                  </Alert>
                }
                {!this.state.runningQuery && !this.state.querySuccessful && this.state.errorMessage === '' &&
                  <Alert bsStyle="info">
                    Select an Entity, Query Filters and Output Filters and click Go to run query.
                  </Alert>
                }
              </div>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}

DetailedAnalytics.propTypes = {
  entities: PropTypes.array,
  equipments: PropTypes.array,
  profile: PropTypes.object
};
