import React from 'react'
import Radium from 'radium'

import { color, fontFamily, fontSize, padding } from './CommonStyles.js';

const styles = {
    container: {
        display: 'flex',
        color: color.dark,
        flexDirection: 'column',
        alignSelf: 'center',
        alignItems: 'center',
        backgroundColor: color.button,
        fontFamily: fontFamily.slice,
        padding: padding.small,
        borderRadius: '10px',
        fontSize: fontSize.small,
        marginTop: padding.big,
        letterSpacing: '0.8px'
    }
};

class FancyButton extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    return (
      <a href={'https://www.instagram.com/ar/2488677321439619/'} target={'_blank'} style={styles.container}>
          Open with Instagram
      </a>
    );
  }
}

export default Radium(FancyButton);