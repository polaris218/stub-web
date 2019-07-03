import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { isValidUrl } from '../../helpers/url';
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
import NotificationManager from '../notification-manager/notification-manager';
import SavingSpinner from '../saving-spinner/saving-spinner';
import company_types from '../../helpers/company_types';
import Autocomplete from 'react-google-autocomplete';
import { ColorField } from '../fields';
import { getErrorMessage } from '../../helpers/task';
import Select from 'react-select';
import moment from 'moment-timezone';
import { getTimezoneOptions } from '../../helpers';
import { toast } from 'react-toastify';

const FieldGroup = ({id, label, staticField, fieldInfo, ...props}) => (
  <FormGroup controlId={id} className={styles['form-group-field']}>
    <Col className="text-uppercase" componentClass={ControlLabel} lg={2} md={3} sm={3}>
      {label}
    </Col>
    <Col lg={10} md={9} sm={9}>
      {staticField ?
        (<FormControl.Static>
          {props.value}
        </FormControl.Static>) :
        (<FormControl {...props} />)
      }
      <i>{fieldInfo}</i>
    </Col>
  </FormGroup>
);

export default class AccountDetails extends Component {
  constructor(props) {
    super(props);
    this.updateAccountDetails = this.updateAccountDetails.bind(this);
    this.changeCompanyType = this.changeCompanyType.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.onProfileColorChange = this.onProfileColorChange.bind(this);
    this.changeProtocol = this.changeProtocol.bind(this);
    this.populateTimezonesOptions = this.populateTimezonesOptions.bind(this);
    this.onChangeCompanyTimezone = this.onChangeCompanyTimezone.bind(this);
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
      timezonesOptions: []
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

  updateAddress (place) {
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
    this.state.exact_location = lat + "," + lng;
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
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  getAccountDetails() {
    this.props.getEntities().then((data) => {
      this.setState({teamMembers: JSON.parse(data).length});
    });

    this.props.getProfileInformation(true).then((data) => {
      const profile = JSON.parse(data);
      let {
        created, address, country, mobile_number, phone, support_email, fullname, email, intro, details, emergency, image_path,
        image_id, plan_id, company_type, social_links, website, owner_url, reminder_notification_time,
        billing_type, billing_info, billing_id, trial_expiration_date, next_charge, discount, color, timezone
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

      var trialExpirationDate = new Date(trial_expiration_date);
      var today = new Date();
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
        payment_amount: 20,
        loaded: true,
        color,
        timezone
      });
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
    this.setState({company_types, detailsNotifications: []});
  }

  updateAccountDetails(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({savingDetails: true});
    let {address, country, mobile_number, phone, support_email, fullname, intro, details, emergency, company_types, facebook, yelp, angieslist, google, thumbtack, reminder_notifications, website, color, timezone} = this.state;
    if (facebook && facebook !== null && facebook.length > 0 && !isValidUrl({ exact: true, strict: false }).test(facebook)) {
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
    } else if (google && google !== null && google.length > 0 && !isValidUrl({ exact: true, strict: false }).test(google)) {
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
    } else if (angieslist && angieslist !== null && angieslist.length > 0 && !isValidUrl({ exact: true, strict: false }).test(angieslist)) {
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
    } else if (thumbtack && thumbtack !== null && thumbtack.length > 0 && !isValidUrl({ exact: true, strict: false }).test(thumbtack)) {
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
    } else if (website && website !== null && website.length > 0 && !isValidUrl({ exact: true, strict: false }).test(website)) {
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

      const social_links = JSON.stringify({
        facebook: facebook,
        yelp: yelp,
        angieslist: angieslist,
        google: google,
        thumbtack: thumbtack
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
        timezone
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
              <MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.value}
                        ref={itemC.value} eventKey={itemC.value} href="javascript:void(0)">
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

  render() {
    const current_notification = this.state.detailsNotifications;
    const iframe_string = '<iframe src="http://'  + location.host + '/reviews/widget/' + this.state.owner_url + '?delay=5000" />';

    return (
      <div className={styles['account-details']}>
        <Grid>

          <Link className={`pull-right ${styles['profile-link']}`}
                to={`/profile/${this.state.owner_url}`}>View profile visible to customers</Link>
          <h2 className={styles["header"]}>Account Details</h2>
          <NotificationManager notifications={current_notification}/>
          {this.state.loaded ? (
            <Form horizontal className={styles["account-form"] + " custom-form"} onSubmit={this.updateAccountDetails}>
              <Row className="form-group">
                <Col md={6}>
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="fullname"
                    type='text'
                    label="Full Name"
                    value={this.state["fullname"] || ''}
                    fieldInfo='Typically business name'
                  />
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="intro"
                    type='text'
                    label="intro"
                    value={this.state["intro"] || ''}
                    fieldInfo="Use your company's one-liner e.g. Best Moving company in Seattle. This will be shown on each appointment screen."
                  />
                </Col>
                <Col md={6}>
                  <FormGroup controlId="user-plan">
                    <Col className="text-uppercase" componentClass={ControlLabel} lg={2} md={3} sm={3}>
                      Business
                    </Col>
                    <Col lg={10} md={9} sm={9}>
                      {this.renderCompanyTypeDropdownList(company_types)}
                    </Col>
                  </FormGroup>
                  <FormGroup controlId="user-plan">
                    <Col className="text-uppercase" componentClass={ControlLabel} lg={2} md={3} sm={3}>
                      Default Color
                    </Col>
                    <Col lg={10} md={9} sm={9} className={styles.profileColorField}>
                      <FieldGroup
                        componentClass={ColorField}
                        onChange={this.onProfileColorChange}
                        id="color"
                        value={this.state["color"] || '#0693e3'}
                        fieldInfo="All emails to customers use this default color."
                      />
                    </Col>
                  </FormGroup>
                </Col>
                <Col md={12}>
                  <FormGroup controlId="details">
                    <Col className="text-uppercase" componentClass={ControlLabel} lg={1} md={1} sm={3}>
                      Details
                    </Col>
                    <Col lg={11} md={11} sm={9}>
                      <FormControl
                        componentClass='textarea'
                        type='text'
                        value={this.state["details"] || ''}
                        onChange={this.onChangeField}
                        rows="7"/>
                    </Col>
                  </FormGroup>
                </Col>
              </Row>
              <Row className={styles["invert-colors"]}>
                <Col md={6}>
                  <FieldGroup
                    componentClass='input'
                    staticField={true}
                    onChange={this.onChangeField}
                    id="email"
                    type='text'
                    label="email"
                    value={this.state["email"] || ''}
                  />
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="support_email"
                    type='email'
                    label="Support Email"
                    value={this.state["support_email"] || ''}
                    fieldInfo='Use your customer support/customer service email address. Customers will reach out to you at this email address in case they have any questions or comments.'
                  />
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="mobile_number"
                    type='tel'
                    label="primary phone"
                    value={this.state["mobile_number"] || ''}
                  />
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="phone"
                    type='tel'
                    label="secondary phone"
                    value={this.state["phone"] || ''}
                  />
                </Col>
                <Col md={6}>
                  <FieldGroup
                    componentClass={Autocomplete}
                    onChange={this.onChangeField}
                    onPlaceSelected={(place) => {
                      this.updateAddress(place);
                    }}
                    id="address"
                    type='text'
                    types={['geocode']}
                    label="Complete Address"
                    value={this.state["address"] || ''}
                  />
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="country"
                    type='text'
                    label="Country"
                    value={this.state["country"] || ''}
                  />
                  <div className='form-group'>
                    <Col className="text-uppercase" componentClass={ControlLabel} lg={2} md={3} sm={3}>
                      Company Timezone
                    </Col>
                    <Col lg={10} md={9} sm={9}>
                      <Select
                        onChange={this.onChangeCompanyTimezone}
                        id='timezones'
                        isMulti={false}
                        placeholder={'Select company timezone...'}
                        options={this.state.timezonesOptions}
                        value={this.state.timezonesOptions.find((el) => { return el.value === this.state.timezone; })}
                        isSearchable
                      />
                    </Col>
                  </div>
                  <FieldGroup
                    componentClass='textarea'
                    onChange={this.onChangeField}
                    id="emergency"
                    type='textarea'
                    label="Emergency Contacts"
                    value={this.state["emergency"] || ''}
                    rows="4"
                    fieldInfo='This information will be shown to crew/drivers in case there is an issue and they are looking for emergency contacts.'
                  />
                </Col>
              </Row>
              <Row className="form-group">
                <Col md={6}>
                  <FormGroup>
                    <Col componentClass={ControlLabel} lg={2} md={3} sm={3}>
                      Website
                    </Col>
                    <Col lg={10} md={9} sm={9}>
                      <InputGroup>
                         <DropdownButton
                           componentClass={InputGroup.Button}
                           id="input-dropdown-addon"
                           title={this.state.protocol}
                           onSelect={this.changeProtocol}
                        >
                           <MenuItem key="https" eventKey="https" href="javascript:void(0)">https</MenuItem>
                           <MenuItem key="http" eventKey="http" href="javascript:void(0)">http</MenuItem>
                        </DropdownButton>
                        <FormControl type="text" onChange={this.onChangeField} id="website" value={ this.state['website'] || '' }/>
                      </InputGroup>
                    </Col>
                  </FormGroup>
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="yelp"
                    type='text'
                    label="Yelp"
                    value={this.state["yelp"] || ''}
                  />
                </Col>
                <Col md={6}>
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="facebook"
                    type='text'
                    label="Facebook"
                    value={this.state["facebook"] || ''}
                  />
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="angieslist"
                    type='text'
                    label="Angie's List"
                    value={this.state["angieslist"] || ''}
                  />
                </Col>
                <Col md={6}>
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="google"
                    type='text'
                    label="Google"
                    value={this.state["google"] || ''}
                  />
                </Col>
                <Col md={6}>
                  <FieldGroup
                    componentClass='input'
                    onChange={this.onChangeField}
                    id="thumbtack"
                    type='text'
                    label="Thumbtack"
                    value={this.state["thumbtack"] || ''}
                  />
                </Col>
              </Row>
              <Row>
                <Col md={12}>
                  <FormGroup>
                    <Col className="text-uppercase" componentClass={ControlLabel} lg={3} md={3} sm={4}>
                      Showcase positive reviews on your own site
                    </Col>
                    <Col lg={9} md={9} sm={8}>
                      <FormControl
                        componentClass='input'
                        type='text'
                        value={iframe_string}
                        />
                      <p>Copy the code above and paste it on your site</p>
                      <i>You can customize the appearance by providing these parameters: <br/>delay=5000(any time in ms), bgColor=#fff(backgound color), color=#000(primary color) ,secColor=#666(secondary color), starsColor=#ffc700(star color)</i>
                    </Col>
                  </FormGroup>
                </Col>
              </Row>
              <Row className="form-group">
                <Col sm={6}>
                  {this.state.savingDetails &&
                  <SavingSpinner title="Saving Changes"/>
                  }
                </Col>
                <Col sm={6}>
                  <Button type="submit" className="pull-right btn-submit">
                    Save Changes
                  </Button>
                </Col>
              </Row>
            </Form>) : (<SavingSpinner size={8} title="Loading" borderStyle="none" />)}
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
