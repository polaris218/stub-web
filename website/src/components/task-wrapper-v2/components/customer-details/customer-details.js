import React, { Component } from 'react';
import style from '../../base-styling.module.scss';
import styles from './customer-details.module.scss';
import cx from 'classnames';
import {Row, Col, FormGroup, Checkbox} from "react-bootstrap";
import { FieldGroup } from "../../../fields";
import Phone from "react-phone-number-input";
import { Typeahead } from "react-bootstrap-typeahead";
import {getCustomerName} from "../../../../helpers/task";
import {getPhoneCode} from "../../../../helpers";
import SavingSpinner from "../../../saving-spinner/saving-spinner";

export default class CustomerDetails extends Component {
  constructor(props) {
    super(props);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.importing && nextProps.currentEvent !== this.props.currentEvent && this.refs.customerName) {
      this.refs.customerName.instanceRef.clear();
    }
  }

  render() {
    const options = [];
    this.props.customers.forEach((c) => {
      let option = { label: `${getCustomerName(c.first_name, c.last_name)}${c.company_name ? (' (' + c.company_name + ')') : ''}`, id: c.id, address: c.address };
      option = option && option.label ? option : null;
      if (option) {
        options.push(option);
      }
    });

    const phoneCode = getPhoneCode(this.props.companyProfile && this.props.companyProfile.country);

    return (
      <div className={cx(style.box)}>
        <h3 className={cx(style.boxTitle)}>Customer Details</h3>
        <div className={cx(style.boxBody)}>
          { this.props.canViewTaskFullDetails && this.props.can_edit &&
            <div className={cx(style.boxBodyInner)}>
              <FormGroup className={styles.typeAheadWrapper}>
                <Typeahead className={cx(styles.typeAhead)} ref="customerName" placeholder="Search Existing Customer (at least 3 characters required)"
                 onChange={this.props.handleChange} onInputChange={this.props.handleInputChange} emptyLabel={this.props.emptyLabel}
                 options={options} filterBy={() => true}
                />
              </FormGroup>
            </div>
          }
          <div className={cx(style.boxBodyInner)}>
            <Row className={cx(style.taskFormRow)}>
              <Col xs={12} sm={6}>
                <FieldGroup name="first-name" placeholder="First Name" value={this.props.event.customer_first_name} onChange={(e) => { this.props.onChangeEventState('customer_first_name', e.target.value); }} disabled={!this.props.can_edit} />
              </Col>
              <Col xs={12} sm={6}>
                <FieldGroup name="last-name" placeholder="Last Name" value={this.props.event.customer_last_name} onChange={(e) => { this.props.onChangeEventState('customer_last_name', e.target.value); }} disabled={!this.props.can_edit} />
              </Col>
              <Col xs={12} sm={6}>
                <FieldGroup name="company-name" placeholder="Company Name" value={this.props.event.customer_company_name} onChange={(e) => { this.props.onChangeEventState('customer_company_name', e.target.value); }} disabled={!this.props.can_edit} />
              </Col>
              { this.props.canViewTaskFullDetails && this.props.can_view_customer_details &&
                <Col xs={12} sm={6}>
                  <FieldGroup name="email" placeholder="Email" value={this.props.event.customer_email} onChange={(e) => { this.props.onChangeEventState('customer_email', e.target.value); }} disabled={!this.props.can_edit} />
                </Col>
              }
            </Row>
            { this.props.canViewTaskFullDetails && this.props.can_view_customer_details &&
              <Row className={cx(style.taskFormRow)}>
                <Col xs={12} sm={6}>
                  <FormGroup>
                    <Phone country={phoneCode} className={cx(styles['input-phone'])} placeholder="Mobile Phone Number" ref="mobile_number" value={this.props.event.customer_mobile_number} onChange={(phone) => { this.props.onChangeEventState('customer_mobile_number', phone); }} disabled={!this.props.can_edit} />
                  </FormGroup>
                </Col>
                <Col xs={12} sm={6}>
                  <FieldGroup name="phone-number" placeholder="Phone 2" value={this.props.event.customer_phone} onChange={(e) => { this.props.onChangeEventState('customer_phone', e.target.value); }} disabled={!this.props.can_edit} />
                </Col>
                  {this.props.isActivity === false &&
                 <div>
                <Col xs={12} sm={6}>
                  <FormGroup>
                    <Checkbox className={cx(style.checkBox)} checked={(!this.props.event.notifications || this.props.event.notifications.email === null || typeof this.props.event.notifications.email === 'undefined' || this.props.event.notifications.email === true)}
                    onChange={(e) => {this.props.onChangeEventState('notifications', {email: e.target.checked, sms: (!this.props.event.notifications || this.props.event.notifications.sms === null || typeof this.props.event.notifications.sms === 'undefined' || this.props.event.notifications.sms === true)})}}
                    disabled={!this.props.can_edit}><span>Email Notification</span></Checkbox>
                  </FormGroup>
                </Col>
                <Col xs={12} sm={6}>
                  <FormGroup>
                    <Checkbox className={cx(style.checkBox)} checked={(!this.props.event.notifications || this.props.event.notifications.sms === null || typeof this.props.event.notifications.sms === 'undefined' || this.props.event.notifications.sms === true)}
                    onChange={(e) => {this.props.onChangeEventState('notifications', {email: (!this.props.event.notifications || this.props.event.notifications.email === null || typeof this.props.event.notifications.email === 'undefined' || this.props.event.notifications.email === true), sms: e.target.checked})}}
                    disabled={!this.props.can_edit}><span>SMS Notification</span></Checkbox>
                  </FormGroup>
                </Col>
                 </div> }
            </Row>
            }
          </div>
        </div>
      </div>
    );
  }
}
