import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {Link} from 'react-router-dom';
import ReactDOM from 'react-dom';
import moment from 'moment';
import styles from './task-timeline.module.scss';
import {
  Popover,
  Button,
  Col,
  Row,
  ControlLabel,
  ButtonGroup,
  DropdownButton,
  MenuItem,
  Overlay,
  Tooltip,
  OverlayTrigger
} from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faCaretDown, faSpinner, faLink} from '@fortawesome/fontawesome-free-solid';
import {faMap} from '@fortawesome/fontawesome-free-regular';
import DatePicker from 'react-bootstrap-date-picker';
import DropdownFilter from '../dropdown-filter/dropdown-filter';
import { DragSource, DropTarget, DragDropContext } from 'react-dnd';
import {FieldGroup} from '../fields';
import {hexToRgb, computeTextColor, hextToRGBA} from '../../helpers/color';
import {getCustomerName} from '../../helpers/task';
import {resendTaskConfirmationNotifications} from '../../actions';
import SavingSpinner from '../saving-spinner/saving-spinner';
import cx from 'classnames';

const thumbWidth = 50, //width of hal hour interval
  firstColumWidth = 100, //width of unspecified column
  taskHeight = 50; //height of tasks

export default class Timeline extends Component {
  constructor(props, context) {
    super(props, context);

    this.changeMode = this.changeMode.bind(this);
    this.emptySlotClickedCallback = this.emptySlotClickedCallback.bind(this);
    this.taskClickedCallback = this.taskClickedCallback.bind(this);
    this.onDateChange = this.onDateChange.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.onDrop = this.onDrop.bind(this);

    this.state = {
      modeBusiness: true,
      viewType: 'week',
      people: [{
        tasks: []
      }],
      selectedEquipmentsFilter: [],
      selectedEntitiesFilter: [],
      selectedTypeEntitiesFilter: [],
      updatingTaskAfterDragDrop: false
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selectedEquipmentsFilter: nextProps.selectedEquipmentsFilter,
      selectedEntitiesFilter: nextProps.selectedEntitiesFilter,
      selectedTypeEntitiesFilter: nextProps.selectedTypeEntitiesFilter,
    });
    this.reverseLookup(
      nextProps.tasks,
      nextProps.equipments,
      nextProps.entities);
  }

  componentWillMount() {
    this.reverseLookup(
      this.props.tasks,
      this.props.equipments,
      this.props.entities
    );
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.handleScroll);
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll);
  }

  handleScroll(event) {
    let pageY = event.pageY ? event.pageY : $(window).scrollTop(),
      topBar = this.timelineLabelsRef,
      currentBarPosition = topBar.parentNode.offsetTop - pageY;

    if (currentBarPosition < 0) {
      topBar.style.top = -currentBarPosition + 'px';
    } else {
      topBar.style.top = 0 + 'px';
    }
  }

  reverseLookup(tasks, equipments, entities) {
    const people = [];
    let entityTypes = [];
    let unassignedTasks = [];
    tasks.map((el) => {
      if (el.entity_ids.length === 0) {
        unassignedTasks.push(el);
      }
    });

    people.push({
      name: 'Unassigned',
      id: -1,
      tasks: unassignedTasks,
      image_path: '/images/info.svg'
    });

    entities.map((entity) => {
      const entityCopy = entity;
      entityCopy['tasks'] = [];
      tasks.map((elTask) => {
        if (elTask.entity_ids) {
          elTask.entity_ids.map((elIds) => {
            if (elIds === entity.id) {
              entityCopy['tasks'].push(elTask);
            }
          });
        }
      });

      people.push(entityCopy);

      if (!entityTypes.some(el => el.id === entity.type)) {
        entityTypes.push({id: entity.type, name: entity.type || "Blank"})
      }
    });

    equipments.map((equipment) => {
      const equipmentCopy = equipment;
      equipmentCopy['tasks'] = [];
      equipmentCopy['equipment'] = true;
      tasks.map((elTask) => {
        if (elTask.resource_ids) {
          elTask.resource_ids.map((elIds) => {
            if (elIds === equipment.id) {
              equipmentCopy['tasks'].push(elTask);
            }
          });
        }
      });
      people.push(equipmentCopy);
    });

    this.setState({
      people, equipments, entities, entityTypes
    });
  }

  taskClickedCallback(task) {
    this.props.onTaskClicked(task);
  }

  onDrop(old_task, new_assignee, old_assignee) {
    if (old_assignee === new_assignee) {
      return;
    }
    const task = $.extend(true, {}, old_task);
    if (task.template_type && task.template_type.toUpperCase() === 'ACTIVITY' && new_assignee.equipment) {
      return;
    }
    if (new_assignee.id === -1) {
      if (old_assignee.id === -1) {

      } else if (old_assignee.equipment) {
        task.resource_ids = [];
      } else {
        task.entity_ids = [];
      }
    } else if (new_assignee.equipment) {
      task.resource_ids = task.resource_ids ? task.resource_ids : [];
      task.resource_ids.push(new_assignee.id);
      if (old_assignee.id === -1) {

      } else if (old_assignee.equipment) {
        const index = task.resource_ids ? task.resource_ids.indexOf(old_assignee.id) : -1;
        if (index > -1) {
          task.resource_ids.splice(index, 1);
        }
      } else {
        const index = task.entity_ids ? task.entity_ids.indexOf(old_assignee.id) : -1;
        if (index > -1) {
          task.entity_ids.splice(index, 1);
        }
      }
    } else {
      task.entity_ids = task.entity_ids ? task.entity_ids : [];
      task.entity_ids.push(new_assignee.id);
      if (old_assignee.id === -1) {

      } else if (old_assignee.equipment) {
        const index = task.resource_ids ? task.resource_ids.indexOf(old_assignee.id) : -1;
        if (index > -1) {
          task.resource_ids.splice(index, 1);
        }
      } else {
        const index = task.entity_ids ? task.entity_ids.indexOf(old_assignee.id) : -1;
        if (index > -1) {
          task.entity_ids.splice(index, 1);
        }
      }
    }
    const taskSentToServer = {
      id: task.id,
      entity_ids: task.entity_ids ? task.entity_ids.join(',') : '',
    };
    if (!task.template_type || task.template_type.toUpperCase() !== 'ACTIVITY') {
      taskSentToServer['resource_ids'] = task.resource_ids ? task.resource_ids.join(',') : '';
    }
    this.setState({ updatingTaskAfterDragDrop: true });
    this.props.updateTask(taskSentToServer).then(() => {
      this.props.updateTaskList(false, false, null, true);
      this.setState({ updatingTaskAfterDragDrop: false });
    }).catch((err) => {
      console.log(err)
    })
  }

  emptySlotClickedCallback(time, index) {
    let allDayClicked = false;
    let meridian, newEventStartDate, newEventEndDate;
    if (this.state.modeBusiness) {
      meridian = index / 12 < 1 ? 'AM' : 'PM';
    } else {
      meridian = (index < 48) && ((index / 2) / 12 >= 1) ? 'PM' : 'AM';
    }

    if (time && meridian && typeof time === 'number') {
      newEventStartDate = moment(this.props.date).toDate();
      let hours;
      const timeFloor = Math.floor(time);
      if (meridian === 'PM') {
        hours = timeFloor !== 12 ? timeFloor + 12 : timeFloor;
      } else {
        hours = timeFloor === 12 ? 0 : timeFloor;
      }
      newEventStartDate.setHours(
        hours,
        time % 1 !== 0 ? 30 : 0,
        0);

      newEventEndDate = moment(newEventStartDate).add(30, 'minutes').toDate();
    }
    if (parseInt(index) === 0) {
      allDayClicked = true;
    }
    let duration = '30 mins';

    this.props.onAddClicked(newEventStartDate, newEventEndDate, allDayClicked, allDayClicked, duration);
  }

  onDateChange(date) {
    this.props.onDateChanged(date);
  }

  changeMode(businessHours) {
    let newBusiness = typeof (businessHours) === "boolean" ? businessHours : !this.state.modeBusiness;
    this.setState({modeBusiness: newBusiness});
  }

  render() {
    let filteredPeople = this.state.people;
    if (this.state.selectedEntitiesFilter.length > 0 ||
      this.state.selectedEquipmentsFilter.length > 0 ||
      this.state.selectedTypeEntitiesFilter.length > 0) {
      filteredPeople = filteredPeople
        .filter(people =>
          this.state.selectedEquipmentsFilter.indexOf(people.id) >= 0 ||
          this.state.selectedEntitiesFilter.length > 0 &&
          this.state.selectedEntitiesFilter.indexOf(people.id) >= 0 ||
          (this.state.selectedTypeEntitiesFilter.length > 0 &&
            this.state.selectedTypeEntitiesFilter.indexOf(people.type) >= 0 && !people.equipment));
    }
    if (this.props.selectedGroupsFilter.length > 0) {
      filteredPeople = filteredPeople.filter(people => {
        return this.props.selectedGroupsFilter.indexOf(people.group_id) >= 0;
      });
    }

    return (
      <div className={styles['team-view-page']}>
        <Date date={this.props.date} onDateChange={this.onDateChange}/>
        <div className={styles["tl-wrapper"]}>
          <TimelineLabels
            inputRef={instance => this.timelineLabelsRef = instance}
            modeBusiness={this.state.modeBusiness}
            changeMode={this.changeMode}
            companyProfile={this.props.companyProfile}
            updatingTaskAfterDragDrop={this.state.updatingTaskAfterDragDrop}
          />
          {filteredPeople.map((el, index) => {
            return <TimelineSingle
              key={index}
              people={el}
              tasks={el.tasks}
              modeBusiness={this.state.modeBusiness}
              taskClickedCallback={this.taskClickedCallback}
              add={this.emptySlotClickedCallback}
              entities={this.props.entities}
              profile={this.props.profile}
              companyProfile={this.props.companyProfile}
              groups={this.props.groups}
              date={this.props.date}
              activityTypes={this.props.activityTypes}
              onDrop={this.onDrop}
            />
          })}
        </div>
        <ModeSwitch
          modeBusiness={this.state.modeBusiness}
          changeMode={this.changeMode}
        />
      </div>
    )
  }
}


