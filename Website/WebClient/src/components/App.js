import React from 'react'
import Radium from 'radium'
import { padding } from './CommonStyles';
import About from './About.js'
import World from './World.js'
import FancyButton from './FancyButton.js'
import Posters from './Posters.js'
import Footer from './Footer.js'

const styles = {
  content: {
    position: 'absolute',
    top: '0%',
    zIndex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginLeft: padding.big, 
    marginRight: padding.big,

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

    this.totalRef = React.createRef(); 
    this.worldRef = React.createRef(); 
  }

  render() {
    return (
      <div>
          <World ref={this.worldRef} />
          <div ref={this.totalRef} style={styles.content}>
            <About />
            <FancyButton />
            <Posters />
            <Footer />
          </div>
      </div>
    );
  }

  componentDidMount() {
    setTimeout(() => {
      let totalHeight = this.totalRef.current.scrollHeight; 
      this.worldRef.current.updateRendererHeight(totalHeight);
      console.log(totalHeight);
    }, 200); 
  }

  componentDidUpdate() {
    console.log(this.totalRef.current.scrollHeight);
  }
}

export default Radium(App);