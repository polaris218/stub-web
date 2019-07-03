import React, { Component } from 'react';
import styles from './timepickerv3.module.scss';
import Kronos from 'react-kronos'

export default class TimePickerV3 extends Component {
  constructor(props) {
    super(props);

    this.handleChange = this.handleChange.bind(this);

  }

  handleChange(value) {
    this.props.updateValue(value);
  }

  render() {
    return (
      <div className={styles.timePickerContainer}>
        <Kronos
          time={this.props.value}
          timeStep={30}
          format={'hh:mm A'}
          options={{
            format: {
              hour: 'hh:mm A'
            },
            color: '#008BF8'
          }}
          onChangeDateTime={(value) => this.handleChange(value)}
          disabled={this.props.disabled}
          inputClassName={styles.timePickerInputField}
        />
      </div>
    );
  }

}
