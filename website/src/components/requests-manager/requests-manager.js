import React, {Component} from 'react';
import styles from './requests-manager.module.scss';
import ErrorAlert from '../error-alert/error-alert';
import {toast, ToastContainer} from 'react-toastify';
import {Cookies} from 'react-cookie';
import {Row, Col, Button, ButtonGroup} from 'react-bootstrap';
import cx from 'classnames';
import WorkerRequest from './worker-requests/worker-request';
import moment from 'moment';
import {parseQueryParams} from '../../helpers';
import DatePicker from 'react-bootstrap-date-picker';


export default class RequestsManager extends Component {
  constructor(props) {
    super(props);

    this.cookies = new Cookies();

    this.state = {
      internetIssue: undefined,
      showRequestModal: false,
      getAllWorkerRequests: [],
      showWorkerRequestDetails: false,
      date: this.initializeDate(),
      end_date: this.initializeDate(),
      showSpinner: false,
      loadingEntities: false,
      loadingWorkerRequest: false,
      blockingUpdate: false,
      viewType: this.cookies && this.cookies.get('calenderViewType') ? this.cookies.get('calenderViewType') : 'week',
      items_per_page: 100,
      page: 1,
      showSaveChangesModal: false,
      timer: null,
    };

    this.toggleRequestModal = this.toggleRequestModal.bind(this);
    this.openRequestDetails = this.openRequestDetails.bind(this);
    this.toggleUnsavedData = this.toggleUnsavedData.bind(this);
    this.updateWorkerRequestList = this.updateWorkerRequestList.bind(this);
    this.createToastNotification = this.createToastNotification.bind(this);
    this.getAjaxCall = this.getAjaxCall.bind(this);
    this.getUnscheduledAjaxCall = this.getUnscheduledAjaxCall.bind(this);
    this.initializeDate = this.initializeDate.bind(this);
    this.onDayFilterChange = this.onDayFilterChange.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.previousCalendarHandler = this.previousCalendarHandler.bind(this);
    this.nextCalendarHandler = this.nextCalendarHandler.bind(this);
    this.closeRequestDetails = this.closeRequestDetails.bind(this);
    this.paginationNextClicked = this.paginationNextClicked.bind(this);
    this.paginationPrevClicked = this.paginationPrevClicked.bind(this);
    this.visibilityChanged = this.visibilityChanged.bind(this);
    this.startAsyncUpdate = this.startAsyncUpdate.bind(this);
    this.clearAsyncUpdate = this.clearAsyncUpdate.bind(this);
  }

