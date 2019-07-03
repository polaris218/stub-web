var braintree = require('braintree-web');

import styles from './braintree-payment-method-form.module.scss';

import React, { Component } from 'react';
import PropTypes from 'prop-types';

import SavingSpinner from '../saving-spinner/saving-spinner';

import { Button, Grid ,Row, Col, FieldGroup, ControlLabel } from 'react-bootstrap';

export default class BraintreePaymentMethodForm extends Component {
  constructor(props) {
    super(props);
    this.onSubmitForm = this.onSubmitForm.bind(this);
    this.calculateDiscount = this.calculateDiscount.bind(this);
    this.renderPaymentAmountLine = this.renderPaymentAmountLine.bind(this);
    this.renderTotalAmountLine = this.renderTotalAmountLine.bind(this);

    this.state = {
      teamMembers: null,
      loadingEntities: false,
      loadedEntities: false
    };
  }

  componentDidMount() {
    this.setState({
      loadingEntities: true
    });

    this.props.getEntities().then((data) => {
      const entities = JSON.parse(data);
      const limitedAccessEntities = entities.filter((entity) => {
        if (entity.permission_groups && entity.permission_groups.find((permission) => {
          return permission.title === 'Limited Access' && permission.status;
        })) {
          return entity;
        }
      });
      let teamSize = entities.length;
      if (limitedAccessEntities) {
        teamSize = teamSize - limitedAccessEntities.length;
      }
      this.setState({
        teamMembers: teamSize,
        loadingEntities: false,
        loadedEntities: true,
      });
    })

    braintree.setup(this.props.clientToken, 'dropin', {
      container: "dropin-container",
      form: "subscribe-form",
      onPaymentMethodReceived: function(obj) {
        this.props.createCustomer(obj.nonce);
      }.bind(this),
      onError: function() {

      }
    })
  }

  onSubmitForm(event) {
      event.preventDefault();
  }

  calculateDiscount() {
    return (this.props.total_amount * (1 - this.props.profile.discount / 100)).toFixed(2);
  }


  renderPaymentAmountLine() {
      return (
        <span>
        {!this.props.profile.discount ? (<span>${this.props.total_amount}/month per team member</span>)
          :(
              <span><span style={{ textDecoration: "line-through" }}>${this.props.total_amount}</span>&nbsp;
                ${this.calculateDiscount()}/month per team member <strong style={{color:'#00dc9a'}}>({this.props.profile.discount}% OFF)</strong></span>
          )}
        </span>
      );
  }

  renderTotalAmountLine() {
    if (this.props.total_amount && this.state.teamMembers && this.props.profile) {
        const discounted_rate = this.calculateDiscount();
        const final_total = discounted_rate * this.state.teamMembers;

        return <p>
          Total: ${final_total.toFixed(2)}
        </p>;
    }

    return null;
  }

  render() {
    const {teamMembers, loadingEntities, loadedEntities} = this.state;

    return (
      <div>
          <Grid>
            <Col className="text-left" componentClass={ControlLabel} sm={3}>
              <h3>Payment</h3>
              <div className={styles.payment_text}>
                <p>Your account will be charged monthly based on selected plan</p>

                { loadingEntities && !loadedEntities
                   ? <SavingSpinner title="Loading plan information" borderStyle="none" fontSize={14}/>
                   :
                  <div>
                    <p> Current Plan: {this.props.profile ? this.props.profile.plan : 'TEAM MEMBERS'}</p>
                    { this.renderPaymentAmountLine() }
                    { teamMembers ? <p> Team Size: { teamMembers }</p> : null }
                    
                    { this.renderTotalAmountLine() }

                    <p>Payment details are encrypted and securely processed by Braintree</p>
                  </div>
                }
              </div>
            </Col>
            <Col sm={9}>
              <a href="https://www.braintreegateway.com/merchants/2rsyhj83jz2bms2z/verified" target="_blank">
                <img src="https://s3.amazonaws.com/braintree-badges/braintree-badge-wide-light.png" width="280px" height ="44px" border="0"/>
              </a>
              <div className={styles.payment_form}style={{paddingBottom:'20px'}}>
                <div id="dropin-container"></div>
                <form onSubmit={this.onSubmitForm} id="subscribe-form">
                  <Button type="submit" className="btn-submit" type="submit" className={styles['confirm']} style={{marginTop:'20px'}}>
                    Confirm
                  </Button>
                </form>
              </div>
            </Col>
        </Grid>
      </div>
      );
  }
}

BraintreePaymentMethodForm.propTypes = {
  getEntities: PropTypes.func.isRequired,
  profile: PropTypes.object,
  total_amount: PropTypes.number
}
