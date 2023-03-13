const User = require('../Models/Themescolor');
const ThemescolorfindAll = async () => {
   return await User.findAll({
        raw:true,
        attributes:['ThemesColorId','ThemeColor','Status'],
    }).catch(err=>console.log(err));
  };

  const Themescolorfind = async () => {
    return await User.findAll({
         raw:true,
         attributes:['ThemesColorId','ThemeColor','Status'],
         where:{ Status: 1 },
     }).catch(err=>console.log(err));
   };
   
  
  module.exports = {
    ThemescolorfindAll,
    Themescolorfind,
  };