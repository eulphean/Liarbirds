import React from 'react'
import Radium from 'radium'
import Title from './Title.js'
import { color, fontFamily, fontSize, padding } from './CommonStyles.js';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: padding.small
    },

    body: {
        color: color.leafy,
        fontFamily: fontFamily.opensanslight,
        fontSize: fontSize.verySmall,
        textAlign: 'justify',

        '@media (min-width: 600px)': {  
            fontSize: fontSize.small
        },

        '@media (min-width: 900px)': {  
            // no change.
            fontSize: fontSize.big,
        },
        '@media (min-width: 1200px)': {  
          // no change.
          fontSize: fontSize.veryBig,
        }
    }
};

const body="Hello Boids";

class About extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    return (
      <div style={styles.container}>
        <Title>Liarbirds</Title>
      </div>
    );
  }
}

export default Radium(About);