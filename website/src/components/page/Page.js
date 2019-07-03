import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class Page extends Component {

  render() {

    return (
      <div>

        I am landing page
        <br/>
        <Link to='/login'>Login</Link>
        <br/>
        <Link to='/signup'>Signup</Link>
      </div>
    );
  }
}

export default Page;
