import React from 'react'
import Radium from 'radium'

import { pulse } from 'react-animations'
import { color, fontFamily, fontSize, padding } from './CommonStyles.js';


const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'center',
        alignItems: 'center',
        textAlign: 'center',
        color: color.dark,
        width: '50%',
        backgroundColor: color.button,
        fontFamily: fontFamily.slice,
        padding: padding.small,
        borderRadius: '10px',
        fontSize: fontSize.big,
        marginTop: padding.big,
        letterSpacing: '0.8px',
        lineHeight: padding.big
    },

    pulse: {
      animationName: Radium.keyframes(pulse, 'flash'),
      animationDuration: '2s',
      animationFillMode: 'forwards',
      animationTimingFunction: 'linear',
      animationIterationCount: '10'
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