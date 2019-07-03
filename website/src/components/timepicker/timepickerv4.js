import React, { Component } from 'react';
import styles from './timepickerv4.module.scss';
import { timeIntervals } from '../../helpers/timepicker-values';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';

export default class TimePickerV4 extends Component {
  constructor(props) {
    super(props);

    this.state = {
      timeValue: props.value,
      showDropDown: false,
      cloneValue: null,
      preventBlur: false,
      highlightedItem: null
    };

    this.handleTimeFieldFocus = this.handleTimeFieldFocus.bind(this);
    this.handleTimeFieldBlur = this.handleTimeFieldBlur.bind(this);
    this.renderTimePickerOptions = this.renderTimePickerOptions.bind(this);
    this.handleTimePickerOptionClick = this.handleTimePickerOptionClick.bind(this);
    this.handleTimeFieldValueChange = this.handleTimeFieldValueChange.bind(this);
    this.handleOptionsContainerMouseDown = this.handleOptionsContainerMouseDown.bind(this);
    this.handleOptionsContainerMouseUp = this.handleOptionsContainerMouseUp.bind(this);
    this.scrollParentToChild = this.scrollParentToChild.bind(this);
    this.handleTimePickerKeyDown = this.handleTimePickerKeyDown.bind(this);
    this.defragmentTimeString = this.defragmentTimeString.bind(this);

  }

  componentDidMount() {
    if (this.props.value !== this.state.timeValue) {
      this.setState({
        timeValue: this.props.value
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps, this.props)) {
      this.setState({
        timeValue: nextProps.value
      });
    }
  }

  handleTimeFieldFocus(e) {
    this.setState({
      showDropDown: true
    });
    const timePickerEl = document.getElementById("timepickerOptionsContainer" + this.props.elId);
    timeIntervals.map((interval) => {
      if (interval.value.includes(this.state.timeValue) || interval.label.includes(this.state.timeValue)) {
        const subEl = document.getElementById(interval.value + this.props.elId);
        this.scrollParentToChild(timePickerEl, subEl);
      }
    });
  }

  handleTimeFieldBlur(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.state.preventBlur) {
      this.setState({
        showDropDown: false
      });
    }
    const currentValue = e.target.value;
    const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
    if (currentValue.match(timeRegEx)) {
      const matchedGrups = timeRegEx.exec(currentValue);
      let hrs = matchedGrups[1];
      let mins = matchedGrups[2];
      let merd = matchedGrups[3];
      if (hrs.length === 1) {
        hrs = 0 + hrs;
      }
      const timeString = hrs + ':' + mins + ' ' + merd.toUpperCase();
      this.setState({
        timeValue: timeString,
        cloneValue: null,
        highlightedItem: null
      }, () => { this.props.updateValue(this.state.timeValue); });
    } else {
      this.setState({
        timeValue: this.state.cloneValue,
        cloneValue: null,
        highlightedItem: null
      }, () => { this.props.updateValue(this.state.timeValue); } );
    }
  }

  renderTimePickerOptions() {
    const renderedOptions = timeIntervals.map((interval) => {
      return (
        <li id={interval.value + this.props.elId} className={cx(((this.state.timeValue && interval.value === this.state.timeValue.toUpperCase()) || (this.state.highlightedItem !== null && this.state.highlightedItem === interval.value)) && styles.selectedValue)} key={Math.random().toString(36).substr(2, 16)}>
          <a onMouseDown={(e) => { this.handleTimePickerOptionClick(e, interval) }} >
            {interval.value}
          </a>
        </li>
      );
    });
    return renderedOptions;
  }

