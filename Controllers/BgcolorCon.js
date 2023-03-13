const Bgcolor = require('../Models/Bgcolor');
const BgcolorfindAll = async () => {
   return await Bgcolor.findAll({
        raw:true,
        attributes:['BgColorId','BgColorName','Status'],
    }).catch(err=>console.log(err));
  };
  const Bgcolorfind = async () => {
    return await Bgcolor.findAll({
         raw:true,
         attributes:['BgColorId','BgColorName','Status'],
         where:{ Status: 1 },
     }).catch(err=>console.log(err));
   };

  
  module.exports = {
    BgcolorfindAll,
    Bgcolorfind,
  
  };