import React, { Component } from 'react';
import style from "../../base-styling.module.scss";
import styles from './recurrence.module.scss';
import cx from 'classnames';
import { Row, Col, FormGroup, FormControl, ControlLabel, Checkbox, Radio } from "react-bootstrap";
import DatePicker from "react-bootstrap-date-picker";
import moment from "moment";
import { FieldGroup } from "../../../fields";
import SavingSpinner from "../../../saving-spinner/saving-spinner";

export default class Recurrence extends Component {
  constructor(props) {
    super(props);

    this.getWeekOfTheMonth = this.getWeekOfTheMonth.bind(this);
    this.getDayOfTheWeek = this.getDayOfTheWeek.bind(this);
    this.renderRepeatString = this.renderRepeatString.bind(this);

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
    const { edit_series, interval, start_date, weekdays, repeat, ends_condition, ends_on, maximum_occurrences, monthly_day_in_week, monthly_week_in_month }
      = this.props.seriesSettings;

    const start_date_local = moment.utc(start_date).local().format();
    const end_date_local = ends_on ? moment.utc(ends_on).local().format() : '';

    const onSeriesEndsOnFocus = (field) => {
      return () => this.props.onSeriesEndsOnFocus(field);
    };

    const onChangeWeekDay = (day) => {
      return (event) => {
        const new_weekdays = weekdays;
        new_weekdays[day] = event.target.checked;
        this.props.onChangeSeriesState('weekdays', new_weekdays);

      };
    };

    const weekdaysMapper = (value, day) => {
      const day_names = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      return (
        <Checkbox className={cx(styles.checkBox)} key={day} name={day} onChange={onChangeWeekDay(day)} checked={weekdays[day]} disabled={!edit_series}>
          <span>{day_names[day]}</span>
        </Checkbox>
      );
    };

    return (
      <div className={cx(style.box)}>
        <h3 className={cx(style.boxTitle)}>Recurrence</h3>
        <div className={cx(style.boxBody)}>
          {this.state.loading ? <div className={styles.loaderWrapper}><SavingSpinner title="Loading Series Settings" borderStyle="none" fontSize={16} /></div> : <div>
            <div className={cx(styles.recurrenceWrapper)}>
              <Row className={cx(style.taskFormRow)}>
                <Col xs={12} md={6}>
                  <div className={cx(style.boxBodyInner)}>
                    <div className={cx(styles.recurrenceStart)}>
                      <div className={cx(styles.seriesCheckbox)}>
                        <FormGroup>
                          <Checkbox
                            key="edit-series" name="edit-series" checked={edit_series}
                            onChange={(e) => {this.props.onChangeSeriesState('edit_series', e.target.checked)}}
                            disabled={!this.props.can_edit} className={cx(style.checkBox)}><span>Edit Series</span>
                          </Checkbox>
                        </FormGroup>
                      </div>
                      <div className={cx(styles.repeatTime)}>
                        <FormGroup className={cx(styles.repeatTimeInner)}>
                          <ControlLabel className={cx(styles.controlLabel)}>Repeat every</ControlLabel>
                          <div className={cx(style.selectBox, styles.selectBoxA)}>
                            <FieldGroup
                              componentClass="select" disabled={!edit_series}
                              onChange={(e) => {this.props.onChangeSeriesState('interval', e.target.value)}}
                              name="recurring-task-interval" value={interval} className={styles.series_field}>
                              <option value="day">Daily</option>
                              <option value="week">Weekly</option>
                              <option value="month">Monthly</option>
                            </FieldGroup>
                          </div>
                          <div className={cx(style.selectBox, styles.selectBox)}>
                            <FieldGroup
                              componentClass="select" disabled={!edit_series}
                              onChange={(e) => {this.props.onChangeSeriesState('repeat', e.target.value)}} name="recurring-task-repeat" value={repeat} className={styles.series_field}>
                              <option value="1">{interval}</option>
                              <option value="2">2 {interval}s</option>
                              <option value="3">3 {interval}s</option>
                              <option value="4">4 {interval}s</option>
                              <option value="5">5 {interval}s</option>
                              <option value="6">6 {interval}s</option>
                              { interval === "week" &&<option value="7">7 {interval}s</option>}
                              { interval === "week" &&<option value="8">8 {interval}s</option>}
                              { interval === "week" &&<option value="9">9 {interval}s</option>}
                              { interval === "week" &&<option value="10">10 {interval}s</option>}
                              { interval === "week" &&<option value="11">11 {interval}s</option>}
                              { interval === "week" &&<option value="12">12 {interval}s</option>}
                            </FieldGroup>
                          </div>
                        </FormGroup>

                        { interval == 'month' ?
                          <div className={cx(styles.repeatTimeInner)}>
                            <ControlLabel className={cx(styles.controlLabel)}>Repeat on</ControlLabel>
                            <div className={cx(style.selectBox, styles.selectBoxA)}>
                              <FieldGroup
                                componentClass="select" disabled={!edit_series}
                                onChange={(e) => {this.props.onChangeSeriesState('monthly_week_in_month', e.target.value)}} name="recurring-task-repeat"
                                value={monthly_week_in_month}>
                                <option value="1">first</option>
                                <option value="2">second</option>
                                <option value="3">third</option>
                                <option value="4">fourth</option>
                                <option value="-1">last</option>
                              </FieldGroup>
                            </div>
                            <div className={cx(style.selectBox, styles.selectBox)}>
                              <FieldGroup
                                componentClass="select" disabled={!edit_series}
                                onChange={(e) => {this.props.onChangeSeriesState('monthly_day_in_week', e.target.value)}} name="recurring-task-repeat"
                                value={monthly_day_in_week}>
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
                          :
                          <div className={cx(styles.checkBoxDays)}>
                            <ControlLabel className={cx(styles.controlLabel)}>Repeat on</ControlLabel>
                            <FormGroup className={cx(styles.formGroup)}>{ weekdays.map(weekdaysMapper) }</FormGroup>
                          </div>
                        }
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className={cx(style.boxBodyInner)}>
                    <div className={cx(styles.recurrenceTimeWrapper)}>
                      <div className={cx(styles.startTime)}>
                        <FormGroup className={cx(styles.formGroup)}>
                          <ControlLabel className={cx(styles.controlLabel)}>Start</ControlLabel>
                          <div className={cx(styles['field-wrapper'])}>
                            <FormControl
                              className={cx(style['form-control'], styles['form-control'])}
                              componentClass={DatePicker} showClearButton={false} disabled={!edit_series}
                              onChange={(value) => {this.props.onChangeSeriesState('start_date', value)}}
                              name="start-date" value={start_date_local}
                              minDate={moment().format()}
                            />
                          </div>
                        </FormGroup>
                      </div>
                      <div className={cx(styles.endTime)}>
                        <FormGroup className={cx(styles.formGroup)}>
                          <ControlLabel className={cx(styles.controlLabel)}>End</ControlLabel>
                          <Radio name="ends_condition" className={cx(style.checkBox, styles.checkBox)} onChange={() => {this.props.onChangeSeriesState('ends_condition', 'date')}} value="date" checked={ends_condition === 'date'} disabled={!edit_series}><span>On</span></Radio>
                          <div className={cx(styles['field-wrapper'])}>
                            <FormControl
                              className={cx(style['form-control'], styles['form-control'])} onFocus={onSeriesEndsOnFocus('ends_on')}
                              onChange={(value) => {this.props.onChangeSeriesState('ends_on', value)}}
                              showClearButton={false} componentClass={DatePicker} value={end_date_local} disabled={!edit_series}
                            />
                          </div>
                        </FormGroup>
                        <FormGroup className={cx(styles.formGroup)}>
                          <Radio name="ends_condition" className={cx(style.checkBox, styles.checkBox)} onChange={() => {this.props.onChangeSeriesState('ends_condition', 'maximum_occurrences')}} value="maximum_occurrences" checked={ends_condition === 'maximum_occurrences'} disabled={!edit_series}><span>After</span></Radio>
                          <FormControl
                            className={cx(style['form-control'], styles['form-control'])} placeholder="0 occurrences" name="occurrences"
                            onFocus={onSeriesEndsOnFocus('maximum_occurrences')}
                            onChange={(e) => {this.props.onChangeSeriesState('maximum_occurrences', e.target.value)}} type="number"
                            value={maximum_occurrences} min="1" disabled={!edit_series}
                          />
                        </FormGroup>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </div>
            <div className={cx(style.boxBodyInner)}>
              <p className={styles.repeat_string}>{this.renderRepeatString(this.props.seriesSettings)}</p>
            </div>
          </div>}
        </div>
      </div>
    );
  }
}
