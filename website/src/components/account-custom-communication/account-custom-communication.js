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
  MenuItem,
  OverlayTrigger,
  Tooltip,
  Checkbox,
  Tab, Tabs, TabList, TabPanel
} from 'react-bootstrap';
import NotificationManager from '../notification-manager/notification-manager';
import styles from './account-custom-communication.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import ExtraFields from '../extra-fields/extra-fields';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import 'rc-time-picker/assets/index.css';
import 'react-bootstrap-timezone-picker/dist/react-bootstrap-timezone-picker.min.css';
import {getErrorMessage} from '../../helpers/task';
import {toast} from 'react-toastify';
import {EXCEPTION_REASONS} from '../../helpers';
import $ from 'jquery';
import cx from "classnames";
import SwitchButton from "../../helpers/switch_button";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {faInfoCircle} from "@fortawesome/fontawesome-free-solid";

const tooltip = (
  <Tooltip id="tooltip">Arrivy sends reminder emails & sms to customers who haven't shared feedback of their
    experience. The selected value dictates the number of attempts Arrivy will make to get the feedback</Tooltip>
);

const FieldGroup = ({id, label, staticField, fieldInfo, ...props}) => (
  <FormGroup controlId={id} className={styles[id]}>
    <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
      {id === 'review_reminder_attempts' &&
      <OverlayTrigger placement="bottom" overlay={tooltip}>
        <span>{label}</span>
      </OverlayTrigger>}
      {id !== 'review_reminder_attempts' && label}
    </Col>
    <Col sm={10}>
      <div className={styles['col-right']}>
        {staticField ?
          (<FormControl.Static>
            {props.value}
          </FormControl.Static>) :
          (<FormControl {...props} />)
        }
        {fieldInfo}
      </div>
    </Col>
  </FormGroup>
);

export default class AccountCustomCommunication extends Component {
  constructor(props) {
    super(props);
    this.onChangeField = this.onChangeField.bind(this);
    this.changeEnableCustomerTaskNotification = this.changeEnableCustomerTaskNotification.bind(this);
    this.changeEnableLateAndNoShowNotification = this.changeEnableLateAndNoShowNotification.bind(this);
    this.changeReminderTime = this.changeReminderTime.bind(this);
    this.renderEnableCustomerTaskConfirmation = this.renderEnableCustomerTaskConfirmation.bind(this);
    this.renderTaskReminderNotifications = this.renderTaskReminderNotifications.bind(this);
    this.changeWebhookAuthKeys = this.changeWebhookAuthKeys.bind(this);
    this.changeRatingsAuthKeys = this.changeRatingsAuthKeys.bind(this);
    this.renderRatingType = this.renderRatingType.bind(this);
    this.changeRatingType = this.changeRatingType.bind(this);
    this.renderExceptionsList = this.renderExceptionsList.bind(this);
    this.handleExceptionsListItemSelect = this.handleExceptionsListItemSelect.bind(this);
    this.setEmailSwitchState = this.setEmailSwitchState.bind(this);
    this.setSmsSwitchState = this.setSmsSwitchState.bind(this);

    this.save = this.save.bind(this);
    this.state = {
      notifications: [],
      webhook_auth_keys: null,
      ratings_fetch_url_auth_keys: null,
      emailSwitch: false,
      smsSwitch: false,
      reminder_notifications: [
        {
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
          label: {selected: 'Enabled', to_select: 'Enable'},
          details: 'Gives customer ability to confirm appointment'
        },
        {
          value: false,
          label: {selected: 'Disabled', to_select: 'Disable'},
          details: 'Customer won\'t be able to confirm appointment'
        }
      ],
      late_and_no_show_notification: [
        {
          value: true,
          label: {selected: 'Enabled', to_select: 'Enable'},
          details: 'Enable Late and No Show notifications'
        },
        {
          value: false,
          label: {selected: 'Disabled', to_select: 'Disable'},
          details: 'Disable Late and No Show notifications'
        }
      ],
      rating_types: [
        {
          label: '5-star ratings <default>',
          value: 'FiveStar',
          details: 'Arrivy default Rating System'
        },
        {
          label: 'Net Promoter Score',
          value: 'NPS',
          details: 'Rating between 0 to 10'
        },
        {
          label: 'Thumbs Up/Down',
          value: 'ThumbsUpDown',
          details: 'Recommendation System'
        },
        {
          label: 'No Rating',
          value: 'NoRating',
          details: 'Turn off Rating System'
        }],
      confirmation_message_text: "",
      review_prompt_text: "",
      negative_review_prompt_text: "",
      reminder_notification_time: "",
      custom_webhook_url: "",
      ratings_fetch_url: "",
      saving: false,
      loaded: false,
      exceptions: null,
      email: true,
      sms: true
    };
  }

