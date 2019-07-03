import React, {Component} from 'react';
import { Modal, Nav, NavItem, TabContainer, TabContent, TabPane } from 'react-bootstrap';
import cx from "classnames";
import styles from "./worker-request-details.module.scss";
import moment from "moment";
import WorkerRequestTasks from "./components/worker-request-tasks";
import WorkerRequestTeam from './components/worker-request-team';
import WorkerRequestSchedule from './components/worker-request-schedule';
import WorkerRequestMessage from './components/worker-request-message';
import WorkerRequestResponses from './components/worker-request-response';
import SavingSpinner from '../../../saving-spinner/saving-spinner';
import { toast } from 'react-toastify';
import { getErrorMessage } from '../../../../helpers/task';
import PropTypes from 'prop-types';
export default class WorkerRequestDetails extends Component {

  constructor(props) {
    super(props);

    this.state = {
      tabSelected: 1,
      tasksList: [],
      unscheduleTasksList: [],
      entities: [],
      items_per_page: 100,
      task_page: 1,
      entity_page: 1,
      loadingTaskList: false,
      loadingEntities: false,
      savingRequest: false,
      updatedData: {},
      number_of_workers_required: 1,
      start_datetime: '09:00 AM',
      end_datetime: '05:00 PM',
      request_date: '',
      date_to_compare: {},
    };
    this.handleSelect = this.handleSelect.bind(this);
    this.getTaskList = this.getTaskList.bind(this);
    this.getEntities = this.getEntities.bind(this);
    this.paginationTaskNextClicked = this.paginationTaskNextClicked.bind(this);
    this.paginationTaskPrevClicked = this.paginationTaskPrevClicked.bind(this);
    this.paginationEntityPrevClicked = this.paginationEntityPrevClicked.bind(this);
    this.paginationEntityNextClicked = this.paginationEntityNextClicked.bind(this);
    this.nextTab = this.nextTab.bind(this);
    this.previousTab = this.previousTab.bind(this);
    this.handleUpdateWorkerRequest = this.handleUpdateWorkerRequest.bind(this);
    this.updateAllData = this.updateAllData.bind(this);
    this.updateHandler = this.updateHandler.bind(this);
    this.handleCancel = this.handleCancel.bind(this);
    this.handleWorkerRequestData = this.handleWorkerRequestData.bind(this);
  }

