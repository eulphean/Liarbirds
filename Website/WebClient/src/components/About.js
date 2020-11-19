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
          marginTop: padding.huge
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
      opacity: '0.7',

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

const body="What if birds aren’t real? What if they are drones designed to surveil the everyday population? If this is so, what kind of reality are we living in? And how must we cope up with it? Liarbirds thrust from this inquiry to create an interactive augmented encounter, which modifies one’s space with an active swarm of digital creatures. With their syncopated behaviors, they respond to the users, which affect their movements in space. Consequently, they intend to exist at the intersection of physical and digital space; however, the prevailing circumstances might make them perish.";

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