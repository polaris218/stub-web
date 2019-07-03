import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Col, Form, Row, FormGroup, ControlLabel, FormControl, Button } from 'react-bootstrap';
import NotificationManager from '../../../notification-manager/notification-manager';
import styles from './account-password.module.scss';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import { getErrorMessage } from '../../../../helpers/task';
import { toast } from 'react-toastify';
import { updateUserProfileInformation, getProfileInformation } from '../../../../actions';
import cx from 'classnames';

const FieldGroup = ({ id, label, ...props }) => (
  <FormGroup controlId={id}>
    <ControlLabel componentClass={ControlLabel}>{label}</ControlLabel>
    <FormControl {...props} />
  </FormGroup>
);

export default class AccountPassword extends Component {
  constructor(props) {
    super(props);
    this.onChangePaswordField = this.onChangePaswordField.bind(this);
    this.changePassword = this.changePassword.bind(this);
    this.changeName = this.changeName.bind(this);
    this.setName = this.setName.bind(this);
    this.state = {
      notifications: [],
      changingPW: false,
      displayName: (this.props.profile && this.props.profile.fullname) || '',
      changingDN: false,
      password_data: {
        password: '',
        confirm_password: '',
        confirm_password2: ''
      }
    };
  }

  onChangePaswordField(name, value) {
    let password_data = this.state.password_data;
    password_data[name] = value;
    this.setState({
      password_data,
      notifications: []
    });
  }

  componentWillMount() {
    getProfileInformation().then((res) => {
      const profile = JSON.parse(res);
      if (profile) {
        this.setState({ displayName: profile.fullname });
      }
    });
  }

  setName(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({ displayName: e.target.value });
  }

  changeName(e) {
    e.preventDefault();
    e.stopPropagation();
    const display_name = this.state.displayName;
    if (!display_name) {
      const updateFailed = {
        text: 'Name field is empty!',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(updateFailed);
    } else {
      this.setState({ changingDN: true });
      updateUserProfileInformation(this.state.displayName)
        .then(() => {
          const responseText = 'Name Updated';
          this.setState({
            changingDN: false,
            // displayName: ''
          }, () => {
            const update = {
              text: responseText,
              options: {
                type: toast.TYPE.SUCCESS,
                position: toast.POSITION.BOTTOM_LEFT,
                className: styles.toastSuccessAlert,
                autoClose: 8000
              }
            };
            this.props.createToastAlert(update);
          });
        })
        .catch(() => {
          const error = 'Name not updated';
          this.setState({
            // displayName: '',
            changingDN: false,
          }, () => {
            const updateFailed = {
              text: error,
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

  changePassword(e) {
    e.preventDefault();
    e.stopPropagation();
    const { confirm_password, confirm_password2 } = this.state.password_data;
    if (confirm_password !== confirm_password2) {
      const updateFailed = {
        text: 'Passwords don\'t match.',
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastAlert(updateFailed);
    } else {
      this.setState({ changingPW: true });
      this.props.changePassword({ password: confirm_password, confirm_password: confirm_password2 })
        .then((res) => {
          const responseText = JSON.parse(res);
          let password_data = {
            password: '',
            confirm_password: '',
            confirm_password2: ''
          };
          this.setState({
            changingPW: false,
            password_data
          }, () => {
            const updated = {
              text: responseText.message,
              options: {
                type: toast.TYPE.SUCCESS,
                position: toast.POSITION.BOTTOM_LEFT,
                className: styles.toastSuccessAlert,
                autoClose: 8000
              }
            };
            this.props.createToastAlert(updated);
          });
        })
        .catch((err) => {
          const error = JSON.parse(err.responseText);
          let password_data = {
            password: '',
            confirm_password: '',
            confirm_password2: ''
          };
          this.setState({
            changingPW: false, password_data
          }, () => {
            const updateFailed = {
              text: getErrorMessage(error),
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

  render() {
    const fields1 = [{
      name: 'display_name',
      label: 'Display Name',
    },].map((field1, idx) => {
      return <FieldGroup
        key={idx}
        onChange={(e) => {
          this.setName(e);
        }}
        id={field1.name}
        type="text"
        value={this.state.displayName}
        label={field1.label}/>;
    });
    const onChangeField = (field) => {
        return (event) => {
          this.onChangePaswordField(field.name, event.target.value);
        };
      },
      fields = [{
        name: 'password',
        label: 'Current Password',
      }, {
        name: 'confirm_password',
        label: 'New Password',
      }, {
        name: 'confirm_password2',
        label: 'Retype New Password',
      }].map((field, idx) => {
        return <FieldGroup
          key={idx}
          onChange={onChangeField(field)}
          id={field.name}
          type="password"
          label={field.label}
          value={this.state.password_data[field.name]}/>;
      });
    return (
      <div className={styles['account-password']}>
        <Grid>
          <NotificationManager notifications={this.state.notifications}/>
          <div className={cx(styles.box)}>
            <h3 className={cx(styles.boxTitle)}>Profile</h3>
            <Row>
              <Col md={12} lg={6}>
                <div className={cx(styles.boxBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    {this.props.profile && this.props.profile.user_name && <h3 className={cx(styles.boxTitle)}>Username : {this.props.profile.user_name}</h3>}
                    {fields1}
                    <div className="text-right">
                      <button className={cx(styles.btn, styles['btn-secondary'])} onClick={(e) => this.changeName(e)}
                              disabled={this.state.changingDN}>{this.state.changingDN ?
                        <SavingSpinner className={cx(styles.spinner)} borderStyle="none"
                                       size={8}/> : 'Change Name'}</button>
                    </div>
                  </div>
                </div>
              </Col>
              <Col md={12} lg={6}>
                <div className={cx(styles.boxBody)}>
                  <div className={cx(styles.boxBodyInner)}>
                    {fields}
                    <div className="text-right">
                      <button className={cx(styles.btn, styles['btn-secondary'])} onClick={(e) => this.changePassword(e)} disabled={this.state.changingPW}>{this.state.changingPW ? <SavingSpinner className={cx(styles.spinner)} borderStyle="none" size={8} /> : 'Change Password'}</button>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Grid>
      </div>
    );
  }
}

AccountPassword.propTypes = {
  changePassword: PropTypes.func.isRequired,
  updateUserProfileInformation: PropTypes.func.isRequired,
  getProfileInformation: PropTypes.func,
};
