import React, {Component} from 'react';
import styles from './task-manager-quick-v4.module.scss';
import TopBar from './components/top-bar/top-bar';
import {
  Grid,
  Modal,
  Row,
  Col,
} from 'react-bootstrap';
import {findDOMNode} from 'react-dom';
import moment from 'moment';
import update from 'immutability-helper';
import SavingSpinner from '../saving-spinner/saving-spinner';
import {LocationMapV2, TaskWrapperV2} from '../../components';
import {generateSingleLineAddress, getErrorMessage} from '../../helpers/task';
import {getEntities, getTemplates} from '../../actions';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {
  faChevronLeft,
  faChevronRight
} from '@fortawesome/fontawesome-free-solid';
import cx from 'classnames';
import {parseQueryParams} from '../../helpers';
import ErrorAlert from '../error-alert/error-alert';
import TaskCard from './components/task-card/task-card';
import ActivityCard from './components/activity-card/activity-card'
import $ from 'jquery';

const errorMsg = (error) => {
  return getErrorMessage(error);
};

window.map = true;

export default class TaskManagerQuickV4 extends Component {
  constructor(props) {
    super(props);

    this.clearAllFilters = this.clearAllFilters.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.createNewTask = this.createNewTask.bind(this);
    this.getEmptyText = this.getEmptyText.bind(this);
    this.onTaskClick = this.onTaskClick.bind(this);
    this.selectedTaskFilterChanged = this.selectedTaskFilterChanged.bind(this);
    this.entityFilterChanged = this.entityFilterChanged.bind(this);
    this.equipmentFilterChanged = this.equipmentFilterChanged.bind(this);
    this.templateFilterChanged = this.templateFilterChanged.bind(this);
    this.taskAddedCallback = this.taskAddedCallback.bind(this);
    this.taskAssigneeUpdatedCallback = this.taskAssigneeUpdatedCallback.bind(this);
    this.taskEquipmentUpdatedCallback = this.taskEquipmentUpdatedCallback.bind(this);
    this.taskDeletedCallback = this.taskDeletedCallback.bind(this);
    this.taskStatusUpdateCallback = this.taskStatusUpdateCallback.bind(this);
    this.taskUpdatedCallback = this.taskUpdatedCallback.bind(this);
    this.fetchTasksAndEntitiesList = this.fetchTasksAndEntitiesList.bind(this);

    this.isAnyFilterEnabled = this.isAnyFilterEnabled.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.moveDate = this.moveDate.bind(this);
    this.showDatePicker = this.showDatePicker.bind(this);
    this.getEntity = this.getEntity.bind(this);
    this.handleMapVisibility = this.handleMapVisibility.bind(this);
    this.handleTaskTypeChange = this.handleTaskTypeChange.bind(this);
    this.startAsyncUpdate = this.startAsyncUpdate.bind(this);
    this.visibilityChanged = this.visibilityChanged.bind(this);
    this.clearAsyncUpdate = this.clearAsyncUpdate.bind(this);
    this.getUniqueStatusesFromTemplates = this.getUniqueStatusesFromTemplates.bind(this);
    this.paginationPrevClicked = this.paginationPrevClicked.bind(this);
    this.paginationNextClicked = this.paginationNextClicked.bind(this);
    this.groupsFilterChanged = this.groupsFilterChanged.bind(this);
    this.collapseFilter = this.collapseFilter.bind(this);
    this.getAjaxCall = this.getAjaxCall.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
    this.createNewRecurringTask = this.createNewRecurringTask.bind(this);

    this.state = {
      showModal: false,
      loadingTasks: true,
      date: this.initializeDate(),
      tasks: [],
      entities: [],
      filteredEntiyList: [],
      selectedTask: null,
      selectedTasksFilter: [],
      selectedEntitiesFilter: [],
      selectedEquipmentsFilter: [],
      selectedTemplatesFilter: [],
      selectedGroupsFilter: [],
      newEventIsRecurring: false,
      templates: [],
      statuses: this.props.statuses,
      defaultTemplate: null,
      filterStatuses: [],
      timer: null,
      page: 1,
      items_per_page: 100,
      internetIssue: undefined,
      showFilters: false,
      applyFilters: false,
      filter_entity_ids: [],
      filter_resource_ids: [],
      filter_group_ids: [],
      filter_statuses: [],
      filter_templates: [],
      showSpinner: false,
    };
  }

