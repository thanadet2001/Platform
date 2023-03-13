var express = require('express');
var router = express.Router();

//import database module
var database = require('../Config/Database');
const { Sequelize } = require('sequelize');

router.route('/')
    .all(function (req, res, next) {

        var summary = req.session.summary;
        var cartSummary;
        if (summary)
            cartSummary = {
                subTotal: summary.subTotal.toFixed(2),
                discount: summary.discount.toFixed(2),
                shipCost: summary.shipCost.toFixed(2),
                total: summary.total.toFixed(2),
                totalQuantity:summary.totalQuantity
            };

        var cart = req.session.cart;
        var showCart = [];

        for (var item in cart) {
            var aItem = cart[item];
            if (cart[item].quantity > 0) {
                showCart.push({
                    Image: aItem.productImg,
                    ProductSlug: aItem.ProductSlug,
                    CategorySlug: aItem.CategorySlug,
                    ProductId: aItem.ProductId,
                    CategoryName:aItem.CategoryName,
                    ProductName: aItem.ProductName,
                    ProductQuantity:aItem.ProductQuantity,
                    Description: aItem.Description,
                    ProductPrice: aItem.ProductPrice,
                    quantity: aItem.quantity,
                    productTotal: aItem.productTotal.toFixed(2),
                    productwidth:aItem.Width,
                    productheight:aItem.Height,
                    productlength:aItem.Length,
                    productweight:aItem.Weight,

                });
            }
        }
        req.session.showCart = showCart;
        for(let pro in showCart){
            var product = "\
                SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
                FROM Products natural join ProductImg natural join Category\
                natural join ProductBrand where ProductId="+showCart[pro].ProductId;
                database.RunQuery(product,Sequelize.QueryTypes.SELECT, function (resproduct) {
                    //console.log(showCart[pro].ProductQuantity!=resproduct[0].ProductQuantity);
                    if(resproduct[0].ProductQuantity==0 || showCart[pro].ProductQuantity!=resproduct[0].ProductQuantity || showCart[pro].ProductPrice!=resproduct[0].ProductPrice){
                        req.flash('LimitProduct','จำนวนสินค้าในตะกร้ามีการเปลี่ยนแปลง');
                        req.session.cart={};
                        req.session.summary = {
                            totalQuantity: 0,
                            subTotal: 0.00,
                            discount: 0.00,
                            shipCost: 0.00,
                            total: 0.00
                        };
                        req.session.cartSummary = {};
                        req.session.showCart = {};
                        //console.log(req.session.cartSummary);
                    }
                });
        }
        req.session.cartSummary = cartSummary;
        const selectWebset="SELECT * FROM Settings;"
        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
            const selectSocial="SELECT * FROM SocialMedia;"
            database.RunQuery(selectSocial,Sequelize.QueryTypes.SELECT,(sociallink)=>{
            const sqlBackgroud="SELECT BgColorName FROM BgColor where Status=1;"
                database.RunQuery(sqlBackgroud,Sequelize.QueryTypes.SELECT,(Bgcolor)=>{
                    const sqlTheme='SELECT ThemeColor FROM ThemesColor where Status=1;'
                    database.RunQuery(sqlTheme,Sequelize.QueryTypes.SELECT,(Themes)=>{
                        const sqlFont='SELECT FontName FROM Font where Status=1;'
                        database.RunQuery(sqlFont,Sequelize.QueryTypes.SELECT,(Fonts)=>{
                            const sqlNav='SELECT NavigationType FROM Navigation where Status=1;'
                            database.RunQuery(sqlNav,Sequelize.QueryTypes.SELECT,(Navmenus)=>{
        
                                var contextDict = {
                                    title: 'ตะกร้า',
                                    customer: req.user,
                                    cart: showCart,
                                    summary: cartSummary, 
                                    Theme:Themes,
                                    Font:Fonts,
                                    NavMenu:Navmenus,
                                    SetWeb:Settings[0],
                                    Background:Bgcolor[0],
                                    Social:sociallink,
                                    ProQuan:req.flash('LimitProduct'),
                                    ShowB:req.flash('ShowButton')
                                };
                                res.render('Cart', contextDict);
                            });
                        });
                    });
                });
            });
        });
    });
