import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Table, OverlayTrigger, Overlay, Tooltip, Checkbox } from 'react-bootstrap';
import { getStatusDetails } from '../../helpers/status_dict_lookup';
import moment from 'moment';
import styles from './tasks-list-view.module.scss';
import cx from 'classnames';
import { hextToRGBA } from '../../helpers/color';
import { activityTypes } from '../../helpers/activity-types-icons';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { updateCompanyProfileInformation } from '../../actions';
import { DragDropContext, DragSource, DropTarget } from 'react-dnd';
import FilterOption from './filter-option';
import { getFilterIcon, getFilterLabel } from '../../helpers/filter-data';


const cardTarget = {
  drop(props, monitor, component) {
    const sourceObj = monitor.getItem();
  }
};

@DropTarget("CARD", cardTarget, (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: !!monitor.isOver(),
  canDrop: !!monitor.canDrop()
}))
export default class TasksListView extends Component {
  constructor(props) {
    super(props);
    this.renderTasksList = this.renderTasksList.bind(this);
    this.getEntities = this.getEntities.bind(this);
    this.matchedIdIndex = this.matchedIdIndex.bind(this);
    this.renderUnscheduledTasksList = this.renderUnscheduledTasksList.bind(this);
    this.prevPaginationClicked = this.prevPaginationClicked.bind(this);
    this.nextPaginationClicked = this.nextPaginationClicked.bind(this);
    this.onTaskSelect = this.onTaskSelect.bind(this);
    this.onSelectAllClick = this.onSelectAllClick.bind(this);
    this.generateStatusTooltipMessage = this.generateStatusTooltipMessage.bind(this);
    this.getEquipments = this.getEquipments.bind(this);
    this.getAdditionalAddresses = this.getAdditionalAddresses.bind(this);
    this.isMultipleAddressAvailable = this.isMultipleAddressAvailable.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
    this.changeListFilter = this.changeListFilter.bind(this);
    this.initializeFilterOptionsAndCount = this.initializeFilterOptionsAndCount.bind(this);
    this.updateListFilter = this.updateListFilter.bind(this);
    this.getDefaultFilterDataFromTask = this.getDefaultFilterDataFromTask.bind(this);
    this.getTemplateFilterDataFromTask = this.getTemplateFilterDataFromTask.bind(this);
    this.dragOptions = this.dragOptions.bind(this);
    this.state = {
      teamMembers: '',
      groupDate: '',
      startDate: '',
      endDate: '',
      toggleFilterList: false,
      filtersOptions: {},
      listLoader: false,
      selectedFiltersCount: 0,
    };
  }

