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
        fontWeight: '20px',

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
      fontFamily: fontFamily.opensans,
      fontSize: fontSize.lessSmall,
      textAlign: 'center',
      marginTop: padding.small,

      '@media (min-width: 768px)': {  
        marginTop: padding.veryBig,
        fontSize: fontSize.small
      },

      '@media (min-width: 1024px)': {  
        fontSize: fontSize.big
      }
    },

    link: {
      color: color.link
    },

    img: {
      marginTop: padding.small,
      width: '100%',
      opacity: '0.75',

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

const apple = "https://apps.apple.com/us/app/instagram/id389801252";
const android = "https://play.google.com/store/apps/details?id=com.instagram.android&hl=en_US&gl=US"; 
const hydePark = "https://hydeparkart.org"; 
const birds = "https://www.instagram.com/birdsarentreal"; 

const bodyA="Birds aren't real."
const bodyB = <span>There's an instagram <a href={birds} target='_blank' rel="noopener noreferrer" style={styles.link}>community</a> of the same name with over 280 thousand followers. The claim is that birds, and Pigeons in particular, are in fact drones designed by the United States government to surveil the population. This is, of course, a parody of a much more serious situation."</span>;
const bodyC = "The Internet allows for communities to be formed around fringe ideas, which then permeate culture. This can be productive as well as vile; we now see a good few ractionary conspiracy theories being taken seriously.";
const bodyD = "Birds aren't real";
const bodyE = "is a parody of conspiracy theory culture, one so complete that it can easily be mistaken for genuine."; 
const bodyF = "Liarbirds";
const bodyG = "is a play on this cultural phenomenon by making fake birds real. It fills the space with an active swarm of digital creatures that respond to user gestures. Consequently, Liarbirds exist in both physical and digital space."; 
const bodyH = <span>Liarbirds is commissioned by <a href={hydePark} target='_blank' rel="noopener noreferrer" style={styles.link}>Hyde Park Art Center</a> in Chicago and is developed and published within Instagram’s augmented reality ecosystem. To use it you'll need Instagram, which can be downloaded</span>;
const bodyI = <span> here for <a href={apple} target='_blank' rel="noopener noreferrer" style={styles.link}>Apple</a> and <a href={android} target='_blank' rel="noopener noreferrer" style={styles.link}>Android</a> devices.</span>; 


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
        <div style={styles.body}>
          <i>&quot;{bodyA}&quot;</i>&nbsp;&nbsp;{bodyB}&nbsp;<br/><br/>
          {bodyC}<i>&nbsp;&quot;{bodyD}&quot;&nbsp;&nbsp;</i>
          {bodyE}
          <i>&nbsp;&quot;{bodyF}&quot;&nbsp;&nbsp;</i>
          {bodyG}<br/><br/>
          {bodyH}
          {bodyI}
        </div>
        <img style={styles.img} src={image} alt={'title'} />
      </div>
    );
  }
}

export default Radium(About);