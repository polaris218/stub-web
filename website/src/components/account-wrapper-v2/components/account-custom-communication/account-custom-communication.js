import React, { Component } from 'react';
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
  Checkbox, TabList, TabPanel
} from 'react-bootstrap';
import NotificationManager from '../../../notification-manager/notification-manager';
import styles from './account-custom-communication.module.scss';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import ExtraFieldsV2 from '../../../extra-fields-v2/extra-fields-v2';
import Slider from 'react-rangeslider';
import 'react-rangeslider/lib/index.css';
import 'rc-time-picker/assets/index.css';
import 'react-bootstrap-timezone-picker/dist/react-bootstrap-timezone-picker.min.css';
import { getErrorMessage } from '../../../../helpers/task';
import { toast } from 'react-toastify';
import { EXCEPTION_REASONS } from '../../../../helpers';
import $ from 'jquery';
import cx from 'classnames';
import SwitchButton from "../../../../helpers/switch_button";
import Equalizer from 'react-equalizer';

const tooltip = (
  <Tooltip id="tooltip">Arrivy sends reminder emails & sms to customers who haven't shared feedback of their experience. The selected value dictates the number of attempts Arrivy will make to get the feedback</Tooltip>
);

const FieldGroup = ({ id, label, staticField, fieldInfo, ...props }) => (
  <FormGroup controlId={id} className={styles[id]}>
    <ControlLabel componentClass={ControlLabel}>
      {id === 'review_reminder_attempts' &&
      <OverlayTrigger placement="bottom" overlay={tooltip}>
        <span>{label}</span>
      </OverlayTrigger>}
      {id !== 'review_reminder_attempts' && label}
    </ControlLabel>
    {staticField ?
      (<FormControl.Static>
        {props.value}
      </FormControl.Static>) :
      (<FormControl {...props} />)
    }
    {fieldInfo}
  </FormGroup>
);

