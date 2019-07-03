import React, { Component } from 'react';
import styles from './crew-selector.module.scss';
import $ from 'jquery';
import moment from 'moment';
import cx from 'classnames';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import _ from 'lodash';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faSortDown, faSortUp } from '@fortawesome/fontawesome-free-solid';
import { DEFAULT_COLORPICKER_COLOR } from '../fields/color-field';


export default class CrewSelectorV2 extends Component {
  constructor(props) {
    super(props);

    this.crewSelectorInputField = null;

    this.state = {
      showPlaceholder: true,
      tasks: [],
      loading: true,
      requestFailed: false,
      showOptionsPanel: false,
      allEntities: props.allEntities,
      selectedEntities: props.entities,
      highlightedEntityIndex: 0,
    };

    this.handleWidgetContainerClick = this.handleWidgetContainerClick.bind(this);
    this.handleInputFieldFocus = this.handleInputFieldFocus.bind(this);
    this.handleInputFieldKeyPress = this.handleInputFieldKeyPress.bind(this);
    this.handleInputFieldBlur = this.handleInputFieldBlur.bind(this);
    this.renderAllEntities = this.renderAllEntities.bind(this);
    this.loadSchedule = this.loadSchedule.bind(this);
    this.handleInputFieldChange = this.handleInputFieldChange.bind(this);
    this.renderEntityFaces = this.renderEntityFaces.bind(this);
    this.removeSingleEntity = this.removeSingleEntity.bind(this);
    this.removeAllEntities = this.removeAllEntities.bind(this);
    this.handleEntitySelect = this.handleEntitySelect.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.scrollParentToChild = this.scrollParentToChild.bind(this);
    this.toggleDropDownVisibility = this.toggleDropDownVisibility.bind(this);
    this.setInputRef = this.setInputRef.bind(this);

  }

  componentDidMount() {
    if (!this.props.unscheduled) {
      this.loadSchedule(this.props.startDate, this.props.endDate);
    } else {
      this.setState({
        loading: false
      });
    }
  }

  setInputRef(el) {
    this.crewSelectorInputField = el;
  }

  componentWillReceiveProps(nextProps) {
    if ((!_.isEqual(this.props.startDate, nextProps.startDate) || !_.isEqual(this.props.endDate, nextProps.endDate)) && !this.props.unscheduled) {
      this.loadSchedule(nextProps.startDate, nextProps.endDate);
    }
    if (!_.isEqual(nextProps.allEntities, this.props.allEntities)) {
      this.setState({
        allEntities: nextProps.allEntities
      });
    }
    if (!_.isEqual(nextProps.entities, this.state.selectedEntities)) {
      this.setState({
        selectedEntities: nextProps.entities
      });
    }
  }

  handleWidgetContainerClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if ((e.target.id === ('crewSelectorMainContainer_' + this.props.elId) || e.target.id === ('selectedCrew_' + this.props.elId) || e.target.id === ('crewSelectorInputField' + this.props.elId)) && this.state.showOptionsPanel) {
      this.crewSelectorInputField.blur();
    } else {
      this.crewSelectorInputField.focus();
    }
  }

  handleInputFieldFocus(e) {
    this.setState({
      showOptionsPanel: true
    });
  }

  handleInputFieldKeyPress(e) { // adjusts the width of the input field/search bar as per the content inside it
    const fakeElID = '#' + 'inputWidthMeasure' + this.props.elId;
    const fakeEl = document.getElementById('inputWidthMeasure' + this.props.elId);
    fakeEl.innerHTML = e.target.value;
    let errorCheck = 0;
    if (e.target.value.length > 0) {
      errorCheck = 36;
    }
    $(this.crewSelectorInputField).width($(fakeElID).width() + errorCheck);
  }

  handleInputFieldBlur(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      showPlaceholder: true,
      showOptionsPanel: false,
      allEntities: this.props.allEntities,
      highlightedEntityIndex: 0,
    });
    this.crewSelectorInputField.value = null;
    this.crewSelectorInputField.style.width = '0';
    this.crewSelectorInputField.blur();
  }

  renderAllEntities() {
    let allEntities = this.state.allEntities;
    let renderedContent = null;
    const { startDate, endDate } = this.props;
    const selectedEntities = this.state.selectedEntities;
    let placeholderImageURL = '/images/user-default.svg';

    if (allEntities && allEntities.length > 0) {
      renderedContent = allEntities.map((entity, index) => {
        const entityGroup = this.props.groups && this.props.groups.find((group) => {
          return entity.group_id === null ? group.is_implicit : entity.group_id === group.id;
        });
        let { tasks, loading } = this.state;
        let isAvailable = true;
        if (tasks.length) {
          tasks = tasks.filter((task) => {
            if (_.includes(task.entity_ids, entity.id) || _.includes(task.resource_ids, entity.id)) {
              return task;
            }
          });
          if (tasks.length) {
            isAvailable = !tasks.some((task) => {
              return moment.utc(task.start_datetime).local().isBetween(startDate, endDate, 'minutes', '[]') || moment.utc(task.end_datetime).local().isBetween(startDate, endDate, 'minutes', '[]');
            });
          }
        }
        let isDisabled = false;
        if (_.includes(selectedEntities, entity.id)) {
          isDisabled = true;
        } else {
          isDisabled = false;
        }

        if (typeof this.props.placeholderImage !== 'undefined' && this.props.placeholderImage !== null && this.props.placeholderImage !== '') {
          placeholderImageURL = this.props.placeholderImage;
        }

        return (
          <div id={entity.id + this.props.elId} onClick={(e) => { this.handleEntitySelect(e, entity.id); }}
               className={cx(styles.entityListItemContainer, isDisabled && styles.entityItemDisabled, this.state.highlightedEntityIndex === index && styles.highlightedEntity)}>
            <div className={styles.entityListItem}>
              <div className={styles.entityListItemMask}>
                <div className={styles.entityListItemAvatar}>
                  <img src={entity.image_path ? entity.image_path : placeholderImageURL} alt={entity.name ? entity.name : 'Unknown'}/>
                </div>
                <div className={styles.entityListItemInfo}>
                  <h3>{entity.name ? entity.name : 'Unknown'}</h3>
                  <p>{entity.type ? entity.type : ''} {entityGroup && this.props.showGroup && entity.type && ','} {entityGroup && this.props.showGroup && (entityGroup.name ? entityGroup.name : '')}</p>
                  <div className={styles.statusWrapper}>
                    {loading ? <SavingSpinner color='#008BF8' size={6} borderStyle="none" className={styles.statusSpinner} /> :
                      <div className={cx(styles['option-status'], { [styles.available]: isAvailable })}>
                        {isAvailable ? <span>Available</span> : <span>Busy</span>}
                      </div>
                    }
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.entityListItemSchedule}>
              {tasks.map((task) => {
                if (task.start_datetime && task.end_datetime) {
                  return (
                    <div className={styles.scheduleInfo}>
                      <OverlayTrigger
                        overlay={
                          <Tooltip id={task.id}>
                            Customer name: {task.customer_name !== '' ? task.customer_name : 'Not available'} <br/>
                            Customer address: {task.customer_address !== '' ? task.customer_address : 'Not available'}
                          </Tooltip>
                        }
                        placement="top"
                        delayShow={150}
                        delayHide={150}
                      >
                        <span>
                          {moment.utc(task.start_datetime).local().format('hh:mm A')} - {moment.utc(task.end_datetime).local().format('hh:mm A')}
                          {' - '}
                          {task.title}
                        </span>
                      </OverlayTrigger>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        );
      });
    } else if (allEntities.length === 0 && this.props.group_id !== '-1') {
      renderedContent = (<div className={styles.noEntityFound}>No {this.props.name === 'equipment-selector' ? 'equipment' : 'team member'} assigned to this Group</div>);
    } else {
      renderedContent = (<div className={styles.noEntityFound}>No {this.props.name === 'equipment-selector' ? 'equipment.' : 'team member.'}</div>);
    }
    return renderedContent;
  }

  loadSchedule(startDate, endDate) {

    //load schedule for the entire day to show previous and next jobs
    if (startDate && endDate) {
      this.setState({
        loading: true,
        requestFailed: false
      });
      this.props.getSchedule({
        startDate: moment(startDate).startOf('day'),
        endDate: moment(endDate).endOf('day')
      }).then(resp => {
        const schedule = JSON.parse(resp);
        this.setState({
          tasks: schedule.tasks,
          loading: false
        });
      }).catch((e) => {
        this.setState({
          loading: false,
          requestFailed: true
        });
      });
    } else {
      this.setState({
        loading: false,

      });
    }
  }

  handleInputFieldChange(e) {
    if (e.target.value.length > 0) {
      this.setState({
        showPlaceholder: false,
      });
    } else {
      this.setState({
        showPlaceholder: true,
      });
    }
    let allEntities = this.props.allEntities;
    allEntities = allEntities.filter((entity) => {
      if (_.includes(entity.name.toUpperCase(), e.target.value.toUpperCase())) {
        return entity;
      }
    });
    this.setState({
      allEntities,
      highlightedEntityIndex: 0
    });
  }

  renderEntityFaces() {
    const entities = this.state.selectedEntities;
    const allEntities = $.extend([], true, this.props.allEntities);
    this.props.entitiesSelected && allEntities.push.apply(allEntities, this.props.entitiesSelected);
    allEntities.sort((entity1, entity2) => {
      return entity1.name.toUpperCase() > entity2.name.toUpperCase() ? 1 : 0;
    });
    const selectedEntities = [];
    entities && entities.map((entity) => {
      const aEntity = allEntities.find((el) => {
        return el.id === entity;
      });
      if (aEntity) {
        selectedEntities.push(aEntity);
      } else {
        selectedEntities.push({
          id: entity,
          name: 'Unknown',
          image_path: '/images/unknown.png'
        });
      }
    });

    let renderedContent = null;
    const profile = this.props.profile;
    const entity_confirmation_statuses = this.props.entity_confirmation_statuses;
    const showTeamConfirmation = this.props.canViewTeamConfirmation;

    if (entities && entities.length > 0) {

      renderedContent = selectedEntities.map((entity) => {
        const entityGroup = this.props.groups && this.props.groups.find((group) => {
          return entity.group_id === null ? group.is_implicit : entity.group_id === group.id;
        });
        let color = entity.color ? entity.color : DEFAULT_COLORPICKER_COLOR;
        let entityConfirmationMessage = 'Pending response';
        if (showTeamConfirmation && profile && profile.enable_team_confirmation) {
          color = '#666666';
          if (showTeamConfirmation && entity_confirmation_statuses) {
            if (entity_confirmation_statuses.hasOwnProperty(entity.id) && entity_confirmation_statuses[entity.id].status === 'ACCEPTED') {
              color = '#24ab95';
              entityConfirmationMessage = 'Accepted';
            } else if (entity_confirmation_statuses.hasOwnProperty(entity.id) && entity_confirmation_statuses[entity.id].status === 'REJECTED') {
              color = '#FF4E4C';
              entityConfirmationMessage = 'Rejected';
            }
          }
        }
        const entityConfirmationTooltip = (
          <Tooltip id={'entity_confirmation_status_tooltip_for_' + entity.id}>{entityConfirmationMessage}</Tooltip>);
        const entityNameTooltip = (<Tooltip id={'entity_name_tooltip_for_' + entity.id}>
          {entity.name ? entity.name : 'Unknown'}
          <br/>
          {entityGroup && this.props.showGroup && entityGroup.name}
        </Tooltip>);
        let placeholderImageURL = '/images/user-default.svg';
        if (typeof this.props.placeholderImage !== 'undefined' && this.props.placeholderImage !== null && this.props.placeholderImage !== '') {
          placeholderImageURL = this.props.placeholderImage;
        }
        return (
          <div className={styles.entityFace}>
            <span onClick={(e) => {
              this.removeSingleEntity(e, entity.id);
            }} className={styles.entityRemoveBtn}>x</span>
            {showTeamConfirmation && profile && profile.enable_team_confirmation ?
              <OverlayTrigger placement="top" overlay={entityConfirmationTooltip}>
                <img style={{ borderColor: color }} src={entity.image_path ? entity.image_path : placeholderImageURL} alt="User Image"/>
              </OverlayTrigger>
              :
              <img style={{ borderColor: color }} src={entity.image_path ? entity.image_path : placeholderImageURL} alt="User Image"/>
            }
            <OverlayTrigger placement='bottom' overlay={entityNameTooltip}>
              <h3>{entity.name ? entity.name : 'Unknown'}</h3>
            </OverlayTrigger>
            <p>{entity.type ? entity.type : ''}</p>
          </div>
        );
      });
    }
    return renderedContent;
  }

  removeSingleEntity(e, entityId) {
    e.preventDefault();
    e.stopPropagation();
    const entities = this.state.selectedEntities;
    const indexOfEntity = entities.indexOf(entityId);
    if (indexOfEntity > -1) {
      entities.splice(indexOfEntity, 1);
    }
    this.setState({
      selectedEntities: entities,
    }, () => {
      this.props.updateEntities(this.state.selectedEntities);
    });
  }

  removeAllEntities(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      selectedEntities: [],
    }, () => {
      this.props.updateEntities(this.state.selectedEntities);
    });
  }

  handleEntitySelect(e, entityId) {
    e.preventDefault();
    e.stopPropagation();
    const entities = this.state.selectedEntities;
    const indexOfEntityId = entities.indexOf(entityId);
    if (indexOfEntityId < 0) {
      entities.push(entityId);
    }
    this.setState({
      selectedEntities: entities,
      allEntities: this.props.allEntities,
    }, () => {
      this.props.updateEntities(this.state.selectedEntities);
      this.crewSelectorInputField.value = '';
    });
  }

  handleKeyDown(e) {
    const code = e.which ? e.which : e.keyCode;
    if (code === 13) { // enter/return key
      e.preventDefault();
      e.stopPropagation();
      const entities = this.state.allEntities;
      if (entities.length > 0) {
        const selectedEntities = this.state.selectedEntities;
        selectedEntities.push(entities[this.state.highlightedEntityIndex].id);
        this.setState({
          selectedEntities,
          allEntities: this.props.allEntities,
          highlightedEntityIndex: this.state.highlightedEntityIndex
        }, () => {
          this.props.updateEntities(this.state.selectedEntities);
          this.crewSelectorInputField.value = '';
        });
      }
    } else if (code === 38 || code === 40) { // up = 38 & down = 40
      e.preventDefault();
      e.stopPropagation();
      const entities = this.state.allEntities;
      let highlightedEntityIndex = this.state.highlightedEntityIndex;
      if (code === 38 && highlightedEntityIndex > 0) {
        highlightedEntityIndex--;
      } else if (code === 40 && highlightedEntityIndex < (entities.length - 1)) {
        highlightedEntityIndex++;
      }
      this.setState({
        highlightedEntityIndex
      }, () => {
        const dropDownEl = document.getElementById('entitySelectionDropDown' + this.props.elId);
        const subEl = document.getElementById(entities[this.state.highlightedEntityIndex].id + this.props.elId);
        if (typeof subEl !== 'undefined' && subEl !== null) {
          this.scrollParentToChild(dropDownEl, subEl);
        }
      });
    } else if (code === 9) { // tab key
      const entities = this.state.allEntities;
      const highlightedEntityIndex = this.state.highlightedEntityIndex;
      const selectedEntities = this.state.selectedEntities;
      if (entities.length > 0 && this.crewSelectorInputField.value.length > 0) {
        if (!_.includes(selectedEntities, entities[highlightedEntityIndex].id)) {
          selectedEntities.push(entities[highlightedEntityIndex].id);
        }
      }
      this.setState({
        selectedEntities,
        allEntities: this.props.allEntities,
        highlightedEntityIndex: 0
      }, () => {
        this.props.updateEntities(this.state.selectedEntities);
        this.crewSelectorInputField.value = '';
      });
    } else if (code === 8) { // handle back space
      const selectedEntities = this.state.selectedEntities;
      if (this.crewSelectorInputField.value.length === 0) {
        selectedEntities.pop();
        this.setState({
          selectedEntities
        });
      }
    }
  }

  scrollParentToChild(parent, child) {

    // Where is the parent on page
    let parentRect = parent.getBoundingClientRect();
    // What can you see?
    let parentViewableArea = {
      height: parent.clientHeight,
      width: parent.clientWidth
    };

    // Where is the child
    let childRect = child.getBoundingClientRect();
    // Is the child viewable?
    let isViewable = (childRect.top >= parentRect.top) && (childRect.top <= parentRect.top + parentViewableArea.height);

    // if you can't see the child try to scroll parent
    if (!isViewable) {
      // scroll by offset relative to parent
      parent.scrollTop = (childRect.top + parent.scrollTop) - parentRect.top;
    }
  }

  toggleDropDownVisibility(e) {
    e.preventDefault();
    e.stopPropagation();
    if (this.state.showOptionsPanel) {
      this.crewSelectorInputField.blur();
    } else {
      this.crewSelectorInputField.focus();
    }
  }

  render() {

    let disabledClassName = '';
    if (typeof this.props.canEdit !== 'undefined' && !this.props.canEdit) {
      disabledClassName = styles.controlDisabled;
    }
    const workerImageURL = '/images/worker-needed.svg';
    const worker_needed = this.props.number_of_workers_required ?
      (<div className={styles.entityFace} onClick={(e) => this.props.changeWorkersRequired(e, true)}>
        <span className={styles.entityRemoveBtn}>x</span>
        <img src={workerImageURL} alt="Worker Needed" className={styles.workerNeeded} />
        <h3>Worker Needed</h3>
      </div>) : '';
    let worker_needed_assigned = [];
    for (let i = 0; i < this.props.number_of_workers_required; i++) {
      worker_needed_assigned.push(worker_needed);
    }

    const worker_needed_on_list = (
      <div className={cx(styles.entityListItemContainer)} onClick={(e) => this.props.changeWorkersRequired(e)}>
        <div className={styles.entityListItem}>
          <div className={styles.entityListItemMask}>
            <div className={styles.entityListItemAvatar}>
              <img src={workerImageURL} alt="Worker Needed" className={styles.workerNeeded} />
            </div>
            <div className={cx(styles.entityListItemInfo)}>
              <h3>Worker Needed</h3>
              <p>Add multiple times if more than one needed</p>
            </div>
          </div>
        </div>
      </div>);

    return (
      <div
        className={cx(styles.crewSelectorContainer, disabledClassName)}
        onMouseDown={(e) => { this.handleWidgetContainerClick(e); }}
        onKeyDown={(e) => { this.handleKeyDown(e); }}
        id={'crewSelectorMainContainer_' + this.props.elId}>
        {this.state.showPlaceholder && this.state.selectedEntities && this.state.selectedEntities.length === 0 &&
        <div className={styles.inputPlaceholder}>
          {this.props.canEdit ? this.props.placeholder : <div>No {this.props.name === 'equipment-selector' ? 'equipment' : 'assignee'} found.</div>}
        </div>
        }
        <div
          className={styles.selectedCrew}
          id={'selectedCrew_' + this.props.elId}>
          {worker_needed_assigned}
          {this.renderEntityFaces()}
          <input
            type='text'
            id={'crewSelectorInputField' + this.props.elId}
            ref={this.setInputRef}
            className={styles.crewSelectorInputField}
            onFocus={(e) => { this.handleInputFieldFocus(e); }}
            onKeyUp={(e) => { this.handleInputFieldKeyPress(e); }}
            onBlur={(e) => { this.handleInputFieldBlur(e); }}
            onChange={(e) => { this.handleInputFieldChange(e); }}
            onKeyDown={(e) => { this.handleInputFieldChange(e); }}
            width="0"
          />
        </div>
        <pre id={'inputWidthMeasure' + this.props.elId} className={styles.measure} />
        {this.state.showOptionsPanel &&
        <div id={'entitySelectionDropDown' + this.props.elId} className={styles.entitiesDropDown}>
          {this.props.type === 'TASK' && worker_needed_on_list}
          {this.renderAllEntities()}
        </div>
        }
        {typeof this.props.canEdit !== 'undefined' && this.props.canEdit &&
        <div className={styles.widgetControls}>
          {this.state.selectedEntities.length > 0 && <button type="button" onClick={(e) => {
            this.removeAllEntities(e);
          }} className={styles.removeAlLEntities}>x</button>}
          <span onMouseDown={(e) => {
            this.toggleDropDownVisibility(e);
          }}
                className={cx(styles.listDropDownIndicator, this.state.showOptionsPanel ? styles.upArrow : styles.downArrow)}>
            {this.state.showOptionsPanel ? <FontAwesomeIcon icon={faSortUp}/> : <FontAwesomeIcon icon={faSortDown}/>}
          </span>
        </div>
        }
      </div>
    );
  }

}
