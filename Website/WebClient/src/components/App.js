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
    alignItems: 'center'
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
          <About />
          <FancyButton />
          <Posters />
          <Footer />
      </div>
    );
  }
}

export default Radium(App);