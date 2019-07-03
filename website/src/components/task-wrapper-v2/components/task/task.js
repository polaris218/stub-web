import React, {Component} from 'react';
import style from '../../base-styling.module.scss';
import styles from './task.module.scss';
import cx from 'classnames';
import {Row, Col, FormGroup, FormControl, ControlLabel, Checkbox, Button, Tooltip, OverlayTrigger} from 'react-bootstrap';
import {ColorField, FieldGroup} from "../../../fields";
import TimezoneSelector from "../../../timezone-selector/timezone-selector";
import DatePicker from "react-bootstrap-date-picker";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {faCalendar} from "@fortawesome/fontawesome-free-solid";
import TimePickerV4 from "../../../timepicker/timepickerv4";
import {getTimezoneOptions, isTimezonesOffsetEqual} from "../../../../helpers";
import moment from "moment-timezone";
import DurationPicker from "../../../duration-picker/duration-picker";

export default class Task extends Component {
  constructor(props) {
    super(props);

    this.getRef = this.getRef.bind(this);
  }

  getRef() {
    return this.refs.node;
  }

  renderDropDown(enabled, time_window_start, onChange) {

    let selectedValue = "60";
    if (time_window_start) {
      selectedValue = time_window_start;
    }

    return (<FormGroup controlId="formControlsSelect" className={cx(style.selectBox, styles.selectBox)}>
        <FormControl onChange={onChange('time_window_start')} disabled={!enabled} value={selectedValue}
                     componentClass="select" placeholder="select" className={styles['time-window-select']}>
          <option value="30">30 mins</option>
          <option value="60">1 hr</option>
          <option value="90">1 hr 30 mins</option>
          <option value="120">2 hrs</option>
          <option value="150">2 hrs 30 mins</option>
          <option value="180">3 hrs</option>
          <option value="210">3 hrs 30 mins</option>
          <option value="240">4 hrs</option>
          <option value="270">4 hrs 30 mins</option>
          <option value="300">5 hrs</option>
        </FormControl>
      </FormGroup>
    );
  }

  renderTimeWindowIfNeeded(enable_time_window_display, start_datetime, time_window_start, end_datetime) {
    if (!enable_time_window_display) {
      return null;
    }

    // TODO: Show duration in UI
    /* let durationMessage = null;
    if (end_datetime) {
      const duration = moment.duration(moment(end_datetime).diff(moment(start_datetime)));
      const hours = duration.asHours();
      durationMessage = " and approximate duration is " + hours + " hours";
    }*/

    const window_time = moment(start_datetime).add(time_window_start, 'minutes');
    return (
      <div className={cx(styles.arriveText)}>e.g. We will arrive
        between <span>{moment(start_datetime).format('hh:mm A')} and {window_time.format('hh:mm A')}</span></div>
    );
  }

