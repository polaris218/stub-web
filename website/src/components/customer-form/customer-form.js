import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Modal,
  Button,
  FormControl,
  Row,
  Col,
  Alert,
  FormGroup,
  Radio,
  TabContainer, Nav, NavItem, TabContent, TabPane, Checkbox
} from 'react-bootstrap';
import update from 'immutability-helper';
import cx from 'classnames';
import styles from './customer-form.module.scss';
import {findDOMNode} from 'react-dom';
import {global_country} from '../globalcountryname.js';
import ExtraFields from '../task-wrapper-v2/components/instructions/extra-fields/extra-fields';
import SavingSpinner from '../saving-spinner/saving-spinner';
import Autocomplete from 'react-google-autocomplete';
import CustomerTasks from '../customer-tasks/customer-tasks';
import Phone from 'react-phone-number-input';
import { getCustomerName} from "../../helpers/task";
import { toast } from 'react-toastify';
import { getPhoneCode } from '../../helpers';

export default class CustomerForm extends Component {
  constructor(props) {
    super(props);
    this.createCustomer = this.createCustomer.bind(this);
    this.updateCustomer = this.updateCustomer.bind(this);
    this.onChangeExtraField = this.onChangeExtraField.bind(this);
    this.open = this.open.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.onChangeFields = this.onChangeFields.bind(this);
    this.onChangeNotifications = this.onChangeNotifications.bind(this);
    this.onKeyPressSearch = this.onKeyPressSearch.bind(this);
    this.doSearch = this.doSearch.bind(this);
    this.clearForm = this.clearForm.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.renderAdditionalAddresses = this.renderAdditionalAddresses.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.addAdditionalAddressClickHandler = this.addAdditionalAddressClickHandler.bind(this);
    this.renderTabsNav = this.renderTabsNav.bind(this);
    this.removeAddressTab = this.removeAddressTab.bind(this);
    this.updateAdditionalAddressAllFields = this.updateAdditionalAddressAllFields.bind(this);
    this.updateAdditionalAddressField = this.updateAdditionalAddressField.bind(this);

    this.state = {
      typed: {
        id: -1,
        first_name: ''
      },
      button: {
        text: '',
        method: null
      },
      showModal: false,
      alerts: [],
      close: this.close.bind(this),
      extra_fields: [
        {name: '', value: ''}
      ],
      notifications: {},
      customersFilter: 'group',
      group_id: null,
      activeTabKey: '1',
      additional_addresses: [],
    };
  }

  removeAlert(idx) {
    this.setState({
      alerts: this.state.alerts.filter((alert, id) => {
        return id !== idx;
      })
    });
  }

  handleFilterChange(e) {
    const value = e.target.value;
    this.setState({
      customersFilter: value
    }, () => {
      this.props.filterChangeCallback(value);
    });
  }

  addAlert(alert) {
    const alerts = this.state.alerts,
      removeAlert = this.removeAlert.bind(this);
    alert['timeout'] = function (idx) {
      setTimeout(() => {
        removeAlert(idx);
      }, 1e4);
    };
    const index = (alerts.map((alertMap) => {
      return alertMap.content;
    })).indexOf(alert.content);
    if (index === -1) {
      alerts.push(alert);
      this.setState({
        alerts
      });
    }
  }

  onChangeField(field, value) {
    this.setState({
      typed: update(this.state.typed, {
        [field]: {$set: value}
      })
    });
  }

  onChangeFields(fields) {
    for (var key in fields) {
      this.setState({
        typed: update(this.state.typed, {
          [key]: {$set: fields[key]}
        })
      });
    }
    ;
  }

  onChangeExtraField(fields) {
    this.setState({
      extra_fields: fields
    });
  }