Timeline.propTypes = {
  tasks: PropTypes.array,
  entities: PropTypes.array,
  equipments: PropTypes.array,
  date: PropTypes.object,
  mode: PropTypes.string,
  onAddClicked: PropTypes.func,
  onTaskClicked: PropTypes.func,
  onDateChanged: PropTypes.func,
  selectedEquipmentsFilter: PropTypes.array,
  selectedEntitiesFilter: PropTypes.array,
  selectedTypeEntitiesFilter: PropTypes.array,
};

const cardTarget = {
  drop(props, monitor, component) {
    const sourceObj = monitor.getItem();
    props.onDrop(sourceObj.card, props.people, sourceObj.assignee);
  }
};

@DropTarget("CARD", cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: !!monitor.isOver(),
  canDrop: !!monitor.canDrop()
}))
export class TimelineSingle extends Component {
  constructor(props, context) {
    super(props, context);

    this.clickOverlappingContainer = this.clickOverlappingContainer.bind(this);
    this.sendTaskConfirmationNotification = this.sendTaskConfirmationNotification.bind(this);
    this.clearSendNotificationMessage = this.clearSendNotificationMessage.bind(this);
    this.getAddressesFromTasks = this.getAddressesFromTasks.bind(this);
    this.getEntityData = this.getEntityData.bind(this);
    this.hideTooltip = this.hideTooltip.bind(this);

    this.state = {
      tasks: [],
      aggregated_tasks: [],
      openRows: [],
      sending: false,
      sent: false,
      sendingFailed: false,
      showTooltip: false,
      timer: null,
      gettingEntityData: false
    };
  }

