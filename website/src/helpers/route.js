import qs from 'qs';
import { Cookies } from 'react-cookie';

export const routeToLogin = (location, router) => {
  localStorage.removeItem('logged_in');
  try {
    localStorage.setItem('logged_out', 'true');
  } catch (e) {
    console.log('LocalStorage Not Available');
    console.log(e);
  }
  let rd = '';
  if (location) {
    if (location.pathname || location.search) {
      rd =  location.pathname + location.search;
    }
  }

  router.replace({
    pathname: '/login',
    state : { nextPathname: rd }
  });
};

export const parseQueryParams = (location) => {
  const query = qs.parse(location, {
    ignoreQueryPrefix: true
  });
  return query;
};

export const removeAuthFromCookie = () => {
  let cookies = new Cookies();
  if (cookies && cookies.get('auth')){
    cookies.remove('auth');
  }
};
