import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './content-container.module.scss';
import cx from 'classnames';
import BlocksWrapper from '../blocks-wrapper/blocks-wrapper';
import Waypoint from 'react-waypoint';
import { Link } from 'react-router-dom';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import { faHome } from '@fortawesome/fontawesome-free-solid';
import { Row, Col } from 'react-bootstrap';
import SlimFooterDevPortal from '../../../slim-footerv2/slim-footer-dev-portal';
import ApiKeysInfo from '../api-keys-info/api-keys-info';

export default class PortalContentContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activeDoc: props.activeDoc,
    };

    this.elementEnteredInView = this.elementEnteredInView.bind(this);
    this.renderBreadCrumbs = this.renderBreadCrumbs.bind(this);
    this.renderContent = this.renderContent.bind(this);
    this.renderPrevNextNavigation = this.renderPrevNextNavigation.bind(this);
  }

  elementEnteredInView(elID, subitem) {
    this.props.updateSidebar(elID, subitem);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.applicationType === nextProps.applicationType
      && this.state.activeDoc === nextState.activeDoc 
      && this.props.hideSidebar === nextProps.hideSidebar) {
      return false;
    } else {
      return true;
    }
  }


  componentWillReceiveProps(nextProps) {
    if (nextProps.activeDoc !== this.props.activeDoc) {
      this.setState({
        activeDoc: nextProps.activeDoc
      });
    }
  }

  renderPrevNextNavigation() {
    const data = this.props.data;
    const docIndex = this.props.data.findIndex((el) => {
      return el.id === this.state.activeDoc
    });
    return (
      <Row>
        <Col md={6} className="text-left">
          {docIndex > 0 &&
            <Link className={styles.leftLink} to={this.props.basePath +'/' + data[docIndex - 1].id}>
              <span>
                Previous
              </span>
              <span>
                { data[docIndex - 1].title }
              </span>
            </Link>
          }
        </Col>
        <Col md={6} className="text-right">
          {docIndex < (data.length - 1) &&
            <Link className={styles.rightLink} to={this.props.basePath +'/' + data[docIndex + 1].id}>
              <span>
                Next
              </span>
              <span>
                { data[docIndex + 1].title }
              </span>
            </Link>
          }
        </Col>
      </Row>
    );
  }

  renderBreadCrumbs() {
    let docContent = null;
    const docIndex = this.props.data.findIndex((el) => {
      return el.id === this.state.activeDoc
    });
    if (docIndex >= 0) {
      docContent = this.props.data[docIndex];
      return (
        <ul className={styles.breadCrumbsList}>
          <li className={styles.breadCrumbsListLink}>
            <Link to="/"><FontAwesomeIcon icon={faHome} /></Link>
          </li>
          <li className={styles.breadCrumbsListSeperator}>&#62;</li>
          <li className={styles.breadCrumbsListLink}>
            <Link to={this.props.basePath}>{this.props.developer_api_title}</Link>
          </li>
          <li className={styles.breadCrumbsListSeperator}>&#62;</li>
          <li className={cx(styles.breadCrumbsListLink, styles.activeLink)}>
            <Link to={this.props.basePath +'/' + docContent.id}>{docContent.title}</Link>
          </li>
        </ul>
      );
    } else if (docContent === null) {
      return (
        <ul className={styles.breadCrumbsList}>
          <li className={styles.breadCrumbsListLink}>
            <Link to="/"><FontAwesomeIcon icon={faHome} /></Link>
          </li>
          <li className={styles.breadCrumbsListSeperator}>&#62;</li>
          <li className={cx(styles.breadCrumbsListLink, styles.activeLink)}>
            <Link to="/">Developer Portal</Link>
          </li>
        </ul>
      );
    }
  }

  renderContent() {
    const docIndex = this.props.data.findIndex((el) => {
      return el.id === this.state.activeDoc
    });
    if (docIndex >= 0) {
      const data = this.props.data[docIndex];
      const innerContent = data.content.map((componentData, subIndex) => {
        return (<BlocksWrapper
          key={'idx_' + data.id + '.' + subIndex}
          handleApplicationTypeChange={this.props.handleApplicationTypeChange}
          applicationType={this.props.applicationType}
          id={data.id}
          type={componentData.type}
          data={componentData}
          contentId={data.id}
          elementEnteredInView={this.elementEnteredInView}
        />);
      });
      const renderedContentContainer = (
        <div key={'idx_in_' + data.id} id={data.id}>
          <Waypoint
            onEnter={() => this.elementEnteredInView(data.id, false)}
            topOffset="68px"
          />
          {innerContent}
        </div>
      );
      return renderedContentContainer;
    } else {
      return null;
    }
  }

  render() {
    return (
      <div className={cx(styles.content, this.props.hideSidebar && styles.sidebarHidden)}>
        <div className={styles.breadCrumbsContainer}>
          { this.renderBreadCrumbs() }
        </div>
        {/*<div className={styles.apiKeysInfoContainer}>*/}
          {/*<ApiKeysInfo />*/}
        {/*</div>*/}
        <div className={styles.documentContainer}>
          {this.renderContent()}
          <div className={styles.navigationContainer}>
            {this.renderPrevNextNavigation()}
          </div>
          <div className={styles.footerContainer}>
            <SlimFooterDevPortal />
          </div>
        </div>
      </div>
    );
  }
}

PortalContentContainer.propTypes = {
  data: PropTypes.array,
  hideSidebar: PropTypes.bool,
  updateSidebar: PropTypes.func
};