  clearSendNotificationMessage() {
    this.setState({
      sent: false,
      sendingFailed: false
    });
  }

  sendTaskConfirmationNotification(entity) {
    this.setState({sending: true, sent: false, sendingFailed: false});
    resendTaskConfirmationNotifications(entity.id, entity.owner, moment(this.props.date).startOf('day').format()).then((res) => {
      this.setState({
        sending: false,
        sent: true,
        sendingFailed: false
      }, () => {
        setTimeout(() => {
          this.clearSendNotificationMessage();
        }, 5000);
      });
    }).catch((err) => {
      console.log(err);
      this.setState({
        sending: false,
        sent: false,
        sendingFailed: true
      }, () => {
        setTimeout(() => {
          this.clearSendNotificationMessage();
        }, 5000);
      });
    });
  }

  componentWillMount() {
    this.aggregateOverlappingTasks(this.props.tasks);
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
  }


  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(nextProps.tasks) !== JSON.stringify(this.state.tasks)) {
      this.aggregateOverlappingTasks(nextProps.tasks);
    }
  }

  aggregateOverlappingTasks(tasks) {
    let tasks_length = tasks.length, tasks_with_aggregation = [], unscheduled_tasks = [],
      openRows = [], time_start, last_time_end, prev_task_time_end, prev_added_index;
    this.setState({tasks});

    unscheduled_tasks = tasks.filter((task) => task.unscheduled || task.all_day);
    tasks = tasks.filter((task) => !task.unscheduled && !task.all_day);
    tasks_length = tasks && tasks.length;
    tasks = tasks.sort(function (a, b) {
      return a.start_datetime - b.start_datetime;
    });



    for (let i = 0; tasks_length > i; i++) {
        if (i === 0) {
          tasks_with_aggregation = [{tasks: [tasks[i]]}];
        } else {
          time_start = tasks[i].start_datetime;
          prev_task_time_end = (tasks[i - 1].end_datetime && tasks[i - 1].end_datetime !== '')
            ?
            tasks[i - 1].end_datetime
            :
            moment.utc(tasks[i].start_datetime).add(1, 'hours').format();
          if (i === 1) {
            last_time_end = prev_task_time_end;
          } else {
            last_time_end = (prev_task_time_end > last_time_end) ? prev_task_time_end : last_time_end;
          }
          if (last_time_end > time_start) {
            prev_added_index = tasks_with_aggregation.length - 1;
            tasks_with_aggregation[prev_added_index].tasks.push(tasks[i]);
          } else {
            tasks_with_aggregation.push({tasks: [tasks[i]]});
          }
        }
    }

    if(unscheduled_tasks && unscheduled_tasks.length > 0) {
      tasks_with_aggregation.push({tasks: unscheduled_tasks});
    }

    tasks_with_aggregation.map((task) => {
      if (task.length > 1) {
        openRows.push(1);
      }
    });
    this.setState({aggregated_tasks: tasks_with_aggregation, openRows});
  }

  hideTooltip() {
    this.setState({
      showTooltip: false
    });
  }

  getEntityData() {
    this.setState({
      gettingEntityData: true,
    });
    const companyLocation = (this.props.companyProfile && this.props.companyProfile.address && this.props.companyProfile.address.length > 0) ? this.props.companyProfile.address : '';
    this.getAddressesFromTasks(companyLocation);
  }

  getAddressesFromTasks(companyLocation) {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    const addresses = [];
    if (companyLocation !== '') {
      addresses.push(companyLocation);
    }
    let url = null;
    if (this.state.tasks && this.state.tasks.length > 0) {
      this.state.tasks.map((task) => {
        if (task.customer_address && task.customer_address !== '') {
          addresses.push(task.customer_address);
        }
        if (task.additional_addresses && task.additional_addresses.length > 0) {
          task.additional_addresses.map((address) => {
            if (address.complete_address && address.complete_address !== '') {
              addresses.push(address.complete_address);
            }
          });
        }
      });
      if (addresses.length === 1) {
        url = 'https://www.google.com/maps/search/?api=1&query=' + addresses[0];
      } else if (addresses.length > 1) {
        url = 'https://www.google.com/maps/dir/?api=1&origin=' + addresses[0] + '&destination=' + addresses[addresses.length - 1] + '&travelmode=driving&waypoints=';
        addresses.splice(0, 1);
      }
      addresses.pop();
      addresses.map((address) => {
        url += address + '|';
      });
      if (url !== null && addresses.length > 0) {
        url = url.slice(0, -1);
      }
    }
    if (url !== null) {
      window.open(url, '_blank');
    } else {
      this.setState({
        showTooltip: true
      });
      const timer = setTimeout(this.hideTooltip, 3000);
      this.setState({
        timer,
      });
    }
    this.setState({
      gettingEntityData: false,
    });
  }

  generateSlots() {
    let startPoint = 11, parts = 61;
    if (this.props.modeBusiness) {
      startPoint = 5;
      parts = 33;
    }
    let slots = [12];
    let hourIndex = startPoint + 0.5;
    for (let i = startPoint; i < parts; i++) {
      hourIndex += 0.5;
      if (hourIndex === 12.5) {
        hourIndex = 0.5;
      }

      slots.push(hourIndex);
    }
    return slots;
  }

  editLongName(name) {
    let nameString = (name !== undefined) ? this.props.people.name.substring(0, 15) : "Loading names";
    if ((name !== undefined) && (name.length > 15)) {
      nameString += "...";
    }
    return nameString;
  }

  clickOverlappingContainer(numTasks, itemKey) {
    let currentOpenRows = this.state.openRows;
    currentOpenRows[itemKey] = parseInt(numTasks);
    for (let i = 0; i < currentOpenRows.length; i++) {
      if (!currentOpenRows[i]) {
        currentOpenRows[i] = 1;
      }
    }
    this.setState({openRows: currentOpenRows});
  }

  generateStatusTooltipMessage(entity_ids, taskConfirmation) {
    if (taskConfirmation && entity_ids.length > 0) {
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
            {entityObj && entityObj.name ? entityObj.name : 'Unknown'} : Response Pending
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
  }

  getEntity(entityId) {
    return this.props.entities.find((entity) => {
      return entityId === entity.id;
    });
  }

  renderTasks(item, index, openRows) {
    let tasks_len = item.tasks.length,
      rows = tasks_len === 1 ? 2 : 1,
      multiple_tasks = [],
      task_inside,
      start_time = 0,
      end_time,
      last_item_color,
      all_day;
    let unscheduleTaskHeight = 0;
    let taskLengthCounter = 0;

    for (let i = 0; tasks_len > i; i++) {
      let el = item.tasks[i],
        start_momentdate = moment.utc(el.start_datetime).local(),
        end_momentdate = (el.end_datetime && el.end_datetime !== '') ? moment.utc(el.end_datetime).local() : moment.utc(el.start_datetime).add(1, 'hours').local(),
        start = parseInt(start_momentdate.get('hour')) * 2,
        end = parseInt(end_momentdate.get('hour')) * 2;
      start = start + (start_momentdate.get('minute') / 30);
      end = end + (end_momentdate.get('minute') / 30);
      if (el.all_day) {
        start = 0;
        end = 2;
      }

      if (i > 0 && el.unscheduled) {
          unscheduleTaskHeight = unscheduleTaskHeight + 50;
      }

      const taskConfirmationStatus = this.generateStatusTooltipMessage(el.entity_ids, el.entity_confirmation_statuses);
      const calendarEventTooltip = (<Tooltip className={styles.customTooltipForConfirmationStatus} id={'idx_' + el.id}>
        <p>{taskConfirmationStatus.generalStatusMessage}</p>
        {taskConfirmationStatus.entityStatusMessage}
      </Tooltip>);
      const activityToolTip = (
        <Popover className={styles.activityToolTip} trigger="focus" id={'idx_' + el.id}>
          <p>{el.title}</p>
          {el.details ? el.details.substring(0, 100) + (el.details.length > 100 ? '...' : '') : ''}
        </Popover>);
      if (tasks_len <= 2) {
        const backgroundColor = el.extra_fields && el.extra_fields.task_color ? el.extra_fields.task_color : '#0693e3';
        let bg_color_rgb = hextToRGBA(backgroundColor, 1);
        if (el.status === 'COMPLETE' || el.status === 'AUTO_COMPLETE') {
          bg_color_rgb = hextToRGBA(backgroundColor, 0.5);
        }
        const text_color = computeTextColor(bg_color_rgb.r, bg_color_rgb.g, bg_color_rgb.b, true);
        let task_simple;
        if (el.template_type === 'TASK') {
          task_simple = (
            <SingleTaskEntry
              task={el}
              index={index}
              companyProfile={this.props.companyProfile}
              taskClickedCallback={this.props.taskClickedCallback}
              i={i}
              start_momentdate={start_momentdate}
              end_momentdate={end_momentdate}
              taskConfirmationStatus={taskConfirmationStatus}
              taskClass={styles['task']}
              titleClass=''
              coverClass=''
              calendarEventTooltip={calendarEventTooltip}
              people={this.props.people}
              style={{
                left: el.unscheduled ? 0 : (!this.props.modeBusiness) ?
                  ((start * thumbWidth) + firstColumWidth) + 'px'
                  :
                  (((start - 12) * thumbWidth) + firstColumWidth) + 'px',
                width: el.unscheduled ? '100px' :((end - start) * thumbWidth + 'px'),
                top: el.unscheduled ? unscheduleTaskHeight + 'px': (i * taskHeight + 'px'),
                height: el.unscheduled ? tasks_len > 1 ? '50px' : '100px' : rows * taskHeight + 'px',
                zIndex: 1,
                color: text_color,
                background: bg_color_rgb,
                borderBottom: '1px #eee solid'
              }}
            />
          );
          taskLengthCounter = el.unscheduled ? 1 : 0;
        } else {
          if (el.all_day) {
            all_day = true;
          }
          task_simple = (
            <SingleActivityEntry
              activity={el}
              index={index}
              taskClickedCallback={this.props.taskClickedCallback}
              i={i}
              activityTypes={this.props.activityTypes}
              activityClass={styles['activity-icon']}
              activityToolTip={activityToolTip}
              people={this.props.people}
              style={{
                left: el.all_day ? '30px' : !this.props.modeBusiness ?
                  ((start * thumbWidth) + firstColumWidth) + 'px'
                  :
                  (((start - 12) * thumbWidth) + firstColumWidth) + 'px',
                width: thumbWidth + 'px',
                top: (rows === 1 ? i : 0.5) * taskHeight + 'px',
                height: rows * taskHeight + 'px',
                zIndex: 1,
              }}
            />);
        }
        multiple_tasks.push(task_simple);
      } else {
        if (i === 0 && !el.unscheduled) {
          start_time = start;
          end_time = end;
        } else {
          if (end_time < end) {
            end_time = end;
          }
          if (i === tasks_len - 1) {
            last_item_color = el.extra_fields && el.extra_fields.task_color ? el.extra_fields.task_color : '#0693e3';
          }
        }

        const backgroundColor = el.extra_fields && el.extra_fields.task_color ? el.extra_fields.task_color : '#0693e3';
        let bg_color_rgb = hextToRGBA(backgroundColor, 1);

        if (el.status === 'COMPLETE' || el.status === 'AUTO_COMPLETE') {
          bg_color_rgb = hextToRGBA(backgroundColor, 0.5);
        }
        const text_color = bg_color_rgb && computeTextColor(bg_color_rgb.r, bg_color_rgb.g, bg_color_rgb.b, true);

        if (el.template_type === 'TASK') {
          if (el.unscheduled) {
            all_day = true;
          }
          task_inside = (
            <SingleTaskEntry
              task={el}
              index={index}
              companyProfile={this.props.companyProfile}
              taskClickedCallback={this.props.taskClickedCallback}
              i={i}
              start_momentdate={start_momentdate}
              end_momentdate={end_momentdate}
              taskConfirmationStatus={taskConfirmationStatus}
              taskClass={styles["task-inside"]}
              titleClass={styles["name"]}
              coverClass={styles['task-cover']}
              calendarEventTooltip={calendarEventTooltip}
              people={this.props.people}
              style={{
                left: el.unscheduled ? '0px' : (start - start_time) > 0 ? (start - start_time - (all_day && this.props.modeBusiness ? 12 : 0)) * thumbWidth + (all_day ? firstColumWidth : 0) : 0 + 'px',
                width: el.unscheduled ? '100px': ((end - start) * thumbWidth + 'px'),
                minWidth: (end - start) * thumbWidth + 'px',
                zIndex: 1,
                background: bg_color_rgb
              }}
            />
          );
        } else {
          if (el.all_day) {
            all_day = true;
          }
          task_inside = (<SingleActivityEntry
            activity={el}
            index={index}
            taskClickedCallback={this.props.taskClickedCallback}
            i={i}
            activityTypes={this.props.activityTypes}
            activityClass={styles["activity-icon-inside"]}
            activityToolTip={activityToolTip}
            people={this.props.people}
            style={{
              left: el.all_day ? '30px' : (start - start_time) > 0 ? (start - start_time - (all_day && this.props.modeBusiness ? 12 : 0)) * thumbWidth + (all_day ? firstColumWidth : 0) : 0 + 'px',
              width: thumbWidth + 'px',
              zIndex: 1,
            }}
          />);
        }
        multiple_tasks.push(task_inside);
      }
    }
    if (tasks_len > 2) {
      return (
        <OverlappingContainer
          key={index}
          itemKey={index}
          openRows={openRows}
          start_time={start_time}
          end_time={end_time}
          tasks_len={tasks_len}
          modeBusiness={this.props.modeBusiness}
          clickContainer={this.clickOverlappingContainer}
          last_item_color={last_item_color}
          multiple_tasks={multiple_tasks}
          all_day={all_day}
        />
      )
    } else {
      return multiple_tasks;
    }
  }

  entityAllTasksConfirmationStatus(entity, tasks) {
    if (tasks.length > 0) {
      let anyAccepted = false;
      let anyRejected = false;
      let allResponded = true;
      for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].entity_confirmation_statuses && tasks[i].entity_confirmation_statuses !== null && entity.id in tasks[i].entity_confirmation_statuses) {
          if (tasks[i].entity_confirmation_statuses[entity.id].status === 'ACCEPTED') {
            anyAccepted = true;
            continue;
          } else if (tasks[i].entity_confirmation_statuses[entity.id].status === 'REJECTED') {
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
        generalStatusMessage = 'Some tasks may require staffing';
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
        statusColor,
        anyAccepted,
        anyRejected,
        allResponded
      };
      return renderedData;
    } else {
      const renderedData = {
        generalStatusMessage: 'Pending Response',
        statusColor: '#666666',
        anyAccepted: false,
        anyRejected: false,
        allResponded: false
      };
      return renderedData;
    }
  }

  render() {
    const {connectDropTarget, isOver, canDrop} = this.props;
    let currentDate = moment(this.props.date).format('YYYY-MM-DD');

    let group_style = styles["tl-group"];
    let slot_style = "";

    const tooltip = (
      <Tooltip>
        <p>{this.props.people.name}</p>
        <p>Task Notification Link</p>
      </Tooltip>
    );

    if (!isOver && canDrop) {
      group_style = cx(styles["tl-group"], styles["tl-group-candrop"]);
      slot_style = styles["tl-slot-candrop"];
    }
    if (isOver && canDrop) {
      group_style = cx(styles["tl-group"], styles["tl-group-dropped"]);
      slot_style = styles["tl-slot-dropped"];
    }

    const group = this.props.groups && this.props.people && this.props.people.group_id && this.props.groups.find((group) => {
      return group.id === this.props.people.group_id;
    });
    const noLocationTooltip = (
      <Tooltip id="tooltip" className={styles.noLocationLootltip}>No location found</Tooltip>
    );
    let t1SingleNotificationStyle = null;
    let t1SlotsNotificationStyles = null;
    if (!this.props.people.equipment && this.props.people.name !== 'Unassigned' && this.props.companyProfile.enable_team_confirmation) {
      t1SingleNotificationStyle = styles['t1-single-notification'];
    }
    if (this.props.companyProfile.enable_team_confirmation) {
      t1SlotsNotificationStyles = styles['t1-slots-notification'];
    }
    const countRows = (this.state.openRows.length > 0) ? Math.max(...this.state.openRows) : 1,
      baseHeight = taskHeight * 2,
      totalHeight = (countRows > 1) ? baseHeight + (countRows * taskHeight) : baseHeight,
      aggregatedTasks = this.state.aggregated_tasks;
    let type = this.props.people.type;
    const entityConfirmationStatus = this.entityAllTasksConfirmationStatus(this.props.people, this.props.people.tasks);
    const entityConfirmationTooltip = (
      <Tooltip id={'idx_' + this.props.people.id}>{entityConfirmationStatus.generalStatusMessage}</Tooltip>
    );
    return (
      <div
        className={cx(styles["tl-single"] + ' ' + ((countRows > 1) ? styles["openContainer"] : ''), t1SingleNotificationStyle)}
        style={{height: countRows > 1 && ((50 * countRows) + 100) + 'px'}}>
        <div className={cx(styles["tl-slots"], t1SlotsNotificationStyles)}>
          <div className={cx(styles['tl-name'] + ' ' + ((type) ? styles['have-type'] : ''), t1SlotsNotificationStyles)}
               ref="target" style={{height: countRows > 1 && ((50 * countRows) + 100) + 'px'}}>
            <img className={styles["avatar"]}
                 src={this.props.people.image_path || (this.props.people.equipment === true ? '/images/equipment.png' : '/images/user-default.svg')}
                 alt=""/>
            <div className={styles['text-name']}>
              {this.editLongName(this.props.people.name)}
            </div>
            <OverlayTrigger placement="bottom" overlay={<Tooltip
              id="timelineEntityInfoTooltip">{type && type}{group && ', ' + group.name}</Tooltip>}>
              <span className={styles.timelineEntityInfo}>{type && type}{group && ', ' + group.name}</span>
            </OverlayTrigger>
            <div className={styles.taskConfirmationStatusContainer}>
              {!this.props.people.equipment &&
              <div className={styles.mapIcon}>
                {!this.state.gettingEntityData ?
                  <div><a ref={button => {
                    this.target = button;
                  }} onClick={this.getEntityData} target="_blank"><FontAwesomeIcon icon={faMap}/></a>
                    <Overlay container={this.refs.target} target={() => ReactDOM.findDOMNode(this.target)}
                             show={this.state.showTooltip} placement="right">
                      {noLocationTooltip}
                    </Overlay>
                  </div>
                  :
                  <FontAwesomeIcon icon={faSpinner} spin/>
                }
              </div>
              }
              {!this.props.people.equipment && this.props.people.name !== 'Unassigned' && this.props.companyProfile && this.props.companyProfile.enable_team_confirmation &&
                <OverlayTrigger placement="bottom" overlay={tooltip}>
                  <a className={styles.confirmationLink} title={this.props.people.name+'\n'+"Task Notification Link"} href={"/task/confirmation/"+this.props.people.url_safe_id+"?"+currentDate}  target="_blank"><FontAwesomeIcon icon={faLink}/></a>
                </OverlayTrigger>
              }
              {!this.props.people.equipment && this.props.people.name !== 'Unassigned' && this.props.companyProfile.enable_team_confirmation &&
              <div className={styles.entityConfirmationStatusWrapper}>
                {this.props.people.tasks.length > 0 &&
                <OverlayTrigger placement="bottom" overlay={entityConfirmationTooltip}>
                      <span style={{backgroundColor: entityConfirmationStatus.statusColor}}
                            className={styles.confirmationStatusIndicatorEntity}>
                        {
                          entityConfirmationStatus.anyRejected && <span>&#10008;</span>
                        }
                        {
                          entityConfirmationStatus.anyAccepted && <span>&#10004;</span>
                        }
                      </span>
                </OverlayTrigger>
                }
                {!this.state.sending && !this.state.sent && !this.state.sendingFailed &&
                <button onClick={() => this.sendTaskConfirmationNotification(this.props.people)}
                        className={styles.sendConfirmationNotificationBtn}>Send Notification</button>
                }
                {!this.state.sending && this.state.sent &&
                <span className={styles.sendNotificationConfirmation}>&#10004; Sent.</span>
                }
                {!this.state.sending && this.state.sendingFailed &&
                <span className={styles.sendNotificationConfirmationFailed}>&#10008; Sending Failed.</span>
                }
                {this.state.sending && !this.state.sent &&
                <SavingSpinner title="" borderStyle="none"/>
                }
              </div>
              }
            </div>
          </div>
        </div>
        {connectDropTarget(
        <div className={group_style}>
          {this.generateSlots().map((el, index) => {
            if (index === 0) {
              return (
                <div className={styles["all-day"] + " " + styles["all-day-slot"] + " " + slot_style} key={index}
                   onClick={() => this.props.add(el, index)} id={{el, index}}>
                  <div className={styles["add"]}>+</div>
                </div>
              );
            } else {
              return (
                <div className={styles["tl-slots"] + " " + styles["tl-timeline-slots"] + " " + slot_style} key={index}
                     onClick={() => this.props.add(el, index)} id={{el, index}}>
                  <div className={styles["add"]}>+</div>
                </div>
              );
            }
          })}
          {(this.props.tasks !== 'undefined') ? aggregatedTasks.map((el, index) => {
            return this.renderTasks(el, index, countRows);
          }) : <div>Loading tasks</div>}
        </div>)}
      </div>
    );
  }
}

