// Matched groups are the response that we get after the validation of duration via regex.
// In case we only have hours given as duration we will get the number part on index 9 and unit part i.e. hr(s) on index 10.
// In case we hours and minutes both are present we will get numeric part of the hours on index 3 and unit part i.e. hr(s) on
// index 10 and we will get the numeric part of the minutes on index 6 and unit part i.e. min(s) on index 7.
// In case we only have minutes the numeric part will be on index 13 and the unit part i.e. min(s) will be on index 14.
import React, {Component} from 'react';
import styles from './duration-picker.module.scss';
import {defaultTaskDurations} from '../../helpers/default-durations';
import cx from 'classnames';
import _ from 'lodash';


export default class DurationPicker extends Component {
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
    this.formatDoubleDigitDate = this.formatDoubleDigitDate.bind(this);
    this.hasMinutes = this.hasMinutes.bind(this);
    this.getDurationList = this.getDurationList.bind(this);
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

  handleTimeFieldFocus() {
    this.setState({
      showDropDown: true
    });
    const timePickerEl = document.getElementById("timepickerOptionsContainer" + this.props.elId);
    const durationList = this.getDurationList();
    durationList.map((defaultTaskDuration) => {
      if (defaultTaskDuration.label.includes(this.state.timeValue)) {
        const subEl = document.getElementById(defaultTaskDuration.value + this.props.elId);
        this.scrollParentToChild(timePickerEl, subEl);
      }
    });

  }

  formatDoubleDigitDate(value) {
    return value.toString().length === 1 ? '0' + value : value;
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
    let timeString;
    let valueCointainingMatchedGroupForHour;
    let valueCointainingMatchedGroupForMins;
    let hrsUnit;
    let minsUnit;
    const hasMins = this.hasMinutes();
    const timeRegEx = this.props.timeRegEx;
    if (currentValue.match(timeRegEx)) {
      const matchedGrups = timeRegEx.exec(currentValue);
      if (!hasMins) {
        if (matchedGrups[3]) {
          valueCointainingMatchedGroupForHour = parseInt(matchedGrups[2]);
          hrsUnit = matchedGrups[3];
        } else {
          valueCointainingMatchedGroupForHour = '';
          hrsUnit = '';
        }
      }else {
        if (matchedGrups[3] || matchedGrups[9]) {
          valueCointainingMatchedGroupForHour = matchedGrups[3] ? parseInt(matchedGrups[3]) : parseInt(matchedGrups[9]);
          hrsUnit = matchedGrups[3] ? matchedGrups[4] : matchedGrups[10]
        } else {
          valueCointainingMatchedGroupForHour = '';
          hrsUnit = '';
        }

        if (matchedGrups[6] || matchedGrups[12]) {
          valueCointainingMatchedGroupForMins = matchedGrups[6] ? parseInt(matchedGrups[6]) : parseInt(matchedGrups[12]);
          minsUnit = matchedGrups[6] ? matchedGrups[7] : matchedGrups[14]
        } else {
          valueCointainingMatchedGroupForMins = '';
          minsUnit = '';
        }
      }
      let hrs = valueCointainingMatchedGroupForHour;
      let mins = valueCointainingMatchedGroupForMins;

      if (hrs.length === 1) {
        hrs = 0 + hrs;
      }

      timeString = this.formatDoubleDigitDate(hrs) + ' ' + (hrsUnit ? hrsUnit.toLowerCase() : "")
      + (hasMins ? (' ' + this.formatDoubleDigitDate(mins) + ' ' + (minsUnit ? minsUnit.toLowerCase() : "")) : "");
      this.setState({
        timeValue: timeString.trim(),
        cloneValue: null,
        highlightedItem: null
      }, () => {
        this.props.updateValue(this.state.timeValue);
      });
    } else {
      this.setState({
        timeValue: this.state.cloneValue,
        cloneValue: null,
        highlightedItem: null
      }, () => {
        this.props.updateValue(this.state.timeValue);
      });
    }
  }

