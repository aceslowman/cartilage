const highContrastTextColor = (backgroundColor) => {
    /* https://stackoverflow.com/questions/596216/formula-to-determine-perceived-brightness-of-rgb-color */
    // (0.299*R + 0.587*G + 0.114*B)
  
    // https://stackoverflow.com/questions/10970958/get-a-color-component-from-an-rgb-string-in-javascript
    // assumes backgroundColor is rgb()
    let rgb = backgroundColor.match(/\d+/g);  
    let luminance = (0.299*rgb[0] + 0.587*rgb[1] + 0.114*rgb[2]);
  
    return luminance / 255 > 0.5 ? 'black' : 'white';
  }

  export {highContrastTextColor}