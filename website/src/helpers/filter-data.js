export const getFilterIcon = (filterName) => {
  if (filterName === 'ASSIGNEE') {
    return '/images/task-list/user.svg';
  } else if (filterName === 'ADDRESS') {
    return '/images/task-list/pin.svg';
  } else if (filterName === 'INSTRUCTIONS') {
    return '/images/task-list/chat_bubble.svg';
  } else if (filterName === 'EQUIPMENT' || filterName === 'STATUS' || filterName === 'SOURCE' || filterName === 'CREATION_DATE' || filterName === 'TIME') {
    return '/images/task-list/clock.svg';
  } else if (filterName === 'TASK_TITLE_AND_CUSTOMER') {
    return '/images/task-list/label.svg';
  }
  return '';
};

export const getFilterLabel = (filterName) => {
  if (filterName === 'ASSIGNEE') {
    return 'Assignee';
  } else if (filterName === 'ADDRESS') {
    return 'Address';
  } else if (filterName === 'INSTRUCTIONS') {
    return 'Instruction';
  } else if (filterName === 'TIME') {
    return 'Time';
  } else if (filterName === 'TASK_TITLE_AND_CUSTOMER') {
    return 'Task Title and Customer';
  } else if (filterName === 'EQUIPMENT') {
    return 'Equipment';
  } else if (filterName === 'STATUS') {
    return 'Status';
  } else if (filterName === 'SOURCE') {
    return 'Source';
  } else if (filterName === 'CREATION_DATE') {
    return 'Creation Date';
  }
  return filterName && filterName.replace('_', ' ');
};
