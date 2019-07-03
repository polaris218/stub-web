export const generateSingleLineAddress = (task) => {
  let address = '';
  if (task.customer_address_line_1) {
    address = address + task.customer_address_line_1;
  }

  if (task.customer_address_line_2) {
    address = address + " " + task.customer_address_line_2;
  }

  if (task.customer_city) {
    address = address + " " + task.customer_city;
  }

  if (task.customer_state) {
    address = address + " " + task.customer_state;
  }

  if (task.customer_zipcode) {
    address = address + " " + task.customer_zipcode;
  }

  return address;
};

export const getCustomerName = (customer_first_name, customer_last_name) => {
  let customer_name = "";

  if (customer_first_name) {
    customer_name = customer_first_name.charAt(0).toUpperCase() + customer_first_name.slice(1).toLowerCase();
  }

  if (customer_last_name) {
    customer_name = customer_name + " " + customer_last_name.charAt(0).toUpperCase() + ".";
  }

  if (customer_name.length > 14) {
    customer_name = customer_name.substring(0, 14) + '...';
  }

  return customer_name;
};

export const getErrorMessage = (error, default_error_text = 'Something went wrong. This operation cannot be completed.') => {
  if (error.description) {
    return error.description;
  }
  return default_error_text;
};

export const compareEntities = (firstTaskEntities, secondTaskEntities) => {
  if (!firstTaskEntities || !secondTaskEntities)
    return false;
  if (firstTaskEntities.length !== secondTaskEntities.length)
    return false;
  for (let i = 0; i < firstTaskEntities.length; i++) {
    if (secondTaskEntities.indexOf(firstTaskEntities[i]) === -1) {
      return false;
    }
  }
  return true;
};

export const makeTaskGroups = (tasks) => {
  const taskGroups = [];
  let singleGroup = [];
  if (!tasks)
    return [];
  for (let i = 0; i < tasks.length; i++) {
    singleGroup.push(tasks[i]);
    for (let j = i + 1; j < tasks.length; j++) {
      if (compareEntities(tasks[i].entity_ids, tasks[j].entity_ids)) {
        singleGroup.push(tasks[j]);
        tasks.splice(j, 1);
        j--;
      }
    }
    taskGroups.push(singleGroup);
    singleGroup = [];
  }
  return taskGroups;
};

export const makeTaskGroupsUsingRouteId = (tasks) => {
  const taskGroups = [];
  let singleGroup = [];
  if (!tasks)
    return [];
  let routeID = null;
  for (let i = 0; i < tasks.length; i++) {
    singleGroup.push(tasks[i]);
    routeID = tasks[i].route_id;
    for (let j = i + 1; j < tasks.length; j++) {
      if (tasks[j].route_id === routeID) {
        singleGroup.push(tasks[j]);
        tasks.splice(j, 1);
        j--;
      }
    }
    taskGroups.push(singleGroup);
    singleGroup = [];
  }
  return taskGroups;
};