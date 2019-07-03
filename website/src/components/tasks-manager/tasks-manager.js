import React, {Component} from 'react';
import PropTypes from 'prop-types';
import BigCalendar from 'react-big-calendar';
import {
  Grid,
  Button,
  Modal,
  Row,
  Col,
  ButtonGroup,
  DropdownButton,
  MenuItem,
  OverlayTrigger,
  Tooltip,
  FormControl
} from 'react-bootstrap';
import DatePicker from 'react-bootstrap-date-picker';
import {Cookies} from 'react-cookie';
import {TaskWrapperV2} from '../index';
import Timeline from '../task-timeline-v2/task-timeline.js';
import TasksListView from '../../components/tasks-list-view/tasks-list-view.js';
import update from 'immutability-helper';
import moment from 'moment';
import styles from './tasks-manager.module.scss';
import DropdownFilter from '../dropdown-filter/dropdown-filter';
import TaskImport from '../task-import/task-import';
import TaskExport from '../task-export/task-export';
import SavingSpinner from '../saving-spinner/saving-spinner';
import {generateSingleLineAddress} from '../../helpers/task';
import {activityTypes} from "../../helpers/activity-types-icons";
import {hexToRgb, computeTextColor, hextToRGBA} from '../../helpers/color';
import {
  getTemplates,
  searchEntities, searchGroups, searchResources,
} from '../../actions';
import cx from 'classnames';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faEllipsisV } from '@fortawesome/fontawesome-free-solid';
import './calendar-fix.css';
import {parseQueryParams} from '../../helpers';
import ErrorAlert from '../error-alert/error-alert';
import {toast, ToastContainer} from 'react-toastify';
import {ActivityStream, ActivityStreamButtonV2} from '../index';
import {faSlidersH} from "@fortawesome/fontawesome-free-solid/index";
import $ from 'jquery';
import SynchronizeNow from "../account-wrapper-v2/components/integrations/components/synchronize-now/synchronize-now";
import {getEndDateForForSync, getStartDateForForSync} from "../../helpers/external-integrations";
import TopBar from "../task-manager-quick-v4/task-manager-quick-v4";
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

@DragDropContext(HTML5Backend)
export default class TasksManager extends Component {
  constructor(props) {
    super(props);
    BigCalendar.setLocalizer(
      BigCalendar.momentLocalizer(moment)
    );

    this.cookies = new Cookies();

    this.state = {
      showModal: false,
      selectedEvent: undefined,
      events: [],
      view: (this.cookies && this.cookies.get('calenderView')) ? this.cookies.get('calenderView') : 'tasks',
      viewType: this.cookies && (this.cookies.get('calenderView') && this.cookies.get('calenderView') === 'team') ? 'day' : this.cookies.get('calenderViewType') ? this.cookies.get('calenderViewType') : 'week',
      date: this.initializeDate(),
      end_date: this.initializeDate(),
      importModal: false,
      exportModal: false,
      entities: [],
      entityTypes: [],
      equipments: [],
      entityRoles: [{id: 2, name: 'Admin'}, {id: 3, name: 'Scheduler'}, {id: 4, name: 'Field Crew'}, {id: 5, name: 'Limited Access'}],
      loadingTask: false,
      blockingUpdate: false,
      loadingEntities: false,
      loadingEquipments: false,
      selectedEntitiesFilter: [],
      selectedEquipmentsFilter: [],
      selectedTypeEntitiesFilter: [],
      selectedTemplatesFilter: [],
      selectedTaskFilter: [],
      selectedGroupsFilter: [],
      selectedEntityRoleFilter: [],
      showBusinessHours: true,
      newEventIsRecurring: false,
      items_per_page: 100,
      page: 1,
      unscheduledEvents: [],
      unscheduledEventsCount: 0,
      unscheduledEventsWithoutDate: [],
      unscheduledEventsWithoutDateCount: 0,
      templates: [],
      statuses: this.props.statuses,
      loadingTemplates: false,
      defaultTemplate: null,
      filterStatuses: [],
      timer: null,
      confirmationStatusFilter: null,
      showFilters: false,
      internetIssue: undefined,
      showTeamEquipmentForm: false,
      task_ids: [],
      showEntitiesWarning: false,
      showEquipmentsWarning: false,
      view_activity_stream: false,
      applyFilters: false,
      filter_entity_ids: [],
      filter_resource_ids: [],
      filter_group_ids: [],
      filter_statuses: [],
      filter_templates: [],
      filter_entity_confirmation_status: '',
      showSpinner: false,
    };

    this.clearAllFilters = this.clearAllFilters.bind(this);
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
    this.openRecurring = this.openRecurring.bind(this);
    this.openExportModal = this.openExportModal.bind(this);
    this.selectEvent = this.selectEvent.bind(this);
    this.viewChanged = this.viewChanged.bind(this);
    this.viewTypeChanged = this.viewTypeChanged.bind(this);
    this.onNavigate = this.onNavigate.bind(this);
    this.importModalHide = this.importModalHide.bind(this);
    this.exportModalHide = this.exportModalHide.bind(this);
    this.updateTaskList = this.updateTaskList.bind(this);
    this.getTaskIndexInEventsList = this.getTaskIndexInEventsList.bind(this);
    this.getTaskIndexInEventsListUsingId = this.getTaskIndexInEventsListUsingId.bind(this);
    this.getTaskIndexInUnscheduledEventsList = this.getTaskIndexInUnscheduledEventsList.bind(this);
    this.getTaskIndexInUnscheduledEventsListUsingId = this.getTaskIndexInUnscheduledEventsListUsingId.bind(this);
    this.getTaskIndexInUnscheduledEventsWithoutDateList = this.getTaskIndexInUnscheduledEventsWithoutDateList.bind(this);
    this.getTaskIndexInUnscheduledEventsWithoutDateListUsingId = this.getTaskIndexInUnscheduledEventsWithoutDateListUsingId.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.changeHours = this.changeHours.bind(this);
    this.eventPropsGetter = this.eventPropsGetter.bind(this);
    this.handleEventContent = this.handleEventContent.bind(this);
    this.onSelectEmptySlot = this.onSelectEmptySlot.bind(this);
    this.entityFilterChanged = this.entityFilterChanged.bind(this);
    this.equipmentFilterChanged = this.equipmentFilterChanged.bind(this);
    this.templateFilterChanged = this.templateFilterChanged.bind(this);
    this.statusFilterChanged = this.statusFilterChanged.bind(this);
    this.typeFilterChanged = this.typeFilterChanged.bind(this);
    this.taskUpdatedCallback = this.taskUpdatedCallback.bind(this);
    this.taskAddedCallback = this.taskAddedCallback.bind(this);
    this.taskDeletedCallback = this.taskDeletedCallback.bind(this);
    this.taskAssigneeUpdatedCallback = this.taskAssigneeUpdatedCallback.bind(this);
    this.taskEquipmentUpdatedCallback = this.taskEquipmentUpdatedCallback.bind(this);
    this.getDefaultDates = this.getDefaultDates.bind(this);
    this.paginationPrevClicked = this.paginationPrevClicked.bind(this);
    this.paginationNextClicked = this.paginationNextClicked.bind(this);
    this.handleTaskTypeChange = this.handleTaskTypeChange.bind(this);
    this.createNewTask = this.createNewTask.bind(this);
    this.createNewRecurringTask = this.createNewRecurringTask.bind(this);
    this.onDayFilterChange = this.onDayFilterChange.bind(this);
    this.startAsyncUpdate = this.startAsyncUpdate.bind(this);
    this.visibilityChanged = this.visibilityChanged.bind(this);
    this.clearAsyncUpdate = this.clearAsyncUpdate.bind(this);
    this.getUniqueStatusesFromTemplates = this.getUniqueStatusesFromTemplates.bind(this);
    this.taskConfirmationStatusFiltersChanged = this.taskConfirmationStatusFiltersChanged.bind(this);
    this.handleConfirmationFilterChange = this.handleConfirmationFilterChange.bind(this);
    this.groupsFilterChanged = this.groupsFilterChanged.bind(this);
    this.previousCalendarHandler = this.previousCalendarHandler.bind(this);
    this.nextCalendarHandler = this.nextCalendarHandler.bind(this);
    this.collapseFilter = this.collapseFilter.bind(this);
    this.showAssignTeamEquipment = this.showAssignTeamEquipment.bind(this);
    this.hideAssignTeamEquipment = this.hideAssignTeamEquipment.bind(this);
    this.onTaskSelectionChangeForTeamEquipmentAssign = this.onTaskSelectionChangeForTeamEquipmentAssign.bind(this);
    this.onAllSelectionChange = this.onAllSelectionChange.bind(this);
    this.createToastNotification = this.createToastNotification.bind(this);
    this.toggleFilters = this.toggleFilters.bind(this);
    this.renderSelectedFilters = this.renderSelectedFilters.bind(this);
    this.printList = this.printList.bind(this);
    this.applyFilters = this.applyFilters.bind(this);
    this.getUnscheduledWithoutDateTimeAjaxCall = this.getUnscheduledWithoutDateTimeAjaxCall.bind(this);
    this.getUnscheduledAjaxCall = this.getUnscheduledAjaxCall.bind(this);
    this.getAjaxCall = this.getAjaxCall.bind(this);
    this.updateFiltersData = this.updateFiltersData.bind(this);
	  this.getStartOfWeek = this.getStartOfWeek.bind(this);
    this.roleFilterChanged = this.roleFilterChanged.bind(this);
  }

  componentWillMount() {
    if (this.state.view === 'list') {
      this.props.mediaPrint(true);
    }
    if (this.props.locationQuery === '?google-calendar-auth-complete') {
      this.setState({importModal: true});
    }
  }

  componentDidMount() {
    this.setTimer = true;
    document.addEventListener('visibilitychange', this.visibilityChanged);
    this.setState({
      loadingEntities: true,
      loadingEquipments: true
    });

    let permissions = null;
    let is_company = false;
    let view_activity_stream = false;
    const profile = this.props.profile;
    if (profile) {
      if (profile && profile.permissions) {
        permissions = profile.permissions
      }
      if (permissions && permissions.includes('COMPANY')) {
        is_company = true
      }
      if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
        view_activity_stream = true;
      }
    }
    this.setState({
      view_activity_stream
    });

    const promises = [];
    promises.push(
      this.props.getEntities().then((res) => {

        const entities = JSON.parse(res);
        const entityTypes = [];
        entities.map((entity) => {
          if (!entityTypes.some(el => el.id === entity.type)) {
            entityTypes.push({id: entity.type, name: entity.type || "Blank"})
          }
        });

        this.setState({
          entities,
          entityTypes,
          loadingEntities: false
        });
      })
    );

    promises.push(
      this.props.getEquipments().then((res) => {
        const equipments = JSON.parse(res);
        this.setState({
          equipments,
          loadingEquipments: false
        });
      })
    );

    promises.push(
      getTemplates().then((templates) => {
        const parsedTemplate = JSON.parse(templates);
        let defaultTemplate = null;
        parsedTemplate.map((template) => {
          if (template.is_default) {
            defaultTemplate = template;
          }
          ;
        });
        this.setState({
          templates: parsedTemplate,
          defaultTemplate,
          loadingTemplates: false,
          filterStatuses: this.getUniqueStatusesFromTemplates(parsedTemplate)
        }, () => {
          this.updateTaskList(true);
        });
      }).catch((err) => {
        if (err.status === 400) {
          this.updateTaskList(true);
        }
      })
    );


