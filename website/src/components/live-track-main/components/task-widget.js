import React, { Component } from 'react';
import PropTypes from 'prop-types';

import moment from 'moment';
import styles from './task-widget.module.scss';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faCalendarAlt } from '@fortawesome/fontawesome-free-solid';
import AddToCalendar from 'react-add-to-calendar';
import style from 'react-add-to-calendar/dist/react-add-to-calendar.css';

export default class TaskWidget extends Component {
  constructor(props) {
    super(props);
  }

  renderUnscheduledTask(start_datetime, calender_event) {
    const icon = { 'calendar-plus-o': 'left' };
    if (start_datetime) {
      const start_datetime_str = moment.utc(start_datetime).local().format('MMMM DD');
      return <div style={{textAlign: 'center'}}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
            <h4 style={{ marginBottom: '5px' }} className={styles['task-headline']}>Scheduled at</h4>
            <div className={styles['task-widget']}>
              <h4>{ start_datetime_str }</h4>
            </div>
            <div className={styles.addToCalendarButton}>
              <AddToCalendar event={event} buttonTemplate={icon} />
            </div>
        </div>;
    } else {
        return <div style={{textAlign: 'center'}}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
            <h4 style={{ marginBottom: '5px' }} className={styles['task-headline']}>Not yet Scheduled</h4>
        </div>;
    }
  }

  renderTimeWindowIfNeeded(start_datetime, time_window_start, calender_event) {
    const window_time = moment.utc(start_datetime).local().add(time_window_start, 'minutes');
    const icon = { 'calendar-plus-o': 'left' };
    return <div style={{textAlign: 'center'}}>
            <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
            <h4 style={{ marginBottom: '5px' }} className={styles['task-headline']}>Scheduled between</h4>
            <div className={styles['task-widget']}>
              <h4>{ moment.utc(start_datetime).local().format('MMMM DD hh:mm A') } - {window_time.format('hh:mm A')}</h4>
            </div>
            <div className={styles.addToCalendarButton}>
              <AddToCalendar event={calender_event} buttonTemplate={icon} />
            </div>
        </div>;
  }

  render() {
    const { task } = this.props;
    const icon = { 'calendar-plus-o': 'left' };
    const event = {
      title: task.title,
      description: task.details,
      location: task.customer_address,
      startTime: task.start_datetime_original_iso_str,
      endTime: task.end_datetime_original_iso_str
    }
    if (task.unscheduled) {
      return this.renderUnscheduledTask(task.start_datetime, event);
    }
    
    if (task.enable_time_window_display) {
      return this.renderTimeWindowIfNeeded(task.start_datetime, task.time_window_start, event);
    }

    let start_datetime_str = '';
    if (task.start_datetime) {
      start_datetime_str = moment.utc(task.start_datetime).local().format('MMMM DD hh:mm A');
    }

    return (<div style={{textAlign: 'center'}}>
        <FontAwesomeIcon icon={faCalendarAlt} className={styles.icon} />
        <h4 style={{ marginBottom: '5px' }} className={styles['task-headline']}>Scheduled at</h4>
        <div className={styles['task-widget']}>
          <h4>{ start_datetime_str }</h4>
        </div>
        <div className={styles.addToCalendarButton}>
          <AddToCalendar event={event} buttonTemplate={icon} />
        </div>
      </div>
    );
  }
}

TaskWidget.propTypes = {
  task: PropTypes.object.isRequired
};