  handleTimePickerOptionClick(e, option) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      timeValue: option.value,
      showDropDown: false,
      highlightedItem: null,
      cloneValue: null
    }, () => { this.props.updateValue(option.value); });
  }

  handleTimeFieldValueChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const cloneValue = this.state.cloneValue === null ? this.state.timeValue : this.state.cloneValue;
    const timeValue = e.target.value;
    const timePickerEl = document.getElementById("timepickerOptionsContainer" + this.props.elId);
    for(let i = 0; i < timeIntervals.length; i++) {
      if (timeIntervals[i].shortValue === e.target.value.toUpperCase() || timeIntervals[i].label.includes(e.target.value.toUpperCase()) || timeIntervals[i].value.includes(e.target.value.toUpperCase())) {
        const subEl = document.getElementById(timeIntervals[i].value + this.props.elId);
        this.scrollParentToChild(timePickerEl, subEl);
        this.setState({
          highlightedItem: timeIntervals[i].value
        });
        break;
      }
    }
    this.setState({
      cloneValue,
      timeValue
    });
  }

  handleOptionsContainerMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    const inputEl = document.getElementById("timeInputEl" + this.props.elId);
    inputEl.focus();
    this.setState({
      preventBlur: false
    });
  }

  handleOptionsContainerMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    const inputEl = document.getElementById("timeInputEl" + this.props.elId);
    inputEl.blur();
    this.setState({
      preventBlur: true
    });
  }

  scrollParentToChild(parent, child) {

    // Where is the parent on page
    let parentRect = parent.getBoundingClientRect();
    // What can you see?
    let parentViewableArea = {
      height: parent.clientHeight,
      width: parent.clientWidth
    };

    // Where is the child
    let childRect = child.getBoundingClientRect();
    // Is the child viewable?
    let isViewable = (childRect.top >= parentRect.top) && (childRect.top <= parentRect.top + parentViewableArea.height);

    // if you can't see the child try to scroll parent
    if (!isViewable) {
      // scroll by offset relative to parent
      parent.scrollTop = (childRect.top + parent.scrollTop) - parentRect.top
    }
  }

  handleTimePickerKeyDown(e) {
    const code = e.keyCode ? e.keyCode : e.which;
    if (!this.state.showDropDown) {
      this.setState({
        showDropDown: true
      });
    }
    if (code === 38 || code === 40) { // arrow key up/down respectively
      e.preventDefault();
      e.stopPropagation();
      const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
      let timeValue = this.state.timeValue && this.state.timeValue.match(timeRegEx) ? this.state.timeValue : this.state.cloneValue;
      let timeString = this.state.timeValue;
      if (!timeValue || timeValue.toUpperCase() === 'HH:MM AM') {
        timeValue = '12:30 AM';
      }
      if (e.keyCode === 38) {
        const date = moment(timeValue, 'hh:mm A').toDate();
        timeString = moment(date).add(30, 'minutes').format('hh:mm A');
      } else if (e.keyCode === 40) {
        const date = moment(timeValue, 'hh:mm A').toDate();
        timeString = moment(date).subtract(30, 'minutes').format('hh:mm A');
      }
      this.setState({
        timeValue: timeString,
        cloneValue: null,
        highlightedItem: null
      }, () => {
        this.props.updateValue(this.state.timeValue);
        const timePickerEl = document.getElementById("timepickerOptionsContainer" + this.props.elId);
        timeIntervals.map((interval) => {
          if (interval.value.includes(this.state.timeValue) || interval.label.includes(this.state.timeValue)) {
            const subEl = document.getElementById(interval.value + this.props.elId);
            this.scrollParentToChild(timePickerEl, subEl);
          }
        });
      });
    } else if (code === 13) { // enter key
      e.preventDefault();
      e.stopPropagation();
      let timeValue = this.state.timeValue;
      const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
      if (timeValue.match(timeRegEx)) {
        timeValue = this.state.timeValue.toUpperCase();
      } else if (this.state.highlightedItem !== null) {
        timeValue = this.state.highlightedItem.toUpperCase();
      } else if (this.state.cloneValue !== null) {
        timeValue = this.state.cloneValue.toUpperCase();
      }
      this.setState({
        timeValue,
        showDropDown: false,
        highlightedItem: null,
        cloneValue: null
      }, () => {
        this.props.updateValue(this.state.timeValue);
      });
    } else if (code === 9) { // tab key
      let timeValue = this.state.timeValue;
      const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
      if (timeValue.match(timeRegEx)) {
        timeValue = this.state.timeValue.toUpperCase();
      } else if (this.state.highlightedItem !== null) {
        timeValue = this.state.highlightedItem.toUpperCase();
      } else if (this.state.cloneValue !== null) {
        timeValue = this.state.cloneValue.toUpperCase();
      }
      this.setState({
        timeValue,
        showDropDown: false,
        highlightedItem: null,
        cloneValue: null
      }, () => {
        this.props.updateValue(this.state.timeValue);
      });
    } else {
      return;
    }
  }

  defragmentTimeString(timeString = this.state.timeValue) {
    const timeRegEx = /^(1[0-2]|0?[1-9]):([0-5][0-9]) ?([aApP][mM])$/;
    const matchedGrups = timeRegEx.exec(timeString);
    let hrs = matchedGrups[1];
    let mins = matchedGrups[2];
    let merd = matchedGrups[3];
    if (hrs.length === 1) {
      hrs = 0 + hrs;
    }
    return {
      hrs,
      mins,
      merd
    }
  }

  render () {
    return (
      <div className={styles.timepickerContainer}>
        <input
          type="text"
          className={styles.timepickerTimeValueField}
          value={this.state.timeValue}
          onFocus={(e) => { this.handleTimeFieldFocus(e) }}
          onMouseDown={(e) => { this.handleTimeFieldFocus(e) }}
          onBlur={(e) => { this.handleTimeFieldBlur(e) }}
          onChange={(e) => { this.handleTimeFieldValueChange(e) }}
          onKeyDown={(e) => { this.handleTimePickerKeyDown(e) }}
          id={'timeInputEl' + this.props.elId}
          autoComplete="none"
          disabled={this.props.disabled}
          placeholder={this.props.placeholder}
        />
        <div
          onBlur={(e) => { this.handleOptionsContainerMouseUp(e) }}
          onMouseDown={(e) => { this.handleOptionsContainerMouseDown(e) }}
          id={'timepickerOptionsContainer' + this.props.elId}
          className={cx(this.state.showDropDown ? styles.timePickerDropDownVisible : styles.timePickerDropDownHidden)}>
          <ul id={'timePickerOptionsList' + this.props.elId}>
            {this.renderTimePickerOptions()}
          </ul>
        </div>
      </div>
    );
  }

}