  componentDidMount() {
    let is_company = false;
    if (this.props.profile && this.props.profile.permissions && this.props.profile.permissions.includes('COMPANY')) is_company = true;
    if (is_company || this.props.profile.permissions.includes('VIEW_TEAM_CONFIRMATION_DATA')) this.can_view_team_confirmation = true;
    if (is_company || this.props.profile.permissions.includes('VIEW_TASK_LIST_VIEW_COLUMN_FILTERS')) this.can_view_task_list_column_filter = true;

    const filtersOptions = this.props.companyProfile.filters || {};
    this.initializeFilterOptionsAndCount(filtersOptions);
    this.setState({ filtersOptions, loading: true });

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.showSpinner && this.state.loading) {
      this.setState({ loading: false });
    }
  }

  matchedIdIndex(elem, id) {
    if (elem === id) {
      return elem;
    } else {
      return -1;
    }
  }

  onTaskSelect(e, task_id) {
    e.stopPropagation();

    this.props.onTaskSelection(task_id);
  }

  onSelectAllClick() {
    const task_ids = [];
    if (this.props.tasks) {
      this.props.tasks.map(task => task_ids.push(task.id));
    }
    if (this.props.unscheduledEvents) {
      this.props.unscheduledEvents.map(task => task_ids.push(task.id));
    }
    this.props.onSelectionChange(task_ids);
  }

  dragOptions(draggedItem, draggedAfter) {
    const filtersOptions = this.state.filtersOptions;
    const selected_view_type = this.props.view && this.props.view === 'unscheduled' ? 'unschedule_tasks_filters' : 'schedule_tasks_filters';
    const dragAfterIndex = filtersOptions[selected_view_type].findIndex((option) => {
      return option.name === draggedAfter.name && option.template_id === draggedAfter.template_id && option.type === draggedAfter.type;
    });
    const draggingItemIndex = filtersOptions[selected_view_type].findIndex((option) => {
      return option.name === draggedItem.name && option.template_id === draggedItem.template_id && option.type === draggedItem.type;
    });
    if (draggingItemIndex === dragAfterIndex) {
      return;
    }
    filtersOptions[selected_view_type].splice(draggingItemIndex, 1);
    filtersOptions[selected_view_type].splice(dragAfterIndex, 0, draggedItem);
    this.setState({
      filtersOptions
    });
  }

  generateStatusTooltipMessage(entity_ids, taskConfirmation, task) {
    let entities = $.extend(true, [], this.props.entities);
    if (task.entities_data) {
      entities.push.apply(entities, task.entities_data);
      entities = entities.filter((value, index) => {
        return entities.map((entity) => {
          return entity.id;
        }).indexOf(value.id) === index;
      });
    }
    if (entities.length > 0) {
      if (taskConfirmation && entity_ids.length > 0) {
        const entityStatusMessage = entity_ids.map((entity) => {
          const entityObj = this.getEntity(entity);
          if (entity in taskConfirmation) {
            return (
              <p>{entityObj && entityObj.name ? entityObj.name : 'Unknown'} : {taskConfirmation[entity].status}</p>);
          } else {
            return (<p>{entityObj && entityObj.name ? entityObj.name : 'Unknown'} : PENDING</p>);
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

  getEntities(entities, print_view) {
    if (entities.length > 0) {
      let assignees = [];
      let IDs = [];
      let extraAssignees = [];
      let extraEntitiesToShow;
      if (!print_view) {
        let extraIDs = [];
        const entitiesToShow = 2;
        const extraEntities = entities.slice(entitiesToShow, entities.length);
        entities = entities.slice(0, entitiesToShow);
        const extraEntitiesToolTip = (<Tooltip>{extraEntities.map((id, key) => {
          extraAssignees = this.props.entities.map((entity) => {
            extraIDs.push(entity.id);
            if (id === entity.id) {
              return (<div key={key}>{entity.name}</div>
              );
            }
          });
          if (extraIDs.indexOf(id) < 0) {
            extraAssignees.push(<div>Unknown</div>);
          }
          return extraAssignees;
        })}
        </Tooltip>);
        extraEntitiesToShow = extraEntities && extraEntities.length > 0 && (
          <div className={cx(styles.entity)}>
            <div className={cx(styles.entityImage)}>+{extraEntities.length}</div>
            <div className={cx(styles.entityName)}>
              <OverlayTrigger placement={'bottom'}
                              overlay={extraEntitiesToolTip}><span>{extraEntities.length} more</span></OverlayTrigger>
            </div>
          </div>
        );
      }
      entities.map((id, key) => {
        this.props.entities.map((entity) => {
          if (id === entity.id) {
            let assignee = (
              <div key={key} className={cx(styles.entity)}>
                <div className={cx(styles.entityImage)}>
                  <img src={entity.image_path ? entity.image_path : '/images/user-default.svg'} alt={entity.name}
                       height={30} width={30} style={{ borderColor: (entity.color ? entity.color : '#348AF7') }}/>
                </div>
                <div className={cx(styles.entityName)}>
                  <OverlayTrigger placement={'bottom'} overlay={<Tooltip id={key}>{entity.name}</Tooltip>}>
                    <span>{entity.name}</span>
                  </OverlayTrigger>
                </div>
              </div>);
            assignees.push(assignee);
          }
          IDs.push(entity.id);
        });
        if (IDs.indexOf(id) < 0) {
          assignees.push(<div className={cx(styles.entity)}>
            <div className={cx(styles.entityImage)}>
              <img src={'/images/info.svg'} alt={'Unknown'} style={{ borderColor: '#348AF7' }} height={30} width={30}/>
            </div>
            <div className={cx(styles.entityName)}>
              <span>Unknown</span>
            </div>
          </div>);
        }
      });
      !print_view && assignees.push(extraEntitiesToShow);
      return assignees;
    } else {
      return (
        <span>Unassigned</span>
      );
    }
  }

  getEquipments(equipment_ids) {
    if (equipment_ids && equipment_ids.length > 0) {
      let equipments = [];
      let IDs = [];
      equipment_ids.map(id => {
        this.props.equipments.find(equipment => {
          if (id === equipment.id) {
            equipments.push(equipment.name);
            equipments.push(<br/>);
          }
          IDs.push(equipment.id);
        });
        if (IDs.indexOf(id) < 0) {
          equipments.push('Unknown');
          equipments.push(<br/>);
        }
      });
      return equipments;
    }
  }

  getAdditionalAddresses(task) {
    let addresses_list = [];
    let addresses = task.additional_addresses;
    let primaryAddress = [];
    if ((task.customer_address_line_1 && task.customer_address_line_1.trim()) || (task.customer_address_line_2 && task.customer_address_line_2.trim())) {
      primaryAddress.push([task.customer_address_line_1 ? task.customer_address_line_1.trim() : '', task.customer_address_line_2 ? task.customer_address_line_2.trim() : ''].join(' ').trim());
      primaryAddress.push(<br/>);
    }
    if ((task.customer_city && task.customer_city.trim()) || (task.customer_state && task.customer_state.trim()) || (task.customer_zipcode && task.customer_zipcode.trim())) {
      primaryAddress.push([task.customer_city ? task.customer_city.trim() : '', task.customer_state ? task.customer_state.trim() : '', task.customer_zipcode ? task.customer_zipcode.trim() : ''].join(' ').trim());
    }

    if (primaryAddress.length > 0) {
      addresses_list.push(<li>{primaryAddress}</li>);
    }

    if (addresses && addresses.length > 0) {
      addresses.map((address, key) => {
        let additional_addresses_list = [];
        if (address.complete_address && address.complete_address.trim().length > 0) {
          if ((address.address_line_1 && address.address_line_1.trim()) || (address.address_line_2 && address.address_line_2.trim())) {
            additional_addresses_list.push([address.address_line_1 ? address.address_line_1.trim() : '', address.address_line_2 ? address.address_line_2.trim() : ''].join(' ').trim());
            additional_addresses_list.push(<br/>);
          }
          if ((address.city && address.city.trim()) || (address.state && address.state.trim()) || (address.zipcode && address.zipcode.trim())) {
            additional_addresses_list.push([address.city ? address.city.trim() : '', address.state ? address.state.trim() : '', address.zipcode ? address.zipcode.trim() : ''].join(' ').trim());
          }
        }
        if (additional_addresses_list.length > 0) {
          addresses_list.push(<li key={key}>{additional_addresses_list}</li>);
        }
      });
    }
    return (addresses_list.length > 0 ?
      <ol className={addresses_list.length > 1 ? '' : styles.listNone}>{addresses_list}</ol> : '');
  }

  isMultipleAddressAvailable(primaryAddress, addresses) {
    let multipleAddressAvailable = 0;
    if (primaryAddress && primaryAddress.trim().length > 0) {
      multipleAddressAvailable += 1;
    }
    if (addresses && addresses.length > 0) {
      addresses.map(address => {
        if (address.complete_address && address.complete_address.trim().length > 0) {
          multipleAddressAvailable += 1;
        }
      });
    }
    if (multipleAddressAvailable > 1) {
      return true;
    }
    return false;
  }

  prevPaginationClicked() {
    this.props.paginationPrevClicked();
  }

  nextPaginationClicked() {
    this.props.paginationNextClicked();
  }

  getDefaultFilterDataFromTask(filterName, task, task_index, unscheduled = false) {
    if (filterName === 'ASSIGNEE') {
      return (
        <td className={styles[filterName.toLowerCase()]}>
          <div className={styles.hideInPrint}>{this.props.entities.length > 0 && this.getEntities(task.entity_ids, false)}</div>
          <div className={styles.showInPrint}>{this.props.entities.length > 0 && this.getEntities(task.entity_ids, true)}</div>
        </td>
      );
    } else if (filterName === 'ADDRESS') {
      return (<td className={styles[filterName.toLowerCase()]}>{this.getAdditionalAddresses(task)}</td>);
    } else if (filterName === 'INSTRUCTIONS') {
      return (<td className={styles[filterName.toLowerCase()]}><p>{task.details ? task.details.trunc(150) : ''}</p></td>);
    } else if (filterName === 'TIME') {
      return (
        <td className={cx(styles[filterName.toLowerCase()])}>
          {!unscheduled && (task.template_type === 'ACTIVITY' && task.all_day ? '' : <time>{moment.utc(task.start_datetime).local().format('hh:mm A')}</time>)}
          {unscheduled && <time>No dates assigned</time>}
        </td>
      );
    } else if (filterName === 'TASK_TITLE_AND_CUSTOMER') {
      if (unscheduled) {
        return (
          <td className={styles[filterName.toLowerCase()]}>
            <div className={styles.taskEssentials}>
              <div className={styles.entityColor} style={{ background: bg_color_rgb }}/>
              <div>
                <div className={styles.taskTitle}>{task.title}</div>
                {task.customer_name}
              </div>
            </div>
          </td>
        );
      }
      const statusInfo = this.generateStatusTooltipMessage(task.entity_ids, task.entity_confirmation_statuses, task);
      const taskStatusTooltip = (
        <Tooltip className={styles.customTooltipForConfirmationStatus} id={'idx_' + task.id}>
          <p>{statusInfo.generalStatusMessage}</p>
          {statusInfo.entityStatusMessage}
        </Tooltip>
      );
      const backgroundColor = task.extra_fields && task.extra_fields.task_color ? task.extra_fields.task_color : '#0693e3';
      let bg_color_rgb = hextToRGBA(backgroundColor, 1);
      if (task.status === 'COMPLETE' || task.status === 'AUTO_COMPLETE') {
        bg_color_rgb = hextToRGBA(backgroundColor, 0.5);
      }
      const activityIconTooltip = (<Tooltip
        id={'idx_' + task_index}>{task.details ? task.details.substring(0, 100) + (task.details.length > 100 ? '...' : '') : 'Notes not found'}</Tooltip>);
      return (
        <td className={styles[filterName.toLowerCase()]}>
          <div className={styles.tasksTitleInner}>
            {(this.props.view && this.props.view !== 'unscheduled') &&
            <div className={styles.activityMask}>
              {task.template_type === 'TASK' && this.can_view_team_confirmation && this.props.companyProfile.enable_team_confirmation && this.props.entities.length > 0 ?
                statusInfo.statusColor &&
                <OverlayTrigger placement="bottom" overlay={taskStatusTooltip}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 15 15"
                       className={styles.confirmationStatusIndicator}>
                    <circle cx="7.5" cy="7.5" r="7.5" transform="translate(0 0)"
                            fill={statusInfo.statusColor ? statusInfo.statusColor : '#666'}/>
                  </svg>
                </OverlayTrigger>
                :
                activityTypes.find((activity) => activity.type === task.activity_type) &&
                <OverlayTrigger placement="bottom" overlay={activityIconTooltip}>
                    <span
                      className={styles['activity-icon']}>{activityTypes.find((activity) => activity.type === task.activity_type).icon}</span>
                </OverlayTrigger>
              }
            </div>}
            <div className={styles.taskEssentials}>
              {task && task.template_type === 'TASK' &&
              <div className={cx(styles.entityColor)} style={{ background: bg_color_rgb }}/>}
              <div>
                <div className={styles.taskTitle}>{task.title}</div>
                {task.customer_name}
              </div>
            </div>
          </div>
        </td>
      );
    } else if (filterName === 'EQUIPMENT') {
      return (<td className={styles[filterName.toLowerCase()]}>{this.props.equipments.length > 0 && this.getEquipments(task.resource_ids)}</td>);
    } else if (filterName === 'STATUS') {
      return (<td className={styles[filterName.toLowerCase()]}>{getStatusDetails(task.status) ? getStatusDetails(task.status).label : task.status}</td>);
    } else if (filterName === 'SOURCE') {
      return (<td className={styles[filterName.toLowerCase()]}>{task.external_url}</td>);
    } else if (filterName === 'CREATION_DATE') {
      return (
        <td className={styles[filterName.toLowerCase()]}>
          <time>
            {moment.utc(task.created).local().format('MMMM DD, YYYY')}<br/>
            {moment.utc(task.created).local().format('hh:mm A')}
          </time>
        </td>
      );
    }
  }

  getTemplateFilterDataFromTask(filterName, task) {
    if (!task.template_extra_fields)
      return <td></td>;
    const extra_field = task.template_extra_fields.find((field) => {
      return field.name === filterName;
    });
    if (!extra_field)
      return <td></td>;

    return <td>{extra_field.value}</td>;
  }

  renderTasksList() {
    String.prototype.trunc = String.prototype.trunc || function (n) {
      return (this.length > n) ? this.substr(0, n - 1) + '...' : this;
    };
    const tasks = this.props.tasks;
    const filtersOptions = this.state.filtersOptions;
    const selected_view_type = this.props.view && this.props.view === 'unscheduled' ? 'unschedule_tasks_filters' : 'schedule_tasks_filters';
    let localDate = new Date();
    let flag = false;
    let showSelectionButtons = false;
    if (!this.props.unscheduledEvents || this.props.unscheduledEvents.length === 0) {
      showSelectionButtons = true;
    }
    if (tasks.length > 0) {
      return tasks.map((task, key) => {
        if (localDate !== moment.utc(task.start_datetime).local().format('MMMM, DD')) {
          localDate = moment.utc(task.start_datetime).local().format('MMMM, DD');
          flag = true;
        } else {
          flag = false;
        }
        if (key > 0) {
          showSelectionButtons = false;
        }
        return (<tbody>
        {flag && <tr className={cx(styles.emptyRow, styles.dateRow)}>
          <td colSpan={this.state.selectedFiltersCount}>
            <div className={styles['date']}>
              <time>{moment.utc(task.start_datetime).local().format('MMMM D')}</time>
            </div>
          </td>
        </tr>}
        <tr className={cx(styles.task, this.props.view && this.props.view === 'unscheduled' ? styles.unscheduledTask : '')} onClick={() => this.props.onTaskClicked(task)} key={key}>
          {filtersOptions && filtersOptions[selected_view_type] && filtersOptions[selected_view_type].map((item) => {
            if (item.type.toLowerCase() === 'default' && item.is_selected) {
              return this.getDefaultFilterDataFromTask(item.name, task, key);
            } else if (item.type.toLowerCase() === 'template' && item.is_selected) {
              return this.getTemplateFilterDataFromTask(item.name, task);
            }
            return ''
          })}
        </tr>
        <tr className={styles.emptyRow}>
          <td height="8px" colSpan={this.state.selectedFiltersCount}/>
        </tr>
        </tbody>);
      });
    }
  }

  renderUnscheduledTasksList() {
    String.prototype.trunc = String.prototype.trunc || function (n) {
      return (this.length > n) ? this.substr(0, n - 1) + '...' : this;
    };
    let unscheduledEvents = '';
    const filtersOptions = this.state.filtersOptions;
    const selected_view_type = this.props.view && this.props.view === 'unscheduled' ? 'unschedule_tasks_filters' : 'schedule_tasks_filters';
    if (this.props.unscheduledEvents.length > 0) {
      unscheduledEvents = this.props.unscheduledEvents.map((task, key) => {
        return (
          <tbody>
          <tr className={cx(styles.task, styles.unscheduledTask)} onClick={() => this.props.onTaskClicked(task)} key={key}>
            {filtersOptions && filtersOptions[selected_view_type] && filtersOptions[selected_view_type].map((item) => {
              if (item.type.toLowerCase() === 'default' && item.is_selected) {
                return this.getDefaultFilterDataFromTask(item.name, task, key, true);
              } else if (item.type.toLowerCase() === 'template' && item.is_selected) {
                return this.getTemplateFilterDataFromTask(item.name, task);
              }
              return ''
            })}
          </tr>
          <tr className={styles.emptyRow}>
            <td height="8px" colSpan={this.state.selectedFiltersCount}/>
          </tr>
          </tbody>
        );
      });
    }
    return unscheduledEvents;
  }

  toggleFilter() {
    this.setState({
      toggleFilterList: !this.state.toggleFilterList
    });
  }

  changeListFilter(item) {
    let filtersOptions = this.state.filtersOptions;
    const selected_view_type = this.props.view && this.props.view === 'unscheduled' ? 'unschedule_tasks_filters' : 'schedule_tasks_filters';
    const itemIndex = filtersOptions[selected_view_type].findIndex((option) => {
      return item.name === option.name && item.template_id === option.template_id && item.type === option.type;
    });
    if (itemIndex >= 0) {
      filtersOptions[selected_view_type][itemIndex].is_selected = !filtersOptions[selected_view_type][itemIndex].is_selected;
      let selectedFiltersCount = this.state.selectedFiltersCount;
      if (filtersOptions[selected_view_type][itemIndex].is_selected) {
        selectedFiltersCount = selectedFiltersCount + 1;
      } else {
        selectedFiltersCount = selectedFiltersCount - 1;
      }
      this.setState({
        filtersOptions,
        selectedFiltersCount
      });
    }
  }

  initializeFilterOptionsAndCount(filtersOptions = this.state.filtersOptions) {
    const selected_view_type = this.props.view && this.props.view === 'unscheduled' ? 'unschedule_tasks_filters' : 'schedule_tasks_filters';
    const selectedFiltersCount = (filtersOptions && filtersOptions[selected_view_type]) ? filtersOptions[selected_view_type].filter((filterOption) => {
      return filterOption.is_selected;
    }).length : 0;
    this.props.templates && this.props.templates.map((template) => {
      template && template.extra_fields.map((field) => {
        const single_extra_field_option = {
          name: field.name,
          type: 'template',
          template_id: template.id,
          template_name: template.name,
          is_selected: false,
        };

        if (!filtersOptions['schedule_tasks_filters'].find((option) => {
          return option.name === field.name && option.type === 'template' && option.template_id === template.id;
        })) {
          filtersOptions['schedule_tasks_filters'].push($.extend(true, {}, single_extra_field_option));
        }

        if (!filtersOptions['unschedule_tasks_filters'].find((option) => {
          return option.name === field.name && option.type === 'template' && option.template_id === template.id;
        })) {
          filtersOptions['unschedule_tasks_filters'].push($.extend(true, {}, single_extra_field_option));
        }

      });
    });
    this.setState({ filtersOptions, selectedFiltersCount });
  }

  updateListFilter() {
    this.setState({ listLoader: true });
    updateCompanyProfileInformation({ filters: JSON.stringify(this.state.filtersOptions) }).then(() => {
      this.setState({
        listLoader: false,
        toggleFilterList: false
      });
    });
  }

  render() {
    const {connectDropTarget, isOver, canDrop} = this.props;
    let prevDisabled = false;
    let nextDisabled = false;
    let prevRequired = true;
    let nextRequired = true;
    if (this.props.page === 1) {
      prevDisabled = true;
      prevRequired = false;
    }
    if (this.props.tasks.length < this.props.items_per_page) {
      nextDisabled = true;
      nextRequired = false;
    }

    const filtersOptions = this.state.filtersOptions;
    const selected_view_type = this.props.view && this.props.view === 'unscheduled' ? 'unschedule_tasks_filters' : 'schedule_tasks_filters';
    return (
      <div className={styles.tableListWrapper}>
        <style type="text/css" media="print">
          {/*{'table { page-break-after:auto !important;display: inline-table;vertical-align: top;width: 100%; }'}*/}
          {/*{'table tr, table tr td, table tr th { -webkit-column-break-inside: avoid !important; page-break-inside: avoid !important; break-inside: avoid; !important; page-break-after:auto !important; }'}*/}
          {/*{'table thead { display:table-header-group }'}*/}
          {/*{'table tfoot { display:table-footer-group }'}*/}
          {'.' + styles.tableListWrapper + ' * {-webkit-box-sizing: border-box;-moz-box-sizing: border-box;box-sizing: border-box;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.showInPrint + '{display:block;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.hideInPrint + '{display:none;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.listFilter + '{display:none;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + '{color: #000000;font: 300 12px/16px Nunito,-apple-system,BlinkMacSystemFont,sans-serif;margin: 0;padding: 0;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' thead tr th {text-align:left;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' thead tr th img{display:none !important;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' thead tr td {display:none;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' tbody tr td {border: none;font-size: inherit; padding: 5px;vertical-align: top;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' tbody tr.' + styles.dateRow + ' td { padding: 0;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' tbody tr td.' + styles.emptyRow + ':not(.' + styles.dateRow + ') {display:none;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.date + '{border-bottom: 2px solid #000000;margin-bottom: 2px;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.date + ' time{font-size: 14px;line-height: 26px;font-weight:bold; min-width: inherit; padding: 0;display: inline-block;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.time + ' {padding-left: 0}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.time + ' time{font-size: 12px;font-weight: bold;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.tasksTitle + ' .' + styles.tasksTitleInner + '{ display: -ms-flexbox;display: flex;-ms-flex-align: center; align-items: center;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.activityMask + ':not(:empty){margin-right: 15px;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.taskEssentials + '{ display: -ms-flexbox; display: flex;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.taskEssentials + ' > div:last-child{  padding: 5px 0;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.taskEssentials + ' .' + styles.entityColor + '{display: none;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.taskEssentials + ' .' + styles.taskTitle + '{margin-bottom: 5px;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.entity + '{ display: -ms-flexbox;display: flex;-ms-flex-align: center;align-items: center;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.entity + ':not(:last-child){ margin-bottom: -8px;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.entity + ' .' + styles.entityImage + '{ font-size:12px;background-color: #348AF7;line-height: 30px;text-align: center;color: #fff;min-width: 30px;max-width: 30px;min-height: 30px;max-height: 30px;border-radius: 50%;margin-right: 10px;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.entity + ' .' + styles.entityImage + ' img{ border-radius: 50%;min-width: 30px;max-width: 30px;min-height: 30px;max-height: 30px;display: block;border-width: 2px;border-style: solid;object-fit: cover; }'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.entity + ' .' + styles.entityName + '{ display: block;white-space: nowrap;text-overflow: ellipsis;overflow: hidden; }'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.address + ' ol{ padding-left: 20px;margin-bottom: 0; }'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.address + ' ol.' + styles.listNone + '{ padding-left: 0;list-style: none; }'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.address + ' ol li:not(:last-child) { margin-bottom: 4px; }'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles['activity-icon'] + ' { font-size: 16px; }'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.confirmationStatusIndicator + ' { display: inline-block;width: 10px;height: 10px; }'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.confirmationStatusIndicator + ' svg{ width: 10px;height: 10px; }'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.task + ' .' + styles.externalUrl + ' { word-break: break-all; }'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.time + '{ min-width: 90px;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.tasksTitle + '{width: 20%;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.assignees + '{width: 15%;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.instructions + '{width: 20%;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.address + '{width: 20%;}'}
          {'.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.externalUrl + ',' +
          '.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.equipments + ',' +
          '.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.status + ',' +
          '.' + styles.tableListWrapper + ' .' + styles.tableList + ' .' + styles.unscheduledTime + '{width: 10%;}'}
        </style>
        {this.can_view_task_list_column_filter && <div className={styles.listFilter}>
          <i className={styles.iconToggle} onClick={this.toggleFilter}><img src="images/task-list/eye.svg" alt="Icon"/></i>
          {connectDropTarget(<div className={cx(styles.listFilterInner, this.state.toggleFilterList ? styles.active : '')}><ul>
            {filtersOptions && filtersOptions[selected_view_type] && filtersOptions[selected_view_type].map((item) => {
              if (!item.is_mandatory) {
                return (
                  <FilterOption
                    templateName={item.template_name ? item.template_name : ''}
                    name={getFilterLabel(item.name)}
                    checked={item.is_selected}
                    onChangeFilter={this.changeListFilter}
                    styleClass={cx(styles.checkbox, item.is_selected ? '' : styles.disabled)}
                    item={item}
                    showOverlay={!!item.template_name}
                    dragOptions={this.dragOptions}
                  />
                );
              }
            })}
          </ul>
            <div className="text-right">
              <OverlayTrigger placement="bottom" key={'key_close'} overlay={<Tooltip id={'tooltip_close'}>Exits the column chooser without persisting changes</Tooltip>}>
                <span className={styles.close} onClick={this.toggleFilter}>Close</span>
              </OverlayTrigger>
              <OverlayTrigger placement="bottom" key={'key_apply'} overlay={<Tooltip id={'tooltip_apply'}>Exits the column chooser and changes column settings for all company users</Tooltip>}>
                <button className={cx(styles.btn)} onClick={this.updateListFilter} disabled={this.state.listLoader}>{this.state.listLoader ? <SavingSpinner borderStyle="none" size={8}/> : 'Apply'}</button>
              </OverlayTrigger>
            </div>
          </div>)}
        </div>}
        <Table responsive className={cx(styles.tableList, this.can_view_task_list_column_filter ? '' : styles.view_only)}>
          <thead>
          <tr className={this.props.view && this.props.view === 'unscheduled' ? styles.unscheduledTask : ''}>
            {filtersOptions && filtersOptions[selected_view_type] && filtersOptions[selected_view_type].map((item) => {
              if (item.is_selected) {
                return (
                  <th className={cx(styles[item.name.toLowerCase()], styles.listHeader)}>{getFilterIcon(item.name) &&
                  <img src={getFilterIcon(item.name)} alt="Icon"
                       className={styles.icon}/>}{getFilterLabel(item.name)}</th>
                );
              }
            })}

          </tr>
          <tr className={styles.emptyRow}>
            <td height="20px" colSpan={this.state.selectedFiltersCount}>
              {(this.props.showSpinner || this.state.loading) && <div className={styles.spinnerWrapper}><SavingSpinner borderStyle="none" size={8}/></div>}
            </td>
          </tr>
          </thead>
          {this.props.unscheduledEvents.length > 0 && <tbody>
          <tr className={cx(styles.emptyRow, styles.dateRow)}>
            <td colSpan={this.state.selectedFiltersCount}>
              <div className={styles['date']}>
                <time>Tasks with no date/time</time>
              </div>
            </td>
          </tr>
          </tbody>}
          {this.renderUnscheduledTasksList()}
          {this.renderTasksList()}
          {!this.state.loading && !this.props.showSpinner && this.props.tasks.length === 0 && this.props.unscheduledEvents.length === 0 ?
            <tr>
              <td className={styles.emptyRow} colSpan={this.state.selectedFiltersCount}>
                <div className={styles.noTasksFound}>No Tasks Found!</div>
              </td>
            </tr> : null}
        </Table>
      </div>
    );
  }
};

TasksListView.propTypes = {
  tasks: PropTypes.array,
  entities: PropTypes.array,
  onTaskClicked: PropTypes.func,
  onActivityClicked: PropTypes.func,
  paginationNextClicked: PropTypes.func,
  paginationPrevClicked: PropTypes.func,
  page: PropTypes.number,
  items_per_page: PropTypes.number,
  unscheduledEvents: PropTypes.array,
  serverActionPending: PropTypes.bool,
  onTaskSelection: PropTypes.func,
  onSelectionChange: PropTypes.func,
};
