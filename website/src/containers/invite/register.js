import React, { Component } from 'react';
import styles from '../auth/signup.module.scss';
import { findDOMNode } from 'react-dom';
import { Link } from 'react-router-dom';
import { FormGroup, ControlLabel, FormControl, Alert } from 'react-bootstrap';
import {register, getPublicUserProfile, getinvitation} from '../../actions';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import history from '../../configureHistory';
import Phone from "react-phone-number-input";
import cx from "classnames";


export default class Register extends Component {

  constructor(props, context) {
    super(props, context);

    this.signup = this.signup.bind(this);
    this.onChangeField = this.onChangeField.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handlePhone = this.handlePhone.bind(this);


    this.state = {
      errorText: null,
      successText: null,
      serverActionIsPending: false,
      fullname: null,
      email: null,
      password: null,
      is_enterprise: false,
      image_path: null,
      showImage: false,
      companyName: null,
      phone: null,
      email_or_phone: null,
      number: null,
      noShow: false,
      account: 0,
    };

  }

  componentDidMount() {
    const result = this.props.result;
    let number = false,
      email= null,
      phone= null;
    if (result.channel.toUpperCase() === 'EMAIL'){
      number = false;
      email = result.channel_address;
    } else if(result.channel.toUpperCase() === 'SMS') {
      number = true;
      phone = result.channel_address;
    }
    this.setState({
      fullname: result.name,
      number,
      email,
      phone
    }, () => {
      findDOMNode(this.refs.fullname) && findDOMNode(this.refs.fullname).focus();
    });
  }

  signup(e) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      serverActionIsPending: true
    });

    const query = this.props.query,
      result = this.props.result,
      email = findDOMNode(this.refs.email) && findDOMNode(this.refs.email).value.trim(),
      password = this.state.password,
      fullname = this.state.fullname,
      is_enterprise = this.state.is_enterprise,
      ref = query.ref || null,
      entity_id = result.entity_id || null,
      phone = this.state.phone && this.state.phone.trim();

    if (!email && !phone) {
      this.setState({
        errorText: 'No Email or Phone Number provided',
        serverActionIsPending: false
      });
      return;
    }

    register({ fullname, email, password, ref, entity_id, is_enterprise, phone }).then(() => {
      this.setState({
        successText: 'Signup Successful',
        serverActionIsPending: false
      });
      history.push('/login?ref=signup');
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
      [e.target.name]: e.target.name === 'is_enterprise' ? e.target.checked : e.target.value
    });
  }

  handlePhone(phone) {
    if (typeof phone !== 'undefined' && (!phone || phone.trim() === '')) {
      this.setState({
        number: false,
        phone: null,
        email: ''
      }, () => {
        findDOMNode(this.refs.email) && findDOMNode(this.refs.email).focus();
      });
    } else {
      this.setState({
        phone: phone,
        email: null
      });
    }
  }

  handleChange(e) {
    const value = e.target.value;
    if (parseInt(value) || parseInt(value) === 0) {
      this.setState({
        number: true,
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

    const result = this.props.result;

    return (
      <div className={cx(styles.authContent, styles.inviteSignup)}>
        {!this.state.noShow ?
          <div>
            <div className={cx(styles.title)}>
              <h1>You have been invited</h1>
              <p>To join <span>{result && result.company_name}</span> on Arrivy</p>
            </div>
            <div className={cx(styles.authInner)}>
              <form onSubmit={this.signup}>
                <div className={cx(styles.profileImage)}>
                  <img src={(result && result.company_image) || '/images/user-default.svg'} alt={result && result.company_name} />
                </div>
                {alert}
                <FormGroup>
                  <ControlLabel>Display Name</ControlLabel>
                  <FormControl onChange={(e) => this.onChangeField(e)} name='fullname' type='text' ref='fullname' placeholder="Display Name" required value={this.state.fullname}/>
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Email or Mobile Number</ControlLabel>
                  {!this.state.number &&
                  <FormControl onChange={(e) => this.handleChange(e)} autoComplete="email" type='text' value={this.state.email} ref='email' placeholder="E.g. email@company.com" />}
                  {this.state.number &&
                  <Phone country="US" value={this.state.phone} autoComplete="phone" className={cx(styles['input-phone'])} placeholder="Mobile Phone Number" ref="phone" onChange={(phone) => this.handlePhone(phone)}/>}
                </FormGroup>
                <FormGroup>
                  <ControlLabel>Create Password</ControlLabel>
                  <FormControl onChange={(e) => this.onChangeField(e)} autoComplete="new-password" name='password' placeholder="Password" type='password' ref='password' required value={this.state.password}/>
                </FormGroup>
                <div className={cx(styles.textarea)}>
                  <p>Already an Arrivy member? Click <strong><Link to='/login'>here</Link></strong> to log in and add another company to your Arrivy account.</p>
                  <p>By signing up you indicate that you have read and agree to the <Link to='/terms' className={cx(styles.terms_link)}>Terms of Service</Link></p>
                </div>
                <button type='submit' className={cx(styles.btn, styles['btn-secondary'])}>
                  {this.state.serverActionIsPending ? <SavingSpinner borderStyle="none"/> : 'Sign Up'}
                </button>
              </form>
            </div>
            <div className={cx(styles['links'])}>
              <Link to='/login'>Already have an account? Log in here!</Link>
            </div>
          </div> : <div className={cx(styles.authInner)}>Link is expired</div>
        }
      </div>
    );
  }
}
