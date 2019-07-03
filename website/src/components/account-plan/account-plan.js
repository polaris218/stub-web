import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
  Grid,
  Row,
  Col,
  Form,
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  ButtonGrid,
  Dropdown,
  MenuItem
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './account-plan.module.scss';
import moment from 'moment';
import NotificationManager from '../notification-manager/notification-manager';
import {deleteActiveSubscription} from '../../actions';
import SavingSpinner from '../saving-spinner/saving-spinner';
import cx from 'classnames';
import { toast } from 'react-toastify';


export default class AccountPlan extends Component {
  constructor(props) {
    super(props);

    this.renderCompanyPlanDropdownList = this.renderCompanyPlanDropdownList.bind(this);
    this.changeUserPlan = this.changeUserPlan.bind(this);
    this.updatePlanSubmit = this.updatePlanSubmit.bind(this);
    this.onDeleteSubscription = this.onDeleteSubscription.bind(this);
    this.savePlain = this.savePlain.bind(this);
    this.calculateDiscount = this.calculateDiscount.bind(this);

    this.state = {
      plans: [{
        label: 'Team Members',
        calls: 'Pay by size of your team',
        id: 1
      }, {
        label: 'Tasks',
        calls: 'Pay by tasks per month',
        id: 2
      }],
      notifications: [],
      saving: false,
      loaded: false,
      teamMembers: 1
    };
  }

  componentDidMount() {
    this.getPlainDetails();
  }

  calculateDiscount() {
    return (this.state.payment_amount * (1 - this.state.discount / 100)).toFixed(2);
  }


