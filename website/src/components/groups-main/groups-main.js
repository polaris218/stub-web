import React, { Component } from 'react';
import styles from './groups-main.module.scss';
import { Grid, Row, Col, Alert, DropdownButton, MenuItem, Button } from 'react-bootstrap';
import cx from 'classnames';
import SavingSpinner from '../saving-spinner/saving-spinner';
import { getAllGroups, createGroup, updateGroup, deleteGroup, getGroupsIconUrl, uploadGroupsIcon, getGroupsIcon, deleteGroupIcon, getEntities, updateEntity } from '../../actions';
import { getErrorMessage } from '../../helpers/task';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import {faEllipsisV} from '@fortawesome/fontawesome-free-solid';
import GroupsForm from './components/groups-form/groups-form';
import GroupsTeam from './components/group-team/group-team';
import { toast } from 'react-toastify';

export default class GroupsMain extends Component {
  constructor(props) {
    super(props);

    this.state = {
      serverActionPending: false,
      successAlert: false,
      errorAlert: false,
      errorMessage: null,
      groups: [],
      showModal: false,
      selectedGroup: null,
      deletingMessage: false,
      duplicateActionIsPending: false,
      selectedGroupEntities: null,
      showEntityModal: false,
      groupDeleteError: null,
      showIds: false
    };

    this.renderEntityGroups = this.renderEntityGroups.bind(this);
    this.compare = this.compare.bind(this);
    this.fetchAllGroups = this.fetchAllGroups.bind(this);
    this.hideAlertMessages = this.hideAlertMessages.bind(this);
    this.handleNewGroupClick = this.handleNewGroupClick.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.handleEditGroupClick = this.handleEditGroupClick.bind(this);
    this.handleDeleteGroupClick = this.handleDeleteGroupClick.bind(this);
    this.handleErrorAlerts = this.handleErrorAlerts.bind(this);
    this.getGroupEntities = this.getGroupEntities.bind(this);
    this.closeGroupEntitiesModal = this.closeGroupEntitiesModal.bind(this);
    this.modifyIdsDisplay = this.modifyIdsDisplay.bind(this);
  }

  componentDidMount() {
    this.fetchAllGroups();
  }

  handleErrorAlerts(error) {
    this.setState({
      errorAlert: error.type !== 'success',
      successAlert: error.type === 'success',
      errorMessage: error.message,
      serverActionPending: true
    }, () => {
      setTimeout(() => this.fetchAllGroups(), 1e3);
      setTimeout(() => this.hideAlertMessages(), 8000);
    });
  }

  hideAlertMessages() {
    this.setState({
      errorAlert: false,
      successAlert: false,
      errorMessage: ''
    });
  }

