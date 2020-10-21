import React from 'react'
import Radium from 'radium'
import { ReactComponent as Leaf } from './leaf.svg'
import { color, fontFamily, fontSize, padding } from './CommonStyles.js';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        margin: padding.extraSmall,
        marginTop: padding.verySmall,
        marginBottom: padding.small,
        width: '100%',
        height: '100%'
    },

    titleContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'center'
    },

    svgContainer: {
        display: 'flex',
        alignItems: 'flex-start',
        width: fontSize.verySmall,
        height: fontSize.verySmall, 

        '@media (min-width: 600px)': {  
            width: fontSize.small,
            height: fontSize.small, 
        },

        '@media (min-width: 900px)': {  
            // // no change.
            width: fontSize.veryBig,
            height: fontSize.veryBig, 
        },
        '@media (min-width: 1200px)': {  
        //   // no change.
            width: fontSize.veryHuge,
            height: fontSize.veryHuge
        }
    },

    svg: {
        fill: color.leafy, 
        width: '100%',
        height: '100%'
    },

    title: {
        fontFamily: fontFamily.opensansregular,
        fontSize: fontSize.small,
        color: color.leafy,
        letterSpacing: '1px',
        marginLeft: padding.big, 

        '@media (min-width: 600px)': {  
            fontSize: fontSize.big
        },

        '@media (min-width: 900px)': {  
            // no change.
            fontSize: fontSize.veryBig,
        },
        '@media (min-width: 1200px)': {  
          // no change.
          fontSize: fontSize.huge,
        }
    },

    priceFont: {
        fontFamily: fontFamily.opensanslight,
        letterSpacing: '0px'
    },

    imgContainer: {
        height: '100%',
        // 3% is to accomodate the margins.
        width: '100%',
    },

    img: {
        marginTop: padding.extraSmall,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignSelf: 'center'
    },

    topSpacing: {
        marginTop: padding.small
    },

    ingredients: {
        marginTop: padding.extraSmall,
        fontFamily: fontFamily.opensanslight,
        fontSize: fontSize.verySmall,
        color: color.leafy, 
        letterSpacing: '0.5px',
        textAlign: 'center',

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


class MenuItem extends React.Component {
  constructor(props) {
    super(props);
    this.state={

    };
  }

  render() {
    let containerStyle = this.props.topMargin ? [styles.container] : styles.container;  
    let priceStyle = [styles.title, styles.priceFont]; 
    return (
      <div style={containerStyle}>
        <div style={styles.titleContainer}>
            <div style={styles.svgContainer}>
                <Leaf style={styles.svg} />
            </div>
            <div style={styles.title}>
                {this.props.title.toUpperCase()}
            </div>
            <div style={priceStyle}>
                {this.props.price}
            </div>
        </div>
        <img style={styles.img} src={this.props.img} alt={this.props.title} />
        <div style={styles.ingredients}>
            {this.props.ingredients}
        </div>
      </div>
    );
  }
}

export default Radium(MenuItem);