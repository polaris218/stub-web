import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import styles from './mila-live-track.module.scss';
import { MilaLiveTrackMain }  from '../../components/live_index';
import { getLiveTask, rate, confirmTask, declineTask, getAssigneeRatings, setNewLiveStatus } from '../../actions';
import { getCustomerName, getErrorMessage } from '../../helpers/task';
import moment from 'moment';
import { parseQueryParams } from '../../helpers';

export default class MilaLiveTrack extends Component {
  constructor(props, context) {
    super(props, context);

    this.fetchContent = this.fetchContent.bind(this);
    this.startAsyncUpdate = this.startAsyncUpdate.bind(this);
    this.visibilityChanged = this.visibilityChanged.bind(this);
    this.clearAsyncUpdate = this.clearAsyncUpdate.bind(this);

    this.state = {
      task: null,
      profile: null,
      entities: null,
      estimate: null,
      status: null,
      rating: null,
      contentLoading: false,
      contentLoaded: false,
      error: '',
      timer: null,
      confirmation_needed: null,
      confirmation_message_text: null,
      review_prompt_text: null,
      negative_review_prompt_text: null,
      assigneeRating: [],
      liveTrackVisited: false,
      trackerVersion: 'OLD',
    };
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

  componentDidMount() {
    this.startAsyncUpdate();
    document.addEventListener('visibilitychange', this.visibilityChanged);
  }

  startAsyncUpdate() {
    this.fetchContent();
    const timer = setTimeout(() => {
      this.startAsyncUpdate();
    }, 14000);

    this.setState({
      timer
    });
  }

  fetchContent() {
    const query = parseQueryParams(this.props.location.search);
    const trackerVersion = query.tracker_version;
    this.setState({
      contentLoading: true,
      trackerVersion,
    });

    getLiveTask('mila', this.props.match.params.task_url).then((res) => {
      const parsedRes = JSON.parse(res);

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
      const statusList = parsedRes.status;
      const latestStatus = this.generateLatestStatus(statusList);
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
          latestStatus
        },
        estimate: parsedRes.estimate,
        confirmation_needed: parsedRes.confirmation_needed,
        confirmation_message_text: parsedRes.confirmation_message_text,
        review_prompt_text: parsedRes.review_prompt_text,
        negative_review_prompt_text: parsedRes.negative_review_prompt_text,
        liveTrackVisited: true
      });
    }).catch((error) => {
      this.setState({
        contentLoading: false,
        contentLoaded: false,
        error: 'Unable to fetch information at this point'
      });
    });
  }


  generateLatestStatus(statusList) {
    let latestStatus = 'NOTSTARTED';
    for (let i = 0; i < statusList.length; i++) {
      if (statusList[i].type !== 'CUSTOM') {
        latestStatus = statusList[i].type;
        break;
      }
    }

    return latestStatus;
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
      negative_review_prompt_text
    } = this.state;

    let title = 'Arrivy';
    if (this.state.profile) {
      title = this.state.profile.fullname + ' - ' + (this.state.profile.intro ? this.state.profile.intro : '') ;
    }

    const query = parseQueryParams(this.props.location.search);

    let langParam = 'EN';
    if (query.lang && query.lang !== '' && (query.lang.toUpperCase() === 'EN' || query.lang.toUpperCase() === 'DE' || query.lang.toUpperCase() === 'FR' || query.lang.toUpperCase() === 'IT')) {
      langParam = query.lang.toUpperCase();
    }
    let chatWidgetVisibility = false;
    if (typeof query.show_chat_button !== 'undefined' && query.show_chat_button !== null && query.show_chat_button.toUpperCase() === 'TRUE') {
      chatWidgetVisibility = true;
    }

    return (
      <div className={styles['full-height']}>
        { contentLoaded && <Helmet
          title={title}
          defaultTitle="Arrivy"
          meta={[
            { name: 'description', content: this.state.profile && this.state.profile.details ? this.state.profile.details : 'Track real-time progress on Arrivy' },
            { property: 'og:title', content: title },
            { property: 'og:image', content: this.state.profile && this.state.profile.image_path ? this.state.profile.image_path : 'https://www.arrivy.com/images/logo-dark.png' },
            { property: 'og:type', content: 'website' }
          ]}
        /> }
        <div className={styles['page-wrap']}>
          <MilaLiveTrackMain
            task={ task }
            profile={ profile }
            entities={ entities }
            estimate={ estimate }
            rating={ rating }
            status={ status }
            contentLoading={ contentLoading }
            contentLoaded={ contentLoaded }
            error={ error }
            rate={rate}
            company_name={this.props.match.params.company_name}
            task_url={this.props.match.params.task_url}
            confirmation_needed={ confirmation_needed }
            confirmation_message_text = { confirmation_message_text }
            review_prompt_text = { review_prompt_text }
            negative_review_prompt_text = { negative_review_prompt_text }
            confirmTask={ confirmTask }
            declineTask={ declineTask }
            refreshStatus={ this.fetchContent }
            lang={langParam}
            getAssigneeRating={ getAssigneeRatings }
            showChatWidget={chatWidgetVisibility}
            trackerVersion={this.state.trackerVersion}
          />
        </div>
      </div>
    );
  }
}

MilaLiveTrack.contextTypes = {
  router: PropTypes.object.isRequired,
};