  componentDidMount() {
    this.setTimer = true;
    document.addEventListener('visibilitychange', this.visibilityChanged);
    const promises = [];
    promises.push(
      getTemplates().then((templates) => {
        const parsedTemplate = JSON.parse(templates);
        let defaultTemplate = null;
        parsedTemplate.map((template) => {
          if (template.is_default) {
            defaultTemplate = template;
          }
        });
        this.setState({
          templates: parsedTemplate,
          defaultTemplate,
          loadingTasks: false,
          blockingLoadTasks: false,
          filterStatuses: this.getUniqueStatusesFromTemplates(parsedTemplate),
        }, () => {
          this.fetchTasksAndEntitiesList(true);
        });
      }).catch((err) => {
        if (err.status === 400) {
          this.fetchTasksAndEntitiesList(true);
        }
      })
    );

    Promise.all(promises).then(() => {
      this.setState({
        loadingTask: false,
        blockingLoadTasks: false,
      }, () => {
        return null;
      });
    });

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.date !== null && typeof nextProps.date !== 'undefined') {
      this.setState({
        date: nextProps.date
      });
    }
  }

  componentWillUnmount() {
    this.setTimer = false;
    this.clearAsyncUpdate();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
  }

  paginationPrevClicked() {
    this.setState({
      loadingTasks: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum - 1;
    if (localPageNum > 1) {
      this.setState({
          page: newPage,
        },
        () => this.fetchTasksAndEntitiesList());
    } else {
      this.setState({
          page: 1,
        },
        () => this.fetchTasksAndEntitiesList());
    }
  }

  paginationNextClicked() {
    this.setState({
      loadingTasks: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum + 1;
    this.setState({
        page: newPage,
      },
      () => this.fetchTasksAndEntitiesList());
  }

  clearAsyncUpdate() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
  }

  visibilityChanged() {
    if (document.hidden) {
      this.clearAsyncUpdate();
    } else {
      this.clearAsyncUpdate();
      this.startAsyncUpdate();
    }
  }

  startAsyncUpdate() {
    this.fetchTasksAndEntitiesList();
  }

  initializeDate() {
    const query = parseQueryParams(this.props.location.search);
    if (query.date) {
      const dateObject = moment(query.date);
      if (dateObject.isValid()) {
        return dateObject.toISOString();
      } else {
        return moment().toISOString();
      }
    } else if (this.props.date !== null) {
      return this.props.date;
    } else {
      return moment().toISOString();
    }
  }


  isAnyFilterEnabled() {
    return (
      this.state.selectedTasksFilter.length > 0 ||
      this.state.selectedEntitiesFilter.length > 0 ||
      this.state.selectedEquipmentsFilter.length > 0);
  }

  handleTaskTypeChange(template_id) {
    if (template_id !== 'DEFAULT' && template_id !== null) {
      let selectedTemplate = null;
      const templates = [...this.state.templates];
      templates.map((template) => {
        const updatedTemplate = template_id;
        if (updatedTemplate === template.id) {
          selectedTemplate = template;
        }
      });
      if (selectedTemplate !== null) {
        this.setState((state) => {
          return {
            ...state,
            selectedTask: {
              ...state.selectedTask,
              template: template_id
            },
            statuses: selectedTemplate.status_data
          };
        });
      } else {
        const event = this.state.selectedTask;
        let statuses = this.props.statuses;
        if (event && event.template_type && event.template_type.toUpperCase() === 'ACTIVITY') {
          statuses = [{
            title: 'COMPLETE',
            type: 'COMPLETE',
            color: '#5fe23f',
            type_id: 1004,
          }];
        } else if (this.props.profile && this.props.profile.statuses) {
          statuses = this.props.profile.statuses
        }
        this.setState({
          statuses
        });
      }
    } else {
      const event = this.state.selectedTask;
      let statuses = this.props.statuses;
      if (event && event.template_type && event.template_type.toUpperCase() === 'ACTIVITY') {
        statuses = [{
          title: 'COMPLETE',
          type: 'COMPLETE',
          color: '#5fe23f',
          type_id: 1004,
        }];
      } else if (this.props.profile && this.props.profile.statuses) {
        statuses = this.props.profile.statuses
      }
      this.setState((state) => {
        return {
          ...state,
          selectedTask: {
            ...state.selectedTask,
            template: template_id
          },
          statuses
        };
      });
    }
  }

  getUniqueStatusesFromTemplates(templates) {
    const statuses = [];
    templates.map((statusArray) => {
      statusArray.status_data.map((status) => {
        if (statuses.map((e) => {
          return e.title;
        }).indexOf(status.title) === -1) {
          statuses.push(status);
        }
      });
    });
    return statuses;
  }

  renderTasksToShowOnMap(entities, tasks) {
    let filteredEntiyList = [];
    if (entities.length + tasks.length === 0) {
      return <div></div>;
    }

    const filteredData = [];
    let location = null;
    let name = null;
    let address = null;

    for (let i = 0; i < tasks.length; i++) {
      if (tasks[i].entity_ids) {
        filteredEntiyList.push(tasks[i].entity_ids);
      }
      // Fall back for the old tasks which don't have any valid value for 'current_destination'
      if (tasks[i].current_destination && tasks[i].current_destination.exact_location && tasks[i].current_destination.exact_location.lat) {
        location = tasks[i].current_destination.exact_location;
        name = tasks[i].current_destination.title;
        address = tasks[i].current_destination.complete_address;
      } else if (tasks[i].customer_exact_location && tasks[i].customer_exact_location.lat) {
        location = tasks[i].customer_exact_location;
        name = tasks[i].customer_name;
        address = tasks[i].customer_address;
      }
      if (location) {
        filteredData.push({
          location: location,
          name: name,
          id: tasks[i].id,
          time: tasks[i].start_datetime,
          address: address,
          color: tasks[i].extra_fields && tasks[i].extra_fields.task_color ? tasks[i].extra_fields.task_color : '#0693e3',
          type: 'customer'
        });
      }
    }

    //Concat filtered entities
    filteredEntiyList = [].concat.apply([], filteredEntiyList);
    filteredEntiyList = filteredEntiyList.filter((value, index, array) => {
      return array.indexOf(value) === index
    });

    // The entities extracted from tasks are less than the ones in selected team filter
    if (filteredEntiyList.length != this.state.selectedEntitiesFilter.length) {
      this.state.selectedEntitiesFilter.map(id => {
        if (filteredEntiyList.indexOf(id) < 0) {
          filteredEntiyList.push(id);
        }
      });
    }

    // if (!this.isAnyFilterEnabled()) {
    //   this.state.entities.map(obj => {
    //     if (filteredEntiyList.indexOf(obj.id) < 0) {
    //       filteredEntiyList.push(obj.id);
    //     }
    //   });
    // }

    for (let i = 0; i < filteredEntiyList.length; i++) {
      const filtered_entity = this.getEntity(entities, filteredEntiyList[i]);
      if (filtered_entity && filtered_entity.lastreading) {
        filteredData.push({
          location: filtered_entity.lastreading,
          name: filtered_entity.name,
          id: filtered_entity.id,
          time: filtered_entity.lastreading.time,
          image_path: filtered_entity.image_path
        });
      }
    }

    const showDirections = false;
    const heightForMap = this.props.headerHeight ? this.props.headerHeight : 56;
    const mapHeight = 'calc(100vh - 55px - ' + heightForMap + 'px';

    return (
      <div className={styles.locationMapMask}>
        <LocationMapV2
          height={mapHeight}
          entities={filteredData}
          showDirections={showDirections}
          showLocation
          highlightedTaskId={null}
          onTaskMouseOver={(task_id) => {
            return false;
          }}
          onTaskMouseOut={() => {
            return false;
          }}
        />
      </div>
    );
  }

  getAjaxCall(call) {
    this.callInProgress = call;
  }

  applyFilters(applyFilters, e) {
    e && e.preventDefault();
    e && e.stopPropagation();
    const filter_entity_ids = this.state.selectedEntitiesFilter;
    const filter_resource_ids = this.state.selectedEquipmentsFilter;
    const filter_group_ids = this.state.selectedGroupsFilter;
    const filter_statuses = this.state.selectedTasksFilter;
    const filter_templates = this.state.selectedTemplatesFilter;
    this.setState({
      filter_entity_ids,
      filter_resource_ids,
      filter_group_ids,
      filter_statuses,
      applyFilters,
      filter_templates
    }, () => this.fetchTasksAndEntitiesList(false, false, null, true));
  }

  fetchTasksAndEntitiesList(resetTimeout, blockingUpdate = false, postProcess = null, getTasksOnly = false) {
    if (this.state.timer && resetTimeout && !getTasksOnly) {
      clearTimeout(this.state.timer);
    }

    const resource_ids = (this.state.applyFilters && this.state.filter_resource_ids) ? this.state.filter_resource_ids.join(',') : '';
    const entity_ids = (this.state.applyFilters && this.state.filter_entity_ids) ? this.state.filter_entity_ids.join(',') : '';
    const group_ids = (this.state.applyFilters && this.state.filter_group_ids) ? this.state.filter_group_ids.join(',') : '';
    const statuses = (this.state.applyFilters && this.state.filter_statuses) ? this.state.filter_statuses.join(',') : '';
    const templates = (this.state.applyFilters && this.state.filter_templates) ? this.state.filter_templates.join(',') : '';

    if (this.callInProgress && this.callInProgress.state() === 'pending') {
      this.callInProgress.abort();
    }

    if (!this.state.showModal) {
      this.setState({
        loadingTasks: true,
        blockingLoadTasks: blockingUpdate,
        showSpinner: true,
      });

      setTimeout(() => {
        const startDate = moment(this.state.date).startOf('day');
        const endDate = moment(this.state.date).endOf('day');
        const items_per_page = this.state.items_per_page;
        const page = this.state.page;


        if (!getTasksOnly) {
          getEntities().then((entities) => {
            const parsedEntities = JSON.parse(entities);
            this.setState({
              entities: parsedEntities,
              internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
            })
          });
        }
        if (this.props.getExternalIntegrations) {
          this.props.getExternalIntegrations()
        }

        this.props.getTasks({
          viewType: null,
          startDate,
          endDate,
          items_per_page,
          page,
          getAjaxCall: this.getAjaxCall,
          group_ids,
          entity_ids,
          resource_ids,
          statuses,
          templates
        })
          .then((tasks) => {
            const parsedTasks = JSON.parse(tasks);
            this.setState({
              tasks: parsedTasks,
              loadingTasks: false,
              blockingLoadTasks: false,
              showSpinner: false,
            }, () => {
              return postProcess ? postProcess() : null;
            });
            const timer = !getTasksOnly && setTimeout(() => {
              this.fetchTasksAndEntitiesList();
            }, 3e4);
            if (!getTasksOnly) {
              if (this.setTimer && !document.hidden) {
                this.setState({
                  timer,
                  internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
                });
              } else {
                clearTimeout(timer);
              }
            }
          }).catch((err) => {
          console.log(err);
          if (err.status === 0 && err.statusText === 'error') {
            this.setState({
              internetIssue: true,
              loadingTasks: false,
              blockingLoadTasks: false,
              showSpinner: false,
            });
          }
        });
      }, 200);
    }
  }

  onTaskClick(task) {
    if (this.props.groups && !this.props.groups.find((group) => {
      return group.id === task.group_id;
    })) {
      task.group_id = null;
    }
    let entities = this.state.entities;
    if (task.entities_data) {
      entities.push.apply(entities, task.entities_data);
      entities = entities.filter((value, index) => {
        return entities.map((entity) => {
          return entity.id;
        }).indexOf(value.id) === index;
      });
    }
    this.setState({
      selectedTask: task,
      showModal: true,
      entities
    });
    if (task.template) {
      this.handleTaskTypeChange(task.template);
    } else {
      let statuses = this.props.statuses;
      if (task && task.template_type && task.template_type.toUpperCase() === 'ACTIVITY') {
        statuses = [{
          title: 'COMPLETE',
          type: 'COMPLETE',
          color: '#5fe23f',
          type_id: 1004,
        }];
      } else if (this.props.profile && this.props.profile.statuses) {
        statuses = this.props.profile.statuses
      }
      this.setState({
        statuses
      });
    }
  }

  getEntity(entities, entityId) {
    return entities.find((entity) => {
      return entityId === entity.id;
    });
  }

  handleMapVisibility() {
    if (!window.map) {
      window.map = true;
      this.forceUpdate();
    } else {
      window.map = false;
      this.forceUpdate();
    }
  }

  clearAllFilters(e) {
    e.preventDefault();
    const eObj = {
      target: {name: 'deselect-all'},
      stopPropagation: () => {
      },
      preventDefault: () => {
      }
    }
    if (typeof this.equipmentFilterInstance !== 'undefined' && this.equipmentFilterInstance !== null) {
      this.equipmentFilterInstance.handleClick(eObj);
    }
    if (typeof this.entityFilterInstance !== 'undefined' && this.entityFilterInstance !== null) {
      this.entityFilterInstance.handleClick(eObj);
    }
    if (typeof this.statusFilterInstance !== 'undefined' && this.statusFilterInstance !== null) {
      this.statusFilterInstance.handleClick(eObj);
    }
    if (typeof this.groupsFilter !== 'undefined' && this.groupsFilter !== null) {
      this.groupsFilter.handleClick(eObj);
    }
  }

  closeModal() {
    this.setState({
      showModal: false,
      creatingActivity: false,
      newEventIsRecurring: false,
    }, () => this.fetchTasksAndEntitiesList(true));
  }

  entityFilterChanged(selectedEntities) {
    let filter_entity_ids = this.state.filter_entity_ids;
    if (selectedEntities.length === 0) {
      filter_entity_ids = [];
      this.setState({selectedEntitiesFilter: selectedEntities.map(item => item.id), filter_entity_ids}, () => {
        this.applyFilters(true);
      });
    } else {
      this.setState({selectedEntitiesFilter: selectedEntities.map(item => item.id)});
    }
  }

  templateFilterChanged(selectedTemplates) {
    let filter_templates = this.state.filter_templates;
    if (selectedTemplates.length === 0) {
      filter_templates = [];
      this.setState({selectedTemplatesFilter: selectedTemplates.map(item => item.id), filter_templates}, () => {
        this.applyFilters(true);
      });
    } else {
      this.setState({selectedTemplatesFilter: selectedTemplates.map(item => item.id)});
    }
  }

  equipmentFilterChanged(selectedEquipments) {
    let filter_resource_ids = this.state.filter_resource_ids;
    if (selectedEquipments.length === 0) {
      filter_resource_ids = [];
      this.setState({selectedEquipmentsFilter: selectedEquipments.map(item => item.id), filter_resource_ids}, () => {
        this.applyFilters(true);
      });
    } else {
      this.setState({selectedEquipmentsFilter: selectedEquipments.map(item => item.id)});
    }
  }

  selectedTaskFilterChanged(selectedStatuses) {
    let filter_statuses = this.state.filter_statuses;
    if (selectedStatuses.length === 0) {
      filter_statuses = [];
      this.setState({
        selectedTasksFilter: selectedStatuses.map(item => item.title ? item.title : item.id), filter_statuses
      }, () => {
        this.applyFilters(true);
      });
    } else {
      this.setState({
        selectedTasksFilter: selectedStatuses.map(item => item.title ? item.title : item.id),
      });
    }
  }

  groupsFilterChanged(selectedGroups) {
    let filter_group_ids = this.state.filter_group_ids;
    if (selectedGroups.length === 0) {
      filter_group_ids = []
      this.setState({
        selectedGroupsFilter: selectedGroups.map(group => group.id),
        filter_group_ids
      }, () => {
        this.applyFilters(true);
      });
    } else {
      this.setState({
        selectedGroupsFilter: selectedGroups.map(group => group.id),
      });
    }
  }

  moveDate(e, direction) {
    let currentDate = new Date(this.state.date),
      dateValue;
    if (direction == 'left') {
      dateValue = currentDate.getDate() - 1;
    } else if (direction == 'right') {
      dateValue = currentDate.getDate() + 1;
    }
    currentDate.setDate(dateValue);
    this.setState({
      tasks: []
    });
    this.props.onDateChanged(currentDate.toISOString());
    this.fetchTasksAndEntitiesList(true, true);
  }

  onChangeDate(value) {
    this.setState({
      tasks: []
    });
    this.props.onDateChanged(value);
    this.fetchTasksAndEntitiesList(true, true);
  }

  showDatePicker() {
    findDOMNode(this.refs.dateInput).getElementsByTagName('input')[1].focus();
  }

  taskStatusUpdateCallback(id, status) {
    if (status.type !== 'CUSTOM') {
      const {tasks} = this.state;
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
    if ($.type(task.entity_ids) === 'string') {
      const array = task.entity_ids.split(',');
      const int_array = [];
      for (let i = 0; i < array.length; i++) {
        if (array[i] !== '') {
          int_array.push(parseInt(array[i], 10));
        }
      }

      task.entity_ids = int_array;
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

    if ($.type(task.resource_ids) === 'string') {
      const array = task.resource_ids.split(',');
      const int_array = [];
      for (let i = 0; i < array.length; i++) {
        if (array[i] !== '') {
          int_array.push(parseInt(array[i], 10));
        }
      }

      task.resource_ids = int_array;
    }

    if ($.type(task.extra_fields) === 'string') {
      const extra_fields = JSON.parse(task.extra_fields);
      task.extra_fields = extra_fields;
    }

    if ($.type(task.template_extra_fields) === 'string') {
      const template_extra_fields = JSON.parse(task.template_extra_fields);
      task.template_extra_fields = template_extra_fields;
    }

    if ($.type(task.notifications) === 'string') {
      const notifications = JSON.parse(task.notifications);
      task.notifications = notifications;
    }

    if ($.type(task.customer_exact_location) === 'string') {
      const customer_exact_location = JSON.parse(task.customer_exact_location);
      task.customer_exact_location = customer_exact_location;
    }

    if ($.type(task.additional_addresses) === 'string') {
      const additional_addresses = JSON.parse(task.additional_addresses);
      task.additional_addresses = additional_addresses;
    }

    task.customer_address = generateSingleLineAddress(task);

    return task;
  }

  duplicateTask(task) {
    const duplicatedTask = $.extend(true, {}, task);
    duplicatedTask.id = null;
    duplicatedTask.title = 'Copy of ' + duplicatedTask.title;
    duplicatedTask.series_id = null;
    duplicatedTask.url_safe_id = null;
    duplicatedTask.status = 'NOTSTARTED';
    duplicatedTask.document_ids = null;
    const creatingActivity = task.template_type && task.template_type.toUpperCase() === 'ACTIVITY';
    setTimeout((e) => {
      this.createNewTask(duplicatedTask, creatingActivity);
    }, 2e3);
  }

  taskUpdatedCallback(task, createDuplicate = false, tasksFetchRecommended = false) {
    const index = this.getTaskIndexInEventsList(task);

    if (index === -1) {
      console.log('updated task is not found in list of events. This could be an error or the task is deleted from server.');
    }

    if (task.series_settings || tasksFetchRecommended) {
      const postProcess = () => {
        if (createDuplicate === true) {
          this.duplicateTask(this.conformTaskToServerReturnedStructure(task));
        }
      };
      this.fetchTasksAndEntitiesList(true, true, postProcess);
    } else {
      const postProcess = () => {
        if (createDuplicate === true) {
          this.duplicateTask(task);
        }
      };
      this.setState({
        tasks: index !== -1 ? update(this.state.tasks, {
          [index]: {$set: this.conformTaskToServerReturnedStructure(task)}
        }) : this.state.tasks
      }, postProcess);
    }

    this.closeModal();
  }

  taskAddedCallback(task, createDuplicate = false, tasksFetchRecommended = false) {
    if (task.series_settings || tasksFetchRecommended) {
      const postProcess = () => {
        if (createDuplicate === true) {
          this.duplicateTask(this.conformTaskToServerReturnedStructure(task));
        }
      };
      this.fetchTasksAndEntitiesList(true, true, postProcess);
    } else {
      const task_date = moment(task.start_datetime);
      if (moment(this.state.date).isSame(task_date, 'd')) {
        const postProcess = () => {
          if (createDuplicate === true) {
            this.duplicateTask(task);
          }
        };

        this.setState({
          tasks: update(this.state.tasks, {$push: [this.conformTaskToServerReturnedStructure(task)]}),
          showModal: false,
        }, postProcess);
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
      this.fetchTasksAndEntitiesList(true, true);
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
        [index]: {entity_ids: {$set: entity_ids}}
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
        [index]: {resource_ids: {$set: resource_ids}}
      }) : this.state.tasks,
      selectedTask: update(this.state.selectedTask, {
        resource_ids: {$set: resource_ids}
      })
    });
  }

  createNewTask(task = null, creatingActivity = false) {
    this.setState({
      showModal: true,
      newEventIsRecurring: false,
      selectedTask: task,
      creatingActivity
    });
  }

  createNewRecurringTask() {
    this.setState({
      showModal: true,
      newEventIsRecurring: true,
      selectedTask: null
    });
  }

  getEmptyText() {
    let emptyText;
    if (this.isAnyFilterEnabled()) {
      emptyText = 'No tasks matching the criteria';
    } else {
      emptyText = 'No tasks scheduled';
    }

    return (<div className={styles['no-entity']}>
      {emptyText}
    </div>);
  }

  collapseFilter() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }

  render() {
    this.can_create = false;
    this.can_view_filters = false;
    this.can_view_group_filter = false;
    if (this.props.groups !== null && typeof this.props.groups !== 'undefined' && this.props.groups.length > 0) {
      const defaultGroup = this.props.groups.find((group) => {
        return group.is_implicit;
      });
      if (defaultGroup && this.props.groups.length > 1) {
        this.can_view_group_filter = true;
      } else if (!defaultGroup) {
        this.can_view_group_filter = true;
      }
    }
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY')) is_company = true;
      if (is_company || permissions.includes('ADD_TASK')) this.can_create = true;
      if (is_company || permissions.includes('VIEW_ALL_TASKS')) this.can_view_filters = true;
      if (is_company || permissions.includes('TRIGGER_EXTERNAL_INTEGRATION_DATA_FETCH')) this.can_trigger_external_integration_data_fetch = true;
    }

    let filteredTasks = this.state.tasks;
    // if (this.state.selectedTasksFilter.length === 0 ||
    // 	this.state.selectedTasksFilter.indexOf('All') >= 0) {
    // 	filteredTasks = this.state.tasks;
    // 	// filteredTasks = this.state.tasks.filter(task => {
    // 	//   return (task.status.toUpperCase() !== 'COMPLETE' && task.status.toUpperCase() !== 'RECOMMENDED');
    // 	// });
    // } else {
    // 	filteredTasks = this.state.tasks
    // 		.filter(task =>
    // 			this.state.selectedTasksFilter.some(taskFilter => (task.status_title !== null ? taskFilter.toUpperCase() === task.status_title.toUpperCase() : taskFilter.toUpperCase() === task.status.toUpperCase()))
    // 		);
    // }

    // if (this.state.selectedEquipmentsFilter.length > 0 ||
    // 	this.state.selectedEntitiesFilter.length > 0) {
    // 	filteredTasks = filteredTasks
    // 		.filter(task =>
    // 			task.resource_ids.some(id => this.state.selectedEquipmentsFilter.indexOf(id) >= 0) ||
    // 			this.state.selectedEntitiesFilter.length > 0 &&
    // 			task.entity_ids.some(id => this.state.selectedEntitiesFilter.indexOf(id) >= 0) ||
    // 			(task.entity_ids.length === 0 && this.state.selectedEntitiesFilter.indexOf(-1) >= 0));
    // }

    // if (this.state.selectedGroupsFilter.length > 0) {
    // 	filteredTasks = filteredTasks.filter (eve => {
    // 		return this.state.selectedGroupsFilter.indexOf(eve.group_id) >= 0;
    // 	})
    // }

    let prevDisabled = false;
    let nextDisabled = false;
    if (this.state.page === 1) {
      prevDisabled = true;
    }
    if (this.state.tasks.length < this.state.items_per_page) {
      nextDisabled = true;
    }

    let groups = $.extend(true, [], this.props.groups);


    const height = this.props.headerHeight;

    return (
      <div className={styles.taskManagerContainer}>
        <style>
          {'.' + styles.taskItemsContainer + '{ min-height: calc(100vh - 55px - ' + (height ? height : 56) + 'px); max-height: calc(100vh - 55px - ' + (height ? height : 56) + 'px);}'}
          {'@media screen and (max-width: 991px){ .' + styles.taskItemsContainer + ' { min-height: calc(100vh - 110px - ' + (height ? height : 56) + 'px); max-height: calc(100vh - 110px - ' + (height ? height : 56) + 'px);}'}
        </style>
        <ErrorAlert errorText="No Internet Connection Available..." showError={this.state.internetIssue}/>
        <TopBar
          handleMapVisibility={this.handleMapVisibility}
          activityStreamStateHandler={this.props.activityStreamStateHandler}
          activityStreamStateChangeHandler={this.props.activityStreamStateChangeHandler}
          profile={this.props.profile}
          moveDate={this.moveDate}
          onChangeDate={this.onChangeDate}
          date={this.state.date}
          changeDashboard={this.props.changeDashboard}
          dashboardType={this.props.dashboardType}
          createNewTask={this.createNewTask}
          taskFilters={this.state.selectedTasksFilter}
          equipmentFilters={this.state.selectedEquipmentsFilter}
          entitiesFilters={this.state.selectedEntitiesFilter}
          templateFilters={this.state.selectedTemplatesFilter}
          groupsFilters={this.state.selectedGroupsFilter}
          can_view_group_filter={this.can_view_group_filter}
          groupsFilterChanged={this.groupsFilterChanged}
          groups={groups}
          filterStatuses={this.state.filterStatuses}
          selectedTaskFilterChanged={this.selectedTaskFilterChanged}
          equipments={this.props.equipments}
          equipmentFilterChanged={this.equipmentFilterChanged}
          entities={this.state.entities}
          entityFilterChanged={this.entityFilterChanged}
          templates={this.state.templates}
          templateFilterChanged={this.templateFilterChanged}
          canCreate={this.can_create}
          applyFilters={this.applyFilters}
          showSpinner={this.state.showSpinner}
          createNewRecurringTask={this.createNewRecurringTask}
          canTriggerExternalIntegrationDataFetch={this.can_trigger_external_integration_data_fetch}
          externalIntegrations={this.props.externalIntegrations}
          getExternalIntegrations={this.props.getExternalIntegrations}
        />
        <Grid>
          {!this.props.contentLoaded &&
          <Row>
            <Col md={12}>
              <div className={styles.contentLoadingContainer}>
                <SavingSpinner title={'Loading'} borderStyle="none"/>
              </div>
            </Col>
          </Row>
          }
          {this.props.contentLoaded &&
          <Row className={styles.taskManagerQuickContentContainer}>
            <Col md={window.map ? 6 : 12} sm={12}>
              <div className={styles.taskItemsContainer}>
                <div className={styles.tasksContainerMiniBar}>
                  {!this.state.loadingTasks && <div>
                    <div className={styles.tasksCount}>
                      {this.state.blockingLoadTasks || this.state.tasks.length < 1
                        ?
                        <p>
                          {this.state.tasks.length >= 100 && this.state.tasks.length}
                        </p>
                        :
                        <p>
                          {((this.state.page - 1) * this.state.items_per_page) + 1} - {(this.state.page * this.state.items_per_page) - (this.state.items_per_page - this.state.tasks.length)}
                        </p>
                      }
                    </div>
                    {(this.state.tasks.length >= 100 || this.state.page > 1) &&
                    <div className={styles.paginationContainer}>
                      <button disabled={prevDisabled}
                              className={cx(prevDisabled && 'disabled', this.state.blockingLoadTasks && styles.pendingAction)}
                              onClick={() => this.paginationPrevClicked()}>
                        <FontAwesomeIcon icon={faChevronLeft}/>
                      </button>
                      <button disabled={nextDisabled}
                              className={cx(nextDisabled && 'disabled', this.state.blockingLoadTasks && styles.pendingAction)}
                              onClick={() => this.paginationNextClicked()}>
                        <FontAwesomeIcon icon={faChevronRight}/>
                      </button>
                    </div>
                    }
                  </div>}
                  {this.state.loadingTasks &&
                  <div className={styles.loadingSpinnerContainer}>
                    <SavingSpinner title={'Loading'} borderStyle="none"/>
                  </div>
                  }
                </div>
                {!this.state.loadingTasks && filteredTasks.length === 0 ? this.getEmptyText() : null}
                {
                  filteredTasks.map((task, i) => {
                    if (task.template_type === 'TASK') {
                      return (
                        <TaskCard
                          taskClick={this.onTaskClick}
                          showEntities
                          task={task}
                          itemkey={i}
                          entities={task.entities_data}
                          companyProfile={this.props.companyProfile}
                          profile={this.props.profile}
                          onTaskMouseOver={(task_id) => {
                            return false;
                          }}
                          onTaskMouseOut={() => {
                            return false;
                          }}
                        />
                      );
                    } else {

                      return (
                        <ActivityCard
                          activityClick={this.onTaskClick}
                          showEntities
                          activity={task}
                          itemkey={i}
                          entities={task.entities_data}
                          companyProfile={this.props.companyProfile}
                          profile={this.props.profile}
                          onTaskMouseOver={(task_id) => {
                            return false;
                          }}
                          onTaskMouseOut={() => {
                            return false;
                          }}
                        />
                      );

                    }

                  })
                }
              </div>
            </Col>
            {window.map &&
            <Col md={6} sm={12}>
              <div className={styles.locationMapContainer}>
                {this.renderTasksToShowOnMap(this.state.entities, filteredTasks)}
              </div>
            </Col>
            }
          </Row>
          }
          <Modal show={this.state.showModal} onHide={this.closeModal} keyboard={false} backdrop={'static'} bsSize="large">
            <Modal.Body>
              <TaskWrapperV2
                selectedTask={this.state.selectedTask}
                newEventIsRecurring={this.state.newEventIsRecurring}
                company_id={this.props.company_id}
                company_url={this.props.company_url}
                reporter_name={this.props.reporter_name}
                reporter_id={this.props.reporter_id}
                getTaskStatus={this.props.getStatus}
                getTaskRatings={this.props.getRatings}
                updateTaskStatus={this.props.setNewStatus}
                getEstimate={this.props.getEstimate}
                getSchedule={this.props.getSchedule}
                statuses={this.state.statuses}
                entities={this.state.entities}
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
                handleTaskTypeChange={this.handleTaskTypeChange}
                onCloseTask={this.closeModal}
                updateTask={this.props.updateTask}
                deleteTask={this.props.deleteTask}
                postTask={this.props.postTask}
                getTaskSeriesSettings={this.props.getTaskSeriesSettings}
                taskSendNotification={this.props.taskSendNotification}
                profile={this.props.profile}
                templates={this.state.templates}
                defaultTemplate={this.state.defaultTemplate}
                companyProfile={this.props.companyProfile}
                groups={this.props.groups}
                createToastNotification={this.props.createToastNotification}
                creatingActivity={this.state.creatingActivity}
                systemAndCustomMessages={this.props.systemAndCustomMessages}
              />
            </Modal.Body>
          </Modal>

        </Grid>
      </div>
    );
  }
}