  componentDidMount() {
    this.props.getCustomCommunication().then((data) => {
      const customizations = JSON.parse(data);
      const {confirmation_message_text, review_prompt_text, negative_review_prompt_text} = customizations;
      this.props.getProfileInformation().then((data) => {
        const profile = JSON.parse(data);
        const {reminder_notification_time, enable_customer_task_confirmation, enable_late_and_no_show_notification, custom_webhook, custom_webhook_authentication_keys, pending_review_reminder_attempts, ratings_fetch_URL, ratings_fetch_URL_authentication_keys, rating_type} = profile;


        const customer_task_confirmations = this.state.customer_task_confirmations.map((item) => {
          item.selected = item.value === enable_customer_task_confirmation;
          return item;
        });

        const rating_types = this.state.rating_types.map((item) => {
          item.selected = item.value === rating_type;
          return item;
        });

        const late_and_no_show_notification = this.state.late_and_no_show_notification.map((item) => {
          item.selected = item.value === enable_late_and_no_show_notification;
          return item;
        });
        const exceptionsList = profile.exceptions;

        this.setState({
          confirmation_message_text,
          profile,
          review_prompt_text: review_prompt_text || 'Please rate our service',
          negative_review_prompt_text: negative_review_prompt_text || 'What went wrong? Please leave a note here and we will try our best to make it up to you!',
          loaded: true,
          customer_task_confirmations,
          late_and_no_show_notification,
          custom_webhook_url: custom_webhook,
          ratings_fetch_url: ratings_fetch_URL,
          pending_review_reminder_attempts,
          rating_types,
          exceptions: exceptionsList,
          email: (!profile.task_notifications_settings || profile.task_notifications_settings.email === null || typeof profile.task_notifications_settings.email === 'undefined') ? true : profile.task_notifications_settings.email,
          sms: (!profile.task_notifications_settings || profile.task_notifications_settings.sms === null || typeof profile.task_notifications_settings.sms === 'undefined') ? true : profile.task_notifications_settings.sms,
          webhook_auth_keys: custom_webhook_authentication_keys ? Object.keys(custom_webhook_authentication_keys).map((key) => {
            return {
              name: key,
              value: custom_webhook_authentication_keys[key]
            };
          }) : null,
          ratings_fetch_url_auth_keys: ratings_fetch_URL_authentication_keys ? Object.keys(ratings_fetch_URL_authentication_keys).map((key) => {
            return {
              name: key,
              value: ratings_fetch_URL_authentication_keys[key]
            };
          }) : null
        });
        this.changeReminderTime(reminder_notification_time);

      });
    });

  }


  renderExceptionsList() {
    const exception_reasons_list = EXCEPTION_REASONS;
    return exception_reasons_list.map((exception) => {
      let isSelected = false;
      if (this.state.exceptions && this.state.exceptions.find((selected_exception) => {
        return selected_exception.reason_code === exception.reason_code && selected_exception.notes === exception.notes;
      })) {
        isSelected = true;
      }
      return (
        <div>
          <Checkbox checked={isSelected} onChange={(e) => {
            this.handleExceptionsListItemSelect(e, exception)
          }} inline>{exception.notes}</Checkbox>
        </div>
      );
    });
  }

  handleExceptionsListItemSelect(e, exc) {
    const selectedExceptions = $.extend(true, [], this.state.exceptions);
    if (e.target.checked) {
      if (selectedExceptions && !selectedExceptions.find((selectedException) => {
        return selectedException.notes === exc.notes && selectedException.reason_code === exc.reason_code;
      })) {
        selectedExceptions.push(exc);
      } else {
        return false;
      }
    } else {
      const valIndex = selectedExceptions.findIndex((selectedException) => {
        return selectedException.notes === exc.notes && selectedException.reason_code === exc.reason_code;
      });
      if (valIndex >= 0) {
        selectedExceptions.splice(valIndex, 1);
      }
    }
    this.setState({
      exceptions: selectedExceptions
    });
  }

