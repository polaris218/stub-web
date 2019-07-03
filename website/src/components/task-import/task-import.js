import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Form, Modal, Button, FormGroup, Col } from 'react-bootstrap';
import styles from './task-import.module.scss';
import DatePicker from 'react-bootstrap-date-picker';
import { FieldGroup } from '../fields';
import TaskForm from '../task-form/task-form';
import classNames from 'classnames';
import moment from 'moment';
import { getErrorMessage } from '../../helpers/task';
import {TaskWrapperV2} from "../index";
import SavingSpinner from '../saving-spinner/saving-spinner';

  export default class TaskImport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      start_date: moment(new Date(Date.now()).toISOString()).format(),
      end_date: moment(new Date(Date.now()).toISOString()).format(),
      selectingDates: true,
      noEvents: false,
      editingTasks: false,
      importCompleted: false,
      currentEvent: 0,
      events: [],
      fetchingEventError: false,
      taskFormError: null,
      sendingTask: false,
      importingLoader: false
    };
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.postTask = this.postTask.bind(this);
    this.skipEvent = this.skipEvent.bind(this);
    this.importCompleted = this.importCompleted.bind(this);
    this.parseOutFieldValues = this.parseOutFieldValues.bind(this);
    this.isThatCustomer = this.isThatCustomer.bind(this);
  }

  onChangeDate(value, field) {
    const start_date = field === 'start_date' ?
      moment(new Date(value).getTime()).format() : moment(new Date(this.state.start_date).getTime()).format();

    const end_date = field === 'end_date' ?
      moment(new Date(value).getTime()).format() : moment(new Date(this.state.end_date).getTime()).format();

    if (start_date > end_date) {
      this.setState({
        end_date: value,
        start_date: value,
      });
    } else {
      this.setState({ [field]: value });
    }
  }

  importCompleted() {
    this.props.onHide();
    this.props.updateTaskList();
  }

  skipEvent(index) {
    const newState = { currentEvent: this.state.currentEvent + 1 };
    if (index + 1 >= this.state.events.length) {
      newState.importCompleted = true;
      newState.editingTasks = false;
    }

    this.setState(newState);
  }

  postTask() {
    const newState = { currentEvent: this.state.currentEvent + 1 };

    if (this.state.currentEvent + 1 >= this.state.events.length) {
      newState.importCompleted = true;
      newState.editingTasks = false;
      newState.sendingTask = false;
    } else {
      newState.sendingTask = false;
    }

    this.setState(newState);
  }

  // This is a temporary hack to make a customer happy :)
  parseOutFieldValues(title, description){
    let result = {
      customer_first_name: '',
      customer_last_name: '',
      customer_email: '',
      customer_phone: '',
      customer_address_line_1: '',
      customer_city: '',
      destination_address_1: '',
      hourly_rate: '',
      order_source: ''
    };
    let full_name = this.getInfo("Name*:", description);
    let name = full_name.split(" ");
    result.customer_first_name = name[0];
    if ( name[1] != null ){
      result.customer_last_name = name[1];
    }
    result.customer_email = this.getInfo("Email Address*:", description);
    result.customer_phone = this.getInfo("Primary Phone*:", description);
    result.customer_address_line_1 = this.getInfo("Address From*:", description);

    result.customer_city = this.getInfo("City/State*:", description);
    const destionation_city = this.getInfo("City/State*:", description.replace("City/State*:", " "));
    result.destination_address_1 = this.getInfo("Address To*:", description) + ' ' + destionation_city;

    result.hourly_rate = title.slice(0, title.indexOf("/hr"));
    result.order_source = this.getInfo("How did you hear about us?:", description);
    return result;
  }

  // This is a temporary hack to make a customer happy :)
  getInfo(regstr, str){
    if (!str) {
      return '';
    }

    if ( str.indexOf(regstr) == -1 ) {
      let result =  '';
    }else{
      let pos = str.indexOf(regstr) + regstr.length;
      let substr = str.slice(pos, str.length);
      pos = substr.indexOf("\n");
      if ( pos == -1 ){
        let result = substr;
      }else{
        let result = substr.slice(0, pos);
      }
    }
    return result;
  }

  isThatCustomer(description) {
    if(description) {
      const full_name = this.getInfo("Name*:", description);
      if (full_name !== '') {
        return true;
      }
    }

    return false;
  }

  handleSubmitForm(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({importingLoader: true});
    this.props.googleEvents(this.state.start_date, this.state.end_date).then((r) => {
      const response = JSON.parse(r);
      if (response.length === 0) {
        this.setState({ noEvents: true, fetchingEventError: false });
      } else {
        const events = response.map((el, index) => {
          let recurrence = false;
          if (el.recurrence && el.recurrence.length > 0) {
            recurrence = true;
          }

          if (this.isThatCustomer(el.description)) {
            try {
              const result = this.parseOutFieldValues(el.summary, el.description);
              const extra_fields = {
                hourly_rate: result.hourly_rate,
                destination_address_1: result.destination_address_1,
                order_source: result.order_source
              };

              return {
                end_datetime: el.end.dateTime ? moment(new Date(el.end.dateTime)).format() : moment(new Date(el.end.date)).format(),
                end: el.end.dateTime ? el.end.dateTime : el.end.date,
                start_datetime: el.start.dateTime ? moment(new Date(el.start.dateTime)).format() : moment(new Date(el.start.date)).format(),
                start: el.start.dateTime ? el.start.dateTime : el.start.date,
                title: el.summary || 'Untitled Event',
                details: el.description,
                task_color: el.colorId || '#0693E3',
                customer_address: '',
                customer_address_line_1: result.customer_address_line_1,
                customer_address_line_2: '',
                customer_city: result.customer_city,
                customer_company_name: '',
                customer_country: '',
                customer_email: result.customer_email,
                customer_exact_location: null,
                customer_first_name: result.customer_first_name,
                customer_id: null,
                customer_last_name: result.customer_last_name,
                customer_name: '',
                customer_notes: '',
                customer_phone: result.customer_phone,
                customer_phone2: '',
                customer_state: '',
                customer_zipcode: '',
                entity_ids: [],
                resource_ids: [],
                extra_fields: extra_fields,
                notifications: {},
                status: el.status,
                source_id: recurrence ? '' : el.id,
                source: 'google',
                recurrence,
                index,
                additional_addresses: null
              };
            } catch(ex) {
              console.log('Unable to parse our values - going regular assignment route', e, ex);
            }
          }

          return {
            end_datetime: el.end.dateTime ? moment(new Date(el.end.dateTime)).format() : moment(new Date(el.end.date)).format(),
            end: el.end.dateTime ? el.end.dateTime : el.end.date,
            start_datetime: el.start.dateTime ? moment(new Date(el.start.dateTime)).format() : moment(new Date(el.start.date)).format(),
            start: el.start.dateTime ? el.start.dateTime : el.start.date,
            title: el.summary || 'Untitled Event',
            details: el.description,
            task_color: el.colorId || '#0693E3',
            customer_address: '',
            customer_address_line_1: '',
            customer_address_line_2: '',
            customer_city: '',
            customer_company_name: '',
            customer_country: '',
            customer_email: '',
            customer_exact_location: null,
            customer_first_name: '',
            customer_id: null,
            customer_last_name: '',
            customer_name: '',
            customer_notes: '',
            customer_phone: '',
            customer_phone2: '',
            customer_state: '',
            customer_zipcode: '',
            entity_ids: [],
            resource_ids: [],
            extra_fields: {},
            notifications: {},
            status: el.status,
            source_id: recurrence ? '' : el.id,
            source: 'google',
            recurrence,
            index,
            additional_addresses: null
          };
        });

        this.setState({
          noEvents: false,
          currentEvent: 0,
          selectingDates: false,
          editingTasks: true,
          events,
          fetchingEventError: false
        });
      }
      this.setState({importingLoader: false});
    }).catch((e) => {
      console.log(e);
      this.setState({ fetchingEventError: true });
    });
  }

  render() {
    const { showModal, onHide } = this.props;
    return (
      <Modal show={showModal} onHide={onHide} bsSize="large"
        className={classNames({
          [styles['task-import-modal']]: this.state.selectingDates || this.state.importCompleted,
        })} keyboard={false} backdrop={'static'}>
        <Modal.Body>
          {this.state.selectingDates && (
            <Form horizontal onSubmit={this.handleSubmitForm} className={styles['form-container']}>
              <h2 className="text-center">Task Import</h2>
              <FieldGroup
                id="start-date" label="Start Date" componentClass={DatePicker}
                onChange={(value) => this.onChangeDate(value, 'start_date')} name="start-date" value={this.state.start_date}
              />
              <FieldGroup
                id="end-date" label="End Date" componentClass={DatePicker}
                onChange={(value) => this.onChangeDate(value, 'end_date')} name="end-date" value={this.state.end_date}
              />
              <FormGroup>
                <Button type="submit" className="btn-submit pull-right">{this.state.importingLoader ? <SavingSpinner borderStyle="none" title="Loading" /> : 'Import'}</Button>
              </FormGroup>
            </Form>
          )}
          {this.state.noEvents && <h4 className="text-center">No events found</h4>}
          {this.state.fetchingEventError && <h4 className="text-center text-danger">Can't fetch events, please try again later.</h4>}
          {this.state.editingTasks && this.state.currentEvent < this.state.events.length && (
            <div>
              { this.state.events[this.state.currentEvent].recurrence && <div className={styles['recurring-task']}>
                This looks like a recurring task. We currently don't support recurring tasks. Please make sure that the date & time here is correct
              </div> }
              <TaskWrapperV2
                skipEvent={this.skipEvent}
                sendingTask={this.state.sendingTask}
                importing
                selectedTask={this.state.events[this.state.currentEvent]}
                newEventIsRecurring={this.props.newEventIsRecurring}
                company_id={this.props.company_id}
                company_url={this.props.company_url}
                reporter_name={this.props.reporter_name}
                reporter_id={this.props.reporter_id}
                getTaskStatus={this.props.getTaskStatus}
                getTaskRatings={this.props.getTaskRatings}
                updateTaskStatus={this.props.updateTaskStatus}
                getEstimate={this.props.getEstimate}
                getSchedule={this.props.getSchedule}
                statuses={this.props.statuses}
                entities={this.props.entities}
                equipments={this.props.equipments}
                getCustomers={this.props.getCustomers}
                searchCustomers={this.props.searchCustomers}
                createCustomer={this.props.createCustomer}
                extraFieldsOptions={this.props.extraFieldsOptions}
                taskUpdatedCallback={this.props.taskUpdatedCallback}
                taskAddedCallback={this.props.taskAddedCallback}
                taskDeletedCallback={this.props.taskDeletedCallback}
                taskAssigneeUpdatedCallback={this.props.taskAssigneeUpdatedCallback}
                taskEquipmentUpdatedCallback={this.props.taskEquipmentUpdatedCallback}
                taskStatusUpdateCallback={this.props.taskStatusUpdateCallback}
                handleTaskTypeChange={this.props.handleTaskTypeChange}
                onCloseTask={onHide}
                updateTask={this.props.updateTask}
                deleteTask={this.props.deleteTask}
                postTask={this.props.postTask}
                getTaskSeriesSettings={this.props.getTaskSeriesSettings}
                taskSendNotification={this.props.taskSendNotification}
                profile={this.props.profile}
                templates={this.props.templates}
                defaultTemplate={this.props.defaultTemplate}
                companyProfile={this.props.companyProfile}
                groups={this.props.groups}
                createToastNotification={this.props.createToastNotification}
                taskImport
                editingTasks={this.state.editingTasks}
                currentEvent={this.state.currentEvent}
                events={this.state.events}
                updateEventCallback={this.postTask}
              />
            </div>
          )}
          {this.state.importCompleted && <div>
            <h2 className="text-center">Task Import</h2>
            <h3 className="text-center">Import completed</h3>
            <div className={styles.btnWrapper}>
              <Button type="button" className="btn-submit" onClick={this.importCompleted}>Continue</Button>
            </div>
          </div>}
        </Modal.Body>
      </Modal>
    );
  }
}

TaskImport.propTypes = {
  onHide: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired,
  googleEvents: PropTypes.func.isRequired,
  getCustomers: PropTypes.func.isRequired,
  searchCustomers: PropTypes.func.isRequired,
  createCustomer: PropTypes.func.isRequired,
  extraFieldsOptions: PropTypes.array.isRequired,
  entities: PropTypes.array.isRequired,
  equipments: PropTypes.array.isRequired,
  onSaveClick: PropTypes.func.isRequired,
  onDeleteClick: PropTypes.func.isRequired,
  getSchedule: PropTypes.func,
  postTask: PropTypes.func.isRequired,
  updateTaskList: PropTypes.func.isRequired,
  templates: PropTypes.array
};
