import React from 'react'
import Radium from 'radium'

import image from './front_page.jpg'
import { tada } from 'react-animations'
import { color, fontFamily, fontSize, padding } from './CommonStyles.js';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: padding.big,

        '@media (min-width: 768px)': {  
          marginTop: padding.extraBig
        },

        '@media (min-width: 600px) and (orientation: landscape)': {  
          marginTop: padding.huge
        },

        '@media (min-width: 1024px)': {  
          marginTop: padding.veryHuge
        }
    },

    title: {
      fontFamily: fontFamily.demode,
      color: color.dark,
      letterSpacing: '0px',
      fontSize: fontSize.extraHuge,

      '@media (min-width: 768px)': {  
        fontSize: fontSize.insane
      },

      '@media (min-width: 600px) and (orientation: landscape)': {  
        fontSize: fontSize.veryInsane
      },

      '@media (min-width: 1024px)': {  
        fontSize: fontSize.veryInsane
      }
    },

    body: {
      color: color.dark,
      fontFamily: fontFamily.opensanslight,
      fontSize: fontSize.lessSmall,
      textAlign: 'center',
      marginTop: padding.small,

      '@media (min-width: 768px)': {  
        marginTop: padding.big,
        fontSize: fontSize.small
      },

      '@media (min-width: 1024px)': {  
        fontSize: fontSize.big
      }
    },

    img: {
      marginTop: padding.small,
      width: '100%',

      '@media (min-width: 768px)': {  
        marginTop: padding.big
      },

      '@media (min-width: 768px) and (orientation: landscape)': {  
        marginTop: padding.veryBig
      },

      '@media (min-width: 768px)': {  
        marginTop: padding.veryBig
      }
    },

    tada: {
      animationName: Radium.keyframes(tada, 'tada'),
      animationDuration: '10s',
      animationFillMode: 'forwards',
      animationTimingFunction: 'ease-in-out',
      animationIterationCount: '1'
    }
};

const body="We have been at a loss of crowds due to the pandemic. Physical isolation prevails and our entire social exchange has been mediated through a two-dimensional window. Boids of Paradise is an augmented encounter mediated by Instagram that modifies one’s space with a swarm of digital creatures. This crowd of creatures augments the participant’s digital environment and interacts with them by carrying out coordinated behaviors. In the moment of interaction, they become the participant’s companion as well as independent digital creatures that operate at the intersection of space, time, and state.";

class About extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    let titleStyle = [styles.title, styles.tada]; 
    return (
      <div style={styles.container}>
        <div style={titleStyle}>LIARBIRDS</div>
        <div style={styles.body}>{body}</div>
        <img style={styles.img} src={image} alt={'title'} />
      </div>
    );
  }
}

export default Radium(About);