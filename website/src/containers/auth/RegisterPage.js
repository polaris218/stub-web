import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { FormGroup, ControlLabel, FormControl, Alert, Checkbox, Modal } from 'react-bootstrap';
import { findDOMNode } from 'react-dom';
import { register } from '../../actions';
import { UserHeader } from '../../components';
import { DefaultHelmet } from '../../helpers';
import styles from './signup.module.scss';
import AuthFooter from './AuthFooter';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { parseQueryParams } from '../../helpers';
import history from '../../configureHistory';
import cx from 'classnames';
import Phone from 'react-phone-number-input';
import { is_valid_phone_number } from 'react-phone-number-input';

export default class RegisterPage extends Component {

  constructor(props, context){
    super(props, context);
    this.signup = this.signup.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.showModal = this.showModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handlePhone = this.handlePhone.bind(this);

    this.state = {
      errorText : null,
      successText : null,
      serverActionIsPending: false,
      fullname: null,
      company_name: null,
      email: null,
      password: null,
      is_enterprise: false,
      show_modal: false,
      phone: false,
      phoneNumber: null,
    };
  }

  componentDidMount() {
    const query = parseQueryParams(this.props.location.search);
    findDOMNode(this.refs.fullname).focus();

    if(query.email) {
      findDOMNode(this.refs.email).value = query.email;
      findDOMNode(this.refs.email).readOnly = 'readOnly';

      this.setState({
        email: query.email
      });
    }
    if (query.company_name) {
      findDOMNode(this.refs.company_name).value = query.company_name;
      this.setState({
        company_name: query.company_name
      });
    }

    if (query.name) {
      findDOMNode(this.refs.fullname).value = query.name;
      this.setState({
        fullname: query.name
      });
    }
  }

