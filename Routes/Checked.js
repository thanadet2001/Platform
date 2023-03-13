var express = require('express');
var router = express.Router();

// database module
var database = require('../config/database');
const { Sequelize } = require('sequelize');
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()) {
        if (req.session.cart){
            if (req.session.summary.totalQuantity > 0) {
                return next();
            }
        }
        res.redirect('/Cart');
    }
    else {
        req.session.inCheckOut = true;
        res.redirect('/SignIn');
    }
        
    // if they aren't redirect them to the home page
    res.redirect('/Checked');
}

router.route('/')
    .get(isLoggedIn,function (req, res, next) {
        req.session.address = {};
        res.redirect('/Checked/Delivery')
    });

router.route('/Delivery')
    .get(isLoggedIn,function (req, res, next) {
        if (req.user.UserStatus == 1) {
            res.redirect('/SellerCenter/');
        }
        req.session.address = {};
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
                                // show addresses
                                var selectQuery = '\
                                SELECT FName,LName,Address,ProvincesNameTh,AmphuresNameTh,TambonsNameTh,zip_code,Tel,AddressId\
                                FROM Address NATURAL JOIN provinces NATURAL JOIN amphures NATURAL JOIN tambons NATURAL JOIN \
                                Users WHERE UserId = ' + req.user.UserId+ '\ and ProvincesId=ProvincesId and TambonsId=TambonsId';
                                
                                database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (rows) {
                                    var province = '\
                                    SELECT *\
                                    FROM Provinces\;'
                                    database.RunQuery(province,Sequelize.QueryTypes.SELECT, function (provinces) {
                                        req.session.address = rows;
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
                                        
                                        req.session.cartSummary = cartSummary;
                                        var contextDict = {
                                            title: 'คะกร้า - ที่อยู่ในหารจัดส่ง',
                                            addresses: rows,
                                            customer: req.user,
                                            Theme:Themes,
                                            cart: req.session.showCart,
                                            Font:Fonts,
                                            summary:cartSummary,
                                            provinces: provinces,
                                            NavMenu:Navmenus,
                                            SetWeb:Settings[0],
                                            Background:Bgcolor[0],
                                            Social:sociallink,
                                        };
                                        res.render('Checked/Delivery', contextDict);
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
                                // if choose from exist address => redirect
                                // if create new add
                                // 1. Open form
                                // 2. Save data
                                // 3. Redirect
    });

router.route('/Delivery/Add/:ProvinceId')
    .get(isLoggedIn, function (req, res) {
        var selectQuery = '\
            SELECT *\
            FROM  Amphures Where ProvinceId='+req.params.ProvinceId;
        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (Amphures) {
            res.send(Amphures);
        });
    });
router.route('/Delivery/Add/:ProvinceId/:AmphureId')
    .get(isLoggedIn, function (req, res) {
        var selectQuery = '\
            SELECT *\
            FROM  Tambons Where AmphureId='+req.params.AmphureId;
        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (Tambons) {
            res.send(Tambons);
        });
    });  
router.route('/Delivery/New')
    .post(isLoggedIn,function (req, res, next) {
        var form = req.body;
        var insertQuery = '\
                INSERT INTO Address\
                VALUES (null,\
                    \'' + form.FName + '\', \
                    \'' + form.LName + '\', \
                    \'' + form.Tel + '\', \
                    \'' + form.Address + '\', \
                    \'' + form.Province + '\', \
                    \'' + form.Amphure + '\', \
                    \'' + form.Tambon + '\', \
                    \'' + req.user.UserId  + '\')';

        database.RunQuery(insertQuery,Sequelize.QueryTypes.INSERT, function (result) {
            console.log(result);
             // show addresses
             const selectAddress = '\
             SELECT FName,LName,Address,ProvincesNameTh,AmphuresNameTh,TambonsNameTh,zip_code,Tel,AddressId\
             FROM Address NATURAL JOIN provinces NATURAL JOIN amphures NATURAL JOIN tambons NATURAL JOIN \
             Users WHERE UserId = ' + req.user.UserId+ '\ and ProvincesId=ProvincesId and TambonsId=TambonsId and AddressId='+result[0].insertId;
             
             database.RunQuery(selectAddress,Sequelize.QueryTypes.SELECT, function (rows) {
                req.session.address = {
                    FName: rows[0].FName,
                    LName: rows[0].LName,
                    Address:rows[0].Address,
                    ProvincesNameTh:rows[0].ProvincesNameTh,
                    AmphuresNameTh:rows[0].AmphuresNameTh,
                    TambonsNameTh:rows[0].TambonsNameTh,
                    zip_code:rows[0].zip_code,
                    Tel:rows[0].Tel,
                    AddressId: rows[0].AddressId,
                    
                };

                res.redirect('/Checked/AcceptOrder');
            });
        });
    });

router.route('/Delivery/:id')
    .post(isLoggedIn,function (req, res, next) {
        var selectQuery = '\
        SELECT FName,LName,Address,ProvincesNameTh,AmphuresNameTh,TambonsNameTh,zip_code,Tel,AddressId\
        FROM Address NATURAL JOIN provinces NATURAL JOIN amphures NATURAL JOIN tambons NATURAL JOIN \
        Users WHERE ProvincesId=ProvincesId and TambonsId=TambonsId and AddressId='+ req.params.id;

        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (rows) {
            req.session.address = rows[0];
            res.redirect('/Checked/AcceptOrder');
        });
    });

