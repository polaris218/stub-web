import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styles from './image-component.module.scss';
import Lightbox from 'react-images';
import cx from 'classnames';

export default class ImageComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lightBoxIsOpen: false
    };

    this.onCloseLightbox = this.onCloseLightbox.bind(this);
    this.openLightBox = this.openLightBox.bind(this);
  }

  onCloseLightbox() {
    this.setState({
      lightBoxIsOpen: false
    });
  }

  openLightBox() {
    this.setState({
      lightBoxIsOpen: true
    });
  }

  render() {
    return (
      <section id={this.props.data.id} className={styles.imageComponentContainer}>
        {this.props.data && this.props.data.content !== '' &&
          <div>
            <Lightbox
              images={[
                {
                  src: this.props.data.content,
                  caption: this.props.data.title
                }
              ]}
              isOpen={this.state.lightBoxIsOpen}
              onClose={this.onCloseLightbox}
              showThumbnails
            />
            <img onClick={() => this.openLightBox()} className={cx('thumbnail img-responsive img-responsive', styles.imageThumbnail)} src={this.props.data.content} alt="" />
          </div>
        }
      </section>
    );
  }
}

ImageComponent.propTypes = {
  data: PropTypes.object
};
