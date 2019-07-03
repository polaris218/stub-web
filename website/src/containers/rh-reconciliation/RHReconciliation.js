import React, { Component } from 'react';
import styles from './RHReconciliation.module.scss';
import PropTypes from 'prop-types';
import moment from 'moment';
import { UserHeaderV2, SlimFooterV2, ActivityStream }  from '../../components';
import { getProfileInformation, getTasks, getEntities, getCompanyProfileInformation } from '../../actions';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { DefaultHelmet } from '../../helpers';
import {makeTaskGroups, makeTaskGroupsUsingRouteId} from '../../helpers/task';
import history from '../../configureHistory';
import { Grid, Row, Col, Alert } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/fontawesome-free-solid';
import cx from 'classnames';
import $ from 'jquery';
import DatePicker from 'react-bootstrap-date-picker';
import {error_catch} from '../../helpers/error_catch';

export default class RHReconciliation extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      account_email :'',
      account_name : '',
      date: moment().toISOString(),
      page: 1,
      items_per_page: 100,
      tasks: [],
      contentLoaded: false,
      serverActionIsPending: false,
      pageLoadError: false,
      updateSuccessful: false,
      errorMessage: null,
      loadingTasks: false,
      entities: [],
      loadingEntities: false,
      companyProfile: null,
      internetIssue: undefined,
    };

    this.getTasks = this.getTasks.bind(this);
    this.handleDateNextClicked = this.handleDateNextClicked.bind(this);
    this.handleDatePrevClicked = this.handleDatePrevClicked.bind(this);
    this.renderTaskGroups = this.renderTaskGroups.bind(this);
    this.getAllEntities = this.getAllEntities.bind(this);
    this.getEntityName = this.getEntityName.bind(this);
    this.renderGroupItems = this.renderGroupItems.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.activityStreamStateChangeHandler = this.activityStreamStateChangeHandler.bind(this);
    this.activityStreamLogoutHandler = this.activityStreamLogoutHandler.bind(this);
  }

  componentWillMount() {
    getCompanyProfileInformation().then((res) => {
      let companyProfile = JSON.parse(res);
      this.setState({ companyProfile });
    }).catch((err) => {
      if(err.status === 0) {
        this.setState({
          internetIssue: true,
        });
      }
    });

    getProfileInformation()
    .then((res) => {
      const profile = JSON.parse(res);
      let permissions = null;
      let is_company = false;
      let view_activity_stream = false;
      if (profile) {
        if (profile && profile.permissions) {
          permissions = profile.permissions
        }
        if (permissions && permissions.includes('COMPANY')) {
          is_company = true
        }
        if (is_company || (permissions && (permissions.includes('SHOW_OWN_ACTIVITY_STREAM') || permissions.includes('SHOW_ALL_ACTIVITY_STREAM')))) {
          view_activity_stream = true;
        }
      }
      this.setState({
        account_email: profile.email,
        account_name: profile.fullname,
        profile: profile,
        view_activity_stream
      });
      if (!profile || !profile.permissions || !(profile.permissions.includes('COMPANY') || profile.permissions.includes('ADMIN') || profile.permissions.includes('SCHEDULER'))) {
        history.push('/dashboard');
      }
    })
    .catch((error) => {
      error_catch(error);
    });
  }

  componentDidMount() {
    this.getTasks();
  }

  getTasks(){
    this.setState({
      loadingTasks: true
    });
    const startDate = moment(this.state.date).startOf('day');
    const endDate = moment(this.state.date).endOf('day');
    const items_per_page = this.state.items_per_page;
    const page = this.state.page;
    getTasks({ viewType: null, startDate, endDate, items_per_page, page , show_items_with_statuses: true})
      .then((tasks) => {
        const parsedTasks = JSON.parse(tasks);
        this.setState({
          tasks: parsedTasks,
          contentLoaded: true,
          loadingTasks: false
        }, () => {
          this.getAllEntities();
        });
      }).catch((error) => {
      let errorMessage = 'Could not load content at the moment. Try again.';
      this.setState({
        contentLoaded: false,
        pageLoadError: true,
        serverActionIsPending: false,
        errorMessage,
        loadingTasks: false
        });
      });
  }

  handleDateNextClicked() {
    const date = this.state.date;
    const updatedDate = moment(date).add(1, 'day').toISOString();
    this.setState({
      date: updatedDate
    }, () => this.getTasks());
  }

  handleDatePrevClicked() {
    const date = this.state.date;
    const updatedDate = moment(date).add(-1, 'day').toISOString();
    this.setState({
      date: updatedDate
    }, () => this.getTasks());
  }

  renderTaskGroups(taskGroups) {
    const taskGroupsLocal = $.extend(true, [], taskGroups);
    const renderedGroups = taskGroupsLocal.map((group) => {
      let routeGroupName = null;
      if (group[0].entity_ids.length > 0) {
        routeGroupName = group[0].entity_ids.map((entity, index) => {
          let entityName = this.getEntityName(entity);
          if (index < (group[0].entity_ids.length - 1)) {
            entityName = entityName + ', '
          }
          return entityName;
        });
      }
      return(
        <Col key={Math.random().toString(36).substr(2, 16)} md={12}>
          <div className={styles.taskGroupSingle}>
            <h3 className={styles.groupName}>
              Route {routeGroupName} ({ moment.utc(group[0].start_datetime).local().format('h:mm a') } - { moment.utc(group[(group.length - 1)].end_datetime).local().format('h:mm a') })
            </h3>
            <div>
              {this.renderGroupItems(group)}
            </div>
          </div>
        </Col>
      );
    });
    return renderedGroups;
  }

  getAllEntities() {
    this.setState({
      contentLoaded: false,
    });
    getEntities(500, 1).then((result) => {
      const parsedResult = JSON.parse(result);
      this.setState({
        contentLoaded: true,
        entities: parsedResult,
        pageLoadError: false
      });
    }).catch((error) => {
      this.setState({
        contentLoaded: false,
        pageLoadError: true,
        serverActionIsPending: false,
        errorMessage: 'Could not load content at the moment. Try again.'
      });
    });
  }

  getEntityName(entity_id) {
    const entities = $.extend(true, [], this.state.entities);
    let entityName = null;
    if (entities.length > 0) {
      const entity = entities.find((el) => {
        return el.id === entity_id;
      });
      if (typeof entity !== 'undefined') {
        entityName = entity.name;
      } else {
        entityName = 'Unknown';
      }
    } else {
      entityName = 'Unknown';
    }
    return entityName;
  }

  renderGroupItems(group) {
    let renderedTasks = null;
    renderedTasks = group.map((task) => {
      if (task.items_with_statuses.length > 0) {
        return (
          <div key={Math.random().toString(36).substr(2, 16)} className={styles.groupTaskContainer}>
            <p className={styles.customerInformation}>
              { task.customer_name !== null && task.customer_name !== '' && task.customer_name + ', ' } { task.customer_address } &nbsp;
            </p>
            {
              task.items_with_statuses.map((item) => {
                let itemStatusClass = null;
                if (item.status.toUpperCase() === 'DELIVERED') {
                  itemStatusClass = styles.itemStatusDelivered;
                } else if (item.status.toUpperCase() === 'REJECTED') {
                  itemStatusClass = styles.itemStatusRejected;
                } else if (item.status.toUpperCase() === 'PICKED_UP') {
                  itemStatusClass = styles.itemStatusPickedUp;
                } else if (item.status.toUpperCase() === 'NOT_PICKED_UP') {
                  itemStatusClass = styles.itemStatusNotPickedUp;
                } else if (item.status.toUpperCase() === 'UNKNOWN') {
                  itemStatusClass = styles.itemStatusUnknown;
                }

                let productStatus = '';
                if (item.status && item.status.toUpperCase() === 'DELIVERED') {
                  productStatus = 'DELIVERED';
                } else if (item.status && item.status.toUpperCase() === 'REJECTED') {
                  productStatus = 'REJECTED';
                } else if (item.status && item.status.toUpperCase() === 'PICKED_UP') {
                  productStatus = 'PICKED UP';
                } else if (item.status && item.status.toUpperCase() === 'UNKNOWN') {
                  productStatus = 'UNKNOWN';
                }

                return (
                  <p key={Math.random().toString(36).substr(2, 16)} className={styles.taskItem}>
                    <span className={cx(styles.itemStatus, itemStatusClass)}>{productStatus}</span>
                    {' '}
                    <span>
                      { item.sku !== null && item.sku !== null && item.sku + ', ' } { item.name }
                    </span>
                  </p>
                );
              })
            }
          </div>
        );
      } else {
        return (
          <div key={Math.random().toString(36).substr(2, 16)} className={styles.groupTaskContainer}>
            <p className={styles.customerInformation}>
              { task.customer_name !== null && task.customer_name !== '' && task.customer_name + ', ' } { task.customer_address }
            </p>
            <p key={Math.random().toString(36).substr(2, 16)} className={styles.taskItem}>
              No Items found.
            </p>
          </div>
        );
      }
    });
    return renderedTasks;
  }

  onChangeDate(date) {
    this.setState({
      date
    }, () => this.getTasks());
  }

  activityStreamStateChangeHandler(activityStreamStateHandler) {
    this.setState({
      activityStreamStateHandler
    });
  }

  activityStreamLogoutHandler() {
    this.state.activityStreamStateHandler && this.state.activityStreamStateHandler.logout();
  }

  render() {
    const tasksWithRouteId = this.state.tasks.filter((task) => {
      return task.route_id;
    });
    const tasksWithOutRouteId = this.state.tasks.filter((task) => {
      return !task.route_id;
    });

    let taskGroups = [];
    let taskGroupsWithoutRouteId = [];
    if (tasksWithRouteId) {
      taskGroups = $.extend([], true, makeTaskGroupsUsingRouteId(tasksWithRouteId));
    }
    if (tasksWithOutRouteId) {
      taskGroupsWithoutRouteId = $.extend([] ,true, makeTaskGroups(tasksWithOutRouteId));
    }
    taskGroups.push.apply(taskGroups, taskGroupsWithoutRouteId);
    return (
      <div className={styles['full-height'] + ' activity-stream-right-space'}>
        <DefaultHelmet/>
        <ActivityStream showActivities={this.state.view_activity_stream} onStateChange={activityStreamStateHandler => { this.activityStreamStateChangeHandler(activityStreamStateHandler) }}/>
        <div className={styles['page-wrap']}>
          <UserHeaderV2 activityStreamLogoutHandler={this.activityStreamLogoutHandler} router={this.context.router} profile={this.state.profile} companyProfile={this.state.companyProfile} />
          <Grid>
            <Row>
              <Col md={12}>
                <h2>
                  Reconciliation Report
                </h2>
              </Col>
              <Col md={12}>
                <p className={styles.tasksRoutesGroups}>
                  {
                    this.state.loadingTasks
                    ?
                    <SavingSpinner title="Loading" size={4} borderStyle="none"  />
                    :
                    <span>{taskGroups.length} routes, {this.state.tasks.length} tasks</span>
                  }
                </p>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <div className={styles.dateAndBtnContainer}>
                  <button className={cx(styles.dateNavigationBtn, styles.btnLeft)} onClick={() => this.handleDatePrevClicked()}>
                    <FontAwesomeIcon icon={faChevronLeft} />
                  </button>
                  <span className={styles.selectedDate}>
                    <DatePicker
                      id="start_date"
                      value={this.state.date}
                      dateFormat={'DD-MM-YYYY'}
                      onChange={this.onChangeDate}
                      showClearButton={false}
                      showTodayButton
                      ref="dateInput"
                    />
                  </span>
                  <button className={cx(styles.dateNavigationBtn, styles.btnRight)} onClick={() => this.handleDateNextClicked()}>
                    <FontAwesomeIcon icon={faChevronRight} />
                  </button>
                </div>
              </Col>
            </Row>
            <div className={styles.groupsContainer}>
              {this.state.contentLoaded && this.renderTaskGroups(taskGroups)}
            </div>
          </Grid>
          <Grid>
            <Row>
              <Col md={12}>
                {!this.state.contentLoaded && !this.state.pageLoadError &&
                  <SavingSpinner title={"Loading content"} borderStyle="none" />
                }
                {this.state.pageLoadError &&
                  <Alert bsStyle="danger">{this.state.errorMessage}</Alert>
                }
              </Col>
            </Row>
          </Grid>
        </div>
        <div>
          <SlimFooterV2 />
        </div>
      </div>
    );
  }
}

RHReconciliation.contextTypes = {
  router: PropTypes.object.isRequired
};
