const font = require('../Models/Font');
const FontfindAll = async () => {
   return await font.findAll({
        raw:true,
        attributes:['FontId','FontName','Status'],
    }).catch(err=>console.log(err));
  };
  const Fontfind = async () => {
    return await font.findAll({
         raw:true,
         attributes:['FontId','FontName','Status'],
         where:{ Status: 1 },
     }).catch(err=>console.log(err));
   };
  
  
  module.exports = {
    FontfindAll,
    Fontfind,

  };