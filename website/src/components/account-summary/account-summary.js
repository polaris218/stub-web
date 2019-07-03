import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Grid, Row, Col, FormGroup, ControlLabel } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import styles from './account-summary.module.scss';
import SavingSpinner from '../saving-spinner/saving-spinner';

export default class AccountSummary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      auth_key: undefined,
      auth_token: undefined,
      type: 'password',
      profile: null,
    };

    this.updateKeys = this.updateKeys.bind(this);
    this.toggleInput = this.toggleInput.bind(this);
    this.getSummatyInfo = this.getSummatyInfo.bind(this);
  }

  componentDidMount() {
    this.getSummatyInfo();
  }

  getSummatyInfo() {
    this.props.getProfileInformation()
      .then((data) => {
        const profile = JSON.parse(data);
        this.setState({
          profile,
          ...profile.auth_keys,
        });
      });
  }

  updateKeys() {
    const r = confirm('Are you sure that you need new keys? Your API clients will need new keys to use the API!');
    if (r === true) {
      if (this.props.updateKeys) {
        this.props.updateKeys()
          .then((res) => {
            const auth_keys = JSON.parse(res);
            this.setState(Object.assign(this.state, auth_keys));
          });
      }
    }
  }

  toggleInput() {
    this.setState(
      Object.assign(this.state,
        { type: this.state.type === 'input' ? 'password' : 'input' })
    );
  }

  render() {
    return (
      <div className={styles['account-summary']}>
        {this.state.auth_key &&
        (<Row>
          <Col md={6} sm={12} xs={12}>
            {!this.props.hideKeys &&
              <FormGroup controlId="auth-key">
                <Row>
                  <Col lg={3} md={4} sm={3} xs={12}>
                    <ControlLabel componentClass={ControlLabel}>Auth Key</ControlLabel>
                  </Col>
                  <Col lg={9} md={8} sm={9} xs={12}>
                    <p>{this.state.auth_key}</p>
                  </Col>
                </Row>
              </FormGroup>
            }
            {!this.props.hideKeys &&
              <FormGroup controlId="auth-token">
                <Row>
                  <Col lg={3} md={4} sm={3} xs={12}>
                    <ControlLabel componentClass={ControlLabel}>Auth Token</ControlLabel>
                  </Col>
                  <Col lg={9} md={8} sm={9} xs={12}>
                    <i onClick={this.toggleInput} className={'glyphicon glyphicon-eye-open ' + styles['view-icon']}></i>
                    <input className={styles['password-field']} readOnly type={this.state.type} value={this.state.auth_token}/>
                    <a className={styles['change-keys']} href="#" onClick={this.updateKeys}>Request New Keys</a>
                  </Col>
                </Row>
              </FormGroup>
            }
          </Col>
          <Col md={6} sm={12} xs={12}>
            <FormGroup controlId="current-plan">
              <Row>
                <Col lg={3} md={4} sm={3} xs={12}>
                  <ControlLabel componentClass={ControlLabel}>Current Plan</ControlLabel>
                </Col>
                <Col lg={9} md={8} sm={9} xs={12}>
                  {this.state.profile && this.state.profile.plan_id === 1 &&
                  <ul className="list-unstyled">
                    <li><p>TRIAL</p></li>
                    <li><span>Free usage in trial period <Link className={styles['сhange-plan']} to="/settings">Change Plan</Link></span></li>
                  </ul>
                  }
                  {this.state.profile && this.state.profile.plan_id === 2 && <p>{this.state.profile.plan}</p>}
                </Col>
              </Row>
            </FormGroup>
          </Col>
        </Row>) || (<SavingSpinner title="Loading" borderStyle="none" size={8}/>)}
      </div>
    );
  }
}

AccountSummary.propTypes = {
  getProfileInformation: PropTypes.func.isRequired,
  updateKeys: PropTypes.func.isRequired,
  hideKeys: PropTypes.bool
};
