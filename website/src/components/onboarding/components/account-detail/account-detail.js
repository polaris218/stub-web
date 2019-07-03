import React, { Component } from 'react';
import styles from './account-detail.module.scss';
import cx from 'classnames';
import { Row, Col, FormGroup, FormControl, ControlLabel, Dropdown, MenuItem, Form } from 'react-bootstrap';
import Autocomplete from 'react-google-autocomplete';
import Select from 'react-select';
import $ from "jquery";
import { getTimezoneOptions } from '../../../../helpers';
import companyTypes from '../../../../helpers/company_types';
import { findDOMNode } from 'react-dom';
import { global_country } from '../../../globalcountryname';
import PropTypes from 'prop-types';
import { toast } from 'react-toastify';
import moment from 'moment';
import Phone from 'react-phone-number-input';

export default class AccountDetails extends Component {

  static propTypes = {
    updateProfileInformation: PropTypes.func.isRequired,
    profile:  PropTypes.object,
  };


  constructor(props, context) {
    super(props, context);

    this.renderCompanyTypeList = this.renderCompanyTypeList.bind(this);
    this.changeCompanyType = this.changeCompanyType.bind(this);
    this.handleGroupTimezoneChange = this.handleGroupTimezoneChange.bind(this);
    this.populateTimezonesOptions = this.populateTimezonesOptions.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
    this.updateAccountDetails = this.updateAccountDetails.bind(this);
    this.onPhoneFieldChange = this.onPhoneFieldChange.bind(this);

    this.state = {
      form: {
        fullname: this.props.profile && this.props.profile.fullname || '',
        address: this.props.profile && this.props.profile.address || '',
        company_type: this.props.profile && this.props.profile.company_type || 'SERVICE',
        timezone: this.props.profile && this.props.profile.timezone || moment.tz.guess(),
        mobile_number: this.props.profile && this.props.profile.mobile_number || '',
        intro: this.props.profile && this.props.profile.intro || '',
        support_email: this.props.profile && this.props.profile.support_email || '',
      },
      timezonesOptions: [],
    }
  }

