import React, { Component } from "react"
import PropTypes from 'prop-types';
import styles from './activity-stream.module.scss';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faBell } from '@fortawesome/fontawesome-free-regular';

export default class ActivityStreamButtonV2 extends Component {
	
	render() {
		let { toggle, count } = (this.props.activityStreamStateHandler || {})
		return (
			<div className="activity-stream-button-hidden">
				<div className={styles['activity-button-container-v2'] + ' ' + styles['activity-button-container-cursor']} onClick={toggle}>
					<div className={styles['drawer-title-container-v2']}>
						<FontAwesomeIcon icon={faBell} />
					</div>
					<div className={styles['activity-count-container-v2']}>
						<div className={styles['activity-count']}>{count}</div>
					</div>
				</div>
			</div>
		);
	}
}

ActivityStreamButtonV2.contextTypes = {
	activityStreamStateHandler: PropTypes.object
};
