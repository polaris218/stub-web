import React, { Component } from "react";
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js'
import Menu from 'react-burger-menu/lib/menus/slide'
import _ from 'lodash'
import moment from 'moment'
import './activity-stream-static-styles.css'
import {Glyphicon, OverlayTrigger, Tooltip} from 'react-bootstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faAngleUp } from '@fortawesome/fontawesome-free-solid';
import { EVENT_DICT } from '../../helpers/event_dict';
import { STATUS_DICT } from "../../helpers/status_dict";
import ActivityStreamActions from '../../actions/activity-stream';

import firebase from './firebase'
import entityLink, {isTask} from './activity-stream-entity-link'

import styles from './activity-stream.module.scss';

const mql = window.matchMedia('(min-width: ' + styles['activity-stream-main-min-width'] + ')');

export default class ActivityStream extends Component {
  constructor(props) {
    super(props);

    this.state = {
      mql: mql,
      open: false,
      is_higher_resolution: false,
      items: []
    };
  }

  componentWillMount() {
    mql.addListener(this.mediaQueryChanged);
    this.setState({mql: mql, is_higher_resolution: mql.matches });
    this._prepareStateHandler()

    if (window.activity_stream) {
      this.setState(window.activity_stream.state)
    } else {
      window.activity_stream = {}
    }
  }

  componentWillUnmount() {
    this.state.mql.removeListener(this.mediaQueryChanged);
  }

  componentDidUpdate() {
    window.activity_stream.state = this.state
  }

  componentDidMount() {
    ActivityStreamActions.getActivities().then(items => {
      items.forEach(this.preprocessMessage)
      this.setState({items, error_history: null})
      this.firebaseLogout = firebase(ActivityStreamActions, this.onMessage, items)
    })
      .catch(e => {
        console.log(e)
        this.setState({error_history: true})
      })
  }

  mediaQueryChanged = () => {
    this.setState({
      mql: mql,
      is_higher_resolution: this.state.mql.matches,
    });
  }

  closeMenu = () => {
    let { open } = this.state
    this._updateGlobalClasses(open)
    this.setState({open: false});
  }

  onMenuStateChange = state => this.setState({open: state.isOpen})

  toggle = () => this.setState({open: true})
  logout = () => {
    if (this.firebaseLogout) {
      return this.firebaseLogout()
    }
    return Promise.resolve()
  }

  _updateGlobalClasses = open => {
    let style1 = ['activity-stream-right-space', 'activity-stream-button-hidden']
    let style2 = ['activity-stream-right-space-mark', 'activity-stream-button-hidden-mark']
    if (open) {
      let styleTmp = style1
      style1 = style2
      style2 = styleTmp
    }

    _.forEach(style1, (it, i) => {
      _.forEach(document.getElementsByClassName(it), it2 => {
        it2.classList.add(style2[i])
        it2.classList.remove(it)
      })
    })
  }
  _prepareStateHandler = count =>
    this.props.onStateChange({
      count,
      toggle: this.toggle,
      logout: this.logout
    })

  setState = state => {
    super.setState(state)
    this._prepareStateHandler(this.state.items.length)
  }

  preprocessMessage = data => {
    if (data.time) {
      data.timems = Number(data.time) * 1000
    }
    if (data.has_attachment) {
      data.has_attachment = String(data.has_attachment).toLowerCase() === 'true'
    }
    return this.state.items.filter(it => it.id == data.id).length == 0
  }

  onMessage = data => {
    if (this.preprocessMessage(data)) {
      if (isTask(data)) {
        PubSub.publish('activity-stream.task', data)
      }
      let items = this.state.items.filter(it => it.id != data.id)
      this.setState({items: [data, ...items]})

    }
  }