  componentDidMount() {
    this.setTimer = true;
    document.addEventListener('visibilitychange', this.visibilityChanged);
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 1000);
    if (this.setTimer && !document.hidden) {
      this.setState({
        timer, loadingWorkerRequest: true, showSpinner: true,
        internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
      });
    } else {
      clearTimeout(timer);
    }
  }

  componentWillUnmount() {
    this.cookies.set('calenderViewType', this.state.viewType);
    this.setTimer = false;
    this.clearAsyncUpdate();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
  }

  toggleRequestModal() {
    this.setState({
      showRequestModal: !this.state.showRequestModal,
    });
  }

  visibilityChanged() {
    if (document.hidden) {
      this.clearAsyncUpdate();
    } else {
      this.clearAsyncUpdate();
      this.startAsyncUpdate();
    }
  }

  clearAsyncUpdate() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
  }

  toggleUnsavedData(cancel) {
    if (this.state.showSaveChangesModal) {
      this.setState({
        showSaveChangesModal: false,
        showWorkerRequestDetails: cancel,
      }, () => this.updateWorkerRequestList());
    }
  }

  startAsyncUpdate() {
    this.updateWorkerRequestList();
  }

  closeRequestDetails(unsavedData = {}, savedData = {}) {
    let data = $.extend(true, {}, unsavedData);
    const timeZone = moment.tz.guess();

    let data_for_comparison = () => {
      const keys = Object.keys(unsavedData);
      let object = {};

      for (let key in keys) {
        if (keys[key] === 'start_datetime' || keys[key] === 'end_datetime' || keys[key] === 'scheduled_datetime') {
          if (savedData[keys[key]]) {
            object[keys[key]] = moment(savedData[keys[key]]).format('YYYY-MM-DDTHH:mm');
            data[keys[key]] = moment.utc(data[keys[key]]).format('YYYY-MM-DDTHH:mm');
          } else {

            let date = moment.utc(data['start_datetime']).format('YYYY-MM-DD');
            object[keys[key]] = keys[key] === 'start_datetime' ? moment.tz(`${date}T09:00`, timeZone).utc().format('YYYY-MM-DDTHH:mm') : keys[key] === 'end_datetime' ? moment.tz(`${date}T17:00`, timeZone).utc().format('YYYY-MM-DDTHH:mm') : null;
            data[keys[key]] = moment.utc(data[keys[key]]).format('YYYY-MM-DDTHH:mm');

          }
        } else if (keys[key] === 'task_ids' || keys[key] === 'entity_ids') {
          object[keys[key]] = savedData[keys[key]].sort();
          data[keys[key]] = data[keys[key]].sort();
        } else {
          object[keys[key]] = savedData[keys[key]];
        }
      }
      return object;
    };
    if (!_.isEqual(data, data_for_comparison())) {

      this.setState({
        showSaveChangesModal: true,
      })
    } else {
      this.setState({
        showWorkerRequestDetails: false,
      }, () => this.updateWorkerRequestList(true));
    }
  }

  openRequestDetails() {
    this.setState({
      showWorkerRequestDetails: true,
    });
  }


  updateWorkerRequestList(resetTimeout, postProcess = null, getTasksOnly = false) {
    if (!this.state.showRequestModal && !this.state.showWorkerRequestDetails) {
      if (this.state.timer && resetTimeout) {
        clearTimeout(this.state.timer);
      }

      if (this.callInProgress && this.callInProgress.state() === 'pending') {
        this.callInProgress.abort();
      }

      let startDate = moment(this.state.date);
      let endDate = moment(this.state.end_date);

      if (this.state.viewType === 'month') {
        startDate = startDate.startOf('month');
        endDate = endDate.endOf('month');
      } else if (this.state.viewType === 'week') {
        startDate = startDate.startOf('week');
        endDate = moment(endDate).endOf('week');
      } else {
        startDate = startDate.startOf('day');
        endDate = moment(endDate).endOf('day');
      }

      setTimeout(() => {
        this.setState({loadingWorkerRequest: true, showSpinner: true});

        this.props.getWorkerRequests({
          viewType: this.state.viewType,
          startDate: startDate.format().replace('+', '%2B'),
          endDate: endDate.format().replace('+', '%2B'),
          items_per_page: this.state.items_per_page,
          page: this.state.page,
          getAjaxCall: this.getAjaxCall,
        }).then((allWorkerRequest) => {
          const getAllWorkerRequests = JSON.parse(allWorkerRequest);
          this.setState({
            getAllWorkerRequests,
            showSpinner: false,
            loadingWorkerRequest: false,
            internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
          }, () => {
            return postProcess ? postProcess() : null;
          });
        }).catch((err) => {
          if (err.status === 0 && err.statusText === 'error') {
            this.setState({
              internetIssue: true,
              loadingWorkerRequest: false,
              showSpinner: false,
            });
          }
        });

        const timer = !getTasksOnly && setTimeout(() => {
          this.updateWorkerRequestList();
        }, 3e4);
        if (!getTasksOnly) {
          if (this.setTimer && !document.hidden) {
            this.setState({
              timer,
              internetIssue: typeof this.state.internetIssue !== 'undefined' ? false : undefined,
            });
          } else {
            clearTimeout(timer);
          }
        }
      }, 200);
    }
  }


  createToastNotification(notification) {
    toast(notification.text, notification.options);
  }

  getAjaxCall(call) {
    this.callInProgress = call;
  }

  getUnscheduledAjaxCall(call) {
    this.unscheduledCallInProgress = call;
  }

  initializeDate() {
    const query = parseQueryParams(this.props.location.search);
    if (query.date) {
      const dateObject = moment(query.date);
      if (dateObject.isValid()) {
        return new Date(query.date);
      } else {
        return new Date();
      }
    } else {
      return new Date();
    }
  }

  onDayFilterChange(e) {
    this.setState({
        viewType: e.target.value,
        page: 1,
      }, () => this.updateWorkerRequestList(true)
    );
  }

  onChangeDate(date) {
    this.setState({
      date,
      end_date: date,
      page: 1
    }, () => this.updateWorkerRequestList(true));
  }

  previousCalendarHandler() {
    let date = moment(this.state.date);
    let end_date = moment(this.state.end_date);
    if (this.state.viewType === 'day') {
      date = date.subtract(1, 'days');
      end_date = end_date.subtract(1, 'days');
    } else if (this.state.viewType === 'week') {
      date = date.subtract(1, 'week');
      end_date = end_date.subtract(1, 'week');
    } else if (this.state.viewType === 'month') {
      date = date.subtract(1, 'months');
      end_date = end_date.subtract(1, 'months');
    }
    date = date.toDate();
    end_date = end_date.toDate();
    this.setState({
      date, end_date, page: 1
    }, () => this.updateWorkerRequestList(true));
  }

  nextCalendarHandler() {
    let date = moment(this.state.date);
    let end_date = moment(this.state.end_date);
    if (this.state.viewType === 'day') {
      date = date.add(1, 'days');
      end_date = end_date.add(1, 'days');
    } else if (this.state.viewType === 'week') {
      date = date.add(1, 'week');
      end_date = end_date.add(1, 'week');
    } else if (this.state.viewType === 'month') {
      date = date.add(1, 'months');
      end_date = end_date.add(1, 'months');
    }
    date = date.toDate();
    end_date = end_date.toDate();
    this.setState({
      date, end_date, page: 1
    }, () => this.updateWorkerRequestList(true));
  }

  paginationPrevClicked() {
    this.setState({
      showSpinner: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum - 1;
    if (localPageNum > 1) {
      this.setState({
          page: newPage,
        },
        () => this.updateWorkerRequestList(true));
    } else {
      this.setState({
          page: 1,
        },
        () => this.updateWorkerRequestList(true));
    }
  }

  paginationNextClicked() {
    this.setState({
      showSpinner: true
    });
    const localPageNum = this.state.page;
    const newPage = localPageNum + 1;
    this.setState({
        page: newPage,
      },
      () => this.updateWorkerRequestList(true));
  }

  render() {
    let arrowLeft = <svg xmlns="http://www.w3.org/2000/svg" width="13.657" height="13.657" viewBox="0 0 13.657 13.657">
      <path
        d="M-90.024,11.657a.908.908,0,0,1-.675-.3.908.908,0,0,1-.3-.675V2.911A.911.911,0,0,1-90.09,2a.911.911,0,0,1,.911.911V9.836h6.925a.911.911,0,0,1,.911.911.911.911,0,0,1-.911.91Z"
        transform="translate(72.589 62.933) rotate(45)" fill="currentColor"/>
    </svg>;
    let arrowRight = <svg xmlns="http://www.w3.org/2000/svg" width="13.657" height="13.657" viewBox="0 0 13.657 13.657">
      <path
        d="M-90.024,11.657a.908.908,0,0,1-.675-.3.908.908,0,0,1-.3-.675V2.911A.911.911,0,0,1-90.09,2a.911.911,0,0,1,.911.911V9.836h6.925a.911.911,0,0,1,.911.911.911.911,0,0,1-.911.91Z"
        transform="translate(-58.932 -49.276) rotate(-135)" fill="currentColor"/>
    </svg>;
    let prevDisabled = false;
    let nextDisabled = false;
    if (this.state.page === 1) {
      prevDisabled = true;
    }

    if (this.state.getAllWorkerRequests.length < this.state.items_per_page) {
      nextDisabled = true;
    }

    const disabledNavBarElements = this.state.loadingWorkerRequest;

    return (
      <div>
        <ErrorAlert errorText="No internet connection" showError={this.state.internetIssue}/>
        <ToastContainer className={styles.toastContainer} toastClassName={styles.toast} autoClose={1}/>
        <div className={styles.topBar}>
          <Row>
            <Col xs={12} md={9}>
              <div className={styles.filersWrapper}>
                <strong className={styles.title}>Worker Request Dashboard</strong>
                <div className={styles.daysFilterWrapper}>
                  <ButtonGroup className={styles.monthDayWeekFilters}>
                    <Button className={this.state.viewType === 'day' ? styles.active : ''}
                            disabled={this.state.viewType === 'day' || disabledNavBarElements} value="day"
                            onClick={(e) => this.onDayFilterChange(e)}>Day</Button>
                    <Button className={this.state.viewType === 'week' ? styles.active : ''}
                            disabled={this.state.viewType === 'week' || disabledNavBarElements} value="week"
                            onClick={(e) => this.onDayFilterChange(e)}>Week</Button>
                    <Button className={this.state.viewType === 'month' ? styles.active : ''}
                            disabled={this.state.viewType === 'month' || disabledNavBarElements} value="month"
                            onClick={(e) => this.onDayFilterChange(e)}>Month</Button>
                  </ButtonGroup>
                </div>
                <div className={styles.datePickerWrapper}>
                  <div className={styles.datePicker}>
                    <i className={cx(styles.arrow, disabledNavBarElements ? styles.disabled : '')}
                       onClick={() => this.previousCalendarHandler()}>{arrowLeft}</i>
                    <DatePicker
                      id="start_date"
                      value={moment(this.state.date).local().format()}
                      onChange={(date) => this.onChangeDate(date)}
                      showClearButton={false}
                      showTodayButton={true}
                      disabled={disabledNavBarElements}
                    />
                    <i className={cx(styles.arrow, disabledNavBarElements ? styles.disabled : '')}
                       onClick={() => this.nextCalendarHandler()}>{arrowRight}</i>
                  </div>
                </div>
                {(!this.state.loadingTask && (this.state.getAllWorkerRequests.length > 0 || this.state.page > 1)) &&
                <div className={styles.pagination}>
                  <ul>
                    <li className={cx(styles.count)}>
                      {this.state.loadingTask || this.state.getAllWorkerRequests && this.state.getAllWorkerRequests.length < 1 ?
                        <span>{this.state.getAllWorkerRequests.length}</span> :
                        <span>{((this.state.page - 1) * this.state.items_per_page) + 1} - {(this.state.page * this.state.items_per_page) - (this.state.items_per_page - this.state.getAllWorkerRequests.length)}</span>
                      }
                    </li>
                    <li>
                      <button disabled={prevDisabled}
                              className={cx(prevDisabled && 'disabled', this.state.loadingTask && styles.pendingAction)}
                              onClick={() => this.paginationPrevClicked()}>{arrowLeft}</button>
                    </li>
                    <li>
                      <button disabled={nextDisabled}
                              className={cx(nextDisabled && 'disabled', this.state.loadingTask && styles.pendingAction)}
                              onClick={() => this.paginationNextClicked()}>{arrowRight}</button>
                    </li>
                  </ul>
                </div>
                }
              </div>
            </Col>
            <Col xs={12} md={3}>
              <div className={styles.btnContainer}>
                <button disabled={disabledNavBarElements} onClick={() => this.toggleRequestModal()}>New Request</button>
              </div>
            </Col>
          </Row>
        </div>
        <WorkerRequest
          showRequestModal={this.state.showRequestModal}
          toggleRequestModal={this.toggleRequestModal}
          getAllWorkerRequests={this.state.getAllWorkerRequests}
          updateWorkerRequestList={this.updateWorkerRequestList}
          selectedEntitiesFilter={this.state.selectedEntitiesFilter}
          deleteWorkerRequest={this.props.deleteWorkerRequest}
          createToastNotification={this.createToastNotification}
          showWorkerRequestDetails={this.state.showWorkerRequestDetails}
          openRequestDetails={this.openRequestDetails}
          getWorkerRequest={this.props.getWorkerRequest}
          updateWorkerRequest={this.props.updateWorkerRequest}
          postWorkerRequest={this.props.postWorkerRequest}
          selectedGroupsFilter={this.state.selectedGroupsFilter}
          selectedEntityRoleFilter={this.state.selectedEntityRoleFilter}
          sendWorkerRequest={this.props.sendWorkerRequest}
          profile={this.props.profile}
          getTasks={this.props.getTasks}
          getAjaxCall={this.getAjaxCall}
          getUnscheduledAjaxCall={this.getUnscheduledAjaxCall}
          getEntities={this.props.getEntities}
          requestDate={this.state.date}
          showSpinner={this.state.showSpinner}
          groups={this.props.groups}
          showSaveChangesModal={this.state.showSaveChangesModal}
          toggleUnsavedData={this.toggleUnsavedData}
          closeRequestDetails={this.closeRequestDetails}
          loadingWorkerRequest={this.state.loadingWorkerRequest}
        />
      </div>
    );
  }
}
