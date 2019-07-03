import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ErrorAlert from '../error-alert/error-alert';
import update from 'immutability-helper';
import { Table, Button, Alert, Grid, Row, Col, OverlayTrigger, FormControl, Image, Modal } from 'react-bootstrap';
import cx from 'classnames';
import styles from './equipment-manager-v2.module.scss';
import {Link} from 'react-router-dom';
import {EquipmentFormV2, LocationMapV2} from '../../components';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faInfoCircle, faChevronLeft, faChevronRight, faFilter, faSpinner} from '@fortawesome/fontawesome-free-solid';
import {DEFAULT_COLORPICKER_COLOR} from '../fields/color-field';
import moment from 'moment';
import {
  getProfileInformation,
  getEntityPermissionsGroups,
  getSingleGroup,
  getExternalIntegrationData
} from '../../actions';
import {getErrorMessage} from '../../helpers/task';
import SavingSpinner from '../saving-spinner/saving-spinner';

import {toast, ToastContainer} from 'react-toastify';
import {ActivityStream, ActivityStreamButtonV2} from '../index';
import TimeAgo from "react-timeago";

export default class EquipmentManagerV2 extends Component {
  constructor(props) {
    super(props);
    this.removeEquipment = this.removeEquipment.bind(this);
    this.createEquipment = this.createEquipment.bind(this);
    this.updateEquipments = this.updateEquipments.bind(this);
    this.openEditModal = this.openEditModal.bind(this);
    this.closeEditModal = this.closeEditModal.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.handleSubmitForm = this.handleSubmitForm.bind(this);
    this.modifyIdsDisplay = this.modifyIdsDisplay.bind(this);
    this.displayAddMemberForm = this.displayAddMemberForm.bind(this);
    this.hideAddMemberForm = this.hideAddMemberForm.bind(this);
    this.paginationNextClicked = this.paginationNextClicked.bind(this);
    this.paginationPrevClicked = this.paginationPrevClicked.bind(this);
    this.equipmentCreateSuccess = this.equipmentCreateSuccess.bind(this);
    this.handleGroupsFilterChange = this.handleGroupsFilterChange.bind(this);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
    this.handleErrorAlerts = this.handleErrorAlerts.bind(this);
    this.createToastAlert = this.createToastAlert.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.getSimpleEmptyEquipmentText = this.getSimpleEmptyEquipmentText.bind(this);
    this.getFilteredEquipments = this.getFilteredEquipments.bind(this);
    this.renderfleetOnMap = this.renderfleetOnMap.bind(this);
    this.toggleModal = this.toggleModal.bind(this);

    this.state = {
      alerts: props.alerts || [],
      showModal: false,
      showPermissionModal: false,
      editFormError: '',
      editForm: {},
      timer: null,
      sendingEquipment: false,
      equipmentAdded: false,
      updatingEquipment: false,
      showIds: false,
      showAddMemberForm: false,
      companyProfile: null,
      permissionsUpdated: false,
      items_per_page: 100,
      page: 1,
      fetchingMoreEquipment: false,
      permissionGroups: null,
      contentLoaded: false,
      permissionGroupsLoadError: false,
      equipmentFilter: 'ALL',
      groupsFilter: null,
      showGroupForm: false,
      selectedGroup: null,
      loadingSettings: false,
      internetIssue: undefined,
      showTopActivityStream: window.innerWidth > 992 ? false : true,
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
      equipmentImageLoader: false,
      toggleModal: false,
      spinner: false,
    };
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleWindowResize);
    const promises = [];

