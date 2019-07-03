import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { isValidUrl } from '../../../../helpers/url';
import {
  Grid,
  Row,
  Col,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Dropdown,
  MenuItem,
  Image,
  InputGroup,
  DropdownButton
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './account-details.module.scss';
import NotificationManager from '../../../notification-manager/notification-manager';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import company_types from '../../../../helpers/company_types';
import Autocomplete from 'react-google-autocomplete';
import { ColorField } from '../../../fields';
import { getErrorMessage } from '../../../../helpers/task';
import Select from 'react-select';
import moment from 'moment-timezone';
import { getTimezoneOptions, getPhoneCode } from '../../../../helpers';
import { toast } from 'react-toastify';
import cx from 'classnames';
import Phone from 'react-phone-number-input';
import SwitchButton from '../../../../helpers/switch_button';

const FieldGroup = ({ id, label, staticField, fieldInfo, ...props }) => (
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

export default class AccountDetails extends Component {
  constructor(props) {
    super(props);
    this.updateAccountDetails = this.updateAccountDetails.bind(this);
    this.changeCompanyType = this.changeCompanyType.bind(this);
    this.onChangePrimaryPhone = this.onChangePrimaryPhone.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.onProfileColorChange = this.onProfileColorChange.bind(this);
    this.changeProtocol = this.changeProtocol.bind(this);
    this.populateTimezonesOptions = this.populateTimezonesOptions.bind(this);
    this.onChangeCompanyTimezone = this.onChangeCompanyTimezone.bind(this);
    this.updateImageClick = this.updateImageClick.bind(this);
    this.changeRouteStart = this.changeRouteStart.bind(this);

    this.state = {
      active_part: (this.props.pageParams.page_id != undefined) ? parseInt(this.props.pageParams.page_id) : 0,
      company_types,
      planNotifications: [],
      detailsNotifications: [],
      imageEditable: true,
      imageRemovable: true,
      loadingImage: false,
      savingDetails: false,
      loaded: false,
      teamMembers: 1,
      protocol: 'https',
      timezonesOptions: [],
      responsiveWidget: true
    };
  }

  componentDidMount() {
    this.getAccountDetails();
    this.populateTimezonesOptions();
  }

  populateTimezonesOptions() {
    const timezoneNames = getTimezoneOptions();
    const timezonesOptions = [];
    timezoneNames.map((timezone) => {
      timezonesOptions.push(timezone);
    });
    this.setState({
      timezonesOptions
    });
  }

  onChangeCompanyTimezone(timezone) {
    this.setState({
      timezone: timezone.value
    });
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.error !== null && typeof nextProps.error !== 'undefined') {
      this.setState({
        detailsNotifications: nextProps.error,
      });
    } else {
      this.setState({
        detailsNotifications: [],
      });
    }
  }

  updateAddress(place) {
    const address = place.formatted_address;
    let country = '';
    place.address_components.forEach(function (item) {
      const item_name = item.types[0];
      if (item_name === 'country') {
        country = item.short_name;
      }
    });
    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    this.state.address = address;
    this.state.country = country;
    this.state.exact_location = lat + ',' + lng;
    this.setState(this.state);
  }

  onProfileColorChange(color) {
    this.props.updateColorCallback(color);
    this.setState({ color, detailsNotifications: [] });
  }

  calculateDiscount() {
    return (this.state.payment_amount * (1 - this.state.discount / 100)).toFixed(2);
  }

  onChangeField(event) {
    this.setState({
      [event.target.id]: event.target.value,
      detailsNotifications: []
    });
  }

  dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    let _MS_PER_DAY = 1000 * 60 * 60 * 24;
    let utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    let utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  getAccountDetails() {
    this.props.getEntities().then((data) => {
      this.setState({ teamMembers: JSON.parse(data).length });
    });

    this.props.getProfileInformation(true).then((data) => {
      const profile = JSON.parse(data);
      let {
        created, address, country, mobile_number, phone, support_email, fullname, email, intro, details, emergency, image_path,
        image_id, plan_id, company_type, social_links, website, owner_url, reminder_notification_time,
        billing_type, billing_info, billing_id, trial_expiration_date, next_charge, discount, color, timezone, route_start
      } = profile;

      const company_types = this.state.company_types.map((item) => {
        item.selected = item.value === company_type;
        return item;
      });


      if (website && website !== null) {
        if (website.includes('https://')) {
          website = website.replace('https://', '');
          this.setState({
            protocol: 'https',
          });
        } else if (website.includes('http://')) {
          website = website.replace('http://', '');
          this.setState({
            protocol: 'http',
          });
        }
      }

      let trialExpirationDate = new Date(trial_expiration_date);
      let today = new Date();
      const isTrial = today < trialExpirationDate;
      const trialDaysLeft = this.dateDiffInDays(today, trialExpirationDate);


      this.setState({
        address,
        country,
        mobile_number,
        phone,
        support_email,
        fullname,
        email,
        intro,
        details,
        emergency,
        profileImageUrl: image_path,
        company_types,
        website,
        owner_url,
        billing_type,
        billing_info,
        billing_id,
        isTrial,
        trial_expiration_date,
        next_charge,
        discount,
        created,
        reminder_notification_time,
        trialDaysLeft,
        imageRemovable: image_id ? true : false,
        image_id,
        facebook: social_links ? social_links['facebook'] : '',
        yelp: social_links ? social_links['yelp'] : '',
        angieslist: social_links ? social_links['angieslist'] : '',
        google: social_links ? social_links['google'] : '',
        thumbtack: social_links ? social_links['thumbtack'] : '',
        twitter: social_links ? social_links['twitter'] : '',
        payment_amount: 20,
        loaded: true,
        color,
        timezone,
        route_start
      });
    });
  }

  changeRouteStart(e) {
    this.setState({
      route_start: e.target.value,
    });
  }

  changeProtocol(value) {
    this.setState({
      protocol: value,
      detailsNotifications: []
    });
  }

  changeCompanyType(value) {
    const company_types = this.state.company_types.map((item) => {
      item.selected = item.value === value;
      return item;
    });
    this.setState({ company_types, detailsNotifications: [] });
  }

  onChangePrimaryPhone(value) {
    let { mobile_number } = this.state;
    mobile_number = value;
    this.setState({ mobile_number, detailsNotifications: [] });
  }

  updateAccountDetails(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ savingDetails: true });
    let { address, country, mobile_number, phone, support_email, fullname, intro, details, emergency, company_types, facebook, yelp, angieslist, google, thumbtack, twitter, reminder_notifications, website, color, timezone, route_start } = this.state;
    if (facebook && facebook !== null && facebook.length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(facebook)) {
      this.setState({
        savingDetails: false
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
    } else if (google && google !== null && google.length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(google)) {
      this.setState({
        savingDetails: false
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
    } else if (angieslist && angieslist !== null && angieslist.length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(angieslist)) {
      this.setState({
        savingDetails: false
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
    } else if (thumbtack && thumbtack !== null && thumbtack.length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(thumbtack)) {
      this.setState({
        savingDetails: false
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
    } else if (twitter && twitter !== null && twitter.length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(twitter)) {
      this.setState({
        savingDetails: false
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
    } else if (yelp && yelp !== null && yelp.length > 0 && !isValidUrl({ exact: true, strict: false }).test(yelp)) {
      this.setState({
        savingDetails: false
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
    } else if (website && website !== null && website.length > 0 && !isValidUrl({
      exact: true,
      strict: false
    }).test(website)) {
      this.setState({
        savingDetails: false
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
      const company_type_selected = company_types.find((el) => el.selected);
      if (facebook && facebook !== null && !facebook.includes('https://') && !facebook.includes('http://') && facebook.length > 0) {
        facebook = 'https://' + facebook;
      }
      if (yelp && yelp !== null && !yelp.includes('https://') && !yelp.includes('http://') && yelp.length > 0) {
        yelp = 'https://' + yelp;
      }
      if (angieslist && angieslist !== null && !angieslist.includes('https://') && !angieslist.includes('http://') && angieslist.length > 0) {
        angieslist = 'https://' + angieslist;
      }
      if (google && google !== null && !google.includes('https://') && !google.includes('http://') && google.length > 0) {
        google = 'https://' + google;
      }
      if (thumbtack && thumbtack !== null && !thumbtack.includes('https://') && !thumbtack.includes('http://') && thumbtack.length > 0) {
        thumbtack = 'https://' + thumbtack;
      }
      if (twitter && twitter !== null && !twitter.includes('https://') && !twitter.includes('http://') && twitter.length > 0) {
        twitter = 'https://' + twitter;
      }

      const social_links = JSON.stringify({
        facebook: facebook,
        yelp: yelp,
        angieslist: angieslist,
        google: google,
        thumbtack: thumbtack,
        twitter: twitter
      });

      if (website && website !== null) {
        if (website.includes('https://')) {
          website = website.replace('https://', '');
        } else if (website.includes('http://')) {
          website = website.replace('http://', '');
        }
        website = this.state.protocol + '://' + website;
      }

      this.props.updateProfileInformation({
        address,
        country,
        mobile_number,
        phone,
        support_email,
        fullname,
        intro,
        details,
        emergency,
        social_links,
        company_type: company_type_selected.value,
        website,
        color,
        timezone,
        route_start
      }).then((data) => {
        this.setState({
          savingDetails: false
        }, () => {
          const alert = {
            text: 'Account Details successfully updated',
            options: {
              type: toast.TYPE.SUCCESS,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastSuccessAlert,
              autoClose: 8000
            }
          };
          this.props.createToastAlert(alert);
        });
      }).catch((err) => {
        const error = err.responseText;
        const errorMsg = getErrorMessage(error);
        this.setState({
          savingDetails: false
        }, () => {
          const error = {
            text: errorMsg,
            options: {
              type: toast.TYPE.ERROR,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastErrorAlert,
              autoClose: 8000
            }
          };
          this.props.createToastAlert(error);
        });
      });
    }
  }

  renderCompanyTypeDropdownList(list) {
    let item = list.find((itemC) => itemC.selected);
    item = item ? item : list[0];
    return (
      <Dropdown id={item.value} className={styles['user-plan']} onSelect={this.changeCompanyType}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
            <span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
            <small className={styles['user-plan-calls']}>{item.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            return (
              <MenuItem className={styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value} href="javascript:void(0)">
                <div className={styles['user-plan-info']}>
                  <span className={'text-uppercase ' + styles['user-plan-name']}>{itemC.label}</span>
                  <small className={styles['user-plan-calls']}>{itemC.details}</small>
                </div>
              </MenuItem>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  updateImageClick(imageUploaderRef) {
    imageUploaderRef.click();
  }

  switchReviewsWidget(e) {
    this.setState({
      responsiveWidget: e.target.checked
    });
  }

  render() {
    const phoneCode = getPhoneCode(this.props.companyProfile && this.props.companyProfile.country);
    const current_notification = this.state.detailsNotifications;
    const iframe_responsive_string = '<div style="max-width: 600px;margin: 0 auto;"><iframe src="https://' + location.host + '/reviews/widget/' + this.state.owner_url + '?delay=5000" scrolling="no" frameborder="0" width="100%" style="height: 350px;display: block;margin: 0;width: 1px;min-width: 100%;*width: 100%;"></iframe></div>';
    const iframe_string = '<iframe src="https://' + location.host + '/reviews/widget/' + this.state.owner_url + '?delay=5000" scrolling="no" frameborder="0" width="600px" style="height: 350px;width: 600px;display: block;margin: 0 auto;"></iframe>';
    const editIcon = <svg xmlns="http://www.w3.org/2000/svg" width="10" height="9.953" viewBox="0 0 10 9.953"><g transform="translate(-58.788 -59.359)"><g transform="translate(58.788 59.359)"><g transform="translate(0 0)"><path d="M220.982,59.853a1.677,1.677,0,0,0-1.389-.484,1.725,1.725,0,0,0-1.014.5l-.263.263L220.7,62.52l.261-.261a1.721,1.721,0,0,0,.507-1.08A1.682,1.682,0,0,0,220.982,59.853Z" transform="translate(-211.477 -59.359)" fill="#348af7"/><path d="M59.187,95.261l-.4,2.8,2.852-.352L67.546,91.8l-2.452-2.449Z" transform="translate(-58.788 -88.11)" fill="#348af7"/></g></g></g></svg>;

    return (
      <div className={styles['account-details']}>
        <Grid>
          <NotificationManager notifications={current_notification}/>
          {this.state.loaded ? (
            <div className={styles['account-form']}>
              <div className={cx(styles.box)}>
                <div className={cx(styles.boxTitleWrapper)}>
                  <div className={styles['profile-link']}>
                    <Link to={`/profile/${this.state.owner_url}`}>View profile visible to customers</Link>
                  </div>
                </div>
                <Row>
                  <Col md={12} lg={6}>
                    <h3 className={cx(styles.boxTitle)}>
                      Account Details</h3>
                    <div className={cx(styles.boxBody)}>
                      <div className={cx(styles.boxBodyInner)}>
                        <div className={styles.profileFieldWrapper}>
                          <div className={styles.profilePicture}>
                            <div className={styles['image']}>
                            {(this.props.loadingImage === true) ?
                            (<SavingSpinner size={8} borderStyle="none" />) : (<Image src={this.props.profileImageUrl || '/images/user-default.svg'} />)}
                            </div>
                            <div className={styles.icons}>
                              {this.props.imageEditable && (this.props.loadingImage === false) &&
                                <div className={styles.edit} onClick={() => { this.updateImageClick(this.refs.imageUploader)}}>
                                  <i>{editIcon}</i><span>Change Image</span>
                                </div>
                              }
                              {this.props.imageRemovable && this.props.profileImageUrl && (this.props.loadingImage === false) &&
                                <div className={styles.delete} onClick={this.props.removeImage}>
                                  <i className={styles.remove} /><span>Remove</span>
                                </div>
                              }
                            </div>
                            <input accept="image/png, image/jpg, image/jpeg, image/svg, image/gif" type="file" ref="imageUploader" onChange={this.props.handleImageChange} style={{ display: 'none' }} />
                          </div>
                          <div className={styles.profileColorField}>
                            <FieldGroup
                              componentClass={ColorField}
                              onChange={this.onProfileColorChange}
                              id="color"
                              value={this.state['color'] || '#0693e3'}
                              fieldInfo="All emails to customers use this default color."
                              showColorField={true}
                            />
                          </div>
                        </div>
                        <FieldGroup
                          componentClass='input'
                          onChange={this.onChangeField}
                          id="fullname"
                          type='text'
                          label="Full Name"
                          value={this.state['fullname'] || ''}
                        />
                        <div className={cx(styles.infoField, styles.introField)}>
                          <FieldGroup
                            componentClass='input'
                            onChange={this.onChangeField}
                            id="intro"
                            type='text'
                            label="Intro"
                            value={this.state['intro'] || ''}
                            fieldInfo="This will be shown on each appointment screen."
                          />
                        </div>
                        <FormGroup controlId="user-plan">
                          <ControlLabel componentClass={ControlLabel}>Business</ControlLabel>
                          {this.renderCompanyTypeDropdownList(company_types)}
                        </FormGroup>
                        <FormGroup controlId="details">
                          <ControlLabel componentClass={ControlLabel}>Details</ControlLabel>
                          <FormControl
                            componentClass='textarea'
                            type='text'
                            value={this.state['details'] || ''}
                            onChange={this.onChangeField}
                            rows="7"/>
                        </FormGroup>
                      </div>
                    </div>
                  </Col>
                  <Col md={12} lg={6}>
                    <h3 className={cx(styles.boxTitle)}>Contact Information</h3>
                    <div className={cx(styles.boxBody, styles.boxBodySupport)}>
                      <div className={cx(styles.boxBodyInner)}>
                        <div className={cx(styles.infoField)}>
                          <FieldGroup
                            componentClass='input'
                            onChange={this.onChangeField}
                            id="support_email"
                            type='email'
                            label="Support Email"
                            value={this.state['support_email'] || ''}
                            fieldInfo='Use your customer support/customer service email address.'
                          />
                        </div>
                        <Row className={cx(styles.formRow)}>
                          <Col xs={12} sm={6}>
                            <FormGroup>
                              <label for="mobile_number" className="control-label">Primary Phone</label>
                              <Phone
                                id="mobile_number"
                                country={phoneCode}
                                className={cx(styles['input-phone'])}
                                placeholder="Mobile Phone Number"
                                ref="mobile_number"
                                value={this.state['mobile_number']}
                                onChange={(phone) => { this.onChangePrimaryPhone(phone); }}
                              />
                            </FormGroup>
                          </Col>
                          <Col xs={12} sm={6}>
                            <FieldGroup
                              componentClass='input'
                              onChange={this.onChangeField}
                              id="phone"
                              type='tel'
                              label="Secondary Phone"
                              value={this.state['phone'] || ''}
                            />
                          </Col>
                        </Row>
                        <FieldGroup
                          componentClass={Autocomplete}
                          onChange={this.onChangeField}
                          onPlaceSelected={(place) => {
                            this.updateAddress(place);
                          }}
                          id="address"
                          type='text'
                          types={[]}
                          label="Complete Address"
                          value={this.state['address'] || ''}
                        />
                      </div>
                      <div className={cx(styles.boxBodyInner)}>
                        <FieldGroup
                          componentClass='input'
                          onChange={this.onChangeField}
                          id="country"
                          type='text'
                          label="Country"
                          value={this.state['country'] || ''}
                        />
                        <FormGroup className='form-group'>
                          <ControlLabel componentClass={ControlLabel}>Company Timezone</ControlLabel>
                          <Select
                            onChange={this.onChangeCompanyTimezone}
                            id='timezones'
                            isMulti={false}
                            placeholder={'Select company timezone...'}
                            options={this.state.timezonesOptions}
                            value={this.state.timezonesOptions.find((el) => {
                              return el.value === this.state.timezone;
                            })}
                            isSearchable
                            className={styles.timeZoneSelect}
                            classNamePrefix="selectInner"
                          />
                        </FormGroup>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <h3 className={cx(styles.boxTitle)}>Social Links</h3>
                    <div className={cx(styles.boxBody)}>
                      <Row>
                        <Col xs={12} sm={6}>
                          <div className={cx(styles.boxBodyInner, styles['pb-0'])}>
                            <FormGroup className={styles.websiteField}>
                              <ControlLabel componentClass={ControlLabel}>Website</ControlLabel>
                              <InputGroup>
                                <DropdownButton componentClass={InputGroup.Button} id="input-dropdown-addon" title={this.state.protocol} onSelect={this.changeProtocol}>
                                  <MenuItem key="https" eventKey="https" href="javascript:void(0)">https</MenuItem>
                                  <MenuItem key="http" eventKey="http" href="javascript:void(0)">http</MenuItem>
                                </DropdownButton>
                                <FormControl type="text" onChange={this.onChangeField} id="website" value={this.state['website'] || ''}/>
                              </InputGroup>
                            </FormGroup>
                            <FieldGroup
                              componentClass='input'
                              onChange={this.onChangeField}
                              id="yelp"
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
                              onChange={this.onChangeField}
                              id="facebook"
                              type='text'
                              label="Facebook"
                              value={this.state['facebook'] || ''}
                            />
                            <FieldGroup
                              componentClass='input'
                              onChange={this.onChangeField}
                              id="angieslist"
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
                              onChange={this.onChangeField}
                              id="google"
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
                            onChange={this.onChangeField}
                            id="twitter"
                            type='text'
                            label="Twitter"
                            value={this.state['twitter'] || ''}
                          />
                        </div>
                      </Col>
                        <Col xs={12} sm={6}>
                          <div className={cx(styles.boxBodyInner, styles['py-0'])}>
                            <FieldGroup
                              componentClass='input'
                              onChange={this.onChangeField}
                              id="thumbtack"
                              type='text'
                              label="Thumbtack"
                              value={this.state['thumbtack'] || ''}
                            />
                          </div>
                        </Col>

                      </Row>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className={styles.boxBody}>
                      <div className={cx(styles.boxBodyInner)}>
                        <FormGroup controlId="enable_late_and_no_show_notification" onChange={(e) => { this.switchReviewsWidget(e) }} className={cx(styles.switch)}>
                          <span>Widget URL</span>
                          <SwitchButton
                            name="responsive_widget"
                            checked={this.state.responsiveWidget}
                          />
                        </FormGroup>
                        <div className={styles.infoFieldText}>
                          <p>{this.state.responsiveWidget ? "A fully customized widget which will adjust itself according to your website resolution. Just place the link and everything will work." : "A simple widget with some default styling and you will have to customize it according to your needs."}</p>
                        </div>
                        <FormGroup>
                          <ControlLabel componentClass={ControlLabel}>Showcase positive reviews on your own site</ControlLabel>
                          <FormControl
                            componentClass='input'
                            type='text'
                            value={this.state.responsiveWidget ? iframe_responsive_string : iframe_string}
                          />
                          <div className={styles.infoFieldText}>
                            <p>Copy the code above and paste it on your site</p>
                            <p>You can customize the appearance by providing these parameters: <br/>delay=5000(any time in ms), bgColor=#fff(backgound color), color=#000(primary color) ,secColor=#666(secondary color), starsColor=#ffc700(star color)</p>
                          </div>
                        </FormGroup>
                      </div>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className={styles.boxBody}>
                      <Row>
                        <Col sm={6} xs={12}>
                          <div className={cx(styles.boxBodyInner, styles.infoField)}>
                            <FieldGroup
                              componentClass='textarea'
                              onChange={this.onChangeField}
                              id="emergency"
                              type='textarea'
                              label="Emergency Contacts"
                              value={this.state['emergency'] || ''}
                              rows="4"
                            />
                            <div className={styles.infoFieldText}>
                              <p>This information will be shown to crew/drivers in case there is an issue and they are looking for emergency contacts.</p>
                            </div>
                          </div>
                        </Col>
                        <Col sm={6} xs={12}>
                          <div className={cx(styles.boxBodyInner)}>
                            <FormGroup controlId="route-display" className={cx(styles.calendarWeekWrapper)}>
                              <span className={styles.routeStart}>Route Display</span>
                              <div className={styles.selectBox}>
                                <FormControl onChange={this.changeRouteStart} componentClass="select" placeholder="select" className={styles['form-control']}>
                                  <option value="GROUP" selected={this.state.route_start && this.state.route_start.toUpperCase() === "GROUP"}>Start routes from Company or Group address</option>
                                  <option value="TASK" selected={this.state.route_start && this.state.route_start.toUpperCase() === "TASK"}>Start routes from first Task location</option>
                                </FormControl>
                              </div>
                            </FormGroup>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </div>
              <div className="text-right">
                <Button onClick={this.updateAccountDetails} disabled={this.state.savingDetails} className={cx(styles.btn, styles['btn-secondary'])}>{this.state.savingDetails ? <SavingSpinner size={8} borderStyle="none" /> : 'Save Changes'}</Button>
              </div>
            </div>) : (<SavingSpinner size={8} title="Loading" borderStyle="none"/>)}
        </Grid>
      </div>
    );
  }
}

AccountDetails.propTypes = {
  getProfileInformation: PropTypes.func.isRequired,
  getEntities: PropTypes.func.isRequired,
  updateProfileInformation: PropTypes.func.isRequired,
  pageParams: PropTypes.object,
  updateColorCallback: PropTypes.func,
  error: PropTypes.array
};
