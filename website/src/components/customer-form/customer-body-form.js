import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormGroup, Button, FormControl, InputGroup, Row, Col, TabPane, TabContent, TabContainer, Nav, NavItem, } from 'react-bootstrap';
import { Typeahead } from 'react-bootstrap-typeahead';
import styles from './customer-form.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import Autocomplete from 'react-google-autocomplete';
import Phone from 'react-phone-number-input';
import 'react-phone-number-input/rrui.css';
import 'react-phone-number-input/style.css';
import cx from 'classnames';
import { getErrorMessage, getCustomerName } from '../../helpers/task';

export default class CustomerFormBody extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.createCustomer = this.createCustomer.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.addAdditioanlAddressClickHandler = this.addAdditioanlAddressClickHandler.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.renderAdditioanlAddresses = this.renderAdditioanlAddresses.bind(this);
    this.removeAddressTab = this.removeAddressTab.bind(this);
    this.renderTabsNav = this.renderTabsNav.bind(this);
    this.updateAdditionalAddressField = this.updateAdditionalAddressField.bind(this);
    this.updateAdditionalAddressAllFields = this.updateAdditionalAddressAllFields.bind(this);

    this.state = {
      customers: [],
      error: null,
      sendingCustomer: false,
      emptyLabel: 'Please enter at least 3 characters',
      additional_addresses: this.props.additional_addresses !== null ? this.props.additional_addresses : [],
      activeTabKey: '1'
    };
  }

  componentDidMount() {
    this.getCustomers(true);
  }

  componentWillUnmount() {
    if (this.timeoutID) {
      clearTimeout(this.timeoutID);
    }
    if (this.customerTimeoutID) {
      clearTimeout(this.timeoutID);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      additional_addresses: nextProps.additional_addresses !== null ? nextProps.additional_addresses : [],
    });
    if (typeof nextProps === "undefined" || !nextProps.additional_addresses || nextProps.additional_addresses.length === 0 ) {
     this.handleTabClick('1');
    }
  }

  onChange(name, value) {
    this.props.onSinglePropertyChange(name, value);
    if (name === 'customer_address_line_1' || name === 'customer_address_line_2' || name === 'customer_city' ||
        name === 'customer_state' || name === 'customer_country' || name === 'customer_zipcode') {
      this.props.onSinglePropertyChange('customer_exact_location', null);
      this.props.onSinglePropertyChange('complete_address', '');
    }
  }


  getCustomers(resetTimeout) {
    if (resetTimeout && this.timeoutID) {
      clearTimeout(this.timeoutID);
    }
    this.props.getCustomers().then((res) => {
      this.setState({ customers: JSON.parse(res) });
      this.timeoutID = setTimeout(() => { this.getCustomers(); }, 6e6);
    });
  }

  handleTabClick(key) {
    this.setState({ activeTabKey: key });
  }

  addAdditioanlAddressClickHandler(e) {
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
      }, () => { this.props.additionalAddressesUpdateCallback(this.state.additional_addresses); });
      this.renderAdditioanlAddresses();
      this.handleTabClick(this.state.additional_addresses.length + 1);
    } else {
      return;
    }
  }

  updateAdditionalAddressField(e, arrayIndex) {
    const additionalAddresses = [...this.state.additional_addresses];
    additionalAddresses[arrayIndex][e.target.name] = e.target.value;
    if (e.target.name === 'address_line_1' || e.target.name === 'address_line_2' || e.target.name === 'city' ||
        e.target.name === 'state' || e.target.name === 'country' || e.target.name === 'zipcode') {
      additionalAddresses[arrayIndex]['exact_location'] = null;
    }
    this.props.additionalAddressesUpdateCallback(additionalAddresses);
  }

  updateAdditionalAddressAllFields(place, arrayIndex) {
    let country = ''
      , address1 = ''
      , address2 = ''
      , zip = ''
      , city = ''
      , state = ''
      , address = '';
    place.address_components.forEach(function (item) {
      const item_name = item.types[0];
      switch (item_name) {
        case 'country':
          country = item.long_name;
          break;
        case 'street_number':
          address1 = item.long_name;
          break;
        case 'route':
          address2 = item.long_name;
          break;
        case 'postal_code':
          zip = item.long_name;
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
    address = place.formatted_address;

    const additionalAddresses = [...this.state.additional_addresses];
    additionalAddresses[arrayIndex]['complete_address'] = address;
    additionalAddresses[arrayIndex]['address_line_1'] = address1 + ' ' + address2;
    additionalAddresses[arrayIndex]['city'] = city;
    additionalAddresses[arrayIndex]['state'] = state;
    additionalAddresses[arrayIndex]['country'] = country;
    additionalAddresses[arrayIndex]['zipcode'] = zip;
    if (lat && lng && lat !== null && lng !== null) {
      additionalAddresses[arrayIndex]['exact_location'] = { lat, lng };
    } else {
      additionalAddresses[arrayIndex]['exact_location'] = null;
    }

    this.props.additionalAddressesUpdateCallback(additionalAddresses);
  }

  removeAddressTab(e, scope, tabIndex) {
    e.preventDefault();
    e.stopPropagation();
    let addresses_array = [...this.state.additional_addresses];
    addresses_array.splice(scope, 1);
    if (addresses_array.length === 0) {
      addresses_array = null;
    }
    this.props.additionalAddressesUpdateCallback(addresses_array);
    this.setState({
      additional_addresses: addresses_array
    });
    const tabToActivate = tabIndex > 2 ? tabIndex - 1 : '1';
    this.handleTabClick(tabToActivate);
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
            {tabTitle} {this.props.canViewTaskFullDetails && this.props.canEdit && <span className={styles.removeTabBtn}><Button onClick={(e) => this.removeAddressTab(e, i, i + 1)}>X</Button></span>}
          </NavItem>
        );
      });
      return tabsNavigation;
    } else {
      return;
    }
  }

  renderAdditioanlAddresses() {
    if (typeof this.state.additional_addresses !== 'undefined' && this.state.additional_addresses !== null && this.state.additional_addresses.length > 0) {
      const array = [...this.state.additional_addresses];
      const addressTabs = array.map((address, i) => {
        return (
          <TabPane eventKey={i + 1}>
            <FormGroup>
              <InputGroup className={styles['full-width']}>
                <FormControl onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].title} name="title" id="title" type="text" placeholder="Address Title"
                             disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                {this.props.canViewTaskFullDetails && this.props.canEdit && <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>}
                {this.props.canViewTaskFullDetails && this.props.canEdit && <Autocomplete
                  onPlaceSelected={(place) => {
                    this.updateAdditionalAddressAllFields(place, i);
                  }}
                  placeholder="Find address here..."
                  types={['geocode']}
                  className="form-control"
                />}
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className={styles['full-width']}>
                <FormControl onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].address_line_1} name="address_line_1" id="street_number" type="text" placeholder="Address Line 1"
                             disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>
                <FormControl onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].address_line_2} name="address_line_2" id="route" type="text" placeholder="Address Line 2"
                             disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className={styles['full-width']}>
                <FormControl onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].city} name="city" id="customer_city" type="text" placeholder="Сity"
                             disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>
                <FormControl onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].state} name="state" id="customer_state" type="text" placeholder="State"
                             disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
              </InputGroup>
            </FormGroup>
            <FormGroup>
              <InputGroup className={styles['full-width']}>
                <FormControl onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].country} name="country" id="customer_country" type="text" placeholder="Сountry"
                             disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>
                <FormControl onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].zipcode} name="zipcode" id="customer_zipcode" type="text" placeholder="Zip Code"
                             disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
              </InputGroup>
            </FormGroup>
          </TabPane>
        );
      });
      return addressTabs;
    } else {
      return;
    }
  }


  updateAddress(place) {
    let address_components = place.address_components,
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

    if (this.customerTimeoutID) {
      clearTimeout(this.timeoutID);
    }
    if (typeof address_components !== 'undefined') {
      address_components.forEach(function (item, i, address_components) {
        let item_name = item.types[0];
        let item_value = item.long_name;

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

      const state = typeof administrative_area_level_1 !== 'undefined' ? administrative_area_level_1 : '';
      const updatedCity = typeof locality !== 'undefined' ? locality : '';
      const updatedCountry = typeof country !== 'undefined' ? country : '';
      const updateZip = typeof postal_code !== 'undefined' ? postal_code : '';
      const updatedAddress1 = typeof route !== 'undefined' ? route : '';
      const updatedAddress2 = typeof sublocality !== 'undefined' ? sublocality : '';

      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();

      const updated_address = {
        'customer_address_line_1': updatedAddress1,
        'customer_address_line_2': updatedAddress2,
        'customer_city': updatedCity,
        'customer_state': state,
        'customer_country': updatedCountry,
        'customer_zipcode': updateZip,
        'customer_exact_location': { lat, lng }
      };

      if (this.props.onCustomerChange) {
        this.customerTimeoutID = setTimeout(() => {
          this.props.onCustomerChange(updated_address);
        });
      }
    } else {
      console.log('undefined');
    }
  }

  updateCustomer(customer) {
    if (this.customerTimeoutID) {
      clearTimeout(this.timeoutID);
    }

    const updated_customer = {
      'customer_first_name': customer.first_name,
      'customer_last_name': customer.last_name,
      'customer_email': customer.email,
      'customer_company_name': customer.company_name,
      'customer_address_line_1': customer.address_line_1,
      'customer_address_line_2': customer.address_line_2,
      'customer_city': customer.city,
      'customer_state': customer.state,
      'customer_country': customer.country,
      'customer_zipcode': customer.zipcode,
      'customer_phone': customer.phone,
      'customer_mobile_number': customer.mobile_number,
      'customer_id': customer.id,
      'customer_exact_location': customer.exact_location,
    };

    if (this.props.onCustomerChange) {
      this.customerTimeoutID = setTimeout(() => {
        this.props.onCustomerChange(updated_customer);
      });
    }
  }

  createCustomer() {
    this.setState({ sendingCustomer: true });
    const updated_customer = {
      'first_name': this.props.customer_first_name,
      'last_name': this.props.customer_last_name,
      'email': this.props.customer_email,
      'company_name': this.props.customer_company_name,
      'address_line_1': this.props.customer_address_line_1,
      'address_line_2': this.props.customer_address_line_2,
      'city': this.props.customer_city,
      'state': this.props.customer_state,
      'country': this.props.customer_country,
      'zipcode': this.props.customer_zipcode,
      'phone': this.props.customer_phone,
      'customer_mobile_number': this.props.customer_mobile_number
    };

    this.props.createCustomer(updated_customer).then(() => {
      this.setState({ sendingCustomer: false });
      this.getCustomers(true);
    }).catch((e) => {
      const error = JSON.parse(e.responseText);
      let errorMsg = getErrorMessage(error);

      this.setState({ error: errorMsg, sendingCustomer: false });
    });
  }

  handleChange(items) {
    const customer = items[0];
    const foundCustomer = this.state.customers.find((c) => {
      return customer && customer.id === c.id;
    });
    if(typeof foundCustomer !== "undefined") {
      this.updateCustomer(foundCustomer);
    }
  }

  handleInputChange(inputValue) {
    if (inputValue.length >= 3) {
      this.setState({ emptyLabel: 'Searching...' });
      this.props.searchCustomers(inputValue).then((res) => {
        this.setState({ customers: JSON.parse(res) });
        this.setState({ emptyLabel: 'No matches found' });
      });
    } else if (inputValue.length) {
        this.setState({ emptyLabel: 'Please enter at least 3 characters' });
    } else {
        this.props.getCustomers().then((res) => this.setState({ customers: JSON.parse(res) }));
    }
  }

  render() {
    const { className } = this.props,
      { customer_first_name, customer_last_name, customer_address_line_1, customer_address_line_2,
        customer_company_name, customer_city, customer_state, customer_country, customer_zipcode, customer_phone, customer_mobile_number, customer_email } = this.props,
      onChange = (name) => {
        return (event) => {
          this.onChange(name, event.target.value);
        };
      };

    const options = [];
    this.state.customers.forEach((c) => {
      const option = { label: `${getCustomerName(c.first_name,c.last_name)} (${c.company_name})`, id: c.id, address: c.address };
      options.push(option);
    });

    const primaryAddressToolTip = (
      customer_address_line_1 + ' ' + customer_city + ' ' + customer_state + ' ' + customer_country + ' ' + customer_zipcode
    );

    let disableMobileInput = '';
    if (!this.props.canEdit) {
      disableMobileInput = styles.mobileInput;
    }

    return (
      <fieldset className={[className, styles['customer-details']].join(' ')}>
        <legend className={styles['form-legend']}>
          Customer Details
        </legend>
        <Row>
          <Col md={6} sm={12}>
            { this.props.canViewTaskFullDetails && this.props.canEdit &&
            <FormGroup>
              <Typeahead id="customer-name" ref="customerName" placeholder="Search Existing Customer (at least 3 characters required)"
                onChange={this.handleChange} onInputChange={this.handleInputChange} emptyLabel={this.state.emptyLabel}
                options={options} value={this.state.inputValue} filterBy={() => true}
              />
            </FormGroup>}
            <FormGroup>
              <InputGroup className={styles['full-width']}>
                <FormControl id="first-name" type="text" placeholder="First Name" onChange={onChange('customer_first_name')} value={customer_first_name}
                             disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>
                <FormControl id="last-name" type="text" placeholder="Last Name" onChange={onChange('customer_last_name')} value={customer_last_name}
                             disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
              </InputGroup>
            </FormGroup>
            <InputGroup className={styles['full-width']}>
              <FormControl id="company-name" type="text" placeholder="Company Name" onChange={onChange('customer_company_name')} value={customer_company_name}
                           disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
              {this.props.canViewTaskFullDetails && <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>}
              {this.props.canViewTaskFullDetails && <FormControl id="email" type="email" placeholder="Email" onChange={onChange('customer_email')} value={customer_email} disabled={!this.props.canEdit}/>}
            </InputGroup>
            {this.props.canViewTaskFullDetails && <InputGroup className={cx(styles['full-width'], styles['customPhoneFieldContainer'])}>
              <Row>
                <Col md={6} className={disableMobileInput}>
                  <Phone id="mobile_number" country="US" className={cx('form-control')} placeholder="Mobile Phone Number" ref="mobile_number"
                         onChange={phone => this.onChange('customer_mobile_number', phone)} value={customer_mobile_number} disabled={!this.props.canEdit}/>
                </Col>
                <Col md={6}>
                  <FormControl id="phone" type="text" placeholder="Phone 2" onChange={onChange('customer_phone')} value={customer_phone} disabled={!this.props.canEdit}/>
                </Col>
              </Row>
            </InputGroup>}
          </Col>
          <Col md={6} sm={12}>
            <TabContainer className={styles.additionalAddressesTabs} activeKey={this.state.activeTabKey} id="tabs-with-dropdown">
              <Row>
                <Col sm={12}>
                  <Nav className={styles.addressTabsNavigation} bsStyle="tabs">
                    <NavItem title={primaryAddressToolTip} className={styles.primaryAddressNavItem} eventKey="1" onClick={(e) => this.handleTabClick('1')}>
                      Primary Address
                    </NavItem>
                    {this.renderTabsNav()}
                    {typeof this.state.additional_addresses !== 'undefined' && this.state.additional_addresses !== null && this.state.additional_addresses.length < 3 &&
                    this.props.canEdit &&
                      <NavItem className={styles.addNewAddressTabbedBtn} onClick={(e) => this.addAdditioanlAddressClickHandler(e)}>
                        +
                      </NavItem>
                    }
                  </Nav>
                </Col>
                <Col md={12}>
                  <TabContent animation>
                    <TabPane eventKey="1">
                      {this.props.canViewTaskFullDetails && this.props.canEdit && <div id="locationField">
                        <Autocomplete
                          onPlaceSelected={(place) => {
                            this.updateAddress(place);
                          }}
                          placeholder="Find address here..."
                          types={[]}
                        />
                      </div>
                      }

                      <FormGroup>
                        <InputGroup className={styles['full-width']}>
                          <FormControl id="street_number" type="text" placeholder="Address Line 1" onChange={onChange('customer_address_line_1')} value={customer_address_line_1}
                                       disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                          <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>
                          <FormControl id="route" type="text" placeholder="Address Line 2" onChange={onChange('customer_address_line_2')} value={customer_address_line_2}
                                       disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                        </InputGroup>
                      </FormGroup>
                      <FormGroup>
                        <InputGroup className={styles['full-width']}>
                          <FormControl id="customer_city" type="text" placeholder="Сity" onChange={onChange('customer_city')} value={customer_city}
                                       disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                          <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>
                          <FormControl id="customer_state" type="text" placeholder="State" onChange={onChange('customer_state')} value={customer_state}
                                       disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                        </InputGroup>
                      </FormGroup>
                      <FormGroup>
                        <InputGroup className={styles['full-width']}>
                          <FormControl id="customer_country" type="text" placeholder="Сountry" onChange={onChange('customer_country')} value={customer_country}
                                       disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                          <InputGroup.Button className={styles['empty-width']}></InputGroup.Button>
                          <FormControl id="customer_zipcode" type="text" placeholder="Zip Code" onChange={onChange('customer_zipcode')} value={customer_zipcode}
                                       disabled={(typeof this.props.canEdit !== 'undefined' && this.props.canEdit === false) ? true : false}/>
                        </InputGroup>
                      </FormGroup>
                    </TabPane>
                    {this.renderAdditioanlAddresses()}
                  </TabContent>
                </Col>
              </Row>
            </TabContainer>
          </Col>
          <Col md={6} sm={6} className="text-right">
            {this.state.error && (
              <div className="alert alert-danger">
                {this.state.error}
              </div>
            )}
          </Col>
          <Col md={6} sm={6} className="text-right">
            <Col md={6}>
              {this.state.sendingCustomer &&
                <SavingSpinner title="Saving" borderStyle="none" />
              }
            </Col>
          </Col>
        </Row>
      </fieldset>);
  }
}

CustomerFormBody.propTypes = {
  customer_first_name: PropTypes.string,
  customer_last_name: PropTypes.string,
  customer_email: PropTypes.string,
  customer_company_name: PropTypes.string,
  customer_address_line_1: PropTypes.string,
  customer_address_line_2: PropTypes.string,
  customer_city: PropTypes.string,
  customer_state: PropTypes.string,
  customer_country: PropTypes.string,
  customer_zipcode: PropTypes.string,
  customer_phone: PropTypes.string,
  customer_mobile_number: PropTypes.string,
  customer_id: PropTypes.number,
  createCustomer: PropTypes.func.isRequired,
  getCustomers: PropTypes.func.isRequired,
  searchCustomers: PropTypes.func.isRequired,
  onCustomerChange: PropTypes.func,
  onSinglePropertyChange: PropTypes.func,
  additionalAddressesUpdateCallback: PropTypes.func
};
