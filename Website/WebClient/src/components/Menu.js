import React from 'react'
import Radium from 'radium'
import Title from './Title.js'
import { padding } from './CommonStyles.js';
import MenuItem from './MenuItem.js'
import sourdough from './sourdough.jpg'
import rye from './rye.jpg'
import bird from './bird.jpg'

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'center',
        alignItems: 'center',
        marginTop: padding.small
    },

    items: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center'
    },
};

const sdough="bread flour, water, whole wheat flour, whole rye flour, cracked rye berries, salt";
const ry="whole rye flour, water, whole wheat flour, sunflower seeds, cracked rye berries, salt";
const brd="rolled oats, water, pumpkin seeds, sunflower seeds, sesame seeds, flax seeds, olive oil, maple syrup, oat flour, psyllium husk, salt";


class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    return (
      <div style={styles.container}>
        <Title>MENU</Title>
        <div style={styles.items}>
            <MenuItem key={'A'} img={sourdough} title={'Country Sourdough'} price={'$10'} ingredients={sdough} />
            <MenuItem key={'B'} img={rye} topMargin={true} title={'Sunflower Rye'} price={'$12'} ingredients={ry} />
            <MenuItem key={'C'} img={bird} topMargin={true} title={'"BIRD" Bread (Gluten Free)'} price={'$15'} ingredients={brd} />
        </div>
      </div>
    );
  }
}

export default Radium(Menu);