var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');

// database module
var database = require('../Config/Database');
const { Sequelize } = require('sequelize');
const HomePageData = require('../Routes/Web');
const multer = require('multer');
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'Public/Img/Slip')
    },
    filename:(req,file,cb)=>{
        const mimeExtendsion={
            'image/jpeg':'.jpeg',
            'image/jpg':'.jpg',
            'image/png':'.png'
        }
        cb(null,file.fieldname+'-'+Date.now()+mimeExtendsion[file.mimetype]);
    }
});
const UploadSlip=multer({
    storage:storage,
    fileFilter:(req,file,cb)=>{
        if(file.mimetype==='image/jpeg' ||
        file.mimetype==='image/jpg'||
        file.mimetype==='image/png'){
            cb(null,true);
        }else{
            cb(null,false);
        }
    }

});
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated()){
        if (req.user.UserStatus == 1) {
            res.redirect('/SellerCenter/');
        }
        else {
            return next();
        }
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}

router.route('/')
    .get(isLoggedIn,(req, res,next)=> {
        res.redirect('/AccUser/' + req.user.Username+'/');
    });

router.route('/:Username')
    .get(isLoggedIn, async function (req, res) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
            contextDict.title= req.user.Username;
            contextDict.customer= req.user;
                res.render('Profile/Profile', contextDict);
        }  catch (err) {
          console.log(err);
          }           
    });

router.route('/:Username/Edit')
    .get(isLoggedIn, async function (req, res) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
            contextDict.title= 'EditInformation';
            contextDict.customer= req.user;
            res.render('Profile/EditProfile', contextDict);
        }  catch (err) {
            console.log(err);
          }     
    })
    .post(isLoggedIn,async function (req, res) {
        try {
        const homePageData = new HomePageData(req);
        const contextDict = await homePageData.getData();
        var form = req.body;
        if (bcrypt.compareSync(form.password, req.user.Password)) {
            var selectQuery = 'SELECT *\
                FROM Users\
                WHERE Email = \'' + form.email + '\'';
            database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (emailRows) {
            if (emailRows.length > 0) {
                req.flash('Email', 'อีเมลนี้ถูกใช้ไปแล้วไม่สามารถใช้ซ้ำได้');
                    contextDict.title= 'EditInformation';
                    contextDict.customer= req.user;
                    contextDict.Email=req.flash('Email');
                    res.render('Profile/EditProfile', contextDict);
            }else{
                var updateQuery = '\
                UPDATE Users\
                SET Email = \'' + form.email + '\' \
                WHERE UserId= ' + req.user.UserId;
                database.RunQuery(updateQuery,Sequelize.QueryTypes.UPDATE, function (result) {
                    res.redirect('/AccUser/' + req.user.Username+'/');
                });
            }
            });
        }
        else {
            //password wrong
            req.flash('Password', 'รหัสผ่านของท่านไม่ถูกต้อง');
            contextDict.CheckedPass= req.flash('Password');
            contextDict.title= 'EditInformation';
            contextDict.customer= req.user;
            res.render('Profile/EditProfile',contextDict);
        }

    }catch (err) {
        console.log(err);
    }     
});

router.route('/:Username/Repassword')
    .post(isLoggedIn,async function (req, res) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
            var form = req.body;
      
                if (form.newPassword == form.repeatPassword) {
                    if (bcrypt.compareSync(form.currentPassword, req.user.Password)) {
                        var passwordHash = bcrypt.hashSync(form.newPassword, null, null);
                        var updateQuery = '\
                        UPDATE Users\
                        SET Password = \'' + passwordHash + '\' \
                        WHERE UserId = ' + req.user.UserId;

                        database.RunQuery(updateQuery,Sequelize.QueryTypes.UPDATE,  function (result) {
                            res.redirect('/AccUser/' + req.user.Username);

                        });
                    }
                    else {
                        //password wrong
                        req.flash('Password', 'รหัสผ่านเดิมของท่านไม่ถูกต้อง กรุณากรอกใหม่');
                        contextDict.CheckedPass= req.flash('Password');
                        contextDict.title= 'EditPassword';
                        contextDict.customer= req.user;
                        res.render('Profile/Profile',contextDict);

                    }
                }
                else {
                    //passwords are not matched
                    req.flash('Password', 'รหัสผ่านใหม่ของท่านไม่ตรงกัน');
                    contextDict.CheckedPass= req.flash('Password');
                    contextDict.title= 'EditPassword';
                    contextDict.customer= req.user;
                    res.render('Profile/Profile',contextDict );

                }
                           
            }catch (err) {
                console.log(err);
            }        
    });