    promises.push(getEntityPermissionsGroups().then((res) => {
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
        companyProfile: profile["fullname"],
      });
    }));
    Promise.all(promises).then(() => {
      this.setState({
        timer,
        contentLoaded: true
      })
    });
    this.updateEquipments();
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 3e4);
  }

  toggleModal(e, equipment = null) {
    e.preventDefault();
    e.stopPropagation();
    let toggleModal = this.state.toggleModal;
    this.setState({toggleModal: !toggleModal, selectedEquipment: equipment});
  }

  handleWindowResize() {
    if (window.innerWidth > 992 && this.state.showTopActivityStream) {
      this.setState({
        showTopActivityStream: false,
      })
    } else if (window.innerWidth <= 992 && !this.state.showTopActivityStream) {
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
      fetchingMoreEquipment: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum - 1;
    if (localPageNum > 1) {
      this.setState({
          page: newPage,
          entityToShowOnMap: 'All'
        },
        () => this.updateEquipments(false));
    } else {
      this.setState({
          page: 1,
          entityToShowOnMap: 'All'
        },
        () => this.updateEquipments(false));
    }
  }

  paginationNextClicked() {
    this.setState({
      fetchingMoreEquipment: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum + 1;
    this.setState({
        page: newPage,
        entityToShowOnMap: 'All'
      },
      () => this.updateEquipments(false));
  }

  getFilteredEquipments(equipments) {
    if (this.state.groupsFilter || this.state.groupsFilter === 0) {
      let selectedGroupEntities = equipments.filter(equipment => {
        return this.state.groupsFilter === 0 ? (equipment.group_id === null) : (equipment.group_id === this.state.groupsFilter);
      });
      return selectedGroupEntities;
    }
    return equipments;
  }

  handleGroupsFilterChange(e) {
    e.preventDefault();
    e.stopPropagation();
    let value = e.target.value;
    if (e.target.value === 'NULL') {
      value = null;
    } else {
      value = parseInt(e.target.value);
    }
    this.setState({
      groupsFilter: value
    });

  }

  equipmentCreateSuccess(alert) {
    setTimeout(() => {
      this.updateEquipments();
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
        color: '',
        permissions: ''
      }
    });
  }

  startAsyncUpdate() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
    this.updateEquipments();
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


  onChangeField(field, value) {
    this.setState({
      editFormError: '',
      editForm: update(this.state.editForm, {
        [field.name]: {$set: value}
      })
    });
  }


  handleImageChange(e) {
    if (this.state.equipmentImageLoader === false) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ equipmentImageLoader: true });
      const image = e.target.files[0];
      if (typeof image !== 'undefined' && (image.type === 'image/jpeg' || image.type === 'image/jpg' || image.type === 'image/svg' || image.type === 'image/png' || image.type === 'image/gif')) {
        const reader = new FileReader();

        reader.readAsDataURL(image);

        reader.onloadend = () => {
          this.setState({
            editFormError: '',
            editForm: update(this.state.editForm, {
              image_path: { $set: reader.result },
              image: { $set: image }
            })
          });

          this.props.getEquipmentImageUrl(this.state.editForm.id).then((response) => {
            const { upload_url, file_id } = JSON.parse(response);
            const data = new FormData();
            data.append('file-0', this.state.editForm.image);

            this.props.updateEquipmentImage(upload_url, data).then((resp) => {
              const { file_path } = JSON.parse(resp);
              const equipmentIndex = this.state.equipments.findIndex(el => el.id === this.state.editForm.id);
              this.setState({
                editFormError: '',
                equipments: update(this.state.equipments, {
                  [equipmentIndex]: {
                    image_id: { $set: file_id },
                    image_path: { $set: file_path }
                  }
                }),
                editForm: update(this.state.editForm, {
                  image_id: { $set: file_id },
                  image_path: { $set: file_path }
                }),
                equipmentImageLoader: false
              });
            });
          });
        };
      } else {
        this.setState({
          equipmentImageLoader: false
        });
        const alert = {
          text: 'Please upload a valid image file.',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.createToastAlert(alert);
      }
    }
  }

  removeImage() {
    if (this.state.equipmentImageLoader === false && this.state.editForm.image_id) {
      this.setState({ equipmentImageLoader: true });
      this.props.removeEquipmentImage(this.state.editForm.id, this.state.editForm.image_id)
        .then(() => {
          const equipmentIndex = this.state.equipments.findIndex(el => el.id === this.state.editForm.id);
          this.setState({
            editFormError: '',
            equipments: update(this.state.equipments, {
              [equipmentIndex]: {
                image_id: { $set: '' },
                image_path: { $set: '' }
              }
            }),
            editForm: update(this.state.editForm, {
              image_path: { $set: '' },
              image_id: { $set: '' }
            }),
            equipmentImageLoader: false
          });
        })
        .catch((err) => {
          this.setState({ equipmentImageLoader: false });
          const responseText = JSON.parse(err.responseText);
          const alert = {
            text: getErrorMessage(responseText),
            options: {
              type: toast.TYPE.ERROR,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastErrorAlert,
              autoClose: 8000
            }
          };
          this.createToastAlert(alert);
        });
    }
  }

  handleSubmitForm(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({editFormError: '', updatingEquipment: true});

    const updatedEquipment = jQuery.extend(true, {}, this.state.editForm);

    if (updatedEquipment.name === '' || updatedEquipment.name === null) {
      const editFormError = 'Equipment name is required.';
      const alert = {
        text: editFormError,
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.createToastAlert(alert);
      this.setState({
        updatingEquipment: false
      });
      return false;
    }

    updatedEquipment.extra_fields = JSON.stringify(this.convertFieldsForStorage(updatedEquipment.extra_fields));

    this.props.updateEquipment(updatedEquipment).then(() => {
      this.setState({editFormError: '', updatingEquipment: false});
      const equipmentIndex = this.state.equipments.findIndex(el => el.id === this.state.editForm.id);
      this.setState({
        editFormError: '',
        equipments: update(this.state.equipments, {
          [equipmentIndex]: {
            name: {$set: this.state.editForm.name},
            type: {$set: this.state.editForm.type},
            details: {$set: this.state.editForm.details},
            extra_fields: {$set: this.state.editForm.extra_fields},
            group_id: {$set: this.state.editForm.group_id}
          }
        }),
        showModal: false,
      });
      const alert = {
        text: 'Equipment saved successfully.',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.createToastAlert(alert);
    }).catch((err) => {
      this.setState({updatingEquipment: false});
      const responseText = JSON.parse(err.responseText);
      const alert = {
        text: getErrorMessage(responseText),
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.createToastAlert(alert);
    });
  }

  createEquipment({name, type, group_id}) {
    if (group_id === '-1') {
      const groupError = {
        text: 'Equipment Group is required. Please select a group for equipment.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.createToastAlert(groupError);
      return;
    }
    this.setState({editFormError: '', sendingEquipment: true, equipmentAdded: false});
    this.props.createEquipment({name, type, details: '', group_id})
      .then(() => {
        this.setState({editFormError: '', sendingEquipment: false, equipmentAdded: true});
        setTimeout(() => {
          this.updateEquipments();
          const equipmentAdded = {
            text: 'Equipment [' + name + '] was added!',
            options: {
              type: toast.TYPE.SUCCESS,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastSuccessAlert,
              autoClose: 8000
            }
          };
          this.createToastAlert(equipmentAdded);
        }, 1e2);
      })
      .catch((res) => {
        this.setState({sendingEquipment: false});
        const error = JSON.parse(res.responseText);
        const addEqpError = {
          text: getErrorMessage(error),
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.createToastAlert(addEqpError);
      });
  }

  renderfleetOnMap() {
    let equipments = this.state.equipments;
    if (!equipments || equipments.length === 0) {
      return <div></div>;
    }

    const filteredEquipments = [];
    for (let i = 0; i < equipments.length; i++) {
      if (equipments[i].external_data && equipments[i].external_data.lat && equipments[i].external_data.lng) {
        filteredEquipments.push({
          location: {lat: equipments[i].external_data.lat, lng: equipments[i].external_data.lng},
          name: equipments[i].name,
          id: equipments[i].id,
          image_path: equipments[i].image_path,
          type: 'equipment',
          address: equipments[i].external_data.location,
          external_name: equipments[i].external_data.name,
          speed: equipments[i].external_data.speed,
          time: equipments[i].external_data.minuts,
          last_location: equipments[i].external_data.location,
          vin: equipments[i].external_data.vin,
          fuel: equipments[i].external_data.fuel,
          odometer: equipments[i].external_data.odometer,
        });
      }

    }

    return (
      <div className={styles.map_container}>
        <LocationMapV2 height={'calc(100vh - 110px)'} entities={filteredEquipments} showLocation/>
      </div>
    );
  }

  removeEquipment() {
    const equipment = this.state.selectedEquipment;
    this.setState({ spinner: true });
    if (this.props.deleteEquipment && equipment) {
      this.props.deleteEquipment(equipment.id)
        .then(() => {
          this.setState({ toggleModal: false, spinner: false });
          setTimeout(() => {
            const eqpDeleted = {
              text: 'Equipment ' + equipment.name + ' was removed',
              options: {
                type: toast.TYPE.SUCCESS,
                position: toast.POSITION.BOTTOM_LEFT,
                className: styles.toastSuccessAlert,
                autoClose: 8000
              }
            };
            this.createToastAlert(eqpDeleted);
            this.updateEquipments();
          }, 1e2);
        });
    }
  }

  updateEquipments(checkNewEquipment = true) {
    const items_per_page = this.state.items_per_page;
    const page = this.state.page;
    this.props.updateEquipments(items_per_page, page).then((equipments) => {
      let jsonEquipments = JSON.parse(equipments);
      const Equipments = jsonEquipments;
      Equipments.map((equipment) => {
        if (equipment.external_integrations.length > 0) {
          getExternalIntegrationData(equipment.id).then((res) => {
            const result = JSON.parse(res);
            const equipments = this.state.equipments;
            const foundIndex = equipments && equipments.findIndex((single_equipment) => {
              return single_equipment.id === equipment.id;
            });
            if (foundIndex > -1 && result.length > 0) {
              equipments[foundIndex].external_data = {
                location: result[0].location,
                speed: result[0].speedMilesPerHour ? parseInt(Math.ceil(result[0].speedMilesPerHour)) + ' mph' : '0 mph',
                lat: result[0].latitude,
                lng: result[0].longitude,
                name: result[0].samsara_resource_name,
                minuts: result[0].timeMs ? moment.utc(moment.unix(parseInt(result[0].timeMs) / 1000)).format("DD MMM YYYY hh:mm a") : 0,
                vin: result[0].vin,
                fuel: parseInt(result[0].fuelLevelPercent * 100),
                odometer: parseInt(Math.ceil((result[0].odometerMeters / 1000) / 1.60934)),
                enginelights: result[0].checkenginelightisOn,
                enginefaults: result[0].enginefaults,
                total_engine_faults: result[0].total_engine_faults,
                engineHours: result[0].engineHours,
              };

            } else if (foundIndex > -1) {
              equipments[foundIndex].external_data = {};
            }
            this.setState({
              equipments
            });
          }).catch((e) => {
            const equipments = this.state.equipments;
            const foundIndex = equipments && equipments.findIndex((single_equipment) => {
              return single_equipment.id === equipment.id;
            });
            if (foundIndex > -1) {
              equipments[foundIndex].external_data = {};
            }
            this.setState({
              equipments
            });
          });
        } else {
          const equipments = this.state.equipments || jsonEquipments;
          const foundIndex = equipments.findIndex((single_equipment) => {
            return single_equipment.id === equipment.id;
          });
          if (foundIndex > -1) {
            equipments[foundIndex].external_data = {};
          }

        }
      });


      if (this.props.newlyFetchedEquipmentsCallback) {
        this.props.newlyFetchedEquipmentsCallback(jsonEquipments);
      }

      if (jsonEquipments.length === 0 && this.state.page === 1 && this.joyride) {
        this.joyride.start();
      }

      jsonEquipments = jsonEquipments.map((equipment) => {
        if (checkNewEquipment && this.state.equipments) {
          const findEquipment = this.state.equipments.find((e) => {
            return e.id === equipment.id;
          })
          equipment.new = !(findEquipment);
          if (findEquipment) {
            equipment.external_data = {
              location: findEquipment.external_data.location,
              speed: findEquipment.external_data.speed,
              lat: findEquipment.external_data.lat,
              lng: findEquipment.external_data.lng,
              name: findEquipment.external_data.name,
              minuts: findEquipment.external_data.minuts,
              vin: findEquipment.external_data.vin,
              fuel: findEquipment.external_data.fuel,
              odometer: findEquipment.external_data.odometer,
              enginelights: findEquipment.external_data.enginelights,
              enginefaults: findEquipment.external_data.enginefaults,
              total_engine_faults: findEquipment.external_data.total_engine_faults,
              engineHours: findEquipment.external_data.engineHours,
            };
          }
        }
        const extra_fields = equipment.extra_fields;
        equipment.extra_fields = this.convertFieldsForEditing(extra_fields);
        return equipment;
      });

      this.setState({
        editFormError: '', equipments: jsonEquipments,
        alerts: this.state.alerts, fetchingMoreEquipment: false
      });
    });
  }

  removeAlert(idx) {
    this.setState({
      editFormError: '',
      alerts: this.state.alerts.filter((alert, id) => {
        return id !== idx;
      })
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
      editFormError: ''
    });
  }

  equipmentToShowOnMapChanged(e) {
    this.setState({
      editFormError: '',
      equipmentToShowOnMap: e.target.value
    });
  }

  openEditModal(equipment_id) {
    const equipment = this.state.equipments.find((el) => el.id === equipment_id);
    const equipmentToEdit = Object.assign({}, equipment);
    if (this.props.groups && !this.props.groups.find((group) => {
      return group.id === parseInt(equipmentToEdit['group_id']);
    })) {
      equipmentToEdit['group_id'] = null;
    }
    this.setState({editFormError: '', showAddMemberForm: true, editForm: equipmentToEdit});
  }

  closeEditModal() {
    this.setState({editFormError: '', showModal: false});
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

  modifyIdsDisplay() {
    this.setState({editFormError: '', showIds: !this.state.showIds});
  }

  getSimpleEmptyEquipmentText() {
    return (<div className={styles['no-equipment-simple']}>
      <Alert bsStyle="info">Add your first equipment above</Alert>
    </div>);
  }

  onChangeExtraField(fields) {
    this.setState({
      editFormError: '',
      editForm: update(this.state.editForm, {
        extra_fields: {$set: fields}
      })
    });
  }

  renderEquipment(equipment, key) {
    const group = this.props.groups && equipment.group_id && this.props.groups.find((group) => {
      return group.id === equipment.group_id;
    });
    this.can_edit = false;
    this.can_delete = false;
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY')) is_company = true;
      if (is_company || permissions.includes('EDIT_EQUIPMENT')) this.can_edit = true;
      if (is_company || permissions.includes('DELETE_EQUIPMENT')) this.can_delete = true;
    }
    const removeEquipment = () => this.removeEquipment(equipment);
    const openEditModal = () => this.openEditModal(equipment.id);

    const color = DEFAULT_COLORPICKER_COLOR;

    return (
      <tr className={equipment.new ? styles['new-equipment'] : ''} key={'entity_' + key}>
        <td>
          <div className={cx(styles['equipment-image'], 'row')}>
            <Image src={equipment.image_path || '/images/equipment.png'} thumbnail responsive/>
            <div className={cx(styles['equipment-color'], 'text-right')} style={{background: color}}/>
          </div>
        </td>
        {this.state.showIds ? <td>{equipment.id}</td> : null}
        <td>
          <h4 className={styles.equipmentName}>
          {this.can_edit ? <span title="Edit" onClick={openEditModal}>{equipment.name}</span> : equipment.name}
          </h4>
          <p className={styles.equipmentType}>{equipment.type}{equipment.type && group ? ', ' : ''}{group && group.name}</p>
        </td>

        {equipment.external_integrations && equipment.external_integrations.length > 0 ?
          <td>{!equipment.external_data ? <div className={cx('text-right', styles.loadingSpinner)}>
            <FontAwesomeIcon icon={faSpinner} spin/>
          </div> : <div>
            <p
              className={styles.paragraplineheight}>{equipment.external_data.name && 'Samsara Name: ' + equipment.external_data.name}</p>
            <p
              className={styles.paragraplineheight}>{equipment.external_data.location && 'Last location: ' + equipment.external_data.location}</p>
            <p
              className={styles.paragraplineheight}>{equipment.external_data.speed ? 'Speed: ' + equipment.external_data.speed : ''}</p>
            <p className={styles.paragraplineheight}>{equipment.external_data.minuts ? <span>Updated: <TimeAgo
              date={moment.utc(equipment.external_data.minuts).local().toISOString()}/></span> : ''}</p>
            <p
              className={styles.paragraplineheight}>{equipment.external_data.vin && 'VIN: ' + equipment.external_data.vin}</p>
            <p
              className={styles.paragraplineheight}>{equipment.external_data.fuel ? 'Fuel: ' + equipment.external_data.fuel + ' % ' : ''}</p>
            <p
              className={styles.paragraplineheight}>{equipment.external_data.odometer ? 'Odometer: ' + equipment.external_data.odometer + ' mi' : ''}</p>
            <p
              className={styles.paragraplineheight}>{!Object.is(equipment.external_data.enginelights, undefined) ? (equipment.external_data.enginelights ? 'Engine check light: On' : 'Engine check light: Off') : ''}</p>
            <p
              className={styles.paragraplineheight}>{!Object.is(equipment.external_data.enginelights, undefined) ? (equipment.external_data.enginelights ? 'Engine : On' : 'Engine : Off') : ''}</p>
            <p
              className={styles.paragraplineheight}>{equipment.external_data.engineHours && 'Engine hours: ' + equipment.external_data.engineHours}</p>
            <p
              className={styles.paragraplineheight}>{equipment.external_data.total_engine_faults ? 'Total Engine Faults: ' + equipment.external_data.total_engine_faults : ''}</p>
            <p
              className={styles.paragraplineheight}>{equipment.external_data.enginefaults && 'Engine Faults: ' + equipment.external_data.enginefaults}</p>
          </div>}
          </td> : <br></br>}
        <td>
          {this.can_edit &&
          <a title="Edit" className={styles.action} onClick={openEditModal}>
            <img src="/images/edit-pen.png" alt="Edit"/>
          </a>
          }
          {equipment.is_default ? <OverlayTrigger placement="bottom"><FontAwesomeIcon icon={faInfoCircle}
                                                                                      className={styles['default-equipment-info']}/></OverlayTrigger>
            : this.can_delete && <a title="Delete" className={styles.action} onClick={(e) => this.toggleModal(e, equipment)}>
            <img src="/images/remove.png" alt="Delete"/>
          </a>}
        </td>
      </tr>
    );
  }

  callback(data) {
    console.log('%ccallback', 'color: #47AAAC; font-weight: bold; font-size: 13px;'); //eslint-disable-line no-console
    console.log(data);
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
      if (permissions.includes('COMPANY')) is_company = true;
      if (is_company || permissions.includes('ADD_EQUIPMENT')) this.can_create = true;
    }

    let equipmentsList = null;
    const equipments = this.state.equipments;
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"/></g></svg>;

    if (!equipments) {
      equipmentsList = (
        <tr>
          <td colSpan="5">
            <SavingSpinner title="" size={8} borderStyle="none"/>
          </td>
        </tr>
      );
    } else if (this.state.equipments.length === 0 && this.state.page === 1) {
      equipmentsList = (
        <tr>
          <td colSpan="5">
            {this.getSimpleEmptyEquipmentText()}
          </td>
        </tr>
      );
    } else if (this.state.groupsFilter !== null) {
      const filteredEntities = this.getFilteredEquipments(equipments);
      if (filteredEntities.length > 0) {
        equipmentsList = (filteredEntities.map((equipment, key) => (
          this.renderEquipment(equipment, key)
        )));
      } else {
        equipmentsList = (
          <tr>
            <td colSpan={5}>
              <Alert bsStyle="info">No equipment found in selected filter.</Alert>
            </td>
          </tr>
        );
      }
    } else if (this.state.equipments.length === 0 && this.state.page > 1) {
      equipmentsList = (
        <tr>
          <td colSpan="5">
            <div className={styles['no-equipment-simple']}>
              No more equipments.
            </div>
          </td>
        </tr>
      );
    } else {
      equipmentsList = (this.state.equipments.map((equipment, key) => (
        this.renderEquipment(equipment, key)
      )));
    }

    let prevDisabled = false;
    let nextDisabled = false;
    if (this.state.page === 1) {
      prevDisabled = true;
    }
    if (this.state.equipments && this.state.equipments.length < this.state.items_per_page) {
      nextDisabled = true;
    }

    return (
      <div className={styles.containerBg}>
        <ErrorAlert errorText="No internet connection" showError={this.state.internetIssue}/>
        <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
        {!this.state.contentLoaded && this.state.permissionGroupsLoadError &&
        <Alert bsStyle="danger">Could not load content at the moment. Please try again.</Alert>
        }
        {this.state.contentLoaded &&
        <Grid>
          <div>
            <Row className={styles.customGridRow}>
              <Col md={12}>
                <div className={styles.filtersBar}>
                  <div className={styles['filter-left']}>
                    <h2>{this.state.companyProfile}</h2>
                    <div className={styles.filtersContainer}>
                      <div className={styles['filters']}>
                        {this.can_view_group_filter &&
                        <FormControl
                          defaultValue={this.state.groupsFilter} onChange={(e) => this.handleGroupsFilterChange(e)}
                          className={cx(styles.filterDropdown, styles.equipmentFilterD)} componentClass="select">
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
                      <div className={styles.activityStreamBtnContainer}>
                        <ActivityStreamButtonV2 activityStreamStateHandler={this.props.activityStreamStateHandler}/>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.teamContainer}>
                  <Row className={styles.teamButtonsContainer}>

                    <Col xs={12}>
                      <div className={styles.teamControlBar}>
                        {this.state.fetchingMoreEquipment &&
                        <div className={styles.savingSpinnerContainerForPagination}>
                          <SavingSpinner title="Loading" borderStyle="none"/>
                        </div>
                        }
                        {(!this.state.fetchingMoreEquipment && this.state.equipments && (this.state.equipments.length > 0 || this.state.page > 1)) &&
                          <div className={styles.paginationContainer}>
                            {this.state.blockingLoadTasks || this.state.equipments.length < 1
                              ?
                              <p>
                                {this.state.equipments.length}
                              </p>
                              :
                              <p>
                                {((this.state.page - 1) * this.state.items_per_page) + 1} - {(this.state.page * this.state.items_per_page) - (this.state.items_per_page - (this.state.equipments !== null ? this.state.equipments.length : 100))}
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
                            Add new equipment
                          </Button>
                        </div>
                        }
                      </div>
                    </Col>
                  </Row>

                  <EquipmentFormV2
                    showEquipmentForm={this.state.showAddMemberForm}
                    equipment={this.state.equipments}
                    createEquipment={this.props.createEquipment}
                    fields={this.state.editForm}
                    handleImageChange={this.handleImageChange}
                    removeImage={this.removeImage}
                    hideModal={this.hideAddMemberForm}
                    permissionGroups={this.state.permissionGroups}
                    equipmentCreateSuccess={this.equipmentCreateSuccess}
                    onChangeExtraField={this.onChangeExtraField}
                    convertFieldsForStorage={this.convertFieldsForStorage}
                    updateEquipment={this.props.updateEquipment}
                    profile={this.props.profile}
                    groups={this.props.groups}
                    createToastAlert={this.createToastAlert}
                    updateEquipments={this.updateEquipments}
                    equipmentImageLoader={this.state.equipmentImageLoader}
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
                  <Table className={styles.equipmentsTable} striped responsive>
                    <tbody>
                    {equipmentsList}
                    </tbody>
                  </Table>
                  <div style={{textAlign: 'right'}}>
                    <Button bsStyle="link" onClick={this.modifyIdsDisplay}>
                      {this.state.showIds ? 'Hide ID' : 'Show ID'}
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <br/><br/>
              {this.renderfleetOnMap()}
            </Row>
          </div>
          <Modal dialogClassName={cx(styles.modalPrimary, styles.modalDelete)} show={this.state.toggleModal} onHide={this.toggleModal} keyboard={false} backdrop={'static'}>
            <Modal.Header className={styles.modalHeader}>
              <Modal.Title className={styles.modalTitle}>Delete Equipment</Modal.Title>
              <i className={styles.closeIcon} onClick={this.toggleModal}>{crossIcon}</i>
            </Modal.Header>
            <Modal.Body className={styles.modalBody}>
              <div className={styles.box}>
                <div className={styles.boxBody}>
                  <div className={styles.boxBodyInner}>
                    <p>Are you sure that you want to delete {this.state.selectedEquipment && this.state.selectedEquipment.name}?</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <button type="button" onClick={this.removeEquipment} disabled={this.state.spinner} className={cx(styles.btn, styles['btn-secondary'])}>
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

EquipmentManagerV2.propTypes = {
  updateEquipments: PropTypes.func.isRequired,
  createEquipments: PropTypes.func,
  deleteEquipments: PropTypes.func,
  getEquipmentsImageUrl: PropTypes.func,
  updateEquipmentsImage: PropTypes.func,
  alerts: PropTypes.array,
  newlyFetchedEquipmentsCallback: PropTypes.func,
  profile: PropTypes.object,
  groups: PropTypes.object
};