    Promise.all(promises).then(() => {
      this.setState({
        timer,
        loadingTask: false,
        blockingUpdate: false,
      }, () => {
        return null;
      });
    }).catch((err) => {
      if (err.status === 0) {
        this.setState({
          loadingTask: false,
          blockingUpdate: false,
          loadingEntities: false,
          loadingEquipments: false,
          internetIssue: true,
        })
      }
    });

    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 6e4);
    if (this.setTimer && !document.hidden) {
      this.setState({
        timer,
        internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
      });
    } else {
      clearTimeout(timer);
    }
  }

  handleConfirmationFilterChange(e) {
    e.preventDefault();
    e.stopPropagation();
    let filter_entity_confirmation_status = this.state.filter_entity_confirmation_status;
    if (!e.target.value) {
      filter_entity_confirmation_status = '';
    }
    this.setState({
      confirmationStatusFilter: e.target.value, filter_entity_confirmation_status
    });
  }

  taskConfirmationStatusFiltersChanged() {
    const filterValue = this.state.confirmationStatusFilter;
    const events = [...this.state.events];
    let filteredEvents = [];
    events.map((event) => {
      const taskConfirmation = event.entity_confirmation_statuses;
      const entity_ids = event.entity_ids;
      if (taskConfirmation !== null && entity_ids.length > 0) {
        let anyAccepted = false;
        let anyRejected = false;
        let allResponded = true;
        for (let i = 0; i < entity_ids.length; i++) {
          if (entity_ids[i] in taskConfirmation) {
            if (taskConfirmation[entity_ids[i]].status === 'ACCEPTED') {
              anyAccepted = true;
              continue;
            } else if (taskConfirmation[entity_ids[i]].status === 'REJECTED') {
              anyRejected = true;
              break;
            }
          }
          allResponded = false;
        }
        if (filterValue === '1001') {
          filteredEvents.push(event);
        } else if (filterValue === '1002') {
          if (anyRejected) {
            filteredEvents.push(event);
          }
        } else if (filterValue === '1005') {
          if (allResponded && anyAccepted && !anyRejected) {
            filteredEvents.push(event);
          }
        } else if (filterValue === '1004') {
          if (anyAccepted && !anyRejected && !allResponded) {
            filteredEvents.push(event);
          }
        }
      } else {
        if (filterValue === '1003' || filterValue === '1001') {
          filteredEvents.push(event);
        }
      }
    });
    return filteredEvents;
  }

  componentWillUnmount() {
    this.setTimer = false;
    this.clearAsyncUpdate();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
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
    this.updateTaskList();
  }

  initializeDate() {
    const query = parseQueryParams(this.props.location.search);
    if (query.date) {
      const dateObject = moment(query.date);
      if (dateObject.isValid()) {
        return new Date(query.date);
      } else {
        return new Date();
      }
    } else {
      return new Date();
    }
  }

  onTaskSelectionChangeForTeamEquipmentAssign(task_id) {
    const index = this.state.task_ids.indexOf(task_id);
    let task_ids = this.state.task_ids;
    if (index !== -1) {
      task_ids.splice(index, 1);
    } else {
      task_ids.push(task_id);
    }
    this.setState({
      task_ids
    });
  }

  onAllSelectionChange(task_ids) {
    this.setState({
      task_ids
    });
  }

  showAssignTeamEquipment() {
    const selectedTaskIds = this.state.task_ids;
    const selectedEvents = [];
    let showEntitiesWarning = false;
    let showEquipmentsWarning = false;
    selectedTaskIds.map((task_id) => {
      const event = this.state.events.find((task) => {
        return task.id === task_id;
      });
      if (event) {
        selectedEvents.push(event);
      }
    });
    if (selectedEvents.find((task) => {
      return task.entity_ids && task.entity_ids.length > 0;
    })) {
      showEntitiesWarning = true;
    }
    if (selectedEvents.find((task) => {
      return task.resource_ids && task.resource_ids.length > 0;
    })) {
      showEquipmentsWarning = true;
    }
    this.setState({
      showTeamEquipmentForm: true,
      showEntitiesWarning,
      showEquipmentsWarning
    });
  }

  hideAssignTeamEquipment(removeTaskIds = false) {
    let task_ids = this.state.task_ids;
    if (removeTaskIds) {
      task_ids = []
    }
    this.setState({
        showTeamEquipmentForm: false,
        task_ids,
      }, () => {
        this.updateTaskList(true);
      }
    );
  }

  handleTaskTypeChange(template_id) {
    if (template_id !== "DEFAULT" && template_id !== null) {
      if (template_id !== 'DEFAULT') {
        let selectedTemplate = null;
        this.state.templates.map((template) => {
          const updatedTemplate = parseInt(template_id);
          if (updatedTemplate === template.id) {
            selectedTemplate = template;
          }
        });
        if (selectedTemplate !== null) {
          this.setState((state) => {
            return {
              ...state,
              selectedEvent: {
                ...state.selectedEvent,
                template: parseInt(template_id)
              },
              statuses: selectedTemplate.status_data
            };
          });
        } else {
          const event = this.state.selectedEvent;
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
        const event = this.state.selectedEvent;
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
            selectedEvent: {
              ...state.selectedEvent,
              template: null
            },
            statuses: statuses
          };
        })
      }
    }
  }

  onDayFilterChange(event) {
    this.cookies.set('calenderViewType', event.target.value);
    this.setState({
        viewType: event.target.value,
        page: 1,

      }, () => this.updateTaskList(true)
    );
  }

  onChangeDate(date) {
    this.setState({
        date,
        end_date: date,
        page: 1
      },
      () => this.updateTaskList(true));

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

  // End date is only used by list view. For all others we can just set the end_date to current selected date
  // The code that fetches data takes care of checking view-type and the date range for fetching tasks
  // OnNavigate is only used by the BigCalendar Control
  onNavigate(date, type) {
    this.setState(Object.assign(this.state, {date, end_date: date, viewType: type, page: 1}));
    this.updateTaskList(true);
  }

  getTaskIndexInEventsList(task) {
    return this.getTaskIndexInEventsListUsingId(task.id);
  }

  getTaskIndexInEventsListUsingId(task_id) {
    let index = -1;

    for (let i = 0; i < this.state.events.length; i++) {
      if (this.state.events[i].id === task_id) {
        index = i;
      }
    }

    return index;
  }

  getTaskIndexInUnscheduledEventsList(task) {
    return this.getTaskIndexInUnscheduledEventsListUsingId(task.id);
  }

  getTaskIndexInUnscheduledEventsListUsingId(task_id) {
    let index = -1;

    for (let i = 0; i < this.state.unscheduledEvents.length; i++) {
      if (this.state.unscheduledEvents[i].id === task_id) {
        index = i;
      }
    }

    return index;
  }

  getTaskIndexInUnscheduledEventsWithoutDateList(task) {
    return this.getTaskIndexInUnscheduledEventsWithoutDateListUsingId(task.id);
  }

  getTaskIndexInUnscheduledEventsWithoutDateListUsingId(task_id) {
    let index = -1;

    for (let i = 0; i < this.state.unscheduledEventsWithoutDate.length; i++) {
      if (this.state.unscheduledEventsWithoutDate[i].id === task_id) {
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
        if (array[i] !== "") {
          int_array.push(parseInt(array[i], 10));
        }
      }

      task.entity_ids = int_array;
    }

    if ($.type(task.resource_ids) === "string") {
      const array = task.resource_ids.split(',');
      const int_array = [];
      for (let i = 0; i < array.length; i++) {
        if (array[i] !== "") {
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

    if ($.type(task.template_extra_fields) === 'string') {
      const template_extra_fields = JSON.parse(task.template_extra_fields);
      task.template_extra_fields = template_extra_fields;
    }

    if ($.type(task.notifications) === "string") {
      const notifications = JSON.parse(task.notifications);
      task.notifications = notifications;
    }

    if ($.type(task.customer_exact_location) === "string") {
      const customer_exact_location = JSON.parse(task.customer_exact_location);
      task.customer_exact_location = customer_exact_location;
    }

    if ($.type(task.additional_addresses) === 'string') {
      const additional_addresses = JSON.parse(task.additional_addresses);
      task.additional_addresses = additional_addresses;
    }

    task.customer_address = generateSingleLineAddress(task);

    task.start = moment.utc(task.start_datetime).toDate();
    task.end = moment.utc(task.end_datetime).toDate();

    return task;
  }

  duplicateTask(task) {
    const duplicatedTask = {};
    Object.assign(duplicatedTask, task);
    duplicatedTask.id = null;
    duplicatedTask.title = 'Copy of ' + duplicatedTask.title;
    duplicatedTask.series_id = null;
    duplicatedTask.url_safe_id = null;
    duplicatedTask.status = "NOTSTARTED";
    setTimeout((e) => {this.selectEvent(duplicatedTask)}, 2e3);
  }

  taskUpdatedCallback(task, createDuplicate = false, tasksFetchRecommended = false) {

    let index = -1;
    if (task.unscheduled && task.start_datetime) {
      index = this.getTaskIndexInUnscheduledEventsList(task);
    } else if (task.unscheduled && !task.start_datetime) {
      index = this.getTaskIndexInUnscheduledEventsWithoutDateList(task);
    } else {
      index = this.getTaskIndexInEventsList(task);
    }

    if (index === -1) {
      console.log('updated task is not found in list of events, unscheduled events or unscheduled events without datetime. This could be an error or the task is deleted from server.');
      //Force task fetch in this case as we are not sure about the state of our events.
      //We had a bug where duplicating an unscheduled task was trying to update tasks on the "events" structure
      //Quick fix is to just reload the tasks in cases we aren't able to lookup the above task in our list
      tasksFetchRecommended = true;
    }

    if (task.series_settings || tasksFetchRecommended) {
      const postProcess = () => {
        if (createDuplicate === true) {
          this.duplicateTask(this.conformTaskToServerReturnedStructure(task));
        }
      };

      this.updateTaskList(true, true, postProcess);
    } else {
      const postProcess = () => {
        if (createDuplicate === true) {
          this.duplicateTask(task);
        }
      };

      if (task.unscheduled && task.start_datetime) {
        this.setState({
          unscheduledEvents: index !== -1 ? update(this.state.unscheduledEvents, {
            [index]: {$set: this.conformTaskToServerReturnedStructure(task)}
          }) : this.state.unscheduledEvents
        }, postProcess);
      } else if (task.unscheduled && !task.start_datetime) {
        this.setState({
          unscheduledEventsWithoutDate: index !== -1 ? update(this.state.unscheduledEventsWithoutDate, {
            [index]: {$set: this.conformTaskToServerReturnedStructure(task)}
          }) : this.state.unscheduledEventsWithoutDate
        }, postProcess);
      } else {
        this.setState({
          events: index !== -1 ? update(this.state.events, {
            [index]: {$set: this.conformTaskToServerReturnedStructure(task)}
          }) : this.state.events
        }, postProcess);
      }
    }

    this.close();
  }

  taskAddedCallback(task, createDuplicate = false, tasksFetchRecommended = false) {
    //We are refreshing entire contents if a task is added on list view. List view displays data in some sort order
    //And by default we insert at the end. Quick fix is to just reload the tasks on add on list view
    if (task.series_settings || this.state.view == 'list' || tasksFetchRecommended) {
      const postProcess = () => {
        if (createDuplicate === true) {
          this.duplicateTask(this.conformTaskToServerReturnedStructure(task));
        }
      };

      this.updateTaskList(true, true, postProcess);
    } else {
      const postProcess = () => {
        if (createDuplicate === true) {
          this.duplicateTask(task);
        }
      };

      if (task.unscheduled && task.start_datetime) {
        this.setState({
          unscheduledEvents: update(this.state.unscheduledEvents, {$push: [this.conformTaskToServerReturnedStructure(task)]})
        }, postProcess);
      } else if (task.unscheduled && !task.start_datetime) {
        this.setState({
          unscheduledEventsWithoutDate: update(this.state.unscheduledEventsWithoutDate, {$push: [this.conformTaskToServerReturnedStructure(task)]})
        }, postProcess);
      } else {
        this.setState({
          events: update(this.state.events, {$push: [this.conformTaskToServerReturnedStructure(task)]})
        }, postProcess);
      }
    }

    this.close();
  }

  taskDeletedCallback(task_id, series_deleted) {
    let index = -1;
    let taskFoundInEventsList = false;
    let taskFoundInUnscheduledEventsList = false;
    let taskFoundInUnscheduledEventsWithoutDateList = false;
    index = this.getTaskIndexInEventsListUsingId(task_id);
    if (index != -1) {
      taskFoundInEventsList = true;
    }
    if (!taskFoundInEventsList) {
      index = this.getTaskIndexInUnscheduledEventsListUsingId(task_id);
      if (index != -1) {
        taskFoundInUnscheduledEventsList = true;
      }
    }
    if (!taskFoundInEventsList && !taskFoundInUnscheduledEventsList) {
      index = this.getTaskIndexInUnscheduledEventsWithoutDateList(task_id);
      if (index != -1) {
        taskFoundInUnscheduledEventsWithoutDateList = true;
      }
    }

    if (index === -1) {
      console.error('deleted task is not found in list of events, unscheduled events or unscheduled events without datetime. This could be an error or the task is deleted from server.');
    }

    if (series_deleted) {
      this.updateTaskList(true, true);
    } else {
      if (taskFoundInUnscheduledEventsList) {
        this.setState({
          unscheduledEvents: index !== -1 ? update(this.state.unscheduledEvents, {
            $splice: [[index, 1]]
          }) : this.state.unscheduledEvents
        });

      } else if (taskFoundInUnscheduledEventsWithoutDateList) {
        this.setState({
          unscheduledEventsWithoutDate: index !== -1 ? update(this.state.unscheduledEventsWithoutDate, {
            $splice: [[index, 1]]
          }) : this.state.unscheduledEventsWithoutDate
        });

      } else {
        this.setState({
          events: index !== -1 ? update(this.state.events, {
            $splice: [[index, 1]]
          }) : this.state.events
        });
      }
    }

    this.close();
  }

  taskAssigneeUpdatedCallback(entity_ids, task_id) {
    let index = -1;
    let taskFoundInEventsList = false;
    let taskFoundInUnscheduledEventsList = false;
    let taskFoundInUnscheduledEventsWithoutDateList = false;
    index = this.getTaskIndexInEventsListUsingId(task_id);
    if (index != -1) {
      taskFoundInEventsList = true;
    }
    if (!taskFoundInEventsList) {
      index = this.getTaskIndexInUnscheduledEventsListUsingId(task_id);
      if (index != -1) {
        taskFoundInUnscheduledEventsList = true;
      }
    }
    if (!taskFoundInEventsList && !taskFoundInUnscheduledEventsList) {
      index = this.getTaskIndexInUnscheduledEventsWithoutDateList(task_id);
      if (index != -1) {
        taskFoundInUnscheduledEventsWithoutDateList = true;
      }
    }

    if (index === -1) {
      console.log('updated task is not found in list of events, unscheduled events or unscheduled events without datetime. This could be an error or the task is deleted from server.');
    }

    if (taskFoundInUnscheduledEventsList) {
      this.setState({
        unscheduledEvents: index !== -1 ? update(this.state.unscheduledEvents, {
          [index]: {entity_ids: {$set: entity_ids}}
        }) : this.state.unscheduledEvents,
        selectedEvent: update(this.state.selectedEvent, {
          entity_ids: {$set: entity_ids}
        })
      });
    } else if (taskFoundInUnscheduledEventsWithoutDateList) {
      this.setState({
        unscheduledEventsWithoutDate: index !== -1 ? update(this.state.unscheduledEventsWithoutDate, {
          [index]: {entity_ids: {$set: entity_ids}}
        }) : this.state.unscheduledEventsWithoutDate,
        selectedEvent: update(this.state.selectedEvent, {
          entity_ids: {$set: entity_ids}
        })
      });
    } else {
      this.setState({
        events: index !== -1 ? update(this.state.events, {
          [index]: {entity_ids: {$set: entity_ids}}
        }) : this.state.events,
        selectedEvent: update(this.state.selectedEvent, {
          entity_ids: {$set: entity_ids}
        })
      });
    }
  }

  taskEquipmentUpdatedCallback(resource_ids, task_id) {
    let index = -1;
    let taskFoundInEventsList = false;
    let taskFoundInUnscheduledEventsList = false;
    let taskFoundInUnscheduledEventsWithoutDateList = false;
    index = this.getTaskIndexInEventsListUsingId(task_id);
    if (index != -1) {
      taskFoundInEventsList = true;
    }
    if (!taskFoundInEventsList) {
      index = this.getTaskIndexInUnscheduledEventsListUsingId(task_id);
      if (index != -1) {
        taskFoundInUnscheduledEventsList = true;
      }
    }
    if (!taskFoundInEventsList && !taskFoundInUnscheduledEventsList) {
      index = this.getTaskIndexInUnscheduledEventsWithoutDateList(task_id);
      if (index != -1) {
        taskFoundInUnscheduledEventsWithoutDateList = true;
      }
    }

    if (index === -1) {
      console.log('updated task is not found in list of events, unscheduled events or unscheduled events without datetime. This could be an error or the task is deleted from server.');
    }

    if (taskFoundInUnscheduledEventsList) {
      this.setState({
        unscheduledEvents: index !== -1 ? update(this.state.unscheduledEvents, {
          [index]: {resource_ids: {$set: resource_ids}}
        }) : this.state.unscheduledEvents,
        selectedEvent: update(this.state.selectedEvent, {
          resource_ids: {$set: resource_ids}
        })
      });
    } else if (taskFoundInUnscheduledEventsWithoutDateList) {
      this.setState({
        unscheduledEventsWithoutDate: index !== -1 ? update(this.state.unscheduledEventsWithoutDate, {
          [index]: {resource_ids: {$set: resource_ids}}
        }) : this.state.unscheduledEventsWithoutDate,
        selectedEvent: update(this.state.selectedEvent, {
          resource_ids: {$set: resource_ids}
        })
      });
    } else {
      this.setState({
        events: index !== -1 ? update(this.state.events, {
          [index]: {resource_ids: {$set: resource_ids}}
        }) : this.state.events,
        selectedEvent: update(this.state.selectedEvent, {
          resource_ids: {$set: resource_ids}
        })
      });
    }
  }

  createNewTask(creatingActivity = false) {
    this.setState({
      selectedEvent: null,
      showModal: true,
      newEventDate: null,
      newEventEndDate: null,
      newEventIsRecurring: false,
      creatingActivity,
      duration: null
    });
  }

  createNewRecurringTask() {
    this.setState({
      showModal: true,
      newEventIsRecurring: true,
      selectedEvent: null,
      duration: null,
    });
  }

  selectEvent(event) {
    const selectedEvent = $.extend(true, {}, event);
    if (this.props.groups && !this.props.groups.find((group) => {
      return group.id === selectedEvent.group_id;
    })) {
      selectedEvent.group_id = null;
    }
    let entities = this.state.entities;
    if (selectedEvent.entities_data) {
      entities.push.apply(entities, selectedEvent.entities_data);
      entities = entities.filter((value, index) => {
        return entities.map((entity) => {
          return entity.id;
        }).indexOf(value.id) === index;
      });
    }
    this.setState({selectedEvent, entities});
    this.open(null, null);
    if (event.template) {
      this.handleTaskTypeChange(event.template);
    } else {
      let statuses = this.props.statuses;
      if (event.template_type && event.template_type.toUpperCase() === 'ACTIVITY') {
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

  close() {
    if ((this.state.view === 'list' || this.state.view === 'unscheduled') && this.state.viewType === 'month') {
      this.setState(Object.assign(this.state, {
        showModal: false,
        selectedEvent: undefined,
        newEventDate: null,
        newEventEndDate: null,
        allDay: false,
        creatingActivity: false
      }), () => this.updateTaskList(true));
    } else {
      this.setState(Object.assign(this.state, {
        showModal: false,
        selectedEvent: undefined,
        newEventDate: null,
        newEventEndDate: null,
        allDay: false,
        creatingActivity: false
      }), () => this.updateTaskList(true));
    }
  }

  open(newEventStartDate = null, newEventEndDate = null, creatingActivity = false, allDay = false, duration = null) {

    this.setState({
      showModal: true,
      newEventDate: newEventStartDate,
      newEventEndDate: newEventEndDate,
      newEventIsRecurring: false,
      creatingActivity,
      allDay,
      duration,
    });
  }

  openRecurring() {
    this.setState({
      showModal: true,
      newEventIsRecurring: true
    });

    this.setState({
      showModal: true,
      newEventIsRecurring: true
    });
  }

  openExportModal() {
    this.setState({exportModal: true});
  }

  printList() {
    window.print();
  }

  clearAllFilters(e = null, updateTasks = true) {
    e && e.preventDefault();
    const eObj = {
      target: {name: 'deselect-all'},
      stopPropagation: () => {
      },
      preventDefault: () => {
      }
    };
    if (this.equipmentFilterInstance) {
      this.equipmentFilterInstance.handleClick(eObj, updateTasks);
    }
    if (this.entityFilterInstance) {
      this.entityFilterInstance.handleClick(eObj, updateTasks);
    }
    if (this.statusFilterInstance) {
      this.statusFilterInstance.handleClick(eObj, updateTasks);
    }
    if (this.typeFilterInstance) {
      this.typeFilterInstance.handleClick(eObj, updateTasks);
    }
    if (this.groupsFilter) {
      this.groupsFilter.handleClick(eObj, updateTasks);
    }
    if (this.templateFilterInstance) {
      this.templateFilterInstance.handleClick(eObj, updateTasks);
    }
    if (this.entityRoleInstance) {
      this.entityRoleInstance.handleClick(eObj, updateTasks);
    }

    this.setState({
      confirmationStatusFilter: null
    }, () => {
      updateTasks && this.applyFilters(false)
    });
  }

  entityFilterChanged(selectedEntities) {
    let filter_entity_ids = this.state.filter_entity_ids;
    if (selectedEntities.length === 0) {
      filter_entity_ids = [];
    }
    this.setState({selectedEntitiesFilter: selectedEntities.map(item => item.id), filter_entity_ids}, () => {
      if (selectedEntities.length === 0) {
        this.applyFilters(true);
      }
    });
  }

  equipmentFilterChanged(selectedEquipments) {
    let filter_resource_ids = this.state.filter_resource_ids;
    if (selectedEquipments.length === 0) {
      filter_resource_ids = [];
    }
    this.setState({selectedEquipmentsFilter: selectedEquipments.map(item => item.id), filter_resource_ids}, () => {
      if (selectedEquipments.length === 0) {
        this.applyFilters(true);
      }
    });
  }

  statusFilterChanged(selectedStatuses) {
    let filter_statuses = this.state.filter_statuses;
    if (selectedStatuses.length === 0) {
      filter_statuses = [];
    }
    this.setState({
      selectedTaskFilter: selectedStatuses.map(item => item.title ? item.title : item.id),
      filter_statuses
    }, () => {
      if (selectedStatuses.length === 0) {
        this.applyFilters(true);
      }
    });
  }

  typeFilterChanged(selectedElements) {
    this.setState({selectedTypeEntitiesFilter: selectedElements.map(item => item.id)});
  }

  roleFilterChanged(selectedElements) {
    this.setState({selectedEntityRoleFilter: selectedElements})
  }

  groupsFilterChanged(selectedGroups) {
    let filter_group_ids = this.state.filter_group_ids;
    if (selectedGroups.length === 0) {
      filter_group_ids = [];
    }
    this.setState({
      selectedGroupsFilter: selectedGroups.map(group => group.id), filter_group_ids
    }, () => {
      if (selectedGroups.length === 0) {
        this.applyFilters(true);
      }
    });
  }

  templateFilterChanged(selectedTemplates) {
    let filter_templates = this.state.filter_templates;
    if (selectedTemplates.length === 0) {
      filter_templates = [];
    }
    this.setState({
      selectedTemplatesFilter: selectedTemplates.map(group => group.id), filter_templates
    }, () => {
      if (selectedTemplates.length === 0) {
        this.applyFilters(true);
      }
    });
  }

  getDefaultDates(view) {
    let start_date = this.initializeDate();
    let end_date = this.initializeDate();
    return {
      start_date,
      end_date
    }
  }

  viewChanged(view) {
    if (this.state.view === view) {
      return;
    }
    this.clearAllFilters(null, false);
    this.props.mediaPrint(view === 'list');
    const previousViewType = (this.cookies && this.cookies.get('calenderViewType')) && this.cookies.get('calenderViewType');
    let newViews = null;
    let {start_date, end_date} = this.getDefaultDates(view);
    // If View Type is day then preserve date in all views else if last view and next view are not team then also
    // preserve date else change to current date.
    if (previousViewType === 'day') {
      start_date = this.state.date;
      end_date = this.state.end_date;
    } else if (view !== 'team' && this.state.view !== 'team') {
      start_date = this.state.date;
      end_date = this.state.end_date;
    }

    this.cookies.set('calenderView', view);

    if (view == 'tasks') {
      newViews = {
        view: 'tasks',
        viewType: (this.cookies && this.cookies.get('calenderViewType')) ? this.cookies.get('calenderViewType') : 'week',
        date: start_date,
        end_date: end_date,
        page: 1,
        items_per_page: 100,
        selectedEntitiesFilter: [],
        selectedTaskFilter: [],
        selectedEquipmentsFilter: [],
        task_ids: [],
        showEntitiesWarning: false,
        showEquipmentsWarning: false,

      };
    } else if (view == 'team') {
      newViews = {
        view: 'team',
        viewType: 'day',
        date: start_date,
        end_date: end_date,
        page: 1,
        items_per_page: 100,
        task_ids: [],
        showEntitiesWarning: false,
        showEquipmentsWarning: false,

      };
    } else if (view == 'list') {
      this.getDefaultDates();
      newViews = {
        view: 'list',
        viewType: (this.cookies && this.cookies.get('calenderViewType')) ? this.cookies.get('calenderViewType') : 'day',
        date: start_date,
        end_date: end_date,
        page: 1,
        selectedEntitiesFilter: [],
        selectedEquipmentsFilter: [],
        selectedTaskFilter: [],
        task_ids: [],
        showEntitiesWarning: false,
        showEquipmentsWarning: false,

      }
    } else if (view == 'unscheduled') {
      this.getDefaultDates();
      newViews = {
        view: 'unscheduled',
        viewType: (this.cookies && this.cookies.get('calenderViewType')) ? this.cookies.get('calenderViewType') : 'day',
        date: start_date,
        end_date: end_date,
        page: 1,
        selectedEntitiesFilter: [],
        selectedEquipmentsFilter: [],
        selectedTaskFilter: [],
        task_ids: [],
        showEntitiesWarning: false,
        showEquipmentsWarning: false,

      }
    }

    this.setState({
        ...newViews,
        events: [],
        showFilters: false,
        applyFilters: false,
        filter_entity_ids: [],
        filter_resource_ids: [],
        filter_group_ids: [],
        filter_statuses: [],
        filter_templates: [],
        filter_entity_confirmation_status: '',
        selectedEntitiesFilter: [],
        selectedEquipmentsFilter: [],
        selectedTypeEntitiesFilter: [],
        selectedTemplatesFilter: [],
        selectedTaskFilter: [],
        selectedGroupsFilter: [],
      },
      () => this.updateTaskList(true)
    );
  }

  previousCalendarHandler() {
    let date = moment(this.state.date);
    let end_date = moment(this.state.end_date);
    if (this.state.viewType === 'day') {
      date = date.subtract(1, 'days');
      end_date = end_date.subtract(1, 'days');
    } else if (this.state.viewType === 'week') {
      date = date.subtract(1, 'week');
      end_date = end_date.subtract(1, 'week');
    } else if (this.state.viewType === 'month') {
      date = date.subtract(1, 'months');
      end_date = end_date.subtract(1, 'months');
    }
    date = date.toDate();
    end_date = end_date.toDate();
    this.setState({
        date, end_date, page: 1
      },
      () => this.updateTaskList(true));
  }

  nextCalendarHandler() {
    let date = moment(this.state.date);
    let end_date = moment(this.state.end_date);
    if (this.state.viewType === 'day') {
      date = date.add(1, 'days');
      end_date = end_date.add(1, 'days');
    } else if (this.state.viewType === 'week') {
      date = date.add(1, 'week');
      end_date = end_date.add(1, 'week');
    } else if (this.state.viewType === 'month') {
      date = date.add(1, 'months');
      end_date = end_date.add(1, 'months');
    }
    date = date.toDate();
    end_date = end_date.toDate();
    this.setState({
        date, end_date, page: 1
      },
      () => this.updateTaskList(true));
  }


  viewTypeChanged(viewType) {
    this.cookies.set('calenderViewType', viewType);
    this.setState({viewType, page: 1},
      () => this.updateTaskList(true)
    );
  }

  importModalHide() {
    this.setState({importModal: false});
  }

  exportModalHide() {
    this.setState({exportModal: false});
  }

  hexToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }


  computeTextColor(r, g, b, simple) {
    if (simple) {
      return ((r * 0.299 + g * 0.587 + b * 0.114) > 186) ?
        '#000000' : '#ffffff';
    } // else complex formula
    var uicolors = [r / 255, g / 255, b / 255];
    var c = uicolors.map((c) => {
      if (c <= 0.03928) {
        return c / 12.92;
      } else {
        return Math.pow((c + 0.055) / 1.055, 2.4);
      }
    });

    var L = 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];

    return (L > 0.179) ? '#000000' : '#ffffff';
  }

  eventPropsGetter(event, start, end, isSelected) {
    let offset = 0;

    //TODO: REMOVE THIS HACK ONCE THIS ISSUE IS FIXED
    //https://github.com/intljusticemission/react-big-calendar/issues/512
    if (this.state.viewType === 'day') {
      const result = this.state.events.filter(function (obj) {
        if (!obj.start_datetime || !event.start_datetime) {
          return false;
        }

        const date1 = new Date(obj.start_datetime);
        const date2 = new Date(event.start_datetime);

        return date1.getDay() === date2.getDay() && date1.getMonth() === date2.getMonth()
          && date1.getHours() === date2.getHours() && date1.getMinutes() === date2.getMinutes();
      });
      offset = result.indexOf(event);

      if (offset === -1) {
        offset = 0;
      }
    }

    const offsetToGive = offset * 20;
    const zIndex = (50 * offset) + 50;
    let styleObj;
    if (event.template_type === 'TASK') {
      styleObj = {
        backgroundColor: '#0693E3',
        marginLeft: offsetToGive,
        zIndex: zIndex
      };
    } else {
      styleObj = {
        backgroundColor: '#FFFFF3',
        marginLeft: event.allDay ? '0px' : offsetToGive,
        zIndex: zIndex
      };
    }
    const backgroundColor = event.extra_fields && event.extra_fields.task_color ? event.extra_fields.task_color : '#0693e3';
    let bg_color_rgb = hextToRGBA(backgroundColor, 1);
    if (event.status === 'COMPLETE' || event.status === 'AUTO_COMPLETE') {
      bg_color_rgb = hextToRGBA(backgroundColor, 0.5);
    }
    if (event.template_type === 'TASK') {
      styleObj.backgroundColor = bg_color_rgb;

      const rgbForTextColor = hexToRgb(backgroundColor);

      const text_color = computeTextColor(rgbForTextColor.r, rgbForTextColor.g, rgbForTextColor.b, true);

      styleObj.color = text_color;
    } else {
      styleObj.color = 'rgb(73, 73, 71)';

    }

    return {
      className: '',
      style: styleObj
    };
  }

  renderSelectedFilters(showAll = false) {
    let selectedFilters = [];
    this.state.selectedGroupsFilter.map((group) => {
      const filterIndex = this.props.groups.findIndex((el) => {
        return group ? el.id === group : el.is_implicit;
      });
      if (filterIndex !== -1) {
        selectedFilters.push(this.props.groups[filterIndex].name);
      } else if (this.state.filtersData && this.state.filtersData.groups) {
        const index = this.state.filtersData.groups.findIndex((el) => {
          return el.id === group;
        });
        if (index !== -1) {
          selectedFilters.push(this.state.filtersData.groups[index].name);
        }
      }
    });
    this.state.selectedTemplatesFilter.map((template) => {
      const filterIndex = this.state.templates.findIndex((el) => {
        return el.id === template;
      });
      if (filterIndex !== -1) {
        selectedFilters.push(this.state.templates[filterIndex].name);
      }
    });
    this.state.selectedEntitiesFilter.map((entity) => {
      const filterIndex = this.state.entities.findIndex((el) => {
        return el.id === entity;
      });
      if (filterIndex !== -1) {
        selectedFilters.push(this.state.entities[filterIndex].name);
      } else if (this.state.filtersData && this.state.filtersData.entities) {
        const index = this.state.filtersData.entities.findIndex((el) => {
          return el.id === entity;
        });
        if (index !== -1) {
          selectedFilters.push(this.state.filtersData.entities[index].name);
        }
      }
    });
    this.state.selectedEquipmentsFilter.map((equipment) => {
      const filterIndex = this.state.equipments.findIndex((el) => {
        return el.id === equipment;
      });
      if (filterIndex !== -1) {
        selectedFilters.push(this.state.equipments[filterIndex].name);
      } else if (this.state.filtersData && this.state.filtersData.equipments) {
        const index = this.state.filtersData.equipments.findIndex((el) => {
          return el.id === equipment;
        });
        if (index !== -1) {
          selectedFilters.push(this.state.filtersData.equipments[index].name);
        }
      }
    });
    this.state.selectedTypeEntitiesFilter.map((entityType) => {
      const filterIndex = this.state.entityTypes.findIndex((el) => {
        return el.id === entityType;
      });
      if (filterIndex !== -1) {
        selectedFilters.push(this.state.entityTypes[filterIndex].name);
      }
    });
    this.state.confirmationStatusFilter && selectedFilters.push(
      (this.state.confirmationStatusFilter === '' && 'Show All') ||
      (this.state.confirmationStatusFilter === 'REJECTED' && 'Show rejected') ||
      (this.state.confirmationStatusFilter === 'UN_RESPONDED' && 'Show unresponded') ||
      (this.state.confirmationStatusFilter === 'PARTIALLY_ACCEPTED' && 'Show partially accepted') ||
      (this.state.confirmationStatusFilter === 'ACCEPTED' && 'Show accepted'));
    selectedFilters = selectedFilters.concat(this.state.selectedTaskFilter);
    if (showAll) {
      return selectedFilters.map((filter) => {
        return (
          <span className={styles.filtersTag}>
						{filter}
					</span>
        );
      });
    } else {
      return (
        <div>
					<span className={styles.filtersTagSm}>
						{selectedFilters[0]}
					</span>
          {selectedFilters.length > 1 &&
          <span className={styles.filtersTagSm}>
						+ {selectedFilters.length - 1}
					</span>
          }
        </div>
      );
    }
  }

  applyFilters(applyFilters, e) {
    e && e.preventDefault();
    e && e.stopPropagation();
    const filter_entity_ids = this.state.selectedEntitiesFilter.length < this.state.entities.length ? this.state.selectedEntitiesFilter : [];
    const filter_resource_ids = this.state.selectedEquipmentsFilter.length < this.state.equipments.length ? this.state.selectedEquipmentsFilter : [];
    const filter_group_ids = this.props.groups && this.state.selectedGroupsFilter.length < this.props.groups.length ? this.state.selectedGroupsFilter : [];
    const filter_statuses = this.state.selectedTaskFilter.length < this.state.filterStatuses.length ? this.state.selectedTaskFilter : [];
    const filter_templates = this.state.selectedTemplatesFilter.length < this.state.templates.length ? this.state.selectedTemplatesFilter : [];
    const filter_entity_confirmation_status = this.state.confirmationStatusFilter;
    this.setState({
      filter_entity_ids,
      filter_resource_ids,
      filter_group_ids,
      filter_statuses,
      filter_entity_confirmation_status,
      filter_templates,
      applyFilters
    }, () => this.updateTaskList(false, false, null, true));
  }

  getAjaxCall(call) {
    this.callInProgress = call;
  }

  getUnscheduledAjaxCall(call) {
    this.unscheduledCallInProgress = call;
  }

  getUnscheduledWithoutDateTimeAjaxCall(call) {
    this.unscheduledWithoutDateTimeCallInProgress = call;
  }

  updateTaskList(resetTimeout, blockingUpdate = false, postProcess = null, getTasksOnly = false) {
    if (this.state.timer && resetTimeout && !getTasksOnly) {
      clearTimeout(this.state.timer);
    }

    if (this.callInProgress && this.callInProgress.state() === 'pending') {
      this.callInProgress.abort();
    }
    if (this.unscheduledWithoutDateTimeCallInProgress && this.unscheduledWithoutDateTimeCallInProgress.state() === 'pending') {
      this.unscheduledWithoutDateTimeCallInProgress.abort();
    }
    if (this.unscheduledCallInProgress && this.unscheduledCallInProgress.state() === 'pending') {
      this.unscheduledCallInProgress.abort();
    }

    let getDataForExtraDaysOnBoundary = true;
    if (this.state.view === 'list' || this.state.view === 'unscheduled') {
      getDataForExtraDaysOnBoundary = false;
    }
    let startDate = moment(this.state.date);
    let endDate = moment(this.state.end_date);
    if (this.state.viewType === 'month') {
      startDate = startDate.startOf('month');
      endDate = endDate.endOf('month');
      getDataForExtraDaysOnBoundary = false;
    } else if (this.state.viewType === 'week') {
      startDate = startDate.startOf('week');
      endDate = moment(endDate).endOf('week');
    } else {
      startDate = startDate.startOf('day');
      endDate = moment(endDate).endOf('day');
    }

    const resource_ids = (this.state.applyFilters && this.state.filter_resource_ids) ? this.state.filter_resource_ids.join(',') : '';
    const entity_ids = (this.state.applyFilters && this.state.filter_entity_ids) ? this.state.filter_entity_ids.join(',') : '';
    const group_ids = (this.state.applyFilters && this.state.filter_group_ids) ? this.state.filter_group_ids.join(',') : '';
    const statuses = (this.state.applyFilters && this.state.filter_statuses) ? this.state.filter_statuses.join(',') : '';
    const templates = (this.state.applyFilters && this.state.filter_templates) ? this.state.filter_templates.join(',') : '';
    const entity_confirmation_status = (this.state.applyFilters && this.state.filter_entity_confirmation_status) ? this.state.filter_entity_confirmation_status : '';


    if (!this.state.showModal && !this.state.importModal && !this.state.showTeamEquipmentForm) {
      setTimeout(() => {
        this.setState({loadingTask: true, blockingUpdate, showSpinner: true});

        const promises = [];

          promises.push(this.props.getTasks({
              viewType: this.state.viewType,
              startDate,
              endDate,
              items_per_page: this.state.items_per_page,
              page: this.state.page,
              unscheduled: false,
              tasks_with_no_datetime: false,
              getDataForExtraDaysOnBoundary,
              group_ids,
              entity_ids,
              resource_ids,
              statuses,
              entity_confirmation_status,
              templates,
              getAjaxCall: this.getAjaxCall
            }).then((serverEvents) => {
              const events = JSON.parse(serverEvents).map((task) => {
                task.start = moment.utc(task.start_datetime).toDate();
                task.end = (task.end_datetime && task.end_datetime !== '') ? moment.utc(task.end_datetime).toDate() : moment.utc(task.start_datetime).add(1, 'hours').toDate();
                return task;
              });
              this.setState({events});
            })
          );

          promises.push(this.props.getTasks({
              viewType: this.state.viewType,
              startDate,
              endDate,
              items_per_page: this.state.items_per_page,
              page: this.state.page,
              unscheduled: true,
              tasks_with_no_datetime: false,
              getDataForExtraDaysOnBoundary,
              group_ids,
              entity_ids,
              resource_ids,
              statuses,
              entity_confirmation_status,
              templates,
              getAjaxCall: this.getUnscheduledAjaxCall

            }).then((events) => {
              const unscheduledEvents = JSON.parse(events).map((task) => {
                task.start = moment.utc(task.start_datetime).toDate();
                task.end = (task.end_datetime && task.end_datetime !== '') ? moment.utc(task.end_datetime).toDate() : moment.utc(task.start_datetime).add(1, 'hours').toDate();
                return task;
              });

              this.setState({unscheduledEvents, unscheduledEventsCount: unscheduledEvents.length});
            })
          );

        if (this.state.view === 'unscheduled') {
          promises.push(this.props.getTasks({
              viewType: this.state.viewType,
              startDate,
              endDate,
              items_per_page: this.state.items_per_page,
              page: this.state.page,
              unscheduled: true,
              tasks_with_no_datetime: true,
              getDataForExtraDaysOnBoundary,
              getAjaxCall: this.getUnscheduledWithoutDateTimeAjaxCall
            }).then((events) => {
              const unscheduledEventsWithoutDate = JSON.parse(events).map((task) => {
                task.start_datetime = '';
                task.end_datetime = '';
                return task;
              });

              this.setState({
                unscheduledEventsWithoutDate,
                unscheduledEventsWithoutDateCount: unscheduledEventsWithoutDate.length
              });
            })
          );
        }
        Promise.all(promises).then(() => {
          this.setState({
            loadingTask: false,
            blockingUpdate: false,
            showSpinner: false,
            internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
          }, () => {
            return postProcess ? postProcess() : null;
          });
        }).catch((err) => {
          if (err.status === 0 && err.statusText === 'error') {
            this.setState({
              internetIssue: true,
              loadingTask: false,
              showSpinner: false,
              blockingUpdate: false
            });
          }
        });
        if (this.props.getExternalIntegrations)
          this.props.getExternalIntegrations();

        const timer = !getTasksOnly && setTimeout(() => {
          this.updateTaskList();
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
      }, 200);
    }
  }

  changeHours() {
    this.setState({
      showBusinessHours: !this.state.showBusinessHours
    });
  }

  updateFiltersData(key, value) {
    let filtersData = this.state.filtersData;
    if (!filtersData) {
      filtersData = {};
    }
    if (!filtersData[key]) {
      filtersData[key] = value;
      this.setState({filtersData});
      return;
    }
    let singleFilterData = filtersData[key];
    value && value.map((singleData) => {
      if (!singleFilterData.find((el) => {
          return el.id === singleData.id
        }) &&
        (key === 'groups' && (!this.props[key] || !this.props[key].find((el) => {
          return el.id === singleData.id
        }))) &&
        ((key === 'entities' || key === 'equipments') && (!this.state[key] || !this.state[key].find((el) => {
          return el.id === singleData.id
        })))) {
        singleFilterData.push(singleData);
      }
    });
    filtersData[key] = singleFilterData;
    this.setState({filtersData});
  }

  handleEventContent(event) {
    let title = '';
    if (this.state.viewType === 'day') {
      const members = this.state.entities.filter(e => event.entity_ids.some(id => id === e.id)).map(en => en.name);
      title = `${event.title}
      ${event.customer_address ? event.customer_address : ''}
      ${members.length > 0 ? members.join(', ') : (event.template_type.toUpperCase() === 'TASK' ? 'Unassigned' : '')}

      ${event.details ? event.details.substring(0, 150) + '...' : ''}`;

    } else {
      title = event.title;
    }

    if (event.series_id) {
      title = title + "\n↺";
    }

    return title;
  }

  onSelectEmptySlot(slotInfo) {
    let duration = '30 mins';
    if (this.state.viewType === 'month') {
      const returnedEndDate = moment(slotInfo.end).add('30', 'minutes'); // Add at least 30 minutes difference in start and end time on (month view) slot selection
      this.open(slotInfo.start, returnedEndDate, false, false, duration);
    } else {
      if (slotInfo.start !== slotInfo.end) {
        this.open(slotInfo.start, slotInfo.end, false, false, duration);
      } else {
        this.open(slotInfo.start, moment(slotInfo.end).add('1', 'days'), false, false, '24 hrs');
      }
    }
  }

  paginationPrevClicked() {
    this.setState({
      loadingTask: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum - 1;
    if (localPageNum > 1) {
      this.setState({
          page: newPage,
        },
        () => this.updateTaskList(true));
    } else {
      this.setState({
          page: 1,
        },
        () => this.updateTaskList(true));
    }
  }

  paginationNextClicked() {
    this.setState({
      loadingTask: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum + 1;
    this.setState({
        page: newPage,
      },
      () => this.updateTaskList(true));
  }

  collapseFilter() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }

  createToastNotification(notification) {
    toast(notification.text, notification.options);
  }

  toggleFilters() {
    this.setState({
      showFilters: !this.state.showFilters
    })
  }

  getStartOfWeek() {
    if (!this.props.profile || !this.props.profile.calendar_week_starts_from || this.props.profile.calendar_week_starts_from.toUpperCase() === 'SUNDAY') {
      return 0;
    } else if (this.props.profile.calendar_week_starts_from.toUpperCase() === 'MONDAY') {
      return 1;
    } else if (this.props.profile.calendar_week_starts_from.toUpperCase() === 'TUESDAY') {
      return 2;
    } else if (this.props.profile.calendar_week_starts_from.toUpperCase() === 'WEDNESDAY') {
      return 3;
    } else if (this.props.profile.calendar_week_starts_from.toUpperCase() === 'THURSDAY') {
      return 4;
    } else if (this.props.profile.calendar_week_starts_from.toUpperCase() === 'FRIDAY') {
      return 5;
    } else if (this.props.profile.calendar_week_starts_from.toUpperCase() === 'SATURDAY') {
      return 6;
    } else {
      return 0;
    }
  }

  render() {
    this.can_create = false;
    this.canTriggerExternalIntegrationDataFetch = false;
    this.can_view_team_equipment = false;
    this.can_view_unscheduled_tasks = false;
    this.can_view_filters = false;
    this.can_view_group_filter = false;
    if (this.props.groups !== null && typeof this.props.groups !== 'undefined' && this.props.groups.length > 0) {
      const defaultGroup = this.props.groups.find((group) => {
        return group.is_implicit;
      });
      if (defaultGroup && this.props.groups.length > 1) {
        this.can_view_group_filter = true;
      } else if (!defaultGroup) {
        this.can_view_group_filter = true
      }
    }
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY')) is_company = true;
      if (is_company || permissions.includes('ADD_TASK')) this.can_create = true;
      if (is_company || permissions.includes('TRIGGER_EXTERNAL_INTEGRATION_DATA_FETCH')) this.canTriggerExternalIntegrationDataFetch = true;
      if (is_company || permissions.includes('VIEW_ALL_TASKS')) {
        this.can_view_unscheduled_tasks = true;
        this.can_view_team_equipment = true;
        this.can_view_filters = true;
      }
    }

    const formats = {
      dayRangeHeaderFormat(_ref3, culture, local) {
        let start = _ref3.start;
        let end = _ref3.end;
        return local.format(start, 'D MMM YYYY', culture) + ' - ' + local.format(end, 'D MMM YYYY', culture);
      },

      dayHeaderFormat(date, culture, local) {
        return local.format(date, 'D MMM YYYY', culture);
      },

      dayFormat(date, culture, local) {
        return local.format(date, 'ddd MM/DD', culture);
      },
    };

    let filteredEvents = this.state.events;
    let scheduledAndUnscheduledTaskWithDateTime = [...this.state.unscheduledEvents,...filteredEvents];
    // scheduledAndUnscheduledTaskWithDateTime = scheduledAndUnscheduledTaskWithDateTime.sort((a, b) => (a.start_datetime > b.start_datetime) ? 1 : -1);
    // scheduledAndUnscheduledTaskWithDateTime = scheduledAndUnscheduledTaskWithDateTime.map((task)=>{
    //
    // })

    // if (this.state.selectedTaskFilter.length === 0 ||
    //   this.state.selectedTaskFilter.indexOf('All') >= 0) {
    //   filteredEvents = this.state.events;
    // } else {
    //   filteredEvents = this.state.events
    //     .filter(task =>
    //       this.state.selectedTaskFilter.some(taskFilter => (task.status_title !== null ? taskFilter.toUpperCase() === task.status_title.toUpperCase() : taskFilter.toUpperCase() === task.status.toUpperCase()))
    //     );
    // }
    //
    // if (this.state.selectedEntitiesFilter.length > 0 ||
    //     this.state.selectedEquipmentsFilter.length > 0) {
    //   filteredEvents = filteredEvents
    //     .filter(event =>
    //       event.resource_ids.some(id => this.state.selectedEquipmentsFilter.indexOf(id) >= 0) ||
    //       this.state.selectedEntitiesFilter.length > 0 &&
    //       event.entity_ids.some(id => this.state.selectedEntitiesFilter.indexOf(id) >= 0) ||
    //       (event.entity_ids.length === 0 && this.state.selectedEntitiesFilter.indexOf(-1) >= 0));
    // }
    //
    // if (this.state.confirmationStatusFilter !== null) {
    //   filteredEvents = this.taskConfirmationStatusFiltersChanged();
    // }
    //
    // if (this.state.selectedGroupsFilter.length > 0) {
    //   filteredEvents = filteredEvents.filter (eve => {
    //     return this.state.selectedGroupsFilter.indexOf(eve.group_id) >= 0;
    //   })
    // }

    const tooltip = (
      <Tooltip id="tooltip">Unscheduled tasks are only displayed in the 'Unscheduled Tasks' tab. Once they are marked as
        scheduled they will be moved over to other tabs and removed from 'Unscheduled Tasks'</Tooltip>
    );

    const tooltipCustomDates = (
      <Tooltip id="tooltip">Select custom dates</Tooltip>
    );

    let prevDisabled = false;
    let nextDisabled = false;
    if (this.state.page === 1) {
      prevDisabled = true;
    }
    if (this.state.view !== 'unscheduled') {
      if (this.state.events.length < this.state.items_per_page) {
        nextDisabled = true;
      }
    } else if (this.state.view === 'unscheduled') {
      if (this.state.unscheduledEvents.length < this.state.items_per_page || this.state.unscheduledEventsWithoutDate.length < this.state.items_per_page) {
        nextDisabled = true;
      }
    }

    let showClearAllButton = false;
    if (this.state.selectedTaskFilter.length > 0 || this.state.selectedEquipmentsFilter.length > 0 || this.state.selectedEntitiesFilter.length > 0 ||
      this.state.selectedGroupsFilter.length > 0 || this.state.selectedTypeEntitiesFilter.length > 0 || this.state.confirmationStatusFilter || this.state.selectedTemplatesFilter.length > 0) {
      showClearAllButton = true;
    }

    let entities = this.state.entities || [];
    if (this.state.filtersData && this.state.filtersData.entities) {
      entities.push.apply(entities, this.state.filtersData.entities);
    }
    let equipments = this.state.equipments || [];
    if (this.state.filtersData && this.state.filtersData.equipments) {
      equipments.push.apply(equipments, this.state.filtersData.equipments);
    }
    let groups = this.props.groups || [];
    if (this.state.filtersData && this.state.filtersData.groups) {
      groups.push.apply(groups, this.state.filtersData.groups);
    }
    moment.locale('ko', {
      week: {
        dow: this.getStartOfWeek(),
      },
    });
    const localizer = BigCalendar.momentLocalizer(moment);
    let arrow = <svg xmlns="http://www.w3.org/2000/svg" width="13.657" height="13.657" viewBox="0 0 13.657 13.657"><path d="M-90.024,11.657a.908.908,0,0,1-.675-.3.908.908,0,0,1-.3-.675V2.911A.911.911,0,0,1-90.09,2a.911.911,0,0,1,.911.911V9.836h6.925a.911.911,0,0,1,.911.911.911.911,0,0,1-.911.91Z" transform="translate(-58.932 -49.276) rotate(-135)" fill="currentColor"/></svg>



    return (
      <Grid className={cx(styles.wrapper)}>
        <style type="text/css">
          {'.' + styles.noPrint + '{display: inherit;}'}
        </style>
        <style type="text/css" media="print">
          {'.' + styles.noPrint + '{ display:none}'}
          {'.' + styles.wrapper + '{ padding:0}'}
          {'.' + styles.topBar + '{ display:none}'}
          {'.' + styles['control-tasks'] + '{ display:none}'}
        </style>
        <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => {
          this.props.activityStreamStateChangeHandler(activityStreamStateHandler)
        }}/>
        <div className={cx(this.state.view === 'list' && styles.noPrint)}>
          <ErrorAlert errorText="No internet connection" showError={this.state.internetIssue}/>
        </div>
        <ToastContainer className={cx(styles.toastContainer, styles.noPrint)}
                        toastClassName={cx(styles.toast, styles.noPrint)} autoClose={1}/>
        <div className={cx(styles.topBar, this.state.view === 'list' && styles.noPrint)}>
          <Row className={styles.topBar}>
            <Col md={6} sm={9} xs={this.state.view === 'unscheduled' ? 10 : 12}
                 lg={this.state.view === 'unscheduled' ? 12 : 6}>
              <div>
                <ul className={styles['view-sidebar'] + ' list-inline'}>
                  <li className={this.state.view === 'tasks' ? styles['active'] : ''}>
                    <a onClick={this.viewChanged.bind(this, 'tasks')}>Calendar</a>
                  </li>
                  {this.can_view_team_equipment &&
                  <li className={this.state.view === 'team' ? styles['active'] : ''}>
                    <a onClick={this.viewChanged.bind(this, 'team')}>Team and Equipment</a>
                  </li>
                  }
                  <li className={this.state.view === 'list' ? styles['active'] : ''}>
                    <a onClick={this.viewChanged.bind(this, 'list')}>List</a>
                  </li>
                  {this.can_view_unscheduled_tasks &&
                  <li className={this.state.view === 'unscheduled' ? styles['active'] : ''}>
                    <a onClick={this.viewChanged.bind(this, 'unscheduled')}>Unscheduled</a>
                  </li>
                  }
                </ul>
              </div>
            </Col>
            {(!this.can_view_filters || this.state.view === 'unscheduled') &&
            <Col lg={1} md={1} sm={1} xs={1} className={styles.unscheduledActivityBtn}>
              <div className={styles.activityStreamBtnContainerUnscheduled}>
                <ActivityStreamButtonV2 activityStreamStateHandler={this.props.activityStreamStateHandler}/>
              </div>
            </Col>}
            {this.can_view_filters && this.state.view !== 'unscheduled' && <Col lg={6} md={6} sm={3} xs={12}>
              <div className={styles.filtersSwitcherContainer}>
                <button onClick={() => this.toggleFilters()} type="button">
                  <span className={styles.filtersSwitcherIcon}>
                    <FontAwesomeIcon icon={faSlidersH} />
                  </span>
                  <span className={styles.filtersSwitcherLabel}>Filters</span>
                </button>
                {showClearAllButton &&
                this.renderSelectedFilters(false)
                }
                {showClearAllButton &&
                <span className={styles.clearAllFiltersBtn}>
                  <button onClick={(e) => this.clearAllFilters(e) } type="button">Clear all</button>
                </span>
                }
                <div className={cx(styles.filtersContainer, this.state.showFilters && styles.filtersContainerVisible)}>
                  <div className={styles.filtersDropDownsContainer}>
                    {this.props.companyProfile.enable_team_confirmation &&
                    <div
                      className={cx(styles.teamDropdown, styles.taskConfirmationFiltersDropdown, styles.filterDropdown)}>
                      <FormControl onChange={(e) => this.handleConfirmationFilterChange(e)} componentClass="select">
                        <option selected={this.state.confirmationStatusFilter === ''} value="">Show all</option>
                        <option selected={this.state.confirmationStatusFilter === 'ACCEPTED'} value="ACCEPTED">Show
                          accepted
                        </option>
                        <option selected={this.state.confirmationStatusFilter === 'REJECTED'} value="REJECTED">Show
                          rejected
                        </option>
                        <option selected={this.state.confirmationStatusFilter === 'UN_RESPONDED'}
                                value="UN_RESPONDED">Show unresponded
                        </option>
                        <option selected={this.state.confirmationStatusFilter === 'PARTIALLY_ACCEPTED'}
                                value="PARTIALLY_ACCEPTED">Show partially accepted
                        </option>
                      </FormControl>
                    </div>}
                    <div className={styles.filterDropdown}>
                      <DropdownFilter
                        name="templateFilter"
                        ref={instance => {
                          this.templateFilterInstance = instance;
                        }}
                        data={this.state.templates}
                        handleChange={this.templateFilterChanged}
                        title="Template"
                        searchable
                        minWidth="100px"
                      />
                    </div>
                    {this.can_view_group_filter &&
                    <div className={styles.filterDropdown}>
                      <DropdownFilter
                        name="groupFilter"
                        ref={instance => {
                          this.groupsFilter = instance;
                        }}
                        data={groups}
                        handleChange={this.groupsFilterChanged}
                        title="Groups"
                        searchable
                        minWidth="100px"
                        searchCall={searchGroups}
                        addNewData={(data) => this.updateFiltersData('groups', data)}
                      />
                    </div>
                    }
                    <div className={styles.filterDropdown}>
                      <DropdownFilter
                        name="statusFilter"
                        ref={instance => {
                          this.statusFilterInstance = instance;
                        }}
                        data={this.state.filterStatuses}
                        handleChange={this.statusFilterChanged}
                        title="Status"
                        searchable
                        minWidth="100px"
                      />
                    </div>
                    {this.state.equipments && this.state.equipments.length > 0 &&
                    <div className={styles.filterDropdown}>
                      <DropdownFilter
                        name="equipmentFilter"
                        ref={instance => {
                          this.equipmentFilterInstance = instance;
                        }}
                        data={equipments}
                        handleChange={this.equipmentFilterChanged}
                        title="Equipment"
                        searchable
                        minWidth="100px"
                        searchCall={searchResources}
                        addNewData={(data) => this.updateFiltersData('equipments', data)}
                      />
                    </div>
                    }
                    <div className={styles.filterDropdown}>
                      <DropdownFilter
                        name="entityFilter"
                        ref={instance => {
                          this.entityFilterInstance = instance;
                        }}
                        data={entities}
                        handleChange={this.entityFilterChanged}
                        title="Team"
                        minWidth="100px"
                        searchable
                        searchCall={searchEntities}
                        addNewData={(data) => this.updateFiltersData('entities', data)}
                      />
                    </div>
                    {this.state.view === 'team' &&
                    <div className={styles.filterDropdown}>
                      <DropdownFilter
                        name="typeFilter"
                        data={this.state.entityTypes}
                        ref={instance => {
                          this.typeFilterInstance = instance;
                        }}
                        handleChange={this.typeFilterChanged}
                        title="Position"
                        searchable
                        minWidth="100px"
                      />
                    </div>}
                  </div>
                  {showClearAllButton &&
                  <div className={styles.selectedFiltersContainer}>
                    <div className={styles.selectedFilters}>
                      {this.renderSelectedFilters(true)}
                    </div>
                  </div>
                  }
                  <div className={styles.closeFiltersBtnContainer}>
                    {showClearAllButton &&
                    <span className={styles.clearAllFiltersBtn}>
                      <button onClick={(e) => this.clearAllFilters(e) } type="button">Clear all</button>
                    </span>
                    }
                    {showClearAllButton &&
                    <span className={styles.filterButton}>{this.state.showSpinner ?
                      <SavingSpinner color="#fff" title="" borderStyle="none" size={8}/> :
                      <button onClick={(e) => this.applyFilters(true, e)} type="button">Apply Filters</button>
                    }</span>
                    }
                    <button className={styles.closeFiltersBtn} onClick={() => this.toggleFilters()}>Close</button>
                  </div>
                </div>
              </div>
              <div className={styles.activityStreamBtnContainer}>
                <ActivityStreamButtonV2 activityStreamStateHandler={this.props.activityStreamStateHandler}/>
              </div>
            </Col>}
          </Row>
        </div>
        <div className={cx(styles['control-tasks'], this.state.view === 'list' && styles.noPrint)}>
          {(this.state.view === 'list' || this.state.view === 'unscheduled') &&
          <ButtonGroup className={styles.monthDayWeekFilters}>
            <Button disabled={this.state.viewType === 'day'} value="day" onClick={this.onDayFilterChange}>Day</Button>
            <Button disabled={this.state.viewType === 'week'} value="week" onClick={this.onDayFilterChange}>Week</Button>
            <Button disabled={this.state.viewType === 'month'} value="month" onClick={this.onDayFilterChange}>Month</Button>
          </ButtonGroup>
          }
          {(this.state.view === 'list' || this.state.view === 'unscheduled') &&
          <div className={styles.datePickerWrapper}>
            <i className={cx(styles.arrow, styles.prev)} onClick={() => this.previousCalendarHandler()}>{arrow}</i>
            <DatePicker
              id="start_date" className={cx(styles.startDatePicker)}
              value={moment(this.state.date).local().format()} onChange={this.onChangeDate} showClearButton={false}
              showTodayButton={true}
            />
            <i className={cx(styles.arrow, styles.next)} onClick={() => this.nextCalendarHandler()}>{arrow}</i>
          </div>
          }
          {(this.state.view === 'tasks' || this.state.view === 'team') &&
            <div className={styles.topBarTasksCount}>
              <span
                className={cx(styles.counter, styles.counterTotalTasks)}>Tasks: <span>{this.state.events.length}</span></span>
              {this.can_view_unscheduled_tasks &&
              <OverlayTrigger placement="bottom" overlay={tooltip}>
                <span onClick={this.viewChanged.bind(this, 'unscheduled')}
                      className={cx(styles.counter, styles.counterUnscheduledTasks)}> Unscheduled Tasks: <span>{this.state.unscheduledEventsCount}</span></span>
              </OverlayTrigger>
              }
            </div>
            }
            <div className={styles.mobileBreaker}/>
            {(!((this.state.loadingTask || this.state.loadingEntities || this.state.loadingEquipments) || this.state.loadingTemplates) && (this.state.events.length > 0 || this.state.page > 1)) &&
            <div className={styles.pagination}>
              <ul>
                {this.state.view !== 'unscheduled' &&
                <li className={cx(styles.count)}>
                  {this.state.loadingTask || this.state.events.length < 1 ?
                    <span>{this.state.events.length}</span> :
                    <span>{((this.state.page - 1) * this.state.items_per_page) + 1} - {(this.state.page * this.state.items_per_page) - (this.state.items_per_page - this.state.events.length)}</span>
                  }
                </li>
                }
                {this.state.view === 'unscheduled' &&
                <li className={cx(styles.count)}>
                 {this.state.loadingTask || (this.state.unscheduledEvents.length + this.state.unscheduledEventsWithoutDate.length) < 1 ?
                   <span>{this.state.unscheduledEvents.length + this.state.unscheduledEventsWithoutDate.length}</span> :
                   <span>{((this.state.page - 1) * this.state.items_per_page) + 1} - {(this.state.page * this.state.items_per_page) - (this.state.items_per_page - (this.state.unscheduledEvents.length + this.state.unscheduledEventsWithoutDate.length))}</span>
                 }
                </li>
                }
                <li>
                  <button disabled={prevDisabled} className={cx(styles.prev, prevDisabled && 'disabled', this.state.loadingTask && styles.pendingAction)} onClick={() => this.paginationPrevClicked()}>{arrow}</button>
                </li>
                <li>
                  <button disabled={nextDisabled} className={cx(nextDisabled && 'disabled', this.state.loadingTask && styles.pendingAction)} onClick={() => this.paginationNextClicked()}>{arrow}</button>
                </li>
              </ul>
            </div>
            }
            {/*{this.can_create && (this.state.view === 'list' || this.state.view === 'unscheduled') &&*/}
            {/*<div className={styles.teamEquipmentButton}>*/}
            {/*<Button className={cx("btn-submit", styles.btnSubmit)} onClick={this.showAssignTeamEquipment} disabled={this.state.task_ids.length === 0}>*/}
            {/*Assign team/equip*/}
            {/*</Button>*/}
            {/*</div>*/}
            {/*}*/}


          <div className={cx(styles.taskButtonContainer)}>
            <div className={styles.loadingSpinner}>
              <div>
                {((this.state.loadingTask || this.state.loadingEntities || this.state.loadingEquipments) || this.state.loadingTemplates) &&
                <SavingSpinner title="Loading" borderStyle="none" size={8}/>}
              </div>
            </div>

            {this.can_create &&
            <div className={styles.taskActivityButtons}>
              <div className={styles.createTaskBtnContainer}>
                {this.canTriggerExternalIntegrationDataFetch && this.props.externalIntegrations && this.props.externalIntegrations.length > 0 &&
                <SynchronizeNow
                  externalIntegrations={this.props.externalIntegrations}
                  getExternalIntegrations={this.props.getExternalIntegrations}
                  viewType={this.state.viewType}
                  startDate={getStartDateForForSync(this.state.date, this.state.viewType)}
                  endDate={getEndDateForForSync(this.state.date, this.state.viewType)}
                  maxDaysToSync={7}
                  maxDaysErrorMessage={"Synchronize Now will only sync Tasks for a day or a week. Please switch to day or week view to synchronize."}
                />}
                <div>
                  <DropdownButton title={'Create New Task'}>
                    <MenuItem onClick={() => this.createNewTask()}>New Task</MenuItem>
                    <MenuItem onClick={() => this.createNewRecurringTask()}>New Repeating Task</MenuItem>
                    <MenuItem divider/>
                    <MenuItem onClick={() => this.createNewTask(true)}>New Activity</MenuItem>
                  </DropdownButton>
                </div>
              </div>
              <ButtonGroup className={styles.dropdownOptions} right>
                <DropdownButton key="dropdown" id="bg-nested-dropdown" onToggle={e => null}
                                title={<FontAwesomeIcon icon={faEllipsisV}/>}>
                  <MenuItem href="javascript:void (0)">
                    <div onClick={this.props.googleOAuthFlow} style={{ marginLeft: '20px' }}>Import Task</div>
                  </MenuItem>
                  <MenuItem href="javascript:void (0)">
                    <div onClick={this.openExportModal} style={{ marginLeft: '20px' }}>Export Task</div>
                  </MenuItem>
                  {this.state.view === 'list' &&
                  <MenuItem href="javascript:void (0)">
                    <div onClick={this.printList} style={{ marginLeft: '20px' }}>Print List</div>
                  </MenuItem>}
                </DropdownButton>
              </ButtonGroup>
            </div>
            }
          </div>
        </div>

        <TaskImport
          showModal={this.state.importModal}
          onHide={this.importModalHide}
          googleEvents={this.props.googleEvents}
          selectedEvent={this.state.selectedEvent}
          onCancelClick={this.close}
          updateTaskList={this.updateTaskList}
          onSaveClick={(task) => {
            return this.updateTask(task);
          }}
          onDeleteClick={(task) => {
            return this.deleteTask(task);
          }}
          selectedTask={this.state.selectedEvent}
          company_id={this.props.company_id}
          reporter_name={this.props.reporter_name}
          reporter_id={this.props.reporter_id}
          company_url={this.props.company_url}
          getTaskStatus={this.props.getStatus}
          getTaskRatings={this.props.getRatings}
          updateTaskStatus={this.props.setNewStatus}
          getEstimate={this.props.getEstimate}
          getSchedule={this.props.getSchedule}
          getTaskSeriesSettings={this.props.getTaskSeriesSettings}
          statuses={this.state.statuses}
          entities={this.state.entities}
          equipments={this.state.equipments}
          getCustomers={this.props.getCustomers}
          searchCustomers={this.props.searchCustomers}
          createCustomer={this.props.createCustomer}
          extraFieldsOptions={this.props.extraFieldsOptions}
          taskUpdatedCallback={this.taskUpdatedCallback}
          taskAddedCallback={this.taskAddedCallback}
          taskDeletedCallback={this.taskDeletedCallback}
          taskAssigneeUpdatedCallback={this.taskAssigneeUpdatedCallback}
          taskEquipmentUpdatedCallback={this.taskEquipmentUpdatedCallback}
          handleTaskTypeChange={this.handleTaskTypeChange}
          updateTask={this.props.updateTask}
          deleteTask={this.props.deleteTask}
          postTask={this.props.postTask}
          taskSendNotification={this.props.taskSendNotification}
          templates={this.state.templates}
          profile={this.props.profile}
          companyProfile={this.props.companyProfile}
          groups={this.props.groups}
          createToastNotification={this.createToastNotification}
          newEventDate={this.state.newEventDate}
          newEventEndDate={this.state.newEventEndDate}
          newEventIsRecurring={this.state.newEventIsRecurring}
          onCloseTask={this.close}
          unscheduled={this.state.view === 'unscheduled' ? true : false}
          viewType={this.state.view}
          defaultTemplate={this.state.defaultTemplate}
          getTaskState={this.getTaskState}
        />
        <TaskExport
          showModal={this.state.exportModal}
          onHide={this.exportModalHide}
          getTasks={this.props.getTasks}
          getEntities={this.props.getEntities}
          getEquipments={this.props.getEquipments}
          viewType={this.state.viewType}
          view={this.state.view}
          pageNumber={this.state.page}
        />
        {this.state.blockingUpdate &&
        <div className={styles.blockingPlaceHolder}><SavingSpinner title="" borderStyle="none" size={8}/></div>}
        {!this.state.blockingUpdate && this.state.view === 'tasks' &&
        <div>
        <div>
            <div className={styles.calendar}>
              { this.state.showBusinessHours ?
                <BigCalendar
                  localizer={localizer}
                  views={[ 'month', 'week', 'day']}
                  selectable = 'ignoreEvents'
                  formats={formats}
                  onSelectEvent={this.selectEvent}
                  events={scheduledAndUnscheduledTaskWithDateTime.map((el) => {
                    let event = el;
                    event.allDay = el.unscheduled ? true : el.all_day;
                    return event;
                  })}
                  defaultDate={this.state.date}
                  timeslots={2}
                  eventPropGetter={this.eventPropsGetter}
                  titleAccessor={this.handleEventContent}
                  onView={this.viewTypeChanged}
                  onNavigate={this.onNavigate}
                  defaultView={this.state.viewType}
                  min={moment().set('hour', 6).set('minute', 0).toDate()}
                  max={moment().set('hour', 20).set('minute', 0).toDate()}
                  onSelectSlot={this.onSelectEmptySlot}
                  className={cx(styles.bigCalendar)}
                  components={{
                    event: (event, title) => <CalendarEvent entities={this.state.entities} event={event} title={title} companyProfile={this.props.companyProfile} profile={this.props.profile} viewType={this.state.viewType}/>
                  }}
                /> :
                <BigCalendar
                  localizer={localizer}
                  views={[ 'month', 'week', 'day']}
                  selectable = 'ignoreEvents'
                  formats={formats}
                  events={scheduledAndUnscheduledTaskWithDateTime.map((el) => {
                    let event = el;
                    event.allDay = el.unscheduled ? true : el.all_day;
                    return event;
                  })}
                  defaultDate={this.state.date}
                  timeslots={2}
                  eventPropGetter={this.eventPropsGetter}
                  titleAccessor={this.handleEventContent}
                  onView={this.viewTypeChanged}
                  onNavigate={this.onNavigate}
                  defaultView={this.state.viewType}
                  onSelectEvent={this.selectEvent}
                  onSelectSlot={this.onSelectEmptySlot}
                  className={cx(styles.bigCalendar)}
                  components={{
                    event: (event, title) => <CalendarEvent entities={this.state.entities} event={event} title={title} companyProfile={this.props.companyProfile} profile={this.props.profile} viewType={this.state.viewType}/>
                  }}
                />
              }
              <ModeSwitch showBusinessHours={this.state.showBusinessHours} changeHours={this.changeHours} href="javascript:void(0)" />
            </div>
          </div>
        </div>
        }
        { !this.state.blockingUpdate && !this.state.loadingEntities && !this.state.loadingEquipments && this.state.view === 'team' &&
          <Timeline
            tasks={scheduledAndUnscheduledTaskWithDateTime}
            equipments={this.state.equipments}
            entities={this.state.entities}
            date={this.state.date}
            mode={this.state.viewType}
            selectedEntitiesFilter={this.state.selectedEntitiesFilter}
            selectedEquipmentsFilter={this.state.selectedEquipmentsFilter}
            selectedTypeEntitiesFilter={this.state.selectedTypeEntitiesFilter}
            selectedGroupsFilter={this.state.selectedGroupsFilter}
            onAddClicked={this.open}
            onTaskClicked={this.selectEvent}
            onDateChanged={this.onChangeDate}
            profile={this.props.profile}
            companyProfile={this.props.companyProfile}
            groups={this.props.groups}
            activityTypes={activityTypes}
            updateTask={this.props.updateTask}
            updateTaskList={this.updateTaskList}

          />
        }
      { !this.state.blockingUpdate && !this.state.loadingEntities && !this.state.loadingEquipments && this.state.view === 'list' &&
      <TasksListView
        getTasks={this.props.getTasks}
        tasks={scheduledAndUnscheduledTaskWithDateTime}
        entities={this.state.entities}
        onTaskClicked={this.selectEvent}
        paginationNextClicked={this.paginationNextClicked}
        paginationPrevClicked={this.paginationPrevClicked}
        page={this.state.page}
        items_per_page={this.state.items_per_page}
        unscheduledEvents={[]}
        serverActionPending={this.state.loadingTask}
        profile={this.props.profile}
        companyProfile={this.props.companyProfile}
        onTaskSelection={this.onTaskSelectionChangeForTeamEquipmentAssign}
        task_ids={this.state.task_ids}
        onSelectionChange={this.onAllSelectionChange}
        equipments={this.state.equipments}
        view={this.state.view}
        showSpinner={this.state.showSpinner}
        templates={this.state.templates}
      />
      }
      { !this.state.blockingUpdate && !this.state.loadingEntities && !this.state.loadingEquipments && this.state.view === 'unscheduled' &&
      <TasksListView
        getTasks={this.props.getTasks}
        tasks={this.state.unscheduledEvents}
        entities={this.state.entities}
        onTaskClicked={this.selectEvent}
        paginationNextClicked={this.paginationNextClicked}
        paginationPrevClicked={this.paginationPrevClicked}
        page={this.state.page}
        items_per_page={this.state.items_per_page}
        unscheduledEvents={this.state.unscheduledEventsWithoutDate}
        serverActionPending={this.state.loadingTask}
        profile={this.props.profile}
        companyProfile={this.props.companyProfile}
        onTaskSelection={this.onTaskSelectionChangeForTeamEquipmentAssign}
        task_ids={this.state.task_ids}
        onSelectionChange={this.onAllSelectionChange}
        equipments={this.state.equipments}
        view={this.state.view}
        showSpinner={this.state.showSpinner}
        templates={this.state.templates}
      />
      }
       <Modal className={styles.taskFormModal} keyboard={false} backdrop={'static'} show={this.state.showModal} onHide={this.close} bsSize="large">
          <Modal.Body>
            <TaskWrapperV2
              selectedTask={this.state.selectedEvent}
              company_id={this.props.company_id}
              reporter_name={this.props.reporter_name}
              reporter_id={this.props.reporter_id}
              company_url={this.props.company_url}
              getTaskStatus={this.props.getStatus}
              getTaskRatings={this.props.getRatings}
              updateTaskStatus={this.props.setNewStatus}
              getEstimate={this.props.getEstimate}
              getSchedule={this.props.getSchedule}
              getTaskSeriesSettings={this.props.getTaskSeriesSettings}
              statuses={this.state.statuses}
              entities={this.state.entities}
              equipments={this.state.equipments}
              getCustomers={this.props.getCustomers}
              searchCustomers={this.props.searchCustomers}
              createCustomer={this.props.createCustomer}
              extraFieldsOptions={this.props.extraFieldsOptions}
              taskUpdatedCallback={this.taskUpdatedCallback}
              taskAddedCallback={this.taskAddedCallback}
              taskDeletedCallback={this.taskDeletedCallback}
              taskAssigneeUpdatedCallback={this.taskAssigneeUpdatedCallback}
              taskEquipmentUpdatedCallback={this.taskEquipmentUpdatedCallback}
              handleTaskTypeChange={this.handleTaskTypeChange}
              updateTask={this.props.updateTask}
              deleteTask={this.props.deleteTask}
              postTask={this.props.postTask}
              taskSendNotification={this.props.taskSendNotification}
              templates={this.state.templates}
              profile={this.props.profile}
              companyProfile={this.props.companyProfile}
              groups={this.props.groups}
              createToastNotification={this.createToastNotification}
              newEventDate={this.state.newEventDate}
              newEventEndDate={this.state.newEventEndDate}
              newEventIsRecurring={this.state.newEventIsRecurring}
              onCloseTask={this.close}
              unscheduled={this.state.view === 'unscheduled' ? true : false}
              viewType={this.state.view}
              defaultTemplate={this.state.defaultTemplate}
              getTaskState={this.getTaskState}
              creatingActivity={this.state.creatingActivity}
              allDay={this.state.allDay}
              duration={this.state.duration}
              systemAndCustomMessages={this.props.systemAndCustomMessages}
            />
          </Modal.Body>
        </Modal>
        {/*<TeamEquipmentForm*/}
        {/*closeModal={this.hideAssignTeamEquipment}*/}
        {/*showModal={this.state.showTeamEquipmentForm}*/}
        {/*entities={this.state.entities}*/}
        {/*equipments={this.state.equipments}*/}
        {/*task_ids={this.state.task_ids}*/}
        {/*showEntitiesWarning={this.state.showEntitiesWarning}*/}
        {/*showEquipmentsWarning={this.state.showEquipmentsWarning}/>*/}
      </Grid>);
  }
}


export class ModeSwitch extends Component {

  render() {
    return (
      <div className="mode-switch" onClick={this.props.changeHours}>
        {this.props.showBusinessHours ? "Show full day" : "Show business hours"}
      </div>
    )
  }
}

export class CalendarEvent extends Component {
  constructor(props) {
    super(props);
    this.generateStatusTooltipMessage = this.generateStatusTooltipMessage.bind(this);
  }

  generateStatusTooltipMessage(entity_ids, taskConfirmation) {
    if (this.props.entities.length > 0) {
      if (taskConfirmation && taskConfirmation !== null && entity_ids.length > 0) {
        const entityStatusMessage = entity_ids.map((entity) => {
          const entityObj = this.getEntity(entity);
          if (entity in taskConfirmation) {
            return (
              <p>
                {entityObj && entityObj.name ? entityObj.name : 'Unknown'} : {taskConfirmation[entity].status}
              </p>
            );
          } else {
            return (
              <p>
                {entityObj && entityObj.name ? entityObj.name : 'Unknown'} : PENDING
              </p>
            );
          }
        });
        let anyAccepted = false;
        let anyRejected = false;
        let allResponded = true;
        for (let i = 0; i < entity_ids.length; i++) {
          if (entity_ids[i] in taskConfirmation) {
            if (taskConfirmation[entity_ids[i]].status === 'ACCEPTED') {
              anyAccepted = true;
              continue;
            } else if (taskConfirmation[entity_ids[i]].status === 'REJECTED') {
              anyRejected = true;
              break;
            }
          }
          allResponded = false;
        }
        let statusColor = null;
        let generalStatusMessage = null;
        if (anyRejected) {
          statusColor = '#FF4E4C';
          generalStatusMessage = 'May require staffing';
        } else if (allResponded && anyAccepted) {
          statusColor = '#24ab95';
          generalStatusMessage = 'All accepted';
        } else if (anyAccepted) {
          statusColor = '#ffc024';
          generalStatusMessage = 'Partially accepted';
        } else {
          statusColor = '#666666';
          generalStatusMessage = 'Pending response';
        }
        const renderedData = {
          generalStatusMessage,
          entityStatusMessage,
          statusColor
        };
        return renderedData;
      } else if (entity_ids.length === 0 && taskConfirmation === null) {
        const renderedData = {
          generalStatusMessage: 'Require Staffing',
          entityStatusMessage: null,
          statusColor: '#666666'
        };
        return renderedData;
      } else {
        const entityStatusMessage = entity_ids.map((entity) => {
          const entityObj = this.getEntity(entity);
          return (
            <p>
              {entityObj ? entityObj.name : 'Unknown'} : Response Pending
            </p>
          );
        });
        const renderedData = {
          generalStatusMessage: 'Pending Response',
          entityStatusMessage,
          statusColor: '#666666'
        };
        return renderedData;
      }
    } else {
      const renderedData = {
        generalStatusMessage: null,
        entityStatusMessage: null,
        statusColor: '#666666'
      };
      return renderedData;
    }
  }

  getEntity(entityId) {
    return this.props.entities.find((entity) => {
      return entityId === entity.id;
    });
  }

  render() {
    const style_icon = {
      color: 'rgb(210, 210, 210)',
      paddingRight: '4px',
      fontSize: this.props.viewType !== 'month' && !this.props.event.event.allDay ? '26px' : '15px',
    };
    let is_company = false;
    if (this.props.profile.permissions && this.props.profile.permissions.includes('COMPANY')) is_company = true;
    if (is_company || this.props.profile.permissions.includes('VIEW_TEAM_CONFIRMATION_DATA')) this.can_view_team_confirmation = true;
    const taskConfirmationStatus = this.generateStatusTooltipMessage(this.props.event.event.entity_ids, this.props.event.event.entity_confirmation_statuses);
    const calendarEventTooltip = (
      <Tooltip className={styles.customTooltipForConfirmationStatus} id={'idx_' + this.props.event.id}>
        <p>{taskConfirmationStatus.generalStatusMessage}</p>
        {taskConfirmationStatus.entityStatusMessage}
      </Tooltip>);
    const activityIconTooltip = (
      <Tooltip>{this.props.event.event.details ? this.props.event.event.details.substring(0, 100) + (this.props.event.event.details.length > 100 ? '...' : '') : 'Notes not found'}</Tooltip>);
    return (
      <div>{this.props.event.event.template_type === 'TASK' && this.can_view_team_confirmation && this.props.companyProfile.enable_team_confirmation && this.props.entities.length > 0 &&
      <OverlayTrigger placement="bottom" overlay={calendarEventTooltip}>
        <span style={{backgroundColor: taskConfirmationStatus.statusColor}} className={styles.confirmationStatusIndicator} />
      </OverlayTrigger>}
        {this.props.event.event.activity_type && this.props.event.event.template_type.toUpperCase() === 'ACTIVITY' ?
          <OverlayTrigger placement="bottom" overlay={activityIconTooltip}><span
            style={style_icon}>{activityTypes.find((activity) => activity.type === this.props.event.event.activity_type) && activityTypes.find((activity) => activity.type === this.props.event.event.activity_type).icon}</span></OverlayTrigger> : ''}
        {this.props.event.title}
      </div>
    );
  }
}

TasksManager.propTypes = {
  company_id: PropTypes.number.isRequired,
  company_url: PropTypes.string.isRequired,
  reporter_id: PropTypes.number.isRequired,
  reporter_name: PropTypes.string.isRequired,
  getTasks: PropTypes.func.isRequired,
  getStatus: PropTypes.func.isRequired,
  getRatings: PropTypes.func.isRequired,
  setNewStatus: PropTypes.func.isRequired,
  getEstimate: PropTypes.func.isRequired,
  getEntities: PropTypes.func.isRequired,
  getEquipments: PropTypes.func.isRequired,
  getSchedule: PropTypes.func.isRequired,
  updateTask: PropTypes.func.isRequired,
  postTask: PropTypes.func.isRequired,
  deleteTask: PropTypes.func.isRequired,
  createCustomer: PropTypes.func.isRequired,
  getCustomers: PropTypes.func.isRequired,
  searchCustomers: PropTypes.func.isRequired,
  extraFieldsOptions: PropTypes.array.isRequired,
  googleOAuthFlow: PropTypes.func.isRequired,
  googleEvents: PropTypes.func.isRequired,
  locationQuery: PropTypes.string.isRequired,
  statuses: PropTypes.array.isRequired,
  getTaskSeriesSettings: PropTypes.func.isRequired,
  taskSendNotification: PropTypes.func,
  location: PropTypes.object,
//   createEntity: PropTypes.func.isRequired,
  companyProfile: PropTypes.object
};