export class OverlappingContainer extends Component {
  constructor(props, context) {
    super(props, context);

    this.showChildren = this.showChildren.bind(this);

    this.state = {
      showChildren: false,
    };

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.openRows === 1) {
      this.setState({showChildren: false});
    }
  }

  showChildren(event) {
    event.stopPropagation();
    let clickedElement = event.target;
    let currentState = this.state.showChildren;
    let [countItems, dataKey] = findParentData(clickedElement);
    if (countItems && dataKey && currentState === false) {
      this.setState({showChildren: true});
      this.props.clickContainer(countItems, dataKey);
    } else if (currentState === true) {
      this.setState({showChildren: false});
      this.props.clickContainer(1, dataKey);
    }

    function findParentData(clickedEl) {
      let i = 5, countItems, dataKey;
      while (i > 0) {
        countItems = clickedEl.getAttribute('data-amount');
        dataKey = clickedEl.getAttribute('data-key');
        if (countItems === null && dataKey === null) {
          clickedEl = clickedEl.parentNode;
          i--;
        } else {
          return [countItems, dataKey];
        }
      }
      return [false, false];
    }
  }

  render() {
    const tasks_len = this.props.tasks_len;
    let containerClass = styles['overlapping-container'] + ' ' + ((this.state.showChildren) ? styles["showChildren"] : '');
    const bg_color_rgb = hexToRgb(this.props.last_item_color);
    const text_color = bg_color_rgb && computeTextColor(bg_color_rgb.r, bg_color_rgb.g, bg_color_rgb.b, true);
    return (
      <div data-key={this.props.itemKey} data-amount={tasks_len} className={containerClass}
           onClick={(e) => this.showChildren(e)}
           style={{
             left: this.props.all_day ? '0px' : (!this.props.modeBusiness ?
               (this.props.start_time * thumbWidth + firstColumWidth) + 'px' :
               ((this.props.start_time - 12) * thumbWidth + firstColumWidth) + 'px'),
             width: this.props.all_day ? '100px' : (((this.props.end_time - this.props.start_time - ((this.props.all_day && this.props.modeBusiness) ? 12 : 0)) * thumbWidth) + (this.props.all_day ? 100 : 0)) + 'px',
             height: taskHeight * 2 + 'px',
             background: this.props.last_item_color,
             color: text_color,
             borderBottom: '1px solid #eee'
           }}>
        <div className={styles["task-num"]} style={{paddingTop: taskHeight / 2 + 12 + 'px'}}>
          <span>{tasks_len}</span> Tasks <FontAwesomeIcon icon={faCaretDown} className={styles['arrow-counter']}/>
        </div>
        <div className={styles["items-wrapper"]}
             style={{
               left: this.props.all_day ? '0px' : ((this.props.end_time - this.props.start_time) * thumbWidth) / 2
             }}>
          {this.props.multiple_tasks}
        </div>
      </div>
    )
  }
}