export default class AccountCustomCommunication extends Component {
  constructor(props) {
    super(props);
    this.getNodes = this.getNodes.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.changeEnableCustomerTaskNotification = this.changeEnableCustomerTaskNotification.bind(this);
    this.changeEnableLateAndNoShowNotification = this.changeEnableLateAndNoShowNotification.bind(this);
    this.changeReminderTime = this.changeReminderTime.bind(this);
    this.changeCalendarWeekStarts = this.changeCalendarWeekStarts.bind(this);
    this.changeMileageUnits = this.changeMileageUnits.bind(this);
    this.changeFieldCrewViewPermission = this.changeFieldCrewViewPermission.bind(this);
    this.changeWebhookAuthKeys = this.changeWebhookAuthKeys.bind(this);
    this.changeRatingsAuthKeys = this.changeRatingsAuthKeys.bind(this);
    this.renderRatingType = this.renderRatingType.bind(this);
    this.changeRatingType = this.changeRatingType.bind(this);
    this.renderExceptionsList = this.renderExceptionsList.bind(this);
    this.handleExceptionsListItemSelect = this.handleExceptionsListItemSelect.bind(this);
    this.setEmailSwitchState = this.setEmailSwitchState.bind(this);
    this.setSmsSwitchState = this.setSmsSwitchState.bind(this);
    this.changeEnableDocuments = this.changeEnableDocuments.bind(this);

    this.save = this.save.bind(this);
    this.state = {
      notifications: [],
      webhook_auth_keys: null,
      ratings_fetch_url_auth_keys: null,
      emailSwitch: false,
      smsSwitch: false,
      customer_task_confirmations: false,
      late_and_no_show_notification: false,
      can_field_crew_view_contact_info: true,
      rating_types: [
        {
          label: '5-Star',
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
      confirmation_message_text: '',
      review_prompt_text: '',
      negative_review_prompt_text: '',
      reminder_notification_time: 0,
      calendar_week_starts_from: 'SUNDAY',
      custom_webhook_url: '',
      ratings_fetch_url: '',
      saving: false,
      loaded: false,
      exceptions: null,
      email: true,
      sms: true,
      mileage_unit: null,
    };
  }

  componentDidMount() {
    this.props.getCustomCommunication().then((data) => {
      const customizations = JSON.parse(data);
      const { confirmation_message_text, review_prompt_text, negative_review_prompt_text } = customizations;
      this.props.getProfileInformation().then((data) => {
        const profile = JSON.parse(data);
        const { reminder_notification_time, enable_customer_task_confirmation, enable_late_and_no_show_notification, custom_webhook, custom_webhook_authentication_keys, pending_review_reminder_attempts, ratings_fetch_URL, ratings_fetch_URL_authentication_keys, rating_type, calendar_week_starts_from, mileage_unit, is_documents_disabled, can_field_crew_view_contact_info } = profile;
        const customer_task_confirmations = enable_customer_task_confirmation;
        const rating_types = this.state.rating_types.map((item) => {
          item.selected = item.value === rating_type;
          return item;
        });
        const late_and_no_show_notification = enable_late_and_no_show_notification;
        const exceptionsList = profile.exceptions;
        let unitToShow = '';
        if (mileage_unit === 'KILOMETERS'){
          unitToShow = 'kilometers'
        } else {
          unitToShow = 'miles'
        }
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
          mileage_unit: unitToShow,
          exceptions: exceptionsList,
          reminder_notification_time,
          is_documents_disabled,
          can_field_crew_view_contact_info,
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
          }) : null,
          calendar_week_starts_from: calendar_week_starts_from ? calendar_week_starts_from.toUpperCase() : 'SUNDAY'
        });
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
          <Checkbox className={cx(styles.checkboxSecondary)} checked={isSelected} onChange={(e) => {
            this.handleExceptionsListItemSelect(e, exception);
          }} inline><span>{exception.notes}</span></Checkbox>
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
    if (value !== null && typeof value !== 'undefined') {
      this.state[field_name] = value;
    }
    else {
      this.state[field_name] = null;
    }
    this.state.notifications = [];
    this.setState(this.state);
  }

  changeEnableCustomerTaskNotification(e) {
    this.setState({ customer_task_confirmations: e.target.checked });
  }

  changeEnableDocuments(e) {
    this.setState({ is_documents_disabled: !e.target.checked });
  }

  changeEnableLateAndNoShowNotification(e) {
    this.setState({ late_and_no_show_notification: e.target.checked });
  }

  changeReminderTime(e, value = null) {
    e.stopPropagation();
    this.setState({ reminder_notification_time: parseInt(value ? value : e.target.value) });
  }

  changeCalendarWeekStarts(e, value = null) {
    this.setState({ calendar_week_starts_from: (value ? value : e.target.value) });
  }

  changeMileageUnits(e, value = null) {
    this.setState({ mileage_unit: value ? value : e.target.value });
  }

  changeFieldCrewViewPermission(e) {
    this.setState({ can_field_crew_view_contact_info: e.target.value === 'true' });
  }

  changeRatingType(value) {
    const old_rating_type = this.state.rating_types.find((rating) => {
      return rating.selected === true;
    });
    const rating_types = this.state.rating_types.map((item) => {
      item.selected = item.value === value;
      return item;
    });
    const profile = this.state.profile;
    profile.rating_type = value;
    const defaultReviewReminderAttempts = (old_rating_type && old_rating_type.value === 'NoRating') ? 2 : this.state.pending_review_reminder_attempts;
    this.setState({
      profile,
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
      this.setState({ webhook_auth_keys: tempKeysArray });
    } else {
      this.setState({ webhook_auth_keys: null });
    }
  }

  changeRatingsAuthKeys(keys) {
    if (keys.length > 0) {
      const tempKeysArray = {};
      keys.map((key) => {
        tempKeysArray[key.name] = key.value;
      });
      this.setState({ ratings_fetch_url_auth_keys: tempKeysArray });
    } else {
      this.setState({ ratings_fetch_url_auth_keys: null });
    }
  }

  setEmailSwitchState(e) {
    this.setState({ email: e.target.checked });
  }

  setSmsSwitchState(e) {
    this.setState({ sms: e.target.checked });
  }

  renderRatingType(list) {
    let item = list.find((itemC) => itemC.selected);
    item = item ? item : list[0];
    return (
      <Dropdown id={item.value} className={styles['user-plan']} onSelect={this.changeRatingType}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
            <span className={styles['user-plan-name']}>{item.label}</span>
            <small className={styles['user-plan-calls']}>{item.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            return (
              <MenuItem href="javascript:void(0)" className={styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value}>
                <div className={styles['user-plan-info']}>
                  <span className={styles['user-plan-name']}>{itemC.label}</span>
                  <small className={styles['user-plan-calls']}>{itemC.details}</small>
                </div>
              </MenuItem>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  getNodes(equalizerComponent, equalizerElement) {
    this.node1 = this.refs.taskRef;
    this.node2 = this.refs.taskRef2;
    if (this.node1 && this.node2) {
      return [
        this.node1,
        this.node2,
      ]
    }
    return [];
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

    const labelForNegativeReviews = "Text To Replace On Negative Review " +
      (((!this.state.profile || !this.state.profile.rating_type || this.state.profile.rating_type.toUpperCase() === 'FIVESTAR') ? "(3 Stars or Less)" : "") +
        (this.state.profile && this.state.profile.rating_type && this.state.profile.rating_type.toUpperCase() === 'NPS' ? "(6 Points or Less)" : "") +
        (this.state.profile && this.state.profile.rating_type && this.state.profile.rating_type.toUpperCase() === 'THUMBSUPDOWN' ? "(Thumbs Down)" : ""));

    const rating_type = this.state.rating_types.find((el) => el.selected);
    const default_notifications_tooltip = (
      <Tooltip id="tooltip"><p>These settings will reflect as default settings while creating a task.</p></Tooltip>);

    return (
      <div className={styles['plain_part']}>
        <NotificationManager notifications={this.state.notifications}/>
        <div className={cx(styles.box)}>
          <Grid>
            <h3 className={cx(styles.boxTitle)}>Basic Settings</h3>
            {this.state.loaded ?
              (<Form onSubmit={this.save}>
                <Equalizer enabled={() => window.matchMedia("(min-width: 992px)").matches} nodes={this.getNodes}>
                  <Row className="clearfix">
                    <Col lg={6} md={12} sm={12} xs={12}>
                      <div className={cx(styles.boxBody)} ref="taskRef">
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup>
                            <ControlLabel componentClass={ControlLabel}>
                              <OverlayTrigger placement="bottom" overlay={default_notifications_tooltip}>
                                <span>Default Communication Settings</span>
                              </OverlayTrigger>
                            </ControlLabel>
                            <div className={cx(styles.settingsCheck)}>
                              <div className={styles.checkBox}>
                                <Checkbox
                                  name="email_notification"
                                  checked={this.state.email} onChange={(e) => {this.setEmailSwitchState(e);}}
                                  inline>
                                  <span>Email notification</span>
                                </Checkbox>
                              </div>
                              <div className={styles.checkBox}>
                                <Checkbox
                                  name="sms_notification"
                                  checked={this.state.sms}
                                  onChange={(e) => {this.setSmsSwitchState(e);}}
                                  inline>
                                  <span>SMS notification</span>
                                </Checkbox>
                              </div>
                            </div>
                          </FormGroup>
                        </div>
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup controlId="user-plan" className={cx(styles.userPlanWrapper)}>
                            <ControlLabel componentClass={ControlLabel}>Customer Reminders</ControlLabel>
                            <div className={styles.checkBox}>
                              <Checkbox
                                name="reminder_notifications"
                                checked={this.state.reminder_notification_time} onChange={(e) => {this.changeReminderTime(e, this.state.reminder_notification_time ? '0' : '24');}}
                                inline>
                                <span>Send Customer reminders</span>
                              </Checkbox>
                            </div>
                            <div className={styles.selectBox}>
                              <FormControl onChange={this.changeReminderTime} disabled={!this.state.reminder_notification_time} componentClass="select" placeholder="select" className={styles['form-control']}>
                                <option value="24" selected={this.state.reminder_notification_time === 24}>1 Day</option>
                                <option value="36" selected={this.state.reminder_notification_time === 36}>1 Day 12 Hours</option>
                                <option value="48" selected={this.state.reminder_notification_time === 48}>2 Days</option>
                                <option value="72" selected={this.state.reminder_notification_time === 72}>3 Days</option>
                              </FormControl>
                            </div>
                            before the scheduled appointment
                          </FormGroup>
                        </div>
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup controlId="user-plan" className={cx(styles.DropDownWrapper)}>
                            <span>Calendar Week Starts on</span>
                            <div className={styles.selectBox}>
                              <FormControl onChange={this.changeCalendarWeekStarts} componentClass="select" placeholder="select" className={styles['form-control']}>
                                <option value="SUNDAY" selected={this.state.calendar_week_starts_from === "SUNDAY"}>Sunday</option>
                                <option value="MONDAY" selected={this.state.calendar_week_starts_from === "MONDAY"}>Monday</option>
                                <option value="TUESDAY" selected={this.state.calendar_week_starts_from === "TUESDAY"}>Tuesday</option>
                                <option value="WEDNESDAY" selected={this.state.calendar_week_starts_from === "WEDNESDAY"}>Wednesday</option>
                                <option value="THURSDAY" selected={this.state.calendar_week_starts_from === "THURSDAY"}>Thursday</option>
                                <option value="FRIDAY" selected={this.state.calendar_week_starts_from === "FRIDAY"}>Friday</option>
                                <option value="SATURDAY" selected={this.state.calendar_week_starts_from === "SATURDAY"}>Saturday</option>
                              </FormControl>
                            </div>
                          </FormGroup>
                        </div>
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup controlId="user-plan" className={cx(styles.DropDownWrapper)}>
                            <span>Report Mileage in</span>
                            <div className={styles.selectBox}>
                              <FormControl onChange={this.changeMileageUnits} componentClass="select" placeholder="select" className={styles['form-control']}>
                                <option value="miles" selected={this.state.mileage_unit && this.state.mileage_unit.toUpperCase() === 'MILES'}>Miles</option>
                                <option value="kilometers" selected={this.state.mileage_unit && this.state.mileage_unit.toUpperCase() === 'KILOMETERS'}>Kilometers</option>
                              </FormControl>
                            </div>
                          </FormGroup>
                        </div>
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup controlId="field-crew-permission" className={cx(styles.DropDownWrapper)}>
                            <span>Field crew can view customer info:</span>
                            <div className={styles.selectBox}>
                              <FormControl onChange={this.changeFieldCrewViewPermission} componentClass="select" placeholder="select" className={styles['form-control']}>
                                <option value={true} selected={this.state.can_field_crew_view_contact_info}>All contact info</option>
                                <option value={false} selected={!this.state.can_field_crew_view_contact_info}>Address only (hide phone/email)</option>
                              </FormControl>
                            </div>
                          </FormGroup>
                        </div>
                        {/*<div className={cx(styles.boxBodyInner)}>*/}
                          {/*<FormGroup controlId="enable_documents" onChange={this.changeEnableDocuments} className={cx(styles.switch)}>*/}
                            {/*<span>Documents</span>*/}
                            {/*<SwitchButton*/}
                              {/*name="enable_documents"*/}
                              {/*label={this.state.is_documents_disabled ? "Disable documents usage" : "Enable documents to use with tasks"}*/}
                              {/*checked={!this.state.is_documents_disabled}*/}
                            {/*/>*/}
                          {/*</FormGroup>*/}
                        {/*</div>*/}
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup controlId="enable_late_and_no_show_notification" onChange={(e) => {
                            this.changeEnableLateAndNoShowNotification(e)
                          }} className={cx(styles.switch)}>
                            <span>Late And No Show Notification</span>
                            <SwitchButton
                              name="late_and_no_show_notification"
                              label={this.state.late_and_no_show_notification ? "Enable late and no show notifications" : "Disable late and no show notifications"}
                              checked={this.state.late_and_no_show_notification}
                            />
                          </FormGroup>
                        </div>
                        <div className={cx(styles.boxBodyInner)}>
                          <FormGroup controlId="enable_customer_task_confirmation" onChange={(e) => {
                            this.changeEnableCustomerTaskNotification(e)
                          }} className={cx(styles.switch)}>
                            <span>Customer Task Confirmation</span>
                            <SwitchButton
                              name="customer_task_confirmations"
                              label={this.state.customer_task_confirmations ? "Gives customer ability to confirm appointment" : "Customer won't be able to confirm appointment"}
                              checked={this.state.customer_task_confirmations}
                            />
                          </FormGroup>
                        </div>
                        <div className={cx(styles.boxBodyInner)}>
                          <FieldGroup
                            componentClass='textarea'
                            onChange={onChangeField('confirmation_message_text')}
                            id="confirmation_message_text"
                            type='text'
                            label='Additional Text To Add On Confirmation Email'
                            value={this.state['confirmation_message_text'] || ''}
                            rows="4"
                          />
                        </div>
                      </div>
                    </Col>
                    <Col lg={6} md={12} sm={12} xs={12}>
                      <div className={cx(styles.boxBody, styles.exceptionsListBody)}>
                        <div className={cx(styles.boxBodyInner)} ref="taskRef2">
                          <FormGroup>
                            <ControlLabel componentClass={ControlLabel}>Exception List</ControlLabel>
                            <FormControl.Static className={styles.exceptionsListContainer}>
                              {this.renderExceptionsList()}
                            </FormControl.Static>
                            <p className={styles.labelCaptionSmall}>To add an exception to this list please email at <a href="mailto:support@arrivy.com">support@arrivy.com</a> with your request.</p>
                          </FormGroup>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </Equalizer>
                <h3 className={cx(styles.boxTitle)}>Ratings and Reviews</h3>
                <div className={cx(styles.boxBody)}>
                  <Row className="clearfix">
                    <Col lg={6} md={12} sm={12} xs={12}>
                      <div className={cx(styles.boxBodyInner, styles['pb-0'])}>
                        <FormGroup controlId="rating_type">
                          <ControlLabel componentClass={ControlLabel}>Rating Types</ControlLabel>
                          {this.renderRatingType(this.state.rating_types)}
                        </FormGroup>
                      </div>
                    </Col>
                    <Col lg={6} md={12} sm={12} xs={12}>
                      <div className={cx(styles.boxBodyInner, styles['pb-0'])}>
                        <div className={cx(styles.rangeSliderWrapper)}>
                          <FieldGroup
                            componentClass={Slider}
                            onChange={rating_type && rating_type.value === 'NoRating' ? null : onChangeField('pending_review_reminder_attempts')}
                            min={0}
                            max={6}
                            labels={{ 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 }}
                            id="review_reminder_attempts"
                            type='text'
                            label='Review Reminder Attempts'
                            value={this.state['pending_review_reminder_attempts'] || 0}
                            rows="1"
                            className={styles.rangeSliderCustom}
                            disabled={rating_type && rating_type.value === 'NoRating'}
                          />
                        </div>
                      </div>
                    </Col>
                    <Col lg={6} md={12} sm={12} xs={12}>
                      <div className={cx(styles.boxBodyInner, styles['pt-0'])}>
                        <FieldGroup
                          componentClass='textarea'
                          onChange={onChangeField('review_prompt_text')}
                          id="review_prompt_text"
                          type='text'
                          label='Text To Replace Prompt Text On Review'
                          value={this.state['review_prompt_text'] || ''}
                          rows="4"
                        />
                      </div>
                    </Col>
                    <Col lg={6} md={12} sm={12} xs={12}>
                      <div className={cx(styles.boxBodyInner, styles['pt-0'])}>
                        <FieldGroup
                          componentClass='textarea'
                          onChange={onChangeField('negative_review_prompt_text')}
                          id="negative_review_prompt_text"
                          type='text'
                          label={labelForNegativeReviews}
                          value={this.state['negative_review_prompt_text'] || ''}
                          rows="4"
                        />
                      </div>
                    </Col>
                  </Row>
                </div>
                <div className={cx(styles.boxBody)}>
                  <Row className="clearfix">
                    <Col lg={6} md={12} sm={12} xs={12}>
                      <div className={cx(styles.boxBodyInner)}>
                        <FieldGroup
                          componentClass='textarea'
                          onChange={onChangeField('custom_webhook_url')}
                          id="custom_webhook_url"
                          type='text'
                          label='Custom Webhook URL'
                          value={this.state['custom_webhook_url'] || ''}
                          rows="2"
                        />
                      </div>
                    </Col>
                    <Col lg={6} md={12} sm={12} xs={12}>
                      <div className={cx(styles.boxBodyInner)}>
                        <FormGroup>
                          <ControlLabel componentClass={ControlLabel}>Custom Webhook Authentication Keys</ControlLabel>
                          <div className={styles.authKeysExtraFields}>
                            <ExtraFieldsV2
                              fields={this.state.webhook_auth_keys}
                              onChange={this.changeWebhookAuthKeys}
                              buttonTitle="Add Auth Keys"
                              entityTitle="Key"
                              entityValueTitle="Value"
                            />
                          </div>
                        </FormGroup>
                      </div>
                    </Col>
                  </Row>
                </div>

                <div className="text-right">
                  <Button type="submit" disabled={this.state.saving} className={cx(styles.btn, styles['btn-secondary'])}>{this.state.saving ? <SavingSpinner size={8} borderStyle="none" /> : 'Save Changes'}</Button>
                </div>
              </Form>) : (<SavingSpinner title="Loading" size={8} borderStyle="none"/>)
            }
          </Grid>
        </div>
      </div>
    );
  }

  save(e) {
    this.setState({ saving: true });
    e.preventDefault();
    e.stopPropagation();
    let reminder_notification_time = this.state.reminder_notification_time;

    let rating_type = this.state.rating_types.find((el) => el.selected);
    rating_type = rating_type ? rating_type : this.state.rating_types[0];

    const enable_customer_task_confirmation = this.state.customer_task_confirmations;
    const enable_late_and_no_show_notification = this.state.late_and_no_show_notification;
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
    let task_notifications_settings = { email: this.state.email, sms: this.state.sms };
    task_notifications_settings = JSON.stringify(task_notifications_settings);

    const calendar_week_starts_from = this.state.calendar_week_starts_from.toUpperCase();
    const mileage_unit = this.state.mileage_unit;
    const is_documents_disabled = this.state.is_documents_disabled;

    this.props.updateCustomCommunication(this.state).then(
      () => {
        this.props.updateProfileInformation({
          reminder_notification_time,
          enable_customer_task_confirmation: enable_customer_task_confirmation,
          enable_late_and_no_show_notification: enable_late_and_no_show_notification,
          custom_webhook: this.state.custom_webhook_url,
          custom_webhook_authentication_keys: authKeysArrayProcessed,
          pending_review_reminder_attempts: (rating_type && rating_type.value === 'NoRating') ? 0 : this.state.pending_review_reminder_attempts,
          ratings_fetch_URL: this.state.ratings_fetch_url,
          ratings_fetch_URL_authentication_keys: ratingFetchAuthKeysProcessed,
          rating_type: rating_type.value,
          exceptions: exceptionsList,
          task_notifications_settings: task_notifications_settings,
          can_field_crew_view_contact_info: this.state.can_field_crew_view_contact_info,
          calendar_week_starts_from,
          mileage_unit,
          is_documents_disabled

        }).then((res) => {
          const profile = JSON.parse(res);
          this.setState({
            saving: false,
            profile
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
