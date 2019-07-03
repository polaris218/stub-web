import React, { Component } from 'react';
import styles from './api-keys-info.module.scss';
import { getProfileInformationDevPortal, updateKeysDevPortal } from '../../../../actions/dev-portal';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import { Row, Col, FormGroup, FormControl } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/fontawesome-free-solid';
import { Link } from 'react-router-dom';

export default class ApiKeysInfo extends Component {
  constructor(props) {
    super(props);

    this.state = {
      serverActionIsPending: true,
      tokenFieldType: 'password',
      loggedIn: true,
      expanded: false
    };

    this.getAccountInformation = this.getAccountInformation.bind(this);
    this.toggleFieldType = this.toggleFieldType.bind(this);
    this.updateAuthKeys = this.updateAuthKeys.bind(this);
    this.toggleKeyContainer = this.toggleKeyContainer.bind(this);
  }

  componentDidMount() {
    this.getAccountInformation();
  }

  getAccountInformation() {
    this.setState({
      serverActionIsPending: false
    });
    getProfileInformationDevPortal().then((res) => {
      const profile = JSON.parse(res);
      this.setState({
        profile,
        ...profile.auth_keys,
        serverActionIsPending: false
      });
    }).catch((err) => {
      if (err.status === 401) {
        localStorage.removeItem('logged_in');
        try {
          localStorage.setItem('logged_out', 'true');
        } catch (e) {
          console.log('LocalStorage Not Available');
          console.log(e);
        }
        this.setState({
          serverActionIsPending: false,
          loggedIn: false
        })
      }
    });
  }

  updateAuthKeys(e) {
    e.preventDefault();
    e.stopPropagation();
    const r = confirm('Are you sure that you need new keys? Your API clients will need new keys to use the API!');
    if (r === true) {
      this.setState({
        serverActionIsPending: true
      });
      updateKeysDevPortal().then((res) => {
        const auth_keys = JSON.parse(res);
        this.setState({
          ...auth_keys,
          serverActionIsPending: false,
          expanded: true
        })
      }).catch((err) => {
        if (err.status === 401) {
          localStorage.removeItem('logged_in');
          try {
            localStorage.setItem('logged_out', 'true');
          } catch (e) {
            console.log('LocalStorage Not Available');
            console.log(e);
          }
          this.setState({
            serverActionIsPending: false,
            loggedIn: false
          });
        }
      })
    }
  }

  toggleFieldType() {
    this.setState({
      tokenFieldType: this.state.tokenFieldType === 'password' ? 'text' : 'password'
    });
  }

  toggleKeyContainer(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      expanded: !this.state.expanded
    });
  }

  render() {
    return (
      <div className={styles.apiInfoContainer}>
        <div onClick={(e) => this.toggleKeyContainer(e) } className={styles.apiKeysHeader}>
          <div>
            <h3>
              Your API Keys
            </h3>
          </div>
          <div>
            {this.state.loggedIn &&
              <button onClick={(e) => { this.updateAuthKeys(e) }}>Request new keys</button>
            }
          </div>
        </div>
        {this.state.expanded &&
          <div className={styles.apiKeysBody}>
            <Row>
              <Col md={12}>
                <p>
                  API keys are used for authentication to Arrivy API every time an API request is made. Like password, API keys should remain a secret.
                </p>
              </Col>
            </Row>
            {this.state.serverActionIsPending
              ?
              <Row>
                <Col md={12}>
                  <div className={styles.savingSpinnerContainer}>
                    <SavingSpinner title="Loading" borderStyle="none" />
                  </div>
                </Col>
              </Row>
              :
              <Row>
                {this.state.loggedIn
                  ?
                  <div>
                    <Col md={6} sm={12} xs={12}>
                      <FormGroup>
                        <label>AUTH KEY</label>
                        <FormControl value={this.state.auth_key} type="text" readOnly />
                      </FormGroup>
                    </Col>
                    <Col md={6} sm={12} xs={12}>
                      <FormGroup>
                        <label>AUTH TOKEN</label>
                        <FormControl value={this.state.auth_token} type={this.state.tokenFieldType} readOnly />
                        <button onClick={() => this.toggleFieldType()} className={styles.toggleIconBtn}>
                          {this.state.tokenFieldType === 'password'
                            ?
                            <FontAwesomeIcon icon={faEye} />
                            :
                            <FontAwesomeIcon icon={faEyeSlash} />
                          }
                        </button>
                      </FormGroup>
                    </Col>
                  </div>
                  :
                  <div>
                    <Col md={12}>
                      <div className={styles.loginMessage}>
                        Please <Link to="/login?redirect_url=/developer_portal">&nbsp;login&nbsp;</Link> to view your keys.
                      </div>
                    </Col>
                  </div>
                }
              </Row>
            }
          </div>
        }
      </div>
    );
  }

}