export class TimelineLabels extends Component {
  generateLabels() {
    let startPoint = 11, parts = 36, label = 'am';
    if (this.props.modeBusiness) {
      startPoint = 5;
      parts = 19;
    } else {
      label = 'pm';
    }
    let hour = startPoint;
    let labels = [];
    for (let i = startPoint; i < parts; i++) {
      hour++;
      if (hour === 13 && parts === 19 || hour === 13 && i === 24) {
        hour = 1;
        label = "pm";
      } else if (hour === 13 && i === 12) {
        hour = 1;
        label = "am";
      }
      labels.push({'hour': hour, 'label': label});
    }
    labels.unshift({'hour': 'Unspecified', label: ''});
    return labels;
  }

  viewSwitcher() {
    return (
      <ButtonGroup className={styles.dropdownOptions}>
        <DropdownButton
          key="dropdown"
          id="bg-nested-dropdown"
          title="&#10247;"
        >
          <MenuItem onClick={() => this.props.changeMode(true)} active={this.props.modeBusiness}
                    href={'javascript:void(0)'}>
            Bussiness hours
          </MenuItem>
          <MenuItem onClick={() => this.props.changeMode(false)} active={!this.props.modeBusiness}
                    href={'javascript:void(0)'}>
            Show full day
          </MenuItem>
        </DropdownButton>
      </ButtonGroup>
    )
  }

