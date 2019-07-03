import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from './entity-form.module.scss';
import {
  Row,
  Col,
  Alert,
  FormControl,
  Modal,
  FormGroup,
  Button,
  Image,
  Checkbox,
  OverlayTrigger, Tooltip,
  Popover
} from 'react-bootstrap';
import SavingSpinner from '../saving-spinner/saving-spinner';
import ExtraFields from '../task-wrapper-v2/components/instructions/extra-fields/extra-fields';
import {ColorField} from '../fields';
import SwitchButton from '../../helpers/switch_button';
import cx from 'classnames';
import {getErrorMessage} from '../../helpers/task';
import update from 'immutability-helper';
import {toast} from 'react-toastify';
import Phone from 'react-phone-number-input';
import {resendInvitation} from '../../actions';
import {entityPasswordReset, changePassword} from '../../actions';
import moment from 'moment';
import CopyToClipboard from 'react-copy-html-to-clipboard';
import {findDOMNode} from "react-dom";

const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756"
                           viewBox="0 0 11.758 11.756">
        <g transform="translate(-1270.486 -30.485)">
          <path
            d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
            transform="translate(4126.197 -40.804)" fill="#8d959f"/>
        </g>
      </svg>,
      editIcon = <svg xmlns="http://www.w3.org/2000/svg" width="10" height="9.953" viewBox="0 0 10 9.953">
        <g transform="translate(-58.788 -59.359)">
          <g transform="translate(58.788 59.359)">
            <g transform="translate(0 0)">
              <path
                d="M220.982,59.853a1.677,1.677,0,0,0-1.389-.484,1.725,1.725,0,0,0-1.014.5l-.263.263L220.7,62.52l.261-.261a1.721,1.721,0,0,0,.507-1.08A1.682,1.682,0,0,0,220.982,59.853Z"
                transform="translate(-211.477 -59.359)" fill="#348af7"/>
              <path d="M59.187,95.261l-.4,2.8,2.852-.352L67.546,91.8l-2.452-2.449Z"
                    transform="translate(-58.788 -88.11)" fill="#348af7"/>
            </g>
          </g>
        </g>
      </svg>;

