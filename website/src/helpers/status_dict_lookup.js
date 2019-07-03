import { STATUS_DICT } from './status_dict';

export const getStatusDetails = (status) => {

  if (STATUS_DICT.hasOwnProperty(status)) {
    return STATUS_DICT[status];
  }

  return {
    label: status,
    color: '#4E4646',
    style: 'notstarted',
    type: status
  };
};