  render() {
    let t1SlotsNotificationStyles = null;
    if (this.props.companyProfile.enable_team_confirmation) {
      t1SlotsNotificationStyles = styles['t1-slots-notification'];
    }
    return (
      <div className={styles["tl-labels"]}>
        <div className={styles["labels-container"]} ref={this.props.inputRef}>
          <div className={cx(styles["tl-label"], t1SlotsNotificationStyles)}>
            {this.viewSwitcher()}
            {this.props.updatingTaskAfterDragDrop && <SavingSpinner title="Saving Changes" borderStyle="none"/>}
          </div>
          {this.generateLabels().map((el, index) => {
            if (index === 0) {
              return (
                <div className={styles["tl-all-day"]} key={index}>
                  {el.hour}
                </div>
              )
            } else {
              return (
                <div className={styles["tl-label"]} key={index}>
                  {el.hour}<span>{el.label}</span>
                </div>
              )
            }
          })}
        </div>
      </div>
    )
  }
}

export class Date extends Component {
  render() {
    let arrow = <svg xmlns="http://www.w3.org/2000/svg" width="13.657" height="13.657" viewBox="0 0 13.657 13.657"><path d="M-90.024,11.657a.908.908,0,0,1-.675-.3.908.908,0,0,1-.3-.675V2.911A.911.911,0,0,1-90.09,2a.911.911,0,0,1,.911.911V9.836h6.925a.911.911,0,0,1,.911.911.911.911,0,0,1-.911.91Z" transform="translate(-58.932 -49.276) rotate(-135)" fill="currentColor"/></svg>;
    return (

      <div className={cx(styles.datePickerWrapper, styles['date'])}>
        <i className={cx(styles.arrow, styles.prev)} onClick={() => {
          let temp = moment(this.props.date);
          temp = temp.subtract(1, "days");
          this.props.onDateChange(temp.toDate());
        }}>{arrow}</i>
        <FieldGroup
          id="start-date"
          componentClass={DatePicker}
          onChange={this.props.onDateChange}
          name="start-date"
          value={moment(this.props.date).format()}
          className={styles['timelineDatePicker']}
          showClearButton={false}
        />
        <i className={cx(styles.arrow)} onClick={() => {
          let temp = moment(this.props.date);
          temp = temp.add(1, "days");
          this.props.onDateChange(temp.toDate());
        }}>{arrow}</i>
      </div>
    )
  }
}

