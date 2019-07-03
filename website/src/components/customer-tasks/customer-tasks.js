import React, { Component } from 'react';
import styles from './customer-tasks.module.scss';
import { Link } from 'react-router-dom';
import SavingSpinner from '../saving-spinner/saving-spinner';
import moment from 'moment';
import { getTasksForCustomer } from '../../actions';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faClock } from '@fortawesome/fontawesome-free-regular';
import { OverlayTrigger, Tooltip, Table } from 'react-bootstrap';
import cx from 'classnames';

export default class CustomerTasks extends Component {
  constructor(props) {

    super(props);

    this.state = {
      tasks: [],
      error: null,
      loadingTasks: false
    };

    this.getUnscheduledTasks = this.getUnscheduledTasks.bind(this);
    this.getScheduledTasks = this.getScheduledTasks.bind(this);

  }

  componentWillMount() {
    this.setState({
      loadingTasks: true
    });
  }

  componentDidMount() {
    Promise.all([this.getScheduledTasks(), this.getUnscheduledTasks()]).then(([scheduledTasks, unscheduledTasks]) => {
      const scheduled = JSON.parse(scheduledTasks);
      const unscheduled = JSON.parse(unscheduledTasks);
      const tasks = scheduled.concat(unscheduled);
      tasks.sort(function (a, b) {
        if (a.start_datetime < b.start_datetime) {
          return 1;
        } else if (a.start_datetime > b.start_datetime) {
          return -1;
        } else {
          return 0;
        }
      });
      this.setState({
        tasks,
        loadingTasks: false
      });
    }).catch(([err1, err2]) => {
      const errorMsg = 'Unable to load tasks at this point';
      this.setState({
        error: errorMsg,
        loadingTasks: false
      });
    });
  }

  getUnscheduledTasks() {
    return getTasksForCustomer(this.props.customer_id, true).then((res) => res);
  }

  getScheduledTasks() {
    return getTasksForCustomer(this.props.customer_id, false).then((res) => res);
  }

  getLocalDateFormat(date) {
    return (
      moment.utc(date).local().format('DD MMMM YYYY, hh:mm a')
    );
  }

  getSplittedDetails(details) {
    if (details !== null) {
      if (details.length > 73) {
        const initial = details.substring(0, 73);
        const final = initial + '...';
        return final;
      } else {
        return details;
      }
    } else {
      return null;
    }
  }

  renderTasksLists() {
    if (!this.state.tasks || this.state.tasks.length === 0) {
      return (
        <tr className={styles.emptyRow}>
          <td colSpan={4}><div className={styles.messageBox}>No tasks found!</div></td>
        </tr>
      );
    } else {
      return (this.state.tasks.map((item) => {
        const unscheduledToolTip = (<Tooltip id="unscheduledTaskIndicator">Unscheduled Task</Tooltip>);
        return (
          <tbody>
          <tr key={item.id}>
            <td><a href={`/tasks/${item.id}`} target="_blank">{item.start_datetime ? this.getLocalDateFormat(item.start_datetime) : 'NO DATETIME'}</a></td>
            <td><a href={`/tasks/${item.id}`} target="_blank">{item.title} { item.unscheduled && <OverlayTrigger OverlayTrigger placement="bottom" overlay={unscheduledToolTip}><span className={styles.unscheduledTasksIndicator}><FontAwesomeIcon icon={faClock} /></span></OverlayTrigger> }</a></td>
            <td>{this.getSplittedDetails(item.details)}</td>
            <td>{item.status}</td>
          </tr>
          <tr className={styles.emptyRow}><td colSpan={4}/></tr>
          </tbody>
        );
      }));
    }
  }

  render() {
    let scheduledTasks = null;
    if (this.state.error) {
      scheduledTasks = (<tr className={styles.emptyRow}>
        <td colSpan={4}>
          <div className={cx(styles.styles.messageBox, styles.error)}>{this.state.error}</div>
        </td>
      </tr>);
    } else {
      scheduledTasks = this.renderTasksLists();
    }

    return (
      <div className={styles.taskTableWrapper}>
        <h3>Tasks</h3>
          <div className={styles.mask}>
          <Table className="table" responsive>
            <thead>
            <tr>
              <th>Start Time</th>
              <th>Task Title</th>
              <th>Task Instructions/Details</th>
              <th>Task Status</th>
            </tr>
            </thead>
            <tbody>
            <tr className={styles.emptyRow}><td colSpan={4}/></tr>
            {this.state.loadingTasks &&
            <tr>
              <td colSpan="{4}">
                <SavingSpinner title="Loading" borderStyle="none" size={8}/>
              </td>
            </tr>
            }
            </tbody>
            {scheduledTasks}
          </Table>
        </div>
      </div>
    );
  }
}
