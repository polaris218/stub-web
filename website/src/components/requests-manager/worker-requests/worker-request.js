import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Button,
  Modal,
  FormControl, ControlLabel, FormGroup, Table, Popover, OverlayTrigger, Tooltip
} from 'react-bootstrap';
import DatePicker from 'react-bootstrap-date-picker';
import cx from "classnames";
import styles from "./worker-request.module.scss";
import SavingSpinner from "../../saving-spinner/saving-spinner";
import FontAwesomeIcon from "@fortawesome/react-fontawesome";
import {faCalendar} from "@fortawesome/fontawesome-free-solid";
import {FieldGroup} from "../../fields";
import moment from "moment";
import '../../../../../website/styles/colors.scss';
import {toast} from "react-toastify";
import {getErrorMessage} from "../../../helpers/task";
import WorkerRequestDetails from "./components/worker-request-details";
const disableStatuses = ['EDITING', 'UNSCHEDULED', 'NOT_SENT'];

export default class WorkerRequest extends Component {
  constructor(props) {
    super(props);
    this.state = {
      worker_request_object: {
        request_date: null,
        title: '',
        description: '',
      },
      savingRequest: false,
      allWorkerRequests: [],
      selected_worker_request_object: {},
      showDeleteModal: false,
      worker_request_id: null,
    };

    this.openRequestModal = this.openRequestModal.bind(this);
    this.showDeleteRequestModal = this.showDeleteRequestModal.bind(this);
    this.hideDeleteRequestModal = this.hideDeleteRequestModal.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.saveRequest = this.saveRequest.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.getInitialValues = this.getInitialValues.bind(this);
    this.renderWorkerRequest = this.renderWorkerRequest.bind(this);
    this.openDetails = this.openDetails.bind(this);
    this.sendRequestNow = this.sendRequestNow.bind(this);
    this.getWorkerRequestData = this.getWorkerRequestData.bind(this);
  }

  componentDidMount() {
    this.getInitialValues();

    let selected_worker_request_object = this.props.getAllWorkerRequests.length > 0 && this.state.selected_worker_request_object && this.props.getAllWorkerRequests.filter((worker_request_object) => {
      return worker_request_object.id === this.state.selected_worker_request_object.id;
    });

    if (selected_worker_request_object) {
      this.setState({
        selected_worker_request_object: selected_worker_request_object[0],
      });
    }
  }

  componentWillMount() {
    this.setState({loading:  true})
  }

  componentDidUpdate(prevProps) {

    if (!_.isEqual(this.props, prevProps)) {
      if (prevProps.showSpinner && this.state.loading) {
      this.setState({loading: false});
    }
      this.getInitialValues();
      if(!_.isEqual(this.props.getAllWorkerRequests, prevProps.getAllWorkerRequests)){
        let selected_worker_request_object = this.props.getAllWorkerRequests.length > 0 && this.state.selected_worker_request_object && this.props.getAllWorkerRequests.filter((worker_request_object) => {
          return worker_request_object.id === this.state.selected_worker_request_object.id;
        });

        if (selected_worker_request_object) {
          this.setState({
            selected_worker_request_object: selected_worker_request_object[0],
          });
        }
      }

    }
  }

  getWorkerRequestData(id) {
     this.props.getWorkerRequest(id).then((response) => {
       const selected_worker_request_object = $.extend(true, {}, JSON.parse(response));

       this.setState({
         selected_worker_request_object,
       });
     });
  }

  openDetails(e, worker_request_object) {
    e.stopPropagation();
    e.preventDefault();
    let selected_worker_request_object = $.extend(true, {}, worker_request_object);
    this.setState({
      selected_worker_request_object,
    }, () => this.props.openRequestDetails());
  }

  handleChange(e, key) {
    e.stopPropagation();
    e.preventDefault();

    let worker_request_object = this.state.worker_request_object;

    worker_request_object[key] = e.target.value;
    this.setState({
      worker_request_object
    });
  }

  showDeleteRequestModal(id) {
    this.setState({
      showDeleteModal: true,
      worker_request_id: id
    });
  }

  hideDeleteRequestModal() {
    this.setState({
      showDeleteModal: false
    });
  }

