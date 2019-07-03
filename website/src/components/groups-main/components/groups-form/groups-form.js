import React, { Component } from 'react';
import styles from './groups-form.module.scss';
import { Grid, Row, Col, Modal, FormControl, Alert, FormGroup, HelpBlock, Image, Checkbox } from 'react-bootstrap';
import cx from 'classnames';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import $ from 'jquery';
import Autocomplete from 'react-google-autocomplete';
import { getErrorMessage } from '../../../../helpers/task';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPencilAlt, faTimesCircle } from '@fortawesome/fontawesome-free-solid';
import Phone from 'react-phone-number-input';
import Select from 'react-select';
import moment from 'moment-timezone';
import { getTimezoneOptions } from '../../../../helpers';
import { toast } from 'react-toastify';

export default class GroupsForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      group: {
        'is_default' : false,
        'image_id' : null,
        'extra_fields' : null,
        'address_line_2' : null,
        'description' : null,
        'address_line_1' : null,
        'emergency' : null,
        'phone' : null,
        'email' : null,
        'zipcode' : null,
        'country' : null,
        'name' : null,
        'city' : null,
        'url_safe_id' : null,
        'image_path' : null,
        'mobile_number' : null,
        'state' : null,
        'exact_location' : null,
        'complete_address': null,
        'timezone' : null
      },
      serverActionIsPending: false,
      emailFieldError: false,
      nameFieldError: false,
      errorMessage: null,
      errorAlert: false,
      alertMessage: null,
      imageEditable: true,
      imageRemovable: true,
      loadingImage: false,
      editingGroup: false,
      timezonesOptions: []
    };

    this.closeModal = this.closeModal.bind(this);
    this.updateGroupState = this.updateGroupState.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.saveGroup = this.saveGroup.bind(this);
    this.updateGroup = this.updateGroup.bind(this);
    this.addressSelected = this.addressSelected.bind(this);
    this.createCompleteAddress = this.createCompleteAddress.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.handleImageChange = this.handleImageChange.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.useCompanyIcon = this.useCompanyIcon.bind(this);
    this.handlePhoneChange = this.handlePhoneChange.bind(this);
    this.handleGroupTimezoneChange = this.handleGroupTimezoneChange.bind(this);
    this.populateTimezonesOptions = this.populateTimezonesOptions.bind(this);

  }

  componentWillReceiveProps(nextProps) {
    this.updateGroupState(nextProps);
    this.populateTimezonesOptions();
  }

  populateTimezonesOptions() {
    const timezones = getTimezoneOptions();
    const timezonesOptions = [];
    timezones.map((timezone) => {
      timezonesOptions.push(timezone);
    });
    this.setState({
      timezonesOptions
    })
  }

  handleGroupTimezoneChange(timezone) {
    const group = $.extend(true, {}, this.state.group);
    group.timezone = timezone.value;
    this.setState({
      group
    });
  }

  saveGroup() {
    this.setState({
      serverActionIsPending: true
    });
    const group = $.extend(true, {}, this.state.group);
    if (typeof group.name === 'undefined' || group.name === null || group.name === '' || !group.timezone) {
      let errorMessage = null;
      if (!group.name && !group.timezone) {
        errorMessage = 'Group name and timezone are required.';
      } else if (group.name && !group.timezone) {
        errorMessage = 'Group timezone is required.';
      } else {
        errorMessage = 'Group name is required.';
      }
      this.props.createToastAlert({
				text: errorMessage,
	      options: {
		      type: toast.TYPE.ERROR,
		      position: toast.POSITION.BOTTOM_LEFT,
		      className: styles.toastErrorAlert,
		      autoClose: 8000
	      }
      });
      this.setState({
        serverActionIsPending: false
      });
      return;
    }
    // if (typeof group.email === 'undefined' || group.email === null || group.email === '') {
    //   this.setState({
    //     emailFieldError: true,
    //     errorMessage: 'A valid email address is required.',
    //     serverActionIsPending: false
    //   });
    //   return;
    // }
    group.exact_location = JSON.stringify(group.exact_location);
    this.props.createGroup(group).then((res) => {
	    const alert = {
		    text: 'Group created successfully',
		    options: {
			    type: toast.TYPE.SUCCESS,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastSuccessAlert,
			    autoClose: 8000
		    }
	    };
	    this.setState({
		    serverActionIsPending: false
	    }, () => {
		    this.closeModal();
		    this.props.createToastAlert(alert);
	    });
    }).catch((err) => {
      const error = getErrorMessage(JSON.parse(err.responseText));
	    const alert = {
		    text: error,
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(alert);
      this.setState({
        serverActionIsPending: false
      });
    });
  }

  updateGroup() {
    this.setState({
      serverActionIsPending: true
    });
    const group = $.extend(true, {}, this.state.group);
    if (typeof group.name === 'undefined' || group.name === null || group.name === '' || !group.timezone) {
      let errorMessage = null;
      if (!group.name && !group.timezone) {
        errorMessage = 'Group name and timezone are required.';
      } else if (group.name && !group.timezone) {
        errorMessage = 'Group timezone is required.';
      } else {
        errorMessage = 'Group name is required.';
      }
	    this.props.createToastAlert({
		    text: errorMessage,
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    });
      this.setState({
        serverActionIsPending: false
      });
      return;
    }
    // if (typeof group.email === 'undefined' || group.email === null || group.email === '') {
    //   this.setState({
    //     emailFieldError: true,
    //     errorMessage: 'A valid email address is required.',
    //     serverActionIsPending: false
    //   });
    //   return;
    // }
    group.exact_location = JSON.stringify(group.exact_location);
    this.props.updateGroup(group.id, group).then((res) => {
      const alert = {
	      text: 'Group updated successfully',
	      options: {
		      type: toast.TYPE.SUCCESS,
		      position: toast.POSITION.BOTTOM_LEFT,
		      className: styles.toastSuccessAlert,
		      autoClose: 8000
	      }
      };
      this.setState({
        serverActionIsPending: false
      }, () => {
        this.closeModal();
        this.props.createToastAlert(alert);
      });
    }).catch((err) => {
      const error = getErrorMessage(JSON.parse(err.responseText));
	    const alert = {
		    text: error,
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(alert);
      this.setState({
        serverActionIsPending: false,
      });
    })
  }

  useCompanyIcon(e) {
    const checkedStatus = e.target.checked;
    const profile = $.extend(true, {}, this.props.profile);
    const { image_path, image_id } = profile;
    const group = $.extend(true, {}, this.state.group);
    if (checkedStatus) {
      group.image_id = image_id;
      group.image_path = image_path;
      this.setState({
        group
      });
    } else {
      group.image_id = null;
      group.image_path = null;
      this.setState({
        group
      });
    }
  }

  updateImageClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.refs.imageUploader.click();
  }

  removeImage(e) {
    e.preventDefault();
    e.stopPropagation();
    const group = $.extend(true, {}, this.state.group);
    this.props.deleteGroupIcon(group.id, group.image_id).then((res) => {
      this.props.updateGroups && setTimeout(() => this.props.updateGroups(), 1e3);
      group.image_id = null;
      group.image_path = null;
      this.setState({
        group
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  handleImageChange(e) {
    if (this.state.loadingImage === false) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({
        loadingImage: true
      });

      const image = e.target.files[0];
      if (typeof image !== 'undefined' && (image.type === 'image/jpeg' || image.type === 'image/jpg' || image.type === 'image/svg' || image.type === 'image/png' || image.type === 'image/gif')) {
        const reader = new FileReader();
        reader.readAsDataURL(image);

        reader.onloadend = () => {
          this.setState({
            groupIconUrl: reader.result,
            profileImage: image
          });

          this.props.getGroupsIconUrl(this.state.group.id).then((response) => {
            const data = new FormData();
            data.append('file-0', image);
            const {upload_url} = JSON.parse(response);
            this.props.uploadGroupsIcon(this.state.group.id, upload_url, data).then((response2) => {
              this.props.updateGroups && setTimeout(() => this.props.updateGroups(), 1e3);
              const data2 = JSON.parse(response2);
              const { file_id, file_path } = data2;
              const group = $.extend(true, {}, this.state.group);
              group.image_id = file_id;
              group.image_path = file_path;
              this.setState({
                loadingImage: false,
                group
              });
            });
          });
        };
      } else {
        this.setState({
          loadingImage: false,
          errorText: [{ message: 'Please upload a valid image file', bsStyle: 'danger' }]
        });
      }
    }
  }

  addressSelected(place) {
    let country = ''
      , address_line_1 = ''
      , address_line_2 = ''
      , zipcode = ''
      , city = ''
      , state = '';
    place.address_components.forEach(function (item) {
      const item_name = item.types[0];
      switch (item_name) {
        case 'country':
          country = item.long_name;
          break;
        case 'street_number':
          address_line_1 = item.long_name;
          break;
        case 'route':
          address_line_2 = item.long_name;
          break;
        case 'postal_code':
          zipcode = item.long_name;
          break;
        case 'administrative_area_level_1':
          state = item.long_name;
          break;
        case 'locality':
          city = item.long_name;
          break;
      }
    });
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    let exact_location = null;
    if (lat !== null && lat !== '' && lng !== null && lng !== '') {
      exact_location = { lat, lng };
    }
    let group = $.extend(true, {}, this.state.group);
    group.address_line_1 = address_line_1;
    group.address_line_2 = address_line_2;
    group.country = country;
    group.zipcode = zipcode;
    group.city = city;
    group.state = state;
    group.exact_location = exact_location;
    this.setState({
      group
    });

  }

  createCompleteAddress(group) {
    let completeAddress = null;
    if (typeof group.address_line_1 !== "undefined" && group.address_line_1 !== null) {
      completeAddress = group.address_line_1 + " ";
    }
    if (typeof group.address_line_2 !== "undefined" && group.address_line_2 !== null) {
      completeAddress += group.address_line_2 + " ";
    }
    if (typeof group.state !== "undefined" && group.state !== null) {
      completeAddress += group.state + " ";
    }
    if (typeof group.country !== "undefined" && group.country !== null) {
      completeAddress += group.country + " ";
    }
    if (typeof group.zipcode !== "undefined" && group.zipcode !== null) {
      completeAddress += group.zipcode;
    }
    return completeAddress;
  }

  updateGroupState(updatedProps = this.props) {
    if (!updatedProps.showModal) {
      this.setState({
        editingGroup: false
      });
    } else {
      if (!this.state.editingGroup && updatedProps.selectedMessage === null) {
        const updatedGroup = {
          'is_default': false,
          'image_id': null,
          'extra_fields': null,
          'address_line_2': null,
          'description': null,
          'address_line_1': null,
          'emergency': null,
          'phone': null,
          'email': null,
          'zipcode': null,
          'country': null,
          'name': null,
          'city': null,
          'url_safe_id': null,
          'image_path': null,
          'mobile_number': null,
          'state': null,
          'exact_location': null,
          'timezone': null
        };
        this.setState({
          group: updatedGroup,
          editingGroup: true
        });
      } else if (!this.state.editingGroup) {
        const updatedGroup = $.extend(true, {}, updatedProps.selectedGroup);
        this.setState({
          group: updatedGroup,
          editingGroup: true
        });
      }
    }
  }

  handleFieldChange(e) {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    const group = $.extend(true, {}, this.state.group);
    group[fieldName] = fieldValue;
    this.setState({
      group
    });
  }

  handlePhoneChange(value) {
    const group = $.extend(true, {}, this.state.group);
    group['mobile_number'] = value;
    this.setState({
      group
    });
  }

  closeModal() {
    this.props.closeModal();
    this.updateGroupState();
    this.setState({
      serverActionIsPending: false,
      emailFieldError: false,
      nameFieldError: false,
      errorMessage: null,
      errorAlert: false,
      alertMessage: null
    });
  }

  render() {
    const group = this.state.group;
    return (
      <div className={styles.groupsFormContainer}>
        <Modal dialogClassName={styles.CMEditModal} show={this.props.showModal} onHide={this.closeModal}>
          <Modal.Header closeButton className={styles.CMEditModalHeader}>
            <h2 className={styles.messageTitle}>
              {typeof group.id !== 'undefined' ? 'Edit: ' + group.name: 'Add New Group'}
            </h2>
          </Modal.Header>
          <Modal.Body className={styles.CMEditModalBody}>
            <Grid>
              <Row>
                <Col md={12}>
                  {this.state.emailFieldError &&
                    <Alert bsStyle="danger">{this.state.errorMessage}</Alert>
                  }
                  {this.state.nameFieldError &&
                    <Alert bsStyle="danger">{this.state.errorMessage}</Alert>
                  }
                  {this.state.errorAlert &&
                    <Alert bsStyle="danger">{this.state.alertMessage}</Alert>
                  }
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <label>Group Name</label>
                    <FormControl type="text" onChange={(e) => this.handleFieldChange(e)} name="name" value={group.name} />
                  </FormGroup>
                  <FormGroup>
                    <label>Description</label>
                    <FormControl className={styles.groupDescriptionField} rows={5} onChange={(e) => this.handleFieldChange(e)} name="description" componentClass='textarea' value={group.description} />
                  </FormGroup>
                  <FormGroup>
                    <label>Mobile Phone Number</label>
                    <Phone country="US" className={cx('form-control', styles.mobileField)} name="mobile_number" onChange={(phone) => this.handlePhoneChange(phone)} value={group.mobile_number} />
                  </FormGroup>
                  <FormGroup>
                    <label>Phone Number</label>
                    <FormControl onChange={(e) => this.handleFieldChange(e)} name="phone" value={group.phone} />
                  </FormGroup>
                  <FormGroup>
                    <label>Support Email</label>
                    <FormControl type="email" onChange={(e) => this.handleFieldChange(e)} name="email" value={group.email} />
                    <HelpBlock>User your customer support/customer service email address. Customers will reach out to you at this email if they have any questions or comments.</HelpBlock>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <label>Group Icon</label>
                    <div className={styles.groupsImage}>
                      <div className={styles.image}>
                        {this.state.loadingImage === true
                          ?
                          <SavingSpinner borderStyle="none" title="Loading image" />
                          :
                          <Image src={this.state.group.image_path || '/images/user.png'} thumbnail responsive />
                        }
                        {/*<Checkbox onChange={(e) => this.useCompanyIcon(e)}>*/}
                          {/*Use company logo*/}
                        {/*</Checkbox>*/}
                      </div>
                      {typeof group.id !== 'undefined' &&
                        <div className={styles.imageButtons}>
                          {this.state.imageEditable && (this.state.loadingImage === false) &&
                          <a onClick={(e) => this.updateImageClick(e)}>
                            <FontAwesomeIcon icon={faPencilAlt} className={styles['icon']}/><span>Change Image</span>
                          </a>
                          }
                          {this.state.imageRemovable && (this.state.loadingImage === false) && group.image_path !== null &&
                            group.image_path !== '' && typeof group.image_path !== 'undefined' &&
                          <a onClick={(e) => this.removeImage(e)}>
                            <FontAwesomeIcon icon={faTimesCircle} className={styles['icon']}/><span>Remove</span>
                          </a>
                          }
                        </div>
                      }
                      {typeof group.id === 'undefined' &&
                      <p className={styles["text-center"]}><i>You will set image once group is added</i></p>
                      }
                      <input accept="image/png, image/jpg, image/jpeg, image/svg, image/gif" type="file" ref="imageUploader" onChange={this.handleImageChange} style={{ display: 'none' }}/>
                    </div>
                  </FormGroup>
                  <FormGroup>
                    <label>Complete Address</label>
                    <FormControl
                      componentClass={Autocomplete}
                      onPlaceSelected={(place) => this.addressSelected(place)}
                      type='text'
                      types={['']}
                      placeholder="Find address here"
                    />
                  </FormGroup>
                  <FormGroup>
                    <Row>
                      <Col md={6}>
                        <FormGroup>
                          <FormControl
                            type="text"
                            name="address_line_1"
                            value={group.address_line_1}
                            placeholder="Address Line 1"
                            onChange={(e) => this.handleFieldChange(e)}
                          />
                        </FormGroup>
                        <FormGroup>
                          <FormControl
                            type="text"
                            name="city"
                            value={group.city}
                            placeholder="City"
                            onChange={(e) => this.handleFieldChange(e)}
                          />
                        </FormGroup>
                        <FormGroup>
                          <FormControl
                            type="text"
                            name="country"
                            value={group.country}
                            placeholder="Country"
                            onChange={(e) => this.handleFieldChange(e)}
                          />
                        </FormGroup>
                      </Col>
                      <Col md={6}>
                        <FormGroup>
                          <FormControl
                            type="text"
                            name="address_line_2"
                            value={group.address_line_2}
                            placeholder="Address Line 2"
                            onChange={(e) => this.handleFieldChange(e)}
                          />
                        </FormGroup>
                        <FormGroup>
                          <FormControl
                            type="text"
                            name="state"
                            value={group.state}
                            placeholder="State"
                            onChange={(e) => this.handleFieldChange(e)}
                          />
                        </FormGroup>
                        <FormGroup>
                          <FormControl
                            type="text"
                            name="zipcode"
                            value={group.zipcode}
                            placeholder="Zip Code"
                            onChange={(e) => this.handleFieldChange(e)}
                          />
                        </FormGroup>
                      </Col>
                    </Row>
                  </FormGroup>
                  <FormGroup>
                    <label>Group Timezone</label>
                    <Select
                      onChange={this.handleGroupTimezoneChange}
                      id='timezone'
                      isMulti={false}
                      placeholder={'Select group timezone...'}
                      options={this.state.timezonesOptions}
                      value={this.state.timezonesOptions.find((el) => { return el.value === this.state.group.timezone; })}
                      isSearchable
                    />
                  </FormGroup>
                  <FormGroup>
                    <label>Emergency Contact</label>
                    <FormControl onChange={(e) => this.handleFieldChange(e)} name="emergency" value={group.emergency} />
                    <HelpBlock>This information will be shown to crew/drivers in case there is an issue and they are looking for emergency contact.</HelpBlock>
                  </FormGroup>
                </Col>
              </Row>
            </Grid>
          </Modal.Body>
          <Modal.Footer className={styles.CMEditModalFooter}>
            {
              typeof group.id !== 'undefined'
                ?
                <button onClick={() => this.updateGroup()} className={cx(['btn-submit'], styles.saveBtn)}>
                  {this.state.serverActionIsPending &&
                  <SavingSpinner borderStyle="none" title='' />
                  }
                  {!this.state.serverActionIsPending &&
                  <span>Update Group</span>
                  }
                </button>
                :
                <button onClick={() => this.saveGroup()} className={cx(['btn-submit'], styles.saveBtn)}>
                  {this.state.serverActionIsPending &&
                  <SavingSpinner borderStyle="none" title='' />
                  }
                  {!this.state.serverActionIsPending &&
                  <span>Save Group</span>
                  }
                </button>
            }
            <button onClick={this.closeModal} className={cx(styles.transparentBtn, ['btn-submit'])}>Close</button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
