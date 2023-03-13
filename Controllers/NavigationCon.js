const User = require('../Models/Navigation');
const NavigationfindAll = async () => {
   return await User.findAll({
        raw:true,
        attributes:['NavigationId','NavigationType','Status'],
    }).catch(err=>console.log(err));
  };

  const Navigationfind = async () => {
    return await User.findAll({
         raw:true,
         attributes:['NavigationId','NavigationType','Status'],
         where:{ Status: 1 },
     }).catch(err=>console.log(err));
   };
  
  module.exports = {
    NavigationfindAll,
    Navigationfind,

  };