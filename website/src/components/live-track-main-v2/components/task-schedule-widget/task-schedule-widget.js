import React, { Component } from 'react';
import styles from './task-schedule-widget.module.scss';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCalendarAlt,faUser, faMapMarkerAlt } from '@fortawesome/fontawesome-free-solid';
import moment from 'moment';
import AddToCalendar from 'react-add-to-calendar';

export default class TaskScheduleWidget extends Component {
  constructor(props) {
    super(props);
  }

  renderUnscheduledTask(calender_event) {
    const icon = { 'calendar-plus-o': 'left' };
    return (
      <div className={styles.taskScheduleContainer}>
        <div>
          <p>
            <FontAwesomeIcon icon={faCalendarAlt} /> Not yet scheduled
          </p>
          {this.props.task.customer_name &&
          <p>
            <FontAwesomeIcon icon={faUser} />{this.props.task.customer_name}
          </p>
          }
          {this.props.task.customer_address !== null && this.props.task.customer_address !== '' &&
          <p>
            <FontAwesomeIcon icon={faMapMarkerAlt} /> { this.props.task.customer_address }
          </p>
          }
        </div>
        <div className={styles.addToCalendarButton}>
          <AddToCalendar event={calender_event} buttonTemplate={icon} buttonLabel="" style={{ color: 'red' }}/>
        </div>
      </div>
    );
  }

  renderTimeWindowIfNeeded(start_datetime, time_window_start, calender_event) {
    const window_time = moment.utc(start_datetime).local().add(time_window_start, 'minutes');
    const icon = { 'calendar-plus-o': 'left' };
    return (
      <div className={styles.taskScheduleContainer}>
        <div>
          <p>
            <FontAwesomeIcon icon={faCalendarAlt} /> { moment.utc(start_datetime).local().format('MMMM DD') }, starting between { moment.utc(start_datetime).local().format('hh:mm A') } - {window_time.format('hh:mm A')}
          </p>
          {this.props.task.customer_name &&
          <p>
            <FontAwesomeIcon icon={faUser} />{this.props.task.customer_name}
          </p>
          }
          {this.props.task.customer_address !== null && this.props.task.customer_address !== '' &&
          <p>
            <FontAwesomeIcon icon={faMapMarkerAlt} /> { this.props.task.customer_address }
          </p>
          }
        </div>
        <div className={styles.addToCalendarButton}>
          <AddToCalendar event={calender_event} buttonTemplate={icon} buttonLabel="" />
        </div>
      </div>
    );
  }

  render() {

    const event = {
      title: this.props.task.title,
      description: this.props.task.details,
      location: this.props.task.customer_address,
      startTime: this.props.task.start_datetime_original_iso_str,
      endTime: this.props.task.end_datetime_original_iso_str
    };

    const { task, profile } = this.props;

    const icon = { 'calendar-plus-o': 'left' };

    if (task.unscheduled) {
      return this.renderUnscheduledTask(event);
    }

    if (task.enable_time_window_display) {
      return this.renderTimeWindowIfNeeded(task.start_datetime, task.time_window_start, event);
    }

    let start_datetime_str = '';
    if (task.start_datetime) {
      start_datetime_str = moment.utc(task.start_datetime).local().format('MMMM DD hh:mm A');
    }

    let color = '#008BF8';
    if (profile && profile.show_brand_color && profile.color) {
      color = profile.color;
    }

    const addToCalenderButton = document.getElementsByClassName('react-add-to-calendar__button');
    if (addToCalenderButton && addToCalenderButton.length > 0 && color) {
      addToCalenderButton[0].style.color = color;
      addToCalenderButton[0].style.borderColor = color;
      addToCalenderButton[0].style.backgroundColor = color;
    }

    return (
      <div className={styles.taskScheduleContainer}>
        <div>
          {!this.props.task.unscheduled &&
          <p>
            <FontAwesomeIcon icon={faCalendarAlt} /> { start_datetime_str }
          </p>
          }
          {this.props.task.customer_name &&
          <p>
            <FontAwesomeIcon icon={faUser} />{this.props.task.customer_name}
          </p>
          }
          {this.props.task.customer_address !== null &&
          <p>
            <FontAwesomeIcon icon={faMapMarkerAlt} /> { this.props.task.customer_address }
          </p>
          }
        </div>
        <div className={styles.addToCalendarButton}>
          <AddToCalendar event={event} buttonTemplate={icon} buttonLabel="" />
        </div>
      </div>
    );
  }

}
