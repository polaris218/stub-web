import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, Modal, Button, FormGroup, Col } from 'react-bootstrap';
import styles from './task-export.module.scss';
import DatePicker from 'react-bootstrap-date-picker';
import { FieldGroup } from '../fields';
import classNames from 'classnames';
import SavingSpinner from '../saving-spinner/saving-spinner';
import moment from 'moment';
import { getStatusDetails } from '../../helpers/status_dict_lookup';
import download from 'downloadjs';
import json2csv from 'json2csv';

export default class TaskExport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start_date: new Date(Date.now()).toISOString(),
      end_date: new Date(Date.now()).toISOString(),
      selectingDates: true,
      exportCompleted: false,
      dateRangeExceedError: false,
      isFetching: false,
      fetchingError: false,
      recordsCount: 0
    };

    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.handleExportCompleted = this.handleExportCompleted.bind(this);
    this.exportUnscheduledTasksOnly = this.exportUnscheduledTasksOnly.bind(this);
  }

  onChangeDate(value, field) {
    const start_date = field === 'start_date' ?
      new Date(value).getTime() : new Date(this.state.start_date).getTime();

    const end_date = field === 'end_date' ?
      new Date(value).getTime() : new Date(this.state.end_date).getTime();

    if (start_date > end_date) {
      this.setState({
        end_date: value,
        start_date: value,
        dateRangeExceedError: false
      });
    } else {
      this.setState({
        [field]: value,
        dateRangeExceedError: false
      });
    }
  }

  convertUtcToLocalDate(dateString) {
    const checkValidityOfDate = moment.utc(dateString).local().format('YYYY/MM/DD');
    if (moment(checkValidityOfDate).isValid()) {
      return checkValidityOfDate;
    } else {
      return '';
    }
  }
  convertUtcToLocalTime(dateString) {
    const checkValidityOfTime = moment.utc(dateString).local().format('HH:mm:ss');
    if (checkValidityOfTime!=='Invalid date') {
      return checkValidityOfTime;
    } else {
      return '';
    }
  }

  handleExportCompleted() {
    this.setState({
      start_date: new Date(Date.now()).toISOString(),
      end_date: new Date(Date.now()).toISOString(),
      selectingDates: true,
      exportCompleted: false,
      dateRangeExceedError: false,
      isFetching: false,
      fetchingError: false,
      recordsCount: 0
    });
    this.props.onHide();
  }

  exportUnscheduledTasksOnly() {
    const promises = [];
    let entities;
    let equipments;
    let eventsWithDateTime;
    let eventsWithNoDateTime;
    let events = [];

    this.setState({
      isFetching: true,
      selectingDates: false
    });
    promises.push(
      this.props.getEntities().then(
        result => entities = JSON.parse(result)
      )
    );
    promises.push(
      this.props.getEquipments().then(
        result => equipments = JSON.parse(result)
      )
    );

    Promise.all(promises).then(() => {
        const params = {
          viewType: '',
          startDate: new Date(this.state.start_date).setHours(0, 0, 0, 0),
          endDate: new Date(this.state.end_date).setHours(23, 59, 59, 999),
          unscheduled: true,
          tasks_with_no_datetime: false
        };
        this.props.getTasks(params).then(result => {
          eventsWithDateTime = JSON.parse(result);

          const params2 = {
            viewType: '',
            startDate: new Date(this.state.start_date).setHours(0, 0, 0, 0),
            endDate: new Date(this.state.end_date).setHours(23, 59, 59, 999),
            unscheduled: true,
            tasks_with_no_datetime: true
          };
          this.props.getTasks(params2).then(result => {
            eventsWithNoDateTime = JSON.parse(result);

            eventsWithDateTime.map((items) => events.push(items));
            eventsWithNoDateTime.map((items) => events.push(items));

            if (!events.length) {
              return this.setState({
                isFetching: false,
                selectingDates: true
              });
            }

            const data = [];
            events.forEach(item => {
              let assignees = '';
              item.entity_ids.forEach(id => {
                entities.forEach(entity => {
                  if (entity.id === id) {
                    assignees += entity.name;
                    if (item.entity_ids.length > 1) {
                      assignees += ';';
                    }
                  }
                });
              });

              let equipment = '';
              item.resource_ids.forEach(id => {
                equipments.forEach(equip => {
                  if (equip.id === id) {
                    equipment += equip.name;
                    if (item.resource_ids.length > 1) {
                      equipment += ';';
                    }
                  }
                });
              });

              const record = {
                id: item.id,
                title: item.title,
                customer_name: item.customer_name       || '',
                customer_email: item.customer_email     || '',
                customer_address: item.customer_address || '',
                customer_city: item.customer_city       || '',
                customer_state: item.customer_state     || '',
                customer_zipcode: item.customer_zipcode || '',
                customer_phone: item.customer_phone     || '',
                start_date: this.convertUtcToLocalDate(item.start_datetime) || '',
                start_time: this.convertUtcToLocalTime(item.start_datetime) || '',
                end_date: this.convertUtcToLocalDate(item.end_datetime) || '',
                end_time: this.convertUtcToLocalTime(item.end_datetime) || '',
                status: getStatusDetails(item.status).label,
                assignees,
                equipment,
                unscheduled: item.unscheduled
              };
              data.push(record);
            });
            const csv_data = json2csv({ data, fields: Object.keys(data[0]) });
            download(csv_data, 'exported tasks.csv', 'text/csv');
            this.setState({
              isFetching: false,
              exportCompleted: true,
              recordsCount: data.length,
              selectingDates: false
            });
          });
        });
      }, () => this.setState({ fetchingError: true })
    );
  }

  handleSubmitForm(e) {
    e.preventDefault();
    /* const start_date  = new Date(this.state.start_date).getTime();
    const end_date    = new Date(this.state.end_date).getTime();
    const diff        = new Date(null).setMonth(3);

    console.log(start_date, end_date, diff);
    if (end_date - start_date > diff) {
      return this.setState({ dateRangeExceedError: true });
    }*/
    if (this.props.view === 'unscheduled') {
      this.exportUnscheduledTasksOnly();
    } else {
      const promises = [];
      let entities;
      let equipments;
      let events;

      this.setState({
        isFetching: true,
        selectingDates: false
      });
      promises.push(
        this.props.getEntities().then(
          result => entities = JSON.parse(result)
        )
      );
      promises.push(
        this.props.getEquipments().then(
          result => equipments = JSON.parse(result)
        )
      );

      Promise.all(promises).then(() => {
          const params = {
            viewType: '',
            startDate: new Date(this.state.start_date).setHours(0, 0, 0, 0),
            endDate: new Date(this.state.end_date).setHours(23, 59, 59, 999)
          };
          this.props.getTasks(params).then(result => {
            events = JSON.parse(result);

            if (!events.length) {
              return this.setState({
                isFetching: false,
                selectingDates: true
              });
            }

            const data = [];
            events.forEach(item => {
              let assignees = '';
              item.entity_ids.forEach(id => {
                entities.forEach(entity => {
                  if (entity.id === id) {
                    assignees += entity.name;
                    if (item.entity_ids.length > 1) {
                      assignees += ';';
                    }
                  }
                });
              });

              let equipment = '';
              item.resource_ids && item.resource_ids.forEach(id => {
                equipments.forEach(equip => {
                  if (equip.id === id) {
                    equipment += equip.name;
                    if (item.resource_ids.length > 1) {
                      equipment += ';';
                    }
                  }
                });
              });

              const record = {
                id: item.id,
                title: item.title,
                customer_name: item.customer_name || '',
                customer_email: item.customer_email || '',
                customer_address: item.customer_address || '',
                customer_city: item.customer_city || '',
                customer_state: item.customer_state || '',
                customer_zipcode: item.customer_zipcode || '',
                customer_phone: item.customer_phone || '',
                start_date: this.convertUtcToLocalDate(item.start_datetime),
                start_time: this.convertUtcToLocalTime(item.start_datetime),
                end_date: this.convertUtcToLocalDate(item.end_datetime),
                end_time: this.convertUtcToLocalTime(item.end_datetime),
                status: getStatusDetails(item.status).label,
                assignees,
                equipment
              };
              data.push(record);
            });
            const csv_data = json2csv({data, fields: Object.keys(data[0])});
            download(csv_data, 'exported tasks.csv', 'text/csv');
            this.setState({
              isFetching: false,
              exportCompleted: true,
              recordsCount: data.length,
              selectingDates: false
            });
          });
        }, () => this.setState({fetchingError: true})
      );
    }
  }
  render() {
    const { showModal } = this.props;
    return (
      <Modal
        show={showModal}
        onHide={this.handleExportCompleted}
        bsSize="large"
        className={classNames({
          [styles['task-export-modal']]: true,
        })}
      >
        <Modal.Header closeButton bsSize="large">
          <h2 className="text-center">Task Export</h2>
        </Modal.Header>

        <Modal.Body>
          {this.state.selectingDates && (
            <Form
              horizontal
              onSubmit={this.handleSubmitForm}
              className={styles['form-container']}
            >
              <FieldGroup
                id="start-date" label="Start Date" componentClass={DatePicker}
                onChange={(value) => this.onChangeDate(value, 'start_date')}
                name="start-date" value={this.state.start_date}
              />

              <FieldGroup
                id="end-date" label="End Date" componentClass={DatePicker}
                onChange={(value) => this.onChangeDate(value, 'end_date')}
                name="end-date" value={this.state.end_date}
              />
              <FormGroup>
                <Col sm={12}>
                  <Button type="submit" className="btn-submit pull-right">
                    Download
                  </Button>
                </Col>
              </FormGroup>
            </Form>
          )}
          {this.state.isFetching && <SavingSpinner title="Loading" borderStyle="none" size={8} />}

          {this.state.dateRangeExceedError && <h4 className="text-center text-danger">Dates range should not exceed three months.</h4>}

          {this.state.exportCompleted && !this.state.recordsCount && <h4 className="text-center">No tasks found</h4>}

          {this.state.fetchingError && <h4 className="text-center text-danger">Can't fetch tasks, please try again later.</h4>}

          {this.state.exportCompleted && <h1 className="text-center">{this.state.recordsCount} tasks exported.</h1>}
        </Modal.Body>
        <Modal.Footer>
        {this.state.exportCompleted &&
          <Button type="button" className="btn-submit pull-right" onClick={this.handleExportCompleted}>
            Continue
          </Button>
        }
      </Modal.Footer>
      </Modal>
    );
  }
}

TaskExport.propTypes = {
  onHide: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  getEntities: PropTypes.func.isRequired,
  getEquipments: PropTypes.func.isRequired,
  getTasks: PropTypes.func.isRequired,
  viewType: PropTypes.string.isRequired,
  view: PropTypes.string.isRequired
};
