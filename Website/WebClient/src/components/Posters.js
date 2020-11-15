import React from 'react'
import Radium from 'radium'

import postcard_back from './postcard_back.jpg'
import hyde_park from './hyde_park.jpg'
import { padding } from './CommonStyles.js';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignSelf: 'center',
        justifyContent: 'center',
        marginTop: padding.big,
        width: '100%',
        height: '100%'
    },

    poster: {
        width: 'calc(100%/2 - 4%)',
        height: '100%',
        marginRight: padding.verySmall
    }
};

class Posters extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    return (
      <div style={styles.container}>
          <img style={styles.poster} src={postcard_back} alt={'postcard_back'} />
          <img style={styles.poster} src={hyde_park} alt={'hyde_park'} />
      </div>
    );
  }
}

export default Radium(Posters);

/// Contains the two containers side by side.