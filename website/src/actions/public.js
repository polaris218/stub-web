import ajaxPromise from './ajaxPromise';

export const getPublicProfile = company_url =>
  ajaxPromise({
    url: `/api/public/${company_url}/profile`,
    type: 'GET',
  });

export const getPublicRatings = (company_url, items_per_page = 500, page = 1) =>
  ajaxPromise({
    url: `/api/public/${company_url}/ratings`,
    type: 'GET',
    data: { items_per_page, page }
  });

export const getPublicTaskRating = (company_url, task_url) =>
  ajaxPromise({
    url: `/api/public/${company_url}/${task_url}/rating`,
    type: 'GET',
  });