  getPlainDetails() {
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
        teamMembers: teamSize
      });
    })

    this.props.getProfileInformation(true).then((data) => {
      const profile = JSON.parse(data);
      const {
        email, plan_id, billing_type, billing_info, billing_id, trial_expiration_date, discount, next_charge, subscription_info
      } = profile;

      const plans = this.state.plans.map((item) => {
        item.selected = item.id === plan_id;
        return item;
      });

      const trialExpirationDate = new Date(trial_expiration_date);
      const today = new Date(subscription_info.current_date);
      const isTrial = today <= trialExpirationDate;
      const trialDaysLeft = this.dateDiffInDays(today, trialExpirationDate);

      this.setState({
        email: email,
        plans,
        billing_type,
        billing_info,
        billing_id,
        isTrial: isTrial,
        trialDaysLeft,
        next_charge,
        discount: discount,
        payment_amount: 20,
        saving: false,
        loaded: true,
        profile: profile
      });
    });
  }

  renderCompanyPlanDropdownList(list) {
    let item = list.find((itemC) => itemC.selected);
    item = item ? item : list[0];
    return (
      <Dropdown id={item.id} className={styles['user-plan']} onSelect={this.changeUserPlan}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
            <span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
            <small className={styles['user-plan-calls']}>{item.calls}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            return (
              <MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.id} ref={itemC.id}
                        eventKey={itemC.id}>
                <div className={styles['user-plan-info']}>
                  <span className={'text-uppercase ' + styles['user-plan-name']}>{itemC.label}</span>
                  <small className={styles['user-plan-calls']}>{itemC.calls}</small>
                </div>
              </MenuItem>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  renderBillingDetail() {
    if (this.state.billing_type == 'NotFound') {
      return (
        <Link to="/payment_setup">Setup new payment method</Link>
      )
    }
    return (
      <div>
        {this.state.billing_type} {this.state.billing_info ? <span>({this.state.billing_info})</span> : null}
        <Button bsStyle="link" onClick={this.onDeleteSubscription}>Delete</Button>
      </div>
    )
  }

  renderPaymentAmountLine() {
    return (
      <span>
        {!this.state.discount ? (<span>${this.state.payment_amount}/month per team member</span>)
          : (
            <span><span style={{textDecoration: "line-through"}}>${this.state.payment_amount}</span>&nbsp;
              ${this.calculateDiscount()}/month <strong
                style={{color: '#00dc9a'}}>({this.state.discount}% OFF)</strong></span>
          )}
        </span>
    )
  }

  dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;
    var utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    var utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }

  changeUserPlan(id) {
    this.setState({planNotifications: [], savingPlans: true});
    const plans = this.state.plans.map((item) => {
      item.selected = item.id === id;
      return item;
    });
    this.setState({plans, savingPlans: false});
  }

  updatePlanSubmit(e) {
    const plan = this.state.plans.find((el) => el.selected);
    this.props.updatePlan(plan.id, plan.label).then(() => {
      this.setState({
        savingDetails: false
      }, () => {
	      const planUpdated = {
		      text: 'Plan successfully updated',
		      options: {
			      type: toast.TYPE.SUCCESS,
			      position: toast.POSITION.BOTTOM_LEFT,
			      className: styles.toastSuccessAlert,
			      autoClose: 8000
		      }
	      };
	      this.props.createToastAlert(planUpdated);
      });
    });
  }

  onDeleteSubscription() {
    this.setState({
      billing_type: 'NotFound'
    });
    deleteActiveSubscription(this.state.billing_id).then((res) => {
    }).catch((error) => {
      console.log(error);
      // TODO: Something goes wrong: Show message about that!
    })
  }

  render() {
    let next_charge_date = ''
    if (this.state.next_charge) {
      next_charge_date = moment.utc(this.state.next_charge).local().format('MMM DD, YYYY');
    }
    let mailLink = 'mailto:support@arrivy.com';
    if (this.state.profile && this.state.profile.owner) {
      mailLink += '?subject=Plan Queries for ' + this.state.profile.owner;
    }
    const contactButton = <a href={mailLink}>Contact Arrivy to change plan details</a>;

    return (
      <Grid id="plain_part" className={styles['plain_part']}>
        <h2>Plan Details</h2>
        <NotificationManager notifications={this.state.notifications}/>
        {this.state.loaded ?
          (<Form horizontal className="custom-form container" onSubmit={this.savePlain}>
            <Row>
              {this.state.email ?
                (<FormGroup controlId="user-plan">
                  <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                    current plan
                  </Col>
                  <Col sm={10}>
                    {this.renderCompanyPlanDropdownList(this.state.plans)}
                  </Col>
                </FormGroup>) :
                ('')}
            </Row>

            <Row id="billing" className={styles['billing_part']}>
              <h2>Billing</h2>
              <Row>
                <Col className={cx("text-uppercase text-right")} componentClass={ControlLabel} sm={2}>
                  Billing Plan
                </Col>
                <Col sm={10} className={styles.billingPlanHeading}>
                  {this.state.profile.plan_id === 1 ?
                    <div>
                      Business
                      <span className={styles.placeholderCustom}>&nbsp;</span>
                      { contactButton }
                      <div className={styles.smbMessage}>
                        Arrivy can integrate with existing Enterprise calendar and task management systems through robust API's. This allows companies
                        to use Arrivy 's last-mile location services and communications features in virtually any system within both web sites and mobile clients.
                      </div>
                    </div>
                    :
                    'Enterprise' }
                </Col>
              </Row>
              <Row className={styles.billingDetails}>
                <Col className={cx("text-uppercase text-right")} componentClass={ControlLabel} sm={2}>
                  Billing Details
                </Col>
                {this.state.profile.plan_id === 1 ?
                <Col sm={10}>
                  <div style={{paddingBottom: '5px'}}>
                    <p style={{fontSize: '16px'}}>
                      Your plan: {this.state.isTrial ? (
                      <span>Trial ({this.state.trialDaysLeft} days left)</span>
                    ) : this.renderPaymentAmountLine()}
                      {!this.state.isTrial && this.state.billing_type == 'NotFound' ?
                        (<span>&nbsp;<strong>(Trial Expired)</strong></span>)
                        : ''}
                      <br/>Current team size: {this.state.teamMembers}
                      {(!this.state.isTrial && this.state.billing_type != 'NotFound') ?
                        (<span><br/>Next charge: {next_charge_date}</span>)
                        : ''}
                    </p>
                  </div>
                </Col>
                  :
                  <Col sm={10}>
                    <div style={{ paddingBottom: '5px' }}>
                      <p style={{fontSize: '16px'}}>
                        Invoice to:
                        <br/>{this.state.profile.fullname}
                        <br/>{this.state.profile.address}
                        <br/>{ contactButton }
                      </p>
                    </div>
                  </Col>
                }
              </Row>
              {this.state.profile.plan_id === 1 &&
                <Row>
                  <Col className="text-uppercase text-right" componentClass={ControlLabel} sm={2}>
                    Billing METHOD
                  </Col>
                  <Col sm={10}>
                    <div style={{paddingBottom: '5px'}}>
                      <div style={{fontSize: '16px'}}>
                        {this.renderBillingDetail()}
                      </div>
                      <p style={{fontSize: '16px'}}>
                        <Link to="/transactions">Transaction History</Link>
                      </p>
                    </div>
                  </Col>
                </Row>
              }
              {this.state.profile.plan_id === 1 && <FormGroup>
                <Col smOffset={2} sm={4}>
                  <Button type="submit" className="btn-submit">
                    Save Changes
                  </Button>
                </Col>
                <Col sm={4}>
                  {this.state.saving &&
                  <SavingSpinner size={8} borderStyle="none" title="Saving Changes"/>
                  }
                </Col>
              </FormGroup>
              }
            </Row>
          </Form>) : (<SavingSpinner size={8} borderStyle="none" title="Loading" />)}
      </Grid>
    )
  }

  savePlain(e) {
    this.setState({saving: true});
    e.preventDefault();
    e.stopPropagation();
    let selected_plan = this.state.plans.find((itemC) => itemC.selected);
    selected_plan = selected_plan ? selected_plan : this.state.plans[0];
    this.props.updatePlan(selected_plan.id, selected_plan.label).then(
      () => {
        this.setState({
	        saving: false
        }, () => {
	        const planUpdated = {
		        text: 'Successfully updated',
		        options: {
			        type: toast.TYPE.SUCCESS,
			        position: toast.POSITION.BOTTOM_LEFT,
			        className: styles.toastSuccessAlert,
			        autoClose: 8000
		        }
	        };
	        this.props.createToastAlert(planUpdated);
        });
      },
      () => {
        this.setState({
	        saving: false
        }, () => {
	        const planUpdateFailed = {
		        text: 'An error occurred',
		        options: {
			        type: toast.TYPE.ERROR,
			        position: toast.POSITION.BOTTOM_LEFT,
			        className: styles.toastErrorAlert,
			        autoClose: 8000
		        }
	        };
	        this.props.createToastAlert(planUpdateFailed);
        });
      }
    );
  }
}

AccountPlan.propTypes = {
  getProfileInformation: PropTypes.func.isRequired,
  getEntities: PropTypes.func.isRequired,
  updatePlan: PropTypes.func.isRequired
};
