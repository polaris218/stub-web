import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Grid, Button, Modal, Row, Col, ControlLabel, FormControl } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import styles from './tasks-manager-quick.module.scss';
import update from 'immutability-helper';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { TaskStatus, TaskWrapper } from '../index';
import { getStatusDetails } from '../../helpers/status_dict_lookup';
import { FieldGroup, CrewSelector } from '../fields';
import { generateSingleLineAddress, getErrorMessage } from '../../helpers/task';

import DropdownFilter from '../dropdown-filter/dropdown-filter';
import $ from 'jquery';

const errorMsg = (error) => {
  return getErrorMessage(error);
};


export default class TasksManagerQuick extends Component {
  constructor(props) {
    super(props);

    this.clearAllFilters = this.clearAllFilters.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.createNewTask = this.createNewTask.bind(this);
    this.getEmptyText = this.getEmptyText.bind(this);
    this.onTaskClick = this.onTaskClick.bind(this);
    this.renderEntityIds = this.renderEntityIds.bind(this);
    this.selectedTaskFilterChanged = this.selectedTaskFilterChanged.bind(this);
    this.entityFilterChanged = this.entityFilterChanged.bind(this);
    this.equipmentFilterChanged = this.equipmentFilterChanged.bind(this);
    this.taskAddedCallback = this.taskAddedCallback.bind(this);
    this.taskAssigneeUpdatedCallback = this.taskAssigneeUpdatedCallback.bind(this);
    this.taskEquipmentUpdatedCallback = this.taskEquipmentUpdatedCallback.bind(this);
    this.taskDeletedCallback = this.taskDeletedCallback.bind(this);
    this.taskStatusUpdateCallback = this.taskStatusUpdateCallback.bind(this);
    this.taskUpdatedCallback = this.taskUpdatedCallback.bind(this);
    this.fetchTasksList = this.fetchTasksList.bind(this);


    this.state = {
      showModal : false,
      loadingTasks: false,
      blockingLoadTasks: false,
      date: moment(),
      tasks: [],
      selectedTask: null,
      selectedTasksFilter: [],
      selectedEntitiesFilter: [],
      selectedEquipmentsFilter: []
    };
  }

  componentDidMount() {
    this.fetchTasksList(true);
  }  

  fetchTasksList(resetTimeout, blockingUpdate = false) {
    if (this.timeoutID && resetTimeout) {
      clearTimeout(this.timeoutID);
    }

    this.setState({
      loadingTasks:true,
      blockingLoadTasks: blockingUpdate
    });

    setTimeout(() => {
      const startDate = moment(this.state.date).startOf('day');
      const endDate = moment(this.state.date).endOf('day');
      this.props.getTasks({ viewType:null, startDate, endDate }).then((tasks) => {
        const parsedTasks = JSON.parse(tasks);
        this.setState({
          tasks: parsedTasks,
          loadingTasks: false,
          blockingLoadTasks: false
        });
        this.timeoutID = setTimeout(() => {
          this.fetchTasksList(true);
        }, 3e4);
      });
    }, 200);
  }

  onTaskClick(task) { 
    this.setState({
      selectedTask: task,
      showModal: true
    });
  }

  clearAllFilters(e) {
    e.preventDefault();
    const eObj = { 
      target: { name: 'deselect-all' },
      stopPropagation: () => {},
      preventDefault: () => {}
    }
    this.equipmentFilterInstance.handleClick(eObj);
    this.entityFilterInstance.handleClick(eObj);
    this.statusFilterInstance.handleClick(eObj);
  }

  closeModal() {
    this.setState({
      showModal: false
    }, this.fetchTasksList(true));
  }

  entityFilterChanged(selectedEntities) {
    this.setState({ selectedEntitiesFilter: selectedEntities.map(item => item.id) });
  }

  equipmentFilterChanged(selectedEquipments) {
    this.setState({ selectedEquipmentsFilter: selectedEquipments.map(item => item.id) });
  }

  selectedTaskFilterChanged(selectedStatuses) {
    this.setState({
      selectedTasksFilter: selectedStatuses.map(item => item.id)
    });
  }