  handleDelete(e, id) {
    e.stopPropagation();
    e.preventDefault();

    let notification = null;
    this.setState({savingRequest: true});

    this.props.deleteWorkerRequest(id).then((res) => {
      notification = {
        text: 'Worker request deleted',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.props.createToastNotification(notification);
      this.setState({savingRequest: false, showDeleteModal: false, worker_request_id: null});
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
      this.setState({savingRequest: false, showDeleteModal: false, worker_request_id: null});
    });

    this.props.updateWorkerRequestList(true);

  }

  getInitialValues() {
    let description = '';
    let dateNow = new moment();
    let request_date = moment(dateNow).local().format();

    let title_month = dateNow.format('MMM');
    let title_date = dateNow.format('DD');
    let title = '';

    if (this.props.getAllWorkerRequests && this.props.getAllWorkerRequests.length > 0) {
      title = title_month + ' ' + title_date + ' - ' + 'New Request ' + `${this.props.getAllWorkerRequests.length + 1}`;
    } else {
      title = title_month + ' ' + title_date + ' - ' + 'New Request';
    }

    this.setState({
      worker_request_object: {
        request_date,
        title,
        description
      },
    });
  }

  renderWorkerRequest() {
    String.prototype.trunc = String.prototype.trunc || function(n){
      return (this.length > n) ? this.substr(0, n-1) + '...' : this;
    };

    let localDate = new moment();
    let flag = false;
    let renderedContent = null;
    if (this.props.getAllWorkerRequests && this.props.getAllWorkerRequests.length > 0) {
      renderedContent = this.props.getAllWorkerRequests.map((worker_request, key) => {
        if (localDate !== moment.utc(worker_request.request_date).local().format('MMMM, DD')) {
          localDate = moment.utc(worker_request.request_date).local().format('MMMM, DD');
          flag = true;
        } else {
          flag = false;
        }

        const color = worker_request.request_status.toLowerCase();
        let taskTitles = [];
        let entitiesNames = [];
        let extraTitlesToShow = [];
        let extraEntitiesToShow = [];
        let renderTitles = null;
        let renderNames = null;
        if (worker_request.tasks_data && worker_request.tasks_data.length > 0) {
          worker_request.tasks_data.map((task) => {
            const start_time = moment.utc(task.start_datetime).local().format('hh:mm A');
            const end_time = moment.utc(task.start_datetime).add('minutes', task.duration).local().format('hh:mm A');
            const time = '('+ start_time +' - '+ end_time +')';
            const title = task.title;
            if (title) {
              taskTitles.push({title: title, time: time});
            }
          });
          if (taskTitles && taskTitles.length > 2) {
            extraTitlesToShow = taskTitles.slice(2, taskTitles.length);
            taskTitles = taskTitles.slice(0, 2);
            if (extraTitlesToShow && extraTitlesToShow.length > 0) {
              renderTitles = <Popover className={styles.popover}>{extraTitlesToShow.map((taskTitle, i) => {
                return (<div key={i}>{taskTitle.title +' '+ taskTitle.time + (i !== extraTitlesToShow.length - 1 ? ', ' : '')}</div>);
              })}</Popover>;
            }
          }
        }
        if (worker_request.entities_data && worker_request.entities_data.length > 0) {
          worker_request.entities_data.map((entity) => {
            entitiesNames.push({
              name: entity.name,
              image: entity.image_path ? entity.image_path : '/images/user-default.svg',
              id: entity.id,
            });
          });
          if (entitiesNames && entitiesNames.length > 2) {
            extraEntitiesToShow = entitiesNames.slice(2, entitiesNames.length);
            entitiesNames = entitiesNames.slice(0, 2);
            if (extraEntitiesToShow && extraEntitiesToShow.length > 0) {
              renderNames = <Popover className={styles.popover}>{extraEntitiesToShow.map((entity, i) => {
                return (<div key={i}>{entity.name + (i !== extraEntitiesToShow.length - 1 ? ', ' : '')}</div>);
              })}</Popover>;
            }
          }
        }

        return (
          <div>
            {flag && <div className={cx(styles['date'])}><time>{moment.utc(worker_request.request_date).local().format('MMMM D')}</time></div>}
            <div className={cx(styles.workerRow, styles.request)} key={key}>
              <div className={cx(styles.column, styles.status)}><i
                className={cx(styles.statusColor, styles[color])}/>{worker_request.request_status.toLowerCase().replace('_', ' ')}
              </div>
              <div className={cx(styles.column, styles.title)}>
                <OverlayTrigger placement="bottom" overlay={<Tooltip id={'title'+key}>{worker_request.title}</Tooltip>}>
                  <strong onClick={(e) => this.openDetails(e, worker_request)}>{worker_request.title && worker_request.title.trunc(60).trim()}</strong>
                </OverlayTrigger>
              </div>
              {taskTitles && taskTitles.length > 0 ? <div className={cx(styles.column, styles.tasks)}>
                <ul>
                  {taskTitles.map((taskTitle, key) => {
                    return <li key={key}>
                      <OverlayTrigger placement="bottom" overlay={<Tooltip id={'taskTitle'+key}>{taskTitle.title && taskTitle.title +' '+ taskTitle.time}</Tooltip>}>
                        <span>{taskTitle.title && taskTitle.title.trunc(45).trim() +' '+ taskTitle.time}</span>
                      </OverlayTrigger>
                      </li>;
                  })}
                  {extraTitlesToShow && extraTitlesToShow.length > 0 &&
                    <li className={styles.moreLink}>
                      <OverlayTrigger trigger={'click'} rootClose={true} placement="bottom" overlay={renderTitles}><span>See more</span></OverlayTrigger>
                    </li>
                  }
                </ul>
              </div> : <div className={cx(styles.column, styles.tasks)}/>}
              <div className={cx(styles.column, styles.description)}>
                <OverlayTrigger placement="bottom" overlay={<Popover className={styles.popover} id={'description'+key}>{worker_request.description}</Popover>}>
                  <span>{worker_request.description && worker_request.description.trunc(100).trim()}</span>
                </OverlayTrigger>
              </div>
              <div className={cx(styles.column, styles.time)}>{(worker_request.start_datetime && worker_request.end_datetime) && `${moment.utc(worker_request.start_datetime).local().format('hh:mm A')} - ${moment.utc(worker_request.end_datetime).local().format('hh:mm A')}`}</div>
              <div className={cx(styles.column, styles.staff)}>
                <strong>{worker_request.number_of_workers_required ? worker_request.number_of_workers_required + (worker_request.number_of_workers_required > 1 ? ' Workers' : ' Worker') : ''}</strong>
              </div>
              {entitiesNames && entitiesNames.length > 0 ? <div className={cx(styles.column, styles.filled_by)}>
                <ul className={styles.entityList}>
                  {entitiesNames.map((entity, key) => {
                    let borderColor = '#348AF7';
                    let toolTipMessage = 'Pending Response';
                    const entityConfirmation = worker_request.entity_confirmation_statuses;
                    if (entityConfirmation && entityConfirmation.hasOwnProperty(entity.id) && entityConfirmation[entity.id].status === 'ACCEPTED' && entityConfirmation[entity.id].response === 'ACCEPTED' ) {
                      borderColor = '#24ab95';
                      toolTipMessage = 'Accepted';
                    } else if (entityConfirmation && entityConfirmation.hasOwnProperty(entity.id) && entityConfirmation[entity.id].status === 'ACCEPTED' && entityConfirmation[entity.id].response === 'DECLINED') {
                      borderColor = '#FF4E4C';
                      toolTipMessage = 'Rejected';
                    }

                    return <li className={styles.entity} key={key}>
                      <div className={cx(styles.entityImage)}>
                        <img src={entity.image} alt={entity.name} style={{ borderColor: borderColor }}/>
                      </div>
                      <div className={styles.entityName}>
                      <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={'name'+key}>{entity.name} <br/> {toolTipMessage}</Tooltip>}>
                        <span>{entity.name}</span>
                      </OverlayTrigger>
                      </div>
                    </li>;
                  })}{
                  extraEntitiesToShow && extraEntitiesToShow.length > 0 &&
                  <li className={cx(styles.moreLink, styles.entity)}>
                    <div className={cx(styles.entityImage)}>+{extraEntitiesToShow.length}</div>
                    <OverlayTrigger trigger={'click'} rootClose={true} placement="bottom" overlay={renderNames}><span className={styles.more}>See more</span></OverlayTrigger>
                  </li>
                }
                </ul>
              </div> : <div className={cx(styles.column, styles.filled_by)}>No Workers</div>}
              <div className={cx(styles.column, styles.actions)}>
                <button onClick={(e) => this.openDetails(e, worker_request)}
                        className={cx(styles.btn, styles['btn-outline'], styles['btn-outline-primary'])}>{disableStatuses.indexOf(worker_request.request_status) >= 0 ? 'Edit' : 'View'}</button>
                {(disableStatuses.indexOf(worker_request.request_status) >= 0 ? true : false) && <button className={cx(styles.btn, styles['btn-outline'], styles['btn-outline-danger'])} disabled={disableStatuses.indexOf(worker_request.request_status) >= 0 ? false : true} onClick={() => this.showDeleteRequestModal(worker_request.id)}>Delete</button>}
              </div>
            </div>
          </div>
        );
      });
    } else {
      if(!this.props.loadingWorkerRequest) {
        return (
          <div>
            <div className={cx(styles.box, styles.boxWorkerRequest)}>
              <div className={cx(styles.boxBody)}>
                <div className={cx(styles.boxBodyInner)}>
                  <p><strong className={cx(styles.errorTitle)}>No Worker Request found!</strong></p>
                  <p>If you use part-time workers for some of your jobs, the <strong>Worker Request</strong> feature
                    lets you send automated email/SMS communications to a pool of workers for your tasks needing
                    manpower.</p>
                  <p><strong>Worker Requests</strong> automatically fills the specified jobs and responds to the
                    applicants. Click the <strong>New Requests</strong> button to create your first request, or read
                    more about it <a href="https://help.arrivy.com/requests/" target="_blank">here</a>.</p>
                </div>
              </div>
            </div>
            <button className={cx(styles.btn, styles['btn-secondary'])} disabled={this.props.loadingWorkerRequest}
                    onClick={() => this.props.toggleRequestModal()}>New Request
            </button>
          </div>
        );
      }
    }
    return renderedContent;
  }