router.route('/Checked')
    .get((req, res, next)=> {
        var summary = req.session.summary;
        var cartSummary;
        if (summary)
            cartSummary = {
                subTotal: summary.subTotal.toFixed(2),
                discount: summary.discount.toFixed(2),
                shipCost: summary.shipCost.toFixed(2),
                total: summary.total.toFixed(2),
                totalQuantity:summary.totalQuantity
            };
        var cart = req.session.cart;
        var showCart = [];
        for (var item in cart) {
            var aItem = cart[item];
            if (cart[item].quantity > 0) {
                showCart.push({
                    Image: aItem.productImg,
                    ProductSlug: aItem.ProductSlug,
                    CategorySlug: aItem.CategorySlug,
                    ProductId: aItem.ProductId,
                    CategoryName:aItem.CategoryName,
                    ProductName: aItem.ProductName,
                    ProductQuantity:aItem.ProductQuantity,
                    Description: aItem.Description,
                    ProductPrice: aItem.ProductPrice,
                    quantity: aItem.quantity,
                    productTotal: aItem.productTotal.toFixed(2),
                    productwidth:aItem.Width,
                    productheight:aItem.Height,
                    productlength:aItem.Length,
                    productweight:aItem.Weight,
                });
            }
        }
        for(let pro in showCart){
            var product = "\
                SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
                FROM Products natural join ProductImg natural join Category\
                natural join ProductBrand where ProductId="+showCart[pro].ProductId;
                database.RunQuery(product,Sequelize.QueryTypes.SELECT, function (resproduct) {
                    console.log(resproduct);
                    if(resproduct[0].ProductQuantity==0 || showCart[pro].ProductQuantity!=resproduct[0].ProductQuantity|| showCart[pro].ProductPrice!=resproduct[0].ProductPrice){
                        req.flash('LimitProduct','จำนวนสินค้าในตะกร้ามีการเปลี่ยนแปลง');
                        req.session.cart={};
                        req.session.summary = {
                            totalQuantity: 0,
                            subTotal: 0.00,
                            discount: 0.00,
                            shipCost: 0.00,
                            total: 0.00
                        };
                        req.session.cartSummary = {};
                        req.session.showCart = {};
                    }
                    else{
                        req.flash('ShowButton','สั่งซื้อสินค้า');
                    }
                });
        }
        req.session.cartSummary = cartSummary;
        const selectWebset="SELECT * FROM Settings;"
        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
            const selectSocial="SELECT * FROM SocialMedia;"
            database.RunQuery(selectSocial,Sequelize.QueryTypes.SELECT,(sociallink)=>{
            const sqlBackgroud="SELECT BgColorName FROM BgColor where Status=1;"
                database.RunQuery(sqlBackgroud,Sequelize.QueryTypes.SELECT,(Bgcolor)=>{
                    const sqlTheme='SELECT ThemeColor FROM ThemesColor where Status=1;'
                    database.RunQuery(sqlTheme,Sequelize.QueryTypes.SELECT,(Themes)=>{
                        const sqlFont='SELECT FontName FROM Font where Status=1;'
                        database.RunQuery(sqlFont,Sequelize.QueryTypes.SELECT,(Fonts)=>{
                            const sqlNav='SELECT NavigationType FROM Navigation where Status=1;'
                            database.RunQuery(sqlNav,Sequelize.QueryTypes.SELECT,(Navmenus)=>{
        
                                var contextDict = {
                                    title: 'ตะกร้า',
                                    customer: req.user,
                                    cart: showCart,
                                    summary: cartSummary, 
                                    Theme:Themes,
                                    Font:Fonts,
                                    NavMenu:Navmenus,
                                    SetWeb:Settings[0],
                                    Background:Bgcolor[0],
                                    Social:sociallink,
                                    ProQuan:req.flash('LimitProduct'),
                                    ShowB:req.flash('ShowButton')
                                };
                                res.render('Cart', contextDict);
                            });
                        });
                    });
                });
            });
        });
    });