  handleNewGroupClick(e) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      showModal: true
    });
  }

  handleEditGroupClick(e, group) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      showModal: true,
      selectedGroup: group
    });
  }

  modifyIdsDisplay() {
    const showIds = !this.state.showIds;
    this.setState({ showIds });
  }

  handleDeleteGroupClick(e, group_id) {
    e.preventDefault();
    e.stopPropagation();
    this.setState({
      deletingMessage: true,
      serverActionPending: true,
    });
    deleteGroup(group_id).then((res) => {
	    const groupDeleted = {
		    text: 'Group deleted successfully.',
		    options: {
			    type: toast.TYPE.SUCCESS,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastSuccessAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(groupDeleted);
      this.setState({
        deletingMessage: false
      }, () => {
        setTimeout(() => this.fetchAllGroups(), 1e3);
      })
    }).catch((err) => {
      if (err.status === 409) {
	      const groupDeleteError = {
		      text: JSON.parse(err.responseText).description,
		      options: {
			      type: toast.TYPE.ERROR,
			      position: toast.POSITION.BOTTOM_LEFT,
			      className: styles.toastErrorAlert,
			      autoClose: 8000
		      }
	      };
	      this.props.createToastAlert(groupDeleteError);
        this.getGroupEntities(group_id);
      } else {
        const error = getErrorMessage(JSON.parse(err.responseText));
	      const alert = {
		      text: error,
		      options: {
			      type: toast.TYPE.ERROR,
			      position: toast.POSITION.BOTTOM_LEFT,
			      className: styles.toastErrorAlert,
			      autoClose: 8000
		      }
	      };
	      this.props.createToastAlert(alert);
      }
      this.setState({
        deletingMessage: false,
        serverActionPending: false,
      });
    });
  }

  getGroupEntities(group_id) {
    this.setState({
      serverActionPending: true
    });
    getEntities(100, 1, group_id).then((res) => {
      const groupEntities = JSON.parse(res);
      this.setState({
        selectedGroupEntities: groupEntities,
        showEntityModal: true,
        serverActionPending: false
      });
    }).catch((err) => {
      const error = getErrorMessage(JSON.parse(err.responseText));
	    const alert = {
		    text: error,
		    options: {
			    type: toast.TYPE.ERROR,
			    position: toast.POSITION.BOTTOM_LEFT,
			    className: styles.toastErrorAlert,
			    autoClose: 8000
		    }
	    };
	    this.props.createToastAlert(alert);
      this.setState({
        serverActionPending: false,
        groupDeleteError: null
      });
    });
  }

  closeModal() {
    this.setState({
      showModal: false,
      selectedGroup: null
    }, () => {
      setTimeout(this.fetchAllGroups, 1e3);
    });
  }

  closeGroupEntitiesModal() {
    this.setState({
      showEntityModal: false,
      selectedGroup: null
    });
  }

  fetchAllGroups() {
    this.setState({
      serverActionPending: true
    });
    getAllGroups().then((res) => {
      const groups = JSON.parse(res);
      groups.sort(this.compare);
      this.setState({
        groups,
        serverActionPending: false,
        errorAlert: false
      })
    }).catch((err) => {
      const error = getErrorMessage(JSON.parse(err).responseText);
      this.setState({
        serverActionPending: false
      }, () => {
	      const alert = {
		      text: error,
		      options: {
			      type: toast.TYPE.ERROR,
			      position: toast.POSITION.BOTTOM_LEFT,
			      className: styles.toastErrorAlert,
			      autoClose: 8000
		      }
	      };
	      this.props.createToastAlert(alert);
      });
    });
  }

  compare(a, b) {
    const titleA = a.name.toUpperCase();
    const titleB = b.name.toUpperCase();
    if (titleA > titleB) {
      return 1;
    } else if (titleA < titleB) {
      return -1;
    }
  }

  renderEntityGroups() {
    if (this.state.groups.length === 0) {
      return (
        <Row>
          <Col md={12} className="text-center">
            No groups found.
          </Col>
        </Row>
      );
    } else {
      const renderedMessages = this.state.groups.map((group, index) => {
        let disabledLinkClass = null;
        let disableGroupRowClass = null;
        let disableAction = null;
        if (this.state.serverActionPending) {
          disabledLinkClass = styles.disabledLink;
          disableGroupRowClass = styles.disabledRow;
          disableAction = styles.disableAction;
        } else {
          disabledLinkClass = '';
          disableGroupRowClass = '';
          disableAction = '';
        }
        const groupDescription = group.description && (group.description.length < 250 ? group.description : group.description.substr(0, 250) + '...');
        return (
          <Row className={cx(styles.singleMessageRow, disableGroupRowClass)} key={'entity_group_' + group.id + '_' + index}>
            <Col md={5}>
              <Row>
                <Col sm={this.state.showIds? 6 : 12}>
                  <a onClick={(e) => this.handleEditGroupClick(e, group)} className={cx(styles.singleMessageTitle, disabledLinkClass)}>{group.name}</a>
                </Col>
                {this.state.showIds && <Col sm={6}>
                  <div className={styles.messageDescriptionContainer}>
                    {group.id}
                  </div>
                </Col>}
              </Row>
            </Col>
            <Col md={7}>
              <div className={styles.messageDescriptionContainer}>
                {groupDescription}
              </div>
              {!group.is_implicit && <div className={cx(styles.actionsBtnContainer, disableAction)}>
                <DropdownButton title={(<FontAwesomeIcon icon={faEllipsisV} />)} noCaret pullRight className={styles.actionsBtn} id="bg-nested-dropdown">
                  {group.id && <MenuItem onClick={(e) => this.handleDeleteGroupClick(e, group.id)} eventKey="2">Delete</MenuItem>}
                </DropdownButton>
              </div>}
            </Col>
          </Row>
        );
      });
      return renderedMessages;
    }
  }
  
  render() {
    return (
      <div className={styles.groupsContainer}>
        <Grid>
          <Row>
            <Col md={9}>
              <h1 className={styles.header}>
                Groups
              </h1>
              <p>
                Groups allows you to aggregate sets of Team members and Tasks. These groups can be viewed and reported-on separately. After defining Group names, assign them to Team members on the Member edit screen. Make sure to assign at least one team member with Scheduler permissions to each group.
              </p>
            </Col>
            <Col md={3}>
              <div className={styles.actions}>
                <button onClick={(e) => this.handleNewGroupClick(e)} disabled={this.state.serverActionPending} className={cx(styles.createBtn, styles.mT25)}>Add New Group</button>
              </div>
            </Col>
            {this.state.successAlert &&
              <Col md={12}>
                <Alert bsStyle="success">
                  {this.state.errorMessage}
                </Alert>
              </Col>
            }
            {this.state.errorAlert &&
              <Col md={12}>
                <Alert bsStyle="danger">
                  {this.state.errorMessage}
                </Alert>
              </Col>
            }
            <Col md={12}>
              <div className={styles.leftPanel}>
                <Row>
                  <Col md={12}>
                    <div className={styles.savingSpinnerPlaceholder}>
                      {this.state.serverActionPending &&
                        <SavingSpinner title="Loading" borderStyle="none" size={8} />
                      }
                      {this.state.duplicateActionIsPending &&
                        <SavingSpinner title="Duplicating" borderStyle="none" size={8} />
                      }
                      {this.state.deletingMessage &&
                        <SavingSpinner title="Deleting" borderStyle="none" size={8} />
                      }
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col md={12}>
                    <div className={styles.messageGroup}>
                      <h1 className={styles.groupName}>Entity Groups</h1>
                      {this.renderEntityGroups()}
                    </div>
                  </Col>
                </Row>
                {this.state.groups.length > 0 &&
                <div style={{textAlign: 'right'}}>
                  <Button bsStyle="link" onClick={this.modifyIdsDisplay}>
                    {this.state.showIds ? 'Hide ID' : 'Show ID'}
                  </Button>
                </div>
                }
              </div>
            </Col>
          </Row>
        </Grid>
        <GroupsForm
          showModal={this.state.showModal}
          selectedGroup={this.state.selectedGroup}
          closeModal={this.closeModal}
          createGroup={createGroup}
          updateGroup={updateGroup}
          handleErrorAlerts={this.handleErrorAlerts}
          getGroupsIconUrl={getGroupsIconUrl}
          deleteGroupIcon={deleteGroupIcon}
          uploadGroupsIcon={uploadGroupsIcon}
          profile={this.props.profile}
          updateGroups={this.fetchAllGroups}
          createToastAlert={this.props.createToastAlert}
        />
        <GroupsTeam
          showModal={this.state.showEntityModal}
          closeModal={this.closeGroupEntitiesModal}
          groups={this.state.groups}
          groupEntities={this.state.selectedGroupEntities}
          error={this.state.groupDeleteError}
          updateEntityOnServer={updateEntity}
          createToastAlert={this.props.createToastAlert}
        />
      </div>
    );
  }
  
}
