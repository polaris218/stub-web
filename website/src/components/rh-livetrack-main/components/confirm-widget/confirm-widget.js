import React, { Component } from 'react';
import styles from './confirm-widget.module.scss';
import { Modal, Alert, Grid, Button, Row, FormControl } from 'react-bootstrap';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import cx from 'classnames';
import moment from 'moment';
import { parseQueryParams } from '../../../../helpers';

export default class ConfirmWidget extends Component {
  constructor(props) {
    super(props);
    this.state = {
      alerts: [],
      showDeclineReasonModal: false,
      showConfirmationSection: false,
      decline_reason: '',
      serverActionPending: false,
    };
    this.confirm = this.confirm.bind(this);
    this.decline = this.decline.bind(this);
    this.hideConfirmationModal = this.hideConfirmationModal.bind(this);
  }

  componentDidMount() {
    let showConfirmationSection = false;
    const queryString = parseQueryParams(window.location.search);
    if (this.props.confirmation_needed) {
      if (queryString.confirm === '1') {
        this.confirm();
      } else if (queryString.confirm === '0') {
        this.decline();
      } else {
        showConfirmationSection = true;
      }
    }
    this.setState({
      showConfirmationSection
    });
  }

  onDeclineReasonChange(decline_reason) {
    this.setState({
      decline_reason
    });
  }

  confirm() {
    this.setState({
      serverActionPending: true
    });
    this.props.confirmTask(this.props.company_name, this.props.task_url).then(result => {
      this.addAlert({
        content: 'Thank you for confirming!'
      });
      this.setState({
        showConfirmationSection: false,
        serverActionPending: false
      });
    }).catch(error => {
      this.addAlert({
        bsStyle: 'danger',
        content: 'Something went wrong. Please reach out to us on email or phone.'
      });
      this.setState({
        serverActionPending: false
      });
    });
  }

  decline() {
    if (this.state.showDeclineReasonModal) {
      this.setState({
        showDeclineReasonModal: false,
        serverActionPending: true
      });
      this.props.declineTask(this.props.company_name, this.props.task_url, this.state.decline_reason).then(result => {
        this.addAlert({
          content: 'Thanks for letting us know!'
        });
        this.setState({
          showConfirmationSection: false,
          serverActionPending: false
        });
      }).catch(error => {
        this.addAlert({
          bsStyle: 'danger',
          content: 'Something went wrong. Please reach out to us on email or phone.',
        });
        this.setState({
          serverActionPending: false
        });
      });
    } else {
      this.setState({
        showDeclineReasonModal: true,
        serverActionPending: false
      });
    }
  }

  removeAlert(idx) {
    this.setState({
      alerts: this.state.alerts.filter((alert, id) => {
        return id !== idx;
      })
    });
  }

  addAlert(alert) {
    const alerts = this.state.alerts,
      removeAlert = this.removeAlert.bind(this);
    alert['timeout'] = function(idx) {
      setTimeout(() => {
        removeAlert(idx);
      }, 1e4);
    };
    alerts.push(alert);
    this.setState({
      alerts
    });
  }

  hideConfirmationModal() {
    this.setState({
      showDeclineReasonModal: false
    });
  }

  renderConfirmationSection() {
    if (this.state.showConfirmationSection) {
      const task = this.props.task;
      let date_time_str = 'Scheduled at ' + moment.utc(task.start_datetime).local().format('MMMM DD hh:mm A');
      if (task.unscheduled) {
        if (task.start_datetime) {
          date_time_str = 'Scheduled at ' + moment.utc(task.start_datetime).local().format('MMMM DD');
        } else {
          date_time_str = 'Not yet scheduled';
        }
      }

      if (task.enable_time_window_display) {
        const window_time = moment.utc(task.start_datetime).local().add(task.time_window_start, 'minutes');
        date_time_str = 'Scheduled on ' + moment.utc(task.start_datetime).local().format('MMMM DD hh:mm A') + '-' + window_time.format('hh:mm A');
      }

      return (
        <Grid className={styles["confirm-widget-confirmation-section-container"]}>
          <div>
            <div className={styles["header-text"]}>
              Please confirm your availability for this appointment: <strong>{ date_time_str }</strong>
              { (this.props.task.customer_address !== null || this.props.task.customer_address !== '') && <span> at <strong>{this.props.task.customer_address}</strong></span> }
            </div>
            {this.state.serverActionPending &&
            <div className={styles.loadingSpinnerContainer}>
              <SavingSpinner borderStyle="none" title="Saving" />
            </div>
            }
            {!this.state.serverActionPending &&
            <div>
              <Button className={cx("green-btn", styles['confirm-button'])} onClick={ this.confirm }>
                Confirm
              </Button>
              <Button className={cx(styles['decline-button'])} onClick={ this.decline }>
                Decline
              </Button>
            </div>
            }
            {this.props.confirmation_message_text && <div className={cx(styles['customMessage'])}>
              <i>*{this.props.confirmation_message_text}</i>
            </div>
            }
          </div>
        </Grid>
      )
    } else {
      return null;
    }
  }

  render() {
    if (!this.props.confirmation_needed) return null;
    return (
      <div className={styles["confirm-widget-confirmation-section"]}>
        {
          this.state.alerts && this.state.alerts.map((alert, idx) => {
            return (
              <Alert className={styles.confirmationAlerts} key={idx} bsStyle={alert.bsStyle}>
                <strong>{alert.content}</strong>
              </Alert>
            );
          })
        }
        {
          this.renderConfirmationSection()
        }
        <Modal className={styles.declineResonModal} show={ this.state.showDeclineReasonModal } onHide={this.hideConfirmationModal}>
          <Modal.Header className={styles.addNoteModalHeader} closeButton>
            <Modal.Title className="text-center">
              <h2 className={styles.addNoteModalHeading}>Please share a reason to decline the appointment</h2>
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className={styles["confirm-widget-modal"]}>
            <FormControl placeholder="Decline reason ..." className={styles.declineResonField} componentClass="textarea" onChange={ (event) => this.onDeclineReasonChange(event.target.value) } id="decline_reason" />
          </Modal.Body>
          <Modal.Footer className={styles.addNoteModalFooter}>
            <Button disabled={ !this.state.decline_reason } onClick={ this.decline } className={cx(styles["decline-button"])}>Decline</Button>
          </Modal.Footer>
        </Modal>
      </div>

    );
  }

}
