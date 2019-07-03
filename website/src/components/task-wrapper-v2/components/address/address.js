import React, { Component } from 'react';
import style from '../../base-styling.module.scss';
import styles from './address.module.scss';
import cx from 'classnames';
import { Row, Col, FormGroup, Nav, NavItem, TabContainer, TabContent, TabPane } from "react-bootstrap";
import { FieldGroup } from "../../../fields";
import Autocomplete from "react-google-autocomplete";

export default class Address extends Component {
  constructor(props) {
    super(props);

    this.handleTabClick = this.handleTabClick.bind(this);
    this.updateAddress = this.updateAddress.bind(this);
    this.addAdditionalAddressClickHandler = this.addAdditionalAddressClickHandler.bind(this);
    this.renderAdditionalAddresses = this.renderAdditionalAddresses.bind(this);
    this.removeAddressTab = this.removeAddressTab.bind(this);
    this.renderTabsNav = this.renderTabsNav.bind(this);
    this.updateAdditionalAddressField = this.updateAdditionalAddressField.bind(this);
    this.updateAdditionalAddressAllFields = this.updateAdditionalAddressAllFields.bind(this);

    this.state = {
      additional_addresses: this.props.event.additional_addresses !== null ? this.props.event.additional_addresses : [],
      activeTabKey: '1'
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props, nextProps)) {
      this.setState({
        additional_addresses: nextProps.event && nextProps.event.additional_addresses ? nextProps.event.additional_addresses : [],
      });
      if (!nextProps.event.additional_addresses || nextProps.event.additional_addresses.length === 0) {
        this.handleTabClick('1');
      }
    }
  }

  handleTabClick(key) {
    if (this.refs && this.refs.input) {
      this.refs.input.refs.input.value = '';
    }
    this.setState({ activeTabKey: key });
  }

  updateAddress(place) {
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
        let item_value = item.long_name ? item.long_name : '';

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
      this.refs.input.refs.input.value = '';

      if (this.props.onCustomerChange) {
        this.customerTimeoutID = setTimeout(() => {
          this.props.onCustomerChange(updated_address);
        });
      }
    } else {
      console.log('undefined');
    }
  }



  addAdditionalAddressClickHandler(e) {
    e.preventDefault();
    e.stopPropagation();
    const addressesLength = this.state.additional_addresses.length;
    const customer_address_component = {
      'complete_address': '',
      'title': 'Address ' + (addressesLength + 2),
      'address_line_1': '',
      'address_line_2': '',
      'city': '',
      'state': '',
      'country': '',
      'zipcode': '',
      'exact_location': null
    };
    this.refs.input.refs.input.value = '';
    if (this.state.additional_addresses.length < 3) {
      this.setState({
        additional_addresses: [...this.state.additional_addresses, customer_address_component]
      }, () => { this.props.additionalAddressesUpdateCallback(this.state.additional_addresses); });
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

      const state = administrative_area_level_1 ? administrative_area_level_1 : '';
      const updatedCity = locality ? locality : '';
      const updatedCountry = country ? country : '';
      const updateZip = postal_code ? postal_code : '';
      const updatedAddress1 = route ? route : '';
      const updatedAddress2 = sublocality ? sublocality : '';
      const lat = place.geometry.location.lat();
      const lng = place.geometry.location.lng();
      const address = place.formatted_address;

      const additionalAddresses = [...this.state.additional_addresses];
      additionalAddresses[arrayIndex]['complete_address'] = address;
      additionalAddresses[arrayIndex]['address_line_1'] = updatedAddress1;
      additionalAddresses[arrayIndex]['address_line_2'] = updatedAddress2;
      additionalAddresses[arrayIndex]['city'] = updatedCity;
      additionalAddresses[arrayIndex]['state'] = state;
      additionalAddresses[arrayIndex]['country'] = updatedCountry;
      additionalAddresses[arrayIndex]['zipcode'] = updateZip;
      if (lat && lng && lat !== null && lng !== null) {
        additionalAddresses[arrayIndex]['exact_location'] = {lat, lng};
      } else {
        additionalAddresses[arrayIndex]['exact_location'] = null;
      }

      this.refs.input.refs.input.value = '';
      this.props.additionalAddressesUpdateCallback(additionalAddresses);
    }
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
    if (this.state.additional_addresses && this.state.additional_addresses.length > 0) {
      const tabsNavigation = this.state.additional_addresses.map((address, i) => {
        const tabTitle = address.title ? address.title : 'Address ' + (i + 2);
        return (
          <NavItem href="javascript:void(0)" title={address.complete_address} eventKey={i + 1} onClick={() => this.handleTabClick(i + 1)}>
            <div>{tabTitle}</div> {this.props.canViewTaskFullDetails && this.props.can_edit && <span className={cx(styles.remove)} onClick={(e) => this.removeAddressTab(e, i, i + 1)} />}
          </NavItem>
        );
      });
      return tabsNavigation;
    } else {
      return;
    }
  }

  renderAdditionalAddresses() {
    if (typeof this.state.additional_addresses !== 'undefined' && this.state.additional_addresses !== null && this.state.additional_addresses.length > 0) {
      const array = [...this.state.additional_addresses];
      const addressTabs = array.map((address, i) => {
        return (
          <TabPane eventKey={i + 1}>
            <FieldGroup onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].title} name="title" type="text" placeholder="Address Title" disabled={!this.props.can_edit} />
            <Row className={cx(style.taskFormRow)}>
              <Col xs={12} sm={6}>
                <FieldGroup onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].address_line_1} name="address_line_1" type="text" placeholder="Address Line 1" disabled={!this.props.can_edit} />
              </Col>
              <Col xs={12} sm={6}>
                <FieldGroup onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].address_line_2} name="address_line_2" type="text" placeholder="Address Line 2" disabled={!this.props.can_edit} />
              </Col>
              <Col xs={12} sm={6}>
                <FieldGroup onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].city} name="city" type="text" placeholder="Сity" disabled={!this.props.can_edit} />
              </Col>
              <Col xs={12} sm={6}>
                <FieldGroup onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].state} name="state" type="text" placeholder="State" disabled={!this.props.can_edit} />
              </Col>
              <Col xs={12} sm={6}>
                <FieldGroup onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].country} name="country" type="text" placeholder="Сountry" disabled={!this.props.can_edit} />
              </Col>
              <Col xs={12} sm={6}>
                <FieldGroup onChange={(e) => this.updateAdditionalAddressField(e, i)} value={this.state.additional_addresses[i].zipcode} name="zipcode" type="text" placeholder="Zip Code" disabled={!this.props.can_edit} />
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


  render() {
    const { className } = this.props,
      { customer_address_line_1, customer_address_line_2,
        customer_city, customer_state, customer_country, customer_zipcode } = this.props,
      onChange = (name) => {
        return (event) => {
          this.onChange(name, event.target.value);
        };
      };

    const primaryAddressToolTip = (
      customer_address_line_1 + ' ' + customer_city + ' ' + customer_state + ' ' + customer_country + ' ' + customer_zipcode
    );

    return (
      <div className={cx(style.box)}>
        {this.props.updateCustomer}
        <h3 className={cx(style.boxTitle)}>Address</h3>
        <div className={cx(style.boxBody)}>
          <div className={cx(style.boxBodyInner)}>
            {this.props.canViewTaskFullDetails && this.props.can_edit &&
            <FormGroup className={cx(styles.addressSearch)}>
              <Autocomplete
                placeholder="Find Address Here..."
                types={[]}
                onPlaceSelected={(place) => {
                  this.updateAddress(place);
                }}
                className={cx(style["form-control"], styles["form-control"])}
                ref="input"
              />
            </FormGroup>}
            <TabContainer id="tabs" activeKey={this.state.activeTabKey}>
              <div>
                <div className={cx(styles.addressTabsListWrapper)}>
                  <Nav bsStyle="tabs" className={cx(styles.addressTabsList)}>
                    <NavItem href="javascript:void(0)" title={primaryAddressToolTip} eventKey="1" onClick={(e) => this.handleTabClick('1')}>Primary Address</NavItem>
                    {this.renderTabsNav()}
                    {this.state.additional_addresses && this.state.additional_addresses.length < 3 && this.props.canViewTaskFullDetails && this.props.can_edit &&
                      <NavItem href="javascript:void(0)" className={cx(styles.addNewTab)} onClick={(e) => this.addAdditionalAddressClickHandler(e)}>+ Add New Address</NavItem>
                    }
                  </Nav>
                </div>
                <TabContent animation>
                  <TabPane eventKey="1">
                    <Row className={cx(style.taskFormRow)}>
                      <Col xs={12} sm={6}>
                        <FieldGroup name="address-line-1" placeholder="Address Line 1" value={this.props.event.customer_address_line_1} onChange={(e) => { this.props.onChangeEventState('customer_address_line_1', e.target.value); }} disabled={!this.props.can_edit} />
                      </Col>
                      <Col xs={12} sm={6}>
                        <FieldGroup name="address-line-2" placeholder="Address Line 2" value={this.props.event.customer_address_line_2} onChange={(e) => { this.props.onChangeEventState('customer_address_line_2', e.target.value); }} disabled={!this.props.can_edit} />
                      </Col>
                      <Col xs={12} sm={6}>
                        <FieldGroup name="city" placeholder="City" value={this.props.event.customer_city} onChange={(e) => { this.props.onChangeEventState('customer_city', e.target.value); }} disabled={!this.props.can_edit} />
                      </Col>
                      <Col xs={12} sm={6}>
                        <FieldGroup name="state" placeholder="State" value={this.props.event.customer_state} onChange={(e) => { this.props.onChangeEventState('customer_state', e.target.value); }} disabled={!this.props.can_edit} />
                      </Col>
                      <Col xs={12} sm={6}>
                        <FieldGroup name="country" placeholder="Country" value={this.props.event.customer_country} onChange={(e) => { this.props.onChangeEventState('customer_country', e.target.value); }} disabled={!this.props.can_edit} />
                      </Col>
                      <Col xs={12} sm={6}>
                        <FieldGroup name="zip-code" placeholder="Zip Code" value={this.props.event.customer_zipcode} onChange={(e) => { this.props.onChangeEventState('customer_zipcode', e.target.value); }} disabled={!this.props.can_edit} />
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
    );
  }
}