export default class EntityForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sendingEntity: false,
      alerts: [],
      entity: {
        name: '',
        type: '',
        email: '',
        phone: '',
        details: '',
        color: '',
        can_turnoff_location: false,
        permission: '',
        group_id: '-1',
        invite_email: false,
        invite_sms: false,
        invite_status: 'PENDING'
      },
      nameError: null,
      emailError: null,
      entityCreateError: null,
      permissionError: null,
      showEntityForm: false,
      editFormError: null,
      groupError: null,
      selectedGroup: {
        title: null,
        description: null
      },
      optionSelected: '2',
    };
    this.onSwitchChange = this.onSwitchChange.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.createEntity = this.createEntity.bind(this);
    this.clearNameError = this.clearNameError.bind(this);
    this.clearEmailError = this.clearEmailError.bind(this);
    this.clearGroupError = this.clearGroupError.bind(this);
    this.initializeDefaultValues = this.initializeDefaultValues.bind(this);
    this.hideEntityForm = this.hideEntityForm.bind(this);
    this.renderPermissionsGroup = this.renderPermissionsGroup.bind(this);
    this.handlePermissionsChange = this.handlePermissionsChange.bind(this);
    this.onChangeExtraField = this.onChangeExtraField.bind(this);
    this.updateEntityOnServer = this.updateEntityOnServer.bind(this);
    this.hideAlerts = this.hideAlerts.bind(this);
    this.renderGroups = this.renderGroups.bind(this);
    this.handleGroupsChange = this.handleGroupsChange.bind(this);
    this.onChangeEntityState = this.onChangeEntityState.bind(this);
    this.onChangePrimaryPhone = this.onChangePrimaryPhone.bind(this);
    this.resendInvitation = this.resendInvitation.bind(this);
    this.sendPasswordLink = this.sendPasswordLink.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.initializeDefaultValues();
  }

  componentWillReceiveProps(nextProps) {
    if (typeof nextProps.fields.id !== 'undefined' && !this.state.showEntityForm) {
      const entity = $.extend(true, {}, nextProps.fields);
      let selectedGroup = {
        title: null,
        description: null
      };
      if (entity.permission_groups) {
        const designatedPermissionGroupIndex = entity.permission_groups.findIndex((el) => {
          return el.status === true;
        });
        if (designatedPermissionGroupIndex !== -1) {
          selectedGroup = entity.permission_groups[designatedPermissionGroupIndex];
        }
      }
      if (this.props.groups && !this.props.groups.find(group => {
        return (group.id === entity.group_id || (group.is_implicit && entity.group_id === null));
      })) {
        entity.group_id = '-1';
      }
      this.setState({
        entity,
        selectedGroup,
        showEntityForm: true
      });
    } else if (typeof nextProps.fields.id !== 'undefined' && nextProps.fields.image_id !== this.state.entity.image_id) {
      this.setState({
        entity: $.extend(true, {}, nextProps.fields)
      });
    }
  }

  sendPasswordLink(e) {
    e.preventDefault();
    e.stopPropagation();
    this.refs['popover_modal'].hide();
    let email, phone = null;
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    email = this.props.user_name;

    if(!emailRegex.test(email)){
      phone = email;
      email = null;
    }

    if (this.state.optionSelected === '1') {
      this.setState({sendingInvite: true});
      entityPasswordReset({email: email, phone: phone}).then((res) => {
        this.props.entityCreateSuccess({
          text: 'Password reset link sent successfully!',
          options: {
            type: toast.TYPE.SUCCESS,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastSuccessAlert,
            autoClose: 8000
          }
        });
        this.setState({sendingInvite: false});
      }).catch((err) => {
        console.log(err);
        this.setState({
          sendingInvite: false
        });
      })
    }else if(this.state.optionSelected === '2') {
      let username = email ? email : phone ? phone : null;
      const password = findDOMNode(this.inputPassword).value.trim();
      this.setState({sendingInvite: true});
      changePassword({username: username, password: password, confirm_password: password  }).then((res) => {
        this.props.entityCreateSuccess({
          text: 'Password changed successfully!',
          options: {
            type: toast.TYPE.SUCCESS,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastSuccessAlert,
            autoClose: 8000
          }
        });
        this.setState({sendingInvite: false});
      }).catch((err) => {
        console.log(err);
        this.setState({
          sendingInvite: false
        });
      })
    }
  }


  updateEntityOnServer(e, hasGroups) {
    e.preventDefault();
    e.stopPropagation();
    const updatedEntity = jQuery.extend(true, {}, this.state.entity);
    updatedEntity.extra_fields = JSON.stringify(this.props.convertFieldsForStorage(updatedEntity.extra_fields));
    if (updatedEntity.permission && updatedEntity.permission !== null) {
      updatedEntity.permission = updatedEntity.permission.replace(/\s/g, '');
    } else {
      const permissionGroup = updatedEntity.permission_groups.find((el) => {
        return el.status === true;
      });
      if (permissionGroup) {
        updatedEntity.permission = permissionGroup.title.toUpperCase().replace(/\s/g, '');
      }
    }

    if (updatedEntity.name === '' || updatedEntity.name === null) {
      const nameError = {
        text: 'Name is required. Please enter a name for the team member.',
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

    const entityPermissionsIndex = updatedEntity.permission_groups.findIndex((el) => {
      return el.status === true;
    });

    if (!this.state.entity.is_default && entityPermissionsIndex === -1 && (typeof updatedEntity.permission === 'undefined' || updatedEntity.permission === '' || updatedEntity.permission === null || updatedEntity.permission === 'Selectentitypermissions')) {
      const permissionError = {
        text: 'Team member Permissions are required. Please select permissions for member.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(permissionError);
      return;
    }

    if (!this.state.entity.is_default && this.state.entity.group_id === '-1' && hasGroups) {
      const groupError = {
        text: 'Group is required. Please select a group for team member.',
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

    updatedEntity.group_id = (this.state.entity.group_id === '-1' && !hasGroups) ? '' : this.state.entity.group_id;
    updatedEntity.notifications = updatedEntity.notifications ? JSON.stringify(updatedEntity.notifications) : null;

    this.setState({
      sendingEntity: true
    });

    this.props.updateEntity(updatedEntity).then(() => {
      this.setState({
        sendingEntity: false
      });
      this.props.entityCreateSuccess({
        text: updatedEntity.name + ' was updated!',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      });
      this.clearNameError();
      this.clearEmailError();
      this.hideEntityForm();
    }).catch((err) => {
      this.setState({sendingEntity: false});
      const responseText = JSON.parse(err.responseText);
      const entityUpdateError = {
        text: getErrorMessage(responseText),
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(entityUpdateError);
    });
  }

  resendInvitation() {
    if (this.state.entity && this.state.entity.id) {
      this.setState({
        sendingInvite: true
      });
      resendInvitation(this.state.entity.id).then(() => {
        this.props.entityCreateSuccess({
          text: 'Invitation resend successfully!',
          options: {
            type: toast.TYPE.SUCCESS,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastSuccessAlert,
            autoClose: 8000
          }
        });
        this.setState({
          sendingInvite: false
        });
      }).catch(() => {
        this.setState({
          sendingInvite: false
        });
      })
    }
  }

  hideAlerts() {
    this.setState({
      emailError: null,
      nameError: null,
      entityCreateError: null,
      permissionError: null,
      editFormError: null
    });
  }

  hideEntityForm() {
    this.setState({
      showEntityForm: false
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

  handleChange(e) {
    this.setState({
      optionSelected : e.target.value,
    })
  }

  handleFieldChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const entity = this.state.entity;
    entity[e.target.name] = e.target.value;
    this.setState({
      entity
    });
  }

  onChangePrimaryPhone(value) {
    const entity = this.state.entity;
    entity.phone = value;
    this.setState({entity});
  }

  onColorChange(hex) {
    const entity = this.state.entity;
    entity.color = hex;
    this.setState({
      entity
    });
  }

  onSwitchChange() {
    const entity = this.state.entity;
    entity.can_turnoff_location = !entity.can_turnoff_location;
    this.setState({
      entity
    });
  }

  handlePermissionsChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const entity = this.state.entity;
    entity.permission = e.target.value;
    const permissionGroupIndex = this.props.permissionGroups.findIndex((perm) => {
      return perm.title.toUpperCase() === e.target.value;
    });
    this.setState({
      entity,
      selectedGroup: this.props.permissionGroups[permissionGroupIndex]
    });
  }

  handleGroupsChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const entity = this.state.entity;
    entity.group_id = e.target.value;
    this.setState({
      entity,
    });
  }

  onChangeEntityState(key, e) {
    const entity = this.state.entity;
    if (key === 'invite_email' || key === 'invite_sms') {
      const notifications = this.state.entity.notifications || {};
      if (key === 'invite_email') {
        notifications['email'] = e.target.checked;
      }
      if (key === 'invite_sms') {
        notifications['sms'] = e.target.checked;
      }
      entity['notifications'] = notifications;
    }
    entity[key] = e.target.checked;
    this.setState({entity});
  }

  initializeDefaultValues() {
    const entity = {
      name: '',
      type: '',
      email: '',
      phone: '',
      details: '',
      color: '',
      can_turnoff_location: false,
      permission: '',
      group_id: '-1',
      invite_status: 'PENDING',
      invite_email: false,
      invite_sms: false,
      notifications:{
        'sms': true,
        'email': true
      }
    };
    this.setState({
      entity,
      selectedGroup: {
        title: null,
        description: null
      }
    });
  }

  renderPermissionsGroup() {
    const renderedPermissionsGroup = this.props.permissionGroups.map((permissions) => {
      if (this.props.profile && this.props.profile.group_id && permissions.title.toUpperCase() === 'ADMIN') {
        return;
      }
      return (
        <option value={permissions.title.toUpperCase()}>{permissions.title.toUpperCase()}</option>
      );
    });
    return renderedPermissionsGroup;
  }

  renderGroups() {
    let disableGroupClass = '';
    const renderedGroups = this.props.groups && this.props.groups.map((group) => {
      if (group.is_disabled && group.id === this.state.entity.group_id) {
        disableGroupClass = styles.disableGroup;
      } else {
        disableGroupClass = '';
      }
      if (group.is_disabled && group.id !== this.state.entity.group_id) {
        return null;
      }
      return (
        <option disabled={disableGroupClass} value={group.is_implicit ? '' : group.id}
                selected={this.state.entity.group_id ? (group.id === this.state.entity.group_id) : group.is_implicit}
                className={disableGroupClass}>{group.name}</option>
      );
    });
    return renderedGroups;
  }

  updateImageClick() {
    this.refs.imageUploader.click();
  }

  onChangeExtraField(fields) {
    this.setState({
      entity: update(this.state.entity, {
        extra_fields: {$set: fields}
      })
    });
  }


  createEntity(e, hasGroups) {
    e.preventDefault();
    e.stopPropagation();

    const name = this.state.entity.name ? this.state.entity.name.trim() : '';
    const type = this.state.entity.type ? this.state.entity.type.trim() : '';
    const email = this.state.entity.email ? this.state.entity.email.trim() : '';
    const phone = this.state.entity.phone ? this.state.entity.phone.trim() : '';
    const details = this.state.entity.details ? this.state.entity.details.trim() : '';
    const color = this.state.entity.color ? this.state.entity.color : '';
    let group_id = this.state.entity.group_id ? this.state.entity.group_id : null;
    const can_turnoff_location = this.state.entity.can_turnoff_location ? this.state.entity.can_turnoff_location : false;
    let permission = this.state.entity.permission ? this.state.entity.permission : '';
    const notifications = this.state.entity.notifications ? JSON.stringify(this.state.entity.notifications) : JSON.stringify({'sms': true, 'email' : true});
    if (this.props.profile
      && (!this.props.profile.permissions.includes('COMPANY') && !this.props.profile.permissions.includes('ASSIGN_GROUPS'))
      && (this.props.profile.group_id || this.props.profile.group_id === null)) {
      group_id = this.props.profile.group_id;
    }

    if (!hasGroups) {
      group_id = '';
    }
    if (permission && permission !== null && permission !== '') {
      permission = permission.replace(/\s/g, '');
    }

    if (name === '' || name === null) {
      const nameError = {
        text: 'Name is required. Please enter a name for the team member.',
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
        text: 'Group is required. Please select a group for team member.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(groupError);
      return;
    } else if (permission === '' || permission === null) {
      const permissionError = {
        text: 'Team member Permissions are required. Please select permissions for member.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(permissionError);
      return;
    } else {
      this.setState({
        sendingEntity: true
      });
      this.props.createEntity({
        name,
        type,
        email,
        phone,
        details,
        color,
        can_turnoff_location,
        permission,
        group_id,
        notifications
      }).then(() => {
        this.setState({
          sendingEntity: false
        });
        this.props.entityCreateSuccess({
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
        this.hideEntityForm();
      }).catch((err) => {
        const responseText = JSON.parse(err.responseText);
        const entityCreateError = {
          text: getErrorMessage(responseText),
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(entityCreateError);
        this.setState({
          sendingEntity: false
        });
      });
    }
  }

  onEnteredOverlay() {
    const inputGroupDomNode = findDOMNode(this.inputPassword);

    if (inputGroupDomNode) {
      inputGroupDomNode.focus();
    }
  }

  resetPasswordPopover() {
    return (
      <Popover id={'popover-login'} className={cx(styles['popover-share'], styles.box)}>
        <h3 className={styles.boxTitle}>Change password by:
        <i className={styles.closeIcon} onClick={() => this.refs['popover_modal'].hide()}>{crossIcon}</i>
        </h3>
        <div className={styles.boxBody}>
          <div className={styles.boxBodyInner}>
            <div className={styles.resetAndChangeButtons}>
              <form onSubmit={(e) => this.sendPasswordLink(e)}>
                <FormGroup>
                  <div className={styles.selectBox}>
                    <FormControl onChange={(e) => this.handleChange(e)} value={this.state.optionSelected}
                                 componentClass="select">
                      <option value={'1'}>Send password link</option>
                      <option value={'2'}>Set password to</option>
                    </FormControl>
                  </div>
                </FormGroup>
                {this.state.optionSelected === '2' && <FormGroup>
                  <FormControl id={'3'} type='password' autoFocus placeholder='Password' ref={(input) => this.inputPassword = input}/>
                </FormGroup>}
                <button type='submit' className={cx(styles.btn, styles['btn-primary-outline'])}>
                  {this.state.sendingInvite ? <SavingSpinner borderStyle="none"/> : "Reset Password"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </Popover>);
    };


  render() {
    let showDefaultOption = false;
    let defaultValue = this.state.entity.permission;
    if (typeof this.state.entity.permission_groups !== 'undefined') {
      const permissionsGroupIndex = this.state.entity.permission_groups.findIndex((el) => {
        return el.status === true;
      });
      if (permissionsGroupIndex !== -1) {
        showDefaultOption = false;
        defaultValue = this.state.entity.permission_groups[permissionsGroupIndex].title.toUpperCase();
      } else {
        showDefaultOption = true;
      }
    } else {
      showDefaultOption = true;
    }
    let showGroupDropdown = false;
    if (this.props.groups && (this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 1) {
      showGroupDropdown = true;
    } else if (this.props.groups && !(this.props.groups.find((group) => {
      return group.is_implicit;
    })) && this.props.groups.length > 0) {
      showGroupDropdown = true;
    }

    const inviteLinkTooltip = (
      <Tooltip id="tooltip">Click to Copy!</Tooltip>
    );


    return (
      <div>
        <Modal dialogClassName={styles.createMemberModal} show={this.props.showEntityForm} onHide={this.hideEntityForm}
               keyboard={false} backdrop={'static'}>
          <Modal.Header className={styles.entityEditModalHeader}>
            <Modal.Title className={cx(styles.modalTitle)}>
              {this.state.entity.id ? 'Edit' : 'Add New'} Team Member
              <i className={styles.closeIcon} onClick={this.hideEntityForm}>{crossIcon}</i>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className={cx(styles.modalBody)}>
            <div className={cx(styles.columnWrapper)}>
              <div className={cx(styles.column, styles.columnImage)}>
                <div className={cx(styles.box)}>
                  <div className={cx(styles.boxBody)}>
                    <div className={cx(styles.boxBodyInner, ['text-center'])}>
                      <div className={styles['account-image']}>
                        <div className={cx(styles.image)}>
                          {(this.props.entityImageLoader === true) ?
                            (<SavingSpinner size={8} borderStyle="none"/>) : (
                              <Image src={this.state.entity.image_path || '/images/user-default.svg'}/>)}
                        </div>
                        <div className={styles.icons}>
                          {(this.props.fields.id && this.props.entityImageLoader === false) &&
                          <div className={styles.edit} onClick={this.updateImageClick}>
                            <i>{editIcon}</i><span>Change Image</span>
                          </div>}
                          {(this.props.fields.image_path && this.props.entityImageLoader === false) &&
                          <div className={styles.delete} onClick={this.props.removeImage}>
                            <i className={styles.remove}/><span>Remove</span>
                          </div>
                          }
                        </div>
                        {!this.props.fields.id && <p>You will set image once team member is added.</p>}
                        <input
                          accept="image/png, image/jpg, image/jpeg, image/svg, image/gif"
                          type="file"
                          ref="imageUploader"
                          onChange={this.props.handleImageChange} style={{display: 'none'}}
                        />
                      </div>
                      {this.state.entity.id && !this.state.entity.is_default &&
                      <div>
                        {this.state.entity.invite_status && this.state.entity.invite_status.toUpperCase() !== 'ACCEPTED' && (this.state.entity.email_invitation || this.state.entity.sms_invitation) &&
                        <div>
                          <ul className={cx(styles.invitationInfo)}>
                            {this.state.entity.email_invitation && this.state.entity.email_invitation.notification_datetime &&
                            <li>Invited via email:</li>}
                            {this.state.entity.email_invitation && this.state.entity.email_invitation.notification_datetime &&
                            <li>{moment.utc(this.state.entity.email_invitation.notification_datetime).local().format('D MMM YYYY, hh:mm A')}</li>}
                            {this.state.entity.sms_invitation && this.state.entity.sms_invitation.notification_datetime &&
                            <li>Invited via SMS:</li>}
                            {this.state.entity.sms_invitation && this.state.entity.sms_invitation.notification_datetime &&
                            <li>{moment.utc(this.state.entity.sms_invitation.notification_datetime).local().format('D MMM YYYY, hh:mm A')}</li>}
                          </ul>
                          <div className={cx(styles.invitationStatus, styles.pending)}>Invitation Pending</div>
                          <button className={cx(styles.btn, styles['btn-light'])}
                                  onClick={this.resendInvitation}>{this.state.sendingInvite ?
                            <SavingSpinner borderStyle="none"/> : "Resend Invitation"}</button>
                        </div>
                        }
                        {this.state.entity.invite_status && this.state.entity.invite_status.toUpperCase() === 'ACCEPTED' && this.state.entity.joined_datetime &&
                        <div>
                          <ul className={cx(styles.invitationInfo)}>
                            <li>Member since:</li>
                            <li>{moment.utc(this.state.entity.joined_datetime).local().format('D MMM YYYY')}</li>
                          </ul>
                        </div>
                        }
                      </div>
                      }

                    </div>
                  </div>
                </div>
              </div>
              <div className={cx(styles.column, styles.columnForm)}>
                <div className={cx(styles.box)}>
                  <div className={cx(styles.boxBody)}>
                    <div className={cx(styles.boxBodyInner)}>
                      <FormGroup className={cx(styles.colorFieldWrapper)}>
                        <FormControl id="name" type="text" placeholder="Name" name="name"
                                     onChange={(e) => this.handleFieldChange(e)} value={this.state.entity.name}/>
                        <div className={styles['entityColorWrapper']}>
                          <FormControl
                            componentClass={ColorField}
                            value={this.state.entity.color}
                            onChange={this.onColorChange}
                            ref="color"
                          />
                        </div>
                      </FormGroup>
                      {this.props.profile && (this.props.profile.permissions.includes('COMPANY') || this.props.profile.permissions.includes('ASSIGN_GROUPS')) && !this.state.entity.is_default && showGroupDropdown &&
                      <FormGroup>
                        <div className={cx(styles.selectBox)}>
                          <FormControl onChange={(e) => this.handleGroupsChange(e)} id="groups" componentClass="select"
                                       name="groups">
                            {(this.state.entity && this.state.entity.group_id === '-1') &&
                            <option value={-1}>Select a Group</option>}
                            {this.renderGroups()}
                          </FormControl>
                        </div>
                      </FormGroup>
                      }
                      <FormGroup>
                        <FormControl id="type" type="text" placeholder="Position" name="type"
                                     value={this.state.entity.type} onChange={(e) => this.handleFieldChange(e)}/>
                      </FormGroup>
                      <Row className={cx(styles.formRow)}>
                        <Col md={6} sm={6}>
                          <FormGroup>
                            <FormControl id="email" type="text" placeholder="Email" name="email"
                                         value={this.state.entity.email} onChange={(e) => this.handleFieldChange(e)}/>
                          </FormGroup>
                        </Col>
                        <Col md={6} sm={6}>
                          <FormGroup>
                            <FormControl
                              id="phone"
                              componentClass={Phone}
                              country="US"
                              className={cx(styles['input-phone'])}
                              ref="mobile_number"
                              type="tel" placeholder="Phone" name="phone" value={this.state.entity.phone}
                              onChange={(phone) => {
                                this.onChangePrimaryPhone(phone);
                              }}
                            />
                          </FormGroup>
                        </Col>
                        <Col md={12} sm={12}>
                          {typeof this.state.entity.id === 'undefined' &&
                          <p className={cx(styles.infoText)}>*Arrivy will send an invitation to this email address and
                            phone to join your company and get access to assigned tasks and enable progress
                            reporting.</p>}
                        </Col>
                        {!this.state.entity.is_default &&
                        <FormGroup className="clearfix">
                          <Col md={6} sm={6}>
                            <div className={cx(styles.selectBox)}>
                              <FormControl onChange={(e) => this.handlePermissionsChange(e)} id="permissions"
                                           componentClass="select" defaultValue={defaultValue} name="permissions">
                                {showDefaultOption && <option value="">Select team member role</option>}
                                {this.renderPermissionsGroup()}
                              </FormControl>
                            </div>
                          </Col>
                          <Col md={6} sm={6}>
                            <p
                              className={cx(styles.infoText)}>{this.state.selectedGroup && this.state.selectedGroup.description && this.state.selectedGroup.description}</p>
                          </Col>
                        </FormGroup>
                        }
                      </Row>
                      <FormGroup>
                        <FormControl componentClass="textarea" id="details" placeholder="Details (optional)"
                                     name="details" value={this.state.entity.details}
                                     onChange={(e) => this.handleFieldChange(e)}/>
                      </FormGroup>
                      <FormGroup className={cx(styles.switch)}>
                        <SwitchButton onChange={() => this.onSwitchChange()} name="can_turnoff_location"
                                      labelRight="Can turn off location service"
                                      checked={this.state.entity.can_turnoff_location}/>
                      </FormGroup>
                      {this.state.entity.id &&
                      <ExtraFields
                        className={styles.formRow}
                        fields={this.state.entity.extra_fields}
                        onChange={this.onChangeExtraField}
                        fullWidth
                        can_edit
                      />
                      }
                      <FormGroup>
                        {!this.state.entity.is_default && this.state.entity.invite_status && this.state.entity.invite_status.toUpperCase() !== 'ACCEPTED' &&
                        <span>
                            <Checkbox
                              className={cx(styles.checkBox)}
                              checked={!this.state.entity.notifications || !(this.state.entity.notifications.email === false)}
                              onChange={(e) => {
                                this.onChangeEntityState('invite_email', e)
                              }}>
                              <span>Invite via Email</span>
                            </Checkbox>
                            <Checkbox
                              className={cx(styles.checkBox)}
                              checked={!this.state.entity.notifications || !(this.state.entity.notifications.sms === false)}
                              onChange={(e) => {
                                this.onChangeEntityState('invite_sms', e)
                              }}>
                              <span>Invite via SMS</span>
                            </Checkbox>
                          </span>
                        }
                        {this.state.entity.id && !this.state.entity.is_default && this.state.entity.invite_status && this.state.entity.invite_status.toUpperCase() !== 'ACCEPTED' && (this.state.entity.email_invitation || this.state.entity.sms_invitation) &&
                        <CopyToClipboard
                          text={(this.state.entity.email_invitation && this.state.entity.email_invitation.invite_link) || (this.state.entity.sms_invitation && this.state.entity.sms_invitation.invite_link)}
                          onCopy={() => this.setState({copied: true})}><OverlayTrigger placement="top"
                                                                                       overlay={inviteLinkTooltip}><a
                          href="javascript:void(0)">Get Invitation link</a></OverlayTrigger></CopyToClipboard>
                        }
                      </FormGroup>

                    </div>
                  </div>
                </div>
                {this.state.entity.id && this.state.entity.invite_status && this.state.entity.invite_status.toUpperCase() === 'ACCEPTED' && this.state.entity.joined_datetime && this.props.user_name && <div className={cx(styles.box)}>
                  <h3 className={styles.boxTitle}>Login</h3>
                  <div className={cx(styles.boxBody)}>
                    <div className={cx(styles.boxBodyInner, styles.loginInfo)}>
                      <ul>
                        <li><strong>Username</strong> (set by user):</li>
                        <li>{this.props.user_name}</li>
                      </ul>
                      {this.props.profile.permissions && (this.props.profile.permissions.includes('COMPANY') || this.props.profile.permissions.includes('RESET_PASSWORD')) &&
                      <div ref='popover' className={styles.resetAndChangeButtons}>
                       <OverlayTrigger ref='popover_modal' id='popover-login' onEntered={() => this.onEnteredOverlay()} container={this.refs.popover} trigger="click" placement="top" overlay={this.resetPasswordPopover()} rootClose>
                         <button  className={cx(styles.btn, styles['btn-primary-outline'])} onClick={() => this.forceUpdate()}>Reset Password</button>
                       </OverlayTrigger>
                      </div>}
                    </div>
                  </div>
                </div>}
              </div>
            </div>
            <div className="text-right">
              {!this.state.entity.id ?
                <button onClick={(e) => this.createEntity(e, showGroupDropdown)}
                        className={cx(styles.btn, styles['btn-secondary'])} disabled={this.state.sendingEntity}>
                  {this.state.sendingEntity ? <SavingSpinner borderStyle="none"/> : 'Add'}
                </button>
                :
                <button onClick={(e) => this.updateEntityOnServer(e, showGroupDropdown)}
                        className={cx(styles.btn, styles['btn-secondary'])} disabled={this.state.sendingEntity}>
                  {this.state.sendingEntity ? <SavingSpinner borderStyle="none"/> : 'Update'}
                </button>
              }
            </div>
            {this.state.entity && <div className={styles.externalInfo}>
              {this.state.entity.id && <div><strong>ID</strong> : {this.state.entity.id}</div>}
              {this.state.entity.external_id &&
              <div><strong>External ID</strong> : {this.state.entity.external_id}</div>}
            </div>}
            <div className={styles.errorAlertsContainer}>
              {this.state.nameError !== null &&
              <Alert bsStyle={this.state.nameError.bsStyle}>{this.state.nameError.content}</Alert>
              }
              {this.state.emailError !== null &&
              <Alert bsStyle={this.state.emailError.bsStyle}>{this.state.emailError.content}</Alert>
              }
              {this.state.entityCreateError !== null &&
              <Alert bsStyle={this.state.entityCreateError.bsStyle}>{this.state.entityCreateError.content}</Alert>
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

EntityForm.propTypes = {
  showEntityForm: PropTypes.bool,
  createEntity: PropTypes.func,
  onChangeExtraField: PropTypes.func,
  fields: PropTypes.object,
  handleImageChange: PropTypes.func,
  removeImage: PropTypes.func,
  hideModal: PropTypes.func,
  permissionGroups: PropTypes.array,
  entityCreateSuccess: PropTypes.func,
  updateEntity: PropTypes.func,
  convertFieldsForStorage: PropTypes.func,
  profile: PropTypes.object,
  groups: PropTypes.object
};
