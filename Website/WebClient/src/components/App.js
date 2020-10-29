import React from 'react'
import Radium from 'radium'
import { fontSize, padding, fontFamily, color } from './CommonStyles';
import About from './About.js'
import World from './World.js'

const styles = {
  container: {
    margin: padding.small,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  footer: {
    fontFamily: fontFamily.opensanslight,
    fontSize: fontSize.verySmall,
    color: color.leafy,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
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
          <World />
          <div style={styles.footer}>{"2020 © Amay Kataria | Phil Mulliken"}</div>
        </div>
      </div>
    );
  }
}

export default Radium(App);
