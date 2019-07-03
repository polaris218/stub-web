import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';
export const getDefaultStatuses = () => {
  const uri = '/api/default-statuses';
  return ajaxPromise({
    url: uri,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
}

export const getTemplates = () => {
  const uri = '/api/templates';
  return ajaxPromise({
    url: uri,
    type: 'GET',
  }).catch((error) => {
  error_catch(error);
  });
}

export const postTemplate = (template) => {
  return ajaxPromise({
    url: '/api/templates/new',
    type: 'POST',
    data: template
  }).catch((error) => {
    error_catch(error);
  });
}

export const deleteTemplate = (templateID) => {
  const uri = `/api/templates/${templateID}`;
  return ajaxPromise({
    url: uri,
    type: 'DELETE'
  }).catch((error) => {
    error_catch(error);
  });
}

export const updateTemplate = (templateID, templateName, templateDescription, templateStatuses, custom_messages, isDefault = false, disable_auto_start_complete, auto_start_delay_time, auto_complete_delay_time, mark_enroute_after_complete, next_task_info, extra_fields, document_ids, color) => {
  const uri = `/api/templates/${templateID}`;
  return ajaxPromise({
    url: uri,
    type: 'PUT',
    data: { 'name' : templateName, 'description' : templateDescription, 'statuses': templateStatuses, 'custom_messages': custom_messages, is_default: isDefault, disable_auto_start_complete, auto_start_delay_time, auto_complete_delay_time, mark_enroute_after_complete, next_task_info, extra_fields, document_ids, color }
  }).catch((error) => {
    error_catch(error);
  });
}
