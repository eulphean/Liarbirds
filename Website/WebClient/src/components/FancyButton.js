import React from 'react'
import Radium from 'radium'

import { pulse } from 'react-animations'
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
    },

    pulse: {
      animationName: Radium.keyframes(pulse, 'pulse'),
      animationDuration: '10s',
      animationFillMode: 'forwards',
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: '5'
    }
};

class FancyButton extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    let containerStyle = [styles.container, styles.pulse]; 
    return (
      <a href={'https://www.instagram.com/ar/2488677321439619/'} target={'_blank'} style={containerStyle}>
          Open with Instagram
      </a>
    );
  }
}

export default Radium(FancyButton);