  handleDateChange(value) {
    let worker_request_object = $.extend(true, [], this.state.worker_request_object);
    const newDate = new moment();
    let date =  moment(newDate).local().format();
    let title_month = moment(newDate).format('MMM');
    let title_date = moment(newDate).format('DD');
    if (value) {
      date = moment(value).local().format();
      title_month = moment(value).format('MMM');
      title_date = moment(value).format('DD');
    }
    const title = title_month + ' ' + title_date + ' - ' + 'New Request';
    worker_request_object['title'] = title;
    worker_request_object['request_date'] = date;
    this.setState({
      worker_request_object
    });
  }

  saveRequest() {
    this.setState({
      savingRequest: true,
    });

    let notification = null;
    let worker_request_object = $.extend(true, {}, this.state.worker_request_object);
    worker_request_object['request_date'] = moment(worker_request_object['request_date']).local().format();

    this.props.postWorkerRequest(worker_request_object).then((res) => {
      const id = JSON.parse(res).id;
      notification = {
        text: 'Worker request added',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.props.createToastNotification(notification);
      this.props.getWorkerRequest(id).then((response) => {
        const selected_worker_request_object = $.extend(true , {}, JSON.parse(response));

        this.setState({
        selected_worker_request_object,
        savingRequest: false,
      }, () => {
        this.props.toggleRequestModal();
        this.props.openRequestDetails();
        this.getInitialValues();
      });
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

  sendRequestNow(e, data) {
    e.preventDefault();
    e.stopPropagation();
    if (data.start_datetime) {
      data['time_span_start_datetime'] = data.start_datetime;
    }
    if (data.end_datetime) {
      data['time_span_end_datetime'] = data.end_datetime;
    }
    if (Object.keys(data).length === 0) {
      data['id'] = this.state.selected_worker_request_object.id
    }
    this.setState({
      savingRequest: true,
    });
    let notification = null;
    this.props.sendWorkerRequest(data).then((res) => {
      notification = {
        text: 'Request sent to the workers',
        options: {
          type: toast.TYPE.SUCCESS,
          position: toast.POSITION.BOTTOM_LEFT,
          className: styles.toastSuccessAlert,
          autoClose: 8000
        }
      };
      this.props.createToastNotification(notification);
      this.setState({
        savingRequest: false,
      });
      if (this.refs && this.refs['workerRequest'].state.tabSelected === 4) {
        this.props.closeRequestDetails();
      }
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

  openRequestModal() {
    const closeIcon =  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <g transform="translate(-5734 -5635)">
        <g transform="translate(5734 5635)" fill="none" stroke="#c4cbd1" strokeWidth="1" className={cx(styles.circle)}>
          <circle cx="12" cy="12" r="12" stroke="none"/>
          <circle cx="12" cy="12" r="11.5" fill="none"/>
        </g>
        <path className={cx(styles.cross)} d="M-2850.176,77.812l-2.171-2.171-2.171,2.171a.7.7,0,0,1-.987,0,.7.7,0,0,1,0-.987l2.171-2.171-2.172-2.172a.7.7,0,0,1,0-.987.7.7,0,0,1,.988,0l2.172,2.172,2.172-2.172a.7.7,0,0,1,.987,0,.7.7,0,0,1,0,.987l-2.172,2.172,2.172,2.172a.7.7,0,0,1,0,.987.7.7,0,0,1-.494.2A.7.7,0,0,1-2850.176,77.812Z" transform="translate(8598.711 5572.71)" fill="#c4cbd1"/>
      </g>
    </svg>;
    return (
      <Modal show={this.props.showRequestModal} className={cx(styles.modalRequest, styles.modalRequestSmall)}>
        <Modal.Header className={cx(styles.modalHeader)}>
          <Modal.Title className={cx(styles.modalTitle)}>New Request</Modal.Title>
          <i className={cx(styles.close)} onClick={() => this.props.toggleRequestModal()}>{closeIcon}</i>
        </Modal.Header>
        <Modal.Body>
          <div className={cx(styles.box)}>
            <div className={cx(styles.boxBody)}>
              <div className={cx(styles.boxBodyInner)}>
                <div className={styles['field-wrapper']}>
                  <FormGroup className={cx(styles.fieldGroup)}>
                    <ControlLabel>Date workers are needed</ControlLabel>
                    <div className={cx(styles.inner, styles.datePicker)}>
                      <FormControl
                        componentClass={DatePicker}
                        minDate={moment().format()}
                        showClearButton={false} name="start-date" ref="date"
                        onChange={this.handleDateChange}
                        value={this.state.worker_request_object.request_date}
                      />
                      <FontAwesomeIcon icon={faCalendar} className={styles['fa-icon']}/>
                    </div>
                  </FormGroup>
                </div>
                <FieldGroup
                  label="Name of request"
                  name="worker-request-title" placeholder="Worker Request Title" ref="title"
                  value={this.state.worker_request_object.title}
                  onChange={(e) => this.handleChange(e, 'title')}
                />
                <FieldGroup
                  label="Description"
                  componentClass="textarea" name="descriptions" placeholder="Comments..."
                  className={cx(styles.commentBox, styles['form-control'])}
                  onChange={(e) => this.handleChange(e, 'description')}
                  value={this.state.worker_request_object.description}
                />
              </div>
            </div>
          </div>
          <div className="text-right">
            <button onClick={() => this.props.toggleRequestModal()} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
            <button onClick={(e) => this.saveRequest(e)} disabled={this.state.savingRequest} className={cx(styles.btn, styles['btn-secondary'])}>
              {this.state.savingRequest ? <SavingSpinner className={styles.whiteLoader} size={8} borderStyle="none"/> : 'Create'}
            </button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    const closeIcon =  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
      <g transform="translate(-5734 -5635)">
        <g transform="translate(5734 5635)" fill="none" stroke="#c4cbd1" strokeWidth="1" className={cx(styles.circle)}>
          <circle cx="12" cy="12" r="12" stroke="none"/>
          <circle cx="12" cy="12" r="11.5" fill="none"/>
        </g>
        <path className={cx(styles.cross)} d="M-2850.176,77.812l-2.171-2.171-2.171,2.171a.7.7,0,0,1-.987,0,.7.7,0,0,1,0-.987l2.171-2.171-2.172-2.172a.7.7,0,0,1,0-.987.7.7,0,0,1,.988,0l2.172,2.172,2.172-2.172a.7.7,0,0,1,.987,0,.7.7,0,0,1,0,.987l-2.172,2.172,2.172,2.172a.7.7,0,0,1,0,.987.7.7,0,0,1-.494.2A.7.7,0,0,1-2850.176,77.812Z" transform="translate(8598.711 5572.71)" fill="#c4cbd1"/>
      </g>
    </svg>;
    return (
      <div className={cx(styles.workerRequestContainer)}>
         <div>
           {this.openRequestModal()}
          <div className={styles.workerRequestWrapper}>
            {this.props.getAllWorkerRequests && this.props.getAllWorkerRequests.length > 0 &&
            <div className={cx(styles.workerRow, styles.header)}>
              <div className={cx(styles.column, styles.status)}><img src="/images/worker-request/circle.svg" alt="Icon" className={styles.icon} />Status</div>
              <div className={cx(styles.column, styles.title)}><img src="/images/worker-request/title.svg" alt="Icon" className={styles.icon} />Title</div>
              <div className={cx(styles.column, styles.tasks)}><img src="/images/worker-request/label.svg" alt="Icon" className={styles.icon} />Tasks</div>
              <div className={cx(styles.column, styles.description)}><img src="/images/worker-request/title.svg" alt="Icon" className={styles.icon} />Description</div>
              <div className={cx(styles.column, styles.time)}><img src="/images/worker-request/time.svg" alt="Icon" className={styles.icon} />Time</div>
              <div className={cx(styles.column, styles.staff)}><img src="/images/worker-request/user.svg" alt="Icon" className={styles.icon} />Staff</div>
              <div className={cx(styles.column, styles.filled_by)}><img src="/images/worker-request/Senttoicon.svg" alt="Icon" className={styles.icon} />Sent to/Filled by</div>
              {/*<div className={cx(styles.column, styles.actions)}><img src="/images/worker-request/eye.svg" alt="Icon" /></div>*/}
            </div>}
            <div className={styles.workerRequestInner}>
              <div className={styles.workerRequestLoader}>
                {(this.props.showSpinner || this.state.loading) && <SavingSpinner borderStyle="none" size={8} /> }
              </div>
              {this.renderWorkerRequest()}
            </div>
          </div>
        </div>

        {this.props.showWorkerRequestDetails &&
        <WorkerRequestDetails
          selected_worker_request_object={this.state.selected_worker_request_object}
          entities={this.props.entities}
          updateWorkerRequest={this.props.updateWorkerRequest}
          savingRequest={this.state.savingRequest}
          openRequestDetails={this.props.openRequestDetails}
          updateWorkerRequestList={this.props.updateWorkerRequestList}
          selectedEntitiesFilter={this.props.selectedEntitiesFilter}
          selectedGroupsFilter={this.props.selectedGroupsFilter}
          selectedEntityRoleFilter={this.props.selectedEntityRoleFilter}
          sendRequestNow={this.sendRequestNow}
          profile={this.props.profile}
          getTasks={this.props.getTasks}
          getAjaxCall={this.props.getAjaxCall}
          getUnscheduledAjaxCall={this.props.getUnscheduledAjaxCall}
          getEntities={this.props.getEntities}
          disableStatuses={disableStatuses}
          showWorkerRequestDetails={this.props.showWorkerRequestDetails}
          createToastNotification={this.props.createToastNotification}
          groups={this.props.groups}
          showSaveChangesModal={this.props.showSaveChangesModal}
          toggleUnsavedData={this.props.toggleUnsavedData}
          closeRequestDetails={this.props.closeRequestDetails}
          getWorkerRequestData={this.getWorkerRequestData}
          ref="workerRequest"
        />}
        <Modal show={this.state.showDeleteModal} className={cx(styles.modalRequest, styles.modalRequestSmall)}>
          <Modal.Header className={styles.modalHeader}>
            <Modal.Title className={styles.modalTitle}>Delete Request</Modal.Title>
            <i className={styles.close} onClick={this.hideDeleteRequestModal}>{closeIcon}</i>
          </Modal.Header>
          <Modal.Body>
            <div className={styles.box}>
              <div className={styles.boxBody}>
                <div className={cx(styles.boxBodyInner, ['text-center'])}>
                  <p>Are you sure you want to delete this request?</p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <button onClick={this.hideDeleteRequestModal} className={cx(styles.btn, styles['btn-light'])}>Cancel</button>
              <button onClick={(e) => this.handleDelete(e, this.state.worker_request_id)} disabled={this.state.savingRequest} className={cx(styles.btn, styles['btn-secondary'])}>
                {this.state.savingRequest ? <SavingSpinner className={styles.whiteLoader} size={8} borderStyle="none"/> : 'Yes'}
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
};

WorkerRequest.propTypes = {
  updateWorkerRequest: PropTypes.func.isRequired,
};
