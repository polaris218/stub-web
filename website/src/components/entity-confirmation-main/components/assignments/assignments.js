import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './assignments.module.scss';
import { Checkbox, Alert, OverlayTrigger, Tooltip } from 'react-bootstrap';
import moment from 'moment';
import cx from 'classnames';
import SavingSpinner from '../../../saving-spinner/saving-spinner';

export default class Assignments extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedTasks: null
    };

    this.renderAssignments = this.renderAssignments.bind(this);
    this.getEntitiesName = this.getEntitiesName.bind(this);
    this.handleTaskSelection = this.handleTaskSelection.bind(this);
    this.renderActionButtons = this.renderActionButtons.bind(this);
    this.acceptSelectedAssignments = this.acceptSelectedAssignments.bind(this);
    this.rejectSelectedAssignments = this.rejectSelectedAssignments.bind(this);
    this.selectAllTasks = this.selectAllTasks.bind(this);
    this.deselectAllTasks = this.deselectAllTasks.bind(this);
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.tasks !== this.props.tasks) {
      this.setState({
        selectedTasks: null
      });
    }
  }

  getEntitiesName(assignees) {
    const entities = this.props.entities;
    const matchingEntities = [];
    assignees.map((assignee) => {
      if (entities.hasOwnProperty(assignee)) {
        matchingEntities.push({
          id: assignee,
          name: entities[assignee]
        });
      } else {
        matchingEntities.push({
          id: assignee,
          name: 'Unknown'
        });
      }
    });
    const renderedEntitiesName = matchingEntities.map((entity, key) => {
      return (
        <div className={cx(styles.entity)} key={key}>
          <div className={cx(styles.entityImage)}>
            <img src={entity.image_path ? entity.image_path : '/images/user-default.svg'} alt={entity.name} style={{borderColor: (entity.color ? entity.color : '#348AF7')}} />
          </div>
          <div className={cx(styles.entityName)}>
            <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={key}>{entity.name}</Tooltip>}>
              <span>{entity.name}</span>
            </OverlayTrigger>
          </div>
        </div>);
    });
    return renderedEntitiesName;
  }

  handleTaskSelection(value) {
    let selectedTasks = { ...this.state.selectedTasks };
    if (selectedTasks !== null) {
      if (!(value in selectedTasks)) {
        selectedTasks = {
          ...this.state.selectedTasks,
          [value] : null
        };
      } else {
        delete selectedTasks[value];
      }
    } else {
      selectedTasks = {
        [value] : null
      };
    }
    this.setState({
      selectedTasks
    });
  }

  renderAssignments() {
    const assignments = this.props.tasks;
    if (assignments !== null && assignments.length > 0) {
      const renderedAssignments = assignments.map((task) => {
        const selectedTasks = { ...this.state.selectedTasks };
        let confirmationStatusColor = null;
        if (task.confirmation_status === 'ACCEPTED') {
          confirmationStatusColor = '#e8fef8';
        } else if (task.confirmation_status === 'REJECTED') {
          confirmationStatusColor = '#fff0f0';
        }
        let circle = <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15" className={styles.confirmationStatusIndicator}><circle cx="7.5" cy="7.5" r="7.5" transform="translate(0 0)" fill="#666666"></circle></svg>
        return (
          <div key={task.id} style={{ background: confirmationStatusColor }} className={cx(styles.flexRow, styles.item)}>
            <div className={cx(styles.flexColumn, styles.checkMrk)}>
              <Checkbox checked={selectedTasks !== null ? task.id in selectedTasks : false} onChange={(e) => this.handleTaskSelection(e.target.value) } value={task.id} className={styles.checkbox}><span /></Checkbox>
            </div>
            <div className={cx(styles.flexColumn, styles.title)}>
              <div className={styles.taskEssentials}>
                <div className={cx(styles.entityColor)} style={{ background : task.color ? task.color : '#0693e3' }} />
                <div>
                  <div className={cx(styles.taskTitle)}>{ task.title }</div>
                  <div className={cx(styles.customer_name)}>{ task.customer_name }</div>
                </div>
              </div>
            </div>
            <div className={cx(styles.flexColumn, styles.time)}>
              <time>{moment.utc(task.start_datetime).local().format('hh:mm A')} - {moment.utc(task.end_datetime).local().format('hh:mm A')}</time>
            </div>
            <div className={cx(styles.flexColumn, styles.address)}>
              {task.customer_address}
            </div>
            <div className={cx(styles.flexColumn, styles.assignees)}>
              {this.getEntitiesName(task.entity_ids)}
            </div>
            <div className={cx(styles.flexColumn, styles.instructions)}>
              {task.details !== null && task.details.length > 120 ? task.details.substr(0, 120) + '...' : task.details}
            </div>
            <div className={cx(styles.flexColumn, styles.status)}>
              {task.confirmation_status === 'ACCEPTED' ? <span className={styles.taskConfirmationStatusConfirmed}>{task.confirmation_status && circle}{task.confirmation_status}</span> : <span className={styles.taskConfirmationStatusRejected}>{task.confirmation_status && circle}{task.confirmation_status}</span>}
            </div>
          </div>
        );
      });
      return renderedAssignments;
    } else {
      return (<div className={styles.notFoundMessage}>No assignments found.</div>);
    }
  }

  renderActionButtons() {
    const selectedTasks = { ...this.state.selectedTasks };
    if (selectedTasks !== null && Object.keys(selectedTasks).length !== 0) {
      return (
        <div className={styles.actionsContainer}>
          <button onClick={() => this.acceptSelectedAssignments()} className={cx(styles.btn, styles['btn-secondary'])}>Accept Selected</button>
          <button onClick={() => this.rejectSelectedAssignments()} className={cx(styles.btn, styles['btn-light'], styles.delete)}>Reject Selected</button>
        </div>
      );
    } else {
      return (
        <div className={styles.actionsContainer}>
          <button disabled onClick={() => this.acceptSelectedAssignments()} className={cx(styles.btn, styles['btn-secondary'])}>Accept Selected</button>
          <button disabled onClick={() => this.rejectSelectedAssignments()} className={cx(styles.btn, styles['btn-light'], styles.delete)}>Reject Selected</button>
        </div>
      );
    }
  }

  selectAllTasks() {
    const tasks = [...this.props.tasks];
    let selectedTasks = {};
    tasks.map((task) => {
      selectedTasks = {
        ...selectedTasks,
        [task.id] : null
      };
    });
    this.setState({
      selectedTasks
    });
  }

  deselectAllTasks() {
    this.setState({
      selectedTasks: null
    });
  }

  acceptSelectedAssignments() {
    const selectedTasks = { ...this.state.selectedTasks };
    for (const key in selectedTasks) {
      selectedTasks[key] = 'ACCEPTED';
    }
    this.props.updateTasks(selectedTasks);
  }

  rejectSelectedAssignments() {
    const selectedTasks = { ...this.state.selectedTasks };
    for (const key in selectedTasks) {
      selectedTasks[key] = 'REJECTED';
    }
    this.props.updateTasks(selectedTasks);
  }

  render() {
    return (
      <div className={styles.flexTable}>
        {this.props.tasks && this.props.tasks.length > 0 &&
        <div>
          <div className={cx(styles.flexRow, styles.header)}>
            <div className={cx(styles.flexColumn, styles.checkMrk)}><img src="/images/task-list/check-box.svg" alt="Icon" className={styles.icon} /></div>
            <div className={cx(styles.flexColumn, styles.title)}><img src="/images/task-list/label.svg" alt="Icon" className={styles.icon} />Task Title & Customer</div>
            <div className={cx(styles.flexColumn, styles.time)}><img src="/images/task-list/clock.svg" alt="Icon" className={styles.icon} />Time</div>
            <div className={cx(styles.flexColumn, styles.address)}><img src="/images/task-list/pin.svg" alt="Icon" className={styles.icon} />Address</div>
            <div className={cx(styles.flexColumn, styles.assignees)}><img src="/images/task-list/user.svg" alt="Icon" className={styles.icon} />Assignee(s)</div>
            <div className={cx(styles.flexColumn, styles.instructions)}><img src="/images/task-list/chat_bubble.svg" alt="Icon" className={styles.icon} />Instructions</div>
            <div className={cx(styles.flexColumn, styles.status)}><img src="/images/task-list/circle.svg" alt="Icon" className={styles.icon} />Status</div>
          </div>
          <div className={styles.actionsContainer}>
            <button onClick={() => this.selectAllTasks()} className={cx(styles.btn, styles['btn-secondary'])}>Select all</button>
            <button onClick={() => this.deselectAllTasks()} className={cx(styles.btn, styles['btn-light'], styles.delete)}>Deselect all</button>
          </div>
        </div>
        }
        <div className={styles.inner}>
          {this.props.serverActionIsPending && <SavingSpinner title={"Updating"} borderStyle="none" />}
          {this.props.updateFiled && <Alert bsStyle="danger">Update failed. Please try again.</Alert>}
          {this.props.updateSuccessful && <Alert bsStyle="success">Update successful.</Alert>}
          {this.renderAssignments()}
        </div>
        {this.props.tasks !== null && this.props.tasks.length > 0 && this.renderActionButtons()}
      </div>
    );
  }
}

Assignments.proptTypes = {
  tasks: PropTypes.array,
  entities: PropTypes.array,
  updateTasks: PropTypes.func,
  serverActionIsPending: PropTypes.bool,
  updateFiled: PropTypes.bool
};
