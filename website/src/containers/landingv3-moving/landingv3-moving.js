import React, { Component } from 'react';
import {
  Landingv2Header,
  LandingNavigationV2,
  Footer2v,
  HowItWorks,
  SharedCalendar,
  Uberize,
  TrackStatus,
  ReviewsPresentation,
  WhitePaper
} from '../../components';

import landingPageDataMoving from '../../landingv2-data.json';
import { Footer3v }  from '../../components/index';

import landingPageData from '../../moving-landingv3.json';

export default class Landingv3Moving extends Component {

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <Landingv2Header data={landingPageData} router={this.context.router}/>
        <LandingNavigationV2 data={landingPageData} />
        <HowItWorks data={landingPageData.howitworks} />
        <SharedCalendar data={landingPageData.shared_calendar} />
        <Uberize data={landingPageData.uberize} />
        <TrackStatus data={landingPageData.track_status} />
        <ReviewsPresentation data={landingPageData.reviews_presentation} />
        <WhitePaper data={landingPageData.white_paper} />
        <Footer3v data={landingPageDataMoving} />
      </div>
    );
  }

}