  renderItem = it => {
    let renderLink = it => {
      let link = entityLink(it)
      if (link) {
        return <a target="_blank" href={link}>{it.task_title}</a>
      }
      return <span>{it.task_title}</span>
    }
    let priorityImg = null;
    if (it.priority === 'HIGH') {
      priorityImg = "/images/icons/priority-high.png";
    } else if (it.priority === 'URGENT') {
      priorityImg = "/images/icons/priority-urgent.png";
    }
    let source = 'web';
    if (it.source) {
      source = it.source;
    }
    const sourceTooltip = (
      <Tooltip id="tooltip">Posted via {source}</Tooltip>
    );
    const filesTooltip = (
      <Tooltip id="tooltip">Total File(s): {it.files && it.files.length}</Tooltip>
    );
    if (typeof it.files === 'string') {
      it.files = JSON.parse(it.files);
    }
    return (
      <div key={it.id} className={styles['container']}>
        <div className={styles['body-wrapper']}>
          <div className={styles['status']}>
            {it.event_type && (it.event_type === 'TASK_STATUS' ? (it.status_title.toUpperCase() === 'CUSTOM' && !it.from_customer ? STATUS_DICT['TEAM_NOTE'].label :  STATUS_DICT[it.status_title.toUpperCase()] ? STATUS_DICT[it.status_title.toUpperCase()].label : it.status_title) : (EVENT_DICT[it.event_type] ? EVENT_DICT[it.event_type].label : it.event_type))}
            {it.priority && priorityImg && <div className={styles.priorityIcon}><img src={priorityImg} /></div>}
          </div>
          <div className={styles['body']}>
            <div className={styles['title']}>{renderLink(it)}</div>
            <div className={styles['message']}><strong>{it.reporter_name || (it.from_customer ? 'Customer' : 'Crew')}{it.original_message && ':'} </strong>{it.original_message}</div>
            {it.files && typeof it.files === 'object' && <div className={styles.filesContainer}>
              {it.files.map((file) => {
                const fileExtension = file.filename && file.filename.split('.').pop();
                let showPreview = false;
                if (fileExtension && (fileExtension.includes('jpg') || fileExtension.includes('JPG') || fileExtension.includes('JPEG') || fileExtension.includes('jpeg') || fileExtension.includes('png') || fileExtension.includes('PNG') || fileExtension.includes('gif') || fileExtension.includes('GIF') || fileExtension.includes('bimp') || fileExtension.includes('BIMP') || fileExtension.includes('bmp') || fileExtension.includes('BMP'))) {
                  showPreview = true;
                }
                if (showPreview) {
                  return (<img className={styles.imagePreview} src={file.file_path} alt={file.filename}/>)
                }
                return
              })}
            </div>}
            <div className={styles['time-container']}>
              <div className={styles['time']}>{moment(it.timems).format('hh:mm A')}</div>
              {it.files && it.has_attachment && <OverlayTrigger placement="left" overlay={filesTooltip}><i className={styles.iconSource}><Glyphicon glyph="paperclip" /></i></OverlayTrigger>}
              <OverlayTrigger placement="left" overlay={sourceTooltip}><i className={styles.iconSource}><img src={source === 'app' ? "/images/icons/mobile.png" : "/images/icons/web.png"} alt={source} /></i></OverlayTrigger>
            </div>
          </div>
        </div>
      </div>
    )
  }

  render() {
    const { open, is_higher_resolution, items } = this.state;
    this._updateGlobalClasses(open);

    let _items = _.sortBy(items, it => -1 * it.timems)
    _items = _.groupBy(_items,  it => moment(it.timems).format('DD MMM YYYY'))

    let notItemsText = "No activities to show"
    if (this.state.error_history) {
      notItemsText = "Unable to load recent activities please refresh your browser"
    }

    let content =
      <div className={styles['drawer']}>
        <div className={styles['activity-button-container']}>
          <div className={styles['drawer-title-container']}>
            <div className={styles['drawer-title']}>Activities</div>
          </div>
          <div className={styles['activity-icon-container']} onClick={this.closeMenu}>
            <FontAwesomeIcon icon={faAngleUp} />
          </div>
        </div>
        {!(_.size(_items) > 0) && <div className={styles['no-activities']}>{notItemsText}</div>}
        <div className={styles['containers']}>
          {_.map(_items, (value, key) =>
            <div key={key} className={styles['date-container2']}>
              <div className={styles['date-container']}>
                <div className={styles['date']}>{key}</div>,&nbsp;
                <div className={styles['day']}>{moment(value[0].timems).format('ddd')}</div>
              </div>
              {value.map(this.renderItem)}
            </div>
          )}
        </div>
      </div>

    let bmMenuZIndex = 1501
    let bmMenuWrapStyle = {zIndex:bmMenuZIndex}
    return (
      <div className={styles.activityStream}>
        <Menu
          right
          width={ styles['activity-stream-width'] }
          customBurgerIcon={false}
          customCrossIcon={false}
          noOverlay={is_higher_resolution || !open }
          outerContainerId={ "app-container" }
          styles={{ bmMenuWrap:bmMenuWrapStyle, bmOverlay:{ zIndex:bmMenuZIndex } }}
          isOpen={open}
          onStateChange={ this.onMenuStateChange }>
          {content}
        </Menu>
      </div>
    );
  }
}

ActivityStream.contextTypes = {
  onStateChange: PropTypes.object,
  showActivities: PropTypes.bool
};
