import ajaxPromise from './ajaxPromise';
import moment from 'moment';
import {error_catch} from '../helpers/error_catch';

export const getAttachmentUploadURL = (task_id) =>
ajaxPromise({
  url: '/api/tasks/'+task_id+'/status/file/upload/url',
  type: 'GET',
}).catch((error) => {
  error_catch(error);
});


export const uploadAttachment = (upload_url, data) =>
ajaxPromise({
  url: upload_url,
  type: 'POST',
  data,
  contentType: false,
  processData: false
}).catch((error) => {
  error_catch(error);
});


export const getTaskFileAttachmentUploadURL = (task_id) =>
ajaxPromise({
  url: '/api/tasks/'+task_id+'/file/upload/url',
  type: 'GET',
}).catch((error) => {
  error_catch(error);
});

export const getAllTaskFiles = (task_id, page, items_per_page) =>
ajaxPromise({
  url: '/api/tasks/'+task_id+'/files',
  type: 'GET',
  data: {page, items_per_page}
}).catch((error) => {
  error_catch(error);
});

export const removeTaskFile = (task_id, file_id) =>
ajaxPromise({
  url: '/api/tasks/'+task_id+'/file/'+file_id+'/delete',
  type: 'DELETE',
}).catch((error) => {
  error_catch(error);
})

export const getTasks = ({ viewType, startDate, endDate, items_per_page = 100, page = 1, unscheduled = false, tasks_with_no_datetime = false, getDataForExtraDaysOnBoundary = true, show_items_with_statuses = false, route_id = null, getAjaxCall = null, group_ids = '', entity_ids = '', resource_ids = '', statuses = '', entity_confirmation_status = '', templates = ''}) => {
  let fSD = moment(startDate);
  let fED = moment(endDate);

  // At times calendar control in the UI shows more days.
  if (viewType === 'month' && getDataForExtraDaysOnBoundary) {
    fSD = fSD.subtract(6, 'd');
    fED = fED.add(6, 'd');
  }


  fSD = fSD.format().replace('+', '%2B');
  fED = fED.format().replace('+', '%2B');

  let internal_route_id = null;
  if (route_id !== null) {
    internal_route_id = route_id;
  } else {
    internal_route_id = '';
  }

  const uri = `/api/tasks?from=${fSD}&to=${fED}&items_per_page=${items_per_page}&page=${page}&unscheduled=${unscheduled}&tasks_with_no_datetime=${tasks_with_no_datetime}&show_items_with_statuses=${show_items_with_statuses}&internal_route_id=${internal_route_id}&group_ids=${group_ids}&entity_ids=${entity_ids}&resource_ids=${resource_ids}&statuses=${statuses}&entity_confirmation_status=${entity_confirmation_status}&templates=${templates}`;

  return ajaxPromise({
    url: uri,
    type: 'GET',
  }, getAjaxCall).catch((error) => {
    error_catch(error);
  });
};

export const getTask = (task_id) => {
  const uri = `/api/tasks/${task_id}`;

  return ajaxPromise({
    url: uri,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};


export const postTask = (task) =>
  ajaxPromise({
    url: '/api/tasks/new',
    type: 'POST',
    data: task
  }).catch((error) => {
  error_catch(error);
  });

export const updateTask = (task) =>
  ajaxPromise({
    url: '/api/tasks/' + task.id,
    type: 'PUT',
    data: task
  }).catch((error) => {
    error_catch(error);
  });

export const deleteTask = (task_id, delete_series = false) =>
  ajaxPromise({
    url: '/api/tasks/' + task_id + (delete_series ? '/series' : ''),
    type: 'DELETE'
  }).catch((error) => {
    error_catch(error);
  });

export const getStatus = (task_id) =>
  ajaxPromise({
    url: '/api/tasks/' + task_id + '/status',
    type: 'GET'
  }).catch((error) => {
  error_catch(error);
  });

export const getRatings = (task_id) =>
  ajaxPromise({
    url: '/api/tasks/' + task_id + '/rating',
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });

export const setNewStatus = ({ task_id, status }) =>
  ajaxPromise({
    url: '/api/tasks/' + task_id + '/status/new',
    type: 'POST',
    data: status
  }).catch((error) => {
    error_catch(error);
  });

export const getEstimate = (task_id) =>
  ajaxPromise({
    url: '/api/tasks/' + task_id + '/estimate',
    type: 'GET',
    data: status
  }).catch((error) => {
    error_catch(error);
  });

export const googleEvents = (startDate, endDate) => {
  const fSD = moment(startDate).format('YYYY-MM-DD');
  const fED = moment(endDate).format('YYYY-MM-DD');

  return (
    ajaxPromise({
      url: `/api/google/events?from=${fSD}&to=${fED}`,
      type: 'GET'
    }).catch((error) => {
      error_catch(error);
    })
  );
};

export const getTaskSeriesSettings = (task_id) => {
  return (
    ajaxPromise({
      url: `/api/tasks/${task_id}/series`,
      type: 'GET'
    }).catch((error) => {
      error_catch(error);
    })
  );
};

export const taskSendNotification = (task_id, data) =>
    ajaxPromise({
      url: '/api/tasks/' + task_id + '/notifications',
      type: 'POST',
      data: JSON.stringify(data)
    }).catch((error) => {
      error_catch(error);
    });

export const getTasksForCustomer = (customer_id, unscheduled = false) => {
  const uri = `/api/tasks?customer_id=${customer_id}&unscheduled=${unscheduled}`;

  return ajaxPromise({
    url: uri,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};

export const deleteStatus = (task_id, status_id) => {
  const uri = `/api/tasks/${task_id}/status/${status_id}`;
  return ajaxPromise({
    url: uri,
    type: 'DELETE'
  }).catch((error) => {
    error_catch(error);
  });
};

export const getPredictedArrival = (task_id) => {
  const uri = `/api/tasks/${task_id}/predict_arrival`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
};

export const fetchTasksForConfirmation = (entity_url_id, date) => {
  let uri = null;
  if (date) {
    uri = `/api/task-confirmation/${entity_url_id}?date=${date}`;
  } else {
    uri = `/api/task-confirmation/${entity_url_id}`;
  }
  return ajaxPromise({
    url: uri,
    type: 'GET'
  });
};

export const updateTaskConfirmation = (entity_url_id, updatedTasks) => {
  const uri = `/api/task-confirmation/${entity_url_id}`;
  return ajaxPromise({
    url: uri,
    type: 'POST',
    data: { task_confirmation_statuses: updatedTasks }
  });
};

export const resendTaskConfirmationNotifications = (entity_id, user_id, date) => {
  const uri = `/api/team_notification/send`;
  return ajaxPromise({
    url: uri,
    type: 'POST',
    data: { entity_id, user_id, date }
  });
};

export const getTaskSummary = (task_id) => {
  const uri = `/api/tasks/${task_id}/task_summary`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  });
};

export const getTaskItemsList = (task_id) => {
  const uri = `/api/tasks/${task_id}/items`;
  return ajaxPromise({
    url: uri,
    type: 'GET'
  }).catch((error) => {
    error_catch(error);
  })
};

export const bulkUpdateTasksEntities = (data) => {
  const uri = `/api/tasks/bulk_update`;
  return ajaxPromise({
    url: uri,
    type: 'PUT',
    data
  }).catch((error) => {
    error_catch(error);
  })
};

export const getAllTaskDocuments = (task_id, page = 1, items_per_page = 100) =>
  ajaxPromise({
    url: '/api/tasks/'+task_id+'/documents',
    type: 'GET',
    data: {page, items_per_page}
  }).catch((error) => {
    error_catch(error);
  });
