import React, { Component } from 'react';
import styles from './cs-live-track.module.scss';
import Helmet from 'react-helmet';
import SavingSpinner from '../../components/saving-spinner/saving-spinner';
import { getCustomerName, getErrorMessage } from '../../helpers/task';
import {confirmTask, declineTask, getLiveTask, getLiveTaskSandbox, rate, setNewLiveStatus, updateTaskSubscription} from '../../actions';
import moment from 'moment';
import { STATUS_META_DATA } from '../../helpers/status_meta_data';
import { CSLiveTrackMain }  from '../../components/live_index';
import config from '../../config/config'
import { parseQueryParams } from '../../helpers';
const env = config(self).env;

export default class CSLiveTrack extends Component {
  constructor(props, context) {
    super(props, context);

    this.state = {
      task: null,
      profile: null,
      entities: null,
      estimate: null,
      status: null,
      rating: null,
      contentLoading: true,
      contentLoaded: false,
      error: '',
      timer: null,
      group: null,
      confirmation_needed: null,
      confirmation_message_text: null,
      review_prompt_text: null,
      negative_review_prompt_text: null,
      liveTrackVisited: false,
      sub_component: null,
      subscribe: null,
      showAlert: false,
      updateSubscription: true,
    };

    this.fetchContent = this.fetchContent.bind(this);
    this.startAsyncUpdate = this.startAsyncUpdate.bind(this);
    this.visibilityChanged = this.visibilityChanged.bind(this);
    this.clearAsyncUpdate = this.clearAsyncUpdate.bind(this);
    this.removeAlert = this.removeAlert.bind(this);

  }

  componentWillUnmount() {
    this.clearAsyncUpdate();
    document.removeEventListener('visibilitychange', this.visibilityChanged);
  }

  clearAsyncUpdate() {
    if (this.state.timer) {
      clearTimeout(this.state.timer);
    }
  }

  visibilityChanged() {
    if (document.hidden) {
      this.clearAsyncUpdate();
    } else {
      this.clearAsyncUpdate();
      this.startAsyncUpdate();
    }
  }

  removeAlert() {
    this.setState({
      showAlert: false
    });
  }

  componentDidMount() {
    this.startAsyncUpdate();
    document.addEventListener('visibilitychange', this.visibilityChanged);
  }

  startAsyncUpdate() {
    this.fetchContent();
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 14e3);

