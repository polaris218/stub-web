import React from 'react';
import { Router, Route, Switch, Redirect } from 'react-router-dom';
import history from './configureHistory';
import ScrollToTop from './scroll-top';
import {
  AboutUs,
  AdminTasks,
  AntiSpam,
  Api_info,
  BraintreeAdminSubscriptionList,
  BraintreeAdminTransactionList,
  BraintreePage,
  BookDemo,
  BookDemoAtConference,
  Crew,
  Customer,
  Dashboard,
  Documentation2,
  Equipment,
  ForgotPasswordPage,
  GuidePage,
  Help,
  Landingv2,
  LandingNew4,
  LandingNew5,
  LandingNew6,
  Verification,
  LoginPage,
  MoreReviews,
  OAuth2Consent,
  Pricing,
  Privacy,
  Profile,
  RegisterPage,
  ResetPasswordPage,
  Settings,
  Slack,
  TaskPage,
  Tasks,
  Terms,
  TrackerDemo,
  WhyArrivy,
  Team,
  Landingv2Enterprise,
  Landingv2Moving,
  LiveTrackDemo,
  Reviews,
  Landingv3Moving,
  Landingv4Moving,
  TryFirstPage,
  TrySecondPage,
  TryGetBookPage,
  ErrorPage,
  AuthLogin,
  API,
  LandingNew3,
  Reporting,
  TaskConfirmation,
  DevPortal,
  RHDemo,
  APIRefPortal,
  OurCustomers,
  RHReconciliation,
  ElromcoPage,
  LandingZapier,
	DashboardV2,
  LandingService,
  WorkerRequest,
  WorkerRequestConfirmation,
  Invite,
  LandingMarketing
} from './containers';

import { default as LiveTrackV2 } from './containers/livetrackv2/live-track-v2';
import { default as MilaLiveTrack } from './containers/mila-livetrack/mila-live-track';
import { default as RHLiveTrack } from './containers/rh-livetrack/rh-livetrack';
import {default as CSLiveTrack} from "./containers/cs-livetrack/cs-live-track";

