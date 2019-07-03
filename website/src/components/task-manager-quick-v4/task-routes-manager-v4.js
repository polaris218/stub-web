import React, {Component} from 'react';
import styles from './task-routes-manager-v4.module.scss';
import TopBar from './components/top-bar/top-bar';
import { ROUTES } from '../../helpers/d-routes';
import {
  Grid,
  Button,
  Glyphicon,
  Modal,
  Row,
  Col,
  ControlLabel,
  OverlayTrigger,
  Tooltip,
  FormControl,
  Alert,
  Checkbox
} from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import moment from 'moment';
import update from 'immutability-helper';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { LocationMapV2, TaskWrapperV2 } from '../../components';
import { TaskWrapper } from '../index';
import { getStatusDetails } from '../../helpers/status_dict_lookup';
import { generateSingleLineAddress, makeTaskGroups, makeTaskGroupsUsingRouteId } from '../../helpers/task';
import { getDefaultPolyLineColor } from '../../helpers/location_map';
import { getEntities, getTemplates, getRoutes } from '../../actions';
import { extraFieldsOptions } from '../../helpers';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {
  faCaretDown,
  faCaretLeft,
  faCaretRight,
  faAngleDown,
  faAngleUp,
  faPlus,
  faEye,
  faEyeSlash,
  faChevronLeft,
  faChevronRight,
  faClock,
  faUsers,
  faArrowRight,
  faCaretSquareLeft
} from '@fortawesome/fontawesome-free-solid';
import {faArrowAltCircleLeft} from '@fortawesome/fontawesome-free-regular';
import cx from 'classnames';
import {parseQueryParams} from '../../helpers';
import {toast, ToastContainer} from 'react-toastify';
import TaskCard from './components/task-card/task-card';
import $ from 'jquery';
import _ from 'lodash';
import TeamEquipmentForm from '../team-equipment-form/team-equiment-form';
import ErrorAlert from '../error-alert/error-alert';

window.map = true;
window.showTasksPanel = true;

