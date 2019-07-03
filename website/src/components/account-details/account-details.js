import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, Form, FormGroup, ControlLabel, FormControl, Button, Dropdown, MenuItem, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import moment from 'moment';
import styles from './account-details.module.scss';
import NotificationManager from '../notification-manager/notification-manager';
import SavingSpinner from '../saving-spinner/saving-spinner';
import company_types from '../../helpers/company_types';
import { deleteActiveSubscription } from '../../actions';
import AccountCustomCommunication from '../account-custom-communication/account-custom-communication';

const FieldGroup = ({ id, label, staticField, fieldInfo, ...props }) => (
  <FormGroup controlId={id}>
    <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
      {label}
    </Col>
    <Col sm={10}>
      {staticField ?
        (<FormControl.Static>
          {props.value}
         </FormControl.Static>) :
        (<FormControl {...props} />)
      }
      {fieldInfo}
    </Col>
  </FormGroup>
);

export default class AccountDetails extends Component {
    constructor(props) {
      super(props);
      this.onDeleteSubscription = this.onDeleteSubscription.bind(this);
      this.updateAccountDetails = this.updateAccountDetails.bind(this);
      this.updatePlanSubmit = this.updatePlanSubmit.bind(this);
      this.handleImageChange = this.handleImageChange.bind(this);
      this.updateImageClick = this.updateImageClick.bind(this);
      this.removeImage = this.removeImage.bind(this);
      this.changeUserPlan = this.changeUserPlan.bind(this);
      this.changeCompanyType = this.changeCompanyType.bind(this);
      this.changeReminderTime = this.changeReminderTime.bind(this);
      this.onChangeField = this.onChangeField.bind(this);
      this.renderCompanyPlanDropdownList = this.renderCompanyPlanDropdownList.bind(this);
      this.renderTaskReminderNotifications = this.renderTaskReminderNotifications.bind(this);
      this.renderEnableCustomerTaskConfirmation = this.renderEnableCustomerTaskConfirmation.bind(this);
      this.changeEnableCustomerTaskNotification = this.changeEnableCustomerTaskNotification.bind(this);
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
        company_types,
        reminder_notifications:[{
          label: 'Disabled',
          value: 0,
          details: 'Disable customer reminders for jobs'
        },
        {
          label: '1 day',
          value: 24,
          details: 'Send customer reminders for jobs a day before the scheduled date and time'
        },
        {
          label: '1 day 12 hours',
          value: 36,
          details: 'Send customer reminders for jobs 36 hours before the scheduled date and time'
        },
        {
          label: '2 days',
          value: 48,
          details: 'Send customer reminders for jobs 2 days before the scheduled date and time'
        },
        {
          label: '3 days',
          value: 72,
          details: 'Send customer reminders for jobs 3 days before the scheduled date and time'
        }],
        customer_task_confirmations: [
          {
            value: true,
            label: { selected: 'Enabled', to_select: 'Enable' },
            details: 'Gives customer ability to confirm appointment'
          },
          {
            value: false,
            label: { selected: 'Disabled', to_select: 'Disable' },
            details: 'Customer won\'t be able to confirm appointment'
          }
        ],
        planNotifications: [],
        detailsNotifications: [],
        imageEditable: true,
        imageRemovable: true,
        savingDetails: false,
        savingPlans: false,
        teamMembers: 1
      };
    }

    componentDidMount() {
      this.getAccountDetails();
    }

    calculateDiscount() {
      return (this.state.payment_amount * (1 - this.state.discount / 100)).toFixed(2);
    }

    onDeleteSubscription() {
        this.setState({
          billing_type: 'NotFound'
        })
        deleteActiveSubscription(this.state.billing_id).then((res) => {
        }).catch((error) => {
          console.log(error);
          this.setState({
            detailsNotifications : [{message: 'An error occurred', bsStyle: 'danger'}],
          });
        })
    }

    onChangeField(field, value) {
      this.state[field.name] = value;
      this.state.detailsNotifications = [];
      this.setState(this.state);
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
      })

      this.props.getProfileInformation(true).then((data) => {
        const profile = JSON.parse(data);
        const { created, address, country, mobile_number, phone, support_email, fullname, email, intro, details, emergency, image_path,
          image_id, plan_id, company_type, social_links, website, owner_url, reminder_notification_time, enable_customer_task_confirmation,
          billing_type, billing_info, billing_id, trial_expiration_date, next_charge, discount } = profile;

        const plans = this.state.plans.map((item) => {
          item.selected = item.id === plan_id;
          return item;
        });

        const company_types = this.state.company_types.map((item) => {
          item.selected = item.value === company_type;
          return item;
        });

        const reminder_notifications = this.state.reminder_notifications.map((item) => {
          item.selected = item.value === reminder_notification_time;
          return item;
        });

        const customer_task_confirmations = this.state.customer_task_confirmations.map((item) => {
          item.selected = item.value === enable_customer_task_confirmation;
          return item;
        });

        var trialExpirationDate = new Date(trial_expiration_date);
        var today = new Date();
        const isTrial = today < trialExpirationDate;
        const trialDaysLeft = this.dateDiffInDays(today, trialExpirationDate);

        this.setState({
          address, country, mobile_number, phone, support_email, fullname, email, plans, intro, details, emergency, profileImageUrl: image_path, company_types, website, owner_url,
          billing_type, billing_info, billing_id, isTrial, trial_expiration_date, next_charge, discount, created,
          reminder_notification_time, customer_task_confirmations, trialDaysLeft,
          reminder_notifications,
          imageRemovable: image_id ? true : false, image_id,
          facebook: social_links ? social_links['facebook'] : '',
          yelp: social_links ? social_links['yelp'] : '',
          angieslist: social_links ? social_links['angieslist'] : '',
          google: social_links ? social_links['google'] : '',
          payment_amount: 10
        });
      });
    }

    updateImageClick() {
      this.refs.imageUploader.click();
    }

    handleImageChange(e) {
      e.preventDefault();
      e.stopPropagation();
      const image = e.target.files[0];

      const reader = new FileReader();

      reader.readAsDataURL(image);

      reader.onloadend = () => {
        this.setState({ profileImageUrl: reader.result, profileImage: image });

        this.props.getImageUrl().then((response) => {
          const data = new FormData();
          data.append('file-0', image);
          const { upload_url } = JSON.parse(response);
          this.props.updateProfileImage(upload_url, data).then((response2) => {
            const data2 = JSON.parse(response2);
            const { file_id } = data2;
            this.setState({
              imageRemovable: file_id ? true : false, image_id: file_id
            });
          });
        });

      };
    }

    changeUserPlan(id) {
      this.setState({ planNotifications: [], savingPlans: true });
      const plans = this.state.plans.map((item) => {
        item.selected = item.id === id;
        return item;
      });
      this.setState({ plans, savingPlans: false  });
    }

    changeCompanyType(value) {
      const company_types = this.state.company_types.map((item) => {
        item.selected = item.value === value;
        return item;
      });
      this.setState({ company_types });
    }

    changeReminderTime(value) {
      const reminder_notifications = this.state.reminder_notifications.map((item) => {
        item.selected = item.value === value;
        return item;
      });
      this.setState({ reminder_notifications });
    }

    changeEnableCustomerTaskNotification(value) {
      const enable_customer_task_notification = this.state.customer_task_confirmations.map((item) => {
        item.selected = item.value === value;
        return item;
      });
      this.setState({ enable_customer_task_notification });
    }

    updateAccountDetails(e) {
      e.preventDefault();
      e.stopPropagation();
      this.setState({ savingDetails: true });
      const { address, country, mobile_number, phone, support_email, fullname, intro, details, emergency, company_types, facebook, yelp, angieslist, google, website, reminder_notifications, customer_task_confirmations } = this.state;
      const company_type_selected = company_types.find((el) => el.selected);
      const reminder_notification_time = reminder_notifications.find((el) => el.selected);
      const enable_customer_task_confirmation = customer_task_confirmations.find((el) => el.selected);
      const social_links = JSON.stringify({
        facebook: facebook,
        yelp: yelp,
        angieslist: angieslist,
        google: google
      });

      this.props.updateProfileInformation({ address, country, mobile_number, phone, support_email, fullname, intro, details, emergency, social_links, company_type: company_type_selected.value, website, reminder_notification_time: reminder_notification_time.value, enable_customer_task_confirmation: enable_customer_task_confirmation.value }).then((data) => {
        this.setState({
          savingDetails: false,
          detailsNotifications : [{ message: 'Account Details successfully updated' }]
        });
      });
    }

    updatePlanSubmit(e) {
      e.preventDefault();
      e.stopPropagation();
      const plan = this.state.plans.find((el) => el.selected);
      this.props.updatePlan(plan.id, plan.label).then(() => {
        this.setState({ planNotifications: [{ message: 'Plan successfully updated' }] });
      });
    }

    removeImage() {
      if (this.state.image_id) {
        this.props.removeProfileImage(this.state.image_id).then((response) => {
          const { message } = JSON.parse(response);
          if (message === 'Deleted.') {
            this.setState({ imageRemovable: false, image_id: null, profileImageUrl: null });
          }
        });
      }
    }

    renderCompanyTypeDropdownList(list) {
      const item = list.find((itemC) => itemC.selected);
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
                <MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value}>
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

    renderCompanyPlanDropdownList(list) {
      const item = list.find((itemC) => itemC.selected);
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
                <MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.id} ref={itemC.id} eventKey={itemC.id}>
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

    renderTaskReminderNotifications(list) {
      const item = list.find((itemC) => itemC.selected);
      return (
        <Dropdown id={item.value} className={styles['user-plan']} onSelect={this.changeReminderTime}>
          <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
            <div className={styles['user-plan-info']}>
              <span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
              <small className={styles['user-plan-calls']}>{item.details}</small>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu className={styles['user-plan-menu']}>
            {list.map((itemC) => {
              return (
                <MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value}>
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

    renderEnableCustomerTaskConfirmation(list) {
      const currentItem = list.find((item) => item.selected);
      const option = list.find(item => !item.selected);
      return (
        <Dropdown id={currentItem.value} className={styles['user-plan']} onSelect={this.changeEnableCustomerTaskNotification}>
          <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
            <div className={styles['user-plan-info']}>
              <span className={'text-uppercase ' + styles['user-plan-name']}>{currentItem.label.selected}</span>
              <small className={styles['user-plan-calls']}>{currentItem.details}</small>
            </div>
          </Dropdown.Toggle>
          <Dropdown.Menu className={styles['user-plan-menu']}>
            <MenuItem className={'text-right ' + styles['user-plan-item']} key={option.value} ref={option.value} eventKey={option.value}>
              <div className={styles['user-plan-info']}>
                <span className={'text-uppercase ' + styles['user-plan-name']}>{option.label.to_select}</span>
                <small className={styles['user-plan-calls']}>{option.details}</small>
              </div>
            </MenuItem>
          </Dropdown.Menu>
      </Dropdown>
      );
    }

    renderPaymentAmountLine() {
      return (
        <span>
        {!this.state.discount ? (<span>${this.state.payment_amount}/month per team member</span>)
          :(
              <span><span style={{ textDecoration: "line-through" }}>${this.state.payment_amount}</span>&nbsp;
                ${this.calculateDiscount()}/month <strong style={{color:'#00dc9a'}}>({this.state.discount}% OFF)</strong></span>
          )}
        </span>
      )
    }

    render() {
      const onChangeField = (field) => {
        return (event) => {
          this.onChangeField(field, event.target.value);
        };
      };

      const fields = [
        { name: 'intro',
              label: 'intro'
            }, {
              name: 'details',
              label: 'details',
              fieldClass: 'textarea',
              props: {
                rows: 10
              }
            }, {
              name: 'email',
              label: 'email',
              static: true,
            }, {
              name: 'fullname',
              label: 'full name'
            }, {
              name: 'address',
              label: 'address'
            }, {
              name: 'country',
              label: 'country'
            }, {
              name: 'mobile_number',
              label: 'primary phone',
              type: 'tel'
            }, {
              name: 'phone',
              label: 'secondary phone',
		          type: 'tel'
            }, {
              name: 'support_email',
              label: 'Support Email',
            }, {
              name: 'emergency',
              label: 'Emergency Contacts',
              fieldClass: 'textarea',
              fieldInfo: 'This information will be shown to crew/drivers in case there is an issue and they are looking for emergency contacts.'
            }, {
              name: 'website',
              label: 'Website',
            }, {
              name: 'facebook',
              label: 'Facebook',
            }, {
              name: 'yelp',
              label: 'Yelp',
            }, {
              name: 'angieslist',
              label: "Angie's List",
            }, {
              name: 'google',
              label: "Google",
            }
      ].map((field, idx) => {
        return (
          <FieldGroup
            staticField={field.static || false}
            componentClass={field.fieldClass || 'input'}
            key={idx}
            onChange={onChangeField(field)}
            id={field.name}
            type={ field.type || 'text' }
            label={field.label}
            value={this.state[field.name] || ''}
            fieldInfo={field.fieldInfo || ''}
            { ...field.props }
          />);
      });

      let next_charge_date = ''
      if (this.state.next_charge) {
        next_charge_date = moment.utc(this.state.next_charge).local().format('MMM DD, YYYY');
      }

      return (
        <div>
          <div className={styles['account-image-c']}>
            <Grid>
              <Row className={styles['account-image'] + ' text-center'}>
                <Col xs={12} md={12}>
                  <Image src={this.state.profileImageUrl || '/images/user.png'} thumbnail responsive />
                  {this.state.imageEditable &&
                    <div
                      onClick={this.updateImageClick}
                      className={styles['image-buttons']}
                    >
                      Change Image
                    </div>
                  }
                  {this.state.imageRemovable &&
                    <div
                      onClick={this.removeImage}
                      className={styles['image-buttons']}
                    >
                      Remove
                    </div>
                  }
                </Col>
              </Row>
            </Grid>
          </div>
          <div className={styles['account-details']}>
            <Grid>
              <h2 className="header">Account Details</h2>
              <Link className={ `pull-right ${styles['profile-link']}` } to={ `/profile/${this.state.owner_url}` }>View profile visible to customers</Link>
              <NotificationManager notifications={this.state.detailsNotifications} />
              {this.state.email ?
              (<Form horizontal className="custom-form" onSubmit={this.updateAccountDetails}>
                <input accept="image/*" type="file" ref="imageUploader" onChange={this.handleImageChange} style={{ display: 'none' }}/>
                {fields}
                <FormGroup controlId="user-plan">
                  <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                    Business
                  </Col>
                  <Col sm={10}>
                    {this.renderCompanyTypeDropdownList(this.state.company_types)}
                  </Col>
                </FormGroup>
                <FormGroup controlId="user-plan">
                  <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                    Customer Reminders
                  </Col>
                  <Col sm={10}>
                    {this.renderTaskReminderNotifications(this.state.reminder_notifications)}
                  </Col>
                </FormGroup>
                <FormGroup controlId="enable_customer_task_confirmation">
                  <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                    Customer task confirmation
                  </Col>
                  <Col sm={10}>
                      {this.renderEnableCustomerTaskConfirmation(this.state.customer_task_confirmations)}
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col smOffset={2} sm={4}>
                    <Button type="submit" className="btn-submit">
                      Save Changes
                    </Button>
                  </Col>
                  <Col sm={4}>
                    {this.state.savingDetails &&
                      <SavingSpinner borderStyle="none" title="Saving Changes" />
                    }
                  </Col>
                </FormGroup>
               </Form>) :
              (<SavingSpinner title="Loading" borderStyle="none" />)}
            </Grid>
          </div>
          <div>
            <AccountCustomCommunication
              getCustomCommunication={this.props.getCustomCommunication}
              updateCustomCommunication={this.props.updateCustomCommunication}
             />
          </div>
          <div>
            <Grid>
              <h2 className="header">Plan Details</h2>
              <NotificationManager notifications={this.state.planNotifications} />
              {this.state.email ?
              (<Form horizontal className="custom-form" onSubmit={this.updatePlanSubmit}>
                <FormGroup controlId="user-plan">
                  <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                    current plan
                  </Col>
                  <Col sm={10}>
                    {this.renderCompanyPlanDropdownList(this.state.plans)}
                  </Col>
                </FormGroup>
                <FormGroup>
                  <Col smOffset={2} sm={4}>
                    <Button type="submit" className="btn-submit">
                      Save Changes
                    </Button>
                  </Col>
                  <Col sm={4}>
                    {this.state.savingPlans &&
                      <SavingSpinner title="Updating Plan" />
                    }
                  </Col>
                </FormGroup>
               </Form>) :
              (<SavingSpinner title="Loading" size={8} borderStyle="none" />)}
            </Grid>
          </div>
          <div id="billing" class="container">
            <Grid>
              <h2 className="header">Billing</h2>
                <Col className="text-uppercase text-right" componentClass={ControlLabel} sm={2}>
                  Billing Details
                </Col>
                <Col sm={10}>
                  <div style={{ paddingBottom:'5px' }}>
                    <p style={{ fontSize: '16px' }}>
                      Your plan: {this.state.isTrial?(
                          <span>Trial ({this.state.trialDaysLeft} days left)</span>
                        ) : this.renderPaymentAmountLine()}
                        {!this.state.isTrial && this.state.billing_type == 'NotFound' ?
                          (<span>&nbsp;<strong>(Trial Expired)</strong></span>)
                          : ''}
                      <br/>Current team size: {this.state.teamMembers}
                      {(!this.state.isTrial && this.state.billing_type != 'NotFound')?
                          (<span><br/>Next charge: {next_charge_date}</span>)
                          : ''}
                    </p>
                  </div>
                </Col>

                <Col className="text-uppercase text-right" componentClass={ControlLabel} sm={2}>
                  Billing METHOD
                </Col>
                <Col sm={10}>
                  <div style={{ paddingBottom:'5px' }}>
                    <p style={{ fontSize: '16px' }}>
                      {this.renderBillingDetail()}
                    </p>
                    <p style={{ fontSize: '16px' }}>
                      <Link to="/transactions">Transaction History</Link>
                    </p>
                  </div>
                </Col>
            </Grid>
          </div>
          <div>
            <Grid>
              <h2 className="header">Integrations</h2>
                  <Col className="text-uppercase text-right" componentClass={ControlLabel} sm={2}>
                    Slack Integration
                  </Col>
                  <Col sm={10}>
                    <div style={{paddingBottom:'20px'}}>
                      <a onClick={this.props.slackOAuthFlow} style={{ cursor:'pointer' }}>
                        <img
                          alt="Add to Slack" height="40" width="139"
                          src="https://platform.slack-edge.com/img/add_to_slack.png"
                          srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
                        />
                      </a>
                    </div>
                  </Col>

            </Grid>
          </div>
        </div>
      );
    }
}

AccountDetails.propTypes = {
  getProfileInformation: PropTypes.func.isRequired,
  getEntities: PropTypes.func.isRequired,
  updateProfileInformation: PropTypes.func.isRequired,
  updateProfileImage: PropTypes.func.isRequired,
  getImageUrl: PropTypes.func.isRequired,
  updatePlan: PropTypes.func.isRequired,
  removeProfileImage: PropTypes.func.isRequired,
  getCustomCommunication: PropTypes.func.isRequired,
  updateCustomCommunication: PropTypes.func.isRequired
};
