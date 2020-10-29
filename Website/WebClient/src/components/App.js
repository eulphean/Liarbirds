import React from 'react'
import Radium from 'radium'
import { fontSize, padding, fontFamily, color } from './CommonStyles';
import About from './About.js'

const styles = {
  container: {
    margin: padding.small,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '@media (min-width: 600px)': {  
      paddingLeft: padding.verybig,
      paddingRight: padding.veryBig
    },

    '@media (min-width: 750px)': {  
      paddingLeft: padding.huge,
      paddingRight: padding.huge
    },

    '@media (min-width: 900px)': {
      marginTop: padding.huge,
      paddingLeft: padding.veryMassive,
      paddingRight: padding.veryMassive
    },

    '@media (min-width: 1200px)' : {
      marginTop: padding.veryHuge,
      paddingLeft: padding.extraMassive,
      paddingRight: padding.extraMassive
    },

    '@media (min-width: 1400px)' : {
      paddingLeft: padding.enormous,
      paddingRight: padding.enormous
    },

    '@media (min-width: 1700px)' : {
      paddingLeft: padding.extraInsane,
      paddingRight: padding.extraInsane
    }
  },

  topLogoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    height: fontSize.extraGaia, 
    '@media (min-width: 600px)': {    
      height: '100px'
    },

    '@media (min-width: 750px)': {  
      height: '108px'
    },
    '@media (min-width: 900px)': {  
      height: '120px'
    },
    '@media (min-width: 1200px)': {  
      height: '140px'
    },
    '@media (min-width: 1400px)': {  
      height: '180px'
    }
  },

  topLogo: {
    width: '100%',
    height: '100%'
  },

  bottomLogoContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: padding.veryBig,
    marginBottom: padding.big,
    height: fontSize.enormous,
        
    '@media (min-width: 600px)': {    
      height: fontSize.extraEnormous
    },

    '@media (min-width: 750px)': {  
      height: fontSize.insane
    },
    '@media (min-width: 900px)': {  
      height: fontSize.veryInsane
    },
    '@media (min-width: 1200px)': {  
      height: fontSize.veryGaia
    },
    '@media (min-width: 1400px)': {  
      height: '92px'
    }
  },

  bottomLogo: {
    width: '100%',
    height: '100%'
  },

  footer: {
    fontFamily: fontFamily.opensanslight,
    fontSize: fontSize.verySmall,
    color: color.leafy,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  link: {
    paddingRight: padding.extraSmall,
    paddingLeft: padding.extraSmall,
    margin: padding.verySmall,
    backgroundColor: color.leafy,
    color: color.beige,
    fontWeight: 'bold',
    fontFamily: fontFamily.din,
  }
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state={
    };
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.title}>
          <About />
          <div style={styles.footer}>{"2020 © Amay Kataria | Phil Mulliken"}</div>
        </div>
      </div>
    );
  }
}

export default Radium(App);
