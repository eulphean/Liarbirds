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

const body="Real bread. Naturally leavened by the wild yeast present all around us in everyday life. Full of whole grain rye, wheat, and cracked wheat berries, all sourced locally from spence farm in Fairbury, Illinois. This is bread the way it was intended to be made, and intended to be consumed. The sourdough process creates a product that is easier on the digestive system, and void of phytic acid (a natural nutrient inhibitor), so that you get the most out of your bread."

class About extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    return (
      <div style={styles.container}>
        <Title>ABOUT</Title>
        <div style={styles.body}>
            {body.toUpperCase()}
        </div>
      </div>
    );
  }
}

export default Radium(About);