router.route('/:Username/Orders')
    .get(isLoggedIn,async function (req, res, next) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
            const SelectProduct = "\
            SELECT *,DATE_FORMAT(Orders.BankSlipDateTime,'%d-%m-%Y') as DateSlip,DATE_FORMAT(Orders.CreateOrderAt,'%d-%m-%Y') as Date FROM Orders  natural join Address where UserId="+req.user.UserId+" order by OrderId DESC;"
            database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
                const selectAcBanks="SELECT * FROM AccountBanks natural join Banks;"
                database.RunQuery(selectAcBanks,Sequelize.QueryTypes.SELECT,(Bank)=>{
                    contextDict.title="แสดงรายการสินค้า";
                    contextDict.customer= req.user;
                    contextDict.Order= showdata;
                    contextDict.Banks= Bank;
                    res.render('Profile/Orders',contextDict);
                                        
                });
            });
        }catch (err) {
            console.log(err);
            next(err);
        }  
    });

router.route('/:Username/Orders/:id')
    .get(isLoggedIn,async function (req, res, next) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
                const SelectOrder = "\
                    SELECT OrderId,Dropship,NetPrice,FName,LName,AddressId,Address,ProvincesNameTh,AmphuresNameTh,TambonsNameTh,zip_code,\
                    Tel,BankSlip,BankSlipDateTime,CreateOrderAt,UpdateOrderAt\
                    from Orders\
                    natural join Address natural join Provinces\
                    natural join Amphures natural join Tambons\
                    where ProvincesId=ProvincesId\
                    and TambonsId=TambonsId and OrderId="+req.params.id;
                database.RunQuery(SelectOrder,Sequelize.QueryTypes.SELECT,(order)=>{
                    const selectProductOrder="\
                    SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
                        FROM Products natural join (Select OrderId,ProductId,SUM(Price*Quantity) as TotalPrice \
                        from OrderLists group by OrderId,ProductId) as Tsum natural join ProductImg natural join Category\
                        natural join ProductBrand natural join OrderLists where  OrderId="+req.params.id;
                    database.RunQuery(selectProductOrder,Sequelize.QueryTypes.SELECT,(products)=>{
                        contextDict.title="หมายเลขคำสั่งซื้อ#"+req.params.id;
                        contextDict.Admin=req.user;
                        contextDict.order= order[0];
                        contextDict.products=products;
                        res.render('Profile/ConfirmOrder', contextDict);
                    });
                });
        }catch (err) {
            console.log(err);
            next(err);
        }  
    });

                        

router.route('/:Username/Orders/:OrderId/Confirm')
    .post(isLoggedIn,UploadSlip.single("Slip"), function (req, res) {
        var form=req.body;
        const img=req.file;
        //console.log(form.DateSlip);
        var upDateOrders = '\
            UPDATE Orders \
            SET OrdersStatus =\'' + 1 + '\', \
             UpdateOrderAt= NOW(),\
             BankSlipDateTime= DATE_FORMAT('+"'"+form.DateSlip+"'"+',"%Y-%m-%d %T"),\
             BankSlip =\'' +img.filename + '\', \
             AccountBankId=\'' + form.BankId + '\' \
            WHERE OrderId = ' + req.params.OrderId;
            database.RunQuery(upDateOrders,Sequelize.QueryTypes.UPDATE, function (Row){
                res.redirect('/AccUser/'+req.user.Username+'/Orders');
            });
    });

router.route('/:Username/Orders/:OrderId/Cancle')
    .post(isLoggedIn, function (req,res){
        var upDateOrders = "\
            UPDATE Orders SET OrdersStatus =4, UpdateOrderAt= NOW() WHERE OrderId = "+ req.params.OrderId;
            database.RunQuery(upDateOrders,Sequelize.QueryTypes.UPDATE, function (Row){
                console.log(Row);
                var Selectorder= "\
                    SELECT * FROM OrderLists natural join Products\
                    WHERE OrderId = " + req.params.OrderId;
                    database.RunQuery(Selectorder,Sequelize.QueryTypes.SELECT, function (rows) {
                        for (var item in rows) {
                            updateQuery='UPDATE Products\
                                SET ProductQuantity = (ProductQuantity + ' + rows[item].Quantity  +
                                ') WHERE ProductId = ' + rows[item].ProductId;
                            database.RunQuery(updateQuery,Sequelize.QueryTypes.UPDATE, function(result2){
                        });
                    }
                    res.redirect('/AccUser/'+req.user.Username+'/Orders');
                });
            });
    });

router.route('/:Username/Addresses')
    .get(isLoggedIn,async function (req, res) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
            var selectQuery = '\
                SELECT Username,FName,LName,Address,ProvincesNameTh,AmphuresNameTh,TambonsNameTh,zip_code,Tel,AddressId\
                FROM Address NATURAL JOIN provinces NATURAL JOIN amphures NATURAL JOIN tambons NATURAL JOIN \
                Users WHERE UserId = ' + req.user.UserId+ '\ and ProvincesId=ProvincesId and TambonsId=TambonsId';
            database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (addresses) {
                contextDict.title="Address";
                contextDict.customer=req.user;
                contextDict.addresses=addresses,
                contextDict.Errad=req.flash('Address');
                res.render('Profile/Addresses',contextDict);
            });
        }catch (err) {
            console.log(err);
        }  
    });
                     
