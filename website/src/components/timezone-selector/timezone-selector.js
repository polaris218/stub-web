import React, { Component } from 'react';
import styles from './timezone-selector.module.scss';
import moment from 'moment-timezone';
import cx from 'classnames';
import { Checkbox  } from 'react-bootstrap';
import Select, { components } from 'react-select';
import $ from 'jquery';
import _ from 'lodash';
import { getTimezoneOptions } from '../../helpers/timezones';

export default class TimezoneSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showTimezonePicker: false,
      timezones: [],
      separateTimezones: false,
      start_timezone: null,
      end_timezone: null,
      client_timezone: moment.tz.guess()
    };

    this.toggleTimezonePicker = this.toggleTimezonePicker.bind(this);
    this.populateTimezonesArray = this.populateTimezonesArray.bind(this);
    this.hideTimezonePicker = this.hideTimezonePicker.bind(this);
    this.useSeparateTimezones = this.useSeparateTimezones.bind(this);
    this.getUserTimezone = this.getUserTimezone.bind(this);
    this.setStartTimezoneValue = this.setStartTimezoneValue.bind(this);
    this.setEndTimezoneValue = this.setEndTimezoneValue.bind(this);
    this.commitTimezones = this.commitTimezones.bind(this);
    this.handleStartTimezoneChange = this.handleStartTimezoneChange.bind(this);
    this.handleEndTimezoneChange = this.handleEndTimezoneChange.bind(this);
    this.removeTimezones = this.removeTimezones.bind(this);

  }

  componentDidMount() {
    this.populateTimezonesArray();
    this.getUserTimezone();
  }

  componentWillReceiveProps(nextProps) {
    if ((!_.isEqual(this.props.profile, nextProps.profile)) || !_.isEqual(this.props.group, nextProps.group)) {
      this.populateTimezonesArray(nextProps);
      this.getUserTimezone(nextProps);
    }
  }

  populateTimezonesArray(updatedProps = this.props) {
    // const momentTimezones = moment.tz.names();
    const timezoneOptions = [];
    const timezonesList = getTimezoneOptions();
    // const preferredTimezones = this.props.profile.preferred_timezones;
    if (typeof updatedProps.group !== 'undefined' && updatedProps.group !== null && updatedProps.group.timezone !== null && updatedProps.group.timezone !== '') {
      timezoneOptions.push({
        value: updatedProps.group.timezone,
        shortname: null,
        label: 'Group ' + updatedProps.group.name + ' Timezone - (UTC' + moment.tz(new Date, updatedProps.group.timezone).format('Z') + ') ' + updatedProps.group.timezone,
        utcOffset: moment.tz(new Date, updatedProps.group.timezone).utcOffset(),
        offset: moment.tz(new Date, updatedProps.group.timezone).format('Z')
      });
    }
    if (typeof updatedProps.profile !== 'undefined' && updatedProps.profile !== null && updatedProps.profile.timezone !== null && updatedProps.profile.timezone !== '') {
      timezoneOptions.push({
        value: updatedProps.profile.timezone,
        shortname: null,
        label: 'Company Timezone - (UTC' + moment.tz(new Date, updatedProps.profile.timezone).format('Z') + ') ' + updatedProps.profile.timezone,
        utcOffset: moment.tz(new Date, updatedProps.profile.timezone).utcOffset(),
        offset: moment.tz(new Date, updatedProps.profile.timezone).format('Z')
      });
    }
    // preferredTimezones.map((zone) => {
    //   timezoneOptions.push({
    //     label: zone,
    //     value: zone
    //   });
    // });
    timezonesList.map((tz) => {
      timezoneOptions.push(tz);
    });
    // const allTimezones = moment.tz.names();
    // allTimezones.map((timezone) => {
    //   timezoneOptions.push({
    //     label: timezone,
    //     value: timezone
    //   });
    // });
    this.setState({
      timezones: timezoneOptions
    });
  }

  toggleTimezonePicker (e) {
    e.preventDefault();
    e.stopPropagation();
    const timezonePickerState = this.state.showTimezonePicker;
    this.setState({
      showTimezonePicker: !timezonePickerState
    });
  }

  hideTimezonePicker(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      showTimezonePicker: false
    });
  }

  useSeparateTimezones(e) {
    this.setState({
      separateTimezones: e.target.checked
    });
  }

  getUserTimezone(data = this.props) {
    let start_timezone = moment.tz.guess();
    let end_timezone = moment.tz.guess();
    let separateTimezones = false;
    if (typeof data.event !== 'undefined') {
      start_timezone = data.event.start_datetime_timezone;
      end_timezone = data.event.end_datetime_timezone;
      if (!_.isEqual(data.event.start_datetime_timezone, data.event.end_datetime_timezone)) {
	      separateTimezones = true;
      }
    }
    this.setState({
      start_timezone,
      end_timezone,
      separateTimezones
    });
  }

  setStartTimezoneValue() {
    const timezoneValues = $.extend(true, [], this.state.timezones);
    const defaultValue = timezoneValues.find((el) => {
      return el.value === this.state.start_timezone;
    });
    if (typeof defaultValue !== 'undefined' && defaultValue !== null) {
      return defaultValue;
    } else if (this.state.start_timezone !== null && this.state.start_timezone !== '') {
      const taskTimezone = {
        label: this.state.start_timezone,
        value: this.state.start_timezone
      };
      timezoneValues.push(taskTimezone);
      this.setState({
        timezones: timezoneValues
      }, () => {
        return taskTimezone;
      });
    } else {
      if (this.props.group && this.props.group.timezone) {
        const defaultValue = timezoneValues.find((el) => {
          return el.value === this.props.group.timezone;
        });
        if (defaultValue) {
          return defaultValue;
        } else {
          const taskTimezone = {
            label: this.props.group.timezone,
            value: this.props.group.timezone
          };
          timezoneValues.push(taskTimezone);
          this.setState({
            timezones: timezoneValues
          }, () => {
            return taskTimezone;
          });
        }
      } else if (this.props.profile && this.props.profile.timezone) {
        const defaultValue = timezoneValues.find((el) => {
          return el.value === this.props.profile.timezone;
        });
        if (defaultValue) {
          return defaultValue;
        } else {
          const taskTimezone = {
            label: this.props.profile.timezone,
            value: this.props.profile.timezone
          };
          timezoneValues.push(taskTimezone);
          this.setState({
            timezones: timezoneValues
          }, () => {
            return taskTimezone;
          });
        }
      } else {
        return {
          label: moment.tz.guess(),
          value: moment.tz.guess()
        };
      }
    }
  }

  setEndTimezoneValue() {
    const timezoneValues = $.extend(true, [], this.state.timezones);
    const defaultValue = timezoneValues.find((el) => {
      return el.value === this.state.end_timezone;
    });
    if (typeof defaultValue !== 'undefined' && defaultValue !== null) {
      return defaultValue;
    } else if (this.state.end_timezone !== null && this.state.end_timezone !== '') {
      const taskTimezone = {
        label: this.state.end_timezone,
        value: this.state.end_timezone
      };
      timezoneValues.push(taskTimezone);
      this.setState({
        timezones: timezoneValues
      }, () => {
        return taskTimezone;
      });
    } else {
      if (this.props.group && this.props.group.timezone) {
        const defaultValue = timezoneValues.find((el) => {
          return el.value === this.props.group.timezone;
        });
        if (defaultValue) {
          return defaultValue;
        } else {
          const taskTimezone = {
            label: this.props.group.timezone,
            value: this.props.group.timezone
          };
          timezoneValues.push(taskTimezone);
          this.setState({
            timezones: timezoneValues
          }, () => {
            return taskTimezone;
          });
        }
      } else if (this.props.profile && this.props.profile.timezone) {
        const defaultValue = timezoneValues.find((el) => {
          return el.value === this.props.profile.timezone;
        });
        if (defaultValue) {
          return defaultValue;
        } else {
          const taskTimezone = {
            label: this.props.profile.timezone,
            value: this.props.profile.timezone
          };
          timezoneValues.push(taskTimezone);
          this.setState({
            timezones: timezoneValues
          }, () => {
            return taskTimezone;
          });
        }
      } else {
        return {
          label: moment.tz.guess(),
          value: moment.tz.guess()
        };
      }
    }
  }

  commitTimezones(e) {
    e.preventDefault();
    e.stopPropagation();
    let { start_timezone, end_timezone } = this.state;
    if (!start_timezone) {
      const timezoneValues = $.extend(true, [], this.state.timezones);
      if (this.props.group && this.props.group.timezone) {
        const selectedGroupTimeZone = timezoneValues.find((el) => {
          return el.value === this.props.group.timezone;
        });
        if (selectedGroupTimeZone) {
          start_timezone = selectedGroupTimeZone.value;
        } else {
          start_timezone = this.props.group.timezone;
        }
      } else if (this.props.profile && this.props.profile.timezone) {
        const selectedGroupTimeZone = timezoneValues.find((el) => {
          return el.value === this.props.profile.timezone;
        });
        if (selectedGroupTimeZone) {
          start_timezone = selectedGroupTimeZone.value;
        } else {
          start_timezone = this.props.profile.timezone;
        }
      } else {
        start_timezone = moment.tz.guess();
      }
    }
    if (!end_timezone) {
      const timezoneValues = $.extend(true, [], this.state.timezones);
      if (this.props.group && this.props.group.timezone) {
        const selectedGroupTimeZone = timezoneValues.find((el) => {
          return el.value === this.props.group.timezone;
        });
        if (selectedGroupTimeZone) {
          end_timezone = selectedGroupTimeZone.value;
        } else {
          end_timezone = this.props.group.timezone;
        }
      } else if (this.props.profile && this.props.profile.timezone) {
        const selectedGroupTimeZone = timezoneValues.find((el) => {
          return el.value === this.props.profile.timezone;
        });
        if (selectedGroupTimeZone) {
          end_timezone = selectedGroupTimeZone.value;
        } else {
          end_timezone = this.props.profile.timezone;
        }
      } else {
        end_timezone = moment.tz.guess();
      }
    }
    this.props.setTimezoneValues({
      start_timezone,
      end_timezone: this.state.separateTimezones ? end_timezone : null,
    });
    this.setState({
      showTimezonePicker: false
    });
  }

  handleStartTimezoneChange(timezone) {
    this.setState({
      start_timezone: timezone.value
    })
  }

  handleEndTimezoneChange(timezone) {
    this.setState({
      end_timezone: timezone.value
    })
  }

  removeTimezones(e) {
    this.props.setTimezoneValues({
      start_timezone: null,
      end_timezone: null
    });
    this.setState({
      start_timezone: null,
      end_timezone: null,
      showTimezonePicker: false
    });
  }

  render() {
    const StartControlComponent = (props) => (
      <div className={cx(styles.timezoneControlComponent)}>
        {<p>Event start time zone</p>}
        <components.Control {...props} />
      </div>
    );
    const EndControlComponent = (props) => (
      <div className={cx(styles.timezoneControlComponent, !this.state.separateTimezones && styles.controlIsDisabled)}>
        {<p>Event end time zone</p>}
        <components.Control {...props} />
      </div>
    );
    return (
      <div className={styles.timezoneSelectorContainer}>
        <button disabled={this.props.disabled} onClick={(e) => { this.toggleTimezonePicker(e) }} type='button' className={styles.timezonePicker}>Time Zone</button>
        <div className={cx(styles.timezonePickerContainer, this.state.showTimezonePicker && styles.showTimezonePicker)}>
          <span className={styles.arrowUp}></span>
          <div className={styles.pickerHeader}>
            <span>Task Time zone</span>
            <span><button className={styles.closePicker} onClick={(e) => { this.hideTimezonePicker(e) }}>x</button></span>
          </div>
          <div className={styles.differentTimezonesOptionsContainer}>
            <Checkbox checked={this.state.separateTimezones} onChange={(e) => { this.useSeparateTimezones(e) }}>
              Use separate start and end time zones
            </Checkbox>
          </div>
          <div className={styles.startDateTimezonePickerDropDownContainer}>
            <Select
              className={styles.timezoneSelectControl}
              classNamePrefix='select'
              isClearable={false}
              isSearchable
              name='startDateTimeZone'
              options={this.state.timezones}
              components={{ Control: StartControlComponent }}
              value={this.setStartTimezoneValue()}
              onChange={this.handleStartTimezoneChange}
            />
          </div>
          <div className={styles.endDateTimezonePickerDropDownContainer}>
            <Select
              className={styles.timezoneSelectControl}
              classNamePrefix='select'
              isClearable={false}
              isSearchable
              name='endDateTimeZone'
              options={this.state.timezones}
              components={{ Control: EndControlComponent }}
              isDisabled={!this.state.separateTimezones}
              value={this.setEndTimezoneValue()}
              onChange={this.handleEndTimezoneChange}
            />
          </div>
          <div className={styles.timezonePickerActionsContainer}>
            {(this.state.start_timezone || this.state.end_timezone) &&
            <button onClick={(e) => {
              this.removeTimezones(e)
            }} className={styles.removeTimezonesBtn} type='button'>Remove Time Zones</button>
            }
            {' '}
            <button onClick={(e) => { this.hideTimezonePicker(e) }} className={styles.cancelTimezonesBtn} type='button'>Cancel</button>
            {' '}
            <button onClick={(e) => { this.commitTimezones(e) }} className={styles.selectTimezonesBtn} type='button'>Ok</button>
          </div>
        </div>
      </div>
    );
  }

}
