import React from 'react'
import Radium from 'radium'

import image from './front_page.jpg'
import { color, fontFamily, fontSize, padding } from './CommonStyles.js';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: padding.big
    },

    title: {
      fontFamily: fontFamily.demode,
      color: color.dark,
      letterSpacing: '0px',
      fontSize: fontSize.extraHuge
    },

    body: {
        color: color.dark,
        fontFamily: fontFamily.opensanslight,
        fontSize: fontSize.lessSmall,
        textAlign: 'center',
        marginTop: padding.small
    },

    img: {
      marginTop: padding.small,
      width: '100%'
    }
};

const body="We have been at a loss of crowds due to the pandemic. Physical isolation prevails and our entire social exchange has been mediated through a two-dimensional window. Boids of Paradise is an augmented encounter mediated by Instagram that modifies one’s space with a swarm of digital creatures. This crowd of creatures augments the participant’s digital environment and interacts with them by carrying out coordinated behaviors. In the moment of interaction, they become the participant’s companion as well as independent digital creatures that operate at the intersection of space, time, and state.";

class About extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    return (
      <div style={styles.container}>
        <div style={styles.title}>LIARBIRDS</div>
        <div style={styles.body}>{body}</div>
        <img style={styles.img} src={image} alt={'title'} />
      </div>
    );
  }
}

export default Radium(About);