import React, { Component } from 'react';
import PropTypes from 'prop-types';

import styles from './landing-header.module.scss';


class LandingHeader extends Component {
    render() {
    	const headerStyle = {
			backgroundImage: `url(${this.props.image})`
		};

		const componentClassName = `container ${styles['landing-header']}`;
        return (<section className={componentClassName} style={headerStyle}>
        			<div>
	                    <h1 className="text-center">{this.props.header}</h1>
	                    <p className={`text-center ${styles['landing-description']}`}>{this.props.description}</p>
                    </div>
                </section>)
    }
};

LandingHeader.propTypes = {
  header: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string
};

export default LandingHeader;
