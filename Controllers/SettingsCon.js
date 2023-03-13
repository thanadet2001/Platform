const User = require('../Models/Settings');
const SettingfindAll = async () => {
   return await User.findAll({
        raw:true,
        attributes:['SettingId','LogoWeb','WebName','WebAddress','WebTel','WebEmail'],
    }).catch(err=>console.log(err));
  };
  
 
  
  module.exports = {
    SettingfindAll,
  };