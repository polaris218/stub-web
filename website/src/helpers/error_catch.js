import history from '../configureHistory';
import {removeAuthFromCookie} from '../helpers/route'

export const error_catch = (error) => {

  if (error.status === 401) {
    localStorage.removeItem('logged_in');
    try {
      localStorage.setItem('logged_out', 'true');
    } catch (e) {
      console.log('LocalStorage Not Available');
      console.log(e);
    }
    if (history.location.pathname !== "/login" || history.location.pathname === '/signup') {
      const page_id = history.location.pathname;
      removeAuthFromCookie();
      history.push({
        pathname: '/login',
        state: {
          nextPathname: page_id
        }
      });
    }
    else {
      throw error;
    }
  }
  else {
    throw error;
  }
};
