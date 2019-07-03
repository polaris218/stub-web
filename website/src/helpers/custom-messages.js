export const customerMessages = (status_type) => {
    if(status_type === 'ENROUTE'){
      return 'Task Status Enroute';
    } else if (status_type === 'NOTSTARTED'){
      return 'Task Create';
    } else if (status_type === 'RESCHEDULED'){
      return 'Task Rescheduled';
    } else if (status_type === 'COMPLETE'){
      return 'Task Status Complete';
    } else if (status_type === 'RECOMMENDED') {
      return 'Task Status Team Message';
    } else if (status_type === 'AUTO_COMPLETE'){
      return 'Task Status Complete';
    } else if (status_type === 'REVIEW_REMINDER'){
      return 'Task Status Review Reminder';
    } else if (status_type === 'CUSTOMER_EXCEPTION'){
      return 'Task Status Customer Exception';
    } else {
      return '';
    }
};

export const getCustomMessageName = (custom_message_list, custom_message_id, status_type) => {
      if (!custom_message_id){
        return customerMessages(status_type);
      }
      const customMessage = custom_message_list.find((custom_message)=>{
        return custom_message.id === custom_message_id || custom_message.default_id === custom_message_id;
      });
      return customMessage ? customMessage.name : customerMessages(status_type);
};
