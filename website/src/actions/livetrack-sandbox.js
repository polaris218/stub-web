import ajaxPromise from './ajaxPromise';
import moment from 'moment';

export const getLiveTaskSandbox = (company_name, task_url) => {
  return ajaxPromise({
    url: `https://arslan-cross-access-dot-arrivy-sandbox.appspot.com/api/live-track/${company_name}/${task_url}`,
    type: 'GET',
    dataType: 'jsonp',
    jsonpCallback: 'handleMyData',
    headers: { 'Content-type': 'application/x-www-form-urlencoded', 'Accept' : 'text/plain', 'X-Auth-Key' : '26be717d-54c7', 'X-Auth-Token' : '7rrunytNoVgpV4qgLZYmH1' },
  });
}

export const rateSandbox = (company_name, task_url, rating, text) =>
  ajaxPromise({
    url: `https://arslan-cross-access-dot-arrivy-sandbox.appspot.com/api/live-track/${company_name}/${task_url}/rating/new`,
    type: 'POST',
    data: { rating, text, time: moment().format() },
    dataType: 'jsonp',
    headers: { 'Content-type': 'application/x-www-form-urlencoded', 'Accept' : 'text/plain', 'X-Auth-Key' : '26be717d-54c7', 'X-Auth-Token' : '7rrunytNoVgpV4qgLZYmH1' },
  });

export const sendRecommendationSandbox = (company_name, task_url, customer_id, customer_name, email_addresses, email_content, team_members) =>
  ajaxPromise({
    url: `https://arslan-cross-access-dot-arrivy-sandbox.appspot.com/api/live-track/${company_name}/${task_url}/recommend/new`,
    type: 'POST',
    data: { customer_name, customer_id, email_addresses, email_content, team_members, time: moment().format() },
    dataType: 'jsonp',
    headers: { 'Content-type': 'application/x-www-form-urlencoded', 'Accept' : 'text/plain', 'X-Auth-Key' : '26be717d-54c7', 'X-Auth-Token' : '7rrunytNoVgpV4qgLZYmH1' },
  });

export const confirmTaskSandbox = (company_name, task_url) =>
  ajaxPromise({
    url: `https://arslan-cross-access-dot-arrivy-sandbox.appspot.com/api/live-track/${company_name}/${task_url}/confirm`,
    type: 'POST',
    data: { time: moment().format() },
    dataType: 'jsonp',
    headers: { 'Content-type': 'application/x-www-form-urlencoded', 'Accept' : 'text/plain', 'X-Auth-Key' : '26be717d-54c7', 'X-Auth-Token' : '7rrunytNoVgpV4qgLZYmH1' },
  });

export const declineTaskSandbox = (company_name, task_url, decline_reason) =>
  ajaxPromise({
    url: `https://arslan-cross-access-dot-arrivy-sandbox.appspot.com/api/live-track/${company_name}/${task_url}/decline`,
    type: 'POST',
    data: { decline_reason, time: moment().format() },
    dataType: 'jsonp',
    headers: { 'Content-type': 'application/x-www-form-urlencoded', 'Accept' : 'text/plain', 'X-Auth-Key' : '26be717d-54c7', 'X-Auth-Token' : '7rrunytNoVgpV4qgLZYmH1' },
  });

export const setNewLiveStatusSandbox = (task_id, status) =>
  ajaxPromise({
    url: `https://arslan-cross-access-dot-arrivy-sandbox.appspot.com/api/live-track/${task_id}/livetaskstatus/new`,
    type: 'POST',
    data: { status },
    dataType: 'jsonp',
    headers: { 'Content-type': 'application/x-www-form-urlencoded', 'Accept' : 'text/plain', 'X-Auth-Key' : '26be717d-54c7', 'X-Auth-Token' : '7rrunytNoVgpV4qgLZYmH1' },
  });

export const getLiveTaskFileAttachmentURLSandbox = (task_id, task_url) =>
  ajaxPromise({
    url: `https://arslan-cross-access-dot-arrivy-sandbox.appspot.com/api/live-track/${task_id}/${task_url}/livetaskstatus/file/upload/url`,
    type: 'GET',
    dataType: 'jsonp',
    headers: { 'Content-type': 'application/x-www-form-urlencoded', 'Accept' : 'text/plain', 'X-Auth-Key' : '26be717d-54c7', 'X-Auth-Token' : '7rrunytNoVgpV4qgLZYmH1' },
  });

export const getAssigneeRatingsSandbox = (task_owner, entity_id) =>
  ajaxPromise({
    url: `https://arslan-cross-access-dot-arrivy-sandbox.appspot.com/api/entities/fetch-ratings/${task_owner}/${entity_id}`,
    type: `GET`,
    dataType: 'jsonp',
    headers: { 'Content-type': 'application/x-www-form-urlencoded', 'Accept' : 'text/plain', 'X-Auth-Key' : '26be717d-54c7', 'X-Auth-Token' : '7rrunytNoVgpV4qgLZYmH1' },
  });
