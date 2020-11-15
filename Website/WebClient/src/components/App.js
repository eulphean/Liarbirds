import React from 'react'
import Radium from 'radium'
import { padding } from './CommonStyles';
import About from './About.js'
import World from './World.js'
import FancyButton from './FancyButton.js'
import Posters from './Posters.js'
import Footer from './Footer.js'

const styles = {
  container: {
    marginLeft: padding.big, 
    marginRight: padding.big,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',

    '@media (min-width: 768px)': {  
      marginLeft: padding.veryHuge,
      marginRight: padding.veryHuge
    },

    '@media (min-width: 600px) and (orientation: landscape)': {  
      marginLeft: padding.massive,
      marginRight: padding.massive
    },

    '@media (min-width: 1024px)': {  
      marginLeft: padding.massive,
      marginRight: padding.massive
    }
  }
}



class App extends React.Component {
  constructor(props) {
    super(props);
    this.state={
    };
  }

  render() {
    return (
      <div style={styles.container}>
          <About />
          <FancyButton />
          <Posters />
          <Footer />
      </div>
    );
  }
}

export default Radium(App);