router.route('/AcceptOrder')
    .get(isLoggedIn,function (req, res, next) {
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
        var ship=0.00;
        var transport=0;
        var tranship=0;
        for(let pro in showCart){
            var product = "\
                SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
                FROM Products natural join ProductImg natural join Category\
                natural join ProductBrand where ProductId="+showCart[pro].ProductId;
                database.RunQuery(product,Sequelize.QueryTypes.SELECT, function (resproduct) {
                    const Tran="Select * From TranshipBangkok;"
                    database.RunQuery(Tran,Sequelize.QueryTypes.SELECT,(Bangkok)=>{
                        const TranP="SELECT * FROM TranshipProvince;"
                        database.RunQuery(TranP,Sequelize.QueryTypes.SELECT,(Provin)=>{
                            const cost="SELECT * FROM Services;"
                            database.RunQuery(cost,Sequelize.QueryTypes.SELECT,(servi)=>{
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
                                    req.session.address = {};
                                }
                                else{
                                    transport=showCart[pro].productwidth+showCart[pro].productheight+showCart[pro].productlength;
                                    ship+=showCart[pro].productweight*showCart[pro].quantity;
                                    if(req.session.address.ProvincesNameTh=='กรุงเทพมหานคร')
                                        if(transport<=Bangkok[0].TranshportTotal && ship<=Bangkok[0].TransportShip){
                                            tranship+=Bangkok[0].tranship;
                                        }
                                        else if(transport<=Bangkok[1].TranshportTotal && ship<=Bangkok[1].TransportShip){
                                            tranship+=Bangkok[1].tranship;
                                        }
                                        else if(transport<=Bangkok[2].TranshportTotal && ship<=Bangkok[2].TransportShip){
                                            tranship+=Bangkok[2].tranship;
                                        }
                                        else if(transport<=Bangkok[3].TranshportTotal && ship<=Bangkok[3].TransportShip){
                                            tranship+=Bangkok[3].tranship;
                                        }
                                        else if(transport<=Bangkok[4].TranshportTotal && ship<=Bangkok[4].TransportShip){
                                            tranship+=Bangkok[4].tranship;
                                        }
                                        else if(transport<=Bangkok[5].TranshportTotal && ship<=Bangkok[5].TransportShip){
                                            tranship+=Bangkok[5].tranship;
                                        }
                                        else if(transport<=Bangkok[6].TranshportTotal && ship<=Bangkok[6].TransportShip){
                                            tranship+=Bangkok[6].tranship;
                                        }
                                        else if(transport<=Bangkok[7].TranshportTotal && ship<=Bangkok[7].TransportShip){
                                            tranship=+Bangkok[7].tranship;
                                        }
                                        else{
                                            tranship+=Bangkok[8].tranship;
                                        }
                                    else{
                                        if(transport<=Provin[0].TranshportTotal && ship<=Provin[0].TransportShip){
                                            tranship+=Provin[0].tranship;
                                        }
                                        else if(transport<=Provin[1].TranshportTotal && ship<=Provin[1].TransportShip){
                                            tranship+=Provin[1].tranship;
                                        }
                                        else if(transport<=Provin[2].TranshportTotal && ship<=Provin[2].TransportShip){
                                            tranship+=Provin[2].tranship;
                                        }
                                        else if(transport<=Provin[3].TranshportTotal && ship<=Provin[3].TransportShip){
                                            tranship+=Provin[3].tranship;
                                        }
                                        else if(transport<=Provin[4].TranshportTotal && ship<=Provin[4].TransportShip){
                                            tranship+=Provin[4].tranship;
                                        }
                                        else if(transport<=Provin[5].TranshportTotal && ship<=Provin[5].TransportShip){
                                            tranship+=Provin[5].tranship;
                                        }
                                        else if(transport<=Provin[6].TranshportTotal && ship<=Provin[6].TransportShip){
                                            tranship+=Provin[6].tranship;
                                        }
                                        else if(transport<=Provin[7].TranshportTotal && ship<=Provin[7].TransportShip){
                                            tranship=+Provin[7].tranship;
                                        }
                                        else{
                                            tranship+=Provin[8].tranship;
                                        }
                                    }
                                    summary.shipCost=tranship+servi[0].ServicesShip;
                                    summary.total = summary.subTotal
                                    //console.log("size"+transport);
                                    //console.log("weight"+ship);
                                    //console.log(tranship);
                                    //console.log(summary.total);
                                }
                            });
                        });
                    });
                });
        }
        //show current cart
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

                                req.session.cartSummary = cartSummary;
                                //Order
                                var contextDict = {
                                    title: 'Checkout - Review Order',
                                    cart: req.session.showCart,
                                    summary: req.session.cartSummary,
                                    address: req.session.address,
                                    customer: req.user,
                                    Theme:Themes,
                                    Font:Fonts,
                                    NavMenu:Navmenus,
                                    SetWeb:Settings[0],
                                    Background:Bgcolor[0],
                                    Social:sociallink,
                                    ProQuan:req.flash('LimitProduct'),
                                    ShowB:req.flash('ShowButton')
                                };
                               res.render('Checked/Acceptorder', contextDict);
                            });
                        });
                    });
                });
            });
        });
    });

