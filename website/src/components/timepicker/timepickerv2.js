import React, { Component } from 'react';
import styles from './timepickerv2.module.scss';
import { Creatable } from 'react-select';
import 'react-select/dist/react-select.css';
import { timeIntervals } from '../../helpers/timepicker-values';
import _ from 'lodash';

export default class TimePickerV2 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOption: null,
      selectedValue: null,
      valueError: false
    };

    this.handleValueChange = this.handleValueChange.bind(this);
    this.generateValue = this.generateValue.bind(this);

  }

  componentDidMount() {
    const generatedValue = this.generateValue();
    const selectedValue = { ...this.state.selectedValue };
    if (!_.isEqual(generatedValue, selectedValue)) {
      this.setState({
        selectedValue: generatedValue
      });
    }
  }

  componentDidUpdate() {
    const generatedValue = this.generateValue();
    const selectedValue = { ...this.state.selectedValue };
    if (!_.isEqual(generatedValue, selectedValue)) {
      this.setState({
        selectedValue: generatedValue
      });
    }
  }

  handleValueChange(option) {
    this.setState({
      valueError: false
    });
    if (!option.value.match(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/)) {
      this.setState({
        valueError: true
      });
    } else {
      this.setState({
        selectedValue: option
      });
      this.props.updateValue(option.value);
    }
  }

  generateValue(time = this.props.value) {
    let selectedValue = { value: time, label: time };
    if (time === '' || time === null) {
      selectedValue = { value: 'HH:MM AM', label: 'HH:MM AM' };
    }
    return selectedValue;
  }
  
  render() {
    const errorSelect = styles.selectFieldWithError;
    let pickerClass = styles.selectField;
    if (this.state.valueError) {
      pickerClass = errorSelect;
    }
    return (
      <div>
        <Creatable
          value={this.state.selectedValue}
          onChange={(option) => this.handleValueChange(option)}
          options={timeIntervals}
          disabled={this.props.disabled}
          multi={false}
          clearable={false}
          className={pickerClass}
        />
        {this.state.valueError && <p className={styles.errorText}>Incorrect time format.</p>}
      </div>
    );
  }
  
}