  signup(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      serverActionIsPending: true
    });

    const query = parseQueryParams(this.props.location.search),
      password = this.state.password,
      fullname = this.state.fullname,
      company_name = this.state.company_name,
      is_enterprise = this.state.is_enterprise,
      email = this.state.email && this.state.email.trim(),
      phone = this.state.phoneNumber && this.state.phoneNumber.trim(),
      ref = query.ref || null,
      entity_id = query.entity_id || null;

    if (!email && !phone) {
      this.setState({
        errorText: 'No Email or Phone Number provided',
        serverActionIsPending: false
      });
      return;
    }

    register({ fullname, email, password, ref, entity_id, is_enterprise, phone, company_name }).then(() => {
      this.setState({
        successText: 'Signup Successful',
        serverActionIsPending: false
      });
      history.push('/login?ref=signup' + (is_enterprise ? '&enterprise=1' : ''));
    }).catch(err => {
      console.log(err);
      const errorObject = JSON.parse(err.responseText);

      this.setState({
        errorText: errorObject && errorObject.description ? errorObject.description : 'Unable to signup at this point',
        serverActionIsPending: false
      });
    });
  }

  onChangeField(e) {
    this.setState({
      [e.target.name] : e.target.name === 'is_enterprise' ? e.target.checked : e.target.value
    });
  }

  hideModal() {
    this.setState({ show_modal: false });
  }

  showModal() {
    this.setState({ show_modal: true });
  }

  handleChange(e) {
    const value = e.target.value;
    if (parseInt(value) || parseInt(value) === 0) {
      this.setState({
        phone: true,
        email: null
      }, () => {
        if (this.refs.phone) {
          this.refs.phone.focus();
          this.handlePhone(value);
        }
      });
    } else {
      this.setState({
        number: false,
        email:  value
      }, () => {
        findDOMNode(this.refs.email) && findDOMNode(this.refs.email).focus();
      });
    }
  }

  handlePhone(phone) {
    if (typeof phone !== 'undefined' && (!phone || phone.trim() === '')) {
      this.setState({
        phone: false,
        phoneNumber: null,
        email: ''
      }, () => {
        findDOMNode(this.refs.email) && findDOMNode(this.refs.email).focus();
      });
    } else {
      this.setState({
        phoneNumber: phone,
        email: null
      });
    }
  }

  render() {
    let alert = null;
    if (this.state.successText) {
      alert = (<Alert bsStyle="success">
        <p>{this.state.successText}</p>
      </Alert>);
    } else if (this.state.errorText) {
      alert = (<Alert bsStyle="danger">
        <p>{this.state.errorText}</p>
      </Alert>);
    }
    const crossIcon = <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756"><g transform="translate(-1270.486 -30.485)"><path d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z" transform="translate(4126.197 -40.804)" fill="#8d959f"/></g></svg>;

    return (
      <div>
        <DefaultHelmet/>
        <UserHeader router={this.context.router} hideOptions/>
        <div className={cx(styles.authContainer)}>
          <div className={cx(styles.authContent)}>
            <div className={cx(styles.title)}>
              <h1>You’re a few clicks away</h1>
              <p>from getting control of your moves, service appointments and deliveries</p>
            </div>
            <div className={cx(styles.authInner)}>
              <form onSubmit={this.signup}>
                { alert }
                <FormGroup>
                  <ControlLabel>Your Name</ControlLabel>
                  <FormControl onChange={(e) => this.onChangeField(e)} name='fullname' type='text' ref='fullname' placeholder="Your Name" required value={this.state.fullname} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Company Name</ControlLabel>
                  <FormControl onChange={(e) => this.onChangeField(e)} name='company_name' type='text' ref='company_name' placeholder="Company Name" required value={this.state.company_name} />
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Email or Mobile Number</ControlLabel>
                  {!this.state.phone &&
                  <FormControl onChange={(e) => this.handleChange(e)} autoComplete="email" type='email' name='email' ref='email' placeholder="E.g. email@company.com" required value={this.state.email} />}
                  {this.state.phone &&
                  <Phone country="US" value={this.state.phoneNumber} autoComplete="phone" className={cx(styles['input-phone'])} placeholder="Mobile Phone Number" ref="phone" required onChange={(phone) => this.handlePhone(phone)}/>}
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Create Password</ControlLabel>
                  <FormControl onChange={(e) => this.onChangeField(e)} autoComplete="new-password" name='password' placeholder="Password"  type='password' ref='password' required value={this.state.password} />
                </FormGroup>
                <div className={cx(styles.textarea)}>
                  <Checkbox onChange={(e) => this.onChangeField(e)} className={styles.checkbox} name='is_enterprise' checked={this.state.is_enterprise}><span>I'm interested in Enterprise API integration</span></Checkbox>
                  <p>Is your company already on Arrivy? <br />Click <a href="javascript:void (0)" onClick={this.showModal}>here</a> to create a personal account.</p>
                  <p>By signing up you indicate that you have read and agree to the <Link to='/terms' className={cx(styles.terms_link)}>Terms of Service</Link></p>
                </div>
                <button type='submit' className={cx(styles.btn, styles['btn-secondary'])} disabled={this.state.serverActionIsPending}>
                  {this.state.serverActionIsPending ? <SavingSpinner borderStyle="none" /> : 'Sign up'}
                </button>
              </form>
            </div>
            <div className={cx(styles['links'])}>
              <Link to='/login'>Already have an account? Log in here!</Link>
            </div>
          </div>
          <Modal show={this.state.show_modal} animation={false} onHide={this.hideModal} className={cx(styles.modalNotification)}>
            <Modal.Body className={cx(styles.modalBody)}>
              <i onClick={this.hideModal} className={cx(styles.closeIcon)}>{crossIcon}</i>
              <p>To create an account with an Arrivy company, you must get an email or SMS invitation from the company Arrivy administrator. Please contact your administrator - usually the Scheduler or Dispatcher - for an invite.</p>
              <div className="text-right">
                <button onClick={this.hideModal} className={cx(styles.btn, styles['btn-secondary'])}>Done</button>
              </div>
            </Modal.Body>
          </Modal>
        </div>
        <AuthFooter />
      </div>
    );
  }
}

RegisterPage.contextTypes = {
  router: PropTypes.object.isRequired
};