  renderTimePickerOptions() {
    const durationList = this.getDurationList();
    let renderedOptions = durationList.map((defaultTaskDuration) => {
      return (
        <li id={defaultTaskDuration.value + this.props.elId}
            className={cx(((this.state.timeValue && defaultTaskDuration.value === this.state.timeValue) || (this.state.highlightedItem !== null && this.state.highlightedItem === defaultTaskDuration.value)) && styles.selectedValue)}
            key={Math.random().toString(36).substr(2, 16)}>
          <a onMouseDown={(e) => {
            this.handleTimePickerOptionClick(e, defaultTaskDuration)
          }}>
            {defaultTaskDuration.value}
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
    }, () => {
      this.props.updateValue(option.value);
    });
  }

  handleTimeFieldValueChange(e) {
    e.preventDefault();
    e.stopPropagation();
    const cloneValue = this.state.cloneValue === null ? this.state.timeValue : this.state.cloneValue;
    const timeValue = e.target.value;
    const timePickerEl = document.getElementById("timepickerOptionsContainer" + this.props.elId);
    const durationList = this.getDurationList();
    for (let i = 0; i < durationList.length; i++) {
      if (durationList[i].shortValue === e.target.value.toLowerCase() || durationList[i].label.includes(e.target.value.toLowerCase()) || durationList[i].value.includes(e.target.value.toLowerCase())) {
        const subEl = document.getElementById(durationList[i].value + this.props.elId);
        this.scrollParentToChild(timePickerEl, subEl);
        this.setState({
          highlightedItem: durationList[i].value
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

  getDurationList() {
    return this.props.durationList ? this.props.durationList : defaultTaskDurations;
  }

  hasMinutes(){
    return typeof this.props.hasMins !== "undefined" ? this.props.hasMins : true;
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
    const hasMins = this.hasMinutes();
    let minsToAdd = hasMins ? 30 : 60;
    let matchedGroups;
    let prevMins = 0;
    let prevHours = 0;
    if (!this.state.showDropDown) {
      this.setState({
        showDropDown: true
      });
    }
    if (code === 38 || code === 40) { // arrow key up/down respectively
      e.preventDefault();
      e.stopPropagation();
      const timeRegEx = this.props.timeRegEx;
      let timeValue = this.state.timeValue && this.state.timeValue.match(timeRegEx) ? this.state.timeValue : this.state.cloneValue;
      matchedGroups = timeRegEx.exec(timeValue);
      let timeString = this.state.timeValue;
      let final = '';
      if (!matchedGroups) {
        return;
      }
      if (!hasMins){
        if (matchedGroups[2])
          prevHours = parseInt(matchedGroups[2]);
      } else {
        // When we have both hours and mins present, 3 will contain hours and 6 will contain mins.
        if (matchedGroups[3] && matchedGroups[6]) {
          prevHours = parseInt(matchedGroups[3]);
          prevMins = parseInt(matchedGroups[6]);
        } else if (matchedGroups[9]) {
          // When we will have only hours, according to regex it will be on 9th index.
          prevHours = parseInt(matchedGroups[9]);
        } else if (matchedGroups && (matchedGroups[12])) {
          // When we will have only mins, according to regex it will be on 12th index.
          prevMins = parseInt(matchedGroups[12]);
        }
      }
      if (e.keyCode === 38) {
        prevMins += minsToAdd;
        prevHours += Math.floor(prevMins / 60);
        prevMins = prevMins % 60;
        if (prevHours) {
          final = Math.floor((Math.log10(prevHours) + 1)) === 1 ? '0' + prevHours + (prevHours > 1 ? ' hrs ' : ' hr ') : prevHours + (prevHours > 1 ? ' hrs ' : ' hr ');
        }
        if (prevMins) {
          final += prevMins + ' mins';
        }
        if (!final) {
          return;
        }
        timeString = final.trim();
      }
      if (e.keyCode === 40) {
        prevMins = prevMins - minsToAdd;
        if (prevMins < 0 && !prevHours) {
          return;
        }
        if (prevMins < 0) {
          prevHours = prevHours - 1;
          prevMins = 60 + prevMins;
        }
        if (prevHours) {
          final = Math.floor((Math.log10(prevHours) + 1)) === 1 ? '0' + prevHours + (prevHours > 1 ? ' hrs ' : ' hr ') : prevHours + (prevHours > 1 ? ' hrs ' : ' hr ');
        }
        if (prevMins) {
          final += prevMins + ' mins';
        }
        if (!final) {
          return;
        }
        timeString = final.trim();
      }
      this.setState({
        timeValue: timeString,
        cloneValue: null,
        highlightedItem: null
      }, () => {
        this.props.updateValue(this.state.timeValue);
        const timePickerEl = document.getElementById("timepickerOptionsContainer" + this.props.elId);
        const durationList = this.getDurationList();
        durationList.map((defaultTaskDuration) => {
          if (defaultTaskDuration.value.includes(this.state.timeValue) || defaultTaskDuration.label.includes(this.state.timeValue)) {
            const subEl = document.getElementById(defaultTaskDuration.value + this.props.elId);
            this.scrollParentToChild(timePickerEl, subEl);
          }
        });

      });
    } else if (code === 13) { // enter key
      e.preventDefault();
      e.stopPropagation();
      let timeValue = this.state.timeValue;
      const timeRegEx = this.props.timeRegEx;
      const currentValue = e.target.value;
      let timeIntoString;
      let valueCointainingMatchedGroupForHour;
      let valueCointainingMatchedGroupForMins;
      let hrsUnit;
      let minsUnit;
      const matchedGrups = timeRegEx.exec(currentValue);
      if (!matchedGrups) {
        this.setState({
          timeValue:this.state.cloneValue,
        });
        return;
      }
      if (timeValue.match(timeRegEx)) {

        if (!hasMins){
          if (matchedGrups[3]) {
            valueCointainingMatchedGroupForHour = parseInt(matchedGrups[2]);
            hrsUnit = matchedGrups[3];
          }
        } else {
          if (matchedGrups[3] || matchedGrups[9]) {
            valueCointainingMatchedGroupForHour = matchedGrups[3] ? parseInt(matchedGrups[3]) : parseInt(matchedGrups[9]);
            hrsUnit = matchedGrups[3] ? matchedGrups[4] : matchedGrups[10]
          } else {
            valueCointainingMatchedGroupForHour = '';
            hrsUnit = '';
          }
          if (matchedGrups[6] || matchedGrups[12]) {
            valueCointainingMatchedGroupForMins = matchedGrups[6] ? parseInt(matchedGrups[6]) : parseInt(matchedGrups[12]);
            minsUnit = matchedGrups[6] ? matchedGrups[7] : matchedGrups[14]
          } else {
            valueCointainingMatchedGroupForMins = '';
            minsUnit = '';
          }
        }
        let hrs = valueCointainingMatchedGroupForHour;
        let mins = valueCointainingMatchedGroupForMins;

        timeIntoString = this.formatDoubleDigitDate(hrs) + ' ' + hrsUnit + (hasMins ? (' ' + this.formatDoubleDigitDate(mins) + ' ' + minsUnit) : "");
        timeValue = timeIntoString.toLowerCase();
      } else if (this.state.highlightedItem) {
        timeValue = this.state.highlightedItem.toLowerCase();
      } else if (this.state.cloneValue) {
        timeValue = this.state.cloneValue.toLowerCase();
      }
      timeValue = timeValue.trim();
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
      const timeRegEx = this.props.timeRegEx;

      if (timeValue.match(timeRegEx)) {
        timeValue = this.state.timeValue.toLowerCase();
      } else if (this.state.highlightedItem !== null) {
        timeValue = this.state.highlightedItem.toLowerCase();
      } else if (this.state.cloneValue !== null) {
        timeValue = this.state.cloneValue.toLowerCase();
      }

      this.setState({
        timeValue,
        showDropDown: false,
        highlightedItem: null,
        cloneValue: null
      }, () => {
        this.props.updateValue(timeValue);
      });
    } else {
      return;
    }
  }

  defragmentTimeString(timeString = this.state.timeValue) {
    const timeRegEx = this.props.timeRegEx;
    const matchedGrups = timeRegEx.exec(timeString);
    let hrs = matchedGrups[3] || matchedGrups[9];
    let mins = matchedGrups[6] || matchedGrups[12];


    if (hrs.length === 1) {
      hrs = 0 + hrs;
    }
    return {
      hrs,
      mins,
    }
  }

  render() {
    return (
      <div className={styles.timepickerContainer}>
        <input
          type="text"
          className={styles.timepickerTimeValueField}
          value={this.state.timeValue}
          onFocus={(e) => {
            this.handleTimeFieldFocus(e)
          }}
          onMouseDown={(e) => {
            this.handleTimeFieldFocus(e)
          }}
          onBlur={(e) => {
            this.handleTimeFieldBlur(e)
          }}
          onChange={(e) => {
            this.handleTimeFieldValueChange(e)
          }}
          onKeyDown={(e) => {
            this.handleTimePickerKeyDown(e)
          }}
          id={'timeInputEl' + this.props.elId}
          autoComplete="none"
          disabled={this.props.disabled}
          placeholder={this.props.placeholder}
        />
        <div
          onBlur={(e) => {
            this.handleOptionsContainerMouseUp(e)
          }}
          onMouseDown={(e) => {
            this.handleOptionsContainerMouseDown(e)
          }}
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
