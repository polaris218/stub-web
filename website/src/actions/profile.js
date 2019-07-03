import ajaxPromise from './ajaxPromise';
import {error_catch} from '../helpers/error_catch';
export const getProfileInformation = () => {
  const baseUrl = '/api/users/profile';
  return ajaxPromise({
    url: baseUrl,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};

export const getCompanyProfileInformation = (detailed_billing_info = false) => {
  let baseUrl = '/api/company/profile';

  if (detailed_billing_info) {
    baseUrl = baseUrl + '?detailed_billing_info=True';
  }

  return ajaxPromise({
    url: baseUrl,
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });
};

export const getImageUrl = () =>
  ajaxPromise({
    url: '/api/users/profile/image/upload/url',
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });

export const updateProfileImage = (upload_url, data) =>
  ajaxPromise({
    url: upload_url,
    type: 'POST',
    data,
    contentType: false,
    processData: false
  }).catch((error) => {
    error_catch(error);
  });

export const removeProfileImage = (image_id) =>
  ajaxPromise({
    url: `/api/users/profile/image/${image_id}`,
    type: 'DELETE'
  }).catch((error) => {
    error_catch(error);
  });

export const updatePlan = (plan_id, plan) =>
  ajaxPromise({
    url: '/api/users/plan',
    type: 'PUT',
    data: { plan_id, plan }
  }).catch((error) => {
  error_catch(error);
  });

export const updateCompanyProfileInformation = ({ address, country, support_email, mobile_number, phone, fullname, intro, details, emergency, company_type, social_links, website, reminder_notification_time, enable_customer_task_confirmation, enable_late_and_no_show_notification, custom_webhook, custom_webhook_authentication_keys, color, pending_review_reminder_attempts, ratings_fetch_URL, ratings_fetch_URL_authentication_keys, enable_team_confirmation, team_confirmation_time, team_confirmation_time_zone, team_confirmation_day, team_confirmation_notification_type, team_confirmation_custom_message, rating_type, timezone, exceptions, task_notifications_settings, samsara_api_settings, status_priority, calendar_week_starts_from, mileage_unit, is_documents_disabled, filters, route_start, can_field_crew_view_contact_info }) =>
  ajaxPromise({
    url: '/api/company/profile',
    type: 'PUT',
    data: { address, country, mobile_number, phone, support_email, fullname, intro, details, emergency, website, company_type, social_links, reminder_notification_time, enable_customer_task_confirmation, enable_late_and_no_show_notification, custom_webhook, custom_webhook_authentication_keys, color, pending_review_reminder_attempts, ratings_fetch_URL, ratings_fetch_URL_authentication_keys, enable_team_confirmation, team_confirmation_time, team_confirmation_time_zone, team_confirmation_day, team_confirmation_notification_type, team_confirmation_custom_message, rating_type, timezone, exceptions, task_notifications_settings, samsara_api_settings, status_priority, calendar_week_starts_from, mileage_unit, is_documents_disabled, filters, route_start, can_field_crew_view_contact_info }
  }).catch((error) => {
    error_catch(error);
  });

export const updateKeys = () =>
  ajaxPromise({
    url: '/api/users/update-auth-keys',
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });

export const getCustomCommunication = () =>
  ajaxPromise({
    url: '/api/users/customizations',
    type: 'GET',
  }).catch((error) => {
    error_catch(error);
  });

export const updateCustomCommunication = ({ confirmation_message_text, review_prompt_text, negative_review_prompt_text }) =>
  ajaxPromise({
    url: '/api/users/customizations',
    type: 'PUT',
    data: { confirmation_message_text, review_prompt_text, negative_review_prompt_text }
  }).catch((error) => {
    error_catch(error);
  });

export const updateUserProfileInformation = (name) =>
  ajaxPromise({
    url: '/api/users/profile',
    type: 'PUT',
    data: {fullname: name}
  }).catch((error) => {
    error_catch(error);
  });

export const getLoggedInUserSettings = () => {
  return ajaxPromise({
    url: '/api/users/settings',
    type: 'GET'
  });
};
