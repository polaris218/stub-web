import React, { Component } from 'react';
import PropTypes from 'prop-types';

import CompanyProfile from '../../components/live-track-main/components/company-profile';
import EstimateWidget from '../../components/live-track-main/components/estimate-widget';
import LiveStatus from '../../components/live-track-main/components/live-status';
import RatingsView from '../../components/ratings-view/ratings-view';
import styles from './live-track-demo.module.scss';
/*import Sound from 'react-sound';*/
import { Grid, Row, Col } from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faPlayCircle, faChevronCircleLeft, faChevronCircleRight } from '@fortawesome/fontawesome-free-solid';
import cx from 'classnames';
import Joyride from 'react-joyride';
//import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import moment from 'moment';
import config from "../../config/config";

const env = config(self).env;
String.prototype.replaceAll = function(str1, str2, ignore)
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

export default class LiveTrackDemo extends Component {
  constructor(props) {
    super(props);
    // to load static data in json file based on company_type parameter passed through the URL
      let company_type = '';
      if(typeof this.props.match.params.company_type !== 'undefined') {
        company_type = this.props.match.params.company_type.toUpperCase();

        if (this.props.match.params.company_type.toUpperCase() === 'MOVING') {
          this.demoData = require('./data/livetrack-moving-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'SERVICE') {
          this.demoData = require('./data/livetrack-service-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'CONSTRUCTIONS') {
          this.demoData = require('./data/livetrack-construction-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'BAKERY') {
          this.demoData = require('./data/livetrack-bakery-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'EDIBLE') {
          this.demoData = require('./data/livetrack-edible-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'RH') {
          this.demoData = require('./data/livetrack-rh-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'MACYS') {
          this.demoData = require('./data/livetrack-macys-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'DISH') {
          this.demoData = require('./data/livetrack-dish-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'HDSUPPLY') {
          this.demoData = require('./data/livetrack-hdsupply-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'BESTBUY') {
          this.demoData = require('./data/livetrack-bestbuy-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'EVENT') {
          this.demoData = require('./data/livetrack-event-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'SHREDDING') {
          this.demoData = require('./data/livetrack-shredding-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'STAGING') {
          this.demoData = require('./data/livetrack-staging-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'JUNK REMOVAL' || this.props.match.params.company_type.toUpperCase() === 'JUNKREMOVAL') {
          this.demoData = require('./data/livetrack-junk-removal-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'LAUNDRY') {
          this.demoData = require('./data/livetrack-laundry-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'LAWN' || this.props.match.params.company_type.toUpperCase() === 'LAWNCARE') {
          this.demoData = require('./data/livetrack-lawn-care-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'HVAC') {
          this.demoData = require('./data/livetrack-heating-and-ventilation-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'AUTOREPAIR' || this.props.match.params.company_type.toUpperCase() === 'MOBILEAUTOREPAIR') {
          this.demoData = require('./data/livetrack-mobile-auto-repair-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'SOLAR') {
          this.demoData = require('./data/livetrack-solar-data.json');
        } else if (this.props.match.params.company_type.toUpperCase() === 'PEST') {
          this.demoData = require('./data/livetrack-pest-data.json');
        }else {
          this.demoData = require('./data/livetrack-moving-data.json');
        }
      } else {
        this.demoData = require('./data/livetrack-moving-data.json');
      }

    this.demoData = this.replaceContents(this.demoData);

    this.state = {
      showData : true,
      contentIsLoading: false,
      dataObj : this.demoData[0],
      playSound: true,
      joyrideType: 'continuous',
      ready: false,
      steps: [],
      company_type
    };

    this.propagateArrayForward = this.propagateArrayForward.bind(this);
    this.propagateArrayBackwards = this.propagateArrayBackwards.bind(this);
    this.replaceContents = this.replaceContents.bind(this);
    this.soundAlert = this.soundAlert.bind(this);
    this.callback = this.callback.bind(this);
    this.counter = 0;
  }

  replaceContents(originalContents) {
    let originalString = JSON.stringify(originalContents);
    const company_name = this.props.match.params.company_name || "Motivated Movers";
    originalString = originalString.replaceAll('{{company_name}}', company_name);
    originalString = originalString.replaceAll('"time:":""', '"time":"'+ moment.utc().format() +'"');
    originalString = originalString.replaceAll('{{time}}', ''+ moment.utc().format());
    return JSON.parse(originalString);
  }

  componentDidMount() {
    if(env !== 'Dev') {
      window.Intercom("boot", {
        app_id: "vfdmrett"
      });
    }

    //TODO: Put company name from props here
    window.Intercom("update", {
      "demo_company_name": this.props.match.params.company_name || "Motivated Movers"
    });
  }

  soundAlert() {

    if (!this.state.playSound) {
      return null;
    }

    return (
      <Sound
        url="/images/ping.mp3"
        playStatus={Sound.status.PLAYING}
        autoLoad={true}
        autoPlay={true}
      />
    );
  }

  callback(type) {
    if (type.action === 'next' && type.type == "step:after") {
      this.propagateArrayForward();
    }
  }

  propagateArrayForward() {

    if (!window.DEBUG) {
      const dataLayer = window.dataLayer = window.dataLayer || [];
      const step = 'Step_' + this.counter;
      dataLayer.push({
        'event':'Step', 'Category': 'Personalized Demo', 'SubCategory': this.state.company_type, 'Action': 'Navigate', 'Label': step, 'ButtonType': this.counter === 0 ? 'Start' : 'Next'
      });
    }

    if (this.counter < this.demoData.length-1) {
      this.setState({
        playSound: this.demoData[this.counter].muteSound ? false : true,
      });

      this.counter++;

      const steps = this.demoData[this.counter].data.steps;

      // if (steps) {
      //   steps.push({});
      // }

      this.setState({
        dataObj : this.demoData[this.counter],
        steps
      });
    }
    this.joyride.reset(true);
    this.joyride.start(true);
  }

  propagateArrayBackwards() {
    if (this.counter < this.demoData.length-1) {
      this.setState({
        playSound: this.demoData[this.counter].muteSound ? false : true
      });

      this.counter--;

      this.setState({
        dataObj : this.demoData[this.counter],
        steps: this.demoData[this.counter].data.steps
      });
    }
    this.joyride.reset(true);
    this.joyride.start(true);
  }


  navButtonClicked(link) {
    if (link == '/book-demo') {
      if (!window.DEBUG) {
        const dataLayer = window.dataLayer = window.dataLayer || [];
        dataLayer.push({
          'event':'Step', 'Category': 'Personalized Demo', 'SubCategory': this.state.company_type, 'Action': 'Navigate', 'Label': 'Finish', 'ButtonType': 'Book-Demo'
        });
      }
    } else if (link == '/signup') {
      if (!window.DEBUG) {
        const dataLayer = window.dataLayer = window.dataLayer || [];
        dataLayer.push({
          'event':'Step', 'Category': 'Personalized Demo', 'SubCategory': this.state.company_type, 'Action': 'Navigate', 'Label': 'Finish', 'ButtonType': 'SignUp'
        });
      }
    }

    window.location = link;
  }

  render() {
    const task = this.state.dataObj.data.task;
    const entities = this.state.dataObj.data.entities;
    const rating = this.state.dataObj.data.rating;
    const status = this.state.dataObj.data.status;
    const profile = {
      'fullname': this.props.match.params.company_name || this.state.dataObj.company.name,                      // If no information is provided in the URL the default
      'address': this.props.match.params.address || this.state.dataObj.company.address,                         // information passed here will poopuplate the view for
      'mobile_number': this.props.match.params.phone || this.state.dataObj.company.phone,                              // correct demo.
      'support_email': this.props.match.params.email   || this.state.dataObj.company.email,
      'image_path': this.state.dataObj.company.image_path,
    };

    let topbarMessage = '';
    let supportingMessage = '';
    let { button1, button2, navigationButtons } = '';
    if (typeof this.state.dataObj.topbar !== 'undefined') {
      if (this.counter === 0) {
        let company_name = this.props.match.params.company_name;

        if (company_name && company_name.toLowerCase() === 'your company') {
          company_name = 'to Arrivy Demo';
        }

        topbarMessage = ('Welcome ' + (company_name || 'Motivated Movers') + '');
      } else {
        topbarMessage = this.state.dataObj.topbar.message;

        if (topbarMessage.toLowerCase() === 'thanks your company for taking a look') {
          topbarMessage = 'Thanks for taking a look';
        }
      }
      supportingMessage = this.state.dataObj.topbar.submessage;
      if (this.state.dataObj.topbar.button1) {
        button1 = (<a onClick={()=> this.navButtonClicked(this.state.dataObj.topbar.button1_link)}>{this.state.dataObj.topbar.button1}</a>);
      }
      if (this.state.dataObj.topbar.button2) {
        button2 = (<a onClick={()=> this.navButtonClicked(this.state.dataObj.topbar.button2_link)}>{this.state.dataObj.topbar.button2}</a>);
      }
    }

    let existingReviews = null;
    if (rating && rating.length > 0)  {
      existingReviews = (<div className={styles['rating-section']}>
        <Grid>
          <RatingsView ratings={ rating !== null && rating !== 'undefined' && rating } task={ task } hideActions />
        </Grid>
      </div>);
    }

    const demoInProgress = true;
    if (this.counter > 0 && this.counter < this.demoData.length - 1) {
      navigationButtons = (
        <Col lg={4} md={4} sm={12} className={styles.navigationButtonsContainer}>
          <button className={styles.startBtn} style={{backgroundColor: 'transparent'}} onClick={ () => this.propagateArrayBackwards() }><FontAwesomeIcon icon={faChevronCircleLeft} /> Prev</button>
          <button className={styles.startBtn} onClick={ () => this.propagateArrayForward() }>Next <FontAwesomeIcon icon={faChevronCircleRight} /></button>
        </Col>
      );
    }

    return (
      <div className={styles.liveTrackDemoContainer}>
        <Joyride
          autostart={true}
          ref={c => (this.joyride = c)}
          debug={false}
          steps={this.state.steps}
          type={this.state.joyrideType}
          showOverlay={this.state.joyrideOverlay}
          callback={this.callback}
          locale={{
            back: (<span>Back</span>),
            close: (<span>Next</span>),
            last: (<span>Next</span>),
            next: (<span>Next</span>),
            skip: (<span>Skip</span>)
          }} />
        <div className={styles.topBar}>
          <img src="/images/usecases/arrivy_curvy_logo.png" alt="Arrivy" />
          <img src="/images/demo/logo_trans.png" alt="Arrivy" />
          <Grid className={styles.customWidthGrid} bsClass="container">
            <Row>
              {this.counter < this.demoData.length-1 &&
              <Col lg={8} md={8} sm={12} xs={12}>
                <div className={styles.messagesContainer}>
                  {topbarMessage}
                </div>
              </Col>
              }
              {this.counter === this.demoData.length-1 &&
              <Col lg={8} md={8} sm={12} xs={12} className={cx('text-center', styles.lastMessageContainer)}>
                <div className={styles.messagesContainer}>
                  {topbarMessage}
                </div>
              </Col>
              }
              {this.counter === 0 &&
              <Col sm={12} lg={4} md={4} className={styles.navigationButtonsContainer}>
                <button className={styles.startBtn} onClick={ () => this.propagateArrayForward() }><FontAwesomeIcon icon={faPlayCircle} /> Start</button>
              </Col>
              }
              {navigationButtons}
              <Col sm={12} lg={4} md={4} className={cx(styles.actions, styles.navigationButtonsContainer)}>
                {button1}{button2}
              </Col>
            </Row>
          </Grid>
        </div>
          <div className={styles.liveTrackContentContainer}>
            <CSSTransitionGroup
              transitionName="slide"
              className={styles.sub_container}
              transitionEnterTimeout={500}>
            {this.state.dataObj.type === 'image' &&
              <div key={'obj-' + this.counter} className={styles.liveTrackContentOverlay}>
                <div className={styles.featuresContainer}>
                  <img src={this.state.dataObj.data.image_url} alt="" className="img-responsive" />
                </div>
              </div>
            }
            {this.state.dataObj.type === 'text' &&
              <div key={'obj-' + this.counter} className={styles.liveTrackContentOverlay}>
                <div className={styles.featuresContainer}>
                  {this.state.dataObj.data.main_text && <h1 dangerouslySetInnerHTML={{__html: this.state.dataObj.data.main_text}}></h1>}
                  <h3></h3>
                </div>
              </div>
            }
            {this.state.dataObj.type === 'text_image' &&
              <div key={'obj-' + this.counter} className={styles.liveTrackContentOverlay}>
                <div className={styles.featuresContainerWithTextnImage}>
                  <div style={{ height: '100%' }} className={styles.headingContainer}>
                    {this.state.dataObj.data.main_text && <h1 className={styles.heading_text} dangerouslySetInnerHTML={{__html: this.state.dataObj.data.main_text}}></h1>}
                  </div>
                  <div style={{ height: '100%' }}>
                    <img src={this.state.dataObj.data.image_url} style={{'object-position':'bottom'}} alt="" className="img-responsive" />
                  </div>
                </div>
              </div>
            }
            {this.state.dataObj.type === 'two_images' &&
              <div key={'obj-' + this.counter} className={styles.liveTrackContentOverlay}>
                <div className={styles.featuresContainer}>
                  <div style={{ height: '100%' }}>
                    <img src={this.state.dataObj.data.image_url_left} alt="" className="img-responsive" />
                  </div>
                  <div style={{ height: '100%' }}>
                    <img src={this.state.dataObj.data.image_url_right} style={{'object-position':'bottom'}} alt="" className="img-responsive" />
                  </div>
                </div>
              </div>
            }
            {this.state.dataObj.dark_overlay &&
              <div className={styles.liveTrackContentOverlay}>
                {this.state.dataObj.dark_overlay_text && <p>{this.state.dataObj.dark_overlay_text}</p>}
              </div>
            }
            {this.state.dataObj.type === 'live-track' &&
            <div className={styles['entity-manager']}>
              {this.state.showData &&
              <div id="testingList">
                <CompanyProfile profile={ profile }/>
                { existingReviews }
                <div id="taskSection">
                  <EstimateWidget estimate={ this.state.dataObj.estimate } status={ this.state.dataObj.data.status }/>
                  <LiveStatus estimate={ this.state.dataObj.estimate } entities={ entities } task={ task } status={ status } showOnlyDemo={ demoInProgress } />
                </div>
              </div>
              }
            </div>
            }
            </CSSTransitionGroup>
          </div>
      </div>
    );
  }
}

LiveTrackDemo.propTypes = {
  params: PropTypes.object,
};