export class ModeSwitch extends Component {

  render() {
    return (
      <div className={styles["mode-switch"]} onClick={this.props.changeMode}>
        {this.props.modeBusiness ? "Show full day" : "Show business hours"}
      </div>
    )
  }
}


const cardSource = {
  beginDrag(props) {
    return {
      card: props.task || props.activity,
      assignee: props.people
    };
  },

  endDrag(props, monitor) {
    const item = monitor.getItem();
  }
};

/**
 * Specifies which props to inject into your component.
 */
function collect(connect, monitor) {
  return {
    // Call this function inside render()
    // to let React DnD handle the drag events:
    connectDragSource: connect.dragSource(),
    // You can ask the monitor about the current drag state:
    isDragging: monitor.isDragging()
  };
}

@DragSource('CARD', cardSource, collect)
export class SingleTaskEntry extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { isDragging, connectDragSource } = this.props;
    const { task, index, style, companyProfile, taskClickedCallback, i, start_momentdate, end_momentdate,
      taskConfirmationStatus, taskClass, titleClass, coverClass, calendarEventTooltip } = this.props;

    return connectDragSource(
      <div
        onClick={() => taskClickedCallback(task, task.title, task.id)}
        className={taskClass}
        key={index + i}
        style={style}
      >
        <div className={coverClass}>
          <p className={titleClass}>
            {companyProfile && companyProfile.enable_team_confirmation &&
            <OverlayTrigger placement="bottom" overlay={calendarEventTooltip}>
              <span style={{ backgroundColor: taskConfirmationStatus.statusColor }}
                    className={styles.confirmationStatusIndicator}/>
            </OverlayTrigger>
            }
            {task.title}
          </p>
          <p className="content">
            {start_momentdate.format('hh:mm A')} - {end_momentdate.format('hh:mm A')}
          </p>
          <p>{getCustomerName(task.customer_first_name, task.customer_last_name)}</p>
          <p className="address">{task.customer_address}</p>
        </div>
      </div>
    );
  }
}

@DragSource('CARD', cardSource, collect)
export class SingleActivityEntry extends Component {
  constructor(props, context) {
    super(props, context);
  }

  render() {
    const { isDragging, connectDragSource } = this.props;
    const { activity, taskClickedCallback, index, i, style, activityTypes, activityClass, activityToolTip } = this.props;
    const activityType = activityTypes && activityTypes.find((single_activity_type) => { return activity.activity_type === single_activity_type.type });
    return connectDragSource(
      <div onClick={() => taskClickedCallback(activity, activity.title, activity.id)}
            key={index + i}
            className={activityClass}
            style={style}>
        <OverlayTrigger placement="top" overlay={activityToolTip}>
          {activityType ? activityType.icon : 'X'}
        </OverlayTrigger>
      </div>
    );
  }
}
