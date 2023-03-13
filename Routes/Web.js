const {Fontfind} = require('../Controllers/FontCon');
const {Bgcolorfind} = require('../Controllers/BgcolorCon');
const {SettingfindAll} = require('../Controllers/SettingsCon');
const {Themescolorfind} = require('../Controllers/ThemescolorCon');
const {Navigationfind} = require('../Controllers/NavigationCon');
const {SocialMeidafindAll} = require('../Controllers/SocialMediaCon');

class HomePageData {
  constructor(req) {
    this.req = req;
  }

  async getData() {
    const fonts = await Fontfind();
    const Bgcolor = await Bgcolorfind();
    const Settings=await SettingfindAll();
    const Themes=await Themescolorfind();
    const Navmenus=await Navigationfind();
    const sociallink=await SocialMeidafindAll();
    var summary = this.req.session.summary;
    var cartSummary;
    if (summary)
        cartSummary = {
            subTotal: summary.subTotal.toFixed(2),
            discount: summary.discount.toFixed(2),
            shipCost: summary.shipCost.toFixed(2),
            total: summary.total.toFixed(2),
            totalQuantity:summary.totalQuantity
        };
    this.req.session.cartSummary = cartSummary;
    return {
      Font: fonts,
      Theme: Themes,
      Background: Bgcolor[0],
      SetWeb: Settings[0],
      NavMenu: Navmenus,
      Social: sociallink,
      summary:cartSummary,
    };
  }
}
module.exports = HomePageData;