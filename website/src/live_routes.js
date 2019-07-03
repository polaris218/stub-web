import React from 'react';
import { Router, Route, Switch } from 'react-router-dom';
import history from './configureHistory';

import { default as MilaLiveTrack } from './containers/mila-livetrack/mila-live-track';
import { default as LiveTrackV2 } from './containers/livetrackv2/live-track-v2';
import { default as RHLiveTrack } from './containers/rh-livetrack/rh-livetrack';
import { default as CSLiveTrack } from './containers/cs-livetrack/cs-live-track';

export default function Root() {
  return (
    <Router history={history}>
      <Switch>
        <Route path="/live/track/mila/:task_url" component={MilaLiveTrack} />
        <Route path="/live/track/rh/:task_url" component={RHLiveTrack} />
        <Route path="/live/track/Restoration%20Hardware/:task_url" component={RHLiveTrack} />
        <Route path="/live/track/Restoration Hardware/:task_url" component={RHLiveTrack} />
        <Route path="/live/track/rh/:task_url" component={RHLiveTrack} />
        <Route path="/live/track/Complete%20Solar/:task_url" component={CSLiveTrack} />
        <Route path="/live/track/Complete Solar/:task_url" component={CSLiveTrack} />
        <Route path="/live/track/CS/:task_url" component={CSLiveTrack} />
        <Route path="/live/track/:company_name/:task_url" component={LiveTrackV2} />
      </Switch>
    </Router>
  );
}