router.route('/:id/update')
    .post(function (req, res, next) {
        var cart = req.session.cart;
        var ship=0.00;
        var transport=0;
        var newQuantity = parseInt(req.body[req.params.id]);
        for (var item in cart) {
            if (cart[item].ProductId == req.params.id) {
                var diff = newQuantity - cart[item].quantity;
                if (diff != 0) {
                    var summary = req.session.summary;
                    summary.totalQuantity += diff;
                    summary.subTotal = summary.subTotal + cart[item].ProductPrice * diff;
                    summary.total = summary.total + cart[item].ProductPrice * diff;
                    cart[item].productTotal = cart[item].productTotal + cart[item].ProductPrice * diff;
                    cart[item].quantity = newQuantity;
                }
            }
        }

        res.redirect('/Cart');
    });

router.route('/:id/delete')
    .post(function (req, res, next) {
        var cart = req.session.cart;
        var summary = req.session.summary;

        summary.totalQuantity -= cart[req.params.id].quantity;
        cart[req.params.id].quantity = 0;
        summary.subTotal = summary.subTotal - cart[req.params.id].productTotal;
        summary.total = summary.total - cart[req.params.id].productTotal;
        cart[req.params.id].productTotal = 0;
        res.redirect('/Cart');
    });

router.route('/:id/add')
    .post(function (req, res, next) {
        req.session.cart = req.session.cart ||{
            
        };
        var cart = req.session.cart;
        req.session.summary = req.session.summary || {
                totalQuantity: 0,
                subTotal: 0.00,
                discount: 0.00,
                shipCost: 0.00,
                total: 0.00
            };
        var summary = req.session.summary;

        var selectQuery = "\
        SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
        FROM Products natural join ProductImg natural join Category\
        natural join ProductBrand where ProductId="+req.params.id;

        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (rows) {
            var plusPrice = 0.00;
            var inputQuantity = parseInt(req.body.quantity);
            //console.log(inputQuantity);
            if (cart[req.params.id]) {
                if (inputQuantity) {
                    cart[req.params.id].quantity += inputQuantity;
                    plusPrice = cart[req.params.id].ProductPrice * inputQuantity;
                    cart[req.params.id].productTotal += plusPrice;
                    summary.subTotal += plusPrice;
                    summary.totalQuantity += inputQuantity;
                }
                else {
                    if(cart[req.params.id].quantity+1>rows[0].ProductQuantity ){
                        //req.flash('LimitProduct','สินค้าเกิน');
                    }
                    else{
                        cart[req.params.id].quantity++;
                        plusPrice = cart[req.params.id].ProductPrice;
                        cart[req.params.id].productTotal += plusPrice;
                        summary.subTotal += plusPrice;
                        summary.totalQuantity++;
                    }
                }
            }
            else {
                cart[req.params.id] = rows[0];

                if (req.body.quantity) {
                    cart[req.params.id].quantity = inputQuantity;
                    plusPrice = cart[req.params.id].ProductPrice * inputQuantity;
                    cart[req.params.id].productTotal = plusPrice;
                    summary.totalQuantity += inputQuantity;
                }
                else {
                    rows[0].quantity = 1;
                    plusPrice = cart[req.params.id].ProductPrice;
                    cart[req.params.id].productTotal = plusPrice;
                    summary.subTotal += plusPrice;
                    summary.totalQuantity++;
                }
            }
            summary.total = summary.subTotal;

            res.redirect('/Cart');
        });
    });


module.exports = router;