  onChangeNotifications(name, value) {
    this.setState({
      notifications: value
    });
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

  renderTabsNav() {
    if (typeof this.state.additional_addresses !== 'undefined' && this.state.additional_addresses !== null && this.state.additional_addresses.length > 0) {
      const array = [...this.state.additional_addresses];
      const tabsNavigation = array.map((address, i) => {
        const tabTitle = (
          address.title !== '' ? address.title : ('Address ' + (i + 1))
        );
        return (
          <NavItem title={address.complete_address} eventKey={i + 1} onClick={() => this.handleTabClick(i + 1)}>
            {tabTitle}
            <span className={styles.remove} onClick={(e) => this.removeAddressTab(e, i, i + 1)}/>
          </NavItem>
        );
      });
      return tabsNavigation;
    } else {
      return;
    }
  }

  removeAddressTab(e, scope, tabIndex) {
    e.preventDefault();
    e.stopPropagation();
    let addresses_array = [...this.state.additional_addresses];
    addresses_array.splice(scope, 1);
    if (addresses_array.length === 0) {
      addresses_array = [];
    }
    this.setState({
      additional_addresses: addresses_array
    });
    const tabToActivate = tabIndex > 1 ? tabIndex - 1 : '1';
    this.handleTabClick(tabToActivate);
  }

  handleTabClick(key) {
    if (this.refs && this.refs.input) {
      this.refs.input.refs.input.value = '';
    }
    this.setState({activeTabKey: key});
  }

  updateAdditionalAddressField(e, arrayIndex) {
    const additionalAddresses = [...this.state.additional_addresses];
    additionalAddresses[arrayIndex][e.target.name] = e.target.value;
    if (e.target.name === 'address_line_1' || e.target.name === 'address_line_2' || e.target.name === 'city' ||
      e.target.name === 'state' || e.target.name === 'country' || e.target.name === 'zipcode') {
      additionalAddresses[arrayIndex]['exact_location'] = null;
    }

    this.setState({
      additionalAddresses
    })
  }

  addAdditionalAddressClickHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    const addressesLength = this.state.additional_addresses.length;
    const customer_address_component = {
      'complete_address': '',
      'title': 'Address ' + (addressesLength + 1),
      'address_line_1': '',
      'address_line_2': '',
      'city': '',
      'state': '',
      'country': '',
      'zipcode': '',
      'exact_location': null
    };
    if (this.state.additional_addresses.length < 3) {
      this.setState({
        additional_addresses: [...this.state.additional_addresses, customer_address_component]
      });
      this.renderAdditionalAddresses();
      this.handleTabClick(this.state.additional_addresses.length + 1);
    } else {
      return;
    }
  }

  updateAdditionalAddressAllFields(place, arrayIndex) {
    var address_components = place.address_components,
      street_number,
      route,
      neighborhood,
      locality,
      administrative_area_level_2,
      administrative_area_level_1,
      country,
      postal_code,
      postal_code_suffix,
      sublocality;
    if (typeof address_components != 'undefined') {
      address_components.forEach(function (item, i, address_components) {
        var item_name = item.types[0],
          item_value = item.long_name ? item.long_name : '';

        if (item.types.indexOf('sublocality') != -1) {
          item_name = 'sublocality';
        }

        switch (item_name) {
          case 'street_number':
            street_number = item_value;
            break;
          case 'route':
            route = street_number ? street_number + ' ' + item_value : item_value
            break;
          case 'neighborhood':
            neighborhood = item_value;
            break;
          case 'locality':
            locality = item_value;
            break;
          case 'sublocality':
            sublocality = item_value;
            break;
          case 'administrative_area_level_2':
            administrative_area_level_2 = item_value;
            break;
          case 'administrative_area_level_1':
            administrative_area_level_1 = item_value;
            break;
          case 'country':
            country = item_value;
            break;
          case 'postal_code':
            postal_code = item_value;
            break;
          case 'postal_code_suffix':
            postal_code_suffix = item_value;
            break;
        }
      });

      let state = administrative_area_level_1 ? administrative_area_level_1 : '',
        city = locality ? locality : '',
        country = country ? country : '',
        zip = postal_code ? postal_code : '',
        address1 = route ? route : '',
        address2 = sublocality ? sublocality : '';
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const address = place.formatted_address;

      const additionalAddresses = [...this.state.additional_addresses];
      additionalAddresses[arrayIndex]['complete_address'] = address;
      additionalAddresses[arrayIndex]['address_line_1'] = address1;
      additionalAddresses[arrayIndex]['address_line_2'] = address2;
      additionalAddresses[arrayIndex]['city'] = city;
      additionalAddresses[arrayIndex]['state'] = state;
      additionalAddresses[arrayIndex]['country'] = country;
      additionalAddresses[arrayIndex]['zipcode'] = zip;
      if (lat && lng && lat !== null && lng !== null) {
        additionalAddresses[arrayIndex]['exact_location'] = {lat, lng};
      } else {
        additionalAddresses[arrayIndex]['exact_location'] = null;
      }

      this.setState({
        additionalAddresses
      })
    }
  }