  componentDidMount() {

    if (this.props.selected_worker_request_object && this.props.disableStatuses.indexOf(this.props.selected_worker_request_object.request_status) >= 0) {
      this.getTaskList();
    } else if (this.props.selected_worker_request_object && this.props.disableStatuses.indexOf(this.props.selected_worker_request_object.request_status) < 0) {
      this.setState({tabSelected: 5});
    }
    const data_to_compare = $.extend(true, {}, this.props.selected_worker_request_object);
    this.setState({
      updatedData: {},
      data_to_compare,
      request_date : this.props.selected_worker_request_object.request_date,
      number_of_workers_required: this.props.selected_worker_request_object.number_of_workers_required,
      start_datetime: this.props.selected_worker_request_object.start_datetime ? moment.utc(this.props.selected_worker_request_object.start_datetime).local().format('hh:mm a') : '09:00 AM',
      end_datetime: this.props.selected_worker_request_object.end_datetime ? moment.utc(this.props.selected_worker_request_object.end_datetime).local().format('hh:mm a') : '05:00 PM',
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if(!_.isEqual(this.props.selected_worker_request_object, prevProps.selected_worker_request_object)) {
      const data_to_compare = $.extend(true, {}, this.props.selected_worker_request_object);
      this.setState({
        data_to_compare
      });
    }
  }

  paginationTaskPrevClicked() {
    const localPageNum = this.state.task_page;
    const newPage = localPageNum - 1;
    if (localPageNum > 1) {
      this.setState({
          task_page: newPage,
        },
        () => this.getTaskList());
    } else {
      this.setState({
          task_page: 1,
        },
        () => this.getTaskList());
    }
  }

  paginationTaskNextClicked() {
    const localPageNum = this.state.task_page;
    const newPage = localPageNum + 1;
    this.setState({
        task_page: newPage,
      },
      () => this.getTaskList());
  }

  paginationEntityPrevClicked() {
    const localPageNum = this.state.entity_page;
    const newPage = localPageNum - 1;
    if (localPageNum > 1) {
      this.setState({
          entity_page: newPage,
        },
        () => this.getEntities());
    } else {
      this.setState({
          entity_page: 1,
        },
        () => this.getEntities());
    }
  }

  paginationEntityNextClicked() {
    const localPageNum = this.state.entity_page;
    const newPage = localPageNum + 1;
    this.setState({
        entity_page: newPage,
      },
      () => this.getEntities());
  }

  getEntities() {
    this.setState({
      loadingEntities: true,
    });

    this.props.getEntities(
      this.state.items_per_page,
      this.state.entity_page
    ).then((res) => {
      const entities = JSON.parse(res);
      this.setState({
        entities,
        loadingEntities: false,
      });
    }).catch((err) => {
      if (err.status === 0 && err.statusText === 'error') {
        this.setState({
          loadingEntities: false,
        });
      }
    });
  }

  getTaskList() {
    this.setState({
      loadingTaskList: true,
    });

    const promises = [];

    promises.push(this.props.getTasks({
      viewType: 'day',
      startDate: moment.utc(this.props.selected_worker_request_object.request_date).local().startOf('day'),
      endDate: moment.utc(this.props.selected_worker_request_object.request_date).local().endOf('day'),
      items_per_page: this.state.items_per_page,
      page: this.state.task_page,
      unscheduled: false,
      tasks_with_no_datetime: false,
      getAjaxCall: this.props.getAjaxCall
    }).then((res) => {
      let tasksList = JSON.parse(res);
      let task_ids = [];
      tasksList = tasksList.filter((task) => {
        // let start_date = moment(task.start_datetime_original_iso_str);
        // start_date = moment(start_date).add(task.duration, 'minutes').format('YYYY-MM-DD');
        if (task.template_type === 'TASK') {
          task_ids.push(task.id);
          return task;
        }
      });

      if(this.props.selected_worker_request_object && this.props.selected_worker_request_object.tasks_data && this.props.selected_worker_request_object.tasks_data.length > 0) {

        this.props.selected_worker_request_object.tasks_data.map((task) => {
          if (!task_ids.some((id) => id === task.id)){
            tasksList.push(task);
          }
        })

      }

      tasksList.map((task) => {
        if (!task.number_of_workers_required) {
          task.number_of_workers_required = 0;
        }
      });

      this.setState({
        tasksList,
      });
    }));

    // promises.push(
    //   this.props.getTasks({
    //     viewType: 'day',
    //     startDate: moment(this.props.selected_worker_request_object.request_date).startOf('day'),
    //     endDate: moment(this.props.selected_worker_request_object.request_date).endOf('day'),
    //     items_per_page: this.state.items_per_page,
    //     page: this.state.task_page,
    //     unscheduled: true,
    //     tasks_with_no_datetime: false,
    //     getAjaxCall: this.props.getAjaxCall
    //   }).then((res) => {
    //     let unscheduleTasksList = JSON.parse(res);
    //
    //     unscheduleTasksList.map((task) => {
    //       if (!task.number_of_workers_required) {
    //         task.number_of_workers_required = 0;
    //       }
    //     });
    //     this.setState({
    //       unscheduleTasksList,
    //     });
    //   })
    // );


    Promise.all(promises).then(() => {
      this.setState({
        loadingTaskList: false,
      })
    }).catch((err) => {
      if (err.status === 0 && err.statusText === 'error') {
        this.setState({
          loadingTaskList: false,
        });
      }
    });
  }

  handleSelect(eventKey) {
    this.setState({
      tabSelected: eventKey,
    }, () => {
      if (this.state.tabSelected === 1) {
        this.getTaskList();
      } else if (this.state.tabSelected === 2) {
        this.getEntities();
      }
    });
    this.updateAllData();
  }

  updateAllData() {
    let tabSelected = this.state.tabSelected;
    if (tabSelected === 1) {

      let data = this.refs && this.refs['workerRequest'+tabSelected].state;
      let updatedData = this.state.updatedData;
      let selectedTasksIds = data.selectedTasksIds;

      let start_datetime_span = moment(data.start_date).format('YYYY-MM-DD') + ' ' + data.start_time_span;
          start_datetime_span = moment(start_datetime_span, 'YYYY-MM-DD hh:mm a');
      let end_datetime_span = moment(data.end_date).format('YYYY-MM-DD') + ' ' + data.end_time_span;
          end_datetime_span = moment(end_datetime_span, 'YYYY-MM-DD hh:mm a');
      const id = this.props.selected_worker_request_object.id;
      Object.assign(updatedData, {
        id,
        task_ids: selectedTasksIds,
        number_of_workers_required: data.workersRequired,
        start_datetime: moment(start_datetime_span).format(),
        end_datetime: moment(end_datetime_span).format()
      });
      this.setState({ updatedData });
    } else if (tabSelected === 2) {
      let data = this.refs && this.refs['workerRequest'+tabSelected].state;
      let updatedData = this.state.updatedData;
      let selectedEntitiesIds = data.selectedEntitiesIds;

      const id = this.props.selected_worker_request_object.id;

      Object.assign(updatedData, {
        id,
        entity_ids: selectedEntitiesIds
      });
      this.setState({ updatedData });

    } else if (tabSelected === 4) {
      let data = this.refs && this.refs['workerRequest'+tabSelected].state;
      let updatedData = this.state.updatedData;
      let scheduled_datetime = moment(`${data.schedule_date} ${data.schedule_time}`, 'YYYY-MM-DDThh:mm:ss a');
          scheduled_datetime = moment(scheduled_datetime).format();
      const id = this.props.selected_worker_request_object.id;
      Object.assign(updatedData, {
        id,
        scheduled_datetime: scheduled_datetime,
        notification_type: data.notification_type
      });
      this.setState({ updatedData });
    }
  }

  handleCancel() {
    this.updateAllData();
    this.props.closeRequestDetails(this.state.updatedData, this.state.data_to_compare);
  }

  nextTab() {
    let tabSelected = this.state.tabSelected;
    if (tabSelected > 0 && tabSelected < 5) {
      this.setState({
        tabSelected: tabSelected +1
      }, () => {
        if (tabSelected === 1) {
          this.getEntities();
        }
      });
      if (this.props.disableStatuses.indexOf(this.props.selected_worker_request_object.request_status) >= 0) {
        this.updateAllData();
      }
    }
  }

  previousTab() {
    let tabSelected = this.state.tabSelected;
    if (tabSelected > 1 && tabSelected < 5) {
      this.setState({
        tabSelected: tabSelected -1
      }, () => {
        if (tabSelected === 2) {
          this.getTaskList();
        } else if (tabSelected === 3) {
          this.getEntities();
        }
      });
      if (this.props.disableStatuses.indexOf(this.props.selected_worker_request_object.request_status) >= 0) {
        this.updateAllData();
      }
    }
  }

  updateHandler() {
    if (this.props.disableStatuses.indexOf(this.props.selected_worker_request_object.request_status) >= 0) {
      let tabSelected = this.state.tabSelected;
      //this.refs && this.refs['workerRequest'+tabSelected].saveWorkerRequest(e);
      this.updateAllData();

      this.handleUpdateWorkerRequest(this.state.updatedData);
      if (tabSelected > 0 && tabSelected < 4 && !this.props.showSaveChangesModal) {
        this.setState({
          tabSelected: tabSelected + 1,
        }, () => {
          if (tabSelected === 1) {
            this.getEntities();
          }
        });
      }
    }
  }

  handleWorkerRequestData(start_datetime, end_datetime, number_of_workers_required){
    this.setState({
      start_datetime: start_datetime,
      end_datetime: end_datetime,
      number_of_workers_required: number_of_workers_required,
    });
  }

  handleUpdateWorkerRequest({id, task_ids = null, number_of_workers_required = null, start_datetime = null, end_datetime = null, entity_ids = null, scheduled_datetime = null, notification_type = null}) {
    this.setState({
      savingRequest: true,

    });

    task_ids = task_ids && task_ids.length > 0 ? task_ids.join(',') : null ;
    entity_ids = entity_ids && entity_ids.length > 0 ? entity_ids.join(',') : null ;
    let notification = null;
    this.props.updateWorkerRequest(id, task_ids, number_of_workers_required, start_datetime, end_datetime, entity_ids, scheduled_datetime, notification_type).then((res) => {
      notification = {
        text: 'Worker request updated',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.props.createToastNotification(notification);
      this.props.getWorkerRequestData(id);
      this.setState({
        savingRequest: false,
        updatedData: {}
      }, () => {
        this.props.updateWorkerRequestList(true);
        if (this.props.showSaveChangesModal || this.state.tabSelected === 4) {
          this.props.toggleUnsavedData(false);
        }

      });
    }).catch((err) => {
      let error = JSON.parse(err.responseText);
      notification = {
        text: getErrorMessage(error),
        options: {
          type: toast.TYPE.ERROR,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastErrorAlert,
          autoClose: 8000
        }
      };
      this.props.createToastNotification(notification);
      this.setState({
        savingRequest: false,
      })
    });
  }


  render() {
    let prevDisabled = false;
    let nextDisabled = false;
    let prevEntitiesDisabled = false;
    let nextEntitiesDisabled = false;

    if (this.state.task_page === 1) {
      prevDisabled = true;
    }

    if (this.state.entity_page === 1) {
      prevEntitiesDisabled = true;
    }
    if (this.state.tasksList && this.state.tasksList.length < this.state.items_per_page) {
      nextDisabled = true;
    }

    if (this.state.entities && this.state.entities.length < this.state.items_per_page) {
      nextEntitiesDisabled = true;

    }

    const closeIcon =  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <g transform="translate(-5734 -5635)">
        <g transform="translate(5734 5635)" fill="none" stroke="#c4cbd1" strokeWidth="1" className={cx(styles.circle)}>
          <circle cx="12" cy="12" r="12" stroke="none"/>
          <circle cx="12" cy="12" r="11.5" fill="none"/>
        </g>
        <path className={cx(styles.cross)} d="M-2850.176,77.812l-2.171-2.171-2.171,2.171a.7.7,0,0,1-.987,0,.7.7,0,0,1,0-.987l2.171-2.171-2.172-2.172a.7.7,0,0,1,0-.987.7.7,0,0,1,.988,0l2.172,2.172,2.172-2.172a.7.7,0,0,1,.987,0,.7.7,0,0,1,0,.987l-2.172,2.172,2.172,2.172a.7.7,0,0,1,0,.987.7.7,0,0,1-.494.2A.7.7,0,0,1-2850.176,77.812Z" transform="translate(8598.711 5572.71)" fill="#c4cbd1"/>
      </g>
    </svg>;
    const color = this.props.selected_worker_request_object && this.props.selected_worker_request_object.request_status.toLowerCase();
    let tabSelected = this.state.tabSelected;

    return (
      <div>
        <Modal show={this.props.showWorkerRequestDetails} className={cx(styles.modalRequest, styles.modalViewRequest)}>
          <Modal.Header className={cx(styles.modalHeader)}>
            <Modal.Title className={cx(styles.modalTitle)}>{this.props.selected_worker_request_object.title}
            <div className={styles.status}><i className={cx(styles.statusColor, styles[color])}/><span>{this.props.selected_worker_request_object.request_status.toLowerCase().replace('_', ' ')}</span></div>
              <div className={styles.status}><a href="https://help.arrivy.com/requests/" target="_blank">help</a></div>
            </Modal.Title>
            <i className={cx(styles.close)} onClick={() => this.handleCancel()}>{closeIcon}</i>
          </Modal.Header>
          <Modal.Body>
            <TabContainer activeKey={tabSelected} className={cx(styles['worker-requests'])}>
              <div>
                <nav className={styles.tabNav}>
                  <Nav>
                    <NavItem eventKey={1} onSelect={(firstTab, lastTab) => this.handleSelect(firstTab, lastTab)}>1. Tasks</NavItem>
                    <NavItem eventKey={2} onSelect={(firstTab, lastTab) => this.handleSelect(firstTab, lastTab)}>2. Team</NavItem>
                    <NavItem eventKey={3} onSelect={(firstTab, lastTab) => this.handleSelect(firstTab, lastTab)}>3. Message</NavItem>
                    <NavItem eventKey={4} onSelect={(firstTab, lastTab) => this.handleSelect(firstTab, lastTab)}>4. Schedule</NavItem>
                    <NavItem eventKey={5} onSelect={(firstTab, lastTab) => this.handleSelect(firstTab, lastTab)}>Responses</NavItem>
                  </Nav>
                  <div className={styles.actionButtons}>
                    <button type="button" className={cx(styles.btn, styles['btn-primary'])} onClick={() => this.handleCancel()}>Cancel</button>
                    {(tabSelected !== 3 && tabSelected !== 5) &&
                    <button onClick={() => this.updateHandler()} disabled={this.props.disableStatuses.indexOf(this.props.selected_worker_request_object.request_status) >= 0 ? false : true} className={cx(styles.btn, styles['btn-secondary'], this.state.savingRequest ? styles.disabled : '')}>
                      {this.state.savingRequest ? <SavingSpinner className={styles.whiteLoader} size={8} borderStyle="none"/> : 'Save Changes'}
                    </button>}
                  </div>
                </nav>
                <TabContent className={cx(styles.workerDetailDashboard)}>
                  <TabPane eventKey={1}>
                    <WorkerRequestTasks
                      tasksList={this.state.tasksList}
                      // unscheduleTasksList={this.state.unscheduleTasksList}
                      entities={this.state.entities}
                      worker_request_object={this.props.selected_worker_request_object}
                      handleUpdateWorkerRequest={this.handleUpdateWorkerRequest}
                      savingRequest={this.props.savingRequest}
                      loadingTaskList={this.state.loadingTaskList}
                      disableStatuses={this.props.disableStatuses}
                      nextDisabled={nextDisabled}
                      prevDisabled={prevDisabled}
                      paginationPrevClicked={this.paginationTaskPrevClicked}
                      paginationNextClicked={this.paginationTaskNextClicked}
                      items_per_page={this.state.items_per_page}
                      page={this.state.task_page}
                      handleWorkerRequestData={this.handleWorkerRequestData}
                      ref="workerRequest1"
                    />
                  </TabPane>
                  <TabPane eventKey={2}>
                    <WorkerRequestTeam
                      entities={this.state.entities}
                      worker_request_object={this.props.selected_worker_request_object}
                      handleUpdateWorkerRequest={this.handleUpdateWorkerRequest}
                      savingRequest={this.props.savingRequest}
                      updateWorkerRequestList={this.props.updateWorkerRequestList}
                      selectedEntitiesFilter={this.props.selectedEntitiesFilter}
                      selectedGroupsFilter={this.props.selectedGroupsFilter}
                      selectedEntityRoleFilter={this.props.selectedEntityRoleFilter}
                      loadingEntities={this.state.loadingEntities}
                      disableStatuses={this.props.disableStatuses}
                      nextDisabled={nextEntitiesDisabled}
                      prevDisabled={prevEntitiesDisabled}
                      items_per_page={this.state.items_per_page}
                      page={this.state.entity_page}
                      paginationPrevClicked={this.paginationEntityPrevClicked}
                      paginationNextClicked={this.paginationEntityNextClicked}
                      groups={this.props.groups}
                      start_datetime={this.state.start_datetime}
                      end_datetime={this.state.end_datetime}
                      request_date={this.state.request_date}
                      number_of_workers_required={this.state.number_of_workers_required}
                      ref="workerRequest2"
                    />
                  </TabPane>
                  <TabPane eventKey={3}>
                    <WorkerRequestMessage
                      worker_request_object={this.props.selected_worker_request_object}
                      savingRequest={this.props.savingRequest}
                      handleUpdateWorkerRequest={this.handleUpdateWorkerRequest}
                      sendRequestNow={this.props.sendRequestNow}
                      profile={this.props.profile}
                      disableStatuses={this.props.disableStatuses}
                      updateWorkerRequestList={this.props.updateWorkerRequestList}
                      start_datetime={this.state.start_datetime}
                      end_datetime={this.state.end_datetime}
                      request_date={this.state.request_date}
                      number_of_workers_required={this.state.number_of_workers_required}
                      getWorkerRequestData={this.props.getWorkerRequestData}
                      updatedData={this.state.updatedData}
                    />
                  </TabPane>
                  <TabPane eventKey={4}>
                    <WorkerRequestSchedule
                      worker_request_object={this.props.selected_worker_request_object}
                      handleUpdateWorkerRequest={this.handleUpdateWorkerRequest}
                      savingRequest={this.props.savingRequest}
                      sendRequestNow={this.props.sendRequestNow}
                      disableStatuses={this.props.disableStatuses}
                      updatedData={this.state.updatedData}
                      start_datetime={this.state.start_datetime}
                      end_datetime={this.state.end_datetime}
                      request_date={this.state.request_date}
                      number_of_workers_required={this.state.number_of_workers_required}
                      updateAllData={this.updateAllData}
                      ref="workerRequest4"
                    />
                  </TabPane>
                  <TabPane eventKey={5}>
                    <WorkerRequestResponses
                      worker_request_object={this.props.selected_worker_request_object}
                      savingRequest={this.props.savingRequest}
                      sendRequestNow={this.props.sendRequestNow}
                      profile={this.props.profile}
                      disableStatuses={this.props.disableStatuses}
                      start_datetime={this.state.start_datetime}
                      end_datetime={this.state.end_datetime}
                      request_date={this.state.request_date}
                      number_of_workers_required={this.state.number_of_workers_required}
                    />
                  </TabPane>
                </TabContent>
                <div className={styles.tabControls}>
                  {(tabSelected > 1 && tabSelected < 5) && <button className={cx(styles.btn, styles['btn-light'])} onClick={this.previousTab}>Previous</button>}
                  {(tabSelected > 0 && tabSelected < 4) && <button className={cx(styles.btn, styles['btn-secondary'], styles.next)} onClick={this.nextTab}>Next</button>}
                </div>
              </div>
            </TabContainer>
            {this.props.selected_worker_request_object && <div className={cx(styles.externalInfo)}>
              {this.props.selected_worker_request_object.id && <div><strong>ID</strong> : {this.props.selected_worker_request_object.id}</div>}
              {this.props.selected_worker_request_object.external_id && <div><strong>External ID</strong> : {this.props.selected_worker_request_object.external_id}</div>}
            </div>}

          </Modal.Body>
        </Modal>
        <Modal show={this.props.showSaveChangesModal} className={cx(styles.modalRequest, styles.modalRequestSmall, styles.unsavedDataModal)}>
          <Modal.Header className={styles.modalHeader}>
            <Modal.Title className={styles.modalTitle}>Unsaved Data</Modal.Title>
            <i className={styles.close} onClick={() => this.props.toggleUnsavedData(true)}>{closeIcon}</i>
          </Modal.Header>
          <Modal.Body>
            <div className={styles.box}>
              <div className={styles.boxBody}>
                <div className={cx(styles.boxBodyInner, ['text-center'])}>
                  <p>There are some unsaved changes. Do you want to save them?</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <button onClick={() => this.props.toggleUnsavedData(true)} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
              <button onClick={() => this.props.toggleUnsavedData(false)} className={cx(styles.btn, styles['btn-light'], styles.delete)}>No</button>
              <button onClick={() => this.updateHandler()} disabled={this.state.savingRequest} className={cx(styles.btn, styles['btn-secondary'])}>
                {this.state.savingRequest ? <SavingSpinner className={styles.whiteLoader} size={8} borderStyle="none"/> : 'Yes'}
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>);
  }

}

WorkerRequestDetails.propTypes = {
  updateWorkerRequest: PropTypes.func.isRequired,
};

