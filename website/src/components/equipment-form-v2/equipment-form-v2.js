import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './equipment-form-v2.module.scss';
import { Row, Col, Alert, FormControl, Modal, FormGroup, Button, Image } from 'react-bootstrap';
import SavingSpinner from '../saving-spinner/saving-spinner';
import ExtraFields from '../task-wrapper-v2/components/instructions/extra-fields/extra-fields';
import cx from 'classnames';
import { getErrorMessage } from '../../helpers/task';
import update from 'immutability-helper';
import { toast } from 'react-toastify';

export default class EquipmentFormV2 extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendingEquipment: false,
      alerts: [],
      equipment: {
        name: '',
        type: '',
        color: '',
        permission: '',
        group_id: '-1',
        extra_fields: '',
      },
      nameError: null,
      emailError: null,
      equipmentCreateError: null,
      permissionError: null,
      showEquipmentForm: false,
      editFormError: null,
      groupError: null,
      selectedGroup: {
        title: null,
        description: null
      }
    };
    this.updateImageClick = this.updateImageClick.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.createEquipment = this.createEquipment.bind(this);
    this.clearNameError = this.clearNameError.bind(this);
    this.clearEmailError = this.clearEmailError.bind(this);
    this.clearGroupError  = this.clearGroupError.bind(this);
    this.initializeDefaultValues = this.initializeDefaultValues.bind(this);
    this.hideEquipmentForm = this.hideEquipmentForm.bind(this);
    this.onChangeExtraField = this.onChangeExtraField.bind(this);
    this.updateEquipmentOnServer = this.updateEquipmentOnServer.bind(this);
    this.hideAlerts = this.hideAlerts.bind(this);
    this.renderGroups = this.renderGroups.bind(this);
    this.handleGroupsChange = this.handleGroupsChange.bind(this);
  }

  componentDidMount() {
    this.initializeDefaultValues();
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.fields.id !== 'undefined' && !this.state.showEquipmentForm) {
      const equipment = $.extend(true, {}, nextProps.fields);
      let selectedGroup = {
        title: null,
        description: null
      };
      if (equipment.permission_groups) {
        const designatedPermissionGroupIndex = equipment.permission_groups.findIndex((el) => {
          return el.status === true;
        });
        if (designatedPermissionGroupIndex !== -1) {
          selectedGroup = equipment.permission_groups[designatedPermissionGroupIndex];
        }
      }
      if (this.props.groups && !this.props.groups.find(group => { return (group.id === equipment.group_id || (group.is_implicit && equipment.group_id === null)); })) {
        equipment.group_id = '-1';
      }
      this.setState({
        equipment,
        selectedGroup,
        showEquipmentForm: true
      });
    } else if (typeof nextProps.fields.id !== 'undefined' && nextProps.fields.image_id !== this.state.equipment.image_id) {
      this.setState({
        equipment: $.extend(true, {}, nextProps.fields)
      });
    }
  }

  updateEquipmentOnServer(e, hasGroups) {
    e.preventDefault();
    e.stopPropagation();
    const updatedEquipments = jQuery.extend(true, {}, this.state.equipment);
    const name = updatedEquipments.name ? updatedEquipments.name.trim() : '';
    const type = updatedEquipments.type ? updatedEquipments.type.trim() : '';
    const id = updatedEquipments.id ? updatedEquipments.id : null;
    let group_id = updatedEquipments.group_id ? updatedEquipments.group_id : null;
    let details =  updatedEquipments.details ? updatedEquipments.details : null;
    let extra_fields = this.state.equipment.extra_fields ? JSON.stringify(this.props.convertFieldsForStorage(updatedEquipments.extra_fields)):null;

    if (updatedEquipments.name === '' || updatedEquipments.name === null) {
      const  nameError = {
        text: 'Name is required. Please enter a name for an equipment.',
        options: {
          type: toast.TYPE.ERROR,
	        position: toast.POSITION.BOTTOM_LEFT,
	        className: styles.toastErrorAlert,
	        autoClose: 8000
        }
      };
      this.props.createToastAlert(nameError);
      return;
    }

    if (this.state.equipment.group_id === '-1' && hasGroups) {
	    const groupError = {
		    text: 'Group is required. Please select a group for an equipment.',
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(groupError);
	    return;
    }

    updatedEquipments.group_id = (this.state.equipment.group_id === '-1' && !hasGroups) ? '' : this.state.equipment.group_id;

    this.setState({
      sendingEquipment: true
    });

    this.props.updateEquipment({details ,extra_fields ,id ,name, type, group_id}).then(() => {
      this.setState({
        sendingEquipment: false
      });
      setTimeout(() => {
        this.props.updateEquipments();
      },1e2);
      this.props.createToastAlert({
        text: name + ' was updated!',
	      options: {
		      type: toast.TYPE.SUCCESS,
		      position: toast.POSITION.BOTTOM_LEFT,
		      className: styles.toastSuccessAlert,
		      autoClose: 8000
	      }
      });

      this.clearNameError();
      this.clearEmailError();
      this.clearGroupError();
      this.hideEquipmentForm();

    }).catch((err) => {
      this.setState({ sendingEquipment: false });
      const responseText = JSON.parse(err.responseText);
	    const equipmentUpdateError = {
		    text: getErrorMessage(responseText),
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(equipmentUpdateError);
    });
  }

  hideAlerts() {
    this.setState({
      emailError: null,
      nameError: null,
      equipmentCreateError: null,
      permissionError: null,
      editFormError: null
    });
  }

  hideEquipmentForm() {
    this.setState({
      showEquipmentForm: false
    }, () => {
      this.initializeDefaultValues();
      this.hideAlerts();
      this.props.hideModal();
    });
  }

  clearNameError() {
    this.setState({
      nameError: null
    });
  }

  clearEmailError() {
    this.setState({
      emailError: null
    });
  }

  clearGroupError() {
    this.setState({
      groupError: null
    });
  }

  handleFieldChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const equipment = { ...this.state.equipment };
    equipment[e.target.name] = e.target.value;
    this.setState({
      equipment
    });
  }


  handleGroupsChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const equipment = { ...this.state.equipment };
    equipment.group_id = e.target.value;
    this.setState({
      equipment,
    });
  }

  initializeDefaultValues() {
    const equipment = {
      name: '',
      type: '',
      color: '',
      permission: '',
      group_id: '-1'
    };
    this.setState({
      equipment,
      selectedGroup: {
        title: null,
        description: null
      }
    });
  }


  renderGroups() {
    let disableGroupClass = '';
    const renderedGroups = this.props.groups &&  this.props.groups.map((group) => {
      if (group.is_disabled && group.id === this.state.equipment.group_id) {
        disableGroupClass = styles.disableGroup;
      } else {
        disableGroupClass = '';
      }
      if (group.is_disabled && group.id !== this.state.equipment.group_id) {
        return null;
      }
      return (
        <option disabled={disableGroupClass}  value={group.is_implicit ? '' : group.id} selected={this.state.equipment.group_id ? (group.id === this.state.equipment.group_id) : group.is_implicit} className={disableGroupClass}>{group.name}</option>
      );
    });
    return renderedGroups;
  }

  updateImageClick() {
    this.refs.imageUploader.click();
  }

  onChangeExtraField(fields) {
    this.setState({
      equipment: update(this.state.equipment, {
        extra_fields: { $set: fields }
      })
    });
  }


  createEquipment(e, hasGroups) {
    e.preventDefault();
    e.stopPropagation();

    const name = this.state.equipment.name ? this.state.equipment.name.trim() : '';
    const type = this.state.equipment.type ? this.state.equipment.type.trim() : '';
    let group_id = this.state.equipment.group_id ? this.state.equipment.group_id : null;
    let details =  this.state.equipment.details ? this.state.equipment.details : null;

    let extra_fields =  this.state.equipment.extra_fields ? JSON.stringify(this.props.convertFieldsForStorage(this.state.equipment.extra_fields)): null;

    if (this.props.profile
      && (!this.props.profile.permissions.includes('COMPANY') && !this.props.profile.permissions.includes('ASSIGN_GROUPS'))
      && (this.props.profile.group_id || this.props.profile.group_id === null)) {
      group_id = this.props.profile.group_id;
    }

    if (!hasGroups) {
      group_id = '';
    }

    if (name === '' || name === null) {
	    const  nameError = {
		    text: 'Name is required. Please enter a name for the equipment.',
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(nameError);
      return;
    } else if (group_id === '-1') {
	    const groupError = {
		    text: 'Group is required. Please select a group for equipment.',
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(groupError);
      return;
        } else {
          this.setState({
            sendingEquipment: true
      });
      this.props.createEquipment({ name, type, details, group_id, extra_fields: extra_fields}).then(() => {
        this.setState({
          sendingEquipment: false
        });
      setTimeout(() => {
        this.props.updateEquipments();
        },1e2);
        this.props.createToastAlert({
          text: name + ' was added!',
	        options: {
		        type: toast.TYPE.SUCCESS,
		        position: toast.POSITION.BOTTOM_LEFT,
		        className: styles.toastSuccessAlert,
		        autoClose: 8000
	        }
        });
        this.clearNameError();
        this.clearEmailError();
        this.clearGroupError();
        this.hideEquipmentForm();
      }).catch((err) => {
        const responseText = JSON.parse(err.responseText);
	      const equipmentCreateError = {
		      text: getErrorMessage(responseText),
		      options: {
			      type: toast.TYPE.ERROR,
			      position: toast.POSITION.BOTTOM_LEFT,
			      className: styles.toastErrorAlert,
			      autoClose: 8000
		      }
	      };
	      this.props.createToastAlert(equipmentCreateError);
        this.setState({
          sendingEquipment: false
        });
      });
    }
  }

  render() {
    let showGroupDropdown = false;
    if (this.props.groups && (this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 1) {
      showGroupDropdown = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => { return group.is_implicit; })) && this.props.groups.length > 0) {
      showGroupDropdown = true;
    }
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"/></g></svg>,
      editIcon = <svg xmlns="http://www.w3.org/2000/svg" width="10" height="9.953" viewBox="0 0 10 9.953"><g transform="translate(-58.788 -59.359)"><g transform="translate(58.788 59.359)"><g transform="translate(0 0)"><path d="M220.982,59.853a1.677,1.677,0,0,0-1.389-.484,1.725,1.725,0,0,0-1.014.5l-.263.263L220.7,62.52l.261-.261a1.721,1.721,0,0,0,.507-1.08A1.682,1.682,0,0,0,220.982,59.853Z" transform="translate(-211.477 -59.359)" fill="#348af7"/><path d="M59.187,95.261l-.4,2.8,2.852-.352L67.546,91.8l-2.452-2.449Z" transform="translate(-58.788 -88.11)" fill="#348af7"/></g></g></g></svg>;

    return (
      <div>
        <Modal dialogClassName={styles.modalPrimary} show={this.props.showEquipmentForm} onHide={this.hideEquipmentForm} keyboard={false} backdrop={'static'}>
          <Modal.Header className={styles.modalHeader}>
            <Modal.Title className={styles.modalTitle}>{this.state.equipment.id ? 'Edit' : 'Add New'} Equipment</Modal.Title>
            <i className={styles.closeIcon} onClick={this.hideEquipmentForm}>{crossIcon}</i>
          </Modal.Header>
          <Modal.Body className={cx(styles.modalBody)}>
            <div className={cx(styles.columnWrapper)}>
              <div className={cx(styles.column, styles.columnImage)}>
                <div className={cx(styles.box)}>
                  <div className={cx(styles.boxBody)}>
                    <div className={cx(styles.boxBodyInner, ['text-center'])}>
                      <div className={styles['account-image']}>
                        <div className={cx(styles.image)}>
                          {this.props.equipmentImageLoader === true ? <SavingSpinner size={8} borderStyle="none" /> : <Image src={this.state.equipment.image_path || '/images/equipment.png'} />}
                        </div>
                        <div className={styles.icons}>
                          {(this.props.fields.id && this.props.equipmentImageLoader === false) &&
                          <div className={styles.edit} onClick={this.updateImageClick}>
                            <i>{editIcon}</i><span>Change Image</span>
                          </div>}
                          {(this.props.fields.image_path && this.props.equipmentImageLoader === false) &&
                          <div className={styles.delete} onClick={this.props.removeImage}>
                            <i className={styles.remove} /><span>Remove</span>
                          </div>
                          }
                        </div>
                        {!this.props.fields.id && <p>You will set image once equipment is added.</p>}
                        <input
                          accept="image/png, image/jpg, image/jpeg, image/svg, image/gif"
                          type="file"
                          ref="imageUploader"
                          onChange={this.props.handleImageChange} style={{ display: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className={cx(styles.column, styles.columnForm)}>
                <div className={cx(styles.box)}>
                  <div className={cx(styles.boxBody)}>
                    <div className={cx(styles.boxBodyInner)}>
                      <FormGroup>
                        <FormControl className={styles['form-input-control']} id="name" type="text" placeholder="Name" name="name" value={this.state.equipment.name} onChange={(e) => this.handleFieldChange(e) } />
                      </FormGroup>
                      {this.props.profile && (this.props.profile.permissions.includes('COMPANY') || this.props.profile.permissions.includes('ASSIGN_GROUPS')) && !this.state.equipment.is_default && showGroupDropdown &&
                        <FormGroup>
                          <div className={cx(styles.selectBox)}>
                            <FormControl onChange={(e) => this.handleGroupsChange(e)} className={cx(styles['form-input-control'])} id="groups" componentClass="select" name="groups">
                              {(this.state.equipment && this.state.equipment.group_id === '-1') && <option value={-1}>Select a Group</option>}
                              {this.renderGroups()}
                            </FormControl>
                          </div>
                        </FormGroup>
                      }
                      <FormGroup>
                        <FormControl className={styles['form-input-control']} id="type" type="text" placeholder="Type" name="type" value={this.state.equipment.type} onChange={(e) => this.handleFieldChange(e) } />
                      </FormGroup>
                      <FormGroup>
                        <FormControl componentClass="textarea" className={styles['form-input-control']} id="details" placeholder="Details (optional)" name="details" value={this.state.equipment.details} onChange={(e) => this.handleFieldChange(e) } />
                      </FormGroup>
                      <ExtraFields
                        className={styles.formRow}
                        fields={this.state.equipment.extra_fields}
                        onChange={this.onChangeExtraField}
                        fullWidth
                        can_edit
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              {!this.state.equipment.id ?
                <button onClick={(e) => this.createEquipment(e, showGroupDropdown)} className={cx(styles.btn, styles['btn-secondary'])}>
                  {this.state.sendingEquipment ? <SavingSpinner borderStyle="none" /> : 'Add'}
                </button>
              :
                <button onClick={(e) => this.updateEquipmentOnServer(e, showGroupDropdown)} className={cx(styles.btn, styles['btn-secondary'])}>
                  {this.state.sendingEquipment ? <SavingSpinner borderStyle="none" /> : 'Update'}
                </button>
              }
            </div>
            {this.state.equipment && <div className={styles.externalInfo}>
              {this.state.equipment.id && <div><strong>ID</strong> : {this.state.equipment.id}</div>}
              {this.state.equipment.external_id && <div><strong>External ID</strong> : {this.state.equipment.external_id}</div>}
            </div>}
            <div className={styles.errorAlertsContainer}>
              {this.state.nameError !== null &&
              <Alert bsStyle={this.state.nameError.bsStyle}>{this.state.nameError.content}</Alert>
              }
              {this.state.equipmentCreateError !== null &&
                <Alert bsStyle={this.state.equipmentCreateError.bsStyle}>{this.state.equipmentCreateError.content}</Alert>
              }
              {this.state.editFormError !== null &&
                <Alert bsStyle={this.state.editFormError.bsStyle}>{this.state.editFormError.content}</Alert>
              }
              {this.state.permissionError !== null &&
                <Alert bsStyle={this.state.permissionError.bsStyle}>{this.state.permissionError.content}</Alert>
              }
              {this.state.groupError !== null &&
                <Alert bsStyle={this.state.groupError.bsStyle}>{this.state.groupError.content}</Alert>
              }
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}


EquipmentFormV2.propTypes = {
  showEquipmentForm: PropTypes.bool,
  createEquipment: PropTypes.func,
  onChangeExtraField: PropTypes.func,
  fields: PropTypes.object,
  handleImageChange: PropTypes.func,
  removeImage: PropTypes.func,
  hideModal: PropTypes.func,
  permissionGroups: PropTypes.array,
  updateEquipments: PropTypes.func,
  convertFieldsForStorage: PropTypes.func,
  profile: PropTypes.object,
  groups: PropTypes.object
};