  taskStatusUpdateCallback(id, status) {
    if (status.type !== 'CUSTOM') {
      const { tasks } = this.state;
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id === id) {
          tasks[i].status = status.type;
          this.forceUpdate();
          return;
        }
      }
    }
  }

  getTaskIndexInEventsList(task) {
    return this.getTaskIndexInEventsListUsingId(task.id);
  }

  getTaskIndexInEventsListUsingId(task_id) {
    let index = -1;

    for (let i = 0; i < this.state.tasks.length; i++) {
      if (this.state.tasks[i].id === task_id) {
        index = i;
      }
    }

    return index;
  }

  conformTaskToServerReturnedStructure(task) {
    if ($.type(task.entity_ids) === "string") {
      const array = task.entity_ids.split(',');
      const int_array = [];
      for (let i = 0; i < array.length; i++) {
        if(array[i] !== "") {
          int_array.push(parseInt(array[i], 10));
        }
      }

      task.entity_ids = int_array;
    }

    if ($.type(task.resource_ids) === "string") {
      const array = task.resource_ids.split(',');
      const int_array = [];
      for (let i = 0; i < array.length; i++) {
        if(array[i] !== "") {
          int_array.push(parseInt(array[i], 10));
        }
      }

      task.resource_ids = int_array;
    }

    if ($.type(task.document_ids) === "string") {
      const array = task.document_ids.split(',');
      const int_array = [];
      for (let i = 0; i < array.length; i++) {
        if (array[i] !== "") {
          int_array.push(parseInt(array[i], 10));
        }
      }
      task.document_ids = int_array;
    }

    if ($.type(task.extra_fields) === "string") {
      const extra_fields = JSON.parse(task.extra_fields);
      task.extra_fields = extra_fields;
    }

    if ($.type(task.notifications) === "string") {
      const notifications = JSON.parse(task.notifications);
      task.notifications = notifications;
    }

    if ($.type(task.template_extra_fields) === 'string') {
      const template_extra_fields = JSON.parse(task.template_extra_fields);
      task.template_extra_fields = template_extra_fields;
    }

    if ($.type(task.customer_exact_location) === "string") {
      const customer_exact_location = JSON.parse(task.customer_exact_location);
      task.customer_exact_location = customer_exact_location;
    }

    task.customer_address = generateSingleLineAddress(task);

    return task;
  }

  taskUpdatedCallback(task) {
    const index = this.getTaskIndexInEventsList(task);
    if (index === -1) {
      console.log('updated task is not found in list of events. This could be an error or the task is deleted from server.');
    }

    if (task.series_settings) {
      this.fetchTasksList(true, true);
    } else {
      this.setState({
        tasks: index !== -1 ? update(this.state.tasks, {
          [index]: { $set: this.conformTaskToServerReturnedStructure(task) }
        }) : this.state.tasks
      });
    }

    this.closeModal();
  }

  taskAddedCallback(task) {
    if (task.series_settings) {
      this.fetchTasksList(true, true);
    } else {
      const task_date = moment(task.start_datetime);
      if (this.state.date.isSame(task_date, 'd')) {

        this.setState({
          tasks: update(this.state.tasks, { $push: [this.conformTaskToServerReturnedStructure(task)] }),
          showModal: false
        });
      }
    }

    this.closeModal();
  }

  taskDeletedCallback(task_id, series_deleted) {
    const index = this.getTaskIndexInEventsListUsingId(task_id);
    if (index === -1) {
      console.log('deleted task is not found in list of events. This could be an error or the task is deleted from server.');
    }

    if (series_deleted) {
      this.fetchTasksList(true, true);
    } else {
      this.setState({
        tasks: index !== -1 ? update(this.state.tasks, {
          $splice: [[index, 1]]
        }) : this.state.tasks
      });
    }

    this.closeModal();
  }

  taskAssigneeUpdatedCallback(entity_ids, task_id) {
    const index = this.getTaskIndexInEventsListUsingId(task_id);
    if (index === -1) {
      console.log('updated task is not found in list of events. This could be an error or the task is deleted from server.');
    }

    this.setState({
      tasks: index !== -1 ? update(this.state.tasks, {
        [index]: { entity_ids: {$set: entity_ids } }
      }) : this.state.tasks,
      selectedTask: update(this.state.selectedTask, {
        entity_ids: {$set: entity_ids}
      })
    });
  }

  taskEquipmentUpdatedCallback(resource_ids, task_id) {
    const index = this.getTaskIndexInEventsListUsingId(task_id);
    if (index === -1) {
      console.log('updated task is not found in list of events. This could be an error or the task is deleted from server.');
    }

    this.setState({
      tasks: index !== -1 ? update(this.state.tasks, {
        [index]: { resource_ids: {$set: resource_ids } }
      }) : this.state.tasks,
      selectedTask: update(this.state.selectedTask, {
        resource_ids: {$set: resource_ids}
      })
    });
  }

  createNewTask() {
    this.setState({
      showModal: true,
      selectedTask: null
    });
  }


  getEntity(entityId) {
    return this.props.entities.find((entity) => {
      return entityId === entity.id;
    });
  }

  getEmptyText() {

    let emptyText;
    if (!this.state.selectedTasksFilter.indexOf('All') >= 0 || 
        this.state.selectedEntitiesFilter.length > 0 ||
        this.state.selectedEquipmentsFilter.length > 0) {
      emptyText = "No tasks matching the criteria";
    } else {
      emptyText = "No tasks scheduled for today.";
    }

    return (<div className={styles['no-entity']}>
      {emptyText}
    </div>);
  }

  renderEntityIds(entity_ids, task_id) {
    if (!this.props.entities) {
      return null;
    }

    let entityList = null;
    if (entity_ids && entity_ids.length > 0) {
      entityList = entity_ids.map((entity_id, i) => {
        const entityObject = this.getEntity(entity_id);
        if (entityObject && entityObject.name) {
          return <li key={'task-' + task_id + '-entity-' + i}>{entityObject.name}</li>;
        }
        return <li key={'task-' + task_id + '-entity-' + i}>Unknown</li>;
      });
    } else {
      entityList = <li>*Unassigned</li>;
    }
    return <ul className={styles['entity-list'] + ' list-inline'} style={{marginBottom:'0px'}}>{entityList}</ul>;
  }

  render() {
    const statuses = this.props.statuses
      .map((status, i) => ({
        ...status,
        id: status.type,
        name: getStatusDetails(status.type).label
      })).concat([{ id: 'All', name: 'All' }, { id: 'NOTSTARTED', name: getStatusDetails('NOTSTARTED').label }]);

    let filteredTasks = [];
    if (this.state.selectedTasksFilter.length === 0 ||
        this.state.selectedTasksFilter.indexOf('All') >= 0) {
      filteredTasks = this.state.tasks;
    } else {
        filteredTasks = this.state.tasks
          .filter(task =>
            this.state.selectedTasksFilter.some(taskFilter => taskFilter === task.status)
          );
    }

    if (this.state.selectedEquipmentsFilter.length > 0 ||
        this.state.selectedEntitiesFilter.length > 0) {
      filteredTasks = filteredTasks
        .filter(task =>
          task.resource_ids.some(id => this.state.selectedEquipmentsFilter.indexOf(id) >= 0) ||
          this.state.selectedEntitiesFilter.length > 0 &&
          task.entity_ids.some(id => this.state.selectedEntitiesFilter.indexOf(id) >= 0) ||
          (task.entity_ids.length === 0 && this.state.selectedEntitiesFilter.indexOf(-1) >= 0));
    }

    return (
    <div className={styles['tasks-manager-quick']}>
      <Grid>
        <div>
          <h2>Today's Tasks - {this.state.date.format('dddd MMMM Do')}
            <div className="pull-right" style={{fontWeight: 200}}>
              {this.state.loadingTasks &&
                <SavingSpinner title="Loading" borderStyle="none" size={8} />
              }
            </div>
          </h2>
        </div>
        <Row>
          <Col xs={12} sm={1} className="filters-title-max-width-cap">
            <ControlLabel style={{ marginTop: '8px' }}>
              Filters:
            </ControlLabel>
          </Col>
          <Col xs={12} sm={2} className="filters-max-width-cap">
            <DropdownFilter
              name='statusFilter'
              ref={instance => { this.statusFilterInstance = instance; }}
              data={statuses}
              handleChange={this.selectedTaskFilterChanged}
              title="Status"
              minWidth="120px" />
          </Col>
          <Col xs={12} sm={2} className="filters-max-width-cap">
            <DropdownFilter
              name="equipmentFilter"
              ref={instance => { this.equipmentFilterInstance = instance; }}
              data={this.props.equipments}
              handleChange={this.equipmentFilterChanged}
              title="Equipment"
              minWidth="120px" />
          </Col>
          <Col xs={12} sm={2} className="filters-max-width-cap">
            <DropdownFilter
              name="entityFilter"
              ref={instance => { this.entityFilterInstance = instance; }}
              data={this.props.entities}
              handleChange={this.entityFilterChanged}
              title="Team"
              minWidth="120px"
              extraItem={{ id: -1, name: 'Unassigned' }} />
          </Col>
          <Col
            xs={12}
            sm={1}
            style={{ marginTop: '8px', paddingRight: 0, whiteSpace: 'nowrap' }}
            className={styles['clear-all']}
          >
            <a onClick={this.clearAllFilters} href="#">Clear All</a>
          </Col>
          <div style={{textAlign: 'right', marginTop:'5px', marginRight: '10px'}}>
            <Button id="create-new-task-button" className="btn-submit" onClick={this.createNewTask}>
                      Create New Task
            </Button>
          </div>
        </Row>

        { this.state.blockingLoadTasks && <div className={styles.blockingPlaceHolder}><SavingSpinner title="" borderStyle="none" size={16} /></div> }

        { !this.state.blockingLoadTasks && <div className={styles.taskContainer}>
          {
            filteredTasks.length === 0 ? this.getEmptyText() : null
          }
          {
            filteredTasks.map((task, i) => {
              const status_style = {
                backgroundColor: getStatusDetails(task.status).color,
                borderColor: getStatusDetails(task.status).color
              };

              return (
                <div key={'task-comp-' + i} className={styles.taskItem} onClick={() => this.onTaskClick(task)}>
                    <h4>{task.title}{task.series_id ? <span> ↺</span> : ''}</h4>
                    <div>
                      <Row>
                        <Col xs={6} sm={6}>
                          <p>{task.customer_first_name} {task.customer_last_name}</p>
                          <p>{task.customer_address}</p>
                          <p>{task.customer_phone}</p>
                        </Col>
                        <Col xs={6} sm={6} style={{ textAlign: 'right' }}>
                          <p><span className={styles.statusBadge} style={status_style}>{getStatusDetails(task.status).label}</span></p>
                          <p>{moment.utc(task.start_datetime).local().format('h:mm a')}</p>
                        </Col>
                      </Row>
                    </div>
                    <div className={styles.detailGrid}>
                      <p className={styles.detailsData}>{task.details}</p>
                    </div>
                    { this.renderEntityIds(task.entity_ids, task.id) }
                </div>
              );
            })
          }
          </div>
       }

        <Modal show={this.state.showModal} onHide={this.closeModal} bsSize="large">
          <Modal.Header closeButton>
            <Modal.Title>{ this.state.selectedTask ? this.state.selectedTask.title : 'New Task' }</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <TaskWrapper
              selectedTask={this.state.selectedTask}

              company_id={this.props.company_id}
              company_url={this.props.company_url}
              reporter_name={this.props.reporter_name}
              reporter_id={this.props.reporter_id}
              getTaskStatus={this.props.getStatus}
              getTaskRatings={this.props.getRatings}
              updateTaskStatus={this.props.setNewStatus}
              getEstimate={this.props.getEstimate}
              getSchedule={this.props.getSchedule}

              statuses={this.props.statuses}
              entities={this.props.entities}
              equipments={this.props.equipments}

              getCustomers={this.props.getCustomers}
              searchCustomers={this.props.searchCustomers}
              createCustomer={this.props.createCustomer}
              extraFieldsOptions={this.props.extraFieldsOptions}

              taskUpdatedCallback={this.taskUpdatedCallback}
              taskAddedCallback={this.taskAddedCallback}
              taskDeletedCallback={this.taskDeletedCallback}
              taskAssigneeUpdatedCallback={this.taskAssigneeUpdatedCallback}
              taskEquipmentUpdatedCallback={this.taskEquipmentUpdatedCallback}
              taskStatusUpdateCallback={this.taskStatusUpdateCallback}

              onCloseTask={this.closeModal}

              updateTask={this.props.updateTask}
              deleteTask={this.props.deleteTask}
              postTask={this.props.postTask}
              getTaskSeriesSettings={this.props.getTaskSeriesSettings}
              taskSendNotification={this.props.taskSendNotification}
              profile={this.props.profile}
            />
          </Modal.Body>
        </Modal>

      </Grid>
    </div>);
  }
}

TasksManagerQuick.propTypes = {
  company_id: PropTypes.number.isRequired,
  company_url: PropTypes.string.isRequired,
  createCustomer: PropTypes.func,
  deleteTask: PropTypes.func,
  entities: PropTypes.arrayOf(PropTypes.object),
  equipments: PropTypes.arrayOf(PropTypes.object),
  extraFieldsOptions: PropTypes.array,
  getCustomers: PropTypes.func,
  searchCustomers: PropTypes.func,
  getEstimate: PropTypes.func.isRequired,
  getRatings: PropTypes.func.isRequired,
  getSchedule: PropTypes.func.isRequired,
  getStatus: PropTypes.func.isRequired,
  getTasks: PropTypes.func.isRequired,
  postTask: PropTypes.func,
  reporter_id: PropTypes.number.isRequired,
  reporter_name: PropTypes.string.isRequired,
  setNewStatus: PropTypes.func.isRequired,
  statuses: PropTypes.array.isRequired,
  updateTask: PropTypes.func.isRequired,
  taskSendNotification: PropTypes.func
};
