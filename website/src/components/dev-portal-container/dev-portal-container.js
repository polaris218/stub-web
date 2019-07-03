import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './dev-portal-container.module.scss';
import Sidebar from './components/sidebar/sidebar';
import PortalNavbar from './components/navbar/navbar';
import PortalContentContainer from './components/content-container/content-container';

export default class DevPortalContainer extends Component {
  constructor(props) {
    super(props);

    let hideSidebar = false;
    if (window && window.innerWidth < 768) {
      hideSidebar = true;
    }

    this.state = {
      hideSidebar,
      inFocusElement: 'paragraph_component',
      activeDoc: props.activeDoc
    };


    this.toggleSidebar = this.toggleSidebar.bind(this);
    this.updateSidebar = this.updateSidebar.bind(this);
    this.autoHideSidebarOnSmallRes = this.autoHideSidebarOnSmallRes.bind(this);
  }

  componentWillMount() {
    this.autoHideSidebarOnSmallRes();
  }

  componentDidMount() {
    window.addEventListener('resize', (e) => {
      this.autoHideSidebarOnSmallRes();
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', (e) => {
      this.autoHideSidebarOnSmallRes();
    });
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      document.getElementById("developer_portal_container").scrollTop = 0;
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.activeDoc !== this.props.activeDoc) {
      this.setState({
        activeDoc: nextProps.activeDoc
      });
    }
    this.autoHideSidebarOnSmallRes();
  }

  autoHideSidebarOnSmallRes() {
    const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    if (width <= 768) {
      this.setState({
        hideSidebar: true
      });
    } else {
      this.setState({
        hideSidebar: false
      });
    }
  }

  updateSidebar(elID, subItem = false) {
    if (!subItem) {
      this.setState({
        inFocusElement: elID
      });
    } else {
      this.setState({
        inFocusSubElement: elID
      });
    }
  }

  toggleSidebar() {
    const sidebarState = this.state.hideSidebar;
    this.setState({
      hideSidebar: !sidebarState
    });
  }

  render() {
    return (
      <div id="developer_portal_container" className={styles.devPortalContainer}>
        <PortalNavbar
          data={this.props.landingPageData}
          toggleSidebar={this.toggleSidebar}
        />
        <Sidebar
          hideSidebar={this.state.hideSidebar}
          data={this.props.data}
          inFocusSubElement={this.state.inFocusSubElement}
          activeDoc={this.state.activeDoc}
          routeUpdateCallback={this.props.routeUpdateCallback}
          basePath={this.props.basePath}
          developer_api_title={this.props.developer_api_title}
        />
        <PortalContentContainer
          hideSidebar={this.state.hideSidebar}
          basePath={this.props.basePath}
          data={this.props.data}
          updateSidebar={this.updateSidebar}
          activeDoc={this.state.activeDoc}
          developer_api_title={this.props.developer_api_title}
          applicationType={this.props.applicationType}
          handleApplicationTypeChange={this.props.handleApplicationTypeChange}
        />
      </div>
    );
  }
}

DevPortalContainer.propTypes = {
  router: PropTypes.object,
  landingPageData: PropTypes.object,
  data: PropTypes.array
};
