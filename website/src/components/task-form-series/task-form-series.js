import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Checkbox, Col, FormGroup, ControlLabel, FormControl, Row, Radio } from 'react-bootstrap';
import DatePicker from 'react-bootstrap-date-picker';
import Switch from 'react-bootstrap-switch';
import SwitchButton from '../../helpers/switch_button';
import moment from 'moment';
import SavingSpinner from '../saving-spinner/saving-spinner';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCalendar } from '@fortawesome/fontawesome-free-solid';

import styles from './task-form-series.module.scss';

const FieldGroup = ({ id, label, staticField, fieldInfo, children, labelClassName, ...props }) => (
  <FormGroup controlId={id}>
    { label && <ControlLabel className={labelClassName}>{label}</ControlLabel> }
    {staticField ?
      (<FormControl.Static>
        {props.value}
      </FormControl.Static>) :
      (<FormControl {...props}>{children}</FormControl>)
    }
    {fieldInfo}
  </FormGroup>
);

export default class TaskFormSeries extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true
    };
  }

  componentDidMount() {
    this.props.getTaskSeriesSettings().then(() => {
      this.setState(Object.assign(this.state, { loading: false }));
    }).catch((err) => {
      this.setState({
        loading: false
      });
    });
  }

  getWeekOfTheMonth(week) {
    let value = '';
    switch (week) {
      case 1:
          value = "first";
          break;
      case 2:
          value = "second";
          break;
      case 3:
          value = "third";
          break;
      case 4:
          value = "fourth";
          break;
      case -1:
          value = "last";
          break;   
      default: 
          value = "";
    }

    return value;
  }

  getDayOfTheWeek(day) {
    let value = '';
    switch (day) {
      case 0:
          value = "Monday";
          break; 
      case 1:
          value = "Tuesday";
          break;
      case 2:
          value = "Wednesday";
          break;
      case 3:
          value = "Thursday";
          break;
      case 4:
          value = "Friday";
          break;
      case 5:
          value = "Saturday";
          break;
      case 6:
          value = "Sunday";
          break;          
      default: 
          value = "";
    }

    return value;
  }

  renderRepeatString(seriesSettings) {
    let string = 'Every ';

    const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    const weekdays = [];
    seriesSettings.weekdays.map((day, idx) => {
      if (day) {
        weekdays.push(weekdayNames[idx]);
      }
    });

    if (seriesSettings.repeat > 1) {
      string += `${seriesSettings.repeat} ${seriesSettings.interval}s`;
    } else {
      string += seriesSettings.interval;
    }

    if (seriesSettings.interval == 'month') {
      const day_in_week = this.getDayOfTheWeek(seriesSettings.monthly_day_in_week);
      const week_in_month = this.getWeekOfTheMonth(seriesSettings.monthly_week_in_month);
      string += ` on ${week_in_month} ${day_in_week} `;
    } else {
      if (weekdays.length !== 0) {
        string += ' on ' + weekdays.join(', ');
      }  
    }

    

    string += ' starting on ' + moment(seriesSettings.start_date).format('l');

    if (seriesSettings.ends_condition == 'date') {
      string += ' ending on ' + moment(seriesSettings.ends_on).format('l');
    } else {
      if (!seriesSettings.maximum_occurrences) {
        seriesSettings.maximum_occurrences = 0;
      }
      string += ' ending after ' + seriesSettings.maximum_occurrences + ' occurrences';
    }

    return string;
  }

  render() {
    if (this.state.loading) {
      return (
        <SavingSpinner title="Loading Series Settings" borderStyle="none" fontSize={16} />
      );
    }

    const { edit_series, interval, start_date, weekdays, repeat, ends_condition, ends_on, maximum_occurrences, monthly_day_in_week, monthly_week_in_month }
      = this.props.seriesSettings;

    const start_date_local = moment.utc(start_date).local().format();
    const end_date_local = ends_on ? moment.utc(ends_on).local().format() : '';

    const onChangeField = (field) => {
      return (event, value) => {

        if (event && event.target) {
          value = event.target.value;
        }

        if (typeof value === 'undefined' || typeof event === 'string') {
          value = event;
        }

        if (field == 'monthly_day_in_week' || field == 'monthly_week_in_month') {
          value = parseInt(value);
        }
        if(field == 'edit_series') {
            if (edit_series == true) {
                value = false;
            } else {
                value = true;
            }
        }
        this.props.onChange(field, value);
      };
    };

    const onSeriesEndsOnFocus = (field) => {
      return () => this.props.onSeriesEndsOnFocus(field);
    };

    const onChangeWeekDay = (day) => {
      return (event) => {
        const new_weekdays = weekdays;
        new_weekdays[day] = event.target.checked;
        this.props.onChange('weekdays', new_weekdays);
      };
    };

    const weekdaysMapper = (value, day) => {
      const day_names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      return (
        <Checkbox className={styles.dayCheckbox} key={day} inline name={day} onChange={onChangeWeekDay(day)} checked={weekdays[day]} disabled={!edit_series}>
          {day_names[day]}
        </Checkbox>
      );
    };

    return (
        <Col md={12} className={styles['repeat-block-container']}>
          <Row>
            <Col md={12} sm={12}>
              <div className={styles.controlPadding} style={{marginBottom: '15px', fontStyle: 'italic', float:'right'}}>
                <span className={styles.repeat_string}>{this.renderRepeatString(this.props.seriesSettings)}</span>
              </div>
              <div className={styles['edit-series']}>
                <FieldGroup key="edit-series" name="edit-series" componentClass={SwitchButton} checked={edit_series}
                           label="Edit Series" onChange={onChangeField('edit_series')} disabled={!this.props.canEdit}/>
              </div>
            </Col>

            <Col lg={5} md={6} sm={6} xs={12}>
              <div className={[styles['flexbox-block'], styles['interval']].join(' ')}>
                <FieldGroup id="recurring-task-interval" label="Interval" componentClass="select" disabled={!edit_series}
                            onChange={onChangeField('interval')} name="recurring-task-interval" value={interval} className={styles.series_field}>
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </FieldGroup>
                <FieldGroup id="recurring-task-repeat" label="Repeat every" componentClass="select" disabled={!edit_series}
                            onChange={onChangeField('repeat')} name="recurring-task-repeat" value={repeat} className={styles.series_field}>
                  <option value="1">{interval}</option>
                  <option value="2">2 {interval}s</option>
                  <option value="3">3 {interval}s</option>
                  <option value="4">4 {interval}s</option>
                  <option value="5">5 {interval}s</option>
                  <option value="6">6 {interval}s</option>
                </FieldGroup>
              </div>
                { interval == 'month' ? <div style={{marginTop: '15px'}}>
                      <ControlLabel>Repeat on</ControlLabel>
                      <div className={styles['flexbox-block']}>
                      <div>
                        <FieldGroup id="recurring-task-repeat" componentClass="select" disabled={!edit_series} className={styles.series_field}
                                    onChange={onChangeField('monthly_week_in_month')} name="recurring-task-repeat" value={monthly_week_in_month}>
                          <option value="1">first</option>
                          <option value="2">second</option>
                          <option value="3">third</option>
                          <option value="4">fourth</option>
                          <option value="-1">last</option>
                        </FieldGroup>
                      </div>
                      <div>
                        <FieldGroup id="recurring-task-repeat" componentClass="select" disabled={!edit_series}  className={styles.series_field}
                                    onChange={onChangeField('monthly_day_in_week')} name="recurring-task-repeat" value={monthly_day_in_week}>
                          <option value="0">Monday</option>
                          <option value="1">Tuesday</option>
                          <option value="2">Wednesday</option>
                          <option value="3">Thursday</option>
                          <option value="4">Friday</option>
                          <option value="5">Saturday</option>
                          <option value="6">Sunday</option>
                        </FieldGroup>
                      </div>
                      </div>
                    </div> :
                    <div>
                      <ControlLabel>Repeat on</ControlLabel>
                      <div className={styles.weekdaysList}>{ weekdays.map(weekdaysMapper) }</div>
                    </div> }
            </Col>



            <Col lg={7} md={6} sm={6} xs={12}>
              <div className={[styles['flexbox-block'], styles['start-end']].join(' ')}>
                <div className={[styles.series_field, styles['date-block']].join(' ')}>
                  <FieldGroup id="start-date" label="Starts on" componentClass={DatePicker} showClearButton={false} disabled={!edit_series}
                                onChange={onChangeField('start_date')} name="start-date" value={start_date_local}/>
                  <FontAwesomeIcon icon={faCalendar} className={styles['fa-icon']}/>
                </div>
                <div>
                  <ControlLabel>Ends</ControlLabel>
                  <div className={[styles['flexbox-block'], styles['end-block']].join(' ')}>
                    <Row>
                      <Col md={3} sm={3}>
                        <Radio onChange={onChangeField('ends_condition')} value="date" checked={ends_condition == 'date'} disabled={!edit_series}>
                          On
                        </Radio>
                      </Col>
                      <Col md={9} sm={9}>
                        <div className={[styles.series_field_max, styles['date-block']].join(' ')}>
                          <FormControl onFocus={onSeriesEndsOnFocus('ends_on')} onChange={onChangeField('ends_on')} showClearButton={false} componentClass={DatePicker} value={end_date_local} disabled={!edit_series}/>
                          <FontAwesomeIcon icon={faCalendar} className={styles['fa-icon']}/>
                        </div>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={3} sm={3}>
                        <Radio onChange={onChangeField('ends_condition')} value="maximum_occurrences" checked={ends_condition == 'maximum_occurrences'} disabled={!edit_series}>
                          After
                        </Radio>
                      </Col>
                      <Col md={9} sm={9}>
                        <FormControl className={styles.maxOccurences} onFocus={onSeriesEndsOnFocus('maximum_occurrences')} onChange={onChangeField('maximum_occurrences')} type="number" value={maximum_occurrences} disabled={!edit_series}/>
                        <FormControl.Static className={styles.maxOccurencesLabel}>
                          occurrences
                        </FormControl.Static>
                      </Col>
                    </Row>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Col>);
  }
}

TaskFormSeries.propTypes = {
  onChange: PropTypes.func.isRequired,
  seriesSettings: PropTypes.object,
  recurringEnable: PropTypes.boolean,
  getTaskSeriesSettings: PropTypes.func.isRequired,
  onSeriesEndsOnFocus: PropTypes.func.isRequired,
};
