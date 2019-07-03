import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import { default as LiveTrackV2 } from './containers/livetrackv2/live-track-v2';

const liveTrack = (element, company_name, task_url) => {
  $.ajax({
    url: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBxzIENIwmRBikHjRwVPaJVMNJ9dcirSZk&libraries=places',
    dataType: 'script',
    cache: true, // otherwise will get fresh copy every page load
    success: function() {
      ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={null} />, element);
    }
  });
};

const liveTrackRating = (element, company_name, task_url) => {
  const sub_component = 'Rating'
  ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={sub_component} />, element);
};

const liveTrackProfile = (element, company_name, task_url) => {
  const sub_component = 'Profile'
  ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={sub_component} />, element);
};

const liveTrackEstimate = (element, company_name, task_url) => {
  const sub_component = 'Estimate'
  ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={sub_component} />, element);
};

const liveTrackReviews = (element, company_name, task_url) => {
  const sub_component = 'Reviews'
  ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={sub_component} />, element);
};

const liveTrackConfirmation = (element, company_name, task_url) => {
  const sub_component = 'Confirmation'
  ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={sub_component} />, element);
};

const liveTrackCrew = (element, company_name, task_url) => {
  const sub_component = 'Crew'
  ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={sub_component} />, element);
};

const liveTrackTaskSchedule = (element, company_name, task_url) => {
  const sub_component = 'TaskSchedule'
  ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={sub_component} />, element);
};

const liveTrackStatusJournal = (element, company_name, task_url) => {
  const sub_component = 'StatusJournal'
  ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={sub_component} />, element);
};

const liveTrackLocationMap = (element, company_name, task_url) => {
  const sub_component = 'LocationMap'
  $.ajax({
    url: 'https://maps.googleapis.com/maps/api/js?key=AIzaSyBxzIENIwmRBikHjRwVPaJVMNJ9dcirSZk&libraries=places',
    dataType: 'script',
    cache: true, // otherwise will get fresh copy every page load
    success: function() {
      ReactDOM.render(<LiveTrackV2 company_name={company_name} task_url={task_url} sub_component={sub_component} />, element);
    }
  });
};

module.exports = {
  'liveTrack': liveTrack,
  'liveTrackRating': liveTrackRating,
  'liveTrackProfile': liveTrackProfile,
  'liveTrackEstimate': liveTrackEstimate,
  'liveTrackReviews': liveTrackReviews,
  'liveTrackConfirmation': liveTrackConfirmation,
  'liveTrackCrew': liveTrackCrew,
  'liveTrackTaskSchedule': liveTrackTaskSchedule,
  'liveTrackStatusJournal': liveTrackStatusJournal,
  'liveTrackLocationMap': liveTrackLocationMap
};
