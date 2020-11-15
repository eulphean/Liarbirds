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
        lineHeight: padding.big,

        '@media (min-width: 768px)': {  
            fontSize: fontSize.small
        },

        '@media (min-width: 1024px)': {
            marginTop: padding.veryBig,
            fontSize: fontSize.big,
            lineHeight: padding.veryBig,
            marginBottom: padding.veryBig
        }
    },

    link: {
        color: color.link
    }
};

const amay = 'https://amaykataria.com'; 
const phil = 'https://philipmulliken.com'; 
class Footer extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    return (
        <div style={styles.container}>
            <div style={styles.developed}>
                 Developed by Silkcube
            </div>
            <div>
                <span>©&nbsp;</span>
                <a 
                    style={styles.link} 
                    target='_blank' 
                    rel="noopener noreferrer" 
                    href={amay}>
                    Amay Kataria
                </a>
                <span style={styles.developed}>&nbsp;|&nbsp;</span>
                <a 
                    style={styles.link} 
                    target='_blank' 
                    rel="noopener noreferrer" 
                    href={phil}>
                    Phil Mulliken
                </a>
                <span style={styles.developed}>, 2020&nbsp;</span>
            </div>
        </div>
    );
  }
}

export default Radium(Footer);