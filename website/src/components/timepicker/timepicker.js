import React, { Component } from 'react';
import styles from './timepicker.module.scss';
import { SimpleSelect } from 'react-selectize';
import { timeIntervals } from '../../helpers/timepicker-values';

export default class Timepicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timepickerValue: '12:00 AM',
      unscheduledTask: false,
      options: timeIntervals,
      valueError: false
    };

    this.getDefaultValue = this.getDefaultValue.bind(this);
    this.formSearch = this.formSearch.bind(this);
    this.onBlurHandler = this.onBlurHandler.bind(this);
    this.changeField = this.changeField.bind(this);
  }

  getDefaultValue(value) {
    const options = this.state.options;
    const index = (options.map((option) => {
      return option.name;
    })).indexOf(value);
    if (index > -1) {
      return ({ label: options[index].label });
    }
    return ({ label: value });
  }

  formSearch(options, search) {
    if (search.length === 0 || (options.map((option) => {
      return (option.label);
    })).indexOf(search) > -1) {
      return null;
    }
    this.searchValue = search;
    options.push({ label: search, name: search });
  }

  onBlurHandler(id, fieldType) {
    const { fields } = this.state;
    if (this.searchValue !== null) {
      fields[id][fieldType] = this.searchValue;
      this.props.onChange(fields);
      this.searchValue = null;
    }
  }

  changeField(item) {
    this.setState({
      valueError: false
    });
    this.timepicker.blur();
    const options = [...this.state.options];
    const optionIndex = options.indexOf(item);
    if (optionIndex === -1) {
      if (item.name.match(/^(1[0-2]|0?[1-9]):[0-5][0-9] (AM|PM)$/)) {
        options.push({label: item.name, value: item.name});
        this.setState({
          options
        });
        this.props.updateValue(item.name);
      } else {
        this.setState({
          valueError: true
        });
        return;
      }
    } else {
      this.props.updateValue(item.value);
    }
  }

  render() {
    const errorSelect = styles.selectFieldWithError;
    let pickerClass = styles.selectField;
    if (this.state.valueError) {
      pickerClass = errorSelect;
    }
    return (
      <div className={styles.timepickerContainer}>
        <SimpleSelect
          ref={select => {
            this.timepicker = select;
          } }
          hideResetButton="true"
          className={pickerClass}
          options={this.state.options}
          placeholder={ 'Field Name' }
          onValueChange={(item) => {
            this.changeField(item);
          }}
          defaultValue={this.props.value ? this.getDefaultValue(this.props.value) : this.state.options[0]}
          value={this.props.value ? this.getDefaultValue(this.props.value) : this.state.options[0]}
          createFromSearch={(options, search) => { this.formSearch(options, search); }}
          disabled={this.props.disabled}
          tether={false}
          transitionEnter={false}
        />
        {this.state.valueError && <p className={styles.errorText}>Incorrect time format.</p>}
      </div>
    );
  }

}
