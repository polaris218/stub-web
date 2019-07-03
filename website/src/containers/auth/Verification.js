import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { veryfyUser } from '../../actions';
import { UserHeader } from '../../components';
import styles from './signup.module.scss';
import AuthFooter from './AuthFooter';
import { parseQueryParams } from '../../helpers';
import history from '../../configureHistory';
import cx from 'classnames';

export default class Verification extends Component {

  constructor(props, context) {
    super(props, context);
    this.state = {
      loaded: false,
      errorText : null
    };
  }

  componentDidMount(){
    const query = parseQueryParams(this.props.location.search);
    let user_id = query.id,
        token = query.token;
    if(user_id && token) {
      this.verify(user_id, token);
    } else {
      this.setState({
        loaded: true,
        errorText: "We are unable to activate this account. Please email at support@arrivy.com and we will help you out."
      });
    }
  }

  verify(user_id, token) {
    veryfyUser({ user_id, token }).then( () => {
      history.push('/login?ref=verification');
      }).catch(err => {
        if(err.status){
          this.setState({
            loaded: true,
            errorText: "We are unable to activate this account. Please email at support@arrivy.com and we will help you out."
          });
        }
      });
  }

  render() {

    const { location } = this.props;

    let alert = null;
    if (this.state.errorText) {
      alert = <Alert bsStyle="danger">
        <p>{this.state.errorText}</p>
      </Alert>;
    }

    return (
      <div>
        <UserHeader router={this.context.router} hideOptions/>
        <div className={cx(styles.authContainer)}>
          <div className={cx(styles.authContent)}>
            <div className={cx(styles.title)}>
              <h1>Account Verification</h1>
            </div>
            <div className={cx(styles.authInner)}>
              {(this.state.loaded === false) && <div><SavingSpinner title="Checking" borderStyle="none" fontSize={16} size={8}/></div>}
              { alert }
            </div>
          </div>
        </div>
        <AuthFooter />
      </div>
    );
  }
}

Verification.propTypes = {
  location: PropTypes.object
};

Verification.contextTypes = {
  router: PropTypes.object.isRequired
};