  render() {
    let startTimeElement;
    let endTimeElement;
    let duration = '';
    let start = '';
    let end = '';
    let durationTime = '';

    if (this.props.browser() === 'Chrome' || this.props.browser() === 'Edge' || this.props.browser() === 'Opera') {

      start = this.props.start_time.hours + ':' + this.props.start_time.mins + ' ' + this.props.start_time.meridian;
      end = this.props.end_time.hours + ':' + this.props.end_time.mins + ' ' + this.props.end_time.meridian;
      durationTime = this.props.duration;
      if (this.props.start_time === '') {
        start = '';
      }

      if (this.props.end_time === '') {
        end = '';
      }

      if (this.props.duration === '') {
        durationTime = '';
      }

      startTimeElement = (
        <TimePickerV4
          value={start}
          updateValue={(value) => {
            this.props.inputTimeStartChange(value)
          }}
          disabled={!this.props.can_edit}
          elId={Math.random().toString(36).substr(2, 16)}
          className={cx(styles.timeFiled)}
          placeholder="HH:MM AM"
        />
      );
      endTimeElement = (
        <TimePickerV4
          value={end}
          updateValue={(value) => {
            this.props.inputTimeEndChange(value)
          }}
          disabled={!this.props.can_edit}
          elId={Math.random().toString(36).substr(2, 16)}
          className={cx(styles.timeFiled)}
          placeholder="HH:MM AM"
        />
      );
      duration = (
        <DurationPicker
          value={durationTime}
          updateValue={(value) => {
            this.props.DurationChange(value)
          }}
          disabled={!this.props.can_edit}
          elId={Math.random().toString(36).substr(2, 16)}
          className={cx(styles.timeFiled)}
          placeholder="30 min"
          timeRegEx={/^(((\d+)\s(hrs|hr))\s(([0-5][0-9]|[0-9]))\s(mins|min))|^((\d+\s(hrs|hr)))$|^((([0-5][0-9]|[0-9]))\s(mins|min))$/i}
          option='duration'
        />
      );
    } else {
      let start = this.props.start_time.hours + ':' + this.props.start_time.mins + ' ' + this.props.start_time.meridian;
      let end = this.props.end_time.hours + ':' + this.props.end_time.mins + ' ' + this.props.end_time.meridian;
      let durationTime = this.props.duration;
      if (this.props.start_time === '') {
        start = '';
      }

      if (this.props.end_time === '') {
        end = '';
      }
      startTimeElement = (
        <TimePickerV4
          value={start}
          updateValue={(value) => {
            this.props.inputTimeStartChange(value)
          }}
          disabled={!this.props.can_edit}
          elId={Math.random().toString(36).substr(2, 16)}
          className={cx(styles.timeFiled)}
          placeholder="HH:MM AM"
        />
      );
      endTimeElement = (
        <TimePickerV4
          value={end}
          updateValue={(value) => {
            this.props.inputTimeEndChange(value)
          }}
          disabled={!this.props.can_edit}
          elId={Math.random().toString(36).substr(2, 16)}
          className={cx(styles.timeFiled)}
          placeholder="HH:MM AM"
        />
      );
      duration = (
        <DurationPicker
          value={durationTime}
          updateValue={(value) => {
            this.props.DurationChange(value)
          }}
          disabled={!this.props.can_edit}
          elId={Math.random().toString(36).substr(2, 16)}
          className={cx(styles.timeFiled)}
          placeholder="30 min"
          timeRegEx={/^(((\d+)\s(hrs|hr))\s(([0-5][0-9]|[0-9]))\s(mins|min))|^((\d+\s(hrs|hr)))$|^((([0-5][0-9]|[0-9]))\s(mins|min))$/i}
          option='duration'
        />
      );
    }

    let selectedGroup = null;
    if (typeof this.props.groups !== 'undefined' && this.props.groups !== null && this.props.groups.length > 0) {
      selectedGroup = this.props.groups.find((el) => {
        return (this.props.event && this.props.event.group_id) ? el.id === Number(this.props.event.group_id) : el.is_implicit;
      })
    }

    let showStarTimezone = false;
    let showEndTimezone = false;
    let start_time_zone = null;
    let end_time_zone = null;
    const groupTimezone = (typeof selectedGroup !== 'undefined' && selectedGroup !== null) ? selectedGroup.timezone : null;
    const companyTimezone = typeof this.props.profile !== 'undefined' ? this.props.profile.timezone : null;
    const entityGroupTimezone = typeof this.props.profile !== 'undefined' ? this.props.profile.group_timezone : null;
    const timezones = getTimezoneOptions();
    if (this.props.event.start_datetime_timezone !== null) {
      const startDateTZ = timezones.find(el => {
        return el.value === this.props.event.start_datetime_timezone
      });
      start_time_zone = typeof startDateTZ !== 'undefined' ? startDateTZ.label : this.props.event.start_datetime_timezone;
      if (((groupTimezone && this.props.event.start_datetime_timezone === groupTimezone) ||
        (companyTimezone && this.props.event.start_datetime_timezone === companyTimezone) ||
        (entityGroupTimezone && this.props.event.start_datetime_timezone === entityGroupTimezone)) &&
        !isTimezonesOffsetEqual(this.props.event.start_datetime_timezone, moment.tz.guess())) {
        showStarTimezone = true;
      } else if (this.props.event.start_datetime_timezone !== groupTimezone && this.props.event.start_datetime_timezone !== companyTimezone
        && this.props.event.start_datetime_timezone !== entityGroupTimezone) {
        showEndTimezone = true;
      }
    } else if (this.props.event.start_datetime_timezone === null) {
      if (groupTimezone !== null) {
        if (!isTimezonesOffsetEqual(groupTimezone, moment.tz.guess())) {
          const groupTZ = timezones.find(el => {
            return el.value === groupTimezone
          });
          showStarTimezone = true;
          start_time_zone = typeof groupTZ !== 'undefined' ? groupTZ.label : groupTimezone;
        }
      } else if (groupTimezone === null && companyTimezone !== null) {
        if (!isTimezonesOffsetEqual(companyTimezone, moment.tz.guess())) {
          const companyTZ = timezones.find(el => {
            return el.value === companyTimezone
          });
          showStarTimezone = true;
          start_time_zone = typeof companyTZ !== 'undefined' ? companyTZ.label : companyTimezone;
        }
      } else if (groupTimezone === null && companyTimezone === null && entityGroupTimezone !== null) {
        if (!isTimezonesOffsetEqual(entityGroupTimezone, moment.tz.guess())) {
          const entityGroupTZ = timezones.find(el => {
            return el.value === entityGroupTimezone
          });
          showStarTimezone = true;
          start_time_zone = typeof entityGroupTZ !== 'undefined' ? entityGroupTZ.label : entityGroupTimezone;
        }
      }
    }

    if (this.props.event.end_datetime_timezone !== null) {
      const endDateTZ = timezones.find(el => {
        return el.value === this.props.event.end_datetime_timezone
      });
      end_time_zone = typeof endDateTZ !== 'undefined' ? endDateTZ.label : this.props.event.end_datetime_timezone;
      if (((groupTimezone && this.props.event.end_datetime_timezone === groupTimezone) ||
        (companyTimezone && this.props.event.end_datetime_timezone === companyTimezone) ||
        (entityGroupTimezone && this.props.event.end_datetime_timezone === entityGroupTimezone)) &&
        !isTimezonesOffsetEqual(this.props.event.end_datetime_timezone, moment.tz.guess())) {
        showEndTimezone = true;
      } else if (this.props.event.end_datetime_timezone !== groupTimezone && this.props.event.end_datetime_timezone !== companyTimezone
        && this.props.event.end_datetime_timezone !== entityGroupTimezone) {
        showEndTimezone = true;
      }
    } else if (this.props.event.end_datetime_timezone === null && start_time_zone !== null) {
      end_time_zone = start_time_zone;
      showEndTimezone = true;
    }

    if (showStarTimezone || showEndTimezone) {
      showStarTimezone = true;
      showEndTimezone = true;
    }

    const {enable_time_window_display, time_window_start, route_id} = this.props.event,
      onChange = (name) => {
        return (event) => {
          let value = event;
          if (event.target) {
            value = event.target.value;
          }
          this.props.onChange(name, value);
        };
      };

    const unscheduled_task_without_date_time = !this.props.start_date || !this.props.end_date || this.props.start_time === '' || this.props.end_time === '';
    let showGroupDropdown = false;

    if (this.props.groups && this.props.groups.length > 1 && this.props.groups.find((group) => {
      return !group.is_disabled && !group.is_implicit;
    })) {
      showGroupDropdown = true;
    } else if (this.props.groups && this.props.groups.length > 1 && this.props.groups.find((group) => {
      return group.is_disabled && !group.is_implicit && group.id === this.props.task_group_id;
    })) {
      showGroupDropdown = true;
    }

    return (
      <div className={cx(style.box)}>
        <h3 className={cx(style.boxTitle)}>Task</h3>
        <div className={cx(style.boxBody)} ref="node">
          <div className={cx(style.boxBodyInner)}>
            <Row className={cx(style.taskFormRow)}>
              <Col xs={12} sm={6}>
                <FieldGroup name="task-title" placeholder="Customer Appointment Title" autoFocus
                            value={this.props.event.title} onChange={(e) => {
                  this.props.onChangeEventState('title', e.target.value);
                }} disabled={!this.props.can_edit}/>
              </Col>
              {this.props.can_view_task_full_details &&
              <Col xs={12} sm={6}>
                <FormGroup className={cx(style.selectBox)}>
                  <FormControl name="task-type" componentClass="select" placeholder="select" onChange={(e) => {
                    this.props.onChangeEventState('template', parseInt(e.target.value));
                  }} disabled={!this.props.can_edit}>
                    <option value={-1}>Select Task Type</option>
                    {this.props.templates && this.props.templates.map((template) => {
                      if (!template.type || template.type === 'TASK') {
                        return <option value={template.id}
                                       selected={this.props.event.template ? this.props.event.template === template.id : template.is_default}>{template.name}</option>
                      }
                    })}
                  </FormControl>
                </FormGroup>
              </Col>}
              {showGroupDropdown && this.props.can_add_group &&
              <Col xs={12} sm={6}>
                <FormGroup className={cx(style.selectBox)}>
                  <FormControl componentClass="select" placeholder="select" onChange={(e) => {
                    this.props.onChangeEventState('group_id', e.target.value === '' ? null : parseInt(e.target.value));
                  }} disabled={!this.props.can_edit}>
                    {this.props.event.group_id === -1 && <option value={-1}>Select a Group</option>}
                    {this.props.groups.map((group) => {
                      if (group.is_disabled && group.id !== this.props.task_group_id) {
                        return null;
                      }
                      return <option
                        value={group.is_implicit ? '' : group.id}
                        selected={(this.props.event.group_id) ? this.props.event.group_id !== -1 && this.props.event.group_id === group.id : group.is_implicit}
                        disabled={group.is_disabled && group.id === this.props.task_group_id}>{group.name}</option>
                    })}
                  </FormControl>
                </FormGroup>
              </Col>}
              {route_id &&
              <Col xs={12} sm={6}>
                <OverlayTrigger placement="bottom" overlay={<Tooltip id={route_id}>Route ID</Tooltip>}>
                  <FieldGroup name="route-id" placeholder="Route ID" value={route_id} disabled />
                </OverlayTrigger>
              </Col>}
              <Col xs={12} sm={6}>
                <div className={cx(styles.colorPickerWrapper)}>
                  <div className={cx(styles.colorPicker)}>
                    <FieldGroup
                      componentClass={ColorField}
                      value={this.props.task_color} name="task-color"
                      groupClassName={styles['task-color-group']}
                      onChange={(color) => {
                      this.props.setTaskFormState('task_color', color)
                    }} canChangeColor={this.props.can_edit}/>
                  </div>
                  {this.props.can_view_task_full_details &&
                  <div className={cx(styles.checkBoxWrapper)}>
                    <FormGroup>
                      <Checkbox className={cx(style.checkBox)} checked={this.props.event.use_assignee_color}
                                onChange={(e) => {
                                  this.props.onChangeEventState('use_assignee_color', e.target.checked);
                                }} disabled={!this.props.can_edit}><span>Use assignee color</span></Checkbox>
                    </FormGroup>
                  </div>}
                </div>
              </Col>
            </Row>
          </div>
          <div className={cx(style.boxBodyInner)}>
            {this.props.can_view_task_full_details &&
            <FormGroup>
              <Checkbox className={cx(style.checkBox)} checked={this.props.event.unscheduled} onChange={(e) => {
                this.props.onChangeEventState('unscheduled', e.target.checked);
              }} disabled={!this.props.can_edit}><span>Unscheduled Task</span></Checkbox>
              {this.props.event.unscheduled &&
              <div className={cx(styles.unscheduledText)}>
                <p>When a task is marked as unscheduled Arrivy only shares the day of the task with the customer via
                  email & sms if provided. If date isn't provided we will send a confirmation email without a date or
                  time of the task.
                  {this.props.can_edit &&
                  <Button className={styles.clearFieldsButton} onClick={this.props.clearDateTimeFields}>Clear Date/Time
                    Fields</Button>}
                </p>
              </div>
              }
            </FormGroup>}
            <Row className={cx(style.taskFormRow)}>
              <Col xs={12} sm={12} lg={6}>
                <div className={style['field-wrapper']}>
                  <Row className={cx(style.taskFormRow)}>
                    <Col xs={12} sm={6}>
                      <FormGroup className={cx(styles.fieldGroup)}>
                        <ControlLabel>Start Date</ControlLabel>
                        <div className={cx(style.inner, styles.datePicker)}>
                          <FormControl componentClass={DatePicker} onChange={this.props.onStartDateChange}
                                       showClearButton={false} name="start-date" ref="start_date"
                                       disabled={(this.props.editing_series || !this.props.can_edit) ? true : false}
                                       value={this.props.start_date}/>
                          <FontAwesomeIcon icon={faCalendar} className={style['fa-icon']}/>
                        </div>
                      </FormGroup>
                    </Col>
                    <Col xs={12} sm={6}>
                      <FormGroup className={cx(styles.fieldGroup)}>
                        <ControlLabel>End Date</ControlLabel>
                        <div className={cx(style.inner, styles.datePicker)}>
                          <FormControl componentClass={DatePicker} onChange={this.props.onEndDateChange}
                                       showClearButton={false} name="end-date" ref="end_date"
                                       disabled={!this.props.can_edit ? true : false} value={this.props.end_date}/>
                          <FontAwesomeIcon icon={faCalendar} className={style['fa-icon']}/>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                </div>
              </Col>
              <Col xs={12} sm={12} lg={6}>
                <div className={style['field-wrapper']}>
                  <Row className={cx(style.taskFormRow)}>
                    <Col xs={12} sm={6}>
                      <FormGroup className={cx(styles.fieldGroup)}>
                        <ControlLabel>Start Time</ControlLabel>
                        {startTimeElement}
                      </FormGroup>
                      {!unscheduled_task_without_date_time && showStarTimezone &&
                      <p className={cx(styles.timezoneString)}>{start_time_zone}</p>}
                    </Col>
                    <Col xs={12} sm={6}>
                      <FormGroup className={cx(styles.fieldGroup)}>
                        <ControlLabel>End Time</ControlLabel>
                        {endTimeElement}
                      </FormGroup>
                      {!unscheduled_task_without_date_time && showEndTimezone &&
                      <p className={cx(styles.timezoneString)}>{end_time_zone}</p>}
                    </Col>
                  </Row>
                </div>
                <Row>
                  <Col md={6}>
                    <div className={style['field-wrapper']}>
                      <FormGroup className={cx(styles.fieldGroup)}>
                        <ControlLabel>Duration</ControlLabel>
                        {duration}
                      </FormGroup>
                      <div className={styles.durationFormateDisplay}>
                        <p>e.g. 01 hr(s) 30 min(s) </p>
                      </div>
                    </div>
                  </Col>
                  <div className={styles.timezoneMargin}>
                    <Col md={6}>
                      <TimezoneSelector
                        setTimezoneValues={(values) => {
                          this.props.setTimezones(values);
                        }}
                        event={this.props.event}
                        profile={this.props.profile}
                        group={this.props.groups && this.props.groups.find((group) => {
                          return this.props.event && this.props.event.group_id ? (Number(this.props.event.group_id) === group.id) : (group.is_implicit);
                        })}
                        disabled={!this.props.can_edit || unscheduled_task_without_date_time}
                        className={cx(styles.timeZoneDropdown)}
                      />
                    </Col>
                  </div>
                </Row>
              </Col>
            </Row>
          </div>
          {this.props.can_view_task_full_details &&
          <div className={cx(style.boxBodyInner)}>
            <div className={styles['time-window-group']}>
              <Checkbox className={cx(style.checkBox, styles.checkBox)} checked={enable_time_window_display}
                        onChange={this.props.onEnableTimeWindow}
                        disabled={!this.props.can_edit || unscheduled_task_without_date_time}><span>Use arrival window of Start Time +</span></Checkbox>
              {this.renderDropDown((enable_time_window_display && this.props.can_edit), time_window_start, onChange)}
              for customer communications
            </div>
            {this.renderTimeWindowIfNeeded((enable_time_window_display && this.props.can_edit), this.props.newDateTime.start_datetime, time_window_start, this.props.newDateTime.end_datetime)}
          </div>}
        </div>
      </div>
    );
  }
}
