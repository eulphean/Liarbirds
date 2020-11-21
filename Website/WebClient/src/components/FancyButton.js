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
        width: '55%',
        backgroundColor: color.button,
        fontFamily: fontFamily.slice,
        padding: padding.small,
        borderRadius: '10px',
        borderStyle: 'solid',
        borderWidth: '3px',
        borderColor: color.dark,
        fontSize: fontSize.big,
        marginTop: padding.big,
        letterSpacing: '0.8px',
        lineHeight: padding.big,

        '@media (min-width: 768px)': {  
          fontSize: fontSize.huge,
          marginTop: padding.veryBig,
          lineHeight: padding.veryBig,
          width: '45%'
        },

        '@media (min-width: 1024px)': {
          fontSize: fontSize.veryHuge,
          marginTop: padding.extraBig,
          lineHeight: padding.extraBig,
          width: '40%'
        },

        '@media (min-width: 1200px)': {
          width: '33%'
        }
    },

    pulse: {
      animationName: Radium.keyframes(pulse, 'flash'),
      animationDuration: '2s',
      animationFillMode: 'forwards',
      animationTimingFunction: 'linear',
      animationIterationCount: 'infinite'
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
      <a href={'https://www.instagram.com/ar/2488677321439619/'} target={'_blank'} rel="noopener noreferrer" style={containerStyle}>
          Open with Instagram
      </a>
    );
  }
}

export default Radium(FancyButton);