    this.setState({
      timer
    });
  }

  fetchContent() {
    this.setState({ contentLoading: true });
    getLiveTask('cs', this.props.match.params.task_url).then((res) => {
      const parsedRes = JSON.parse(res);
      const query = parseQueryParams(this.props.location.search);
      if (!this.state.liveTrackVisited) {
        if (!query.url) {
          if(!window.DEBUG) {
                  var dataLayer = window.dataLayer = window.dataLayer || [];
                  dataLayer.push({
                      'event': 'ChangeUserType',
                      'ArrivyUserType': 'livetrack',
                      'CustName': parsedRes.task.customer_name ? parsedRes.task.customer_name.toString() : '',
                      'CustNumber': parsedRes.task.customer_id ? parsedRes.task.customer_id.toString() : '',
                      'CustType': parsedRes.profile.company_type ? parsedRes.profile.company_type.toString() : ''
                  });
          }
          const status = {
            title: 'SEEN BY CUSTOMER',
            type: 'SEEN_BY_CUSTOMER',
            time: moment().format(),
            reporter_name: 'ARRIVY',
            reporter_id: 0,
            color: '#44a7f1',
            live_track_view_source: query.live_link_source ? query.live_link_source : 'web'
          };

          let extra_fields = null;
          const task_id = parsedRes.task.id;
          const notes = getCustomerName(parsedRes.task.customer_first_name, parsedRes.task.customer_last_name) + ' viewed live track page';
          extra_fields = {
            'notes': notes,
            'visible_to_customer' : false
          };

          status.extra_fields = JSON.stringify(extra_fields);
          status.task_url = parsedRes.task_url;
          status.source = 'web';
          status.task_url = this.props.match.params.task_url;
          setNewLiveStatus( task_id, status ).then(() => {
          }).catch((error) => {
            const resposne_error = JSON.parse(error.responseText);
            const error_text = getErrorMessage(resposne_error);
            console.log(error_text, 'Seen by Customer status could not be marked');
          });
        }
      }

      let updateSubscriptionFromUrl = typeof query.subscribe !== 'undefined' && query.subscribe !== '' && (Number(query.subscribe) === 1 || Number(query.subscribe) === 0);
      let subscribe = updateSubscriptionFromUrl && Number(query.subscribe) === 1 ? true : false;
      if (updateSubscriptionFromUrl && this.state.updateSubscription && subscribe !== (parsedRes.task.notifications && !parsedRes.task.notifications.email_notification_force_unsubscribed)) {
        updateTaskSubscription('CS', this.props.match.params.task_url, subscribe).then(() => {
          this.setState({
            showAlert: true,
            updateSubscription: false,
          }, () => {
            this.fetchContent();
            setTimeout(this.removeAlert, 8e3)
          });
        });
      }
      const statusList = parsedRes.status;
      const result = this.generateLatestStatus(statusList);
      this.setState({
        contentLoading: false,
        contentLoaded: true,
        error: '',
        task: parsedRes.task,
        profile: parsedRes.profile,
        entities: parsedRes.entities,
        rating: parsedRes.rating,
        status: {
          statusList,
          latestStatus: result.latestStatus,
          latestStatusTitle: result.latestStatusTitle
        },
        group: parsedRes.group,
        estimate: parsedRes.estimate,
        confirmation_needed: parsedRes.confirmation_needed,
        confirmation_message_text: parsedRes.confirmation_message_text,
        review_prompt_text: parsedRes.review_prompt_text,
        negative_review_prompt_text: parsedRes.negative_review_prompt_text,
        liveTrackVisited: true,
        subscribe
      });
    }).catch((error) => {
      this.setState({
        contentLoading: false,
        contentLoaded: false,
        error: 'Unable to fetch information at this point. Please try again!'
      });
    });
  }


  generateLatestStatus(statusList) {
    let latestStatus = 'NOTSTARTED';
    let latestStatusTitle = 'NOTSTARTED';
    // Don't set internal_statuses as latest status on task
    for (let i = 0; i < statusList.length; i++) {
      if (statusList[i].extra_fields && typeof statusList[i].extra_fields.visible_to_customer !== 'undefined' && statusList[i].extra_fields.visible_to_customer !== false) {
        if (typeof STATUS_META_DATA[statusList[i].type] !== 'undefined' && STATUS_META_DATA[statusList[i].type].isTaskLatestStatus) {
          latestStatus = statusList[i].type;
          if (typeof statusList[i].title !== 'undefined' && statusList[i].title && statusList[i].title !== '' && statusList[i].title !== null) {
            latestStatusTitle = statusList[i].title;
          } else {
            latestStatusTitle = statusList[i].type;
          }
          break;
        }
      }
    }

    return {
      latestStatus, latestStatusTitle
    };
  }

  render() {

    const {
      task,
      profile,
      entities,
      estimate,
      rating,
      status,
      contentLoading,
      contentLoaded,
      error,
      confirmation_needed,
      confirmation_message_text,
      review_prompt_text,
      negative_review_prompt_text,
      sub_component,
      group
    } = this.state;


    let title = 'Arrivy';
    if (this.state.profile) {
      title = this.state.profile.fullname + ' - ' + (this.state.profile.intro ? this.state.profile.intro : '');
    }

    return (
      <div className={styles.liveTrackPageContainer}>
        {!this.state.contentLoaded && this.state.contentLoading &&
          <div className={styles.savingSpinnerContainer}>
            <SavingSpinner title="Loading" borderStyle="none"  />
          </div>
        }
        {!this.state.contentLoaded && !this.state.contentLoading &&
          <div className={styles.errorAlertContainer}>
            <p>
              { this.state.error }
            </p>
          </div>
        }
        {this.state.contentLoaded && env !== 'Lib' && <Helmet
          title={title}
          defaultTitle='Arrivy'
          meta={[
            { name: 'description', content: this.state.profile && this.state.profile.details ? this.state.profile.details : 'Track real-time progress on Arrivy' },
            { property: 'og:title', content: title },
            { property: 'og:image', content: this.state.profile && this.state.profile.image_path ? this.state.profile.image_path : 'https://www.arrivy.com/images/logo-dark.png' },
            { property: 'og:type', content: 'website' }
          ]}
        /> }
        {this.state.contentLoaded &&
          <CSLiveTrackMain
            task={ task }
            profile={ profile }
            entities={ entities }
            estimate={ estimate }
            rating={ rating }
            status={ status }
            contentLoading={ contentLoading }
            contentLoaded={ contentLoaded }
            error={ error }
            group={group}
            rate={ rate }
            company_name="Complete Solar"
            task_url={ this.props.match.params.task_url }
            sub_component={ sub_component }
            confirmation_needed={ confirmation_needed }
            confirmation_message_text = { confirmation_message_text }
            review_prompt_text = { review_prompt_text }
            negative_review_prompt_text = { negative_review_prompt_text }
            confirmTask={ confirmTask }
            declineTask={ declineTask }
            refreshStatus={ this.fetchContent }
            items_with_statuses={task.items_with_statuses}
            updateTaskSubscription={ updateTaskSubscription }
            subscribe={this.state.subscribe}
            showAlert={this.state.showAlert}
          />
        }
      </div>
    );
  }

}
