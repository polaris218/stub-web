import React, {Component} from 'react';
import cx from "classnames";
import { FormGroup, FormControl } from 'react-bootstrap';
import styles from "./worker-request-details-tabs.module.scss";
import SavingSpinner from "../../../../saving-spinner/saving-spinner";
import DatePicker from "react-bootstrap-date-picker";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {faCalendar} from "@fortawesome/fontawesome-free-solid";
import moment from 'moment';
import TimePickerV4 from "../../../../timepicker/timepickerv4";

export default class WorkerRequestSchedule extends Component {
  constructor(props) {
    super(props);

    this.state = {
      schedule_date: '',
      schedule_time: '',
      notification_type: 'EMAIL'
    };
    this.saveWorkerRequest = this.saveWorkerRequest.bind(this);
    this.sendNow = this.sendNow.bind(this);
  }

  componentDidMount() {

    if (this.props.worker_request_object) {
      let schedule_date = moment.utc(this.props.worker_request_object.scheduled_datetime).local().format('YYYY-MM-DD');
      let schedule_time = moment.utc(this.props.worker_request_object.scheduled_datetime).local().format('hh:mm A');

      this.setState({
        schedule_date,
        schedule_time,
        notification_type: this.props.worker_request_object.notification_type,
      });
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (!_.isEqual(this.props.worker_request_object, prevProps.worker_request_object)) {
      let schedule_date = moment.utc(this.props.worker_request_object.scheduled_datetime).local().format('YYYY-MM-DD');
      let schedule_time = moment.utc(this.props.worker_request_object.scheduled_datetime).local().format('hh:mm A');

      this.setState({
        schedule_date,
        schedule_time
      });
    }
  }

  sendNow(e) {
    this.props.updateAllData();
    this.props.sendRequestNow(e, this.props.updatedData);
  }


  handleChange(key, value) {
    let state = {};
    state[key] = value;

    this.setState({
    ...state,
    });

  }

  saveWorkerRequest(e) {
    e.preventDefault();
    e.stopPropagation();
    const id = this.props.worker_request_object && this.props.worker_request_object.id;
    let scheduled_datetime = moment(`${this.state.schedule_date} ${this.state.schedule_time}`, 'YYYY-MM-DDThh:mm:ss a');
    scheduled_datetime = moment(scheduled_datetime).format();
    this.props.handleUpdateWorkerRequest({
      id,
      scheduled_datetime: scheduled_datetime,
      notification_type: this.state.notification_type
    });
  }

  render() {
    // const color = this.props.worker_request_object && this.props.worker_request_object.request_status.toLowerCase() + 'Status';

    const is_disabled = this.props.worker_request_object && this.props.disableStatuses.indexOf(this.props.worker_request_object.request_status) >= 0 ? false : true || this.props.savingRequest;
    return (
      <div>
        <div className={styles.requestInfo}>Request {this.props.number_of_workers_required} person(s) from {this.props.start_datetime} - {this.props.end_datetime} on {moment.utc(this.props.request_date).local().format('dddd MMM DD, YYYY')}</div>
        <div className={styles.box}>
          <div className={styles.text_area}>
            <h3 className={styles.boxTitle}>Schedule request</h3>
            <p>Date, Time span, number of worker required and team members should be associated with request before sending the notifications.</p>
          </div>
          <div className={styles.boxBody}>
            <div className={styles.boxBodyInner}>
              <div className={styles.scheduleTab}>
                <div className={styles.statusWrapper}>
                  {is_disabled ? <img src="/images/worker-request/tick.svg" alt="Icon" /> : <i className={cx(styles.statusIcon, styles['editingStatus'])} />}
                  <span>Send</span>
                </div>
                <FormGroup className={cx(styles['field-wrapper'], is_disabled ? styles.disabled : "")}>
                  <div className={styles.selectBox}>
                    <FormControl
                      componentClass="select" value={this.state.notification_type}
                      disabled={is_disabled}
                      onChange={(e) => this.handleChange('notification_type', e.target.value)}>
                      <option value={'EMAIL'}>via Email</option>
                      <option value={'SMS'}>via SMS</option>
                      <option value={'BOTH'}>via Both</option>
                    </FormControl>
                  </div>
                </FormGroup>
                <FormGroup className={cx(styles['field-wrapper'], is_disabled ? styles.disabled : "")}>
                  <label>on</label>
                  <div className={styles.datePicker}>
                    <FormControl
                      componentClass={DatePicker}
                      disabled={is_disabled}
                      showClearButton={false} name="start-date" ref="schedule_date"
                      onChange={(value) => this.handleChange('schedule_date', value)}
                      value={this.state.schedule_date}/>
                    <FontAwesomeIcon icon={faCalendar} className={styles['fa-icon']}/>
                  </div>
                </FormGroup>
                <FormGroup className={cx(styles['field-wrapper'], is_disabled ? styles.disabled : "")}>
                  <label>at</label>
                  <div className={styles.timePicker}>
                    <TimePickerV4
                      value={this.state.schedule_time}
                      disabled={is_disabled}
                      updateValue={(value) => {
                        this.handleChange('schedule_time', value);
                      }}
                      elId={Math.random().toString(36).substr(2, 16)}
                      className={cx(styles.timeFiled)}
                      placeholder="HH:MM AM"
                    />
                  </div>
                </FormGroup>
                {!is_disabled &&
                <FormGroup className={cx(styles['field-wrapper'])}>
                  <label>or</label>
                  <button
                    type="button" className={cx(styles.btn, styles['btn-primary'])}
                    disabled={is_disabled}
                    onClick={(e) => this.sendNow(e)}>
                    {this.props.savingRequest ? <SavingSpinner color="#ffffff" size={8} borderStyle="none"/> : 'Send Now'}
                  </button>
                </FormGroup>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
