import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './task-confirmation.module.scss';
import { DefaultHelmet } from '../../helpers';
import { EntityConfirmationMain, SlimFooterV2 } from '../../components';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { fetchTasksForConfirmation, updateTaskConfirmation } from '../../actions';
import { Alert } from 'react-bootstrap';
import moment from 'moment';
import { parseQueryParams } from '../../helpers';

export default class TaskConfirmation extends Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      profile: null,
      contentLoaded: false,
      entity: null,
      tasks: null,
      date: null,
      crew: null,
      serverActionIsPending: false,
      pageLoadError: false,
      updateFiled: false,
      updateSuccessful: false,
      errorMessage: null
    };
    this.updateTasksConfirmationOnServer = this.updateTasksConfirmationOnServer.bind(this);
    this.getContentForEntityConfirmation = this.getContentForEntityConfirmation.bind(this);
    this.clearAlerts = this.clearAlerts.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
  }

  componentDidMount() {
    this.getContentForEntityConfirmation();
  }

  clearAlerts() {
    this.setState({
      updateFailed: false,
      updateSuccessful: false
    });
  }

  handleDateChange(date) {
    this.setState({
      date
    }, () => { this.getContentForEntityConfirmation(moment(date).format('YYYY-MM-DD')); });
  }

  getContentForEntityConfirmation(queryDate = null) {
    this.setState({
      pageLoadError: false
    });
    const query = parseQueryParams(this.props.location.search);
    const url_safe_id = this.props.match.params.entity_url_safe_id;
    const date = queryDate !== null ? queryDate : query.date;
    fetchTasksForConfirmation(url_safe_id, date).then((confirmationPageContent) => {
      const confirmationTasks = JSON.parse(confirmationPageContent);
      this.setState({
        entity: confirmationTasks.entity,
        tasks: confirmationTasks.tasks,
        date: confirmationTasks.date,
        crew: confirmationTasks.entities,
        contentLoaded: true
      });
    }).catch((err) => {
      let errorMessage = 'Could not load content at the moment. Try again.';
      console.log(err);
      this.setState({
        contentLoaded: false,
        pageLoadError: true,
        serverActionIsPending: false,
        errorMessage
      });
    });
  }

  updateTasksConfirmationOnServer(updatedTasks) {
    this.setState({
      serverActionIsPending: true,
      updateFiled: false
    });
    updateTaskConfirmation(this.props.match.params.entity_url_safe_id, JSON.stringify(updatedTasks)).then((res) => {
      this.setState({
        serverActionIsPending: false,
        updateSuccessful: true
      }, () => {
        this.getContentForEntityConfirmation(this.state.date);
        setTimeout(() => {
          this.clearAlerts();
        }, 8e3);
      });
    }).catch((err) => {
      this.setState({
        updateFiled: true,
        updateSuccessful: false
      });
    });
  }

  render() {
    return (
      <div className={styles.pageWrap}>
        <DefaultHelmet />
        <header className={styles.header}>
          <a href="/" className={styles.logo}>
            <img src="/images/logo-dark.png" alt="Arrivy"/>
          </a>
        </header>
        <main>
          {!this.state.contentLoaded && !this.state.pageLoadError && <SavingSpinner title={"Loading content"} borderStyle="none" />}
          {this.state.pageLoadError && <Alert bsStyle="danger">{this.state.errorMessage}</Alert>}
          {this.state.contentLoaded &&
            <EntityConfirmationMain
              entity={this.state.entity}
              tasks={this.state.tasks}
              date={this.state.date}
              crew={this.state.crew}
              serverActionIsPending={this.state.serverActionIsPending}
              updateTasks={this.updateTasksConfirmationOnServer}
              updateFiled={this.state.updateFiled}
              updateSuccessful={this.state.updateSuccessful}
              updateDate={this.handleDateChange}
            />
          }
        </main>
        <div className={styles.footer}>
          <SlimFooterV2 />
        </div>
      </div>
    );
  }
}

TaskConfirmation.contextTypes = {
  router: PropTypes.object.isRequired,
};

TaskConfirmation.propTypes = {
  params: PropTypes.object.isRequired
};
