import React, {Component} from 'react';
import cx from "classnames";
import moment from "moment";
import {FormGroup, Checkbox, Tooltip, OverlayTrigger, Popover} from 'react-bootstrap';
import styles from "./worker-request-details-tabs.module.scss";
import SavingSpinner from "../../../../saving-spinner/saving-spinner";
import TimePickerV4 from "../../../../timepicker/timepickerv4";
import WorkerRequestPicker from './worker-request-picker/worker-request-picker';

export default class WorkerRequestTasks extends Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedTasksIds: [],
      worker_request_object: {},
      workersRequiredString: '1 person',
      workersRequired: 1,
      maxWorkers: 0,
      end_time_span: '5:00 PM',
      start_time_span: '9:00 AM',
      request_date: '',
      start_date: '',
      end_date: '',

    };

    this.renderTasks = this.renderTasks.bind(this);
    this.getEntities = this.getEntities.bind(this);
    this.saveWorkerRequest = this.saveWorkerRequest.bind(this);
    this.handleSelectionChange = this.handleSelectionChange.bind(this);
    this.getAdditionalAddresses = this.getAdditionalAddresses.bind(this);
    this.isMultipleAddressAvailable = this.isMultipleAddressAvailable.bind(this);
    this.renderUnscheduledTasks = this.renderUnscheduledTasks.bind(this);
    this.handleStartTimeChange = this.handleStartTimeChange.bind(this);
    this.handleEndTimeChange = this.handleEndTimeChange.bind(this);
    this.requiredWorkerUpdate = this.requiredWorkerUpdate.bind(this);
    this.compare = this.compare.bind(this);
  }

  componentDidUpdate(prevProps, prevState, snapshot) {

    if (!_.isEqual(this.props.worker_request_object, prevProps.worker_request_object)) {

      let worker_request_object = this.props.worker_request_object;
      let selectedTasksIds = worker_request_object && worker_request_object.task_ids;
      let maxWorkers = 0;

      let workersRequiredString = '1 person';
      let start_time_span = '09:00 AM';
      let end_time_span = '05:00 PM';
      let start_date = worker_request_object.request_date;
      let end_date = worker_request_object.request_date;
      let request_date = worker_request_object.request_date;
      if (worker_request_object.start_datetime && worker_request_object.end_datetime) {
        start_time_span = moment.utc(worker_request_object.start_datetime).local().format('hh:mm A');
        end_time_span = moment.utc(worker_request_object.end_datetime).local().format('hh:mm A');
        end_date = moment.utc(worker_request_object.end_datetime).local().format('YYYY-MM-DD');
        start_date = moment.utc(worker_request_object.start_datetime).local().format('YYYY-MM-DD');
      }

      let workersRequired = worker_request_object && worker_request_object.number_of_workers_required;

      //To get Max workers depending the workers request on the task form
      if (selectedTasksIds && selectedTasksIds.length > 0) {
        const reducer = (accumulator, currentValue) => accumulator > currentValue.number_of_workers_required ? accumulator : currentValue.number_of_workers_required;
        maxWorkers = this.props.worker_request_object.tasks_data.reduce(reducer, this.state.maxWorkersInTasks);
        workersRequiredString = workersRequired + (workersRequired > 1 ? ' persons' : workersRequired === 1 ? ' person' : '');

       /* let selectedTasks = this.props.tasksList && this.props.tasksList.filter((filtered_task) => {
          if (selectedTasksIds.indexOf(filtered_task.id) >= 0) {
            return filtered_task;
          }
        });
        if (selectedTasks && selectedTasks.length > 0) {
          selectedTasks.sort(this.compare);
          start_time_span = moment.utc(selectedTasks[0].start_datetime).local().format('hh:mm A');
          start_date = moment.utc(selectedTasks[0].start_datetime).local().format('YYYY-MM-DD');
          end_time_span = moment.utc(selectedTasks[0].start_datetime).add(selectedTasks[0].duration, 'minutes');

          for (let i = 0; i < selectedTasks.length; i++) {
            let new_end_time_span = moment.utc(selectedTasks[i].start_datetime);
            new_end_time_span = new_end_time_span.add(selectedTasks[i].duration, 'minutes');
            if (new_end_time_span && new_end_time_span > end_time_span) {
              end_time_span = new_end_time_span;
            }
          }

          end_date = moment(end_time_span).local().format('YYYY-MM-DD');
          end_time_span = moment(end_time_span).local().format('hh:mm A');

        }*/
      }
      this.setState({
        worker_request_object,
        selectedTasksIds,
        workersRequired,
        workersRequiredString,
        maxWorkers,
        start_time_span,
        end_time_span,
        request_date,
        start_date,
        end_date
      });
    }


    if (!_.isEqual(this.props.tasksList, prevProps.tasksList) && !_.isEqual(this.props.worker_request_object, prevProps.worker_request_object)) {

      let selectedTasksIds = this.props.worker_request_object && this.props.worker_request_object.task_ids;
      let selectedTasks = this.props.tasksList && this.props.tasksList.filter((filtered_task) => {
      if (selectedTasksIds.indexOf(filtered_task.id) >= 0) {
        return filtered_task;
      }
    });

      let start_time_span = this.state.start_time_span;
      let end_time_span = this.state.end_time_span;
      let start_date = this.state.start_date;
      let end_date = this.state.end_date;
      let maxWorkers = 0;
      let workersRequiredString = '1 person';
      let workersRequired = this.props.worker_request_object && this.props.worker_request_object.number_of_workers_required;
      if (selectedTasks && selectedTasks.length > 0) {
        selectedTasks.sort(this.compare);
        start_time_span = moment.utc(selectedTasks[0].start_datetime).local().format('hh:mm A');
        start_date = moment.utc(selectedTasks[0].start_datetime).local().format('YYYY-MM-DD');
        end_time_span = moment.utc(selectedTasks[0].start_datetime).add(selectedTasks[0].duration, 'minutes');
        for (let i = 0; i < selectedTasks.length; i++) {
          let new_end_time_span = moment.utc(selectedTasks[i].start_datetime);
          new_end_time_span = new_end_time_span.add(selectedTasks[i].duration, 'minutes');
          if (new_end_time_span && new_end_time_span > end_time_span) {
            end_time_span = new_end_time_span;
          }
          maxWorkers = maxWorkers > selectedTasks[i].number_of_workers_required ? maxWorkers : selectedTasks[i].number_of_workers_required;
        }
        end_date = moment(end_time_span).local().format('YYYY-MM-DD');
        end_time_span = moment(end_time_span).local().format('hh:mm A');

      if (maxWorkers > 0) {
        workersRequired = maxWorkers;
      }
      workersRequiredString = workersRequired + (workersRequired > 1 ? ' persons' : workersRequired === 1 ? ' person' : '');
    }

      this.setState({
        end_time_span,
        workersRequiredString,
        end_date,
        maxWorkers,
        workersRequired,
        start_date,
        start_time_span
      })
    }
  }

  componentDidMount() {
    if (this.props.worker_request_object) {
      let worker_request_object = this.props.worker_request_object;
      let selectedTasksIds = worker_request_object && worker_request_object.task_ids;
      let start_time_span = '09:00 AM';
      let end_time_span = '05:00 PM';
      let start_date = worker_request_object.request_date;
      let end_date = worker_request_object.request_date;
      let request_date = worker_request_object.request_date;
      if (worker_request_object.start_datetime && worker_request_object.end_datetime) {
        start_time_span = moment.utc(worker_request_object.start_datetime).local().format('hh:mm A');
        end_time_span = moment.utc(worker_request_object.end_datetime).local().format('hh:mm A');
        end_date = moment.utc(worker_request_object.end_datetime).local().format('YYYY-MM-DD');
        start_date = moment.utc(worker_request_object.start_datetime).local().format('YYYY-MM-DD');
      }

      let maxWorkers = 0;
      let workersRequiredString = '1 person';


      let workersRequired = worker_request_object && worker_request_object.number_of_workers_required;

      //To get Max workers depending the workers request on the task form
      if (selectedTasksIds && selectedTasksIds.length > 0) {
        const reducer = (accumulator, currentValue) => accumulator > currentValue.number_of_workers_required ? accumulator : currentValue.number_of_workers_required;
        maxWorkers = this.props.worker_request_object.tasks_data.reduce(reducer, this.state.maxWorkersInTasks);
        workersRequiredString = workersRequired + (workersRequired > 1 ? ' persons' : workersRequired === 1 ? ' person' : '');

      }
      this.setState({
        worker_request_object,
        selectedTasksIds,
        workersRequired,
        workersRequiredString,
        maxWorkers,
        start_time_span,
        end_time_span,
        request_date,
        start_date,
        end_date
      });
    }
  }

  saveWorkerRequest(e) {
    e.preventDefault();
    e.stopPropagation();

    let selectedTasksIds = this.state.selectedTasksIds;

    let start_datetime_span = moment(this.state.start_date).format('YYYY-MM-DD') + ' ' + this.state.start_time_span;
    start_datetime_span = moment(start_datetime_span, 'YYYY-MM-DD hh:mm a');

    let end_datetime_span = moment(this.state.end_date).format('YYYY-MM-DD') + ' ' + this.state.end_time_span;
    end_datetime_span = moment(end_datetime_span, 'YYYY-MM-DD hh:mm a');

    const id = this.props.worker_request_object.id;

    this.props.handleUpdateWorkerRequest({
      id,
      task_ids: selectedTasksIds,
      number_of_workers_required: this.state.workersRequired,
      start_datetime: moment(start_datetime_span).format(),
      end_datetime: moment(end_datetime_span).format()
    });

  }

  handleStartTimeChange(value, add_minutes = false) {
    let start_date = this.state.start_date;
    if (add_minutes) {
      let start_datetime_span = moment(this.state.start_date).format('YYYY-MM-DD') + ' ' + this.state.start_time_span;
      start_datetime_span = moment(start_datetime_span, 'YYYY-MM-DD hh:mm a');
      start_datetime_span = moment(start_datetime_span).subtract(value, 'minutes');
      value = moment(start_datetime_span).local().format('hh:mm A');
      start_date = moment(start_datetime_span).local().format('YYYY-MM-DD');
    }
    this.setState({
      start_time_span: value,
      start_date,
    }, () => this.props.handleWorkerRequestData(value, this.state.end_time_span, this.state.workersRequired));
  }

  handleEndTimeChange(value, add_minutes = false) {
    let end_date = this.state.end_date;
    if (add_minutes) {
      let end_datetime_span = moment(this.state.end_date).format('YYYY-MM-DD') + ' ' + this.state.end_time_span;
      end_datetime_span = moment(end_datetime_span, 'YYYY-MM-DD hh:mm a');
      end_datetime_span = moment(end_datetime_span).add(value, 'minutes');
      value = moment(end_datetime_span).local().format('hh:mm A');
      end_date = moment(end_datetime_span).local().format('YYYY-MM-DD');

    }

    this.setState({
      end_time_span: value,
      end_date,
    }, () => this.props.handleWorkerRequestData(this.state.start_time_span, value, this.state.workersRequired));
  }

  // getEntities(entities) {
  //   if (entities.length > 0) {
  //     let assignees = [];
  //     let IDs = [];
  //     entities.map(id => {
  //       this.props.entities.map(entity => {
  //         if (id === entity.id) {
  //           assignees.push(entity.name);
  //           assignees.push(<br/>);
  //         }
  //         IDs.push(entity.id);
  //       });
  //       if (IDs.indexOf(id) < 0) {
  //         assignees.push("Unknown");
  //         assignees.push(<br/>);
  //       }
  //     });
  //     return assignees;
  //   } else {
  //     return (
  //       <span>Unassigned</span>
  //     );
  //   }
  // }

  getEntities(entities, print_view) {
    if (entities && entities.length > 0) {
      let assignees = [];
      let extraEntitiesToShow;
      if (!print_view) {
        const entitiesToShow = 2;
        const extraEntities = entities.slice(entitiesToShow, entities.length);
        entities = entities.slice(0, entitiesToShow);
        const extraEntitiesToolTip = (<Tooltip>{extraEntities.map((entity, key) => {
          return (<div key={key}>{entity.name}</div>);
        })}
        </Tooltip>);

        extraEntitiesToShow = extraEntities && extraEntities.length > 0 && (
          <div className={cx(styles.entity)}>
            <div className={cx(styles.entityImage)}>+{extraEntities.length}</div>
            <div className={cx(styles.entityName)}>
              <OverlayTrigger placement={"bottom"} overlay={extraEntitiesToolTip}><span
                className={styles.more}>{extraEntities.length} more</span></OverlayTrigger>
            </div>
          </div>
        );
      }
      entities.map((entity, key) => {
        let assignee = (
          <div key={key} className={cx(styles.entity)}>
            <div className={cx(styles.entityImage)}>
              <img src={entity.image_path ? entity.image_path : '/images/user-default.svg'} alt={entity.name}
                   style={{borderColor: (entity.color ? entity.color : '#348AF7')}}/>
            </div>
            <div className={cx(styles.entityName)}>
              <OverlayTrigger placement={"bottom"} overlay={<Tooltip id={key}>{entity.name}</Tooltip>}>
                <span>{entity.name}</span>
              </OverlayTrigger>
            </div>
          </div>);

        assignees.push(assignee);

        // if (IDs.indexOf(id) < 0) {
        //   assignees.push(<div className={cx(styles.entity)}>
        //     <div className={cx(styles.entityImage)}>
        //       <img src={'/images/info.svg'} alt={'Unknown'} style={{borderColor: '#348AF7'}}/>
        //     </div>
        //     <div className={cx(styles.entityName)}>
        //       <span>Unknown</span>
        //     </div>
        //   </div>);
        // }
      });
      !print_view && assignees.push(extraEntitiesToShow);
      return assignees;
    } else {
      return (
        <span>Unassigned</span>
      );
    }
  }

  compare(t1, t2) {
    t1 = t1.start_datetime;
    t2 = t2.start_datetime;

    let result = 0;
    if (t1 > t2) {
      result = 1;
    } else {
      result = -1;
    }

    return result;
  }

  handleSelectionChange(e, task) {
    let selectedTasksIds = this.state.selectedTasksIds;
    if (e.target.checked) {
      if (selectedTasksIds && !selectedTasksIds.find((taskId) => {
        return taskId === task.id;
      })) {
        selectedTasksIds.push(task.id);
      } else {
        return false;
      }
    } else {
      const taskIdIndex = selectedTasksIds && selectedTasksIds.findIndex((taskId) => {
        return task.id === taskId;
      });
      if (taskIdIndex >= 0) {
        selectedTasksIds.splice(taskIdIndex, 1);
      }
    }

    let scheduleSelectedTasks = this.props.tasksList && this.props.tasksList.filter((filtered_task) => {
      if (selectedTasksIds.indexOf(filtered_task.id) >= 0) {
        return filtered_task;
      }
    });

    let unscheduleSelectedTasks = this.props.unscheduleTasksList && this.props.unscheduleTasksList.filter((filtered_task) => {
      if (selectedTasksIds.indexOf(filtered_task.id) >= 0) {
        return filtered_task;
      }
    });

    const selectedTasks = [...scheduleSelectedTasks];

    let maxWorkers = 0;
    let workersRequiredString = '1 person';
    let workersRequired = 1;

    let start_time_span = this.state.start_time_span;
    let end_time_span = this.state.end_time_span;
    let start_date = this.state.start_date;
    let end_date = this.state.end_date;
    if (selectedTasks && selectedTasks.length > 0) {
      selectedTasks.sort(this.compare);
      start_time_span = moment.utc(selectedTasks[0].start_datetime).local().format('hh:mm A');
      start_date = moment.utc(selectedTasks[0].start_datetime).local().format('YYYY-MM-DD');
      end_time_span = moment.utc(selectedTasks[0].start_datetime).add(selectedTasks[0].duration, 'minutes');
      for (let i = 0; i < selectedTasks.length; i++) {
        let new_end_time_span = moment.utc(selectedTasks[i].start_datetime);
        new_end_time_span = new_end_time_span.add(selectedTasks[i].duration, 'minutes');
        if (new_end_time_span && new_end_time_span > end_time_span) {
          end_time_span = new_end_time_span;
        }
        maxWorkers = maxWorkers > selectedTasks[i].number_of_workers_required ? maxWorkers : selectedTasks[i].number_of_workers_required;
      }

      end_date = moment(end_time_span).local().format('YYYY-MM-DD');
      end_time_span = moment(end_time_span).local().format('hh:mm A');

      if (maxWorkers > 0) {
        workersRequired = maxWorkers;
      }
      workersRequiredString = workersRequired + (workersRequired > 1 ? ' persons' : workersRequired === 1 ? ' person' : '');
    }else {
      start_time_span = '09:00 AM';
      end_time_span = '05:00 PM';
      start_date = this.state.start_date;
      end_date = this.state.end_date;
    }
    this.setState({
      selectedTasksIds,
      maxWorkers,
      start_time_span,
      end_time_span,
      workersRequiredString,
      workersRequired,
      end_date,
      start_date
    }, () => this.props.handleWorkerRequestData(start_time_span, end_time_span, workersRequired));
  }

  isMultipleAddressAvailable(primaryAddress, addresses) {
    let multipleAddressAvailable = 0;
    if (primaryAddress && primaryAddress.trim().length > 0) {
      multipleAddressAvailable += 1;
    }
    if (addresses && addresses.length > 0) {
      addresses.map(address => {
        if (address.complete_address && address.complete_address.trim().length > 0) {
          multipleAddressAvailable += 1;
        }
      });
    }
    if (multipleAddressAvailable > 1) {
      return true;
    }
    return false;
  }

  getAdditionalAddresses(task) {
    let count = 1;
    let addresses_list = [];
    const isMultipleAddresses = this.isMultipleAddressAvailable(task.customer_address, task.additional_addresses);
    if (isMultipleAddresses) {
      addresses_list.push(count + '- ');
      count++;
    }
    if ((task.customer_address_line_1 && task.customer_address_line_1.trim()) || (task.customer_address_line_2) && task.customer_address_line_2.trim()) {
      addresses_list.push(task.customer_address_line_1 + ' ' + task.customer_address_line_2);
      addresses_list.push(<br/>);
    }
    if ((task.customer_city && task.customer_city.trim()) || (task.customer_state) && task.customer_state.trim() || (task.customer_zipcode && task.customer_zipcode.trim())) {
      addresses_list.push(task.customer_city + ' ' + task.customer_state + ' ' + task.customer_zipcode);
      addresses_list.push(<br/>);
    }
    let addresses = task.additional_addresses;
    if (addresses && addresses.length > 0) {
      addresses.map((address) => {
        if (address.complete_address && address.complete_address.trim().length > 0) {
          if (isMultipleAddresses) {
            addresses_list.push(count + '- ');
            count++;
          }
          addresses_list.push([address.address_line_1, address.address_line_2].join(" "));
          if ((address.address_line_1 && address.address_line_1.trim()) || (address.address_line_2 && address.address_line_2.trim())) {
            addresses_list.push(<br/>);
          }
          addresses_list.push([address.city, address.state, address.zipcode].join(" "));
          if ((address.city && address.city.trim()) || (address.state && address.state.trim()) || (address.zipcode && address.zipcode.trim())) {
            addresses_list.push(<br/>);
          }
        }
      });
    }
    return addresses_list;
  }

  renderTasks() {
    if (this.props.tasksList && this.props.tasksList.length > 0) {
      return this.props.tasksList.map((task, key) => {
        if (task.template_type === 'TASK') {
          let isChecked = false;
          if (this.state.selectedTasksIds && this.state.selectedTasksIds.find((taskId) => {
            return taskId === task.id;
          })) {
            isChecked = true;
          }
          const backgroundColor = task.extra_fields && task.extra_fields.task_color ? task.extra_fields.task_color : '#0693e3';
          return (
            <div key={key} className={cx(styles.flexRow, styles.item)}>
              <div className={cx(styles.flexColumn, styles.checkMark)}>
                <Checkbox
                  className={cx(styles.checkBoxSquare)} checked={isChecked}
                  disabled={this.props.disableStatuses.indexOf(this.props.worker_request_object.request_status) >= 0 ? false : true}
                  onChange={(e) => this.handleSelectionChange(e, task)}>
                  <span></span>
                </Checkbox>
              </div>
              <div className={cx(styles.flexColumn, styles.date)}>
                <time className={styles.time}>
                  <span>{moment.utc(task.start_datetime).local().format('MMMM DD, YYYY')}</span>
                  <span>{moment.utc(task.start_datetime).local().format('hh:mm A') + ' - ' + moment.utc(task.start_datetime).add(task.duration, 'minutes').local().format('hh:mm A')}</span>
                </time>
              </div>
              <div className={cx(styles.flexColumn, styles.title)}>
                <div className={styles.taskEssentials}>
                  {task && task.template_type === 'TASK' &&
                  <div className={cx(styles.taskColor)} style={{background: backgroundColor}}/>}
                  <div>
                    <div className={cx(styles.taskTitle)}>{task.title}</div>
                    <div className={cx(styles.customerName)}>{task.customer_name}</div>
                  </div>
                </div>
              </div>
              <div className={cx(styles.flexColumn, styles.assignees)}>
                {this.getEntities(task.entities_data, false)}
              </div>
              <div className={cx(styles.flexColumn, styles.address)}>
                {this.getAdditionalAddresses(task)}
              </div>
              <div className={cx(styles.flexColumn, styles.workerNeeded)}>
                {task.number_of_workers_required + (task.number_of_workers_required && task.number_of_workers_required > 1 ? ' people' : ' person')}
              </div>
            </div>
          );
        }
      });
    } else {
      return (
        <div className={styles.noWorkerRequestFound}>No tasks found</div>
      );
    }
  }

  renderUnscheduledTasks() {
    if (this.props.unscheduleTasksList && this.props.unscheduleTasksList.length > 0) {
      return this.props.unscheduleTasksList.map((task, key) => {
        let isChecked = false;
        if (this.state.selectedTasksIds && this.state.selectedTasksIds.find((taskId) => {
          return taskId === task.id;
        })) {
          isChecked = true;
        }
        const backgroundColor = task.extra_fields && task.extra_fields.task_color ? task.extra_fields.task_color : '#0693e3';
        return (
          <div key={key} className={cx(styles.flexRow, styles.item)}>
            <div className={cx(styles.flexColumn, styles.checkMark)}>
              <Checkbox
                className={cx(styles.checkBoxSquare)} checked={isChecked}
                disabled={this.props.disableStatuses.indexOf(this.props.worker_request_object.request_status) >= 0 ? false : true}
                onChange={(e) => this.handleSelectionChange(e, task)}>
                <span></span>
              </Checkbox>
            </div>
            <div className={cx(styles.flexColumn, styles.date)}>
              <time className={styles.time}>
                <span>{moment.utc(task.start_datetime).local().format('MMMM DD, YYYY')}</span>
                <span>{moment.utc(task.start_datetime).local().format('hh:mm A')}</span>
              </time>
            </div>
            <div className={cx(styles.flexColumn, styles.title)}>
              <div className={styles.taskEssentials}>
                {task && task.template_type === 'TASK' &&
                <div className={cx(styles.taskColor)} style={{background: backgroundColor}}/>}
                <div>
                  <div className={cx(styles.taskTitle)}>{task.title}</div>
                  <div className={cx(styles.customerName)}>{task.customer_name}</div>
                </div>
              </div>
            </div>
            <div className={cx(styles.flexColumn, styles.assignees)}>
              {this.props.entities.length > 0 && this.getEntities(task.entity_ids, false)}
            </div>
            <div className={cx(styles.flexColumn, styles.address)}>
              {this.getAdditionalAddresses(task)}
            </div>
            <div className={cx(styles.flexColumn, styles.workerNeeded)}>
              {task.number_of_workers_required + (task.number_of_workers_required && task.number_of_workers_required > 1 ? ' people' : ' person')}
            </div>
          </div>
        );
      });
    }
  }

  requiredWorkerUpdate(value) {
    let workersRequiredString = this.state.workersRequiredString;
    if (value > 1) {
      workersRequiredString = value + ' persons';
    } else if (value === 1) {
      workersRequiredString = value + ' person';
    }
    this.setState({
      workersRequired: value,
      workersRequiredString
    }, () => this.props.handleWorkerRequestData(this.state.start_time_span, this.state.end_time_span, value));
  }


  render() {
    let no_tasks_found = false;

    let arrow = <svg xmlns="http://www.w3.org/2000/svg" width="13.657" height="13.657" viewBox="0 0 13.657 13.657">
      <path
        d="M-90.024,11.657a.908.908,0,0,1-.675-.3.908.908,0,0,1-.3-.675V2.911A.911.911,0,0,1-90.09,2a.911.911,0,0,1,.911.911V9.836h6.925a.911.911,0,0,1,.911.911.911.911,0,0,1-.911.91Z"
        transform="translate(-58.932 -49.276) rotate(-135)" fill="currentColor"/>
    </svg>;
    if (this.props.unscheduleTasksList && this.props.unscheduleTasksList.length === 0 && this.props.tasksList && this.props.tasksList.length === 0) {
      no_tasks_found = true;
    }
    const infoText = 'Choose the Tasks you need helpers for, and Arrivy will automatically calculate the time range required. If you have used "Worker Needed" placeholders within the Task, Arrivy will also calculate the number of helpers needed. Alternatively, simply select the number of workers and time range from the interface.'
    const is_disabled = this.props.worker_request_object && this.props.disableStatuses.indexOf(this.props.worker_request_object.request_status) >= 0 ? false : true;
    return (
      <div className={cx(styles.workerRequestTask)}>
        <div className={cx(styles.box)}>
          <h3 className={cx(styles.boxTitle)}>Request Worker(s)
            for {this.state.selectedTasksIds && this.state.selectedTasksIds.length} task(s) <OverlayTrigger
              placement="bottom" overlay={<Tooltip id={'info'}>{infoText}</Tooltip>}><i
              className={cx(styles.iconHelp)}/></OverlayTrigger></h3>
          <div className={cx(styles.boxBody)}>
            <div className={cx(styles.boxBodyInner)}>
              <div className={cx(styles.requestWrapper)}>
                <FormGroup
                  className={cx(styles['field-wrapper'], styles.personFiled, is_disabled ? styles.disabled : '')}>
                  <label>Request</label>
                  <WorkerRequestPicker
                    disabled={is_disabled}
                    value={this.state.workersRequiredString}
                    updateValue={(value) => {
                      this.requiredWorkerUpdate(value)
                    }}
                    elId={Math.random().toString(36).substr(2, 16)}
                    placeholder="1 person"
                    workerRequestRegex={/^(50|[1-4][0-9]|[1-9]?)\s*(person|persons)*$/i}
                    option='worker request'
                  />
                </FormGroup>
                <FormGroup className={cx(styles['field-wrapper'], styles.timeFiled)}>
                  <label>from</label>
                  <div>
                    <TimePickerV4
                      disabled={is_disabled}
                      value={this.state.start_time_span}
                      updateValue={(value) => {
                        this.handleStartTimeChange(value);
                      }}
                      elId={Math.random().toString(36).substr(2, 16)}
                      placeholder="HH:MM AM"
                    />
                    <button
                      onClick={() => this.handleStartTimeChange(30, true)}
                      disabled={is_disabled}
                      className={cx(styles.btnAddTime)}>- 30 minutes
                    </button>
                  </div>
                </FormGroup>
                <FormGroup className={cx(styles['field-wrapper'], styles.timeFiled)}>
                  <label>to</label>
                  <div>
                    <TimePickerV4
                      disabled={is_disabled}
                      value={this.state.end_time_span}
                      updateValue={(value) => {
                        this.handleEndTimeChange(value);
                      }}
                      elId={Math.random().toString(36).substr(2, 16)}
                      placeholder="HH:MM AM"
                    />
                    <button
                      onClick={() => this.handleEndTimeChange(30, true)}
                      disabled={is_disabled}
                      className={cx(styles.btnAddTime)}>+ 30 minutes
                    </button>
                  </div>
                </FormGroup>
                <label>on {moment.utc(this.props.worker_request_object.request_date).local().format('dddd MMM DD, YYYY')}</label>
                <div className={styles.addMinButtons}/>
              </div>
            </div>
          </div>
        </div>
        {/*{((this.state.maxWorkers < this.state.workersRequired) || (this.state.maxWorkers > this.state.workersRequired)) &&*/}
        {/*<div className={styles.workersErrorText}>*/}
        {/*<p>Arrivy will assign <strong>{this.state.workersRequired} person(s)</strong> to all selected Tasks. If Tasks need different numbers of workers, please create multiple requests.</p>*/}
        {/*</div>}*/}
        {this.props.loadingTaskList ? <SavingSpinner className={styles.whiteLoader} size={8} borderStyle="none"/> :
          <div className={cx(styles.flexTable, styles.tasksTable)}>
            <div className={cx(styles.flexRow, styles.header)}>
              <div className={cx(styles.flexColumn, styles.checkMark)}><img src="/images/worker-request/check-box.svg"
                                                                            alt="Icon"/></div>
              <div className={cx(styles.flexColumn, styles.date)}><img src="/images/worker-request/time.svg"
                                                                       className={styles.icon} alt="Icon"/>Date &Time
              </div>
              <div className={cx(styles.flexColumn, styles.title)}><img src="/images/worker-request/label.svg"
                                                                        className={styles.icon} alt="Icon"/>Task Title &
                Customer
              </div>
              <div className={cx(styles.flexColumn, styles.assignees)}><img src="/images/worker-request/user.svg"
                                                                            className={styles.icon} alt="Icon"/>Assignee(s)
              </div>
              <div className={cx(styles.flexColumn, styles.address)}><img src="/images/worker-request/pin.svg"
                                                                          className={styles.icon} alt="Icon"/>Address(es)
              </div>
              <div className={cx(styles.flexColumn, styles.workerNeeded)}><img src="/images/worker-request/user.svg"
                                                                               className={styles.icon} alt="Icon"/>Worker
                Needed
              </div>
            </div>
            <div className={styles.pagination}>
              <ul>
                <li className={styles.count}> {this.props.loadingTaskList || this.props.tasksList.length < 1 ?
                  <span>{this.props.tasksList.length}</span> :
                  <span>{((this.props.page - 1) * this.props.items_per_page) + 1} - {(this.props.page * this.props.items_per_page) - (this.props.items_per_page - this.props.tasksList.length)}</span>
                }</li>
                <li>
                  <button disabled={this.props.prevDisabled}
                          className={cx(styles.prev, this.props.prevDisabled && 'disabled', this.state.loadingTaskList && styles.pendingAction)}
                          onClick={() => this.props.paginationPrevClicked()}>{arrow}</button>
                </li>
                <li>
                  <button disabled={this.props.nextDisabled}
                          className={cx(this.props.nextDisabled && 'disabled', this.state.loadingTaskList && styles.pendingAction)}
                          onClick={() => this.props.paginationNextClicked()}>{arrow}</button>
                </li>
              </ul>
            </div>
            <div className={styles.inner}>
              {this.renderTasks()}
              {/*{this.renderUnscheduledTasks()}*/}
              {no_tasks_found ? <div className={styles.noWorkerRequestFound}>No Tasks found</div> : ''}
            </div>
          </div>
        }
      </div>
    );
  }
}
