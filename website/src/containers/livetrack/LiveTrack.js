import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import moment from 'moment';
import styles from './LiveTrack.module.scss';
import { FooterComponent, FooterConfiguration, LiveTrackMain }  from '../../components/live_index';
import { getLiveTask, getLiveTaskDetails, getLiveTaskStatus, rate, confirmTask, declineTask, setNewLiveStatus } from '../../actions';
import { getLiveTaskSandbox, getLiveTaskDetailsSandbox, getLiveTaskStatusSandbox, rateSandbox, confirmTaskSandbox, declineTaskSandbox, setNewLiveStatusSandbox } from '../../actions';
import { getCustomerName, getErrorMessage } from '../../helpers/task';
import {STATUS_META_DATA} from "../../helpers/status_meta_data";
import { parseQueryParams } from '../../helpers';

export default class Dashboard extends Component {
  constructor(props, context) {
    super(props, context);

    this.fetchContent = this.fetchContent.bind(this);
    this.startAsyncUpdate = this.startAsyncUpdate.bind(this);
    this.visibilityChanged = this.visibilityChanged.bind(this);
    this.clearAsyncUpdate = this.clearAsyncUpdate.bind(this);
    this.setProps = this.setProps.bind(this);

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
      confirmation_needed: null,
      confirmation_message_text: null,
      review_prompt_text: null,
      negative_review_prompt_text: null,
      liveTrackVisited: false,
      company_name: null,
      task_url: null,
      sub_component: null
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

  setProps(props) {
    var company_name = null;
    var task_url = null;
    if(props.company_name && props.task_url){
      company_name = props.company_name;
      task_url = props.task_url;
    } else if (props.params && props.params.company_name && props.params.task_url){
      company_name = props.params.company_name;
      task_url = props.params.task_url;
    }

    this.setState({
      company_name,
      task_url
    });
  }
  componentWillMount() {
    this.setProps(this.props)
    this.setState({
      sub_component: this.props.sub_component
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setProps(nextProps)
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
    if (typeof this.props.useSandboxUrl !== 'undefined') {
      getLiveTaskSandbox(this.state.company_name, this.state.task_url).then((data) => {
        const parsedRes = data;
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
    } else {
      getLiveTask(this.state.company_name, this.state.task_url).then((res) => {
        const parsedRes = JSON.parse(res);
        if (!this.state.liveTrackVisited) {
          const query = parseQueryParams(this.props.location.search);
          if (!query.url) {
            const status = {
              title: 'SEEN BY CUSTOMER',
              type: 'SEEN_BY_CUSTOMER',
              time: moment().format(),
              reporter_name: 'ARRIVY',
              reporter_id: 0,
              color: '#44a7f1'
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
        console.log(error)
      });
    }
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
      company_name,
      task_url,
      sub_component
     } = this.state;

    let title = 'Arrivy';
    if (this.state.profile) {
      title = this.state.profile.fullname + ' - ' + (this.state.profile.intro ? this.state.profile.intro : '');
    }

    let { useSandboxUrl, showFooter, showCompanyProfileWidget } = this.props;

    if (typeof useSandboxUrl === 'undefined') {
      useSandboxUrl = false;
    }
    if (typeof showFooter === 'undefined') {
      showFooter = true;
    }

    if (typeof showCompanyProfileWidget === 'undefined') {
      showCompanyProfileWidget = true;
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
        {(!this.props.sub_component || this.props.sub_component !== 'Footer') &&
          <div className={styles['page-wrap']}>
            <LiveTrackMain
              task={ task }
              profile={ profile }
              entities={ entities }
              estimate={ estimate }
              rating={ rating }
              status={ status }
              contentLoading={ contentLoading }
              contentLoaded={ contentLoaded }
              error={ error }
              rate={ rate }
              company_name={ company_name }
              task_url={ task_url }
              sub_component={ sub_component }
              confirmation_needed={ confirmation_needed }
              confirmation_message_text = { confirmation_message_text }
              review_prompt_text = { review_prompt_text }
              negative_review_prompt_text = { negative_review_prompt_text }
              confirmTask={ confirmTask }
              declineTask={ declineTask }
              refreshStatus={ this.fetchContent }
              useSandboxUrl={useSandboxUrl}
              showCompanyProfileWidget={showCompanyProfileWidget}
            />
          </div>
        }
        {showFooter && (!this.props.sub_component || this.props.sub_component === 'Footer') &&
        <div className={styles.footer}>
          <FooterComponent links={FooterConfiguration} slimFooter/>
        </div>
        }
      </div>
    );
  }
}

Dashboard.contextTypes = {
  router: PropTypes.object.isRequired,
};

Dashboard.propTypes = {
  useSandboxUrl: PropTypes.bool,
  showFooter: PropTypes.bool,
  showCompanyProfileWidget: PropTypes.bool
};
