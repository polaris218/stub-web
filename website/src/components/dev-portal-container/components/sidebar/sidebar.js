import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './sidebar.module.scss';
import cx from 'classnames';
import { HashLink } from 'react-router-hash-link';
import { Link } from 'react-router-dom';

export default class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.renderMenuItems = this.renderMenuItems.bind(this);
    this.renderSubItems = this.renderSubItems.bind(this);
    this.sideNavLinkClicked = this.sideNavLinkClicked.bind(this);
  }

  renderSubItems(item) {
    const content = item.content;
    const subitems = content.map((subItems, index) => {
      if (subItems.visible_in_sidebar) {
        return (
          <li key={'sub_item_idx' + index}>
            <HashLink className={cx(this.props.inFocusSubElement === subItems.id && styles.active)} to={this.props.basePath + '/' + item.id + '#' + subItems.id}>{subItems.title}</HashLink>
          </li>
        );
        }
    });
    return subitems;
  }

  sideNavLinkClicked(doc_id) {
    this.props.routeUpdateCallback(doc_id);
  }

  renderMenuItems() {
    const data = this.props.data;
    const renderedData = data.map((item, index) => {
      return (
        <li key={'menu_item_idx' + index} className={cx(this.props.inFocusElement === item.id && styles.active)}>
          <Link onClick={() => this.sideNavLinkClicked(item.id)} className={cx(this.props.activeDoc === item.id && styles.active)} to={this.props.basePath + '/' + item.id}>{item.title}</Link>
          {item.content.length > 0 && <ol>{this.renderSubItems(item)}</ol>}
        </li>
      );
    });
    return renderedData;
  }


  renderDevPortalText() {
      return (
        <div>
          <h3 className={styles['sidebar-panel-title']} >{this.props.developer_api_title}</h3>
        </div>
      );
  }

  render() {
    return (
      <div className={cx(styles.sidebar, styles.clearfix, this.props.hideSidebar ? styles.hidden : styles.visible)}>
        <div>
          <div className={styles.scrollholder}>
            <div className="scroll">
              <ol className={cx(styles['sidebar-panel'], 'nav')}>
                {this.renderDevPortalText()}
                {this.renderMenuItems()}
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

Sidebar.propTypes = {
  hideSidebar: PropTypes.bool,
  data: PropTypes.array,
  inFocusElement: PropTypes.string,
  inFocusSubElement: PropTypes.string
};
