import React from 'react'
import Radium from 'radium'
import { color, fontFamily, fontSize } from './CommonStyles';

const styles = {
    title: {
        fontFamily: fontFamily.righalftone,
        color: color.leafy,
        letterSpacing: '1.5px',
        fontSize: fontSize.huge,

        '@media (min-width: 600px)': {  
            fontSize: fontSize.veryHuge
        },

        '@media (min-width: 900px)': {  
            // no change.
            fontSize: fontSize.enormous,
        },

        '@media (min-width: 1400px)' : {
            fontSize: fontSize.veryEnormous,
        }
    }
};

class Title extends React.Component {
  constructor(props) {
    super(props);
    this.state={
        
    };
  }

  render() {
    return (
        <div style={styles.title}>
            {this.props.children}
        </div>
    );
  }
}

export default Radium(Title);