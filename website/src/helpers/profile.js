import moment from 'moment';

export const isTrialExpire = (profile) => {
  return (profile && profile.is_trail_expired) ? true : false;
};
