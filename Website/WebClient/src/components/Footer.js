import React from 'react'
import Radium from 'radium'

import { color, fontFamily, fontSize, padding } from './CommonStyles.js';

const styles = {
    container: {
        fontFamily: fontFamily.din,
        fontSize: fontSize.lessSmall,
        color: color.dark,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: padding.big,
        marginBottom: padding.verySmall,
        lineHeight: padding.small,

        '@media (min-width: 768px)': {  
            fontSize: fontSize.small
        },

        '@media (min-width: 1024px)': {
            marginTop: padding.veryBig,
            fontSize: fontSize.small,
            lineHeight: padding.big,
            marginBottom: padding.small
        }
    },
    
    link: {
        color: color.link
    }
};

const amay = 'https://amaykataria.com'; 
const phil = 'https://philipmulliken.com';
const silkcube = 'https://instagram.com/silkcube'; 
class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    return (
        <div style={styles.container}>
            <div>Developed by <a href={silkcube} target='_blank' rel="noopener noreferrer" style={styles.link}>Silkcube</a></div>
            <div>
                <span>©&nbsp;</span>
                <a 
                    style={styles.link} 
                    target='_blank' 
                    rel="noopener noreferrer" 
                    href={amay}>
                    Amay Kataria
                </a>
                <span>&nbsp;|&nbsp;</span>
                <a 
                    style={styles.link} 
                    target='_blank' 
                    rel="noopener noreferrer" 
                    href={phil}>
                    Philip Mulliken
                </a>
                <span>, 2020&nbsp;</span>
            </div>
        </div>
    );
  }
}

export default Radium(Footer);