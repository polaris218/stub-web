import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ErrorAlert from '../error-alert/error-alert';
import update from 'immutability-helper';
import Joyride from 'react-joyride';
import {
  Table,
  Button,
  Alert,
  Grid,
  Row,
  Col,
  Tooltip,
  OverlayTrigger,
  FormControl,
  Image,
  Modal
} from 'react-bootstrap';
import moment from 'moment';
import cx from 'classnames';
import styles from './entity-manager.module.scss';
import TimeAgo from 'react-timeago';
import { Link } from 'react-router-dom';
import { LocationMapV2 } from '../../components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faInfoCircle, faChevronLeft, faChevronRight, faFilter, faLink } from '@fortawesome/fontawesome-free-solid';
import { DEFAULT_COLORPICKER_COLOR } from '../fields/color-field';
import {
  getProfileInformation, getEntityPermissionsGroups, uploadGroupsIcon, createGroup,
  updateGroup, getGroupsIconUrl, deleteGroupIcon, getSingleGroup, getSingleEntity
} from '../../actions';
import { getErrorMessage } from '../../helpers/task';
import SavingSpinner from '../saving-spinner/saving-spinner';
import EntityForm from '../entity-form-v2/entity-form';
import GroupsForm from '../account-wrapper-v2/components/groups-main/components/groups-form/groups-form';
import { toast, ToastContainer } from 'react-toastify';
import { ActivityStream, ActivityStreamButtonV2 } from '../index';

