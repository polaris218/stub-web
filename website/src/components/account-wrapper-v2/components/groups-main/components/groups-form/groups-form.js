import React, {Component} from 'react';
import styles from './groups-form.module.scss';
import {
  Grid,
  Row,
  Col,
  Modal,
  FormControl,
  Alert,
  FormGroup,
  HelpBlock,
  Image,
  ControlLabel,
  Checkbox,
  InputGroup, DropdownButton, MenuItem
} from 'react-bootstrap';
import cx from 'classnames';
import SavingSpinner from '../../../../../saving-spinner/saving-spinner';
import $ from 'jquery';
import Autocomplete from 'react-google-autocomplete';
import {getErrorMessage} from '../../../../../../helpers/task';
import Phone from 'react-phone-number-input';
import Select from 'react-select';
import moment from 'moment-timezone';
import { getTimezoneOptions, getPhoneCode } from '../../../../../../helpers';
import {toast} from 'react-toastify';
import {isValidUrl} from "../../../../../../helpers/url";

const FieldGroup = ({id, label, staticField, fieldInfo, ...props}) => (
  <FormGroup controlId={id}>
    <ControlLabel componentClass={ControlLabel}>{label}</ControlLabel>
    {staticField ?
      (<FormControl.Static>
        {props.value}
      </FormControl.Static>) :
      (<FormControl {...props} />)
    }
    <i>{fieldInfo}</i>
  </FormGroup>
);

