import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Form, Modal, Button, FormControl, FormGroup } from 'react-bootstrap';

import styles from './subscribe-modal.scss';
import { subscribe } from '../../actions/subscribe';
import SavingSpinner from '../saving-spinner/saving-spinner';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faAngleDoubleRight} from '@fortawesome/fontawesome-free-solid';
import cx from 'classnames';

export default class SubscribeModal extends Component {
  constructor(props) {
    super(props);

    this.closeModal = props.closeModal;

    this.handleFullName   = this.handleFullName.bind(this);
    this.handleEmail  = this.handleEmail.bind(this);
    this.handleType   = this.handleType.bind(this);
    this.handlePhone  = this.handlePhone.bind(this);
    this.handleDetails = this.handleDetails.bind(this);
    this.submit       = this.submit.bind(this);

    this.state        = this.getDefaultState();
  }
  componentWillReceiveProps(nextProps) {
    if (nextProps.showModal && !this.state.subscribeSuccess) {
      this.setState(this.getDefaultState());
    }
  }
  componentDidUpdate() {
  }
  getDefaultState() {
    return {
      fullname: '',
      email: '',
      type: '',
      phone: '',
      details: '',
      subscribeSuccess: false,
      subscribeError: false,
      fullnameError: false,
      emailError: false,
      typeError: false,
      phoneError: false,
      detailsError: false,
      fetching: false
    };
  }
  handleFullName(e) {
    const value = e.target.value;
    if (value === '' || value.length <= 128) {
      this.setState({
        fullname: value,
        fullnameError: false
      });
    }
  }
  handleEmail(e) {
    const value = e.target.value;
    if (value === '' || value.length <= 128) {
      this.setState({
        email: value,
        emailError: false
      });
    }
  }
  handleType(e) {
    const value = e.target.value;
    if (value === '' || value.length <= 128) {
      this.setState({
        type: value,
        typeError: false
      });
    }
  }
  handlePhone(e) {
    const value = e.target.value;
    if (value === '' || value.length <= 32 && !isNaN(value)) {
      this.setState({
        phone: value,
        phoneError: false
      });
    }
  }
  
  handleDetails(e) {
    const value = e.target.value;
    if (value === '' || value.length <= 200 ) {
      this.setState({
        details: value,
        detailsError: false
      });
    }
  }
  submit() {
    const { fullname, email, type, phone, details } = this.state;
    if (!fullname)  {
      this.fullnameRef.focus();
      this.setState({ fullnameError: true });
    }
    if (!email) {
      this.emailRef.focus();
      this.setState({ emailError: true });
    }
    if (!type)  {
      this.typeRef.focus();
      this.setState({ typeError: true });
    }
    if (!phone) {
      this.phoneRef.focus();
      this.setState({ phoneError: true });
    }

    if (!fullname || !email || !type || !phone) {
      return;
    }

    this.setState({ fetching: true });
    subscribe({ fullname, email, type, phone, details })
      .then(() => {
        this.setState({
          subscribeSuccess: true,
          fetching: false
        });
      })
      .catch(() => {
        this.setState({
          subscribeError: true,
          fetching: false
        });
      });
  }
  render() {
    const { showModal } = this.props;
    return (
      <Modal
        id="subscribe-modal"
        show={showModal}
        onHide={this.closeModal}
        bsSize="large"
      >
        <Modal.Header closeButton bsSize="large">
          { !this.state.subscribeSuccess &&
            <h2>Learn and Improve!</h2>
          }
        </Modal.Header>
        <Modal.Body bsClass={ this.state.subscribeSuccess ? 'subscribe-success' : 'modal-body' }>
          { !this.state.subscribeSuccess
            ? (<div>
              <p style={{fontSize:'1em', fontWeight:300, paddingTop:'12px', textAlign:'center'}}>
                Please leave your contact information here. In case you are wondering, we never share your contact information with anyone else.
              </p>
              <Form id="subscribe-form">
                <FormGroup validationState={this.state.fullnameError ? 'error' : null}>
                  <FormControl placeholder="Full Name"
                    inputRef={ref => this.fullnameRef = ref}
                    value={this.state.fullname}
                    onChange={this.handleFullName}
                  />
                </FormGroup>
                <FormGroup validationState={this.state.emailError ? 'error' : null}>
                  <FormControl placeholder="Email"
                    inputRef={ref => this.emailRef = ref}
                    value={this.state.email}
                    onChange={this.handleEmail}
                  />
                </FormGroup>
                <FormGroup validationState={this.state.typeError ? 'error' : null}>
                  <FormControl placeholder="Company Name"
                    inputRef={ref => this.typeRef = ref}
                    value={this.state.type}
                    onChange={this.handleType}
                  />
                </FormGroup>
                <FormGroup validationState={this.state.phoneError ? 'error' : null}>
                  <FormControl placeholder="Phone"
                    inputRef={ref => this.phoneRef = ref}
                    value={this.state.phone}
                    onChange={this.handlePhone}
                  />
                </FormGroup>
                <FormGroup validationState={this.state.phoneError ? 'error' : null}>
                  <FormControl placeholder="Preferred Day & Time to meet"
                    inputRef={ref => this.detailsRef = ref}
                    value={this.state.details}
                    onChange={this.handleDetails}
                  />
                </FormGroup>
                <Button className={cx(styles.btn, styles["btn-blue"])} id="subscribe-form-submit-button"
                  onClick={this.submit}
                >Submit <FontAwesomeIcon icon={faAngleDoubleRight} /></Button>
                { this.state.fetching
                ? <div className="spinner">
                    <SavingSpinner title="Saving" />
                  </div>
                : <div className="empty-spinner"></div>
                }
              </Form>
            </div>)
          : (<div>
              <h3 className="text-center">Thanks for sharing your contact details. We'll be in touch with you shortly.</h3>
              <img src="images/Tick.png" alt=""/>
              <div className="text-center">
                <Button className={cx(styles.btn, styles["btn-blue"])}
                  onClick={this.closeModal}
                >Close</Button>
              </div>
            </div>)
          }
        </Modal.Body>
      </Modal>
    );
  }
}

SubscribeModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  showModal: PropTypes.bool.isRequired
};

