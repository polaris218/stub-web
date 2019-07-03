import ajaxPromise from './ajaxPromise';

export const subscribe = ({ fullname, email, type, phone, details, company }) =>
  ajaxPromise({
    url: '/api/subscribe',
    type: 'POST',
    data: { fullname, email, type, phone, details, company }
  });