router.route('/:Username/Addresses/Add')
    .get(isLoggedIn,async function (req, res) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
        var selectQuery = '\
            SELECT *\
            FROM Provinces\;'
            database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (provinces) {
                contextDict.title="AddAddress";
                contextDict.customer= req.user;
                contextDict.provinces= provinces;
                res.render('Profile/AddAddress',contextDict )          
            });
        }catch (err) {
            console.log(err);
        }  
    })
    .post(isLoggedIn, function (req, res) {
        const str=req.user.Password.substring(3,8)
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
            res.redirect('/AccUser/'+req.user.Username+'/Addresses/');
        });
    });
router.route('/:Username/Addresses/:id/Edit')
    .get(isLoggedIn,async function (req, res) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
        var selectQuery = '\
            SELECT *\
            FROM Address\
            NATURAL JOIN provinces NATURAL JOIN amphures NATURAL JOIN tambons \
            WHERE AddressId = ' + req.params.id +' and UserId='+req.user.UserId;
        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (address) {
            if(address.length ==0){
                res.redirect('/AccUser/'+req.user.Username+'/Addresses/');
            }
            var selectQuery = '\
            SELECT *\
            FROM Provinces\;'
            database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (provinces) {
                contextDict.title="AddAddress";
                contextDict.customer= req.user;
                contextDict.address= address[0];
                contextDict.provinces= provinces;
                res.render('profile/EditAddress', contextDict);                  
            });
        });
        }catch (err) {
            console.log(err);
        }  
    })

    .post(isLoggedIn, function (req, res) {
        var form = req.body;
        const str=req.user.Password.substring(3,8)

        var updateQuery = '\
                UPDATE Address\
                SET FName = \'' + form.FName + '\', \
                    LName = \'' + form.LName + '\', \
                    Tel = \'' + form.Tel + '\', \
                    Address = \'' + form.Address + '\', \
                    ProvincesId = \'' + form.Province + '\', \
                    AmphuresId = \'' + form.Amphure + '\', \
                    TambonsId = \'' + form.Tambon + '\' \
                WHERE AddressId= ' + req.params.id;
        database.RunQuery(updateQuery,Sequelize.QueryTypes.UPDATE, function (result) {
            res.redirect('/AccUser/'+req.user.Username+'/Addresses/');
        });
    });

router.route('/:Username/Addresses/:id/Delete')
    .post(isLoggedIn, function (req, res, next) {
        const SelectAddress="SELECT OrderId,AddressId FROM Orders where AddressId="+req.params.id;
        database.RunQuery(SelectAddress,Sequelize.QueryTypes.SELECT, function (Addres) {
            if (Addres.length > 0) {
                req.flash('Address','ไม่สามารถลบได้เนื่องจากอยู่ในหมายเลขคำสั่งซื้อของคุณ');
                res.redirect('/AccUser/'+req.user.Username+'/Addresses/');
            }
            else{
                var sqlStr = '\
                DELETE FROM Address\
                WHERE AddressId = ' + req.params.id;

                database.RunQuery(sqlStr,Sequelize.QueryTypes.DELETE, function (result) {
                    res.redirect('/AccUser/'+req.user.Username+'/Addresses/');
                });
            }
        });
        
    });
router.route('/:Username/Addresses/Add/:ProvinceId')
    .get(isLoggedIn, function (req, res) {
        var selectQuery = '\
            SELECT *\
            FROM  Amphures Where ProvinceId='+req.params.ProvinceId;
        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (Amphures) {
            res.send(Amphures);
        });
    })
router.route('/:Username/Addresses/Add/:ProvinceId/:AmphureId')
    .get(isLoggedIn, function (req, res) {
        var selectQuery = '\
            SELECT *\
            FROM  Tambons Where AmphureId='+req.params.AmphureId;
        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (Tambons) {
            res.send(Tambons);
        });
    })
router.route('/:Username/Addresses/:id/Edit/:ProvinceId')
    .get(isLoggedIn, function (req, res) {
        var selectQuery = '\
            SELECT *\
            FROM  Amphures Where ProvinceId='+req.params.ProvinceId;
        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (Amphures) {
            res.send(Amphures);
        });
    })
router.route('/:Username/Addresses/:id/Edit/:ProvinceId/:AmphureId')
    .get(isLoggedIn, function (req, res) {
        var selectQuery = '\
            SELECT *\
            FROM  Tambons Where AmphureId='+req.params.AmphureId;
        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (Tambons) {
            res.send(Tambons);
        });
    })
module.exports = router;