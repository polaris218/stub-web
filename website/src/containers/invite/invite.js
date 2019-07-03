import React, { Component } from 'react';
import styles from '../auth/signup.module.scss';
import { UserHeader } from '../../components';
import { DefaultHelmet } from '../../helpers';
import AuthFooter from '../auth/AuthFooter';
import Login from './login';
import Register from './register';
import PropTypes from 'prop-types';
import {parseQueryParams} from '../../helpers';
import cx from 'classnames';
import { getinvitation } from '../../actions';
import { Alert} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '../../helpers/task';

export default class Invite extends Component {

  constructor(props, context) {
    super(props, context);

    this.renderResult = this.renderResult.bind(this);

    this.state = {
      result: null,
      errorText: null,
    }
  }

  componentDidMount() {
    const query = parseQueryParams(this.props.location && this.props.location.search),
      invitation_id = query.invitation_id;

    getinvitation( invitation_id ).then(res => {
      const result = JSON.parse(res);
      this.setState({
        result
      });
    }).catch(err => {
      const error = JSON.parse(err.responseText);
      this.setState({
        errorText: getErrorMessage(error, 'The invitation link has been expired.'),
      });
    });
  }

  renderResult() {
    const {location} = this.props,
      query = parseQueryParams(this.props.location.search),
      result = this.state.result;

    if(result && result.account_already_created === true) {
      return (<Login location={location} query={query} result={result}/>);
    } else if (result && result.account_already_created === false) {
      return (<Register location={location} query={query} result={result} />);
    } else if (this.state.errorText) {
      return(
        <div className={cx(styles.authContent)}>
          <div className={cx(styles.title)}>
            <h1>Link Expired</h1>
          </div>
          <div className={cx(styles.authInner)}>
            <Alert bsStyle='danger'><p>{this.state.errorText}</p></Alert>
          </div>
          <div className={cx(styles['links'])}>
            <Link to='/login'>Login to an Existing Account</Link>
            <Link to='/signup'>Signup for a New Account</Link>
          </div>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        <DefaultHelmet/>
        <UserHeader router={this.context.router} hideOptions/>
        <div className={cx(styles.authContainer)}>
          {this.renderResult()}
        </div>
        <AuthFooter />
      </div>
    );
  }
}

Invite.propTypes = {
  location: PropTypes.object
};
Invite.contextTypes = {
  router: PropTypes.object.isRequired
};

