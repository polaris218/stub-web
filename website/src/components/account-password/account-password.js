import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Grid, Col, Form, Row, FormGroup, ControlLabel, FormControl, Button} from 'react-bootstrap';
import NotificationManager from '../notification-manager/notification-manager';
import styles from './account-password.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { getErrorMessage } from '../../helpers/task';
import { toast } from 'react-toastify';
import {updateUserProfileInformation, getProfileInformation} from '../../actions';


const FieldGroup = ({id, label, ...props}) => (
  <FormGroup controlId={id} className='row'>
    <Col className="text-uppercase" componentClass={ControlLabel} sm={2}>
      {label}
    </Col>
    <Col sm={10}>
      <FormControl {...props} />
    </Col>
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

   componentWillMount(){
      getProfileInformation().then((res) => {
      const profile = JSON.parse(res);
      if (profile) {
          this.setState({displayName : profile.fullname});
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
      if(!display_name){
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
          this.setState({changingDN: true});
          updateUserProfileInformation(this.state.displayName)
              .then(() =>{
                  const responseText = 'Name Updated';
                  this.setState({
                      changingDN: false,
                      // displayName: ''
                  }, () => {
                      const update = {
                          text: responseText ,
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
                     const error ='Name not updated';
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
                    })
                }
         }

  changePassword(e) {
    e.preventDefault();
    e.stopPropagation();
    const {confirm_password, confirm_password2} = this.state.password_data;
    if (confirm_password !== confirm_password2) {
	    const updateFailed = {
		    text: "Passwords don't match.",
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(updateFailed);
    } else {
      this.setState({changingPW: true});
      this.props.changePassword({password: confirm_password, confirm_password: confirm_password2})
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
        name:  'display_name',
        label: 'DISPLAY NAME',
      },].map((field1, idx) => {
        return <FieldGroup
          key={idx}
          onChange={(e) => { this.setName(e) }}
          id={field1.name}
          type="text"
          value={this.state.displayName}
          label={field1.label}/>
      });
    const onChangeField = (field) => {
        return (event) => {
          this.onChangePaswordField(field.name, event.target.value);
        }
      },
      fields = [{
        name: 'password',
        label: 'current password',
      }, {
        name: 'confirm_password',
        label: 'new password',
      }, {
        name: 'confirm_password2',
        label: 'retype new password',
      }].map((field, idx) => {
        return <FieldGroup
          key={idx}
          onChange={onChangeField(field)}
          id={field.name}
          type="password"
          label={field.label}
          value={this.state.password_data[field.name]}/>
      });
    return (<div className={styles['account-password']}>

      <Grid>
        <h2 className={styles["header"]}>Profile</h2>
        <NotificationManager notifications={this.state.notifications}/>
          <div className={"custom-form"}>
              {fields1}
              <FormGroup className={styles['form-group-field'] + " row"}>
                    <Col smOffset={2} sm={4}>
                      <a className={styles["button-submit"] + " btn-submit"} onClick={(e)=>this.changeName(e)}>
                        Change Name
                      </a>
                    </Col>
                    <Col sm={4}>
                      {this.state.changingDN &&
                        <SavingSpinner borderStyle="none" size={8} title="Changing Name"/>
                      }
                    </Col>
              </FormGroup>
          </div>
        <div className="custom-form">
          {fields}
          <FormGroup className={styles['form-group-field'] + " row"}>
            <Col smOffset={2} sm={4}>
              <a className={styles["button-submit"] + " btn-submit"} onClick={(e)=>this.changePassword(e)}>
                Change Password
              </a>
            </Col>
            <Col sm={4}>
              {this.state.changingPW &&
                <SavingSpinner borderStyle="none" size={8} title="Changing Password"/>
              }
            </Col>
          </FormGroup>
        </div>
      </Grid>
    </div>)
  }
}

AccountPassword.propTypes = {
  changePassword: PropTypes.func.isRequired,
  updateUserProfileInformation: PropTypes.func.isRequired,
  getProfileInformation: PropTypes.func,
};
