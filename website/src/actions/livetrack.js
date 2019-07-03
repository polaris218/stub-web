import ajaxPromise from './ajaxPromise';
import moment from 'moment';
import config from '../config/config'
const server_url = config(self).serverUrl

export const getLiveTask = (company_name, task_url) =>
  ajaxPromise({
    url: `${server_url}/api/live-track/${company_name}/${task_url}`,
    type: 'GET'
  });

export const rate = (company_name, task_url, rating, text, rating_type) =>
  ajaxPromise({
    url: `${server_url}/api/live-track/${company_name}/${task_url}/rating/new`,
    type: 'POST',
    data: { rating, text, time: moment().format(), rating_type }
  });

export const sendRecommendation = (company_name, task_url, customer_id, customer_name, email_addresses, email_content, team_members) =>
  ajaxPromise({
    url: `${server_url}/api/live-track/${company_name}/${task_url}/recommend/new`,
    type: 'POST',
    data: { customer_name, customer_id, email_addresses, email_content, team_members, time: moment().format() }
  });

export const confirmTask = (company_name, task_url) =>
  ajaxPromise({
    url: `${server_url}/api/live-track/${company_name}/${task_url}/confirm`,
    type: 'POST',
    data: { time: moment().format() }
  });

export const declineTask = (company_name, task_url, decline_reason) =>
  ajaxPromise({
    url: `${server_url}/api/live-track/${company_name}/${task_url}/decline`,
    type: 'POST',
    data: { decline_reason, time: moment().format() }
  });

export const setNewLiveStatus = (task_id, status) =>
  ajaxPromise({
    url: `${server_url}/api/live-track/${task_id}/livetaskstatus/new`,
    type: 'POST',
    data: status
  });

export const getLiveTaskFileAttachmentURL = (task_id, task_url) =>
  ajaxPromise({
    url: `${server_url}/api/live-track/${task_id}/${task_url}/livetaskstatus/file/upload/url`,
    type: 'GET',
  });

export const getAssigneeRatings = (task_owner, entity_id, tracker_version) =>
  ajaxPromise({
    url: `${server_url}/api/entities/fetch-ratings/${task_owner}/${entity_id}?tracker_version=${tracker_version}`,
    type: `GET`,
  });

export const updateTaskSubscription = (company_name, task_url, subscribe, subscribe_source = 'EMAIL') =>
  ajaxPromise({
    url: `${server_url}/api/live-track/${company_name}/${task_url}/update_subscription`,
    type: 'PUT',
    data: { subscribe, subscribe_source }
  });
