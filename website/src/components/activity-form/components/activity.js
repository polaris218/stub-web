import React, {Component} from 'react';
import {
  Row,
  Col,
  Grid,
  FormGroup,
  FormControl,
  ControlLabel, Checkbox
} from 'react-bootstrap';
import cx from "classnames";
import style from "../activity-form.module.scss"
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {ColorField, FieldGroup} from "../../fields";
import {
  faCalendar
} from "@fortawesome/fontawesome-free-solid";
import styles from "../../task-wrapper-v2/components/task/task.module.scss";
import DatePicker from "react-bootstrap-date-picker";
import TimePickerV4 from "../../timepicker/timepickerv4";
import {getTimezoneOptions, isTimezonesOffsetEqual} from "../../../helpers";
import moment from "moment-timezone";


export default class Activity extends Component {

  constructor(props) {
    super(props);
  }

  render() {

    let showGroupDropdown = false;
    if (this.props.groups && (this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 1 && this.props.groups.find((group) => {
      return !group.is_disabled && !group.is_implicit;
    })) {
      showGroupDropdown = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 0 && this.props.groups.find((group) => {
      return !group.is_disabled;
    })) {
      showGroupDropdown = true;
    }


    let startTimeElement;
    let start = '';


    if (this.props.browser() === 'Chrome' || this.props.browser() === 'Edge' || this.props.browser() === 'Opera') {
      start = this.props.start_time.hours + ':' + this.props.start_time.mins + ' ' + this.props.start_time.meridian;

      if (this.props.start_time === '' || this.props.allday) {
        start = '';
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

    } else {
      let start = this.props.start_time.hours + ':' + this.props.start_time.mins + ' ' + this.props.start_time.meridian;
      if (this.props.start_time === '' || this.props.allday) {
        start = '';
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

    }


     let selectedGroup = null;
    if (typeof this.props.groups !== 'undefined' && this.props.groups !== null && this.props.groups.length > 0) {
      selectedGroup = this.props.groups.find((el) => {
        return (this.props.event && this.props.event.group_id) ? el.id === Number(this.props.event.group_id) : el.is_implicit;
      })
    }

    let showStarTimezone = false;
    let start_time_zone = null;
    const groupTimezone = (typeof selectedGroup !== 'undefined' && selectedGroup !== null) ? selectedGroup.timezone : null;
    const companyTimezone = typeof this.props.profile !== 'undefined' ? this.props.profile.timezone : null;
    const entityGroupTimezone = typeof this.props.profile !== 'undefined' ? this.props.profile.group_timezone : null;
    const timezones = getTimezoneOptions();
    if (this.props.event.start_datetime_timezone) {
      const startDateTZ = timezones.find(el => {
        return el.value === this.props.event.start_datetime_timezone
      });

      start_time_zone =  startDateTZ ? startDateTZ.label : this.props.event.start_datetime_timezone;
      if (((groupTimezone && this.props.event.start_datetime_timezone === groupTimezone) ||
        (companyTimezone && this.props.event.start_datetime_timezone === companyTimezone) ||
        (entityGroupTimezone && this.props.event.start_datetime_timezone === entityGroupTimezone)) &&
        !isTimezonesOffsetEqual(this.props.event.start_datetime_timezone, moment.tz.guess())) {
        showStarTimezone = true;
      }
    } else if (!this.props.event.start_datetime_timezone) {
      if (groupTimezone) {
        if (!isTimezonesOffsetEqual(groupTimezone, moment.tz.guess())) {
          const groupTZ = timezones.find(el => {
            return el.value === groupTimezone
          });
          showStarTimezone = true;
          start_time_zone = typeof groupTZ !== 'undefined' ? groupTZ.label : groupTimezone;
        }
      } else if (!groupTimezone && companyTimezone) {
        if (!isTimezonesOffsetEqual(companyTimezone, moment.tz.guess())) {
          const companyTZ = timezones.find(el => {
            return el.value === companyTimezone
          });
          showStarTimezone = true;
          start_time_zone = typeof companyTZ !== 'undefined' ? companyTZ.label : companyTimezone;
        }
      } else if (!groupTimezone && !companyTimezone && entityGroupTimezone) {
        if (!isTimezonesOffsetEqual(entityGroupTimezone, moment.tz.guess())) {
          const entityGroupTZ = timezones.find(el => {
            return el.value === entityGroupTimezone
          });
          showStarTimezone = true;
          start_time_zone = typeof entityGroupTZ !== 'undefined' ? entityGroupTZ.label : entityGroupTimezone;
        }
      }
    }


    if (showStarTimezone) {
      showStarTimezone = true;
    }


    return (
      <div>
        <Row className={style.activityTypes}>
          <ul className={cx(style.activityStyle)}>
            {this.props.activityTypes.map((activity, idx) => {
              return (
                <li key={idx}
                    className={(this.props.activitySelected && activity.type === this.props.activitySelected) ? cx(style.activitySelected) : null}
                    onClick={() => {
                      this.props.onChangeEventState('activity_type', activity.type);
                    }}><span>{activity.icon}</span> <span className={style.activityType}>{activity.name}</span></li>
              );
            })}
          </ul>
        </Row>
        <div className={cx(style.boxBodyInner)}>
          <Row className={cx(style.taskFormRow)}>
            <Col xs={12} sm={showGroupDropdown ? 6 : 12}>
              <FieldGroup name="activity-title" placeholder="Activity Title" autoFocus value={this.props.event.title}
                          onChange={(e) => {
                            this.props.onChangeEventState('title', e.target.value);
                          }} disabled={!this.props.can_edit}/>
            </Col>

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

          </Row>

          <Row className={cx(style.taskFormRow)}>
            <div className={style['field-wrapper']}>
              <Col xs={12} sm={4}>
                <FormGroup className={cx(styles.fieldGroup)}>
                  <ControlLabel>Date</ControlLabel>
                  <div className={cx(style.inner, styles.datePicker)}>
                    <FormControl componentClass={DatePicker} onChange={this.props.onStartDateChange}
                                 showClearButton={false} name="start-date" ref="start_date"
                                 disabled={(!this.props.can_edit) ? true : false} value={this.props.start_date}/>
                    <FontAwesomeIcon icon={faCalendar} className={style['fa-icon']}/>
                  </div>
                </FormGroup>
              </Col>
              <Col xs={12} sm={4}>
                <FormGroup className={cx(styles.fieldGroup)}>
                  <ControlLabel>Time</ControlLabel>
                  {startTimeElement}
                </FormGroup>
                { showStarTimezone &&
                      <p className={cx(styles.timezoneString)}>{start_time_zone}</p>}
              </Col>
               <Col xs={12} sm={4}>
                <FormGroup>
                  <Checkbox className={cx(style.checkBox)} checked={this.props.allday}
                            onChange={(e) => {
                              this.props.onChangeEventState('all_day', e.target.checked)
                            }}
                            disabled={!this.props.can_edit}><span>Time unspecified</span></Checkbox>
                </FormGroup>
              </Col>
            </div>
          </Row>
        </div>
      </div>);
  };
};