  createCustomer(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      alerts: []
    });
    const first_name = this.state.typed.first_name;
    const last_name = this.state.typed.last_name;
    const address_line_1 = this.state.typed.address_line_1;
    const company_name = this.state.typed.company_name;
    const address_line_2 = this.state.typed.address_line_2;
    const phone = this.state.typed.phone;
    const mobile_number = this.state.typed.mobile_number;
    const email = this.state.typed.email;
    const city = this.state.typed.city;
    const state = this.state.typed.state;
    const country = this.state.typed.country;
    const zipcode = this.state.typed.zipcode;
    const notes = this.state.typed.notes;


    let extra_fields = {};
    extra_fields = this.convertFieldsForStorage(this.state.extra_fields);
    extra_fields = JSON.stringify(extra_fields);

    let additional_addresses = this.state.additional_addresses;

    if (this.state.additional_addresses) {
      additional_addresses.map((address) => {
        address.complete_address = '';
      })
    }

    additional_addresses = JSON.stringify(additional_addresses);
    const notifications = JSON.stringify(this.state.notifications);
    if (typeof first_name !== 'undefined' && first_name !== '') {
      this.props.createCustomer({
        first_name, last_name,
        company_name, email,
        phone, mobile_number, notes, address_line_1,
        address_line_2, city, state,
        country, zipcode, extra_fields, notifications, additional_addresses
      });
    } else {
      const alert = {
        text: 'Customer First Name is compulsory',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(alert);
    }
  }

  renderAdditionalAddresses() {
    if (typeof this.state.additional_addresses !== 'undefined' && this.state.additional_addresses !== null && this.state.additional_addresses.length > 0) {
      const array = [...this.state.additional_addresses];

      const addressTabs = array.map((address, i) => {
        return (
          <TabPane eventKey={i + 1}>
            <Row className={styles.formRow}>
              <Col xs={12} sm={12}>
                <FormGroup className={styles.formGroup}>
                  <FormControl className={styles.formControl} onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].title} name="title" id="title" type="text" placeholder="Address Title" disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                </FormGroup>
              </Col>
              <Col xs={12} sm={6}>
                <FormGroup className={styles.formGroup}>
                  <FormControl className={styles.formControl} onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].address_line_1} name="address_line_1" id="street_number" type="text" placeholder="Address Line 1" />
                </FormGroup>
              </Col>
              <Col xs={12} sm={6}>
                <FormGroup className={styles.formGroup}>
                  <FormControl className={styles.formControl} onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].address_line_2} name="address_line_2" id="route" type="text" placeholder="Address Line 2" />
                </FormGroup>
              </Col>
              <Col xs={12} sm={6}>
                <FormGroup className={styles.formGroup}>
                  <FormControl className={styles.formControl} onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].city} name="city" id="customer_city" type="text" placeholder="Сity" />
                </FormGroup>
              </Col>
              <Col xs={12} sm={6}>
                <FormGroup className={styles.formGroup}>
                  <FormControl className={styles.formControl} onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].state} name="state" id="customer_state" type="text" placeholder="State" />
                </FormGroup>
              </Col>
              <Col xs={12} sm={6}>
                <FormGroup className={styles.formGroup}>
                  <FormControl className={styles.formControl} onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].country} name="country" id="customer_country" type="text" placeholder="Сountry" />
                </FormGroup>
              </Col>
              <Col xs={12} sm={6}>
                <FormGroup className={styles.formGroup}>
                  <FormControl className={styles.formControl} onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].zipcode} name="zipcode" id="customer_zipcode" type="text" placeholder="Zip Code" />
                </FormGroup>
              </Col>
            </Row>
          </TabPane>
        );
      });
      return addressTabs;
    } else {
      return;
    }
  }

  updateAddressFields(place) {
    if (this.state.activeTabKey !== '1') {
      this.updateAdditionalAddressAllFields(place, (this.state.activeTabKey - 1));
      return;
    }

    let address_components = place.address_components,
      street_number,
      route,
      neighborhood,
      locality,
      administrative_area_level_2,
      administrative_area_level_1,
      country_name,
      postal_code,
      postal_code_suffix,
      sublocality;
    if (address_components) {
      address_components.forEach(function (item, i, address_components) {
        let item_name = item.types[0],
          item_value = item.long_name ? item.long_name : '';

        if (item.types.indexOf('sublocality') !== -1) {
          item_name = 'sublocality';
        }

        switch (item_name) {
          case 'street_number':
            street_number = item_value;
            break;
          case 'route':
            route = street_number ? street_number + ' ' + item_value : item_value;
            break;
          case 'neighborhood':
            neighborhood = item_value;
            break;
          case 'locality':
            locality = item_value;
            break;
          case 'sublocality':
            sublocality = item_value;
            break;
          case 'administrative_area_level_2':
            administrative_area_level_2 = item_value;
            break;
          case 'administrative_area_level_1':
            administrative_area_level_1 = item_value;
            break;
          case 'country':
            country_name = item_value;
            break;
          case 'postal_code':
            postal_code = item_value;
            break;
          case 'postal_code_suffix':
            postal_code_suffix = item_value;
            break;
        }
      });

      const state = administrative_area_level_1 ? administrative_area_level_1 : '',
        city = locality ? locality : '',
        country = country_name ? country_name : '',
        zip = postal_code ? postal_code : '',
        address1 = route ? route : '',
        address2 = sublocality ? sublocality : '';

      const updated_address = {
        'address_line_1': address1,
        'address_line_2': address2,
        'city': city,
        'state': state,
        'country': country,
        'zipcode': zip,
      };

      this.onChangeFields(updated_address);
      this.refs.input.refs.input.value = '';
    } else {
      console.log('undefined');
    }
  }

  updateCustomer(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      alerts: []
    });
    const first_name = findDOMNode(this.refs.first_name).value.trim();
    const last_name = findDOMNode(this.refs.last_name).value.trim();
    const address_line_1 = findDOMNode(this.refs.address_line_1).value.trim();
    const company_name = findDOMNode(this.refs.company_name).value.trim();
    const address_line_2 = findDOMNode(this.refs.address_line_2).value.trim();
    const phone = findDOMNode(this.refs.phone).value.trim();
    const mobile_number = this.state.typed.mobile_number;
    const email = findDOMNode(this.refs.email).value.trim();
    const city = findDOMNode(this.refs.city).value.trim();
    const state = findDOMNode(this.refs.state).value.trim();
    const country = findDOMNode(this.refs.country).value.trim();
    const zipcode = findDOMNode(this.refs.zipcode).value.trim();
    const notes = findDOMNode(this.refs.notes).value.trim();
    const group_id = this.state.group_id;

    let extra_fields = {};
    extra_fields = this.convertFieldsForStorage(this.state.extra_fields);
    extra_fields = JSON.stringify(extra_fields);

    let additional_addresses = this.state.additional_addresses ? JSON.stringify(this.state.additional_addresses) : '';

    const notifications = JSON.stringify(this.state.notifications);
    if (typeof first_name !== 'undefined' && first_name !== '') {
      this.props.updateCustomer({
        id: this.state.typed.id,
        first_name,
        last_name,
        company_name,
        email,
        phone,
        mobile_number,
        notes,
        address_line_1,
        address_line_2,
        city,
        state,
        country,
        zipcode,
        extra_fields,
        notifications,
        group_id,
        additional_addresses
      });
    } else {
      const alert = {
        text: 'Customer First Name is compulsory',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(alert);
    }
  }

  edit(d) {
    let _extra_fields = [];
    if (d.extra_fields === null || d.extra_fields == void 0) {
      d.extra_fields = [];
    } else {
      _extra_fields = Object.keys(d.extra_fields).map((key) => {
        return {
          name: key,
          value: d.extra_fields[key]
        };
      });
    }


    this.setState({
      typed: d,
      extra_fields: _extra_fields,
      notifications: d.notifications,
      group_id: d.group_id,
      button: {
        text: 'Update',
        method: this.updateCustomer
      },
      showModal: true,
      additional_addresses: d.additional_addresses || [],
      activeTabKey: '1',
    });
  }

  open() {
    this.setState({
      typed: {
        id: -1
      },
      button: {
        text: 'Save Changes',
        method: this.createCustomer
      },
      notifications: {
        sms: true,
        email: true
      },
      showModal: true,
      extra_fields: [
        {name: '', value: ''}
      ],
      additional_addresses: [],
      activeTabKey: '1',
    });
  }

  close() {
    this.state.close = this.state.close.bind(this);
    this.setState({
      showModal: false,
    });
  }

  onKeyPressSearch(e) {
    if (e.key === 'Enter') {
      this.doSearch();
    }
  }

  doSearch() {
    this.props.search(findDOMNode(this.refs.search).value);
  }

  clearForm() {
    findDOMNode(this.refs.search).value = '';
    this.props.search('');
  }

  render() {
    this.can_create = false;
    if (this.props.profile && this.props.profile.permissions) {
      let permissions = this.props.profile.permissions;
      let is_company = false;
      if (permissions.includes('COMPANY')) is_company = true;
      if (is_company || permissions.includes('ADD_CUSTOMER')) this.can_create = true;
    }
    const country_options = global_country.map((data) => {
      return (<option key={'id-' + data.ISO3} value={data.ISO3}>{data.country}</option>);
    });

    const onChange = (field) => {
      return (event) => {
        this.onChangeField(field, event.target.value);
      };
    };

    let savingSpinnerTitle = '';

    if (this.props.sendingCustomer) {
      savingSpinnerTitle = 'Saving';
    } else if (this.props.updatingCustomer) {
      savingSpinnerTitle = 'Updating';
    }

    let nameToDisplay = '';

    if (this.state.typed && this.state.typed.first_name) {
      nameToDisplay = getCustomerName(this.state.typed.first_name, '');
    }

    if (this.state.typed && this.state.typed.last_name) {
      nameToDisplay = getCustomerName('', this.state.typed.last_name);
    }

    if (this.state.typed && this.state.typed.last_name && this.state.typed.first_name) {
      nameToDisplay = getCustomerName(this.state.typed.first_name, this.state.typed.last_name);
    }

    const phoneCode = getPhoneCode(this.props.companyProfile && this.props.companyProfile.country),
          crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"/></g></svg>;

    return (
      <div className={styles.customersFormWrapper}>
        <div className={cx(styles.topBar, this.props.profile && this.props.profile.group_id !== null ? styles.secondary : '')}>
          <FormGroup className={cx(styles.searchField, styles.formGroup)}>
            <FormControl className={styles.formControl} id="name" type="text" placeholder="Search" ref="search" onKeyPress={this.onKeyPressSearch}/>
            <i className={styles.clearSearch} onClick={this.clearForm}>{crossIcon}</i>
          </FormGroup>
          <div className={styles.btnWrapper}>
            {this.props.profile && this.props.profile.group_id !== null && <div className={styles.customersFilters}>
              <span>Show: </span>
              <Radio className={styles.checkBox} onClick={(e) => this.handleFilterChange(e)} name="customersFilter" value="group" checked={this.state.customersFilter === 'group'}><span>Our Customers</span></Radio>
              <Radio className={styles.checkBox} onClick={(e) => this.handleFilterChange(e)} name="customersFilter" value="all" checked={this.state.customersFilter === 'all'}><span>All Company Customers</span></Radio>
            </div>}
            {this.can_create && <button type="button" className={cx(styles.btn, styles['btn-secondary'])} onClick={this.open}>Create New Customer</button>}
          </div>
        </div>

        <Modal bsSize="large" dialogClassName={styles.modalPrimary} show={this.state.showModal} onHide={this.close.bind(this)} keyboard={false} backdrop={'static'}>
          <Modal.Header className={styles.modalHeader}>
            <Modal.Title className={styles.modalTitle}>Customer {nameToDisplay ? '(' + nameToDisplay + ')' : ''}</Modal.Title>
            <i className={styles.closeIcon} onClick={this.close.bind(this)}>{crossIcon}</i>
          </Modal.Header>
          <Modal.Body className={styles.modalBody}>
            {this.state.alerts && this.state.alerts.map((alert, idx) => {
              alert.timeout(idx);
              return (<Alert key={idx} bsStyle={alert.bsStyle}><strong>{alert.content}</strong></Alert>);
            })}
            {(this.props.sendingCustomer || this.props.updatingCustomer) && <SavingSpinner size={8} borderStyle="none" title={savingSpinnerTitle}/>}
            <Row className={cx(styles.formRow, styles.topBoxes)}>
              <Col xs={12} sm={12} md={6}>
                <div className={styles.box}>
                  <h3 className={styles.boxTitle}>Customer Details</h3>
                  <div className={styles.boxBody}>
                    <div className={styles.boxBodyInner}>
                      <Row className={styles.formRow}>
                        <Col xs={12} sm={6}>
                          <FormGroup className={styles.formGroup}>
                            <FormControl className={styles.formControl} id="first_name" type="text" placeholder="First Name" ref="first_name" onChange={onChange('first_name')} value={this.state.typed.first_name}/>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup className={styles.formGroup}>
                            <FormControl className={styles.formControl} id="last_name" type="text" placeholder="Last Name" ref="last_name" onChange={onChange('last_name')} value={this.state.typed.last_name}/>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup className={styles.formGroup}>
                            <FormControl className={styles.formControl} id="company_name" type="text" placeholder="Company Name" ref="company_name" onChange={onChange('company_name')} value={this.state.typed.company_name}/>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup className={styles.formGroup}>
                            <FormControl className={styles.formControl} id="email" type="text" placeholder="Email" ref="email" onChange={onChange('email')} value={this.state.typed.email}/>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup className={styles.formGroup}>
                            <Phone className={styles['input-phone']} id="mobile_number" country={phoneCode} placeholder="Mobile Phone Number" ref="mobile_number" onChange={phone => this.onChangeField('mobile_number', phone)} value={this.state.typed.mobile_number}/>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup className={styles.formGroup}>
                            <FormControl className={styles.formControl} id="phone" type="text" placeholder="Phone 2" ref="phone" onChange={onChange('phone')} value={this.state.typed.phone}/>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Checkbox
                              className={styles.checkBox}
                              checked={(!this.state.notifications || this.state.notifications.email === null || typeof this.state.notifications.email === 'undefined' || this.state.notifications.email === true)}
                              onChange={(e) => {this.onChangeNotifications('notifications', {email: e.target.checked, sms: (!this.state.notifications || this.state.notifications.sms === null || typeof this.state.notifications.sms === 'undefined' || this.state.notifications.sms === true)})}}>
                              <span>Email Notification</span>
                            </Checkbox>
                          </FormGroup>
                        </Col>
                        <Col xs={12} sm={6}>
                          <FormGroup>
                            <Checkbox
                              className={styles.checkBox}
                              checked={(!this.state.notifications || this.state.notifications.sms === null || typeof this.state.notifications.sms === 'undefined' || this.state.notifications.sms === true)}
                              onChange={(e) => {this.onChangeNotifications('notifications', {email: (!this.state.notifications || this.state.notifications.email === null || typeof this.state.notifications.email === 'undefined' || this.state.notifications.email === true), sms: e.target.checked})}}>
                              <span>SMS Notification</span>
                            </Checkbox>
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  </div>
                </div>
              </Col>
              <Col xs={12} sm={12} md={6}>
                <div className={styles.box}>
                  <h3 className={styles.boxTitle}>Address</h3>
                  <div className={styles.boxBody}>
                    <div className={styles.boxBodyInner}>
                      <FormGroup className={cx(styles.addressSearch, styles.formGroup)}>
                        <Autocomplete
                          onPlaceSelected={(place) => {
                            this.updateAddressFields(place);
                          }}
                          placeholder="Find address here..."
                          types={[]}
                          className={cx(styles.formControl, ['form-control'])}
                          ref="input"
                        />
                      </FormGroup>
                      <TabContainer activeKey={this.state.activeTabKey} id="tabs-with-dropdown">
                        <div>
                          <div className={styles.addressTabsListWrapper}>
                            <Nav className={styles.addressTabsList} bsStyle="tabs">
                              <NavItem title={'Primary Address'} href="javascript:void(0)" eventKey="1" onClick={(e) => this.handleTabClick('1')}>Primary Address</NavItem>
                              {this.renderTabsNav()}
                              {typeof this.state.additional_addresses !== 'undefined' && this.state.additional_addresses !== null && this.state.additional_addresses.length < 3 &&
                              <NavItem className={styles.addNewTab} href="javascript:void(0)" onClick={(e) => this.addAdditionalAddressClickHandler(e)}>+ Add New Address</NavItem>
                              }
                            </Nav>
                          </div>
                          <TabContent animation>
                            <TabPane eventKey="1">
                              <Row className={styles.formRow}>
                                <Col xs={12} sm={6}>
                                  <FormGroup className={styles.formGroup}>
                                    <FormControl className={styles.formControl} id="street_number" type="text" placeholder="Address Line 1" onChange={onChange('address_line_1')} value={this.state.typed.address_line_1} ref={'address_line_1'} />
                                  </FormGroup>
                                </Col>
                                <Col xs={12} sm={6}>
                                  <FormGroup className={styles.formGroup}>
                                    <FormControl className={styles.formControl} id="route" type="text" placeholder="Address Line 2" ref={'address_line_2'} onChange={onChange('address_line_2')} value={this.state.typed.address_line_2} />
                                  </FormGroup>
                                </Col>
                                <Col xs={12} sm={6}>
                                  <FormGroup className={styles.formGroup}>
                                    <FormControl className={styles.formControl} id="customer_city" type="text" placeholder="Сity" ref={'city'} onChange={onChange('city')} value={this.state.typed.city} />
                                  </FormGroup>
                                </Col>
                                <Col xs={12} sm={6}>
                                  <FormGroup className={styles.formGroup}>
                                    <FormControl className={styles.formControl} id="customer_state" type="text" placeholder="State" ref={'state'} onChange={onChange('state')} value={this.state.typed.state} />
                                  </FormGroup>
                                </Col>
                                <Col xs={12} sm={6}>
                                  <FormGroup className={styles.formGroup}>
                                    <FormControl className={styles.formControl} id="customer_country" type="text" placeholder="Сountry" ref={'country'} onChange={onChange('country')} value={this.state.typed.country} />
                                  </FormGroup>
                                </Col>
                                <Col xs={12} sm={6}>
                                  <FormGroup className={styles.formGroup}>
                                    <FormControl className={styles.formControl} id="customer_zipcode" type="text" placeholder="Zip Code" ref={'zipcode'} onChange={onChange('zipcode')} value={this.state.typed.zipcode} />
                                  </FormGroup>
                                </Col>
                              </Row>
                            </TabPane>
                            {this.renderAdditionalAddresses()}
                          </TabContent>
                        </div>
                      </TabContainer>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
            <div className={styles.box}>
              <h3 className={styles.boxTitle}>Instructions</h3>
              <div className={styles.boxBody}>
                <Row className={styles.formRow}>
                  <Col xs={12} sm={12} md={6}>
                    <div className={styles.boxBodyInner}>
                      <FormGroup className={styles.formGroup}>
                        <FormControl className={styles.formControl} componentClass="textarea" id="notes" placeholder="Comments" ref="notes" onChange={onChange('notes')} value={this.state.typed.notes}/>
                      </FormGroup>
                    </div>
                  </Col>
                  <Col xs={12} sm={12} md={6}>
                    <div className={styles.boxBodyInner}>
                      <ExtraFields
                        fields={this.state.extra_fields}
                        onChange={this.onChangeExtraField}
                        fullWidth
                        can_edit
                      />
                    </div>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={styles.btnWrapper}>
              <button type="button" onClick={this.state.button.method} className={cx(styles.btn, styles['btn-secondary'])}>{this.state.button.text}</button>
              <button type="button" onClick={this.close.bind(this)} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            </div>
            {this.state.typed && <div className={styles.externalInfo}>
              {this.state.typed.id && this.state.typed.id !== -1 && <div><strong>ID</strong> : {this.state.typed.id}</div>}
              {this.state.typed.external_id && <div><strong>External ID</strong> : {this.state.typed.external_id}</div>}
            </div>}
            {this.state.alerts && this.state.alerts.map((alert, idx) => {
              alert.timeout(idx);
              return (<Alert key={idx} bsStyle={alert.bsStyle}><strong>{alert.content}</strong></Alert>);
            })}
            {(this.props.sendingCustomer || this.props.updatingCustomer) && <SavingSpinner size={8} borderStyle="none" title={savingSpinnerTitle}/>}
            {this.state.typed.id !== -1 && <CustomerTasks customer_id={this.state.typed.id}/>}
          </Modal.Body>
        </Modal>
      </div>);
  }
}
CustomerForm.propTypes = {
  createCustomer: PropTypes.func.isRequired,
  updateCustomer: PropTypes.func.isRequired,
  updatingCustomer: PropTypes.bool.isRequired,
  sendingCustomer: PropTypes.bool.isRequired
};