export default class GroupsForm extends Component {
  constructor(props) {
    super(props);

    this.state = {
      group: {
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
        'complete_address': null,
        'timezone': null,
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
      timezonesOptions: [],
      facebook: '',
      yelp: '',
      angieslist: '',
      google: '',
      thumbtack: '',
      twitter: '',
      protocol: 'https',
      website: '',
    };

    this.closeModal = this.closeModal.bind(this);
    this.updateGroupState = this.updateGroupState.bind(this);
    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.saveGroup = this.saveGroup.bind(this);
    this.changeProtocol = this.changeProtocol.bind(this);
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

  changeProtocol(value) {
    this.setState({
      protocol: value,
      detailsNotifications: []
    });
  }

  saveGroup() {
    this.setState({
      serverActionIsPending: true
    });
    const group = $.extend(true, {}, this.state.group);
    let {facebook, yelp, google, angieslist, website, thumbtack, twitter} = this.state;

    if (facebook && facebook.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(facebook)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Facebook URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (google && google.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(google)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Google URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (angieslist && angieslist.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(angieslist)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Angieslist URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (thumbtack && thumbtack.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(thumbtack)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Thumbtack URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (twitter && twitter.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(twitter)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Twitter URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (yelp && yelp.trim().length > 0 && !isValidUrl({exact: true, strict: false}).test(yelp)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Yelp URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (website && website.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(website)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Website URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else {
      let social_links = {};

      if (facebook && facebook.trim().length > 0) {
        facebook = !facebook.includes('https://') && !facebook.includes('http://') ? 'https://' + facebook : facebook;
        social_links['facebook'] = facebook;
      }
      if (yelp && yelp.trim().length > 0) {
        yelp = !yelp.includes('https://') && !yelp.includes('http://') ? 'https://' + yelp : yelp;
        social_links['yelp'] = yelp;
      }
      if (angieslist && angieslist.trim().length > 0) {
        angieslist = !angieslist.includes('https://') && !angieslist.includes('http://') ? 'https://' + angieslist : angieslist;
        social_links['angieslist'] = angieslist;
      }
      if (google && google.trim().length > 0) {
        google = !google.includes('https://') && !google.includes('http://') ? 'https://' + google : google;
        social_links['google'] = google;
      }
      if (thumbtack && thumbtack.trim().length > 0) {
        thumbtack = !thumbtack.includes('https://') && !thumbtack.includes('http://') ? 'https://' + thumbtack : thumbtack;
        social_links['thumbtack'] = thumbtack;
      }
      if (twitter && twitter.trim().length > 0) {
        twitter = !twitter.includes('https://') && !twitter.includes('http://') ? 'https://' + twitter : twitter;
        social_links['twitter'] = twitter;
      }

      social_links = JSON.stringify(social_links);

      if (website && website.trim().length > 0) {
        if (website.includes('https://')) {
          website = website.replace('https://', '');
        } else if (website.includes('http://')) {
          website = website.replace('http://', '');
        }
        website = this.state.protocol + '://' + website;
      }

      group['social_links'] = social_links;
      group['website'] = website.trim();
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
  }

  updateGroup() {
    this.setState({
      serverActionIsPending: true
    });
    const group = $.extend(true, {}, this.state.group);
    let {facebook, yelp, google, angieslist, website, thumbtack, twitter} = this.state;

    if (facebook && facebook.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(facebook)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Facebook URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (google && google.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(google)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Google URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (angieslist && angieslist.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(angieslist)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Angieslist URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (thumbtack && thumbtack.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(thumbtack)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Thumbtack URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (twitter && twitter.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(twitter)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Twitter URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (yelp && yelp.trim().length > 0 && !isValidUrl({exact: true, strict: false}).test(yelp)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Yelp URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else if (website && website.trim().length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(website)) {
      this.setState({
        serverActionIsPending: false
      }, () => {
        const error = {
          text: 'An error occurred: Website URL validation failed',
          options: {
            type: toast.TYPE.ERROR,
            position: toast.POSITION.BOTTOM_LEFT,
            className: styles.toastErrorAlert,
            autoClose: 8000
          }
        };
        this.props.createToastAlert(error);
      });
    } else {
      let social_links = {};

      if (facebook && facebook.trim().length > 0) {
        facebook = !facebook.includes('https://') && !facebook.includes('http://') ? 'https://' + facebook : facebook;
        social_links['facebook'] = facebook;
      }
      if (yelp && yelp.trim().length > 0) {
        yelp = !yelp.includes('https://') && !yelp.includes('http://') ? 'https://' + yelp : yelp;
        social_links['yelp'] = yelp;
      }
      if (angieslist && angieslist.trim().length > 0) {
        angieslist = !angieslist.includes('https://') && !angieslist.includes('http://') ? 'https://' + angieslist : angieslist;
        social_links['angieslist'] = angieslist;
      }
      if (google && google.trim().length > 0) {
        google = !google.includes('https://') && !google.includes('http://') ? 'https://' + google : google;
        social_links['google'] = google;
      }
      if (thumbtack && thumbtack.trim().length > 0) {
        thumbtack = !thumbtack.includes('https://') && !thumbtack.includes('http://') ? 'https://' + thumbtack : thumbtack;
        social_links['thumbtack'] = thumbtack;
      }
      if (twitter && twitter.trim().length > 0) {
        twitter = !twitter.includes('https://') && !twitter.includes('http://') ? 'https://' + twitter : twitter;
        social_links['twitter'] = twitter;
      }

      social_links = JSON.stringify(social_links);

      if (website && website.trim().length > 0) {
        if (website.includes('https://')) {
          website = website.replace('https://', '');
        } else if (website.includes('http://')) {
          website = website.replace('http://', '');
        }
        website = this.state.protocol + '://' + website;
      }

      group['social_links'] = social_links;
      group['website'] = website.trim();

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
  }

  useCompanyIcon(e) {
    const checkedStatus = e.target.checked;
    const profile = $.extend(true, {}, this.props.profile);
    const {image_path, image_id} = profile;
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
              const {file_id, file_path} = data2;
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
          errorText: [{message: 'Please upload a valid image file', bsStyle: 'danger'}]
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
      exact_location = {lat, lng};
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
          editingGroup: true,
        });
      } else if (!this.state.editingGroup) {
        const updatedGroup = $.extend(true, {}, updatedProps.selectedGroup);
        const updatedGroupSocialLinks = updatedGroup.social_links && updatedGroup.social_links;
        let {facebook, yelp, google, angieslist, thumbtack, twitter} = updatedGroupSocialLinks ? updatedGroupSocialLinks : {facebook: '', yelp: '', google: '', angieslist: '', thumbtack: '', twitter: ''};
        this.setState({
          group: updatedGroup,
          editingGroup: true,
          facebook,
          yelp,
          google,
          angieslist,
          website: updatedGroup.website || '',
          thumbtack,
          twitter,
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

  handleChange(e) {
    const fieldName = e.target.name;
    const fieldValue = e.target.value;
    let stateObj = {};
    stateObj[fieldName] = fieldValue;
    this.setState({
      ...stateObj,
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
    const phoneCode = getPhoneCode(this.props.companyProfile && this.props.companyProfile.country),
          group = this.state.group,
      crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756">
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
    return (
      <Modal dialogClassName={styles.CMEditModal} show={this.props.showModal} keyboard={false} backdrop={'static'} onHide={this.closeModal}>
        <Modal.Header className={styles.CMEditModalHeader}>
          <h2
            className={styles.messageTitle}>{typeof group.id !== 'undefined' ? 'Edit: ' + group.name : 'Add New Group'}</h2>
          <i className={styles.closeIcon} onClick={this.closeModal}>{crossIcon}</i>
        </Modal.Header>
        <Modal.Body>
          {this.state.emailFieldError && <Alert bsStyle="danger">{this.state.errorMessage}</Alert>}
          {this.state.nameFieldError && <Alert bsStyle="danger">{this.state.errorMessage}</Alert>}
          {this.state.errorAlert && <Alert bsStyle="danger">{this.state.alertMessage}</Alert>}
          <Grid>
            <Row>
              <Col md={6} xs={12}>
                <div className={cx(styles.box)}>
                  <h3 className={cx(styles.boxTitle)}>Group</h3>
                  <div className={cx(styles.boxBody)}>
                    <div className={cx(styles.boxBodyInner)}>
                      <div className={styles.groupsImage}>
                        <div className={styles.image}>
                          {this.state.loadingImage === true ?
                            <SavingSpinner borderStyle="none" title=""/> :
                            <Image className={!this.state.group.image_path && cx(styles.default)}
                                   src={this.state.group.image_path || '/images/user-default.svg'}/>}
                          {/*<Checkbox onChange={(e) => this.useCompanyIcon(e)}>*/}
                          {/*Use company logo*/}
                          {/*</Checkbox>*/}
                        </div>
                        {typeof group.id !== 'undefined' &&
                        <div className={styles.icons}>
                          {this.state.imageEditable && (this.state.loadingImage === false) &&
                          <div className={styles.edit} onClick={(e) => this.updateImageClick(e)}>
                            <i>{editIcon}</i><span>Change Image</span>
                          </div>
                          }
                          {this.state.imageRemovable && (this.state.loadingImage === false) && group.image_path !== null && group.image_path !== '' && typeof group.image_path !== 'undefined' &&
                          <div className={styles.delete} onClick={(e) => this.removeImage(e)}>
                            <i className={styles.remove}/><span>Remove</span>
                          </div>
                          }
                        </div>
                        }
                        {typeof group.id === 'undefined' && <p>You will set image once group is added</p>}
                        <input accept="image/png, image/jpg, image/jpeg, image/svg, image/gif" type="file"
                               ref="imageUploader" onChange={this.handleImageChange} style={{display: 'none'}}/>
                      </div>
                      <FormGroup>
                        <ControlLabel className={cx(styles.boxTitle)}>Name and Description</ControlLabel>
                        <FormControl type="text" placeholder="Group Name" onChange={(e) => this.handleFieldChange(e)}
                                     name="name" value={group.name}/>
                      </FormGroup>
                      <FormGroup>
                        <FormControl className={styles.groupDescriptionField} placeholder="Description"
                                     onChange={(e) => this.handleFieldChange(e)} name="description"
                                     componentClass='textarea' value={group.description}/>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6} xs={12}>
                <div className={cx(styles.box)}>
                  <h3 className={cx(styles.boxTitle)}>Complete Address</h3>
                  <div className={cx(styles.boxBody)}>
                    <div className={cx(styles.boxBodyInner)}>
                      <Row className={cx(styles.formRow)}>
                        <Col xs={12}>
                          <FormGroup className={cx(styles.addressSearch)}>
                            <FormControl
                              componentClass={Autocomplete}
                              onPlaceSelected={(place) => this.addressSelected(place)}
                              type='text'
                              types={[]}
                              placeholder="Find address here"
                            />
                          </FormGroup>
                        </Col>
                        <Col sm={6} xs={12}>
                          <FormGroup>
                            <FormControl
                              type="text"
                              name="address_line_1"
                              value={group.address_line_1}
                              placeholder="Address Line 1"
                              onChange={(e) => this.handleFieldChange(e)}
                            />
                          </FormGroup>
                        </Col>
                        <Col sm={6} xs={12}>
                          <FormGroup>
                            <FormControl
                              type="text"
                              name="address_line_2"
                              value={group.address_line_2}
                              placeholder="Address Line 2"
                              onChange={(e) => this.handleFieldChange(e)}
                            />
                          </FormGroup>
                        </Col>
                        <Col sm={6} xs={12}>
                          <FormGroup>
                            <FormControl
                              type="text"
                              name="city"
                              value={group.city}
                              placeholder="City"
                              onChange={(e) => this.handleFieldChange(e)}
                            />
                          </FormGroup>
                        </Col>
                        <Col sm={6} xs={12}>
                          <FormGroup>
                            <FormControl
                              type="text"
                              name="state"
                              value={group.state}
                              placeholder="State"
                              onChange={(e) => this.handleFieldChange(e)}
                            />
                          </FormGroup>
                        </Col>
                        <Col sm={6} xs={12}>
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
                        <Col sm={6} xs={12}>
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
                        <Col xs={12}>
                          <FormGroup>
                            <ControlLabel className={cx(styles.boxTitle)}>Group Timezone</ControlLabel>
                            <Select
                              onChange={this.handleGroupTimezoneChange}
                              id='timezone'
                              isMulti={false}
                              placeholder="Select Group Timezone..."
                              options={this.state.timezonesOptions}
                              value={this.state.timezonesOptions.find((el) => {
                                return el.value === this.state.group.timezone;
                              })}
                              isSearchable
                              className={styles.timeZoneSelect}
                              classNamePrefix="selectInner"
                            />
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            <Row>
              <Col md={6} xs={12}>
                <div className={cx(styles.box)}>
                  <h3 className={cx(styles.boxTitle)}>Phone & Support Email</h3>
                  <div className={cx(styles.boxBody)}>
                    <div className={cx(styles.boxBodyInner)}>
                      <Row className={cx(styles.formRow)}>
                        <Col sm={6} xs={12}>
                          <FormGroup>
                            <Phone country={phoneCode} className={cx(styles['input-phone'])} placeholder="Mobile Phone Number" name="mobile_number" onChange={(phone) => this.handlePhoneChange(phone)} value={group.mobile_number} />
                          </FormGroup>
                        </Col>
                        <Col sm={6} xs={12}>
                          <FormGroup>
                            <FormControl onChange={(e) => this.handleFieldChange(e)} name="phone" placeholder="Phone 2"
                                         value={group.phone}/>
                          </FormGroup>
                        </Col>
                        <Col xs={12}>
                          <FormGroup>
                            <FormControl placeholder="Support Email" type="email"
                                         onChange={(e) => this.handleFieldChange(e)} name="email" value={group.email}/>
                            <HelpBlock className={cx(styles.helpText)}>Use your customer support/customer service email
                              address. Customers will reach out to you at this email if they have any questions or
                              comments.</HelpBlock>
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={6} xs={12}>
                <div className={cx(styles.box)}>
                  <h3 className={cx(styles.boxTitle)}>Emergency Contact</h3>
                  <div className={cx(styles.boxBody)}>
                    <div className={cx(styles.boxBodyInner)}>
                      <FormGroup>
                        <FormControl placeholder="Emergency Contact" onChange={(e) => this.handleFieldChange(e)}
                                     name="emergency" value={group.emergency}/>
                        <HelpBlock className={cx(styles.helpText)}>This information will be shown to crew/drivers in
                          case there is an issue and they are looking for emergency contact.</HelpBlock>
                      </FormGroup>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12}>
                <div className={cx(styles.box)}>
                  <h3 className={cx(styles.boxTitle)}>Social Links</h3>
                  <div className={cx(styles.boxBody)}>
                    <Row className={cx(styles.formRow)}>
                      <Col xs={12} sm={6}>
                        <div className={cx(styles.boxBodyInner, styles['pb-0'])}>
                          <FormGroup className={styles.websiteField}>
                            <ControlLabel componentClass={ControlLabel}>Website</ControlLabel>
                            <InputGroup>
                              <DropdownButton componentClass={InputGroup.Button} id="input-dropdown-addon"
                                              title={this.state.protocol} onSelect={this.changeProtocol}>
                                <MenuItem key="https" eventKey="https" href="javascript:void(0)">https</MenuItem>
                                <MenuItem key="http" eventKey="http" href="javascript:void(0)">http</MenuItem>
                              </DropdownButton>
                              <FormControl type="text" onChange={this.handleChange} name="website"
                                           value={this.state['website'] || ''}/>
                            </InputGroup>
                          </FormGroup>
                          <FieldGroup
                            componentClass='input'
                            onChange={(e) => this.handleChange(e)}
                            name="yelp"
                            type='text'
                            label="Yelp"
                            value={this.state['yelp'] || ''}
                          />
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className={cx(styles.boxBodyInner, styles['pb-0'])}>
                          <FieldGroup
                            componentClass='input'
                            onChange={(e) => this.handleChange(e)}
                            name="facebook"
                            type='text'
                            label="Facebook"
                            value={this.state['facebook'] || ''}
                          />
                          <FieldGroup
                            componentClass='input'
                            onChange={(e) => this.handleChange(e)}
                            name="angieslist"
                            type='text'
                            label="Angie's List"
                            value={this.state['angieslist'] || ''}
                          />
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className={cx(styles.boxBodyInner, styles['py-0'])}>
                          <FieldGroup
                            componentClass='input'
                            onChange={(e) => this.handleChange(e)}
                            name="google"
                            type='text'
                            label="Google"
                            value={this.state['google'] || ''}
                          />
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className={cx(styles.boxBodyInner, styles['py-0'])}>
                          <FieldGroup
                            componentClass='input'
                            onChange={(e) => this.handleChange(e)}
                            name="twitter"
                            type='text'
                            label="Twitter"
                            value={this.state['twitter'] || ''}
                          />
                        </div>
                      </Col>
                      <Col xs={12} sm={6}>
                        <div className={cx(styles.boxBodyInner, styles['pt-0'])}>
                          <FieldGroup
                            componentClass='input'
                            onChange={(e) => this.handleChange(e)}
                            name="thumbtack"
                            type='text'
                            label="Thumbtack"
                            value={this.state['thumbtack'] || ''}
                          />
                        </div>
                      </Col>
                    </Row>
                  </div>
                </div>

                <div className={cx(styles.buttonWrapper)}>
                  <button onClick={this.closeModal} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
                  {typeof group.id !== 'undefined'
                    ?
                    <button onClick={() => this.updateGroup()} className={cx(styles.btn, styles['btn-secondary'])}
                            disabled={this.state.serverActionIsPending}>{this.state.serverActionIsPending ?
                      <SavingSpinner size={8} borderStyle="none"/> : 'Update Group'}</button>
                    :
                    <button onClick={() => this.saveGroup()} className={cx(styles.btn, styles['btn-secondary'])}
                            disabled={this.state.serverActionIsPending}>{this.state.serverActionIsPending ?
                      <SavingSpinner size={8} borderStyle="none"/> : 'Save Group'}</button>
                  }
                </div>
              </Col>
            </Row>
            {group && <div className={cx(styles.externalInfo)}>
              {group.id && <div><strong>ID</strong> : {group.id}</div>}
            </div>}
          </Grid>
        </Modal.Body>
      </Modal>
    );
  }
}