  onChangeField(field_name, value) {
    if (value) {
      this.state[field_name] = value;
    }
    else {
      this.state[field_name] = null;
    }
    this.state.notifications = [];
    this.setState(this.state);
  }

  changeEnableCustomerTaskNotification(value) {
    const enable_customer_task_notification = this.state.customer_task_confirmations.map((item) => {
      item.selected = item.value === value;
      return item;
    });
    this.setState({enable_customer_task_notification});
  }

  changeEnableLateAndNoShowNotification(value) {
    const enable_late_and_no_show_notification = this.state.late_and_no_show_notification.map((item) => {
      item.selected = item.value === value;
      return item;
    });
    this.setState({enable_late_and_no_show_notification});
  }

  changeReminderTime(value) {
    const reminder_notifications = this.state.reminder_notifications.map((item) => {
      item.selected = item.value === value;
      return item;
    });
    this.setState({reminder_notifications});
  }

  changeRatingType(value) {
    const old_rating_type = this.state.rating_types.find((rating) => {
      return rating.selected === true
    });
    const rating_types = this.state.rating_types.map((item) => {
      item.selected = item.value === value;
      return item;
    });
    const defaultReviewReminderAttempts = (old_rating_type && old_rating_type.value === 'NoRating') ? 2 : this.state.pending_review_reminder_attempts;
    this.setState({
      rating_types,
      pending_review_reminder_attempts: (value === 'NoRating') ? 0 : defaultReviewReminderAttempts
    });
  }

  changeWebhookAuthKeys(keys) {
    if (keys.length > 0) {
      const tempKeysArray = {};
      keys.map((key) => {
        tempKeysArray[key.name] = key.value;
      });
      this.setState({webhook_auth_keys: tempKeysArray});
    } else {
      this.setState({webhook_auth_keys: null});
    }
  }

  changeRatingsAuthKeys(keys) {
    if (keys.length > 0) {
      const tempKeysArray = {};
      keys.map((key) => {
        tempKeysArray[key.name] = key.value;
      });
      this.setState({ratings_fetch_url_auth_keys: tempKeysArray});
    } else {
      this.setState({ratings_fetch_url_auth_keys: null});
    }
  }

  setEmailSwitchState(e) {
    this.setState({email: e.target.checked});
  }

  setSmsSwitchState(e) {
    this.setState({sms: e.target.checked});
  }