export default function Root() {
  console.log(window.location.href);
  let URL = window.location.href;
    if(URL !== '/login'){
      window.Intercom("boot", {
        app_id: "vfdmrett"
      });
      }
  return (
    <Router history={history}>
      <ScrollToTop>
        <Switch>
          <Redirect from="/docs" to="/api_invite" />
          <Redirect from="/docs/:doc_id" to="/api_invite" />
          <Route exact path="/" component={LandingNew4} />
          <Route exact path="/about_us" component={AboutUs} />
          <Route exact path="/admin_tasks_runner" component={AdminTasks} />
          <Route exact path="/antispam" component={AntiSpam} />
          <Route exact path="/api_info" component={Api_info} />
          <Route exact path="/book-demo" component={BookDemo} />
          <Route exact path="/book_demo" component={BookDemo} />
          <Route exact path="/book-meeting-at-conf" component={BookDemoAtConference} />
          <Route exact path="/dashboard" component={DashboardV2} />
          <Route exact path="/dashboard-old" component={Dashboard} />
          <Route exact path="/customers" component={Customer} />
          <Route exact path="/crew" component={Team} />
          <Route exact path="/demo" component={TrackerDemo} />
          <Route exact path="/docs" component={Documentation2} />
          <Route exact path="/docs/:doc_id" component={Documentation2} />
          <Route exact path="/equipment" component={Equipment} />
          <Route exact path="/help" component={Help} />
          <Route exact path="/login" component={LoginPage} />
          <Route exact path="/verify" component={Verification} />
          <Route exact path="/live/track/mila/:task_url" component={MilaLiveTrack} />
          <Route path="/live/track/rh/:task_url" component={RHLiveTrack} />
          <Route path="/live/track/Restoration%20Hardware/:task_url" component={RHLiveTrack} />
          <Route path="/live/track/Complete%20Solar/:task_url" component={CSLiveTrack} />
          <Route path="/live/track/Complete Solar/:task_url" component={CSLiveTrack} />
          <Route path="/live/track/CS/:task_url" component={CSLiveTrack} />
          <Route exact path="/live/track/:company_name/:task_url" component={LiveTrackV2} />
          <Route exact path="/pricing" component={Pricing} />
          <Route exact path="/privacy" component={Privacy} />
          <Route exact path="/settings" component={Settings} />
          <Route exact path="/settings/:page_id" component={Settings} />
          <Route exact path="/settings/:page_id/:part_id" component={Settings} />
          <Route exact path="/forgot_password" component={ForgotPasswordPage} />
          <Route exact path="/reset_password/:user_id/:signup_token" component={ResetPasswordPage} />
          <Route exact path="/signup" component={RegisterPage} />
          <Route exact path="/slack" component={Slack} />
          <Route exact path="/terms" component={Terms} />
          <Route exact path="/tasks" component={Tasks} />
          <Route exact path="/tasks/:task_id" component={TaskPage} />
          <Route exact path="/oauth2/consent" component={OAuth2Consent} />
          <Route exact path="/transactions" component={BraintreeAdminTransactionList} />
          <Route exact path="/braintree/subscriptions" component={BraintreeAdminSubscriptionList} />
          <Route exact path="/payment_setup" component={BraintreePage} />
          <Route exact path="/guide" component={GuidePage} />
          <Route exact path="/profile/:company_url" component={Profile} />
          <Route exact path="/profile/:company_url/rating/:task_url" component={Profile} />
          <Route exact path="/more_reviews_more_business" component={MoreReviews} />
          <Route exact path="/whyarrivy" component={WhyArrivy} />
          <Route exact path="/enterprise" component={LandingNew5} />
          <Route exact path="/landing-new-3" component={LandingNew3}/>
          <Route exact path="/landing-new-6" component={LandingNew6}/>
          <Route exact path="/moving" component={Landingv4Moving} />
          <Route exact path="/personalized-live-demo/:company_name?/:company_type?/:phone?/:email?/:address?" component={LiveTrackDemo} />
          <Route exact path="/reviews" component={Reviews} />
          <Route exact path="/garage-door-study-sears" component={TryFirstPage} />
          <Route exact path="/delight-your-customers-demo" component={TrySecondPage} />
          <Route exact path="/thesecretsauce" component={TryGetBookPage} />
          <Route exact path="/authlogin" component={AuthLogin} />
          <Route exact path="/api_invite" component={API} />
          <Route exact path="/reporting" component={Reporting} />
          <Route exact path="/reporting/:page_id" component={Reporting} />
          <Route exact path="/task/confirmation/:entity_url_safe_id?" component={TaskConfirmation} />
          <Route exact path="/requests" component={WorkerRequest} />
          <Route exact path="/worker_requests/confirmation/:entity_url_safe_id?" component={WorkerRequestConfirmation} />
          <Route exact path="/developer_portal" component={DevPortal} />
          <Route exact path="/developer_portal/:doc_id" component={DevPortal} />
          <Route exact path="/api_reference" component={APIRefPortal} />
          <Route exact path="/api_reference/:doc_id" component={APIRefPortal} />
          <Route path="/rh_demo" component={RHDemo} />
          <Route exact path="/our-customers" component={OurCustomers} />
          <Route path="/recon" component={RHReconciliation} />
          <Route exact path="/moveboard" component={ElromcoPage} />
          <Route exact path="/zapier" component={LandingZapier} />
          <Route exact path="/service" component={LandingService} />
          <Route exact path="/invite/:invitation_id?" component={Invite} />
          <Route exact path="/go/:company_name?/:video_url?/" component={LandingMarketing} />
          <Route component={ErrorPage} />
        </Switch>
      </ScrollToTop>
    </Router>
  );
}
