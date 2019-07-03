import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';

export const postWorkerRequest = (worker_request) =>
  ajaxPromise({
    url: 'api/worker_requests/new',
    type: 'POST',
    data: worker_request
  }).catch((error) => {
  error_catch(error);
  });

export const getAllWorkerRequests = ({viewType, startDate, endDate, items_per_page = 100, page = 1, getAjaxCall = null}) => {
  return ajaxPromise({
    url: `api/worker_requests?page=${page}&items_per_page=${items_per_page}&start_date=${startDate}&end_date=${endDate}`,
    type: 'GET',

  }, getAjaxCall).catch((error) => {
    error_catch(error);
  });
};

export const deleteWorkerRequest = (id) =>
  ajaxPromise({
    url: `api/worker_requests/${id}`,
    type: 'DELETE',
  }).catch((error) => {
  error_catch(error);
  });

export const getWorkerRequest = (id) =>
  ajaxPromise({
    url: `api/worker_requests/${id}`,
    type: 'GET',
  }).catch((error) => {
  error_catch(error);
  });


export const updateWorkerRequest = (id, task_ids, number_of_workers_required, time_span_start_datetime, time_span_end_datetime, entity_ids, scheduled_datetime, notification_type) => {
  const data = {};
  if (task_ids || number_of_workers_required || time_span_start_datetime || time_span_end_datetime) {
    data['task_ids'] = task_ids;
    data['number_of_workers_required'] = number_of_workers_required;
    data['time_span_start_datetime'] = time_span_start_datetime;
    data['time_span_end_datetime'] = time_span_end_datetime;
  }
  if (entity_ids === '' || entity_ids) {
    data['entity_ids'] = entity_ids;
  }
  if (id && scheduled_datetime) {
    data['scheduled_datetime'] = scheduled_datetime;
    data['notification_type'] = notification_type;
  }
  return ajaxPromise({
    url: `api/worker_requests/${id}`,
    type: 'PUT',
    data: data
  }).catch((error) => {
    error_catch(error);
  });
};

export const sendWorkerRequest = ({id, task_ids, number_of_workers_required, time_span_start_datetime, time_span_end_datetime, entity_ids, scheduled_datetime, notification_type}) => {
  const data = {};
  if (task_ids || number_of_workers_required || time_span_start_datetime || time_span_end_datetime) {

    data['task_ids'] = task_ids && task_ids.length > 0 ? task_ids.join(',') : task_ids;
    data['number_of_workers_required'] = number_of_workers_required;
    data['time_span_start_datetime'] = time_span_start_datetime;
    data['time_span_end_datetime'] = time_span_end_datetime;
  }
  if (entity_ids === '' || entity_ids) {
    data['entity_ids'] = entity_ids && entity_ids.length > 0 ? entity_ids.join(',') : entity_ids;
  }
  if (id) {
    data['notification_type'] = notification_type;
  }
  data['worker_request_id'] = id;
  return ajaxPromise({
    url: `api/worker_request/send`,
    type: 'POST',
    data: data
  }).catch((error) => {
    error_catch(error);
  });
};

export const fetchWorkerRequestForConfirmation = (entity_url_id, request_date, getAjaxCall = null) => {
  let uri = null;
  if (request_date) {
    uri = `/api/worker_request_confirmation/${entity_url_id}?request_date=${request_date}`;
  } else {
    uri = `/api/worker_request_confirmation/${entity_url_id}`;
  }
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }, getAjaxCall).catch((error) => {
    error_catch(error);
  });
};

export const updateWorkerRequestConfirmation = (entity_url_id, worker_request_confirmation_statuses) => {
  const uri = `/api/worker_request_confirmation/${entity_url_id}`;
  return ajaxPromise({
    url: uri,
    type: 'POST',
    data: { worker_request_confirmation_statuses }
  });
}


