const fs = require('fs');
const path = './frontend/screens';

fs.readdirSync(path).forEach(file => {
  if (file.endsWith('.js')) {
    let content = fs.readFileSync(path + '/' + file, 'utf8');

    // Fix fries_logo to image.png
    content = content.replace(/fries_logo\.png/g, 'image.png');

    // Fix emojis to images
    if (content.includes('🍟')) {
      if (!content.includes('Image,')) {
        content = content.replace(/import {/, 'import { Image, ');
      }
      content = content.replace(/<Text style=\{\{fontSize: 32\}\}>🍟<\/Text>/g, '<Image source={require(\'../assets/image.png\')} style={{width: 32, height: 32}} resizeMode="contain" />');
      content = content.replace(/<Text style=\{\{fontSize: 24\}\}>🍟<\/Text>/g, '<Image source={require(\'../assets/image.png\')} style={{width: 24, height: 24}} resizeMode="contain" />');
    }

    fs.writeFileSync(path + '/' + file, content);
    console.log('Fixed ' + file);
  }
});