  renderEnableCustomerTaskConfirmation(list) {
    const currentItem = list.find((item) => item.selected);
    const option = list.find(item => !item.selected);
    return (
      <Dropdown id={currentItem.value} className={styles['user-plan']}
                onSelect={this.changeEnableCustomerTaskNotification}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
                        <span
                          className={'text-uppercase ' + styles['user-plan-name']}>{currentItem.label.selected}</span>
            <small className={styles['user-plan-calls']}>{currentItem.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          <MenuItem href="javascript:void(0)" className={'text-right ' + styles['user-plan-item']}
                    key={option.value} ref={option.value} eventKey={option.value}>
            <div className={styles['user-plan-info']}>
                            <span
                              className={'text-uppercase ' + styles['user-plan-name']}>{option.label.to_select}</span>
              <small className={styles['user-plan-calls']}>{option.details}</small>
            </div>
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  renderEnableLateAndNoShowNotification(list) {
    const currentItem = list.find((item) => item.selected);
    const option = list.find(item => !item.selected);
    return (
      <Dropdown id={currentItem.value} className={styles['user-plan']}
                onSelect={this.changeEnableLateAndNoShowNotification}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
                        <span
                          className={'text-uppercase ' + styles['user-plan-name']}>{currentItem.label.selected}</span>
            <small className={styles['user-plan-calls']}>{currentItem.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          <MenuItem href="javascript:void(0)" className={'text-right ' + styles['user-plan-item']}
                    key={option.value} ref={option.value} eventKey={option.value}>
            <div className={styles['user-plan-info']}>
                            <span
                              className={'text-uppercase ' + styles['user-plan-name']}>{option.label.to_select}</span>
              <small className={styles['user-plan-calls']}>{option.details}</small>
            </div>
          </MenuItem>
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  renderTaskReminderNotifications(list) {
    let item = list.find((itemC) => itemC.selected);
    item = item ? item : list[0];
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
              <MenuItem href="javascript:void(0)" className={'text-right ' + styles['user-plan-item']}
                        key={itemC.value}
                        ref={itemC.value} eventKey={itemC.value}>
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

  renderRatingType(list) {
    let item = list.find((itemC) => itemC.selected);
    item = item ? item : list[0];
    return (
      <Dropdown id={item.value} className={styles['user-plan']} onSelect={this.changeRatingType}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
            <span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
            <small className={styles['user-plan-calls']}>{item.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            return (
              <MenuItem href="javascript:void(0)" className={'text-right ' + styles['user-plan-item']}
                        key={itemC.value}
                        ref={itemC.value} eventKey={itemC.value}>
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
    const onChangeField = (field_name) => {
      return (event) => {
        let value = event;
        if (event.target) {
          value = event.target.value;
        }
        this.onChangeField(field_name, value);
      };
    };

    const reminderNotifications = this.state.reminder_notifications;
    const rating_type = this.state.rating_types.find((el) => el.selected);
    const default_notifications_tooltip = (
      <Tooltip id="tooltip"><p>These settings will reflect as default settings while creating a task.</p>
      </Tooltip>);

    return (<Grid className={styles["plain_part"]}>
        <h2 className={styles["header"]}>Basic Settings</h2>
            <NotificationManager notifications={this.state.notifications}/>
            {this.state.loaded ?
              (<Form horizontal className="custom-form container" onSubmit={this.save}>
                  <FormGroup controlId="communication">
                    <Row>
                      <OverlayTrigger placement="bottom" overlay={default_notifications_tooltip}>
                        <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                          Default comm. settings
                        </Col>
                      </OverlayTrigger>
                      <Col sm={2}>
                        <FormGroup onChange={(e) => {
                          this.setEmailSwitchState(e)
                        }} className={cx(styles.formGroup, styles.switch)}>
                          <SwitchButton name="email_notification" label="Email notification" checked={this.state.email}/>
                        </FormGroup>
                      </Col>
                      <Col sm={2}>
                        <FormGroup onChange={(e) => {
                          this.setSmsSwitchState(e)
                        }} className={cx(styles.formGroup, styles.switch)}>
                          <SwitchButton name="sms_notification" label="SMS notification" checked={this.state.sms}/>
                        </FormGroup>
                      </Col>
                    </Row>
                    <Row className="custom-form">
                      <Col sm={12}>
                        <FormGroup controlId="user-plan">
                          <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                            Customer Reminders
                          </Col>
                          <Col sm={10}>
                            {this.renderTaskReminderNotifications(reminderNotifications)}
                          </Col>
                        </FormGroup>
                      </Col>
                      <Col sm={12}>
                        <FormGroup controlId="enable_customer_task_confirmation">
                          <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                            Customer task confirmation
                          </Col>
                          <Col sm={10}>
                            {this.renderEnableCustomerTaskConfirmation(this.state.customer_task_confirmations)}
                          </Col>
                        </FormGroup>
                      </Col>
                      <Col sm={12}>
                        <FormGroup controlId="enable_late_and_no_show_notification">
                          <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                            Enable Late and No Show notification
                          </Col>
                          <Col sm={10}>
                            {this.renderEnableLateAndNoShowNotification(this.state.late_and_no_show_notification)}
                          </Col>
                        </FormGroup>
                      </Col>
                      <Col sm={12}>
                        <FieldGroup
                          componentClass='textarea'
                          onChange={onChangeField("confirmation_message_text")}
                          id="confirmation_message_text"
                          type='text'
                          label='Additional text to add on Confirmation Email'
                          value={this.state["confirmation_message_text"] || ''}
                          rows="4"
                        />
                      </Col>
                      <Col sm={12}>
                        <FormGroup>
                          <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                            <span>Exception list</span>
                            <p className={styles.labelCaptionSmall}>
                              Select exceptions to appear in exceptions list. To add an exception to this list please
                              email at <a href="mailto:exceptions@arrivy.com">exceptions@arrivy.com</a> with your request.
                            </p>
                          </Col>
                          <Col sm={10}>
                            <div className={styles['col-right']}>
                              <FormControl.Static className={styles.exceptionsListContainer}>
                                {this.renderExceptionsList()}
                              </FormControl.Static>
                            </div>
                          </Col>
                        </FormGroup>
                      </Col>
                      <Col sm={12}>
                        <FormGroup controlId="rating_type">
                          <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                            Rating Types
                          </Col>
                          <Col sm={10}>
                            {this.renderRatingType(this.state.rating_types)}
                          </Col>
                        </FormGroup>
                      </Col>
                      <Col sm={12}>
                        <FieldGroup
                          componentClass='textarea'
                          onChange={onChangeField("review_prompt_text")}
                          id="review_prompt_text"
                          type='text'
                          label='Text to replace prompt text on Review'
                          value={this.state["review_prompt_text"] || ''}
                          rows="4"
                        />
                      </Col>
                      <Col sm={12}>
                        <FieldGroup
                          componentClass='textarea'
                          onChange={onChangeField("negative_review_prompt_text")}
                          id="negative_review_prompt_text"
                          type='text'
                          label='Text to display on Negative Review (3 stars or less)'
                          value={this.state["negative_review_prompt_text"] || ''}
                          rows="4"
                        />
                      </Col>
                      <Col sm={12}>
                        <FieldGroup
                          componentClass={Slider}
                          onChange={rating_type && rating_type.value === 'NoRating' ? null : onChangeField("pending_review_reminder_attempts")}
                          min={0}
                          max={6}
                          labels={{0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6}}
                          id="review_reminder_attempts"
                          type='text'
                          label='Review Reminder Attempts'
                          value={this.state["pending_review_reminder_attempts"] || 0}
                          rows="1"
                          className={styles.rangeSliderCustom}
                          disabled={rating_type && rating_type.value === 'NoRating'}
                        />
                      </Col>
                      <Col sm={12}>
                        <FieldGroup
                          componentClass='textarea'
                          onChange={onChangeField("custom_webhook_url")}
                          id="custom_webhook_url"
                          type='text'
                          label='Custom Webhook URL'
                          value={this.state["custom_webhook_url"] || ''}
                          rows="2"
                        />
                      </Col>
                      <Col sm={12}>
                        <FormGroup>
                          <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                            Custom Webhook Authentication Keys
                          </Col>
                          <Col sm={10}>
                            <div className={styles['col-right']}>
                              <div className={styles.authKeysExtraFields}>
                                <ExtraFields fields={this.state.webhook_auth_keys} onChange={this.changeWebhookAuthKeys}
                                             buttonTitle="Add Auth Keys" entityTitle="Key" entityValueTitle="Value"/>
                              </div>
                            </div>
                          </Col>
                        </FormGroup>
                      </Col>
                      {/*<Col sm={12}>*/}
                      {/*<FieldGroup*/}
                      {/*componentClass='textarea'*/}
                      {/*onChange={onChangeField("ratings_fetch_url")}*/}
                      {/*id="ratings_fetch_url"*/}
                      {/*type='text'*/}
                      {/*label='Ratings Fetch URL'*/}
                      {/*value={this.state["ratings_fetch_url"] || ''}*/}
                      {/*rows="2"*/}
                      {/*/>*/}
                      {/*</Col>*/}
                      {/*<Col sm={12}>*/}
                      {/*<FormGroup>*/}
                      {/*<Col className="text-uppercase" componentClass={ControlLabel} sm={2}>*/}
                      {/*Ratings Fetch URL Authentication Keys*/}
                      {/*</Col>*/}
                      {/*<Col sm={10}>*/}
                      {/*<div className={styles['col-right']}>*/}
                      {/*<div className={styles.authKeysExtraFields}>*/}
                      {/*<ExtraFields fields={this.state.ratings_fetch_url_auth_keys} onChange={this.changeRatingsAuthKeys} buttonTitle="Add Auth Keys" entityTitle="Key" entityValueTitle="Value" />*/}
                      {/*</div>*/}
                      {/*</div>*/}
                      {/*</Col>*/}
                      {/*</FormGroup>*/}
                      {/*</Col>*/}
                    </Row>
                    <FormGroup>
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
                  </FormGroup>
                </Form>) :
                (<SavingSpinner title="Loading" size={8} borderStyle="none"/>)}

      </Grid>
    )
  }

  save(e) {
    this.setState({saving: true});
    e.preventDefault();
    e.stopPropagation();
    let reminder_notification_time = this.state.reminder_notifications.find((el) => el.selected);
    reminder_notification_time = reminder_notification_time ? reminder_notification_time : this.state.reminder_notifications[0];

    let rating_type = this.state.rating_types.find((el) => el.selected);
    rating_type = rating_type ? rating_type : this.state.rating_types[0];

    const enable_customer_task_confirmation = this.state.customer_task_confirmations.find((el) => el.selected);
    const enable_late_and_no_show_notification = this.state.late_and_no_show_notification.find((el) => el.selected);
    let authKeysArrayProcessed = null;
    if (this.state.webhook_auth_keys !== null && Array.isArray(this.state.webhook_auth_keys)) {
      authKeysArrayProcessed = {};
      this.state.webhook_auth_keys.map((key) => {
        authKeysArrayProcessed[key.name] = key.value;
      });
      authKeysArrayProcessed = JSON.stringify(authKeysArrayProcessed);
    } else {
      authKeysArrayProcessed = JSON.stringify(this.state.webhook_auth_keys);
    }

    let ratingFetchAuthKeysProcessed = null;
    if (this.state.ratings_fetch_url_auth_keys !== null && Array.isArray(this.state.ratings_fetch_url_auth_keys)) {
      ratingFetchAuthKeysProcessed = {};
      this.state.ratings_fetch_url_auth_keys.map((key) => {
        ratingFetchAuthKeysProcessed[key.name] = key.value;
      });
      ratingFetchAuthKeysProcessed = JSON.stringify(ratingFetchAuthKeysProcessed);
    } else {
      ratingFetchAuthKeysProcessed = JSON.stringify(this.state.ratings_fetch_url_auth_keys);
    }

    const exceptionsList = JSON.stringify(this.state.exceptions);
    let task_notifications_settings = {email: this.state.email, sms: this.state.sms};
    task_notifications_settings = JSON.stringify(task_notifications_settings);
    this.props.updateCustomCommunication(this.state).then(
      () => {
        this.props.updateProfileInformation({
          reminder_notification_time: reminder_notification_time.value,
          enable_customer_task_confirmation: enable_customer_task_confirmation.value,
          enable_late_and_no_show_notification: enable_late_and_no_show_notification.value,
          custom_webhook: this.state.custom_webhook_url,
          custom_webhook_authentication_keys: authKeysArrayProcessed,
          pending_review_reminder_attempts: (rating_type && rating_type.value === 'NoRating') ? 0 : this.state.pending_review_reminder_attempts,
          ratings_fetch_URL: this.state.ratings_fetch_url,
          ratings_fetch_URL_authentication_keys: ratingFetchAuthKeysProcessed,
          rating_type: rating_type.value,
          exceptions: exceptionsList,
          task_notifications_settings: task_notifications_settings,

        }).then((data) => {
          this.setState({
            saving: false
          }, () => {
            const updated = {
              text: 'Successfully updated',
              options: {
                type: toast.TYPE.SUCCESS,
                position: toast.POSITION.BOTTOM_LEFT,
                className: styles.toastSuccessAlert,
                autoClose: 8000
              }
            };
            this.props.createToastAlert(updated);
          });
        }, (reason) => {
          const error = JSON.parse(reason.responseText);
          this.setState({
            saving: false
          }, () => {
            const updateFailed = {
              text: 'An error occurred: ' + getErrorMessage(error),
              options: {
                type: toast.TYPE.ERROR,
                position: toast.POSITION.BOTTOM_LEFT,
                className: styles.toastErrorAlert,
                autoClose: 8000
              }
            };
            this.props.createToastAlert(updateFailed);
          });
        });
      },
      () => {
        this.setState({
          saving: false
        }, () => {
          const updateFailed = {
            text: 'An error occurred.',
            options: {
              type: toast.TYPE.ERROR,
              position: toast.POSITION.BOTTOM_LEFT,
              className: styles.toastErrorAlert,
              autoClose: 8000
            }
          };
          this.props.createToastAlert(updateFailed);
        });
      }
    );
  }


}
AccountCustomCommunication.propTypes = {
  updateProfileInformation: PropTypes.func.isRequired,
  updateCustomCommunication: PropTypes.func.isRequired,
  getCustomCommunication: PropTypes.func.isRequired,
  getProfileInformation: PropTypes.func.isRequired
};
