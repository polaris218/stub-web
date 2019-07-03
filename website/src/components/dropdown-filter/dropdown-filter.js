import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { ButtonGroup, DropdownButton, MenuItem, Checkbox } from 'react-bootstrap';
import cx from 'classnames';
import styles from './dropdown-filter.module.scss';
import {getStatusDetails} from "../../helpers/status_dict_lookup";
import { STATUS_META_DATA } from '../../helpers/status_meta_data';
import _ from 'lodash';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/fontawesome-free-solid';

const CustomMenuItem = ({ id, checked, name, handleClick }) => {
  return (
    <MenuItem
      onClick={handleClick}
      key={`item-${id}`}
      >
        <Checkbox
          key={`check-${id}`}
          bsClass=""
          checked={checked || false}
          inline
          onClick={handleClick}
          style={{ marginRight:'5px' }}
          value={id} />
        {name}
      </MenuItem>
  )
}

class DropdownFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      filterStatuses: '',
      focused: false,
    };

    this.handleFilterStatus = this.handleFilterStatus.bind(this);
    this.toggleFilter = this.toggleFilter.bind(this);
    this.getNonTerminalStatuses = this.getNonTerminalStatuses.bind(this);
    this.getAjaxCall = this.getAjaxCall.bind(this);
    this.getDataFromServer = this.getDataFromServer.bind(this);

   }

   componentDidMount() {
     let newData = [];
     const systemStatuses = [
       { id: 'INCOMPLETE', name: 'Incomplete Tasks' },
       { id: 'NOTSTARTED', name: getStatusDetails('NOTSTARTED').label },
       { id: 'REVIEW REMINDER', name: getStatusDetails('REVIEW_REMINDER').label },
       { id: 'APPROACHING', name: getStatusDetails('ARRIVING').label },
       { id: 'RECOMMENDED', name: getStatusDetails('RECOMMENDED').label },
       { id: 'LATE', name: getStatusDetails('LATE').label },
       { id: 'RESCHEDULED', name: getStatusDetails('RESCHEDULED').label },
       { id: 'NOSHOW', name: getStatusDetails('NOSHOW').label },
       { id: 'REMINDER', name: getStatusDetails('REMINDER').label },
       { id: 'STARTED', name: 'Started' },
       { id: 'ENROUTE', name: 'Enroute' },
       { id: 'CANCELLED', name: 'Cancelled' },
       { id: 'CONFIRMED', name: 'Confirmed' },
       { id: 'CUSTOMER EXCEPTION', name: 'Customer Exception' }];
     // prevent duplicates in the list
     if (this.props.title === 'Status' && this.state.data.length !== this.props.data.length + systemStatuses.length) {
       const statuses = this.props.data
         .map((status, i) => ({
           ...status,
           id: status.type,
           name: getStatusDetails(status.type).label
         })).concat(systemStatuses);
       const sortedStatuses = statuses.sort((status1, status2) => { return (status1.title ? status1.title.toLowerCase() : status1.name.toLowerCase()) > (status2.title ? status2.title.toLowerCase() : status2.name.toLowerCase()) ? 1 : ((status1.title ? status1.title.toLowerCase() : status1.name.toLowerCase()) < (status2.title ? status2.title.toLowerCase() : status2.name.toLowerCase()) ? -1 : 0); });
       this.setState({ data: sortedStatuses });
     }
     if (this.props.extraItem &&
       this.props.data &&
       !this.props.data.some(el => el.id === this.props.extraItem.id)) {
       newData.push(this.props.extraItem);
     }
     // prevent from restart data (cleaning checked props) when parent component re-renders
     if ((this.props.data && this.state.data && this.props.title !== 'Status') &&
       (this.props.data.length + !!this.props.extraItem !== this.state.data.length)) {
       this.setState({ data: this.props.data.concat(newData) });
     }
   }

  componentWillReceiveProps(nextProps) {
    let newData = [];
    const prevData = this.state.data || [];
    const systemStatuses = [
      { id: 'INCOMPLETE', name: 'Incomplete Tasks' },
      { id: 'NOTSTARTED', name: getStatusDetails('NOTSTARTED').label },
      { id: 'REVIEW REMINDER', name: getStatusDetails('REVIEW_REMINDER').label },
      { id: 'APPROACHING', name: getStatusDetails('ARRIVING').label },
      { id: 'RECOMMENDED', name: getStatusDetails('RECOMMENDED').label },
      { id: 'LATE', name: getStatusDetails('LATE').label },
      { id: 'RESCHEDULED', name: getStatusDetails('RESCHEDULED').label },
      { id: 'NOSHOW', name: getStatusDetails('NOSHOW').label },
      { id: 'REMINDER', name: getStatusDetails('REMINDER').label },
      { id: 'STARTED', name: 'Started' },
      { id: 'ENROUTE', name: 'Enroute' },
      { id: 'CANCELLED', name: 'Cancelled' },
      { id: 'CONFIRMED', name: 'Confirmed' },
      { id: 'CUSTOMER EXCEPTION', name: 'Customer Exception' }];
    // prevent duplicates in the list
    if (nextProps.title === 'Status' && this.state.data.length !== nextProps.data.length + systemStatuses.length) {
      const statuses = nextProps.data
        .map((status, i) => ({
          ...status,
          id: status.type,
          name: getStatusDetails(status.type).label
        })).concat(systemStatuses);
      const sortedStatuses = statuses.sort((status1, status2) => { return (status1.title ? status1.title.toLowerCase() : status1.name.toLowerCase()) > (status2.title ? status2.title.toLowerCase() : status2.name.toLowerCase()) ? 1 : ((status1.title ? status1.title.toLowerCase() : status1.name.toLowerCase()) < (status2.title ? status2.title.toLowerCase() : status2.name.toLowerCase()) ? -1 : 0); });
      this.setState({ data: sortedStatuses });
    }
    if (nextProps.extraItem &&
        nextProps.data &&
        !nextProps.data.some(el => el.id === nextProps.extraItem.id)) {
      newData.push(nextProps.extraItem);
    }

    // prevent from restart data (cleaning checked props) when parent component re-renders
    if ((nextProps.data && this.state.data && nextProps.title !== 'Status') &&
        (nextProps.data.length + !!nextProps.extraItem !== this.state.data.length)) {
      const nextData = nextProps.data.concat(newData);
      let data = prevData;
      nextData.map((item) => {
        if (data.findIndex((i) => {
          return i.id === item.id;
        }) === -1) {
          data.push(item);
        }
      });
      if (!_.isEqual(data, this.state.data)) {
        this.setState({data});
      }
    }
  }

  getDataFromServer(value) {
    this.props.searchCall(value, this.getAjaxCall).then((res) => {
      const data = JSON.parse(res);
      this.props.addNewData && this.props.addNewData(data);
      this.setState({
        data,
        loading: false
      })
    }).catch((e) => {
      console.log(e);
      this.setState({
        loading: false
      });
    })
  }

  getNonTerminalStatuses() {
    const terminalStatuses = [];
    _.mapValues(STATUS_META_DATA, (status) => {
      if (!status.isTerminal) {
        terminalStatuses.push(status);
      }
    });
    return terminalStatuses;
  }

  getAjaxCall(call) {
    this.searchCallInProgress = call;
  }

  handleFilterStatus(event) {
    event.stopPropagation();
    event.preventDefault();
    if (this.state.filterStatuses !== '' || event.target.value !== ' ') {
      let searchTimer = null;
      if (this.props.searchCall && event.target.value.length > 2) {
        if (this.searchCallInProgress && this.searchCallInProgress.state() === 'pending') {
          this.searchCallInProgress.abort();
        }
        if (this.state.timer) {
          clearTimeout(this.state.timer);
        }
        const value = event.target.value;
        searchTimer = setTimeout(() => {
          this.getDataFromServer(value);
        }, 1e3);
      }
      this.setState({filterStatuses: event.target.value, timer: searchTimer, loading: this.props.searchCall && event.target.value.length > 2});
    }
  }

  toggleFilter() {
    if (typeof this.inputFilter !== 'undefined') {
      if (this.state.focused) {
        this.inputFilter.blur();
        this.props.addNewData && this.props.addNewData([]);
        this.setState({
          focused: false,
          filterStatuses: '',
        });
      } else {
        this.setState({ focused: true });
        this.inputFilter.focus();
      }
    }
  }

  handleClick = (e, updateParentData = true) => {
    e.stopPropagation();
    if (this.state.focused && this.state.filterStatuses !== '') {
      this.inputFilter.focus();
    }
    let newData = [];
    if (e.target.name === 'select-all') {
      newData = this.state.data.map((item) => ({
        ...item,
        checked: true
      }));
      e.preventDefault();
    } else if (e.target.name === 'deselect-all') {
      newData = this.state.data.map((item) => ({
        ...item,
        checked: false
      }));
      e.preventDefault();
    } else {
      const clickedNode = typeof e.target.value !== 'undefined' ? e.target : e.target.children[0].lastChild;
      newData = this.state.data.map(item => {
        if (item.title) {
          return item.title === clickedNode.value ? { ...item, checked: !item.checked } : item;
        }
        return (item.id && item.id.toString() === clickedNode.value) ? { ...item, checked: !item.checked } :
            ((item.id === null && clickedNode.value === '0') ? { ...item, checked: !item.checked } : item);
      });
    }

    const selectedItems = newData.filter(item => item.checked);
    if (this.props.title === 'Status' && selectedItems.find((status) => {
      return status.id === 'STARTED';
    })) {
      const autoStart = {
        checked: true,
        id: 'AUTO_START',
        title: 'AUTO START',
        name: 'AUTO START'
      };
      selectedItems.push(autoStart);
    }
    if (this.props.title === 'Status' && selectedItems.find((status) => {
      return status.id === 'COMPLETE';
    })) {
      const autoComplete = {
        checked: true,
        id: 'AUTO_COMPLETE',
        title: 'AUTO COMPLETE',
        name: 'AUTO COMPLETE'
      };
      selectedItems.push(autoComplete);
    }
    if (this.props.title === 'Status' && selectedItems.find((status) => {
      return status.id === 'INCOMPLETE';
    })) {
      const nonTerminalStatuses = this.getNonTerminalStatuses();
      nonTerminalStatuses.map((status) => {
        selectedItems.push({
          checked: true,
          id: status.type,
          title: status.type,
          name: status.type
        });
      })
    }
    this.setState({ data: newData, isActive: selectedItems.length > 0 });
    updateParentData && this.props.handleChange(selectedItems);
  }

  render() {
    let statusOptions = null;
    if (typeof this.props !== 'undefined' && this.props.title === 'Status') {
      statusOptions = this.state.data && this.state.data.map((item) => {
        if (typeof this.props.searchable !== 'undefined' && this.props.searchable &&
          (item.id.toUpperCase().indexOf(this.state.filterStatuses.toUpperCase()) > -1 || (item.title && item.title.toUpperCase().indexOf(this.state.filterStatuses.toUpperCase()) > -1))) {
          return (
            <CustomMenuItem
              key={item.title ? item.title : (item.id ? item.id : 0)}
              id={item.title ? item.title : (item.id ? item.id : 0)}
              checked={item.checked}
              name={item.title ? item.title : item.name}
              handleClick={this.handleClick}
            />);
        }
      });
    }

    let options = null;
    options = this.state.data && this.state.data.map((item) => {
      if (typeof this.props.searchable !== 'undefined' && this.props.searchable &&
        (item.name.toUpperCase().indexOf(this.state.filterStatuses.toUpperCase()) > -1)) {
        return (
          <CustomMenuItem
            key={item.title ? item.title : (item.id ? item.id : 0)}
            id={item.title ? item.title : (item.id ? item.id : 0)}
            checked={item.checked}
            name={item.title ? item.title : item.name}
            handleClick={this.handleClick}
          />);
      }
    });


    const title = this.state.isActive ?
      <div style={{ display: 'inline-block' }}>
        {(typeof this.props.searchable !== 'undefined' && this.props.searchable && this.state.filterStatuses !== '') ?
          null
          :
          <div>
            { this.props.title }
            <label style={{ color: '#00d494', float: 'inherit' }}>[on]</label>
	          <span className={styles.customCaret}><FontAwesomeIcon icon={faChevronDown} /></span>
          </div>
        }
      </div>
      :
      (typeof this.props.searchable !== 'undefined' && this.props.searchable && this.state.filterStatuses !== '') ?
        null
        :
        <div>
	        {this.props.title}
	        <span className={styles.customCaret}><FontAwesomeIcon icon={faChevronDown} /></span>
        </div>;

    const style = {
      minWidth: this.props.minWidth ? this.props.minWidth : '140px',
      zIndex: this.state.focused === true ? '101' : 'auto'
    };

    if (this.props.maxWidth) {
      style['maxWidth'] = this.props.maxWidth;
    }
    let dropdownStyles = null;
    if (this.state.filterStatuses.length > 0) {
      dropdownStyles = styles.dropdownStyles;
    } else {
      dropdownStyles = null;
    }

    const loadingClass = (this.state.loading) ? styles.loading : '';
    return (
      <div>
        {typeof this.props.searchable !== 'undefined' && this.props.searchable &&
          <div>
            <ButtonGroup justified style={style} className={styles.dropdownButton}>
              <input type="text"
                     value={this.state.filterStatuses}
                     onChange={this.handleFilterStatus}
                     className={cx(styles.taskStatusFilterInput, dropdownStyles, loadingClass)}
                     ref={(input) => { this.inputFilter = input; }}/>
              <DropdownButton
              key="dropdown"
              className={styles.dropdownFilter}
              title={title}
              id="bg-nested-dropdown"
              onToggle={this.toggleFilter}
              noCaret={true}
              >
                <MenuItem key="first-item">
                  <a onClick={this.handleClick} href="#" name="deselect-all">Clear All</a>
                </MenuItem>
                { this.props.title === 'Status' ? statusOptions : options }
              </DropdownButton>
            </ButtonGroup>
          </div>
        }
        {(typeof this.props.searchable === 'undefined' || !this.props.searchable) &&
          <ButtonGroup justified style={style} className={styles.dropdownButton}>
            <DropdownButton
              key="dropdown"
              className={styles.dropdownFilter}
              title={title}
              id="bg-nested-dropdown"
              onToggle={e => null}
            >
              <MenuItem key="first-item">
                <a onClick={this.handleClick} href="#" name="deselect-all">Clear All</a>
              </MenuItem>
              {options}
            </DropdownButton>
          </ButtonGroup>
        }
      </div>
    );
  }
}

DropdownFilter.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object),
  handleChange: PropTypes.func,
  title: PropTypes.string,
  extraItem: PropTypes.object,
  minWidth: PropTypes.string,
  maxWidth: PropTypes.string,
  searchable: PropTypes.bool
}

export default DropdownFilter;