  componentWillMount() {
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

  renderCompanyTypeList(list) {
    const item = list.find((itemC) => itemC.value === this.state.form.company_type) || list[0];
    return (
      <Dropdown id={item.value} name="company_type" className={styles['user-plan']} onSelect={this.changeCompanyType}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
            <span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
            <small className={styles['user-plan-calls']}>{item.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            return (
              <MenuItem className={styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value}>
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

    let { form } = this.state;
    form["address"] = address;
    form["country"] = country;
    form["exact_location"] = lat + "," + lng;
    $(findDOMNode(this.refs.address)).val(address);
    $(findDOMNode(this.refs.country)).val(country);
    this.setState({ form });
  }

  changeCompanyType(value) {
    let form = this.state.form;
    form['company_type'] = value;
    this.setState({ form });
  }

  handleGroupTimezoneChange(timezone) {
    let form = this.state.form;
    form.timezone = timezone.value;
    this.setState({ form });
  }

  onFieldChange(e) {
    let { form } = this.state;
    form[e.target.name] = e.target.value;
    this.setState({ form });
  }

  onPhoneFieldChange(value) {
    let { form } = this.state;
    form['mobile_number'] = value;
    this.setState({ form });
  }

  updateAccountDetails() {
    const { address, timezone, mobile_number, support_email } = this.state.form;
    let errorFieldsNames = [];
    let error = '';
    const fieldsNames = [{
      key: address.trim() ? true : false,
      name: 'Address'
    }, {
      key: timezone ? true : false,
      name: 'Timezone'
    },{
      key: mobile_number ? true : false,
      name: 'Phone'
    },{
       key: support_email ? true : false,
       name: 'Email'
    },
    ];

    if (!address.trim() || !timezone || !mobile_number || !support_email) {
      fieldsNames.map((obj)=>{
        if(!obj.key){
          errorFieldsNames.push(obj.name);
        }
      });

      if (errorFieldsNames.length === 2) {
        error = errorFieldsNames[0] + ' and ' + errorFieldsNames[1];
      } else if(errorFieldsNames.length > 2) {
        error = errorFieldsNames[0] + ', ' + errorFieldsNames[1] + ' and ' + errorFieldsNames[2];
      } else {
        error = errorFieldsNames;
      }

      const alert = {
        text: error + ' is required',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastNotification(alert);
      return;
    }
    this.props.updateProfileInformation(this.state.form);
  }

  render() {
    const country_options = global_country.map((data) => {
      return (<option key={'id-' + data.ISO2} value={data.ISO2}>{data.country}</option>);
    });

    return (
      <div>
        <div className={cx(styles['title-bar'])}>
          <h2>Configuration</h2>
        </div>
        <div className={cx(styles.inner)}>
          <div className={cx(styles.box)}>
            <div className={cx(styles['box-body'])}>
              <p>This information will help configure Arrivy for your business. Please add additional information in the "Account Details" and "Basic Settings" Settings pages.</p>
              <Form onSubmit={this.updateAccountDetails}>
                <Row className={cx(styles['field-row'])}>
                  <Col xs={12}>
                    <FormGroup>
                      <ControlLabel>Business Name</ControlLabel>
                      <FormControl name="fullname" value={this.state.form.fullname} onChange={this.onFieldChange} />
                    </FormGroup>
                    <FormGroup className={styles.addressField}>
                      <ControlLabel>Address</ControlLabel>
                      <Autocomplete
                        onPlaceSelected={(place) => {
                          this.updateAddress(place);
                        }}
                        placeholder="Find address here..."
                        types={[]}
                        ref="address"
                        name="address"
                        onChange={this.onFieldChange}
                        value={this.state.form.address}
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6}>
                    <FormGroup>
                      <ControlLabel>Business Type</ControlLabel>
                      {this.renderCompanyTypeList(companyTypes)}
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6}>
                    <FormGroup>
                      <ControlLabel>Time Zone</ControlLabel>
                      <Select
                        onChange={this.handleGroupTimezoneChange}
                        isMulti={false}
                        placeholder={'Select group timezone...'}
                        options={this.state.timezonesOptions}
                        value={this.state.timezonesOptions.find((el) => { return el.value === this.state.form.timezone; })}
                        isSearchable
                        className={styles.timeZoneSelect}
                        classNamePrefix="selectInner"
                      />
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6}>
                    <FormGroup>
                      <ControlLabel>Email</ControlLabel>
                      <FormControl placeholder={'Email'} name="support_email" type="email" value={this.state.form.support_email} disabled={this.props.profile && this.props.profile.support_email ? true: false} onChange={this.props.profile && this.props.profile.support_email ? () => {return } : this.onFieldChange}/>
                    </FormGroup>
                  </Col>
                  <Col xs={12} sm={6}>
                    <FormGroup >
                      <ControlLabel>Phone</ControlLabel>
                      <Phone country="US"  className={styles['input-phone']} name="mobile_number" value={this.state.form.mobile_number} disabled={this.props.profile && this.props.profile.mobile_number ? true : false} placeholder="Mobile Phone Number" onChange={this.props.profile && this.props.profile.mobile_number ? () => {return } : (e)=> this.onPhoneFieldChange(e)} />
                    </FormGroup>
                  </Col>
                  <Col xs={12}>
                    <FormGroup>
                      <ControlLabel>Intro</ControlLabel>
                      <FormControl placeholder='Optional' name="intro" value={this.state.form.intro}  onChange={this.onFieldChange} />
                    </FormGroup>
                    <FormGroup className="hidden">
                      <ControlLabel>Country</ControlLabel>
                      <div className={cx(styles.selectBox)}>
                        <FormControl name="country" ref="country" componentClass="select" placeholder="Country" onChange={this.onFieldChange} value={this.state.form.country}>
                          <option default>--Select Country--</option>
                          {country_options}
                        </FormControl>
                      </div>
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
