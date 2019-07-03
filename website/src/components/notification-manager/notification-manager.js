import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { Col, Row, Alert } from 'react-bootstrap';


export default class NotificationManager extends Component {
    constructor(props) {
      super(props);
      this.state = {
        notifications: props.notifications
      };
    }

    componentWillReceiveProps(nextProps) {
      this.setState(nextProps);
    }

    renderAlert(alert, idx) {

      setTimeout(() => {
        this.removeAlert(alert);
      }, alert.timeout || 1e4);

      return (
        <Alert key={idx} bsStyle={alert.bsStyle || 'success'}>
          {alert.header && (<h4>{alert.header}</h4>)}
          <p>{alert.message}</p>
        </Alert>);
    }

    removeAlert(rAlert) {
        this.setState({
            notifications: this.state.notifications.filter((alert) => {
                return alert !== rAlert;
            }) });
    }

    render() {
      return (<Row>
                {
                  this.state.notifications.map((alert, idx) => {
                    return <Col key={idx} sm={12}>{this.renderAlert(alert, idx)}</Col>;
                  })
                }
              </Row>);
    }
}

NotificationManager.propTypes = {
  notifications: PropTypes.array.isRequired
}