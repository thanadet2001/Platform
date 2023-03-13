const User = require('../Models/Socialmedia');
const SocialMeidafindAll = async () => {
   return await User.findAll({
        raw:true,
        attributes:['SocialMediaId','NameSocialMedia','SrcSocialMeida'],
    }).catch(err=>console.log(err));
  };
 
  module.exports = {
    SocialMeidafindAll,

  };