export default class EntityManager extends Component {
  constructor(props) {
    super(props);
    this.removeEntity = this.removeEntity.bind(this);
    this.createEntity = this.createEntity.bind(this);
    this.entityToShowOnMapChanged = this.entityToShowOnMapChanged.bind(this);
    this.renderEntitiesToShowOnMap = this.renderEntitiesToShowOnMap.bind(this);
    this.openEditModal = this.openEditModal.bind(this);
    this.closeEditModal = this.closeEditModal.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.onChangeExtraField = this.onChangeExtraField.bind(this);
    this.modifyIdsDisplay = this.modifyIdsDisplay.bind(this);
    this.displayAddMemberForm = this.displayAddMemberForm.bind(this);
    this.hideAddMemberForm = this.hideAddMemberForm.bind(this);
    this.entitiesOnMapFilters = this.entitiesOnMapFilters.bind(this);
    this.clearAllFilters = this.clearAllFilters.bind(this);
    this.getEntity = this.getEntity.bind(this);
    this.openPermissionModal = this.openPermissionModal.bind(this);
    this.closePermissionModal = this.closePermissionModal.bind(this);
    this.showPermissionsUpdateSuccess = this.showPermissionsUpdateSuccess.bind(this);
    this.paginationNextClicked = this.paginationNextClicked.bind(this);
    this.paginationPrevClicked = this.paginationPrevClicked.bind(this);
    this.onEntityCreate = this.onEntityCreate.bind(this);
    this.handleEntityFilterChange = this.handleEntityFilterChange.bind(this);
    this.isEntityOnline = this.isEntityOnline.bind(this);
    this.getFilteredEntities = this.getFilteredEntities.bind(this);
    this.handleGroupsFilterChange = this.handleGroupsFilterChange.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
    this.handleErrorAlerts = this.handleErrorAlerts.bind(this);
    this.createToastAlert = this.createToastAlert.bind(this);
    this.filterPersmission = this.filterPersmission.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    this.state = {
      alerts: props.alerts || [],
      entities: null,
      entityToShowOnMap: 'All',
      showModal: false,
      showPermissionModal: false,
      editFormError: '',
      editForm: {},
      timer: null,
      sendingEntity: false,
      entityAdded: false,
      updatingEntity: false,
      joyrideOverlay: true,
      joyrideType: 'single',
      ready: false,
      showIds:false,
      showAddMemberForm: false,
      teamProfile: null,
      filteredEntity: null,
      entityToEditPermissions: null,
      permissionsUpdated: false,
      items_per_page: 100,
      page: 1,
      fetchingMoreEntities: false,
      permissionGroups: null,
      contentLoaded: false,
      permissionGroupsLoadError: false,
      entityFilter: 'ALL',
      groupsFilter: null,
      showGroupForm: false,
      selectedGroup: null,
      loadingSettings: false,
      internetIssue: undefined,
      showTopActivityStream: window.innerWidth > 991 ? false: true,
      steps: [{
        title: 'First Team Member',
        text: 'If you supply an email address we will send an invite to your team member to signup for Arrivy to use mobile apps and web portal.',
        selector: '#entity-formarea',
        position: 'top',
        style: {
          mainColor: '#12d217',
          beacon: {
            inner: '#12d217',
            outer: '#12d217'
          }
        }
      }],
      entityImageLoader: false,
      toggleModal: false,
      spinner: false,
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleWindowResize);
    const items_per_page = this.state.items_per_page || 100;
    const page = this.state.page || 100;
    const promises = [];

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

    promises.push( getEntityPermissionsGroups().then((res) => {
      const permissions = JSON.parse(res);
      this.setState({
        permissionGroups: permissions,
        permissionGroupsLoadError: false
      });
    }).catch((err) => {
      console.log(err);
      const alert = {
      	text: 'Could not load content at the moment. Please try again.',
	      options: {
		      type: toast.TYPE.ERROR,
		      position: toast.POSITION.BOTTOM_LEFT,
		      className: styles.toastErrorAlert,
		      autoClose: 8000
	      }
      };
      this.createToastAlert(alert)
    }));
    promises.push(getProfileInformation().then((data) => {
      const profile = JSON.parse(data);
      this.setState({
        editFormError: '',
        teamProfile: profile["fullname"],
      });
    }));
    promises.push(this.props.updateEntities(items_per_page, page).then((entities) => {
      let jsonEntities = JSON.parse(entities);
      if (this.props.newlyFetchedEntitiesCallback) {
        this.props.newlyFetchedEntitiesCallback(jsonEntities);
      }

      if (jsonEntities.length === 1 && this.joyride) {
        this.joyride.start();
      }

      jsonEntities = jsonEntities.map((entity) => {
        const extra_fields = entity.extra_fields;
        entity.extra_fields = this.convertFieldsForEditing(extra_fields);
        return entity;
      });

      this.setState({
        entities: jsonEntities,
        editFormError: '',
        alerts: this.state.alerts,
        fetchingMoreEntities: false
      });
    }));
    Promise.all(promises).then(() => {
      this.setState({
        timer,
        contentLoaded: true
      })
    });
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 3e4);
  }

  toggleModal(e, entity = null) {
    e.preventDefault();
    e.stopPropagation();
    let toggleModal = this.state.toggleModal;
    this.setState({toggleModal: !toggleModal, selectedEntity: entity});
  }

  handleWindowResize() {
    if (window.innerWidth > 991 && this.state.showTopActivityStream) {
      this.setState({
        showTopActivityStream: false,
      })
    } else if (window.innerWidth < 992 && !this.state.showTopActivityStream) {
      this.setState({
        showTopActivityStream: true,
      })
    }
  }

  componentWillUnmount() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    window.removeEventListener("resize", this.handleWindowResize);
  }

  paginationPrevClicked() {
    this.setState({
      fetchingMoreEntities: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum - 1;
    if(localPageNum > 1) {
      this.setState({
        page: newPage,
        entityToShowOnMap: 'All'
      },
      () => this.updateEntities(false));
    } else {
      this.setState({
        page: 1,
        entityToShowOnMap: 'All'
      },
      () => this.updateEntities(false));
    }
  }

  paginationNextClicked() {
    this.setState({
      fetchingMoreEntities: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum + 1;
    this.setState({
      page: newPage,
      entityToShowOnMap: 'All'
    },
    () => this.updateEntities(false));
  }

  getFilteredEntities(ent) {
    const entities = ent;
    let onlineEntities = [];
    let offlineEntities = [];
    let  selectedGroupEntities = null;
    entities.map((entity) => {
      if (this.isEntityOnline(entity)) {
        onlineEntities.push(entity);
      } else {
        offlineEntities.push(entity);
      }
    });
    const filterValue = this.state.entityFilter;
    if (this.state.groupsFilter !== null) {
      let filteredEntities = null;
      if (filterValue === 'ONLINE') {
        filteredEntities = onlineEntities;
        onlineEntities = filteredEntities.filter(entity => {
          return this.state.groupsFilter === 0 ? (entity.group_id === null) : (entity.group_id === this.state.groupsFilter);
        });
      } else if (filterValue === 'OFFLINE') {
        filteredEntities = offlineEntities;
        offlineEntities = filteredEntities.filter(entity => {
          return this.state.groupsFilter === 0 ? (entity.group_id === null) : (entity.group_id === this.state.groupsFilter);
        });
      } else {
        selectedGroupEntities = entities.filter(entity => {
          return this.state.groupsFilter === 0 ? (entity.group_id === null) : (entity.group_id === this.state.groupsFilter);
        });
      }
    } else {
      selectedGroupEntities = entities;
    }
    if (filterValue === 'ONLINE') {
      return onlineEntities;
    } else if (filterValue === 'OFFLINE') {
      return offlineEntities;
    } else if (this.state.groupsFilter !== null && typeof this.state.groupsFilter !== 'undefined') {
      return selectedGroupEntities;
    } else {
      return entities;
    }
  }

  handleEntityFilterChange(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      entityFilter: e.target.value
    });
  }

  handleGroupsFilterChange(e) {
    let value = e.target.value;
    if (e.target.value === 'NULL') {
      value = null;
    } else {
      value = parseInt(e.target.value);
    }
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      groupsFilter: value
    });
  }

  onEntityCreate(alert) {
    setTimeout(() => {
      this.updateEntities();
      this.createToastAlert(alert);
    }, 1e2);
  }

  displayAddMemberForm() {
    this.setState({
      showAddMemberForm: true,
      editFormError: '',
    });
  }

  hideAddMemberForm() {
    this.setState({
      showAddMemberForm: false,
      editFormError: '',
      editForm: {
        name: '',
        type: '',
        email: '',
        phone: '',
        details: '',
        color: '',
        can_turnoff_location: false,
        permissions: ''
      }
    });
  }

  startAsyncUpdate() {
    if(this.state.timer){
      clearTimeout(this.state.timer);
    }
    this.updateEntities();
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 3e4);

    this.setState({
      editFormError: '',
      timer
    });
  }

  convertFieldsForEditing(fields) {
    const result = fields ? Object.keys(fields).map((key) => {
      return {
        name: key,
        value: fields[key]
      };
    }) : [];

    return result;
  }

  convertFieldsForStorage(fields) {
    const fields_filtered = fields.filter((item) => {
      return item.name !== '' || item.value !== '';
    });
    const extra_fields = {};
    fields_filtered.forEach((field) => {
      extra_fields[field.name] = field.value;
    });

    return extra_fields;
  }

  onChangeExtraField(fields) {
    this.setState({
      editFormError: '',
      editForm: update(this.state.editForm, {
        extra_fields: { $set: fields }
      })
    });
  }

  onChangeField(field, value) {
    this.setState({
      editFormError: '',
      editForm: update(this.state.editForm, {
        [field.name]: { $set: value }
      })
    });
  }

  getEmptyEntityText() {

    const style = {
      'background-image':'url(images/help/template_map_image.jpg)',
      'background-repeat': 'no-repeat',
      'background-attachment': 'fixed',

    };

    let message = this.props.hideEntitiesList ?
      <h3 className={ styles['text-blocks'] }>Add your team members on <Link to='/crew' style={{ color:'#337ab7' }}>Team page</Link></h3>
      : <h3 className={ styles['text-blocks'] }>Add your first team member by clicking the "Add New Team Member"</h3>;

    return (
      <div className={styles['no-entity']}>
        <div className={styles.noEntityContentContainer}>
          <div className={styles['center-content']}>
            <div className={styles['center-content-inner']}>
              <h3 className={ styles['text-blocks'] }>
                Install arrivy app on your team's Android & iOS devices to see their live location here.
              </h3>
              { message }
              <p className={ styles['text-blocks'] } style={{fontSize: '16px'}}>
                Note: Live location is for business only. Location is only visible to customer when the team member reports 'on our way' on a specific task using the Arrivy app
              </p>
              <div className={ styles['apps-buttons'] }>
                <a href="https://play.google.com/store/apps/details?id=com.insac.can.pinthatpoint&hl=en" target="_blank"><img src="/images/google_badge.png" /></a>
                <a href="https://itunes.apple.com/us/app/pinthatpoint-go/id1177367972?ls=1&mt=8" target="_blank"><img src="/images/appstore_badge.png" /></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  isEntityOnline(entity) {
    if (entity.lastreading && entity.lastreading.time) {
      const momentObject = moment.utc(entity.lastreading.time);
      const duration = moment.duration(moment().diff(momentObject));
      if (duration.asMinutes() < 10 && momentObject - moment() < 0) {
        return true;
      } else {
        return false;
      }
    } else {
      false;
    }
  }

  getTime(entity) {
    let timeStamp = 'Not Available';
    if (entity.lastreading && entity.lastreading.time) {
      const momentObject = moment.utc(entity.lastreading.time);
      const localMomentObject = momentObject.local();
      const dateString = localMomentObject.format('MMM DD hh:mm a');

      let lightColor = '#d6d6d6';
      const duration = moment.duration(moment().diff(momentObject));

      if (duration.asMinutes() < 10 && momentObject - moment() < 0) {
        lightColor = '#91DC5A';
      }

      const light = (<svg version="1.1" id="Capa_1" x="0px" y="0px" width="12px" height="12px" viewBox="0 0 438.533 438.533" style={{ marginRight: '10px' }} >
        <g>
          <path d="M409.133,109.203c-19.608-33.592-46.205-60.189-79.798-79.796C295.736,9.801,259.058,0,219.273,0   c-39.781,0-76.47,9.801-110.063,29.407c-33.595,19.604-60.192,46.201-79.8,79.796C9.801,142.8,0,179.489,0,219.267   c0,39.78,9.804,76.463,29.407,110.062c19.607,33.592,46.204,60.189,79.799,79.798c33.597,19.605,70.283,29.407,110.063,29.407   s76.47-9.802,110.065-29.407c33.593-19.602,60.189-46.206,79.795-79.798c19.603-33.596,29.403-70.284,29.403-110.062   C438.533,179.485,428.732,142.795,409.133,109.203z" fill={lightColor}/>
        </g>
        </svg>);

      const tooltip = (
        <Tooltip id="tooltip">{dateString}</Tooltip>
      );

      timeStamp = (<div><OverlayTrigger placement="bottom" overlay={tooltip}>
      <p><span>{light}</span>
        {momentObject - moment() <= 0 && <TimeAgo date={localMomentObject.toISOString()} />}
        {momentObject - moment() > 0 && timeStamp}
        </p>
      </OverlayTrigger></div>);
    }

    return timeStamp;
  }

  handleImageChange(e) {
    if (this.state.entityImageLoader === false) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ entityImageLoader: true });
      const image = e.target.files[0];
      if (typeof image !== 'undefined' && (image.type === 'image/jpeg' || image.type === 'image/jpg' || image.type === 'image/svg' || image.type === 'image/png' || image.type === 'image/gif')) {
        const reader = new FileReader();

        reader.readAsDataURL(image);

        reader.onloadend = () => {
          this.setState({
            editFormError: '',
            editForm: update(this.state.editForm, {
              image_path: {$set: reader.result},
              image: {$set: image},
            })
          });

          this.props.getEntityImageUrl(this.state.editForm.id).then((response) => {
            const {upload_url, file_id} = JSON.parse(response);
            const data = new FormData();
            data.append('file-0', this.state.editForm.image);

            this.props.updateEntityImage(upload_url, data).then((resp) => {
              const {file_path} = JSON.parse(resp);
              const entityIndex = this.state.entities.findIndex(el => el.id === this.state.editForm.id);
              this.setState({
                editFormError: '',
                entities: update(this.state.entities, {
                  [entityIndex]: {
                    image_id: {$set: file_id},
                    image_path: {$set: file_path}
                  }
                }),
                editForm: update(this.state.editForm, {
                  image_id: {$set: file_id},
                  image_path: {$set: file_path},
                }),
                entityImageLoader: false
              });
            });
          });
        };
      } else {
        this.setState({
          editFormError: 'Please upload a valid image file',
          entityImageLoader: false
        });
      }
    }
  }

  removeImage() {
    if (this.state.entityImageLoader === false && this.state.editForm.image_id) {
      this.setState({ entityImageLoader: true });
      this.props.removeEntityImage(this.state.editForm.id, this.state.editForm.image_id)
      .then(() => {
        const entityIndex = this.state.entities.findIndex(el => el.id === this.state.editForm.id);
        this.setState({
          editFormError: '',
          entities: update(this.state.entities, {
            [entityIndex]: {
              image_id: { $set: '' },
              image_path: { $set: '' }
            }
          }),
          editForm: update(this.state.editForm, {
            image_path: { $set: '' },
            image_id: { $set: '' },
          }),
          entityImageLoader: false
        });
      })
      .catch((err) => {
        const responseText = JSON.parse(err.responseText);
        this.setState({ editFormError: getErrorMessage(responseText), entityImageLoader: false });
      });
   }
  }

  handleSubmitForm(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({ updatingEntity: true, editFormError: '' });

    const updatedEntity = jQuery.extend(true, {}, this.state.editForm);
    updatedEntity.extra_fields = JSON.stringify(this.convertFieldsForStorage(updatedEntity.extra_fields));

    this.props.updateEntity(updatedEntity).then(() => {
      this.setState({ updatingEntity: false, editFormError: '' });
      const entityIndex = this.state.entities.findIndex(el => el.id === this.state.editForm.id);
      this.setState({
        entities: update(this.state.entities, {
          [entityIndex]: {
            name: { $set: this.state.editForm.name },
            type: { $set: this.state.editForm.type },
            phone: { $set: this.state.editForm.phone },
            email: { $set: this.state.editForm.email },
            color: { $set: this.state.editForm.color },
            details: { $set: this.state.editForm.details },
            can_turnoff_location: { $set: this.state.editForm.can_turnoff_location },
            extra_fields: { $set: this.state.editForm.extra_fields },
          }
        }),
        showModal: false,
        showPermissionModal: false,
        editFormError: ''
      });

    }).catch((err) => {
      this.setState({ updatingEntity: false });
      const responseText = JSON.parse(err.responseText);
      this.setState({ editFormError: getErrorMessage(responseText) });
    });
  }

  createEntity({ name, type, email, phone, details, color, can_turnoff_location, group_id, notifications }) {
    this.setState({ sendingEntity: true, entityAdded: false, editFormError: '' });
      this.props.createEntity({ name, type, email, phone, details, color, can_turnoff_location, group_id , notifications}).then(() => {
        this.setState({ sendingEntity: false, entityAdded: true, showAddMemberForm: false, editFormError: '' });
        setTimeout(() => {
          this.updateEntities();
          this.addAlert({
            content: 'Entity [' + name + '] was added!',
            bsStyle: 'success'
          });
        }, 1e2);
      })
      .catch((res) => {
        this.setState({ sendingEntity: false, showAddMemberForm: true, });
        const error = JSON.parse(res.responseText);
        this.addAlert({
          content: getErrorMessage(error),
          bsStyle: 'danger'
        });
      });
  }

  removeEntity() {
    const entity = this.state.selectedEntity;
    this.setState({ spinner: true });
    if (this.props.deleteEntity && entity) {
      this.props.deleteEntity(entity.id)
        .then(() => {
          this.setState({ toggleModal: false, spinner: false });
          setTimeout(() =>{
              const deletedSuccessfullyAlert = {
                  text: 'Team member ' +  entity.name + ' was removed',
                  options: {
                      type: toast.TYPE.SUCCESS,
                      position: toast.POSITION.BOTTOM_LEFT,
                      className: styles.toastSuccessAlert,
                      autoClose: 8000
                  }
              };
            this.createToastAlert(deletedSuccessfullyAlert);
            this.updateEntities();
          }, 1e2);
        });
    }
  }

  updateEntities(checkNewEntities = true) {
    if(this.state.timer){
      clearTimeout(this.state.timer);
    }
    const items_per_page = this.state.items_per_page;
    const page = this.state.page;
    this.props.updateEntities(items_per_page, page).then((entities) => {
      let jsonEntities = JSON.parse(entities);
      if (this.props.newlyFetchedEntitiesCallback) {
        this.props.newlyFetchedEntitiesCallback(jsonEntities);
      }

      if (jsonEntities.length === 1 && this.joyride) {
        this.joyride.start();
      }

      jsonEntities = jsonEntities.map((entity) => {
        if (this.state.entities && checkNewEntities) {
          const findEntity = this.state.entities.find((e) => { return e.id === entity.id; })
          entity.new = !(findEntity);
        }
        const extra_fields = entity.extra_fields;
        entity.extra_fields = this.convertFieldsForEditing(extra_fields);
        return entity;
      });

      this.setState({
        entities: jsonEntities,
        editFormError: '',
        alerts: this.state.alerts,
        internetIssue: undefined,
        fetchingMoreEntities: false
      });
    }).catch((err) => {
      if(err.status === 0) {
        this.setState({
          internetIssue: true,
          fetchingMoreEntities: false
        });
      }
    });
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 3e4);
    if (this.setTimer && !document.hidden) {
      this.setState({
        timer,
        internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
      });
    } else {
      clearTimeout(timer);
    }
  }

  removeAlert(idx) {
    this.setState({
      alerts: this.state.alerts.filter((alert, id) => {
        return id !== idx;
      }),
      editFormError: ''
    });
  }

  addAlert(alert) {
    const alerts = this.state.alerts;
    const removeAlert = this.removeAlert.bind(this);
    alert.timeout = (idx) => {
      setTimeout(() => {
        removeAlert(idx);
      }, 1e4);
    };
    alerts.push(alert);
    this.setState({
      alerts,
      editFormError: '',
      entities: this.state.entities
    });
  }

  entityToShowOnMapChanged(e) {
    this.setState({
      editFormError: '',
      entityToShowOnMap: e.target.value
    });
  }

  openEditModal(entity_id) {
    const entity = this.state.entities.find((el) => el.id === entity_id);

    const entityToEdit = Object.assign({}, entity);
    let user_name = null;
    getSingleEntity(entity_id).then((res) => {
      const result = res && JSON.parse(res);

      if(result && result.user_name) {
        user_name = result.user_name;
      }
      this.setState({user_name})
    });
    this.setState({ showAddMemberForm: true, editForm: entityToEdit, editFormError: ''});
  }

  closeEditModal() {
    this.setState({ showModal: false, editFormError: '', });
  }

  closeModal() {
    this.setState({
      showGroupForm: false,
      selectedGroup: null
    });
  }

  filterPersmission(entity){
    return entity.permission_groups.find((permission) => {return permission.status  === true;})
  }

  handleSettingsClick() {
    const group_id = (this.props.profile && this.props.profile.group_id) ? this.props.profile.group_id : null;
    if (group_id) {
      this.setState({
        loadingSettings: true
      });
      getSingleGroup(group_id).then((res) => {
        const group = JSON.parse(res);
        this.setState({
          selectedGroup: group,
          showGroupForm: true,
          loadingSettings: false
        });
      }).catch((err) => {
        this.setState({
          loadingSettings: false
        });
        const error = JSON.parse(err.responseText);
        this.addAlert({
          content: getErrorMessage(error),
          bsStyle: 'danger'
        });
      });
    }
  }

  handleErrorAlerts(alert) {
    const errorAlert = {
      bsStyle: alert.type,
      content: alert.message
    };
    this.addAlert(errorAlert);
  }

  openPermissionModal(entity_id) {
    const entity = this.state.entities.find((el) => el.id === entity_id);
    const entityToEditPermissions = Object.assign({}, entity);
    this.setState({ showPermissionModal: true, entityToEditPermissions, editFormError: '', });
  }

  closePermissionModal() {
    this.setState({ showPermissionModal: false, editFormError: '' });
  }

  modifyIdsDisplay() {
    this.setState({ showIds: !this.state.showIds, editFormError: '' });
  }

  renderEntity(entity, key) {
    const group = this.props.groups && entity.group_id && this.props.groups.find((group) => { return group.id === entity.group_id; });
    this.can_edit = false;
    this.can_edit_permissions = false;
    this.can_delete = false;
    this.can_edit_settings = false;
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY'))is_company = true;
      if (is_company || permissions.includes('EDIT_TEAM_MEMBER'))this.can_edit = true;
      if (is_company || permissions.includes('EDIT_TEAM_MEMBER_PERMISSION'))this.can_edit_permissions = true;
      if (is_company || permissions.includes('DELETE_TEAM_MEMBER'))this.can_delete = true;
      if ((is_company || permissions.includes('EDIT_GROUP')) && (this.props.profile && this.props.profile.group_id)) this.can_edit_settings = true;
    }

    const removeEntity = () => this.removeEntity(entity);
    const openEditModal = () => this.openEditModal(entity.id);
    const openPermissionModal = () => this.openPermissionModal(entity.id);
    const timeStamp = this.getTime(entity);
    const default_entity_tooltip = (
      <Tooltip id="tooltip"><p>This is your company's default account. It cannot be removed. You can edit any details for this account.</p>
      Once you login to Arrivy mobile apps with your company email your location will be reported on this account.
      </Tooltip>
    );

    const tooltip = (<Tooltip>{entity.name}<br />Task Notification Link</Tooltip>);

    const color = entity.color ? entity.color : DEFAULT_COLORPICKER_COLOR;
    let currentDate = moment().format('YYYY-MM-DD');
    return (
    <tr className={entity.new ? styles['new-entity'] : '' } key={'entity_' + key}>
        <td>
          <div className={cx(styles['entity-image'], 'row')}>
            <Image src={entity.image_path || '/images/user-default.svg'} thumbnail responsive />
            <div className={cx(styles['entity-color'], 'text-right')} style={{background: color}}/>
          </div>
        </td>
        { this.state.showIds ? <td>{entity.id}</td> : null }
        <td>
          <h4 className={styles.entityName}>
            {this.can_edit ? <span onClick={openEditModal} title="Edit">{entity.name}</span> : entity.name}
          </h4>
          <p className={styles.entityType}>{entity.type}{entity.type && group ? ', ' : ''}{group && group.name}{this.filterPersmission(entity) && this.filterPersmission(entity).title && (entity.type || group && group.name) ? ', ' : ''}{this.filterPersmission(entity) && this.filterPersmission(entity).title ? this.filterPersmission(entity).title : ''}</p>
        </td>
        <td className={styles.timeInvitationStatus}>
          <p>{timeStamp}</p>
          {!entity.is_default && entity.invite_status && entity.invite_status.toUpperCase() === 'PENDING' && (entity.email_invitation || entity.sms_invitation) && <p className={styles.invitationPending}>Invitation Pending</p>}
        </td>
        <td>
          {this.can_edit &&
            <a title="Edit" className={styles.action} onClick={openEditModal}>
              <img src="/images/edit-pen.png" alt="Edit"/>
            </a>
          }
          {this.can_edit && this.props.companyProfile && this.props.companyProfile.enable_team_confirmation &&
            <OverlayTrigger placement="bottom" overlay={tooltip}>
              <a className={styles.margins}  href={"/task/confirmation/"+entity.url_safe_id+"?"+currentDate} target="_blank"><FontAwesomeIcon icon={faLink}/></a>
            </OverlayTrigger>
          }
          { entity.is_default ? <OverlayTrigger placement="bottom" overlay={default_entity_tooltip}><FontAwesomeIcon icon={faInfoCircle} className={styles['default-entity-info']}/></OverlayTrigger>
          : this.can_delete && <a title="Delete" className={styles.action} onClick={(e) => this.toggleModal(e, entity)}>
              <img src="/images/remove.png" alt="Delete" />
            </a>
          }
        </td>
      </tr>
    );
  }

  getEntity(entity_id) {
    for (let i = 0; i < this.state.entities.length; i++) {
      if (this.state.entities[i].id == entity_id) {
        return this.state.entities[i];
      }
    }

    return null;
  }


  renderEntitiesToShowOnMap(entities) {

    if (!entities || entities.length === 0) {
      return <div></div>;
    }

    if (entities.length === 1 && (!entities[0].lastreading)) {
      return this.getEmptyEntityText();
    }

    const filteredEntities = [];
    for (let i = 0; i < entities.length; i++) {
      if (entities[i].lastreading) {
        if (this.state.entityToShowOnMap === 'All') {
          filteredEntities.push({
            location : entities[i].lastreading,
            name     : entities[i].name,
            id       : entities[i].id,
            time     : entities[i].lastreading.time,
            image_path: entities[i].image_path,
            can_turnoff_location: entities[i].can_turnoff_location,
            type     : entities[i].type,
          });
        } else if (entities[i].id == this.state.entityToShowOnMap) {
          filteredEntities.push({
            location : entities[i].lastreading,
            name     : entities[i].name,
            id       : entities[i].id,
            time     : entities[i].lastreading.time,
            image_path: entities[i].image_path,
            can_turnoff_location: entities[i].can_turnoff_location,
            type     : entities[i].type,
          });
          break;
        }
      }
    }

    const showDirections = false;
    const heightForMap = this.props.headerHeight ? this.props.headerHeight : 56;
    const mapHeight = 'calc(100vh - 55px - '+ heightForMap +'px';

    return (
      <div className={styles.map_container }>
        <LocationMapV2 height={mapHeight} entities={filteredEntities} showDirections={showDirections} showLocation />
      </div>
    );
  }

    clearAllFilters(e) {
      e.preventDefault();
      const eObj = {
        target: { name: 'deselect-all' },
        stopPropagation: () => {},
        preventDefault: () => {}
      };
      this.equipmentFilterInstance.handleClick(eObj);
      this.entityFilterInstance.handleClick(eObj);
      this.statusFilterInstance.handleClick(eObj);
    }

  entitiesOnMapFilters(entities) {
   if (entities === null) {
     return (
       <FormControl componentClass="select" placeholder="Entities">
         <option>No Entites</option>
       </FormControl>
     );
   } else {
     return (
       <div className="filters-max-width-cap">
         <FormControl className={styles.filterDropdown} componentClass="select" placeholder="Entities" onChange={this.entityToShowOnMapChanged}>
           <option key={ "option-entity-all" } selected={this.state.entityToShowOnMap === 'All'} value="All">All</option>
             {entities.map((entity) => {
                 return <option key={ 'option-' + entity.id } selected={this.state.entityToShowOnMap === entity.id} value={entity.id}>{entity.name}</option>;
             })}
         </FormControl>
       </div>
     );
   }
  }

  callback(data) {
//    console.log('%ccallback', 'color: #47AAAC; font-weight: bold; font-size: 13px;'); // eslint-disable-line no-console
//    console.log(data); // eslint-disable-line no-console
  }

  showPermissionsUpdateSuccess() {
    setTimeout(() => {
      this.addAlert({
        content: 'Permissions have been updated successfully',
        bsStyle: 'success'
      });
    }, 1e2);
  }

	createToastAlert(alert) {
		toast(alert.text, alert.options);
	}

  render() {
    this.can_create = false;
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
      if (permissions.includes('COMPANY'))is_company = true;
      if (is_company || permissions.includes('ADD_TEAM_MEMBER'))this.can_create = true;
    }

    let titles = ['', 'Name', 'Position', 'Last Seen', ''];
    if (this.state.showIds) {
      titles = ['', 'Id', 'Name', 'Position', 'Last Seen', ''];
    }
    const headers = titles.map((header, idx) => (
      <th key={'headers_' + idx}>{header}</th>
    ));
    const className = ['table-curved', styles['odd-stripped']].join(' ');
    // const updateEntities = this.updateEntities.bind(this);
    const entitiesOnMap = this.renderEntitiesToShowOnMap(this.state.entities);
    let entitiesList = null;
    const entities = this.state.entities;

    if (!entities) {
      entitiesList = (
        <tr>
          <td colSpan="5">
            <SavingSpinner title="" borderStyle="none" />
          </td>
        </tr>
      );
    } else if (entities.length === 1 && entities.is_default === true) {
      entitiesList = (
        <tr>
          <td colSpan="5">
              {this.getEmptyEntityText()}
          </td>
        </tr>
      );
    } else if (this.state.entityToShowOnMap === 'All' && this.state.entityFilter === null) {
      entitiesList = (entities.map((entity, key) => (
          this.renderEntity(entity, key)
      )));
    } else if (this.state.entityToShowOnMap === 'All' && (this.state.entityFilter !== null || this.state.groupsFilter !== null)) {
      const filteredEntities = this.getFilteredEntities(entities);
      if (filteredEntities.length > 0) {
        entitiesList = (filteredEntities.map((entity, key) => (
          this.renderEntity(entity, key)
        )));
      } else {
        let selectedFilter = '';
        const filteredEntities = this.getFilteredEntities(entities);

        if (this.state.entityFilter === 'ONLINE' && filteredEntities.length === 0 ){
          selectedFilter = this.state.entityFilter;
        }
        else if (this.state.entityFilter === 'OFFLINE' && filteredEntities.length === 0 ){
          selectedFilter = this.state.entityFilter;
        }
        if(this.can_view_group_filter){
            let selectedGroup = this.props.groups && this.props.groups.filter(group => group.id  === this.state.groupsFilter);
              if (selectedGroup[0] && selectedGroup[0].name){
                selectedFilter = selectedGroup[0] && selectedGroup[0].name;
                console.log(selectedFilter);
              }
        }
        entitiesList = (
          <tr>
            <td colSpan={5}>
              <Alert bsStyle="info">No team member found in selected {selectedFilter} filter.</Alert>
            </td>
          </tr>
        );
      }
    } else if (this.state.entityToShowOnMap !== 'All') {
      const entity =  this.getEntity(this.state.entityToShowOnMap, 1);
      entitiesList = this.renderEntity(entity, 1);
    }
    const entitiesForFilters = this.entitiesOnMapFilters(this.state.entities);

    let prevDisabled = false;
    let nextDisabled = false;
    if (this.state.page === 1) {
      prevDisabled = true;
    }
    if (this.state.entities !== null && this.state.entities.length < this.state.items_per_page) {
      nextDisabled = true;
    }

    let height = this.props.headerHeight;
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"/></g></svg>;

    return (
      <div className={styles.containerBg}>
        <ErrorAlert errorText="No internet connection" showError={this.state.internetIssue}/>
	      <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
        <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.props.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
        {!this.state.contentLoaded &&
        <div className={styles.taskManagerPlaceholder}>
          <div>&nbsp;</div>
          <div className={styles.placeholderLoadingSpinner}>
            <SavingSpinner title="Loading" borderStyle="none" size={8} />
          </div>
        </div>
        }
        {!this.state.contentLoaded && this.state.permissionGroupsLoadError &&
        <Alert bsStyle="danger">Could not load content at the moment. Please try again.</Alert>
        }
        {this.state.contentLoaded &&
        <Grid>
          <div className={styles.main}>
            <style>
              {'.' + styles.teamContainer + '{ min-height: calc(100vh - 55px - ' + (height ? height : 56)+'px); max-height: calc(100vh - 55px - ' + (height ? height : 56)+'px);}'}
            </style>
            <Joyride
              ref={c => (this.joyride = c)}
              debug={false}
              steps={this.state.steps}
              type={this.state.joyrideType}
              locale={{
                back: (<span>Back</span>),
                close: (<span>Close</span>),
                last: (<span>Last</span>),
                next: (<span>Next</span>),
                skip: (<span>Skip</span>)
              }}
              showOverlay={this.state.joyrideOverlay}
              callback={this.callback}/>
            <Row className={styles.customGridRow}>
              <Col md={6}>
                <Row className={styles.filtersMobile}>
                  <div className={styles['filter-left']}>
                    <Col sm={4} xs={12} md={2}>
                      <h2>{this.state.teamProfile !== null && this.state.teamProfile}</h2>
                    </Col>
                    <Col md={10} sm={7} xs={10}>
                      <div className={styles['filters']}>
                        <span><FontAwesomeIcon icon={faFilter}/> Filter:</span>
                        <FormControl
                          defaultValue={this.state.entityFilter} onChange={(e) => this.handleEntityFilterChange(e)}
                          className={cx(styles.filterDropdown, styles.entityFilterD)} componentClass="select">
                          <option value="ALL">Show all</option>
                          <option value="ONLINE">Show online</option>
                          <option value="OFFLINE">Show offline</option>
                        </FormControl>
                        {this.can_view_group_filter &&
                        <FormControl
                          defaultValue={this.state.groupsFilter} onChange={(e) => this.handleGroupsFilterChange(e)}
                          className={cx(styles.filterDropdown, styles.entityFilterD)} componentClass="select">
                          <option value="NULL">Select group</option>
                          {
                            this.props.groups.map((group) => {
                              return (
                                <option value={group.is_implicit ? '0' : group.id}>{group.name}</option>
                              );
                            })
                          }
                        </FormControl>}
                      </div>
                    </Col>
                    {this.state.showTopActivityStream && <Col md={1} sm={1} xs={2} className={styles.activityStreamBtnContainer}>
                      <ActivityStreamButtonV2 activityStreamStateHandler={this.props.activityStreamStateHandler} />
                    </Col>}
                  </div>
                </Row>
                <div className={styles.teamContainer}>
                  <Row className={styles.teamButtonsContainer}>
                    {this.can_edit_settings &&
                    <Col xs={3}>
                      <div className={styles.settingsBtn}>
                        <Button id="group-settings-button" className="btn-submit"
                                onClick={this.state.loadingSettings ? null : this.handleSettingsClick}>
                          {this.state.loadingSettings ?
                            <SavingSpinner title="" borderStyle="none"/>
                            :
                            'Settings'}
                        </Button>
                      </div>
                    </Col>
                    }
                    <Col xs={this.can_edit_settings ? 9 : 12}>
                    <div className={styles.teamControlBar}>
                      {this.state.fetchingMoreEntities &&
                      <div className={styles.savingSpinnerContainerForPagination}>
                        <SavingSpinner title="Loading" borderStyle="none"/>
                      </div>
                      }
                      {!this.state.fetchingMoreEntities && this.state.entities !== null && (this.state.entities.length > 0 || this.state.page > 1) &&
                      <div className={styles.paginationContainer}>
                        {this.state.blockingLoadTasks || this.state.entities.length < 1
                          ?
                          <p>
                            {this.state.entities.length}
                          </p>
                          :
                          <p>
                            {((this.state.page - 1) * this.state.items_per_page) + 1} - {(this.state.page * this.state.items_per_page) - (this.state.items_per_page - (this.state.entities !== null ? this.state.entities.length : 100))}
                          </p>
                        }
                        <ul>
                          <li style={{cursor: 'wait'}}>
                            <button onClick={() => this.paginationPrevClicked()} disabled={prevDisabled}
                                    className={cx(prevDisabled && 'disabled', this.state.blockingLoadTasks && styles.pendingAction)}>
                              <FontAwesomeIcon icon={faChevronLeft}/>
                            </button>
                          </li>
                          <li style={{cursor: 'wait'}}>
                            <button onClick={() => this.paginationNextClicked()} disabled={nextDisabled}
                                    className={cx(nextDisabled && 'disabled', this.state.blockingLoadTasks && styles.pendingAction)}>
                              <FontAwesomeIcon icon={faChevronRight}/>
                            </button>
                          </li>
                        </ul>
                      </div>
                      }
                      {this.can_create &&
                      <div className={styles.addTMBtn}>
                        <Button id="create-new-task-button" className="btn-submit"
                                onClick={this.displayAddMemberForm}>
                          Add New Team Member
                        </Button>
                      </div>
                      }
                    </div>
                  </Col>
                  </Row>

                  <EntityForm
                    showEntityForm={this.state.showAddMemberForm}
                    createEntity={this.props.createEntity}
                    fields={this.state.editForm}
                    handleImageChange={this.handleImageChange}
                    removeImage={this.removeImage}
                    hideModal={this.hideAddMemberForm}
                    permissionGroups={this.state.permissionGroups}
                    entityCreateSuccess={this.onEntityCreate}
                    onChangeExtraField={this.onChangeExtraField}
                    convertFieldsForStorage={this.convertFieldsForStorage}
                    updateEntity={this.props.updateEntity}
                    profile={this.props.profile}
                    groups={this.props.groups}
                    createToastAlert={this.createToastAlert}
                    entityImageLoader={this.state.entityImageLoader}
                    user_name={this.state.user_name}
                  />
                  <GroupsForm
                    showModal={this.state.showGroupForm}
                    selectedGroup={this.state.selectedGroup}
                    closeModal={this.closeModal}
                    createGroup={createGroup}
                    updateGroup={updateGroup}
                    handleErrorAlerts={this.handleErrorAlerts}
                    getGroupsIconUrl={getGroupsIconUrl}
                    deleteGroupIcon={deleteGroupIcon}
                    uploadGroupsIcon={uploadGroupsIcon}
                    profile={this.props.profile}
                    companyProfile={this.props.companyProfile}
                    createToastAlert={this.createToastAlert}
                  />
                  <div className={styles.errorAlertsContainer}>
                    {this.state.alerts &&
                    this.state.alerts.map((alert, idx) => {
                      alert.timeout(idx);
                      if (alert.bsStyle === 'success') {
                        return (
                          <Alert key={'alert_' + idx} bsStyle={alert.bsStyle}>
                            <strong>{alert.content}</strong>
                          </Alert>
                        );
                      } else {
                        return;
                      }
                    })
                    }
                  </div>
                  <Table className={styles.entitiesTable} striped responsive>
                    <tbody>
                    {entitiesList}
                    </tbody>
                  </Table>
                  <div style={{textAlign: 'right'}}>
                    <Button bsStyle="link" onClick={this.modifyIdsDisplay}>
                      {this.state.showIds ? 'Hide ID' : 'Show ID'}
                    </Button>
                  </div>
                </div>
              </Col>
              <Col md={6}>
                <div className={styles['filter-right']}>
                  <h2>Team on map</h2>
                  {!this.state.showTopActivityStream && <div className={styles.activityStreamBtnContainer}>
                    <ActivityStreamButtonV2 activityStreamStateHandler={this.props.activityStreamStateHandler} />
                  </div>}
                  <div className={styles['filters']}>
                    {entitiesForFilters}
                  </div>
                </div>
                <div>
                  {entitiesOnMap}
                </div>
              </Col>
            </Row>
          </div>
          <Modal dialogClassName={cx(styles.modalPrimary, styles.modalDelete)} show={this.state.toggleModal} onHide={this.toggleModal} keyboard={false} backdrop={'static'}>
            <Modal.Header className={styles.modalHeader}>
              <Modal.Title className={styles.modalTitle}>Delete Team Member</Modal.Title>
              <i className={styles.closeIcon} onClick={this.toggleModal}>{crossIcon}</i>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
              <div className={styles.box}>
                <div className={styles.boxBody}>
                  <div className={styles.boxBodyInner}>
                    <p>Are you sure that you want to delete {this.state.selectedEntity && this.state.selectedEntity.name}?</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={this.removeEntity} disabled={this.state.spinner} className={cx(styles.btn, styles['btn-secondary'])}>
                  {this.state.spinner ? <SavingSpinner color="#ffffff" borderStyle="none" /> : 'Delete'}
                </button>
                <button type="button" onClick={this.toggleModal} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
              </div>
            </Modal.Body>
          </Modal>
        </Grid>
        }
      </div>
    );
  }
}

EntityManager.propTypes = {
  updateEntities: PropTypes.func.isRequired,
  hideEntitiesList: PropTypes.bool,
  createEntity: PropTypes.func,
  removeEntityImage: PropTypes.func,
  deleteEntity: PropTypes.func,
  getEntityImageUrl: PropTypes.func,
  updateEntityImage: PropTypes.func,
  updateEntity: PropTypes.func,
  alerts: PropTypes.array,
  newlyFetchedEntitiesCallback: PropTypes.func,
  profile: PropTypes.object,
  groups: PropTypes.object
};
