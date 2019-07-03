import moment from "moment";

export const supportedIntegrationsList = {
  MOVERBASE: {
    integrationInfo: {
      type: "MOVERBASE",
      title: "Moverbase",
      name: "Moverbase",
      urlEndPoint: "moverbase",
      is_group_based: false,
    },
    inputFieldsInfo: [
      {key: "access_token", title: "Access Token"},
    ]
  },
  CURRENT_RMS: {
    integrationInfo: {
      type: "CURRENT_RMS",
      title: "Current RMS",
      name: "Current RMS",
      urlEndPoint: "current_rms",
      is_group_based: false,
      show_template_picker: true,
      templateFieldNamePlaceholder: "Task Type",
      templateDescriptionText: "Associate Current-RMS Opportunity type to Arrivy Templates",
    },
    inputFieldsInfo: [
      {key: "access_token", title: "Access Token"},
      {key: "sub_domain", title: "Sub Domain"},
    ]
  },
  VONIGO: {
    integrationInfo: {
      type: "VONIGO",
      title: "Vonigo",
      name: "Vonigo",
      urlEndPoint: "vonigo",
      is_group_based: true,
      show_template_picker: true,
      show_arrival_window: true,
      templateFieldNamePlaceholder: "Work Order Label",
      templateDescriptionText: "Associate Vonigo Work Order Labels to Arrivy Templates",
    },
    inputFieldsInfo: [
      {key: "user_name", title: "User name"},
      {key: "password", title: "Password", "type": "password"},
      {key: "company", title: "Franchise Name", external_integration_group_name: true},
      {key: "franchise_id", title: "Franchise ID", external_integration_group_id: true},
      {key: "app_version", title: "App Version"},
      {key: "sub_domain_name", title: "Sub Domain"},
    ]
  },
  MOVERS_SUITE: {
    integrationInfo: {
      type: "MOVERS_SUITE",
      title: "MoversSuite",
      name: "MoversSuite",
      urlEndPoint: "movers_suite",
      is_group_based: false
    },
    inputFieldsInfo: [
      {key: "securityToken", title: "Security Token"},
      {key: "branch_id", title: "Branch ID"},
      {key: "service_uri", title: "Service URI"},
    ]
  },
};
export const extractIntegrationInfo = (type, integrationList) => {
  if (integrationList && Array.isArray(integrationList)) {
    for (let i = 0; i < integrationList.length; i++) {
      if (integrationList[i].integration_type && integrationList[i].integration_type === type) {
        return integrationList[i];
      }
    }
  }
  return null;
};

export const getStartDateForForSync = (date, viewType) => {
  const viewTypes = ["day", "week", "month"];
  if (!viewType || !viewTypes.includes(viewType)) {
    return date
  }
  switch (viewType) {
    case "day": {
      return date;
    }
    default: {
      return moment(date).startOf(viewType).format("YYYY-MM-DD");
    }
  }

};
export const getEndDateForForSync = (date, viewType) => {
  const viewTypes = ["day", "week", "month"];
  if (!viewType || !viewTypes.includes(viewType)) {
    return date
  }
  switch (viewType) {
    case "day": {
      return date;
    }
    default: {
      return moment(date).endOf(viewType).format("YYYY-MM-DD");
    }
  }
};