export default class TaskRoutesManagerV4 extends Component {
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
    this.onTaskGroupClick = this.onTaskGroupClick.bind(this);
    this.groupsFilterChanged = this.groupsFilterChanged.bind(this);
    this.collapseFilter = this.collapseFilter.bind(this);
    this.filterTasksAndUpdateGroups = this.filterTasksAndUpdateGroups.bind(this);
    this.getRouteTitleFromEntityIDs = this.getRouteTitleFromEntityIDs.bind(this);
    this.getEntityFaces = this.getEntityFaces.bind(this);
    this.handleRouteSelection = this.handleRouteSelection.bind(this);
    this.onTaskMouseOver = this.onTaskMouseOver.bind(this);
    this.onTaskMouseOut = this.onTaskMouseOut.bind(this);
    this.renderTaskSummaryCard = this.renderTaskSummaryCard.bind(this);
    this.toggleRoutesNavigationButton = this.toggleRoutesNavigationButton.bind(this);
    this.routesNavigationButton = this.routesNavigationButton.bind(this);
    this.onAssignmentModalClose = this.onAssignmentModalClose.bind(this);
    this.assignTeamEquipmentClick = this.assignTeamEquipmentClick.bind(this);
    this.getAjaxCall = this.getAjaxCall.bind(this);
    this.getRoutesAjaxCall = this.getRoutesAjaxCall.bind(this);
    this.handleShowOnMapSelection = this.handleShowOnMapSelection.bind(this);
    this.updateSelectedRoutes = this.updateSelectedRoutes.bind(this);
    this.updateSelectedRoutesData = this.updateSelectedRoutesData.bind(this);
    this.toggleTasksPanelVisibilityButton = this.toggleTasksPanelVisibilityButton.bind(this);
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
      hoverCheck: false,
      taskHoverMarker: false,
      routeIdMarker: null,
      taskIdMarker: null,
      page: 1,
      items_per_page: 100,
      selectedGroup: null,
      taskGroup: null,
      loadingRoutes: false,
      showFilters: false,
      internetIssue: undefined,
      filteredTasks: [],
      taskGroups: [],
      routes: [],
      selectedRoute: null,
      highlighted_task: null,
      showRoutes: false,
      width: window.innerWidth,
      forceUpdateMap: false,
      showAssignmentModal: false,
      selectedRoutes: [],
      selectedRoutesData: null,
      applyFilters: false,
      filter_entity_ids: [],
      filter_resource_ids: [],
      filter_group_ids: [],
      filter_statuses: [],
      filter_templates: [],
      showSpinner: false,
    };
  }

  componentWillMount() {
    window.addEventListener('resize', this.handleWindowSizeChange);
  }

  componentDidMount() {
    this.setTimer = true;
    document.addEventListener('visibilitychange', this.visibilityChanged);
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
        loadingTasks: false,
        blockingLoadTasks: false,
        filterStatuses: this.getUniqueStatusesFromTemplates(parsedTemplate),
      }, () => {
        this.fetchTasksAndEntitiesList(true);
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
    window.removeEventListener('resize', this.handleWindowSizeChange);
  }

  filterTasksAndUpdateGroups(updateState = true, tasks = this.state.tasks) {
    let filteredTasks = [];
    if (this.state.selectedTasksFilter.length === 0 ||
      this.state.selectedTasksFilter.indexOf('All') >= 0) {
      filteredTasks = tasks;
    } else {
      filteredTasks = tasks
        .filter(task =>
          this.state.selectedTasksFilter.some(taskFilter => (task.status_title !== null ? taskFilter.toUpperCase() === task.status_title.toUpperCase() : taskFilter.toUpperCase() === task.status.toUpperCase()))
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

    if (this.state.selectedGroupsFilter.length > 0) {
      filteredTasks = filteredTasks.filter(eve => {
        return this.state.selectedGroupsFilter.indexOf(eve.group_id) >= 0;
      })
    }

    if (updateState) {
      this.setState({
        filteredTasks
      });
    } else {
      return {filteredTasks}
    }
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

  taskHover(taskID) {
    if (!this.state.hoverCheck) {
      this.setState({
        hoverCheck: true,
        routeIdMarker: taskID
      })
    }
  }

  assignTeamEquipmentClick(routeId, e) {
    e && e.preventDefault();
    e && e.stopPropagation();
    if (this.state.selectedRoute === routeId) {
      const task_ids = [];
      let showEntitiesWarning = false;
      let showEquipmentsWarning = false;
      this.state.tasks.map((task) => {
        if (!showEntitiesWarning && task.entity_ids.length > 0) {
          showEntitiesWarning = true;
        }
        if (!showEquipmentsWarning && task.resource_ids.length > 0) {
          showEquipmentsWarning = true;
        }
        task_ids.push(task.id);
      });
      const selectedRouteData = this.state.routes.find((route) => {
        return route.id === routeId;
      });

      this.setState({
        showAssignmentModal: true,
        task_ids,
        showEntitiesWarning,
        showEquipmentsWarning,
        selectedRouteData
      });
    } else {
      this.handleRouteSelection(routeId, true);
    }
  }

  onAssignmentModalClose() {
    this.setState({
      showAssignmentModal: false,
      task_ids: [],
      showEntitiesWarning: false,
      showEquipmentsWarning: false
    }, () => {
      this.fetchTasksAndEntitiesList();
    });
  }

  taskHoverClose() {
    if (this.state.hoverCheck) {
      this.setState({
        hoverCheck: false,
        routeIdMarker: null
      })
    }
  }

  markerHover(taskId) {
    if (!this.state.taskHoverMarker) {
      this.setState({
        taskHoverMarker: true,
        taskIdMarker: taskId
      })
    }
  }

  markerHoverClose() {
    if (this.state.taskHoverMarker) {
      this.setState({
        taskHoverMarker: false,
        taskIdMarker: null
      })
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
        this.setState({
          statuses: this.props.statuses
        });
      }
    } else {
      this.setState((state) => {
        return {
          ...state,
          selectedTask: {
            ...state.selectedTask,
            template: template_id
          },
          statuses: this.props.statuses
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

  renderTasksToShowOnMap(entities, routes) {
    const updateMap = this.state.forceUpdateMap;
    if (updateMap) {
      this.setState({forceUpdateMap: false});
    }
    let filteredEntiyList = [];
    if (entities.length + routes.length === 0) {
      return <div></div>;
    }
    let routeTitle = '';
    if (routes !== null) {
      const selectedRouteIndex = routes.findIndex((el) => {
        return el.id === this.state.selectedRoute;
      });
      if (selectedRouteIndex !== -1) {
        routeTitle = this.getRouteTitleFromEntityIDs(routes[selectedRouteIndex], routes[selectedRouteIndex].entity_ids);
      } else {
        routeTitle = '';
      }
    }
    const filteredData = [];
    let location = null;
    let companyORGroupLocation = null;
    let routeId = null;
    let name = null;
    let address = null;
    let wayPoints = [];
    let routesData = {};

    let tasks = this.state.tasks;
    const companyProfile = this.props.companyProfile;

    if (this.state.selectedRoutesData) {
      for (let routeDataIndex in this.state.selectedRoutesData) {
        tasks = this.state.selectedRoutesData[routeDataIndex];
        if (!companyProfile.route_start || companyProfile.route_start.toUpperCase() === 'GROUP') {
          if (companyProfile.exact_location) {
            location = companyProfile.exact_location;
            name = companyProfile.fullname;
            address = companyProfile.address;
          } else if (companyProfile.address) {
            location = companyProfile.address;
            name = companyProfile.fullname;
            address = companyProfile.address;
          }
          let selectedGroup = null;
          if (this.props.groups) {
            for (let i = 0; i < tasks.length; i++) {
              selectedGroup = this.props.groups.find((group) => {
                return tasks[i].group_id === null ? group.is_implicit : tasks[i].group_id === group.id;
              });
              if (selectedGroup && selectedGroup.exact_location) {
                location = selectedGroup.exact_location;
                name = selectedGroup.name;
                address = selectedGroup.complete_address;
                break;
              } else if (selectedGroup && selectedGroup.address) {
                location = selectedGroup.complete_address;
                name = selectedGroup.name;
                address = selectedGroup.complete_address;
                break;
              }
            }
          }

          if (location) {
            filteredData.push({
              location: location,
              name: name,
              id: selectedGroup ? selectedGroup.owner : companyProfile.owner,
              time: null,
              address: address,
              color: companyProfile.color ? companyProfile.color : '#0693e3',
              is_company: true,
            });
            companyORGroupLocation = location;
          }
        }
        const routeIndex = routes.findIndex((el) => {
          return el.id === Number(routeDataIndex);
        });
        const route = routes[routeIndex];
        let routeColor = getDefaultPolyLineColor();
        if (route && route.color) {
          routeColor = route.color;
        }
        if (route && route.entity_ids) {
          filteredEntiyList.push(route.entity_ids);
        }
        if (companyORGroupLocation) {
          wayPoints.push({
            location: companyORGroupLocation,
            routeColor: routeColor
          });
        }
        location = null;
        for (let i = 0; i < tasks.length; i++) {
          // find tasks of entity and get locations of task to show on map
          routeId = i + 1;
          if (tasks[i].current_destination && tasks[i].current_destination.exact_location && tasks[i].current_destination.exact_location.lat) {
            location = tasks[i].current_destination.exact_location;
            name = tasks[i].current_destination.title;
            address = tasks[i].current_destination.complete_address;
          } else if (tasks[i].customer_exact_location && tasks[i].customer_exact_location.lat) {
            location = tasks[i].customer_exact_location;
            name = tasks[i].customer_name;
            address = tasks[i].customer_address;
          } else if (tasks[i].customer_address) {
            location = tasks[i].customer_address;
            name = tasks[i].customer_name;
            address = tasks[i].customer_address;
          }
          if (location) {
            filteredData.push({
              location: location,
              name: name,
              id: tasks[i].id,
              routeId: routeId,
              time: tasks[i].start_datetime,
              address: address,
              color: tasks[i].extra_fields && tasks[i].extra_fields.task_color ? tasks[i].extra_fields.task_color : '#0693e3',
              type: 'customer'
            });
            wayPoints.push({
              location: location,
              routeColor: routeColor
            });
          }
          location = null;
        }
        routesData[routeDataIndex] = wayPoints;
        wayPoints = [];
      }
    }

    // convert array of arrays into a single array
    filteredEntiyList = [].concat.apply([], filteredEntiyList);
    // make entity_ids unique
    filteredEntiyList = [...new Set(filteredEntiyList)];

    // The entities extracted from tasks are less than the ones in selected team filter
    if (filteredEntiyList.length != this.state.selectedEntitiesFilter.length) {
      this.state.selectedEntitiesFilter.map(id => {
        if (filteredEntiyList.indexOf(id) < 0) {
          filteredEntiyList.push(id);
        }
      });
    }

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

    const heightForMap = this.props.headerHeight ? this.props.headerHeight : 56;
    const mapHeight = 'calc(100vh - 55px - ' + heightForMap + 'px';
    return (
      <div className={styles.locationMapMask}>
        {this.state.loadingRoutes &&
        <div className={styles.routesSavingSpinner}>
          <SavingSpinner title="" borderStyle="none" fontColor={"#E6F4FF"} size={8}/>
        </div>
        }
        {!this.state.loadingRoutes && routes.length !== 0 && window.showTasksPanel &&
        <div className={styles.nonRouteTasks}>
          {routeTitle}
        </div>
        }
        <LocationMapV2
          height={mapHeight}
          routeView="routes"
          entities={filteredData}
          showDirections={filteredData.length !== 0 ? true : false}
          showLocation
          wayPoints={routesData}
          hideOverlay={this.state.selectedGroup !== null}
          highlightedTaskId={this.state.highlighted_task}
          onTaskMouseOver={this.onTaskMouseOver}
          onTaskMouseOut={this.onTaskMouseOut}
          updateMap={updateMap}
        />
      </div>
    );
  }

  getAjaxCall(call) {
    this.callInProgress = call;
  }

  getRoutesAjaxCall(call) {
    this.routesCallInProgress = call;
  }

  applyFilters(applyFilters, e) {
    e && e.preventDefault();
    e && e.stopPropagation();
    const filter_entity_ids = this.state.entities && this.state.selectedEntitiesFilter.length < this.state.entities.length ? this.state.selectedEntitiesFilter : [];
    const filter_resource_ids = this.props.equipments && this.state.selectedEquipmentsFilter.length < this.props.equipments.length ? this.state.selectedEquipmentsFilter : [];
    const filter_group_ids = this.props.groups && this.state.selectedGroupsFilter.length < this.props.groups.length ? this.state.selectedGroupsFilter : [];
    const filter_statuses = this.state.filterStatuses && this.state.selectedTasksFilter.length < this.state.filterStatuses.length ? this.state.selectedTasksFilter : [];
    const filter_templates = this.state.templates && this.state.selectedTemplatesFilter.length < this.state.templates.length ? this.state.selectedTemplatesFilter : [];
    this.setState({
      filter_entity_ids,
      filter_resource_ids,
      filter_group_ids,
      filter_statuses,
      filter_templates,
      applyFilters
    }, () => this.fetchTasksAndEntitiesList(false, false, null, false, false));
  }

  fetchTasksAndEntitiesList(resetTimeout, blockingUpdate = false, postProcess = null, getAllData = true, runCallBack = false) {
    if (this.state.timer && resetTimeout && getAllData) {
      clearTimeout(this.state.timer);
    }

    if (this.callInProgress && this.callInProgress.state() === 'pending') {
      this.callInProgress.abort();
    }

    if (this.routesCallInProgress && this.routesCallInProgress.state() === 'pending') {
      this.routesCallInProgress.abort();
    }

    const resource_ids = (this.state.applyFilters && this.state.filter_resource_ids) ? this.state.filter_resource_ids.join(',') : '';
    const entity_ids = (this.state.applyFilters && this.state.filter_entity_ids) ? this.state.filter_entity_ids.join(',') : '';
    const group_ids = (this.state.applyFilters && this.state.filter_group_ids) ? this.state.filter_group_ids.join(',') : '';
    const statuses = (this.state.applyFilters && this.state.filter_statuses) ? this.state.filter_statuses.join(',') : '';
    const templates = (this.state.applyFilters && this.state.filter_templates) ? this.state.filter_templates.join(',') : '';

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
        if (getAllData) {
          getEntities().then((entities) => {
            const parsedEntities = JSON.parse(entities);
            this.setState({
              entities: parsedEntities,
              internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
            })
          })
          Promise.all([this.props.getTasks({
            viewType: null,
            startDate,
            endDate,
            items_per_page,
            page,
            route_id: this.state.selectedRoute,
            getAjaxCall: this.getAjaxCall,
            group_ids,
            entity_ids,
            resource_ids,
            statuses,
            templates
          }),
            getRoutes({startDate, endDate, getAjaxCall: this.getRoutesAjaxCall})])
            .then(([tasks, routes]) => {
              const parsedTasks = JSON.parse(tasks);
              let updateTasks = false;

              const { filteredTasks } = this.filterTasksAndUpdateGroups(false, parsedTasks);
              const parsedRoutes = JSON.parse(routes);
              let selectedRoute = this.state.selectedRoute;
              let selectedRoutes = this.state.selectedRoutes;
              if (selectedRoute === null) {
                if (window.showTasksPanel) {
                  if (parsedRoutes.length > 0) {
                    for (let i = 0; i < parsedRoutes.length; i++) {
                      if (parsedRoutes[i].total_tasks > 0) {
                        selectedRoute = parsedRoutes[i].id;
                        selectedRoutes = this.updateSelectedRoutes(selectedRoute);
                        updateTasks = true;
                        break;
                      }
                    }
                  } else {
                    selectedRoute = null;
                    selectedRoutes = [];
                  }
                }
              } else {
                if (parsedRoutes.length > 0) {
                  const route = parsedRoutes.find((routeEl) => {
                    return routeEl.id.toString() === selectedRoute.toString();
                  });
                  if (!route) {
                    selectedRoute = null;
                    selectedRoutes = [];
                    for (let i = 0; i < parsedRoutes.length; i++) {
                      if (parsedRoutes[i].total_tasks > 0) {
                        selectedRoute = parsedRoutes[i].id;
                        selectedRoutes = this.updateSelectedRoutes(selectedRoute);
                        updateTasks = true;
                        break;
                      }
                    }
                  } else {
                    if (route.total_tasks <= 0) {
                      selectedRoute = null;
                      selectedRoutes = [];
                      for (let i = 0; i < parsedRoutes.length; i++) {
                        if (parsedRoutes[i].total_tasks > 0) {
                          selectedRoute = parsedRoutes[i].id;
                          selectedRoutes = this.updateSelectedRoutes(selectedRoute);
                          updateTasks = true;
                          break;
                        }
                      }
                    }
                  }
                } else {
                  selectedRoute = null;
                  selectedRoutes = [];
                }
              }

              const routesWithTasks = parsedRoutes && parsedRoutes.filter((route) => {
                return route.total_tasks > 0;
              });

              if (!window.showTasksPanel) {
                selectedRoute = null;
              }

              this.setState({
                tasks: parsedTasks,
                loadingTasks: false,
                blockingLoadTasks: false,
                showSpinner: false,
                filteredTasks,
                routes: parsedRoutes,
                selectedRoute: selectedRoute,
                selectedRoutes: selectedRoutes,
                routeCount: routesWithTasks ? routesWithTasks.length : 0
              }, () => {
                if (updateTasks) {
                  this.fetchTasksAndEntitiesList(false, false, null, false);
                }
                return postProcess ? postProcess() : null;
              });
              const timer = setTimeout(() => {
                this.fetchTasksAndEntitiesList();
              }, 3e4);
              if (this.setTimer && !document.hidden) {
                this.setState({
                  timer,
                  internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
                });
              } else {
                clearTimeout(timer);
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
            } else {
              this.setState({
                loadingTasks: false,
                blockingLoadTasks: false,
                showSpinner: false,
              });
            }
          });
          if (this.props.getExternalIntegrations) {
            this.props.getExternalIntegrations()
          }
        } else {
          this.props.getTasks({
            viewType: null,
            startDate,
            endDate,
            items_per_page,
            page,
            route_id: this.state.selectedRoute,
            getAjaxCall: this.getAjaxCall,
            group_ids,
            entity_ids,
            resource_ids,
            statuses,
            templates
          }).then((tasks) => {
            const parsedTasks = JSON.parse(tasks);
            const { filteredTasks } = this.filterTasksAndUpdateGroups(false, parsedTasks);
            let selectedRoutesData = this.state.selectedRoutesData;
            if (window.showTasksPanel) {
              selectedRoutesData = this.updateSelectedRoutesData(this.state.selectedRoute, parsedTasks);
            }
            this.setState({
              tasks: parsedTasks,
              loadingTasks: false,
              blockingLoadTasks: false,
              filteredTasks,
              selectedRoutesData: selectedRoutesData,
              showSpinner: false,
            }, () => {
              runCallBack && this.assignTeamEquipmentClick(this.state.selectedRoute);
              return postProcess ? postProcess() : null;
            });
          }).catch((err) => {
            console.log(err);
            if (err.status === 0 && err.statusText === 'error') {
              this.setState({
                internetIssue: true,
                loadingTasks: false,
                blockingLoadTasks: false,
                showSpinner: false,
              });
            } else {
              this.setState({
                loadingTasks: false,
                blockingLoadTasks: false,
                showSpinner: false,
              });
            }
          });
          if (this.props.getExternalIntegrations) {
            this.props.getExternalIntegrations()
          }
        }
      }, 200);
    }
  }

  onTaskClick(task) {
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
      this.setState({
        statuses: this.props.statuses
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
      this.setState({
        forceUpdateMap: true
      })
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

  //TODO: Filter tasks and update groups inline
  entityFilterChanged(selectedEntities) {
    let filter_entity_ids = this.state.filter_entity_ids;
    if (selectedEntities.length === 0) {
      filter_entity_ids = [];
    }
    this.setState({selectedEntitiesFilter: selectedEntities.map(item => item.id), filter_entity_ids}, () => {
      this.filterTasksAndUpdateGroups();
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
      this.filterTasksAndUpdateGroups();
      if (selectedEquipments.length === 0) {
        this.applyFilters(true);
      }
    });
  }

  templateFilterChanged(selectedTemplates) {
    let filter_templates = this.state.filter_templates;
    if (selectedTemplates.length === 0) {
      filter_templates = [];
    }
    this.setState({selectedTemplatesFilter: selectedTemplates.map(item => item.id), filter_templates}, () => {
      this.filterTasksAndUpdateGroups();
      if (selectedTemplates.length === 0) {
        this.applyFilters(true);
      }
    });
  }

  selectedTaskFilterChanged(selectedStatuses) {
    let filter_statuses = this.state.filter_statuses;
    if (selectedStatuses.length === 0) {
      filter_statuses = [];
    }
    this.setState({
      selectedTasksFilter: selectedStatuses.map(item => item.title ? item.title : item.id), filter_statuses
    }, () => {
      this.filterTasksAndUpdateGroups();
      if (selectedStatuses.length === 0) {
        this.applyFilters(true);
      }
    });
  }

  groupsFilterChanged(selectedGroups) {
    let filter_group_ids = this.state.filter_group_ids;
    if (selectedGroups.length === 0) {
      filter_group_ids = [];
    }
    this.setState({
      selectedGroupsFilter: selectedGroups.map(group => group.id), filter_group_ids
    }, () => {
      this.filterTasksAndUpdateGroups();
      if (selectedGroups.length === 0) {
        this.applyFilters(true);
      }
    });
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
    this.props.onDateChanged(currentDate.toISOString());
    this.setState({
      tasks: [],
      selectedRoutes: [],
      selectedRoutesData: null
    });
    this.fetchTasksAndEntitiesList(true, true,);
  }

  onChangeDate(value) {
    this.props.onDateChanged(value);
    this.setState({
      selectedGroup: null,
      taskGroup: null,
      loadingRoutes: false,
      tasks: [],
      selectedRoutes: [],
      selectedRoutesData: null
    });
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

    if ($.type(task.additional_addresses) === "string") {
      const additional_addresses = JSON.parse(task.additional_addresses);
      task.additional_addresses = additional_addresses;
    }

    task.customer_address = generateSingleLineAddress(task);

    return task;
  }

  duplicateTask(task) {
    const duplicatedTask = {};
    Object.assign(duplicatedTask, task);
    duplicatedTask.id = null;
    duplicatedTask.title = 'Copy of ' + duplicatedTask.title;
    duplicatedTask.series_id = null;
    duplicatedTask.url_safe_id = null;
    duplicatedTask.status = 'NOTSTARTED';
    const creatingActivity = task.template_type && task.template_type.toUpperCase() === 'ACTIVITY';
    setTimeout((e) => {
      this.createNewTask(duplicatedTask, creatingActivity)
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
          showModal: false
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
      emptyText = "No tasks matching the criteria";
    } else {
      emptyText = "No tasks scheduled";
    }
    if (this.state.routeCount > 0) {
      return (<div className={styles['no-entity']}>
        {emptyText}
      </div>);
    }
    return null;
  }

  onTaskGroupClick(selectedGroupNumber, taskGroup) {
    const oldSelectedGroup = this.state.selectedGroup;
    if (selectedGroupNumber === oldSelectedGroup) {
      this.setState({
        selectedGroup: null,
        taskGroup: null,
        loadingRoutes: false,
      });
    } else {
      this.setState({
        selectedGroup: selectedGroupNumber,
        taskGroup,
      });
    }
  }

  collapseFilter() {
    this.setState({
      showFilters: !this.state.showFilters
    });
  }

  updateSelectedRoutesData(selectedRoute, tasks) {
    let routesData = {};
    routesData[selectedRoute] = tasks;
    return routesData;
  }

  updateSelectedRoutes(selectedRoute) {
    let selectedRoutes = this.state.selectedRoutes;
    if (selectedRoutes && selectedRoutes.length === 0) {
      selectedRoutes.push(selectedRoute);
      return selectedRoutes;
    }
    else if (selectedRoutes && selectedRoutes.indexOf(selectedRoute) === -1) {
      selectedRoutes.push(selectedRoute);
      return selectedRoutes;
    }
  }

  handleShowOnMapSelection(e, route) {
    e.stopPropagation();

    if (route.id === this.state.selectedRoute) {
      return;
    }

    let selectedRoutes = this.state.selectedRoutes;
    let selectedRoutesData = this.state.selectedRoutesData;
    if (selectedRoutes && selectedRoutes.indexOf(route.id) !== -1) {
      selectedRoutes.splice(selectedRoutes.indexOf(route.id), 1);
      delete selectedRoutesData[route.id];
      this.setState({
        selectedRoutes: selectedRoutes,
        selectedRoutesData: selectedRoutesData
      });
    } else {
      const startDate = moment(this.state.date).startOf('day');
      const endDate = moment(this.state.date).endOf('day');
      const items_per_page = this.state.items_per_page;
      const page = this.state.page;

      this.props.getTasks({
        viewType: null,
        startDate,
        endDate,
        items_per_page,
        page,
        route_id: route.id,
        getAjaxCall: this.getAjaxCall
      }).then((tasks) => {
        const parsedTasks = JSON.parse(tasks);
        selectedRoutes.push(route.id);
        if (!selectedRoutesData) {
          selectedRoutesData = {};
        }
        selectedRoutesData[route.id] = parsedTasks;
        this.setState({
          selectedRoutes,
          selectedRoutesData
        });
      }).catch((err) => {
        console.log(err);
      });
    }
  }

  renderRoutes() {
    const routes = $.extend(true, [], this.state.routes);
    const tooltip = (<Tooltip>Assign team members and equipments to tasks in route</Tooltip>);
    if (routes.length > 0) {
      return routes.map((route) => {
        if (route.total_tasks > 0) {
          let isSelected = false;
          if ((this.state.selectedRoutes && this.state.selectedRoutes.indexOf(route.id) !== -1) || this.state.selectedRoute === route.id) {
            isSelected = true;
          }
          return (
            <div onClick={() => this.handleRouteSelection(route.id)} key={route.id}
                 style={{ borderLeftColor: route.color }}
                 className={cx(styles.route, this.state.selectedRoute === route.id && styles.selectedRoute)}>
              <div className={styles.routeDetails}>
                <OverlayTrigger placement="top" overlay={(
                  <Tooltip>{this.getRouteTitleFromEntityIDs(route, route.entity_ids)}</Tooltip>)}>
                  <div className={styles.routeName}>
                    {this.getRouteTitleFromEntityIDs(route, route.entity_ids)}
                  </div>
                </OverlayTrigger>
                {/*<div className={styles.routeExtraDetails}>*/}
                {/*<span className={styles.icon}>*/}
                {/*<img src="/images/icons/label.png" alt="Task" />*/}
                {/*</span>*/}
                {/*{route.total_tasks} Task(s) | 0 Started*/}
                {/*</div>*/}
                <div className={styles.startEndDetails}>
							<span className={styles.icon}>
								<FontAwesomeIcon icon={faClock}/>
							</span>
                  <span>
								{moment.utc(route.start_datetime).local().format('hh:mm A')} - {moment.utc(route.end_datetime).local().format('hh:mm A')}
							</span>
                </div>
              </div>
              <div className={styles.entitiesFaces}>
                {this.getEntityFaces(route, route.entity_ids)}
                {/*{route && route.entity_ids && route.entity_ids.length > 2 &&*/}
                {/*<div className={styles.entityCount}>+{route.entity_ids.length - 2}</div>}*/}
              </div>
              <OverlayTrigger placement="bottom" overlay={tooltip}>
								<span className={styles.userIcon} onClick={(e) => {
                                  this.assignTeamEquipmentClick(route.id, e);
                                }}>
									<FontAwesomeIcon icon={faArrowRight}/>
									<FontAwesomeIcon icon={faUsers}/>
								</span>
              </OverlayTrigger>
              <div className={styles.routeSelector}>
                <Checkbox checked={isSelected} onClick={(e) => {
                  this.handleShowOnMapSelection(e, route);
                }}>Show on map</Checkbox>
              </div>
            </div>
          );
        }
      });
    } else {
      let emptyRouteClass = '';
      const tasks = this.state.tasks && this.state.tasks.filter((task) => {
        return !task.template_type || task.template_type.toUpperCase() === 'TASK';
      }) || [];
      if (this.state.routeCount === 0 && tasks.length === 0) {
        emptyRouteClass = styles['no-route'];
      }
      return (
        <div
          className={cx(styles['no-entity'], emptyRouteClass)}>{!this.state.loadingTasks && this.state.routeCount === 0 ? 'No routes found.' : null}</div>
      );
    }
  }

  getRouteTitleFromEntityIDs(route, IDs) {
    const entities = $.extend(true, [], route.entities_data);
    let routeTitle = 'Route ';
    if (route.external_id) {
      routeTitle = route.external_id;
    }
    else {
      IDs.map((entity, index) => {
        const eIndex = entities.findIndex((el) => {
          return el.id === entity;
        });
        if (eIndex !== -1) {
          routeTitle = routeTitle + (index !== 0 ? ', ' : ' ') + entities[eIndex].name;
        }
      });
    }
    return routeTitle;
  }

  getEntityFaces(route, IDs) {
    const routeEntities = IDs;
    const allEntities = route.entities_data || this.state.entities;
    if (routeEntities && routeEntities.length > 0 && allEntities.length > 0) {
      let selectedEntities = [];
      routeEntities.map((en) => {
        const foundElIndex = allEntities.findIndex((el) => {
          return el.id === en;
        });
        if (foundElIndex !== -1) {
          selectedEntities.push(allEntities[foundElIndex]);
        } else {
          selectedEntities.push({
            name: 'Unknown',
            image_path: null,
            id: en
          });
        }
      });
      if (selectedEntities.length <= 2) {
        const renderedEntities = selectedEntities.map((entity) => {
          const tooltip = (<Tooltip>{entity.name}</Tooltip>);
          let entityName = entity.name;
          let stringParts = entityName.split(/\s+/);
          stringParts = [stringParts.shift(), stringParts.join(' ')];
          if (stringParts.length > 1 && stringParts[0] !== '' && stringParts[1] !== '') {
            entityName = stringParts[0][0] + stringParts[1][0];
          } else if (stringParts.length === 1 && stringParts[0] !== '') {
            entityName = stringParts[0][0];
          } else {
            entityName = entity.name[0];
          }
          return (
            <OverlayTrigger placement="bottom" overlay={tooltip}>
              <div key={entity.id} className={styles.entityFace}>
                {entity.image_path ? <span className={styles.entityFacePlaceholder}><img src={entity.image_path}
                                                                                         alt={entity.name}/></span> :
                  <span className={styles.entityFacePlaceholder}>{entityName}</span>}
                <span className={styles.name}>{entity.name}</span>
              </div>
            </OverlayTrigger>
          );
        });
        return renderedEntities;
      } else if (selectedEntities.length > 2) {
        let tempSelectedEntitiesNames = $.extend(true, [], selectedEntities);
        tempSelectedEntitiesNames.splice(0, 2);

        const tempSelectedEntities = $.extend(true, [], selectedEntities);
        tempSelectedEntities.splice(2);
        tempSelectedEntities.push({
          name: selectedEntities.length - 2 + ' more',
          image_path: null,
          special_entity: true,
          toolTipName: (tempSelectedEntitiesNames.map((entity, index) => {
            return (<span>{entity.name} {index < (tempSelectedEntitiesNames.length - 1) && <br/>}</span>);
          })),
          id: -1
        });
        const renderedEntities = tempSelectedEntities.map((entity) => {
          const tooltip = (<Tooltip>{entity.toolTipName || entity.name}</Tooltip>);
          let entityName = entity.name;
          let stringParts = entityName.split(/\s+/);
          stringParts = [stringParts.shift(), stringParts.join(' ')];
          if (stringParts.length > 1 && stringParts[0] !== '' && stringParts[1] !== '') {
            entityName = stringParts[0][0] + stringParts[1][0];
          } else if (stringParts.length === 1 && stringParts[0] !== '') {
            entityName = stringParts[0][0];
          } else {
            entityName = entity.name[0];
          }
          return (
            <OverlayTrigger placement="bottom" overlay={tooltip}>
              <div key={entity.id} className={styles.entityFace}>
                {entity.image_path ?
                  <span className={styles.entityFacePlaceholder}><img src={entity.image_path}/></span> : <span
                    className={styles.entityFacePlaceholder}>{entity.special_entity && '+'}{entity.special_entity ? entity.name[0] : entityName}</span>}
                <span className={styles.name}>{entity.name}</span>
              </div>
            </OverlayTrigger>
          );
        });
        return renderedEntities;
      }
    } else {
      const tooltip = (<Tooltip>No team member assigned</Tooltip>);
      return (
        <OverlayTrigger placement="bottom" overlay={tooltip}>
          <div className={styles.entityFace}>
            <span className={styles.entityFacePlaceholder}>?</span>
          </div>
        </OverlayTrigger>
      );
    }
  }

  handleRouteSelection(id, runCallBack = false) {
    window.showTasksPanel = true;
    let showRoutes = !this.state.showRoutes;
    let selectedRoutes = [id];
    const selectedRouteData = this.state.routes.find((route) => {
      return route.id === id;
    });
    this.setState({
      selectedRoute: id,
      selectedRoutes,
      showRoutes,
      tasks: [],
      selectedRoutesData: null,
      selectedRouteData
    }, () => {
      this.fetchTasksAndEntitiesList(false, false, null, false, runCallBack);
    });
  }

  onTaskMouseOver(task_id) {
    this.setState({
      highlighted_task: task_id
    });
  }

  onTaskMouseOut() {
    this.setState({
      highlighted_task: null
    });
  }

  renderTaskSummaryCard(tasks) {
    const totalTasks = tasks.length;

    const completedTask = tasks.filter(task => {
      return task.status === 'COMPLETE';
    });

    return (
      <div className={styles.tasksSummaryCard}>
        <div>{totalTasks} Task(s)</div>
        <div>{completedTask.length} Completed Task(s)</div>
      </div>
    );

  }

  handleWindowSizeChange = () => {
    this.setState({width: window.innerWidth});
  };

  toggleRoutesNavigationButton() {
    let showRoutes = !this.state.showRoutes;
    this.setState({
      showRoutes
    });
  }

  routesNavigationButton() {
    const routes = $.extend(true, [], this.state.routes);
    let obj = routes.find((routeID) => {
      return this.state.selectedRoute && routeID.id === this.state.selectedRoute;
    });
    let selectedRouteName = obj && this.getRouteTitleFromEntityIDs(obj, obj.entity_ids) || '';

    let html = (<div className={cx(styles.routesTasksNav, this.state.showRoutes ? styles.active : '')}>
      <div className={styles.icon}>
        <div onClick={() => {
          this.toggleRoutesNavigationButton();
        }}><FontAwesomeIcon icon={faArrowAltCircleLeft}/> <span>Routes</span></div>
      </div>
      <div className={styles.routeName}>{selectedRouteName}</div>
    </div>);
    return (html);
  }

  toggleTasksPanelVisibilityButton() {
    window.showTasksPanel = false;
    this.setState({
      selectedRoute: null,
      // Don't remove selected routes from the map
      //selectedRoutes: [],
      //selectedRoutesData: null
    });
  }

  render() {

    this.can_create = false;
    this.can_trigger_external_integration_data_fetch = false;
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
      if (is_company || permissions.includes('VIEW_ALL_TASKS')) this.can_view_filters = true;
      if (is_company || permissions.includes('TRIGGER_EXTERNAL_INTEGRATION_DATA_FETCH')) this.can_trigger_external_integration_data_fetch = true;
    }

    let filteredTasks = this.state.tasks.filter((task) => {
      return !task.template_type || task.template_type.toUpperCase() === 'TASK';
    });
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
    //
    // if (this.state.selectedEquipmentsFilter.length > 0 ||
    // 	this.state.selectedEntitiesFilter.length > 0) {
    // 	filteredTasks = filteredTasks
    // 		.filter(task =>
    // 			task.resource_ids.some(id => this.state.selectedEquipmentsFilter.indexOf(id) >= 0) ||
    // 			this.state.selectedEntitiesFilter.length > 0 &&
    // 			task.entity_ids.some(id => this.state.selectedEntitiesFilter.indexOf(id) >= 0) ||
    // 			(task.entity_ids.length === 0 && this.state.selectedEntitiesFilter.indexOf(-1) >= 0));
    // }
    //
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

    const {width} = this.state;
    const isMobile = width <= 767;
    let height = this.props.headerHeight;

    return (
      <div className={styles.taskRoutesManagerContainer}>
        <style>
          {'.' + styles.routesListScrollContainer + ', .' + styles.tasksListScrollContainer + '{ min-height: calc(100vh - 65px - ' + (height ? height : 56) + 'px); max-height: calc(100vh - 65px - ' + (height ? height : 56) + 'px);}'}
          {'@media screen and (max-width: 991px){ .' + styles.routesListScrollContainer + ', .' + styles.tasksListScrollContainer + ' { min-height: calc(100vh - 120px - ' + (height ? height : 56) + 'px); max-height: calc(100vh - 120px - ' + (height ? height : 56) + 'px);}'}
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
          groupsFilters={this.state.selectedGroupsFilter}
          templateFilters={this.state.selectedTemplatesFilter}
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
            <Col md={window.map ? (window.showTasksPanel ? 6 : 2) : 12}
                 className={cx(!window.showTasksPanel && window.map ? styles.taskHidden : "")} sm={12}>
              <div className={styles.taskItemsContainer}>
                {!this.state.loadingTasks && (filteredTasks.length > 0 || filteredTasks.length === 0) && isMobile && this.routesNavigationButton()}
                <div className={cx(styles.routesContentContainer, this.state.showRoutes ? styles.active : "")}>
                  <div className={styles.routesListScrollContainer}
                       style={!window.showTasksPanel ? {width: '100%'} : {}}>
                    {this.state.routeCount > 0 &&
                    <div className={styles.routesInfo}>{this.state.routeCount} Route(s)</div>}
                    {this.state.loadingTasks && this.state.routeCount > 0 && !window.showTasksPanel &&
                    <div className={styles.loadingSpinnerContainer} style={{marginTop: '0'}}>
                      <SavingSpinner title={'Loading'} borderStyle="none"/>
                    </div>}
                    <div className={styles.routesListContainer}>
                      {this.renderRoutes()}
                    </div>
                  </div>
                  {window.showTasksPanel &&
                  <div className={styles.tasksListScrollContainer}>
                    <div className={styles.tasksListContainer}>
                      {!this.state.loadingTasks && filteredTasks.length === 0 ? this.getEmptyText() : null}
                      {!this.state.loadingTasks &&
                      <div className={styles.taskSummaryCardWrapper}>
                        {filteredTasks.length > 0 && this.renderTaskSummaryCard(filteredTasks)}
                      </div>}
                      {this.state.loadingTasks &&
                      <div className={styles.loadingSpinnerContainer}>
                        <SavingSpinner title={'Loading'} borderStyle="none"/>
                      </div>}
                      {
                        filteredTasks.map((task, i) => {
                          return (
                            <TaskCard
                              taskClick={this.onTaskClick}
                              showEntities={false}
                              task={task}
                              itemkey={i}
                              entities={this.state.entities}
                              companyProfile={this.props.companyProfile}
                              profile={this.props.profile}
                              onTaskMouseOver={this.onTaskMouseOver}
                              onTaskMouseOut={this.onTaskMouseOut}
                              highlighted_task={this.state.highlighted_task}
                              taskRoute
                            />
                          );
                        })
                      }
                    </div>
                  </div>
                  }
                  {window.showTasksPanel && filteredTasks.length > 0 &&
                  <span className={styles.hideTasksPanelBtn} onClick={() => {
                    this.toggleTasksPanelVisibilityButton();
                  }}>
														<FontAwesomeIcon icon={faCaretLeft}/>
													</span>
                  }
                </div>
              </div>
            </Col>
            {window.map &&
            <Col md={window.showTasksPanel ? 6 : 10}
                 className={cx(!window.showTasksPanel && window.map ? styles.mapMask : '')} sm={12}>
              <div className={styles.locationMapContainer}>
                {this.renderTasksToShowOnMap(this.state.entities, this.state.routes)}
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
                statuses={(this.state.selectedTask && !this.state.selectedTask.template && this.props.profile) ? this.props.profile.statuses : this.state.statuses}
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
                userProfile={this.props.userProfile}
                creatingActivity={this.state.creatingActivity}
                systemAndCustomMessages={this.props.systemAndCustomMessages}
              />
            </Modal.Body>
          </Modal>
          <TeamEquipmentForm
            closeModal={this.onAssignmentModalClose}
            showModal={this.state.showAssignmentModal}
            entities={this.state.entities}
            equipments={this.props.equipments}
            task_ids={this.state.task_ids}
            showEntitiesWarning={this.state.showEntitiesWarning}
            routeData={this.state.selectedRouteData}
            showEquipmentsWarning={this.state.showEquipmentsWarning}/>
        </Grid>
      </div>
    );
  }

}
