import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  Grid,
  Row,
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Dropdown,
  MenuItem,
} from 'react-bootstrap';
import NotificationManager from '../notification-manager/notification-manager';
import styles from './account-team-notifications.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import 'react-rangeslider/lib/index.css';
import moment from 'moment';
import TimePicker from 'rc-time-picker';
import 'rc-time-picker/assets/index.css';
import TimezonePicker from 'react-bootstrap-timezone-picker';
import 'react-bootstrap-timezone-picker/dist/react-bootstrap-timezone-picker.min.css';
// import { getMessagesNames } from '../../actions/custom-messages';
import { toast } from 'react-toastify';

const FieldGroup = ({id, label, staticField, fieldInfo, ...props}) => (
<FormGroup controlId={id} className={styles[id]}>
  <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
    {label}
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

export default class AccountTeamNotifications extends Component {
  constructor(props) {
    super(props);
    this.changeTeamConfirmation = this.changeTeamConfirmation.bind(this);
    this.renderTeamConfirmation = this.renderTeamConfirmation.bind(this);
    this.changeNotificationType = this.changeNotificationType.bind(this);
    this.renderNotificationType = this.renderNotificationType.bind(this);
    this.changeDaysBefore = this.changeDaysBefore.bind(this);
    this.renderDaysBefore = this.renderDaysBefore.bind(this);
    // this.changeMessageTemplate = this.changeMessageTemplate.bind(this);
    // this.renderMessageTemplate = this.renderMessageTemplate.bind(this);
    this.handleTimeChange = this.handleTimeChange.bind(this);
    this.handleTimezoneChange = this.handleTimezoneChange.bind(this);
    this.populateMessageName = this.populateMessageName.bind(this);

    this.save = this.save.bind(this);
    this.state = {
      notifications: [],
      team_confirmation: [
        {
          value: true,
          label: 'Enabled',
          details: 'Gives team members ability to confirm appointments'
        },
        {
          value: false,
          label: 'Disabled',
          details: 'Team members won\'t be able to confirm appointments'
        }
      ],
      notification_type: [
        {
          value: 'EMAIL',
          label: 'Email',
          details: 'Send notifications via Email'
        },
        {
          value: 'SMS',
          label: 'SMS',
          details: 'Send notifications via SMS'
        },
        {
          value: 'BOTH',
          label: 'Both',
          details: 'Send notifications via both Email and SMS'
        }
      ],
      days_before: [
        {
          label: 'Same Day',
          value: 0,
          details: 'Send notification on day of task'
        },
        {
          label: '1 day before',
          value: 1,
          details: 'Send notification one day before task'
        },
        {
          label: '2 days before',
          value: 2,
          details: 'Send notification two days before task'
        },
        {
          label: '3 days before',
          value: 3,
          details: 'Send notification three days before task'
        }
      ],
      // message_template: [],
      saving: false,
      loaded: false,
    };
  }

  componentDidMount() {
    this.props.getProfileInformation().then((data) => {
      const profile = JSON.parse(data);
      const { enable_team_confirmation, team_confirmation_time, team_confirmation_time_zone, team_confirmation_day, team_confirmation_notification_type, team_confirmation_custom_message } = profile;

      const team_confirmation = this.state.team_confirmation.map((item) => {
        item.selected = item.value === enable_team_confirmation;
        return item;
      });

      let notification_type_value = 'EMAIL';
      if (team_confirmation_notification_type !== null) {
        notification_type_value = team_confirmation_notification_type;
      }
      const notification_type = this.state.notification_type.map((item) => {
        item.selected = item.value === notification_type_value;
        return item;
      });

      let days_before_value = 1;
      if (team_confirmation_day !== null) {
        days_before_value = team_confirmation_day;
      }
      const days_before = this.state.days_before.map((item) => {
        item.selected = item.value === days_before_value;
        return item;
      });

      this.setState({
        loaded: true,
        team_confirmation,
        team_confirmation_time: team_confirmation_time !== null ? moment.utc(team_confirmation_time, 'HH:mm:ss') : moment.utc('5:00:00', 'HH:mm:ss'),
        team_confirmation_time_zone: team_confirmation_time_zone !== null ? team_confirmation_time_zone : 'America/Los_Angeles',
        days_before,
        notification_type,
      }, () => { this.populateMessageName(team_confirmation_custom_message); });
    });
  }

  populateMessageName(team_confirmation_custom_message) {
    // getMessagesNames().then((res) => {
    //   const messages = JSON.parse(res);
    //   let custom_message = 'Team Task Confirmation Notification';
    //   if (team_confirmation_custom_message !== null) {
    //     custom_message = team_confirmation_custom_message;
    //   }
    //   const message_template = messages.map((item) => {
    //     const option = {
    //       value: item.name,
    //       label: item.name,
    //       details: item.type,
    //       selected: item.name === custom_message
    //     };
    //     return option;
    //   });
    //   this.setState({
    //     message_template
    //   });
    // }).catch((err) => {
    //   console.log(err);
    // });
  }

  handleTimeChange(value) {
    this.setState({
      team_confirmation_time: value
    });
  }

  handleTimezoneChange(value) {
    this.setState({
      team_confirmation_time_zone: value
    });
  }

  changeTeamConfirmation(value) {
    const team_confirmation = this.state.team_confirmation.map((item) => {
      item.selected = item.value === value;
      return item;
    });
    this.setState({ team_confirmation });
  }

  renderTeamConfirmation(list) {
    let item = list.find((itemC) => itemC.selected);
    item = item ? item : list[1];
    return (
      <Dropdown id={item.value} className={styles['user-plan']} onSelect={this.changeTeamConfirmation}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
            <span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
            <small className={styles['user-plan-calls']}>{item.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            if (!itemC.selected) {
              return (
                <MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value} href="javascript:void(0)">
                  <div className={styles['user-plan-info']}>
                    <span className={'text-uppercase ' + styles['user-plan-name']}>{itemC.label}</span>
                    <small className={styles['user-plan-calls']}>{itemC.details}</small>
                  </div>
                </MenuItem>
              );
            }
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  changeNotificationType(value) {
    const notification_type = this.state.notification_type.map((item) => {
      item.selected = item.value === value;
      return item;
    });
    this.setState({ notification_type });
  }

  renderNotificationType(list) {
    let item = list.find((itemC) => itemC.selected);
    item = item ? item : list[0];
    return (
      <Dropdown id={item.value} className={styles['user-plan']} onSelect={this.changeNotificationType}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
            <span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
            <small className={styles['user-plan-calls']}>{item.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            if (!itemC.selected) {
              return (
                <MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value} href="javascript:void(0)">
                  <div className={styles['user-plan-info']}>
                    <span className={'text-uppercase ' + styles['user-plan-name']}>{itemC.label}</span>
                    <small className={styles['user-plan-calls']}>{itemC.details}</small>
                  </div>
                </MenuItem>
              );
            }
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  changeDaysBefore(value) {
    const days_before = this.state.days_before.map((item) => {
      item.selected = item.value === value;
      return item;
    });
    this.setState({ days_before });
  }

  renderDaysBefore(list) {
    let item = list.find((itemC) => itemC.selected);
    item = item ? item : list[1];
    return (
      <Dropdown id={item.value} className={styles['user-plan']} onSelect={this.changeDaysBefore}>
        <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
          <div className={styles['user-plan-info']}>
            <span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
            <small className={styles['user-plan-calls']}>{item.details}</small>
          </div>
        </Dropdown.Toggle>
        <Dropdown.Menu className={styles['user-plan-menu']}>
          {list.map((itemC) => {
            if (!itemC.selected) {
              return (
                <MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value} href="javascript:void(0)">
                  <div className={styles['user-plan-info']}>
                    <span className={'text-uppercase ' + styles['user-plan-name']}>{itemC.label}</span>
                    <small className={styles['user-plan-calls']}>{itemC.details}</small>
                  </div>
                </MenuItem>
              );
            }
          })}
        </Dropdown.Menu>
      </Dropdown>
    );
  }

  // changeMessageTemplate(value) {
  //   const message_template = this.state.message_template.map((item) => {
  //     item.selected = item.value === value;
  //     return item;
  //   });
  //   this.setState({ message_template });
  // }
  //
  // renderMessageTemplate(list) {
  //   let item = list.find((itemC) => itemC.selected);
  //   item = item ? item : list[0];
  //   return (
  //     <Dropdown id={item.value} className={styles['user-plan']} onSelect={this.changeMessageTemplate}>
  //       <Dropdown.Toggle className={'custom-dropdown ' + styles['user-plan-toggle']}>
  //         <div className={styles['user-plan-info']}>
  //           <span className={'text-uppercase ' + styles['user-plan-name']}>{item.label}</span>
  //           <small className={styles['user-plan-calls']}>{item.details}</small>
  //         </div>
  //       </Dropdown.Toggle>
  //       <Dropdown.Menu className={styles['user-plan-menu']}>
  //         {list.map((itemC) => {
  //           if (!itemC.selected) {
  //             return (
  //               <MenuItem className={'text-right ' + styles['user-plan-item']} key={itemC.value} ref={itemC.value} eventKey={itemC.value}>
  //                 <div className={styles['user-plan-info']}>
  //                   <span className={'text-uppercase ' + styles['user-plan-name']}>{itemC.label}</span>
  //                   <small className={styles['user-plan-calls']}>{itemC.details}</small>
  //                 </div>
  //               </MenuItem>
  //             );
  //           }
  //         })}
  //       </Dropdown.Menu>
  //     </Dropdown>
  //   );
  // }


  render() {
    const team_confirmation = this.state.team_confirmation.find((el) => el.selected);
    let showTeamConfirmationFields = false;
    if (typeof team_confirmation !== 'undefined') {
      showTeamConfirmationFields = team_confirmation.value;
    }

    return (<Grid className={styles["plain_part"]}>
      <h2 className={styles["header"]}>Team Notifications</h2>
      <p className={styles.infoMessage}>
        Team Notification allows you to automatically send email or text messages to team members notifying them of their day's assignments. Team members can respond by accepting or rejecting those assignments.
        <br/><br/>
        Note: A single email/SMS will be sent to each team member listing all their assignments.
        <br/><br/><br/>
      </p>
      <NotificationManager notifications={this.state.notifications}/>
      {this.state.loaded ?
        (<Form horizontal className="custom-form container" onSubmit={this.save}>
          <FormGroup controlId="communication">
            <div id="integration_part">
              <Row className="custom-form">
                <Col sm={12}>
                  <FormGroup controlId="team_confirmation">
                    <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                      Team confirmation
                    </Col>
                    <Col sm={10}>
                      {this.renderTeamConfirmation(this.state.team_confirmation)}
                    </Col>
                  </FormGroup>
                </Col>
                {showTeamConfirmationFields &&
                <div>
                  <Col sm={12}>
                    <FieldGroup
                      componentClass={TimezonePicker}
                      onChange={(value) => this.handleTimezoneChange(value)}
                      id="team_confirmation_time_zone"
                      type="text"
                      label="Timezone"
                      value={this.state['team_confirmation_time_zone']}
                      rows="1"
                      className={styles.timezonePickerInstance}
                      placeholder="Timezone is required"
                      required
                    />
                  </Col>
                  <Col sm={12}>
                    <FieldGroup
                      componentClass={TimePicker}
                      onChange={(value) => this.handleTimeChange(value)}
                      id="team_confirmation_time"
                      type="text"
                      label="Notification Time"
                      value={moment(this.state['team_confirmation_time']).utc()}
                      rows="2"
                      className={styles.rcTimePickerInstance}
                      allowEmpty={false}
                    />
                  </Col>
                  <Col sm={12}>
                    <FormGroup controlId="days_before">
                      <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                        Days before task
                      </Col>
                      <Col sm={10}>
                        {this.renderDaysBefore(this.state.days_before)}
                      </Col>
                    </FormGroup>
                  </Col>
                  <Col sm={12}>
                    <FormGroup controlId="notification_type">
                      <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
                        Notification Type
                      </Col>
                      <Col sm={10}>
                        {this.renderNotificationType(this.state.notification_type)}
                      </Col>
                    </FormGroup>
                  </Col>
                  {/*{this.state.message_template.length !== 0 &&*/}
                  {/*<Col sm={12}>*/}
                    {/*<FormGroup controlId="template">*/}
                      {/*<Col className="text-uppercase" componentClass={ControlLabel} sm={2}>*/}
                        {/*Message Template*/}
                      {/*</Col>*/}
                      {/*<Col sm={10}>*/}
                        {/*{this.renderMessageTemplate(this.state.message_template)}*/}
                      {/*</Col>*/}
                    {/*</FormGroup>*/}
                  {/*</Col>*/}
                  {/*}*/}
                </div>
                }
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
            </div>
          </FormGroup>
        </Form>) :
        (<SavingSpinner size={8} borderStyle="none" title="Loading" />)}
    </Grid>)
  }

  save(e) {
    this.setState({saving: true});
    e.preventDefault();
    e.stopPropagation();
    const team_confirmation = this.state.team_confirmation.find((el) => el.selected);
    const notification_type = this.state.notification_type.find((el) => el.selected);
    const days_before = this.state.days_before.find((el) => el.selected);
    // const message_template = this.state.message_template.find((el) => el.selected);
    this.props.updateProfileInformation({
      enable_team_confirmation: team_confirmation.value,
      team_confirmation_time: this.state.team_confirmation_time.format('HH:mm:ss'),
      team_confirmation_time_zone: this.state.team_confirmation_time_zone,
      team_confirmation_day: days_before.value,
      team_confirmation_notification_type: notification_type.value,
      // team_confirmation_custom_message: message_template.value
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
		      text: 'An error occurred: ' + error.description,
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
  }
}

AccountTeamNotifications.propTypes = {
  updateProfileInformation: PropTypes.func.isRequired,
  getProfileInformation: PropTypes.func.isRequired
};
