import React, {Component} from 'react';
import PropTypes from 'prop-types';

import { Button, Alert, Modal, FormControl, Row, Col, Grid } from 'react-bootstrap';
import styles from './confirm-widget.module.scss';
import cx from 'classnames';
import SavingSpinner from '../../saving-spinner/saving-spinner';


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
    const queryString = window.location.search;
    if (this.props.confirmation_needed) {
      if (queryString === '?confirm=1') {
        this.confirm();
      } else if (queryString === '?confirm=0') {
        this.decline();
      } else {
        showConfirmationSection = true;
      }
    }
    this.setState({ showConfirmationSection });
  }

  onDeclineReasonChange(decline_reason) {
    this.setState({ decline_reason });
  }

  confirm() {
    this.setState({ serverActionPending: true });
    this.props.confirmTask(this.props.company_name, this.props.task_url).then(result => {
      this.addAlert({ content: 'Thank you for confirming!' });
      this.setState({ showConfirmationSection: false, serverActionPending: false });
    }).catch(error => {
      this.addAlert({ bsStyle: 'danger', content: 'Something went wrong. Please reach out to us on email or phone.' });
      this.setState({ serverActionPending: false });
    });
  }

  decline() {
    if (this.state.showDeclineReasonModal) {
      this.setState({ showDeclineReasonModal: false });
      this.props.declineTask(this.props.company_name, this.props.task_url, this.state.decline_reason).then(result => {
        this.addAlert({ content: 'Thanks for letting us know!' });
        this.setState({ showConfirmationSection: false });
      }).catch(error => {
        this.addAlert({ bsStyle: 'danger', content: 'Something went wrong. Please reach out to us on email or phone.' });
      });
    } else {
      this.setState({ showDeclineReasonModal: true });
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
      return (
      <Grid className={styles["confirm-widget-confirmation-section-container"]}>
        <div>
          <div className={styles["header-text"]}>Please confirm your availability for this appointment:</div>
          {this.state.serverActionPending &&
            <div className={styles.loadingSpinnerContainer}>
              <SavingSpinner borderStyle="none" title="Saving" />
            </div>
          }
          {!this.state.serverActionPending &&
            <div>
              <Button className={cx("green-btn", styles['confirm-button'])} onClick={ this.confirm }>
                Yes
              </Button>
              <Button className={cx(styles['decline-button'])} onClick={ this.decline }>
                No
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
              return (<Alert key={idx} bsStyle={alert.bsStyle}>
                
                <strong>{alert.content}</strong>
              </Alert>);
            })
          }
          {
            this.renderConfirmationSection()
          }
          <Modal dialogClassName="video-modal" bsSize="lg" show={ this.state.showDeclineReasonModal } onHide={this.hideConfirmationModal}>
            <Modal.Header closeButton bsSize="large">
              <h3>Please share a reason to decline the appointment</h3>
            </Modal.Header>
            <div className={styles["confirm-widget-modal"]}>
              <Row>
                  <FormControl componentClass="textarea" onChange={ (event) => this.onDeclineReasonChange(event.target.value) } id="decline_reason" />
                  <Button disabled={ !this.state.decline_reason } onClick={ this.decline } className={cx(styles["decline-button"])}>Decline</Button>
              </Row>
            </div>
          </Modal>
      </div>

    );
  }
}


ConfirmWidget.PropTypes = {
  confirmation_needed: PropTypes.bool.isRequired,
  confirmation_message_text: PropTypes.string.isRequired,
  company_name: PropTypes.string.isRequired,
  task_url: PropTypes.string.isRequired,
  confirmTask: PropTypes.func.isRequired,
  declineTask: PropTypes.func.isRequired,
};
