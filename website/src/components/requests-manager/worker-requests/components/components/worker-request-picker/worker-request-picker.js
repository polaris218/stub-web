// Matched groups are the response that we get after the validation of duration via regex.
// In case we only have hours given as duration we will get the number part on index 9 and unit part i.e. hr(s) on index 10.
// In case we hours and minutes both are present we will get numeric part of the hours on index 3 and unit part i.e. hr(s) on
// index 10 and we will get the numeric part of the minutes on index 6 and unit part i.e. min(s) on index 7.
// In case we only have minutes the numeric part will be on index 13 and the unit part i.e. min(s) will be on index 14.
import React, {Component} from 'react';
import styles from './worker-request-picker.module.scss';
import {defaultWorkerRequestNumbers} from '../../../../../../helpers/default-worker-request-numbers';
import cx from 'classnames';
import _ from 'lodash';


export default class WorkerRequestPicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      requiredWorkers: props.value,
      showDropDown: false,
      cloneValue: null,
      preventBlur: false,
      highlightedItem: null,
      number_of_workers: 0
    };

    this.handleWorkerFieldFocus = this.handleWorkerFieldFocus.bind(this);
    this.handleWorkerFieldBlur = this.handleWorkerFieldBlur.bind(this);
    this.renderWorkerPickerOptions = this.renderWorkerPickerOptions.bind(this);
    this.handleTimePickerOptionClick = this.handleTimePickerOptionClick.bind(this);
    this.handleWorkersRequiredValueChange = this.handleWorkersRequiredValueChange.bind(this);
    this.handleOptionsContainerMouseDown = this.handleOptionsContainerMouseDown.bind(this);
    this.handleOptionsContainerMouseUp = this.handleOptionsContainerMouseUp.bind(this);
    this.scrollParentToChild = this.scrollParentToChild.bind(this);
    this.handleFieldPickerKeyDown = this.handleFieldPickerKeyDown.bind(this);

  }

  componentDidMount() {
    if (this.props.value !== this.state.requiredWorkers) {
      this.setState({
        requiredWorkers: this.props.value
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(nextProps, this.props)) {
      this.setState({
        requiredWorkers: nextProps.value
      });
    }
  }

  handleWorkerFieldFocus() {

    this.setState({
      showDropDown: true
    });

    const workerPickerEl = document.getElementById("timepickerOptionsContainer" + this.props.elId);
    defaultWorkerRequestNumbers.map((defaultWorkersNumber) => {
      if (defaultWorkersNumber.label.includes(this.state.requiredWorkers)) {
        const subEl = document.getElementById(defaultWorkersNumber.value + this.props.elId);

        this.scrollParentToChild(workerPickerEl, subEl);
      }
    });

  }

  handleWorkerFieldBlur(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!this.state.preventBlur) {
      this.setState({
        showDropDown: false
      });
    }
    const currentValue = e.target.value;
    let requiredWorkers;

    const workerRequestRegex = this.props.workerRequestRegex;
    if (currentValue.match(workerRequestRegex)) {
      const matchedGrups = workerRequestRegex.exec(currentValue);

      if (matchedGrups[1]) {
        requiredWorkers = parseInt(matchedGrups[1]);
      }

      this.setState({
        requiredWorkers,
        cloneValue: null,
        highlightedItem: null
      }, () => {
        this.props.updateValue(this.state.requiredWorkers);
      });
    } else {
      this.setState({
        requiredWorkers: this.state.cloneValue,
        cloneValue: null,
        highlightedItem: null
      }, () => {
        this.props.updateValue(this.state.requiredWorkers);
      });
    }
  }

  renderWorkerPickerOptions() {
    let renderedOptions = defaultWorkerRequestNumbers.map((defaultWorkerNumber) => {

      return (
        <li id={defaultWorkerNumber.value + this.props.elId}
            className={cx(((this.state.requiredWorkers && defaultWorkerNumber.value === this.state.requiredWorkers) || (this.state.highlightedItem !== null && this.state.highlightedItem === defaultWorkerNumber.value)) && styles.selectedValue)}
            key={Math.random().toString(36).substr(2, 16)}>
          <a onMouseDown={(e) => {
            this.handleTimePickerOptionClick(e, defaultWorkerNumber)
          }}>
            {defaultWorkerNumber.label}
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
      requiredWorkers: option.value,
      showDropDown: false,
      highlightedItem: null,
      cloneValue: null
    }, () => {
      this.props.updateValue(option.value);
    });
  }

  handleWorkersRequiredValueChange(e) {

    e.preventDefault();
    e.stopPropagation();
    const cloneValue = this.state.cloneValue === null ? this.state.requiredWorkers : this.state.cloneValue;
    const requiredWorkers = e.target.value;
    const timePickerEl = document.getElementById("timepickerOptionsContainer" + this.props.elId);
    for (let i = 0; i < defaultWorkerRequestNumbers.length; i++) {
      if (defaultWorkerRequestNumbers[i].label.includes(e.target.value) || defaultWorkerRequestNumbers[i].value == e.target.value) {
        const subEl = document.getElementById(defaultWorkerRequestNumbers[i].value + this.props.elId);
        this.scrollParentToChild(timePickerEl, subEl);
        this.setState({
          highlightedItem: defaultWorkerRequestNumbers[i].value
        });
        break;
      }
    }
    this.setState({
      cloneValue,
      requiredWorkers
    });
  }

  handleOptionsContainerMouseDown(e) {
    e.preventDefault();
    e.stopPropagation();
    const inputEl = document.getElementById("InputEl" + this.props.elId);
    inputEl.focus();
    this.setState({
      preventBlur: false
    });
  }

  handleOptionsContainerMouseUp(e) {
    e.preventDefault();
    e.stopPropagation();
    const inputEl = document.getElementById("InputEl" + this.props.elId);
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

  handleFieldPickerKeyDown(e) {

    const code = e.keyCode ? e.keyCode : e.which;
    let matchedGroups;
    if (!this.state.showDropDown) {
      this.setState({
        showDropDown: true
      });
    }
    if (code === 38 || code === 40) { // arrow key up/down respectively
      e.preventDefault();
      e.stopPropagation();
      const workerRequestRegex = this.props.workerRequestRegex;
      let requiredWorkers = this.state.requiredWorkers && this.state.requiredWorkers.match(workerRequestRegex) ? this.state.requiredWorkers : this.state.cloneValue;
      matchedGroups = workerRequestRegex.exec(requiredWorkers);
      if (!matchedGroups) {
        return;
      }

      if (matchedGroups[1]) {
        requiredWorkers = parseInt(matchedGroups[1]);
      }

      if (e.keyCode === 38) {
        requiredWorkers = requiredWorkers + 1;
      }
      if (e.keyCode === 40 && requiredWorkers - 1 > 0) {
        requiredWorkers = requiredWorkers - 1;
      }
      this.setState({
        requiredWorkers,
        cloneValue: null,
      }, () => {
        this.props.updateValue(requiredWorkers);
        const workerRequestPicker = document.getElementById("timepickerOptionsContainer" + this.props.elId);

        defaultWorkerRequestNumbers.map((defaultWorkerRequest) => {
          if (defaultWorkerRequest.value === this.state.requiredWorkers || defaultWorkerRequest.label.includes(this.state.requiredWorkers)) {

            const subEl = document.getElementById(defaultWorkerRequest.value + this.props.elId);
            this.setState({
              highlightedItem: defaultWorkerRequest.value
            });
            this.scrollParentToChild(workerRequestPicker, subEl);
          }
        });

      });
    } else if (code === 13) { // enter key
      e.preventDefault();
      e.stopPropagation();
      let requiredWorkers = this.state.requiredWorkers;
      const workerRequestRegex = this.props.workerRequestRegex;
      const currentValue = e.target.value;
      const matchedGrups = workerRequestRegex.exec(currentValue);
      if (!matchedGrups) {
        this.setState({
          requiredWorkers: this.state.cloneValue,
        });
        return;
      }
      if (requiredWorkers.match(workerRequestRegex)) {

        if (matchedGrups[1]) {
          requiredWorkers = parseInt(matchedGrups[1]);
        }
        this.setState({
          requiredWorkers,
          showDropDown: false,
          highlightedItem: null,
          cloneValue: null
        }, () => {
          this.props.updateValue(this.state.requiredWorkers);
        });
      }
    }
  }

    render() {

      return (
        <div className={styles.timepickerContainer}>
          <input
            type="text"
            className={styles.timepickerTimeValueField}
            value={this.state.requiredWorkers}
            onFocus={(e) => {
              this.handleWorkerFieldFocus(e)
            }}
            onMouseDown={(e) => {
              this.handleWorkerFieldFocus(e)
            }}
            onBlur={(e) => {
              this.handleWorkerFieldBlur(e)
            }}
            onChange={(e) => {
              this.handleWorkersRequiredValueChange(e)
            }}
            onKeyDown={(e) => {
              this.handleFieldPickerKeyDown(e)
            }}
            id={'InputEl' + this.props.elId}
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
              {this.renderWorkerPickerOptions()}
            </ul>
          </div>
        </div>
      );
    }
  }