router.route('/RequestOrder')
    .get(isLoggedIn,function (req, res, next) {
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
                        req.session.address = {};
                    }
                    else{
                        req.flash('ShowButton','สั่งซื้อสินค้า');
                    }
                });
        }
        //show current cart
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
                                //Order
                                var contextDict = {
                                    title: 'เช็คเอาท์ - รีวิวออเดอร์',
                                    cart: req.session.showCart,
                                    summary: req.session.cartSummary,
                                    address: req.session.address,
                                    customer: req.user,
                                    Theme:Themes,
                                    Font:Fonts,
                                    NavMenu:Navmenus,
                                    SetWeb:Settings[0],
                                    Background:Bgcolor[0],
                                    Social:sociallink,
                                    ProQuan:req.flash('LimitProduct'),
                                    ShowB:req.flash('ShowButton')
                                };
                                
                                res.render('Checked/Acceptorder', contextDict);
                            });
                        });
                    });
                });
            });
        });
    });

router.route('/ConfirmOrder')
    .get(isLoggedIn,function (req, res, next) {
        if(req.session.cartSummary.total=='undefined'){
            res.redirect('/Cart')
        }
        /*
        var insertQuery = '\
            INSERT INTO orders\
            VALUES(null, ' +
            req.session.address.address_Id + ', ' +
            null + ', ' +
            req.session.cartSummary.total + ', ' +
            null + ', ' +
            new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000).toJSON().slice(0, 19).replace('T', ' ') + ', ' +
            new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000).toJSON().slice(0, 19).replace('T', ' ') + ', ' +
            '0' + ', ' +
            null + ', ' + '\')';
        */
        var insertQuery = '\
            INSERT INTO Orders\
            VALUES(null, ' +
            null+ ', ' +
            req.session.cartSummary.shipCost+ ', ' +
            req.session.cartSummary.total + ', ' +
            null+ ', ' +
            'NOW(),NOW(), ' +
            null+ ', ' +
            req.session.address.AddressId + ',0,'+null + ')';

        database.RunQuery(insertQuery,Sequelize.QueryTypes.INSERT, function (rows) {
            for (var item in req.session.cart) {
                if (req.session.cart[item].quantity > 0) {

                    insertQuery = '\
                        INSERT INTO `OrderLists`\
                        VALUES(' +
                        rows[0].insertId + ', ' +
                        req.session.cart[item].ProductId + ', ' +
                        req.session.cart[item].ProductPrice + ', ' +
                        req.session.cart[item].quantity + ');';
                    database.RunQuery(insertQuery,Sequelize.QueryTypes.INSERT, function (result) {
                        
                    });
                    updateQuery='UPDATE Products\
                        SET ProductQuantity = (ProductQuantity - ' + req.session.cart[item].quantity +
                        ') WHERE ProductId = ' + req.session.cart[item].ProductId;
                    database.RunQuery(updateQuery,Sequelize.QueryTypes.UPDATE, function(result2){
                    });
                }
            }

            //view order

            //get order info
            var selectQuery = "\
            SELECT OrderId,Dropship,NetPrice,FName,LName,AddressId,Address,ProvincesNameTh,AmphuresNameTh,TambonsNameTh,zip_code,\
            Tel,BankSlip,BankSlipDateTime,CreateOrderAt,UpdateOrderAt\
            from Orders\
            natural join Address natural join Provinces\
            natural join Amphures natural join Tambons\
            where ProvincesId=ProvincesId\
            and TambonsId=TambonsId and UserId="+req.user.UserId +" and OrderId="+ rows[0].insertId ;

            database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (order) {
                selectQuery = "\
                SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
                FROM Products natural join (Select OrderId,ProductId,SUM(Price*Quantity) as TotalPrice \
                from OrderLists group by OrderId,ProductId) as Tsum natural join ProductImg natural join Category\
                natural join ProductBrand natural join OrderLists  where  OrderId="+ rows[0].insertId ;
                database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (products) {
                    //get order info
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
                                            req.session.cart = {};
                                            req.session.summary = {
                                                totalQuantity: 0,
                                                subTotal: 0.00,
                                                discount: 0.00,
                                                shipCost: 0.00,
                                                total: 0.00
                                            };
                                            req.session.cartSummary = {};
                                            req.session.showCart = {};
                                            req.session.address = {};

                                            //get order info
                                            var contextDict = {
                                                title: 'ออเดอร์ #' + rows[0].insertId,
                                                customer: req.user,
                                                order: order[0],
                                                products:products,
                                                Theme:Themes,
                                                Font:Fonts,
                                                NavMenu:Navmenus,
                                                SetWeb:Settings[0],
                                                Background:Bgcolor[0],
                                                Social:sociallink,
                                            };
                                            res.render('Checked/ConfirmOrder', contextDict);
                                        });
                                    });
                                });
                            });
                        });
                    });
                });     
            });
        });
    });

module.exports = router;