import {Component} from "react";
import styles from "../synchronize-now/synchronize-now.module.scss";
import {Checkbox, DropdownButton, MenuItem, Modal, Tooltip, OverlayTrigger, Table} from "react-bootstrap";
import {supportedIntegrationsList} from "../../../../../../helpers/external-integrations";
import React from "react";
import moment from "moment";
import cx from "classnames";
import {toast, ToastContainer} from 'react-toastify';
import {fetchExternaldData} from "../../../../../../actions";
import {getErrorMessage} from "../../../../../../helpers/task";
import SavingSpinner from "../../../../../saving-spinner/saving-spinner";

export default class SynchronizeNow extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedIntegrationsForSync: [],
      shouldShowSynchronizationDialog: false,
      fetchNowResponsePending: false,
      lastSyncTime: null,
    };

    this.initiateSynchronization = this.initiateSynchronization.bind(this);
    this.renderModal = this.renderModal.bind(this);
    this.showSynchronizationDialog = this.showSynchronizationDialog.bind(this);
    this.showToast = this.showToast.bind(this);
    this.getLastSyncTime = this.getLastSyncTime.bind(this);
    this.updateCheckedIntegrationsList = this.updateCheckedIntegrationsList.bind(this);
    this.getSyncDatesDifference = this.getSyncDatesDifference.bind(this);
    this.getIntegrationLatestBasicInfo = this.getIntegrationLatestBasicInfo.bind(this);
    this.initSync = this.initSync.bind(this);
  }

  componentDidMount() {
    this.setState({
      lastSyncTime: this.getLastSyncTime()
    });
  }

  componentWillReceiveProps(nextProps, nextContext) {
    let checkedIntegrationsForSync = this.state.checkedIntegrationsForSync;
    if (checkedIntegrationsForSync && Array.isArray(checkedIntegrationsForSync) && nextProps.externalIntegrations && Array.isArray(nextProps.externalIntegrations)) {
      nextProps.externalIntegrations.forEach((integration, integrationIndex) => {
        checkedIntegrationsForSync.forEach((checked, index) => {
          if (checked.integration_type === integration.integration_type && checked.integration_id === integration.id) {
            checked['integration_complete_info'] = integration;
          }
        })
      });

    }
    this.setState({
      lastSyncTime: this.getLastSyncTime(),
      checkedIntegrationsForSync,
      syncInitiated: true
    })
  }

  getLastSyncTime() {
    let lastSyncTime = null;
    if (this.props.externalIntegrations && this.props.externalIntegrations.length > 0) {
      //loop through externalIntegrations and see if any integration was triggered and get the latest one
      this.props.externalIntegrations.map((externalIntegration, index) => {
        if (externalIntegration.data_fetch_history && Array.isArray(externalIntegration.data_fetch_history) && externalIntegration.data_fetch_history.length > 0) {
          if (externalIntegration.data_fetch_history[0].data_fetch_datetime) {
            if (!lastSyncTime || lastSyncTime < externalIntegration.data_fetch_history[0].data_fetch_datetime) {
              lastSyncTime = externalIntegration.data_fetch_history[0].data_fetch_datetime;
            }
          }
        }
      });
    }
    if (lastSyncTime) {
      lastSyncTime = this.getLocalDateTIme(lastSyncTime);
    }
    return lastSyncTime;
  }

  initiateSynchronization(e) {
    let hasSelectedIntegrationToSync = false;
    let diff = this.getSyncDatesDifference();
    if (this.props.maxDaysToSync && diff > this.props.maxDaysToSync) {
      this.showToast(toast.TYPE.ERROR, this.props.maxDaysErrorMessage);
      return;
    }
    if (this.state.checkedIntegrationsForSync) {
      this.state.checkedIntegrationsForSync.forEach((checkedInfo, index) => {
        if (checkedInfo.isChecked) {
          hasSelectedIntegrationToSync = true;
        }
      })
    }
    if (!hasSelectedIntegrationToSync) {
      e.preventDefault();
      e.stopPropagation();
      this.showToast(toast.TYPE.ERROR, "Please select at least one Integration to sync");
    } else {
      let checkedIntegrationsForSync = this.state.checkedIntegrationsForSync;
      if (checkedIntegrationsForSync && Array.isArray(checkedIntegrationsForSync))
      this.setState({
        shouldShowSynchronizationDialog: true,
        fetchNowResponsePending: true,
        syncInitiated: false,
        checkedIntegrationsForSync
      });

      let syncIntegrationsList = {};

      this.state.checkedIntegrationsForSync.forEach((checkedInfo, index) => {
        if (checkedInfo.isChecked) {
          const payload = {
            'external_integration_id': checkedInfo.integration_id,
            'from': moment(this.props.startDate).startOf('day').format(),
            'to': moment(this.props.endDate).endOf('day').format()
          };
          if (!supportedIntegrationsList[checkedInfo.integration_type].integrationInfo.is_group_based) {
            // can be invoked in parallel
            this.initSync(payload, checkedInfo, index);
          } else {
            if (typeof syncIntegrationsList[checkedInfo.integration_type] === "undefined") {
              syncIntegrationsList[checkedInfo.integration_type] = []
            }
            syncIntegrationsList[checkedInfo.integration_type].push({
              checkedInfo: checkedInfo,
              payload: payload,
              index: index
            });
          }
        }
      });

      Object.keys(syncIntegrationsList).forEach(function (key) {
        if (syncIntegrationsList[key].length !== 0) {
          if (syncIntegrationsList[key].length > 1) {
            // needs to be called synced
            this.initSync(syncIntegrationsList[key][0].payload, syncIntegrationsList[key][0].checkedInfo, syncIntegrationsList[key][0].index, true, 0, syncIntegrationsList[key]);
          } else {
            this.initSync(syncIntegrationsList[key][0].payload, syncIntegrationsList[key][0].checkedInfo, syncIntegrationsList[key][0].index);
          }
        }
      }.bind(this));
    }
  }

  initSync(payload, checkedInfo, index, runSynced, syncedCurrentIndex, syncedList) {
    fetchExternaldData(payload).then((res) => {
      let checkedIntegrationsForSync = this.state.checkedIntegrationsForSync;
      if (checkedIntegrationsForSync && Array.isArray(checkedIntegrationsForSync)) {
        if (checkedIntegrationsForSync[index] && checkedIntegrationsForSync[index].integration_type === checkedInfo.integration_type) {
          // update this integration info that sync has been initialized
          checkedIntegrationsForSync[index].syncInit = true;
          checkedIntegrationsForSync[index].syncInitResponse = "Synchronization initiated successfully";
          checkedIntegrationsForSync[index].history_id = JSON.parse(res).history_id;
        } else {
          //loop through the array and update accordingly
          for (let i = 0; i < checkedIntegrationsForSync.length; i++) {
            if (checkedIntegrationsForSync[i].integration_type === checkedInfo.integration_type) {
              checkedIntegrationsForSync[i].syncInit = true;
              checkedIntegrationsForSync[i].syncInitResponse = "Synchronization initiated successfully";
              checkedIntegrationsForSync[i].history_id = JSON.parse(res).history_id;
            }
          }
        }
        this.setState({checkedIntegrationsForSync}, () => {
          if (runSynced) {
            if (typeof syncedList[syncedCurrentIndex + 1] !== "undefined") {
              this.initSync(syncedList[syncedCurrentIndex + 1].payload, syncedList[syncedCurrentIndex + 1].checkedInfo, syncedList[syncedCurrentIndex + 1].index, runSynced, parseInt(syncedCurrentIndex + 1), syncedList);
            }
          }
        });
      }
    }).catch((err) => {
      const response_error = JSON.parse(err.responseText);
      let checkedIntegrationsForSync = this.state.checkedIntegrationsForSync;
      if (checkedIntegrationsForSync && Array.isArray(checkedIntegrationsForSync)) {
        if (checkedIntegrationsForSync[index] && checkedIntegrationsForSync[index].integration_type === checkedInfo.integration_type) {
          // update this integration info that sync has been initialized
          checkedIntegrationsForSync[index].syncInit = false;
          checkedIntegrationsForSync[index].syncInitResponse = getErrorMessage(response_error);
        } else {
          //loop through the array and update accordingly
          for (let i = 0; i < checkedIntegrationsForSync.length; i++) {
            if (checkedIntegrationsForSync[i].integration_type === checkedInfo.integration_type) {
              checkedIntegrationsForSync[i].syncInit = false;
              checkedIntegrationsForSync[i].syncInitResponse = getErrorMessage(response_error);

            }
          }
        }
        this.setState({checkedIntegrationsForSync}, () => {
          if (runSynced) {
            if (typeof syncedList[syncedCurrentIndex + 1] !== "undefined") {
              this.initSync(syncedList[syncedCurrentIndex + 1].payload, syncedList[syncedCurrentIndex + 1].checkedInfo, syncedList[syncedCurrentIndex + 1].index, runSynced, parseInt(syncedCurrentIndex + 1), syncedList);
            }
          }
        });
      }
      console.log(err);
    });
  }

  showToast(type, msg) {
    const message = {
      text: msg,
      options: {
        type: type,
        position: toast.POSITION.BOTTOM_LEFT,
        className: type === toast.TYPE.ERROR ? styles.toastErrorAlert : styles.toastSuccessAlert,
        autoClose: 8000
      }
    };
    toast(message.text, message.options);
  }

  getSyncDatesDifference(startDate, enddate) {
    let start = startDate || moment(this.props.startDate);
    let end = enddate || moment(this.props.endDate);

    return end.diff(start, 'd') + 1;
  }

  showSynchronizationDialog() {
    let start = moment(this.props.startDate);
    let end = moment(this.props.endDate);

    let diff = this.getSyncDatesDifference(start, end);
    let toBeSyncedList = [];
    this.state.checkedIntegrationsForSync.forEach((checked, index) => {
      if (checked.isChecked) {
        toBeSyncedList.push({
          integration_type: checked.integration_type,
          syncInit: checked.syncInit,
          syncInitResponse: checked.syncInitResponse,
          integration_name: checked.integration_name,
          lastSyncDateTimeMsg: checked.lastSyncDateTimeMsg,
          integrationLatestBasicInfo: checked.integrationLatestBasicInfo,
          integration_complete_info: checked.integration_complete_info,
          history_id: checked.history_id,
        })
      }
    });
    let names = "";
    let allSyncInit = true;
    let hasSuccess = false;


    let syncInitiated = this.state.syncInitiated;
    let showLoading = true;
    // current sync stats
    let allSyncCompleted = true;

    let count = 0;
    toBeSyncedList.forEach((element, index) => {
      if (index !== 0 && index === (toBeSyncedList.length - 1))
        names += " and";
      names += " " + element.integration_name;
      if (typeof element.syncInit === "undefined")
        allSyncInit = false;
      else if (element.syncInit)
        hasSuccess = true;


      if (element.integration_complete_info && element.integration_complete_info.data_fetch_history && Array.isArray(element.integration_complete_info.data_fetch_history)
        && element.integration_complete_info.data_fetch_history[0] && element.integration_complete_info.data_fetch_history[0].status) {
        // element.integrationLatestBasicInfo = this.getIntegrationLatestBasicInfo(element.integration_complete_info);
        if (element.integration_complete_info.data_fetch_history[0].id === element.history_id &&
          !(element.integration_complete_info.data_fetch_history[0].status === "FAILED" || element.integration_complete_info.data_fetch_history[0].status === "COMPLETE")) {
          allSyncCompleted = false;
        }
        count++;
      }
    });

    if (allSyncCompleted && syncInitiated && count > 0) {
      showLoading = false;
    }

    if (!showLoading){
      toBeSyncedList.forEach((element, index) => {

      if (element.integration_complete_info && element.integration_complete_info.data_fetch_history && Array.isArray(element.integration_complete_info.data_fetch_history)
        && element.integration_complete_info.data_fetch_history[0] && element.integration_complete_info.data_fetch_history[0].status) {

        if (element.integration_complete_info.data_fetch_history[0].id === element.history_id &&
          (element.integration_complete_info.data_fetch_history[0].status === "FAILED" || element.integration_complete_info.data_fetch_history[0].status === "COMPLETE")) {
          element.integrationLatestBasicInfo = this.getIntegrationLatestBasicInfo(element.integration_complete_info);
        }
      }
    });
    }

    let messageHtml =
      <strong>{showLoading ? 'Synchronizing' : 'Synchronized for'} {(diff >= 1 && diff <= 6) ? (diff + " day(s)") : "1 week"} from {start.format("MM/DD/YYYY")} to {end.format("MM/DD/YYYY")}</strong>;


    if (allSyncInit && !this.state.syncInitiated && this.props.getExternalIntegrations) {
      this.props.getExternalIntegrations()
    }
    return this.renderModal(<div>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Synchronizing...</h3>
        </div>
        <div className={styles.bodyInner}>
          <div className={styles.box}>
            <div className={styles.boxBody}>
              <div className={styles.boxBodyInner}>
                <p className={cx(styles.syncingSpinner)}>
                  {messageHtml}

                  {(!allSyncInit || hasSuccess) && (showLoading) && <SavingSpinner borderStyle="none"/>}
                </p>
                <p>
                  <small>{!allSyncInit ? "Please wait..." : hasSuccess ? showLoading ? "Tasks will continue to sync if this dialog is closed." : "Task synchronization completed" : "Synchronization failed."}</small>
                </p>
                {toBeSyncedList && toBeSyncedList.length > 0 &&
                <Table striped bordered hover>
                  <thead>
                  <tr>
                    <th>#</th>
                    <th>Integrations</th>
                    <th>Status</th>
                    <th>Last sync date time</th>
                    <th>Last logs</th>
                    <th></th>
                  </tr>
                  </thead>
                  <tbody>
                  {
                    toBeSyncedList.map((element, elementIndex) => {
                      return (
                        <tr>
                          <td>{(elementIndex + 1)}</td>
                          <td>
                            <small>{element.integration_name}</small>
                          </td>
                          <td>
                            <small>{typeof element.syncInitResponse === "undefined" ? "Pending Response" : element.syncInitResponse}</small>
                          </td>
                          <td>
                            <small>{element.integrationLatestBasicInfo && element.integrationLatestBasicInfo.lastSyncDateTimeMsg || '--'}</small>
                          </td>
                          <td>
                            <small>{element.integrationLatestBasicInfo && element.integrationLatestBasicInfo.detailedMessage ? element.integrationLatestBasicInfo.detailedMessage : "--"}</small>
                          </td>
                          <td><a
                            href={'/settings/integrations/' + supportedIntegrationsList[element.integration_type].integrationInfo.urlEndPoint}
                            target="_blank">
                            <small>View detailed logs</small>
                          </a></td>
                        </tr>
                      )
                    })
                  }
                  </tbody>
                </Table>}
                {this.state.lastSyncTime && <p>
                  <small>Last sync at {this.state.lastSyncTime}</small>
                </p>}

              </div>
            </div>
          </div>
        </div>
      </div>,
      () => {
        this.setState({shouldShowSynchronizationDialog: false, checkedIntegrationsForSync: []});
        if (this.props.getExternalIntegrations) {
          this.props.getExternalIntegrations();
        }
      });
  }

  renderModal(contents, onCrossClick) {
    return (
      <Modal show={true} animation={false} dialogClassName={cx(styles.modalCustomerNote)}>
        <Modal.Body>
          <i className={cx(styles.close)} onClick={onCrossClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="11.758" height="11.756" viewBox="0 0 11.758 11.756">
              <g transform="translate(-1270.486 -30.485)">
                <path
                  d="M-2846.038,82.688l-3.794-3.794-3.794,3.794a1.22,1.22,0,0,1-1.726,0,1.22,1.22,0,0,1,0-1.726l3.794-3.794-3.794-3.794a1.22,1.22,0,0,1,0-1.726,1.222,1.222,0,0,1,1.726,0l3.794,3.794,3.794-3.794a1.222,1.222,0,0,1,1.726,0,1.22,1.22,0,0,1,0,1.726l-3.794,3.794,3.794,3.794a1.222,1.222,0,0,1,0,1.726,1.217,1.217,0,0,1-.863.358A1.215,1.215,0,0,1-2846.038,82.688Z"
                  transform="translate(4126.197 -40.804)" fill="#8d959f"/>
              </g>
            </svg>
          </i>
          {contents}
        </Modal.Body>
      </Modal>
    );
  }

  getLocalDateTIme(dateTIme) {
    try {
      return moment.utc(dateTIme).local().format("MM/DD/YYYY, hh:mm A");
    } catch (e) {
      return null;
    }
  }

  getIntegrationNameToDisplay(integration) {
    let name = supportedIntegrationsList[integration.integration_type] && supportedIntegrationsList[integration.integration_type].integrationInfo && supportedIntegrationsList[integration.integration_type].integrationInfo.title ? supportedIntegrationsList[integration.integration_type].integrationInfo.title : integration.integration_type;
    if (supportedIntegrationsList[integration.integration_type].integrationInfo.is_group_based && integration.data_fetch_additional_settings && integration.data_fetch_additional_settings.external_integration_group_name) {
      //todo should add arrivy group check too?
      name = name + " - " + integration.data_fetch_additional_settings.external_integration_group_name;
    }
    return name;
  }

  renderIntegrationItem(integration, index, isChecked, disabled) {
    let name = this.getIntegrationNameToDisplay(integration);
    return (
      <li key={index} className={styles.synchronizeItem}>
        <Checkbox checked={isChecked} disabled={disabled}
                  onChange={(e) => {
                    this.updateCheckedIntegrationsList(integration, null)
                  }}
                  inline><span>{name}</span></Checkbox>
      </li>
    )
  }


  updateCheckedIntegrationsList(integration, stateCallback) {
    let checkedIntegrationsForSync = this.state.checkedIntegrationsForSync || [];
    let found = false;
    const integrationLatestBasicInfo = this.getIntegrationLatestBasicInfo(integration);
    for (let i = 0; i < checkedIntegrationsForSync.length; i++) {
      if (checkedIntegrationsForSync[i].integration_type && checkedIntegrationsForSync[i].integration_type === integration.integration_type && checkedIntegrationsForSync[i].integration_id === integration.id) {
        checkedIntegrationsForSync[i].isChecked = !checkedIntegrationsForSync[i].isChecked;
        checkedIntegrationsForSync[i].lastSyncDateTimeMsg = integrationLatestBasicInfo ? integrationLatestBasicInfo.lastSyncDateTimeMsg : null;
        checkedIntegrationsForSync[i].integrationLatestBasicInfo = integrationLatestBasicInfo;
        found = true;
        break;
      }
    }
    if (!found) {
      checkedIntegrationsForSync.push({
        integration_name: this.getIntegrationNameToDisplay(integration),
        integration_type: integration.integration_type,
        integration_id: integration.id,
        isChecked: true,
        lastSyncDateTimeMsg: integrationLatestBasicInfo ? integrationLatestBasicInfo.lastSyncDateTimeMsg : null,
        integrationLatestBasicInfo: integrationLatestBasicInfo,
      })
    }
    this.setState({checkedIntegrationsForSync}, stateCallback)
  }

  integrationHasHistory(integration) {
    return integration.data_fetch_history && Array.isArray(integration.data_fetch_history) && integration.data_fetch_history.length > 0;
  }

  getIntegrationStatusMessage(latestStatus) {
    if (latestStatus) {
      switch (latestStatus) {
        case "COMPLETE": {
          return ", completed successfully";
        }
        case "FAILED": {
          return ", failed";
        }
        case "IN_PRE_PROCESS":
        case "IN_POST_PROCESS":
        case "PENDING": {
          return ", in progress";
        }
      }
    }
    return "";
  }

  getIntegrationLatestBasicInfo(integration) {
    let info = null;
    const hasHistory = this.integrationHasHistory(integration);
    const latestStatus = hasHistory ? integration.data_fetch_history[0].status : null;
    const lastStatusMessage = this.getIntegrationStatusMessage(latestStatus);
    const lastSyncDateTime = (hasHistory && this.getLocalDateTIme(integration.data_fetch_history[0].data_fetch_datetime)) || null;
    const dataFetchRangeStartDatetime = hasHistory && integration.data_fetch_history[0].data_fetch_range_start_datetime ? moment.utc(integration.data_fetch_history[0].data_fetch_range_start_datetime).local().format("MM/DD/YYYY") : null;
    const dataFetchRangeEndDatetime = hasHistory && integration.data_fetch_history[0].data_fetch_range_end_datetime ? moment.utc(integration.data_fetch_history[0].data_fetch_range_end_datetime).local().format("MM/DD/YYYY") : null;
    const lastSyncRange = (dataFetchRangeStartDatetime && dataFetchRangeEndDatetime) ? (" for the range " + dataFetchRangeStartDatetime + " - " + dataFetchRangeEndDatetime) : "";
    let createdTasksCount = 0, updatedTaskCount = 0, errorCount = 0;
    let lastSyncDateTimeMsg = "";
    if (lastSyncDateTime) {
      lastSyncDateTimeMsg = lastSyncDateTime;
    }
    if (lastSyncRange) {
      lastSyncDateTimeMsg += lastSyncRange;
    }
    if (lastStatusMessage) {
      lastSyncDateTimeMsg += lastStatusMessage;
    }
    if (lastSyncDateTimeMsg) {
      lastSyncDateTimeMsg = "Last sync was performed on " + lastSyncDateTimeMsg;
    }
    if (hasHistory && integration.data_fetch_history[0].detailed_logs) {
      errorCount = integration.data_fetch_history[0].detailed_logs.error_logs ? integration.data_fetch_history[0].detailed_logs.error_logs.length : 0;
      if (integration.data_fetch_history[0].detailed_logs.success_logs && Array.isArray(integration.data_fetch_history[0].detailed_logs.success_logs)) {
        integration.data_fetch_history[0].detailed_logs.success_logs.forEach((successLog, index) => {
          if (successLog.data && successLog.data['Task Result'] && successLog.data['Task Result'].operation_performed) {
            switch (successLog.data['Task Result'].operation_performed) {
              case "CREATE": {
                createdTasksCount++;
                break
              }
              case "UPDATE": {
                updatedTaskCount++;
                break
              }
            }
          }
        });
      }
    }
    let detailedMessage = "";
    if (createdTasksCount) {
      detailedMessage = createdTasksCount + " Task(s) created";
    }
    if (updatedTaskCount) {
      if (detailedMessage) {
        detailedMessage += ", ";
      }
      detailedMessage += updatedTaskCount + " Task(s) updated";
    }
    if (errorCount) {
      if (detailedMessage) {
        detailedMessage += ", ";
      }
      detailedMessage += errorCount + " error(s) ";
    }

    if (hasHistory) {
      info = {
        lastSyncDateTime,
        lastStatusMessage,
        lastSyncDateTimeMsg,
        detailedMessage,
        lastSyncRange,
      }
    }
    return info;
  }

  render() {
    if (this.props.externalIntegrations && Array.isArray(this.props.externalIntegrations) && this.props.externalIntegrations.length > 0) {
      if (this.props.externalIntegrations.length > 1) {
        return (
          <div className={styles.synchronizationDropdown}>
            {this.state.shouldShowSynchronizationDialog && this.showSynchronizationDialog()}
            <OverlayTrigger key={'lastSyncTime'} placement="top" overlay={this.state.lastSyncTime ?
              <Tooltip> Last Sync <br/> {this.state.lastSyncTime} </Tooltip> : <Tooltip>Synchronize</Tooltip>}>
              <DropdownButton title={'Synchronize Tasks'}>
                {this.props.externalIntegrations.map((integration, index) => {
                  let isChecked = false;
                  let checkedIntegrationsForSync = this.state.checkedIntegrationsForSync || [];
                  const hasHistory = this.integrationHasHistory(integration);
                  const latestStatus = hasHistory ? integration.data_fetch_history[0].status : null;
                  let disabled = true;
                  if (!latestStatus || (latestStatus && (latestStatus === "COMPLETE" || latestStatus === "FAILED"))) {
                    disabled = false
                  }
                  const lastStatusMessage = this.getIntegrationStatusMessage(latestStatus);
                  checkedIntegrationsForSync.forEach((checkedInfo, index) => {
                    if (checkedInfo.integration_type === integration.integration_type && checkedInfo.integration_id === integration.id) {
                      isChecked = checkedInfo.isChecked;
                    }
                  });
                  const lastSyncDateTime = (hasHistory && this.getLocalDateTIme(integration.data_fetch_history[0].data_fetch_datetime)) || null;
                  return (
                    lastSyncDateTime ?
                      <OverlayTrigger key={index + 'lastSyncTime'} placement="left" overlay={<Tooltip>Last
                        Sync <br/>{lastSyncDateTime + lastStatusMessage}
                      </Tooltip>}>
                        {this.renderIntegrationItem(integration, index, isChecked, disabled)}
                      </OverlayTrigger> : this.renderIntegrationItem(integration, index, isChecked, disabled)
                  )
                })}
                <MenuItem divider/>
                <MenuItem onClick={this.initiateSynchronization}>Synchronize</MenuItem>
              </DropdownButton>
            </OverlayTrigger>
          </div>
        )
      } else {
        const hasHistory = this.integrationHasHistory(this.props.externalIntegrations[0]);
        const latestStatus = hasHistory ? this.props.externalIntegrations[0].data_fetch_history[0].status : null;
        const lastStatusMessage = this.getIntegrationStatusMessage(latestStatus);
        //todo
        return (
          <div className={styles.synchronizationDropdown}>
            {this.state.shouldShowSynchronizationDialog && this.showSynchronizationDialog()}
            <OverlayTrigger key={'lastSyncTime'} placement="top" overlay={this.state.lastSyncTime ?
              <Tooltip> Last Sync <br/> {this.state.lastSyncTime + lastStatusMessage} </Tooltip> :
              <Tooltip>Synchronize</Tooltip>}>
              <button onClick={(e) => {
                this.updateCheckedIntegrationsList(this.props.externalIntegrations[0], () => {
                  this.initiateSynchronization(e)
                });
              }}>Synchronize Tasks
              </button>
            </OverlayTrigger>
          </div>
        )
      }
    } else {
      return "";
    }
  }
}
