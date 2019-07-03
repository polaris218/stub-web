import React, {Component} from 'react';
import PropTypes from 'prop-types';
import styles from "./error-alert.module.scss";
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import cx from 'classnames';
import {faExclamationTriangle} from "@fortawesome/fontawesome-free-solid/index";

class ErrorAlert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isOnline: false,
      showOnlineText: false,
    };
    this.handleOnline = this.handleOnline.bind(this);
    this.handleOffline = this.handleOffline.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.showError && this.state.isOnline) {
      this.setState({
        isOnline: false,
      }, () => {
        setTimeout(() => {
          this.setState({showOnlineText: false})
        }, 1e3)
      });
    }
  }

  componentWillUnmount() {
    window.removeEventListener('online',  this.handleOnline);
    window.removeEventListener('offline',  this.handleOffline);
  }

  handleReload() {
    window.location.reload();
  }

  handleOnline() {
    window.addEventListener('offline', this.handleOffline);
    this.setState({
      isOnline: true,
      showOnlineText: true
    });
  }

  handleOffline() {
    this.setState({
      isOnline: false,
      showOnlineText: false
    });
  }

  render() {
    let messageToggleClass = null;
    let messageBackgroundColorClass = styles.connectionNotAvailable;
    if (this.state.isOnline) {
      messageBackgroundColorClass = styles.connectionAvailable;
    }
    if (typeof this.props.showError !== 'undefined') {
      if (this.props.showError || this.state.isOnline) {
        messageToggleClass = styles.displayInternetMessage;
        window.addEventListener('online',  this.handleOnline);
      } else {
        messageToggleClass = styles.hideInternetMessage;
      }
    }
    return (
        <div className={cx(styles.internetMessageContainer, messageToggleClass, messageBackgroundColorClass)}>
          {!this.state.showOnlineText && <FontAwesomeIcon icon={faExclamationTriangle} className={styles.icon} />}
          <span>
          {this.state.showOnlineText ? <span>Internet available. Click <a onClick={this.handleReload}>here</a> to refresh the page</span>: this.props.errorText}
          </span>
        </div>
    );
  }
}

ErrorAlert.propTypes = {
  errorText: PropTypes.string,
  showError: PropTypes.bool,
};

export default ErrorAlert;