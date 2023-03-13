var express = require('express');
var router = express.Router();
var bcrypt = require('bcrypt-nodejs');

// database module
var database = require('../Config/Database');
const { Sequelize } = require('sequelize');
//UploadImage using  Multer
const multer = require('multer');
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'Public/Img/Product')
    },
    filename:(req,file,cb)=>{
        const mimeExtendsion={
            'image/jpeg':'.jpeg',
            'image/jpg':'.jpg',
            'image/png':'.png'
        }
        cb(null,file.originalname+file.fieldname+'-'+Date.now()+mimeExtendsion[file.mimetype]);
    }
});
const UploadProduct=multer({
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
const storageicon=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'Public/Img/Settings/LogoWeb')
    },
    filename:(req,file,cb)=>{
        const mimeExtendsion={
            'image/jpeg':'.jpeg',
            'image/jpg':'.jpg',
            'image/png':'.png'
        }
        cb(null,file.originalname+file.fieldname+'-'+Date.now()+mimeExtendsion[file.mimetype]);
    }
});
const Uploadicon=multer({
    storage:storageicon,
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

const storageQrcode=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'Public/Img/Settings/Banks')
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
const UploadQrcode=multer({
    storage:storageQrcode,
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

//Authenticated Admin
function IsAdmin(req, res, next) {
    if (req.isAuthenticated()){
        if (req.user.UserStatus == 1) {
            return next();
        }
        else {
            res.redirect('/AccUser/' + req.user.Username+'/');
        }
    }
    // if they aren't redirect them to the home page
    res.redirect('/');
}

function getNestedChildren(arr, RefParentId) {
    var out = []
    for (var i in arr) {
      if (arr[i].RefParentId == RefParentId) {
        var children = getNestedChildren(arr, arr[i].CategoryId)
  
        if (children.length) {
          arr[i].subCate = children
        }
        out.push(arr[i])
      }
    }
    return out
  }

router.route('/')
    .get(IsAdmin, function (req, res, next) {
        res.redirect('/SellerCenter/Home');
});
router.route('/Home')
    .get(IsAdmin, function (req, res, next) {
        const SelectOrder="SELECT COUNT(*)as TotalOrder from Orders where OrdersStatus!=2;"
        database.RunQuery(SelectOrder,Sequelize.QueryTypes.SELECT,(NonImplement)=>{
            const selectWebset="SELECT * FROM Settings;"
            database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                const Seller="select YEARWEEK(CURDATE()) as Week1,SUM(OrderLists.Price*OrderLists.Quantity) as TotalPrice,\
                SUM(OrderLists.Quantity) as TotalQuantity,DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m-%d') as Date1\
                FROM Orders natural join OrderLists natural join Products\
                where Orders.OrdersStatus=3 and DATE_FORMAT(Orders.CreateOrderAt,'%Y%U') Between YEARWEEK(CURDATE()) and YEARWEEK(CURDATE())\
                group by Date1 order by Date1 ASC;"
                database.RunQuery(Seller,Sequelize.QueryTypes.SELECT,(TotalPrice)=>{
                    res.render('Admin/index', {
                        title: "หน้าหลัก",
                        Admin: req.user,
                        not:NonImplement[0],
                        SetWeb:Settings[0],
                        Orders:TotalPrice,
                    });
                });
            });
        });
        
});

router.route('/Product')
    .get(IsAdmin, function (req, res, next) {
        const SelectProduct = "\
        SELECT *,JSON_EXTRACT(MProductImg,'$[0].filename0')As productImg FROM Products natural join ProductImg natural join Category natural join ProductBrand;"
        database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
            const selectProductStatus="SELECT *,JSON_EXTRACT(MProductImg,'$[0].filename0')As productImg FROM Products \
            natural join ProductImg natural join Category natural join ProductBrand where ProductStatus=0 or ProductStatus=1 ;"
            database.RunQuery(selectProductStatus,Sequelize.QueryTypes.SELECT,(showdata1)=>{
                const selectProductNot="SELECT *,JSON_EXTRACT(MProductImg,'$[0].filename0')As productImg FROM Products \
                natural join ProductImg natural join Category natural join ProductBrand where ProductStatus=2;"
                database.RunQuery(selectProductNot,Sequelize.QueryTypes.SELECT,(showdata2)=>{
                    const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                        res.render('Admin/Product', {
                            title:"แสดงรายการสินค้า",
                            Admin: req.user,
                            Product:  showdata,
                            Product1: showdata1,
                            Product2: showdata2,
                            SetWeb:Settings[0],
                            Sug:req.flash("Sugges"),
                        });
                    });
                });
            });
        });
});

router.route('/Orders')
    .get(IsAdmin, function (req, res, next) {
        const SelectProduct = "\
        SELECT *,DATE_FORMAT(Orders.BankSlipDateTime,'%d-%m-%Y') as DateSlip,DATE_FORMAT(Orders.CreateOrderAt,'%d-%m-%Y %T') as Date FROM Orders  order by OrderId DESC;"
        database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
            const selectProductStatus="SELECT *,DATE_FORMAT(Orders.BankSlipDateTime,'%d-%m-%Y') as DateSlip,DATE_FORMAT(Orders.CreateOrderAt,'%d-%m-%Y %T') as Date FROM Orders where OrdersStatus=0 or OrdersStatus=1 or OrdersStatus=2 order by OrderId DESC ;"
            database.RunQuery(selectProductStatus,Sequelize.QueryTypes.SELECT,(showdata1)=>{
                const selectProductNot="SELECT *,DATE_FORMAT(Orders.BankSlipDateTime,'%d-%m-%Y') as DateSlip,DATE_FORMAT(Orders.CreateOrderAt,'%d-%m-%Y %T') as Date FROM Orders where OrdersStatus=3 order by OrderId DESC ;"
                database.RunQuery(selectProductNot,Sequelize.QueryTypes.SELECT,(showdata2)=>{
                    const selectProductNot1="SELECT *,DATE_FORMAT(Orders.BankSlipDateTime,'%d-%m-%Y') as DateSlip,DATE_FORMAT(Orders.CreateOrderAt,'%d-%m-%Y %T') as Date FROM Orders where OrdersStatus=4 order by OrderId DESC ;"
                    database.RunQuery(selectProductNot1,Sequelize.QueryTypes.SELECT,(showdata3)=>{
                        const selectWebset="SELECT * FROM Settings;"
                        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                            res.render('Admin/Orders', {
                                title:"แสดงรายการสินค้า",
                                Admin: req.user,
                                Order:  showdata,
                                Order1: showdata1,
                                Order2: showdata2,
                                Order3: showdata3,
                                SetWeb:Settings[0],
                            });
                        });
                    });
                });
            });
        });
    });

router.route('/Orders/:id')
    .get(IsAdmin, function (req, res, next) {
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
                const selectWebset="SELECT * FROM Settings;"
                database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                    res.render('Admin/OrdersLists', {
                        title:"หมายเลขคำสั่งซื้อ#"+req.params.id,
                        Admin: req.user,
                        order: order[0],
                        products:products,
                        SetWeb:Settings[0],
                    });
                });
            });
        });
    });

router.route('/Orders/:OrderId/Confirm')
    .post(IsAdmin, function (req,res){
        var upDateOrders = "\
        UPDATE Orders SET OrdersStatus =2, UpdateOrderAt= NOW() \
        WHERE OrderId ="  + req.params.OrderId;
            database.RunQuery(upDateOrders,Sequelize.QueryTypes.UPDATE, function (Row){
                res.redirect('/SellerCenter/Orders');
            });
    });

router.route('/Orders/:OrderId/Tracking')
    .post(IsAdmin, function (req,res){
        var form=req.body;
        var upDateOrders = '\
            UPDATE Orders \
            SET OrdersStatus =\'' + 3 + '\', \
             UpdateOrderAt= NOW(),\
             TrackingId=\'' + form.tracking + '\' \
            WHERE OrderId = ' + req.params.OrderId;
            database.RunQuery(upDateOrders,Sequelize.QueryTypes.UPDATE, function (Row){
                res.redirect('/SellerCenter/Orders');
            });
    });

router.route('/Orders/:OrderId/TrackingE')
    .post(IsAdmin, function (req,res){
        var form=req.body;
        var upDateOrders = '\
            UPDATE Orders \
            SET OrdersStatus =\'' + 3 + '\', \
             UpdateOrderAt= NOW(),\
             TrackingId=\'' + form.tracking + '\' \
            WHERE OrderId = ' + req.params.OrderId;
            database.RunQuery(upDateOrders,Sequelize.QueryTypes.UPDATE,  function (Row){
                res.redirect('/SellerCenter/Orders');
            });
    });

router.route('/Orders/:OrderId/Cancle')
    .post(IsAdmin, function (req,res){
        var upDateOrders = "\
            UPDATE Orders SET OrdersStatus =4, UpdateOrderAt= NOW() WHERE OrderId = "+ req.params.OrderId;
            database.RunQuery(upDateOrders,Sequelize.QueryTypes.UPDATE,  function (Row){
                //console.log(Row);
                //console.log(upDateOrders);
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
                    res.redirect('/SellerCenter/Orders');
                });
            });
    });

router.route('/Category')
    .get(IsAdmin, function (req, res, next) {
        const selectcate="SELECT * FROM Category WHERE RefParentId = RefParentId ORDER BY CategoryName ASC;"
        database.RunQuery(selectcate,Sequelize.QueryTypes.SELECT,(category)=>{
            var cate=JSON.stringify(getNestedChildren(category,0));
            const selectWebset="SELECT * FROM Settings;"
            database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                res.render('Admin/Category', {
                    title: "แสดงรายการหมวดหมู่",
                    Admin: req.user,
                    categoreis: category,
                    categories:cate,
                    SetWeb:Settings[0],
                });
            });
        });
});
router.route('/Category/AddCategory')
    .post(IsAdmin,(req,res)=>{
        const form=req.body;
        const Addcate='\
        INSERT INTO Category\
        VALUES (null,\
            \'' + form.CateName + '\', \
            \'' + form.Category  + '\')';
        database.RunQuery(Addcate,Sequelize.QueryTypes.INSERT, function (Category) {
            //console.log(Category);
            res.redirect('/SellerCenter/Category');
        });
    });
router.route('/Category/:id/Edit')
    .post(IsAdmin,(req,res)=>{
        const form=req.body;
        const UpdateCate='\
        UPDATE Category\
            SET CategoryName = \'' + form.CateName + '\' \
            WHERE CategoryId= ' + req.params.id;
        database.RunQuery(UpdateCate,Sequelize.QueryTypes.UPDATE, function (Category) {
            res.redirect('/SellerCenter/Category');
        });
    });

router.route('/Category/:id/Delete')
    .post(IsAdmin, function (req,res){
        const SelectProduct="SELECT ProductId,CategoryId FROM Products natural join Category where CategoryId="+req.params.id;
        database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT, function (catego) {
            if (catego.length > 0) {
                const selectcate ="SELECT * FROM Category;"
                database.RunQuery(selectcate,Sequelize.QueryTypes.SELECT,(category)=>{
                    req.flash('Categorycheck','หมวดหมู่นี้ใช้งานอยู่ ไม่สามารถลบได้');
                    var cate=JSON.stringify(getNestedChildren(category,0));
                    const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                        res.render('Admin/Category',{
                            Admin: req.user,
                            CategoryChecked: req.flash('Categorycheck'),
                            categoreis: category,
                            categories:cate,
                            SetWeb:Settings[0],
                        });
                    });
                });
            }
            else{
            const DeleteBrand = '\
                DELETE FROM Category\
                WHERE CategoryId = ' + req.params.id;
                database.RunQuery(DeleteBrand,Sequelize.QueryTypes.DELETE,function (result){
                    res.redirect('/SellerCenter/Category');
                });
            }
        });
    });

router.route('/Product/Add')
    .get(IsAdmin, function (req, res, next) {
        const selectcate="SELECT * FROM Category WHERE RefParentId = RefParentId ORDER BY CategoryName ASC;"
        database.RunQuery(selectcate,Sequelize.QueryTypes.SELECT, (category)=>{
            var cate=JSON.stringify(getNestedChildren(category,0));
            const selectBrand="SELECT * FROM ProductBrand ORDER BY BrandName ASC;"
            database.RunQuery(selectBrand,Sequelize.QueryTypes.SELECT, (Brand)=>{
                const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT, (Settings)=>{
                    res.render('Admin/AddProduct', {
                        title: "เพิ่มสินค้า",
                        Admin: req.user,
                        categoreis:cate,
                        Brands:Brand,
                        SetWeb:Settings[0],
                    });
                });
            });
        });
    })
    .post(IsAdmin,UploadProduct.array('image'),function (req, res, next) {
        //const img=req.files;
        let fileNames = []
        req.files.forEach((file)=> {
            fileNames.push(file.filename);
         });
         /*const img={
            filename:fileNames
         };*/
         const img={}
         fileNames.forEach((elem, i) => {
            img[`filename${i}`] = elem
        });
        //console.log(img);
        const InsertImage= '\
        INSERT INTO ProductImg\
        VALUES (null,\
            \'' + JSON.stringify(img) + '\')';
        database.RunQuery(InsertImage,Sequelize.QueryTypes.INSERT, (add)=>{
            console.log(add);
            const form=req.body;
            const update="NULL"
            const InsertProduct='\
            INSERT INTO Products\
            VALUES (null,\
                \'' + form.ProductName+ '\', \
                \'' + form.ProductInfo + '\', \
                \'' + form.ProductPrice + '\', \
                \'' + form.ProductQuantity + '\', \
                \'' + new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000).toJSON().slice(0, 19).replace('T', ' ')+'\',\
                \'' + new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000).toJSON().slice(0, 19).replace('T', ' ')+'\',\
                \'' + form.CategoryId + '\', \
                \'' + form.BrandId + '\', \
                \'' + add[0].insertId + '\', \
                \'' + form.width+ '\', \
                \'' + form.height+ '\', \
                \'' + form.Length+ '\', \
                \'' + form.Weight+ '\', \
                \'' + 0 + '\')';
                database.RunQuery(InsertProduct,Sequelize.QueryTypes.INSERT,(Add)=>{
                    res.redirect('/SellerCenter/Product');
                });
                
        });
    });

router.route('/Product/:id/Suggestion')
    .post(IsAdmin, function (req,res){
        const SelectProduct="SELECT ProductId,ProductStatus FROM Products  where ProductStatus=1";
        database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT, function (ProductSugges) {
            if (ProductSugges.length <= 19) {
                //console.log(ProductSugges.length);
                const UpdateStatus='\
                UPDATE Products\
                    SET ProductStatus = \'' + 1 + '\' \
                    WHERE ProductId= ' + req.params.id;
                database.RunQuery(UpdateStatus,Sequelize.QueryTypes.UPDATE, function (Category) {
                    res.redirect('/SellerCenter/Product');
                });
            }
            else{
                req.flash("Sugges","ไม่สามารถเพิ่มสินค้าแนะนำได้เกิน 20 สินค้า")
                res.redirect('/SellerCenter/Product');
            }
        });
    });    

router.route('/Product/:id/ReSuggestion')
    .post(IsAdmin, function (req,res){
        const UpdateStatus='\
        UPDATE Products\
            SET ProductStatus = \'' + 0 + '\' \
            WHERE ProductId= ' + req.params.id;
        database.RunQuery(UpdateStatus,Sequelize.QueryTypes.UPDATE, function (Category) {
            res.redirect('/SellerCenter/Product');
        });
    });    

router.route('/Product/:id/Cancle')
    .post(IsAdmin, function (req,res){
        const UpdateStatus='\
        UPDATE Products\
            SET ProductStatus = \'' + 2 + '\' \
            WHERE ProductId= ' + req.params.id;
        database.RunQuery(UpdateStatus,Sequelize.QueryTypes.UPDATE, function (Category) {
            res.redirect('/SellerCenter/Product');
        });
    });    

router.route('/Product/:id/Edit')
    .get(IsAdmin, function (req, res, next) {
        const SelectProduct = "\
        SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg ,\
        JSON_EXTRACT(MProductImg,'$.filename1')As productImg1,\
        JSON_EXTRACT(MProductImg,'$.filename2')As productImg2 ,JSON_EXTRACT(MProductImg,'$.filename3')As productImg3,\
        JSON_EXTRACT(MProductImg,'$.filename4')As productImg4\
        FROM Products natural join ProductImg natural join Category natural join ProductBrand where ProductId="+req.params.id;
        database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
            const selectcate="SELECT * FROM Category WHERE RefParentId = RefParentId ORDER BY CategoryName ASC;"
            database.RunQuery(selectcate,Sequelize.QueryTypes.SELECT,(category)=>{
                var cate=JSON.stringify(getNestedChildren(category,0));
                const selectBrand="SELECT * FROM ProductBrand ORDER BY BrandName ASC;"
                database.RunQuery(selectBrand,Sequelize.QueryTypes.SELECT,(Brand)=>{
                    const selectWebset="SELECT * FROM Settings;"
                        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                        res.render('Admin/EditProduct', {
                            title: "แก้ไขสินค้า",
                            Admin: req.user,
                            Product: showdata[0],
                            categoreis:cate,
                            Brands:Brand,
                            SetWeb:Settings[0],
                        });
                    });
                });
            });
        });
    })
    .post(IsAdmin,UploadProduct.array('image'),function (req, res, next) {
        //const img=req.files;
        let fileNames = []
        req.files.forEach((file)=> {
            fileNames.push(file.filename);
         });
         /*const img={
            filename:fileNames
         };*/
         const img={}
         fileNames.forEach((elem, i) => {
            img[`filename${i}`] = elem
        });
         //console.log(img);
        const imgae=JSON.stringify(img);
        const pas=JSON.parse(imgae)
        //console.log(pas.filename0);
        if(pas.filename0 != undefined){
            const UpdateImage= "\
            UPDATE  Products natural join ProductImg SET MProductImg= JSON_SET(MProductImg,'$.filename0',"+'"'+pas.filename0+'"'+"\
            ,'$.filename1',"+'"'+pas.filename1+'"'+"\
            ,'$.filename2',"+'"'+pas.filename2+'"'+"\
            ,'$.filename3',"+'"'+pas.filename3+'"'+"\
            ,'$.filename4',"+'"'+pas.filename4+'"'+"\
            ) WHERE ProductId= " + req.params.id;
            database.RunQuery(UpdateImage,Sequelize.QueryTypes.UPDATE,(updateimage)=>{
                //console.log(updateimage);
                const form=req.body;
                const UpdateProduct='\
                UPDATE Products\
                    SET ProductName = \'' + form.ProductName + '\', \
                    ProductInfo = \'' + form.ProductInfo + '\', \
                    ProductPrice = \'' + form.ProductPrice + '\', \
                    ProductQuantity = \'' + form.ProductQuantity + '\', \
                    UpdateAt= \'' + new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000).toJSON().slice(0, 19).replace('T', ' ') + '\', \
                    CategoryId = \'' + form.CategoryId + '\', \
                    Width = \'' + form.width + '\', \
                    Height = \'' + form.height + '\', \
                    Length = \'' + form.Length + '\', \
                    Weight= \'' + form.Weight + '\', \
                    BrandId = \'' + form.BrandId + '\' \
                    WHERE ProductId=' + req.params.id;
                database.RunQuery(UpdateProduct,Sequelize.QueryTypes.UPDATE,(Add)=>{
                    res.redirect('/SellerCenter/Product');
                }); 
            });
        }
        else{
            const form=req.body;
            const UpdateProduct='\
            UPDATE Products\
                SET ProductName = \'' + form.ProductName + '\', \
                ProductInfo = \'' + form.ProductInfo + '\', \
                ProductPrice = \'' + form.ProductPrice + '\', \
                ProductQuantity = \'' + form.ProductQuantity + '\', \
                UpdateAt= \'' + new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60 * 1000).toJSON().slice(0, 19).replace('T', ' ') + '\', \
                CategoryId = \'' + form.CategoryId + '\', \
                Width = \'' + form.width + '\', \
                Height = \'' + form.height + '\', \
                Length = \'' + form.Length + '\', \
                Weight= \'' + form.Weight + '\', \
                BrandId = \'' + form.BrandId + '\' \
                WHERE ProductId=' + req.params.id;
            database.RunQuery(UpdateProduct,Sequelize.QueryTypes.UPDATE,(Add)=>{
                res.redirect('/SellerCenter/Product');
            }); 
        }
    });

router.route('/Brand')
    .get(IsAdmin, function (req, res,next) {
        const Brand ="SELECT * FROM ProductBrand;"
        database.RunQuery(Brand,Sequelize.QueryTypes.SELECT,(resultBrand)=>{
            const selectWebset="SELECT * FROM Settings;"
            database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                res.render('Admin/Brand', {
                    title: "รายการแบรนด์",
                    Admin: req.user,
                    Brands:resultBrand,
                    SetWeb:Settings[0],
                });
            });
        });
    });

router.route('/Product/AddBrand')
    .get(IsAdmin, function (req, res,next) {
        const selectWebset="SELECT * FROM Settings;"
        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
            res.render('Admin/AddBrand', {
                title: "เพิ่มแบรนด์",
                Admin: req.user,
                SetWeb:Settings[0],
            });
        });
    })
    .post(IsAdmin,(req,res)=>{
        const form=req.body;
        const InsertBrand='\
            INSERT INTO ProductBrand\
            VALUES (null,\
            \'' + form.ProductBrand + '\')';
        database.RunQuery(InsertBrand,Sequelize.QueryTypes.INSERT,(resBrand)=>{
            res.redirect('/SellerCenter/Brand');
        });
    });

router.route('/Brand/:id/Edit')
    .post(IsAdmin,(req,res,next)=>{
        const form=req.body;
        const UpdateBrand='\
        UPDATE ProductBrand\
            SET BrandName = \'' + form.ProductBrand + '\' \
            WHERE BrandId= ' + req.params.id;
        database.RunQuery(UpdateBrand,Sequelize.QueryTypes.UPDATE, function (Brand) {
            res.redirect('/SellerCenter/Brand');
        });
    });

 router.route('/Brand/:id/Delete')
    .post(IsAdmin, function (req,res){
        const SelectProduct="SELECT ProductId,BrandId FROM Products natural join ProductBrand where BrandId="+req.params.id;
        database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT, function (Brand) {
            if (Brand.length > 0) {
                const Brand ="SELECT * FROM ProductBrand;"
                database.RunQuery(Brand,Sequelize.QueryTypes.SELECT,(resultBrand)=>{
                    const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                        req.flash('Brand','แบรนด์นี้ใช้งานอยู่ ไม่สามารถลบได้');
                        res.render('Admin/Brand',{
                            Admin: req.user,
                            Brands:resultBrand,
                            SetWeb:Settings[0],
                            BrandChecked: req.flash('Brand')
                        });
                    });
                });
            }
            else{
            const DeleteBrand = '\
                DELETE FROM ProductBrand\
                WHERE BrandId = ' + req.params.id;
                database.RunQuery(DeleteBrand,Sequelize.QueryTypes.DELETE, function (result){
                    res.redirect('/SellerCenter/Brand');
                });
            }
        });
    });

router.route('/TotalSeller')
    .get(IsAdmin, function (req, res,next) {
        const Seller="select ProductName,SUM(OrderLists.Price*OrderLists.Quantity) as TotalPrice,SUM(OrderLists.Quantity) as TotalQuantity\
        FROM Orders natural join OrderLists natural join Products\
        where Orders.OrdersStatus=3 and DATE_FORMAT(Orders.CreateOrderAt,'%Y%U') Between YEARWEEK(CURDATE()) and YEARWEEK(CURDATE())\
        group by OrderLists.ProductId order by Products.ProductId ASC ;"
        database.RunQuery(Seller,Sequelize.QueryTypes.SELECT,(TotalPrice)=>{
            const selectWebset="SELECT * FROM Settings;"
            database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                res.render('Admin/SellerProduct', {
                    title: "รายงานสรุปยอดขายสินค้า",
                    Admin: req.user,
                    Orders:TotalPrice,
                    SetWeb:Settings[0],
                });
            });
        });

    });
    
router.route('/TotalSeller/Search')
    .post(IsAdmin, function (req, res,next) {
        var form=req.body;
        //console.log(form.DateStart);
        //console.log(form.DateEnd);
        if(form.Product==""){
            const Seller="select ProductName,SUM(OrderLists.Price*OrderLists.Quantity) as TotalPrice,SUM(OrderLists.Quantity) as TotalQuantity\
            FROM Orders natural join OrderLists natural join Products\
            where Orders.OrdersStatus=3 and DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m-%d') BETWEEN '"+form.DateStart+"' and '"+form.DateEnd+"'\
            group by OrderLists.ProductId order by Products.ProductId ASC;"
            database.RunQuery(Seller,Sequelize.QueryTypes.SELECT,(TotalPrice)=>{
                const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                    res.render('Admin/SellerPerProduct', {
                        title: "รายงานสรุปยอดขายสินค้าตามสินค้า วัน/เดือน/ปี",
                        Admin: req.user,
                        Orders:TotalPrice,
                        DateSt:form.DateStart,
                        DateE:form.DateEnd,
                        SetWeb:Settings[0],
                    });
                });
            });
        }
        else{
            const Seller="select ProductName,SUM(OrderLists.Price*OrderLists.Quantity) as TotalPrice,SUM(OrderLists.Quantity) as TotalQuantity\
            FROM Orders natural join OrderLists natural join Products\
            where Orders.OrdersStatus=3 and ProductName like '%"+form.Product+"%'and DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m-%d') BETWEEN '"+form.DateStart+"' and '"+form.DateEnd+"'\
            group by OrderLists.ProductId order by Products.ProductId ASC;"
            database.RunQuery(Seller,Sequelize.QueryTypes.SELECT,(TotalPrice)=>{
                const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                    res.render('Admin/SellerPerProduct', {
                        title: "รายงานสรุปยอดขายแต่ละสินค้าตามวัน/เดือน/ปี",
                        Admin: req.user,
                        Orders:TotalPrice,
                        DateSt:form.DateStart,
                        DateE:form.DateEnd,
                        product:form.Product,
                        SetWeb:Settings[0],
                    });
                });
            });
        }

    });

router.route('/TotalSell')
    .get(IsAdmin, function (req, res,next) {
        const Seller="select YEARWEEK(CURDATE()) as Week1,SUM(OrderLists.Price*OrderLists.Quantity) as TotalPrice,\
        SUM(OrderLists.Quantity) as TotalQuantity,DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m-%d') as Date1\
        FROM Orders natural join OrderLists natural join Products\
        where Orders.OrdersStatus=3 and DATE_FORMAT(Orders.CreateOrderAt,'%Y%U') Between YEARWEEK(CURDATE()) and YEARWEEK(CURDATE())\
        group by Date1 order by Date1 ASC;"
        database.RunQuery(Seller,Sequelize.QueryTypes.SELECT,(TotalPrice)=>{
            const selectWebset="SELECT * FROM Settings;"
            database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                res.render('Admin/SellerTotal', {
                    title: "รายงานสรุปยอดขายสินค้า",
                    Admin: req.user,
                    Orders:TotalPrice,
                    SetWeb:Settings[0],
                });
            });
        });

    });

router.route('/TotalSell/SearchDate')
    .post(IsAdmin, function (req, res,next) {
        var form=req.body;
        //console.log(form.MonthStart);
        //console.log(form.MonthEnd);
        if(form.DateStart!=""){
            const Seller="select SUM(OrderLists.Price*OrderLists.Quantity) as TotalPrice,\
            SUM(OrderLists.Quantity) as TotalQuantity,DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m-%d') as Date1\
            FROM Orders natural join OrderLists natural join Products\
            where Orders.OrdersStatus=3 and DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m-%d') BETWEEN '"+form.DateStart+"' and '"+form.DateEnd+"'\
            group by Date1 order by Date1 ASC;"
            database.RunQuery(Seller,Sequelize.QueryTypes.SELECT,(TotalPrice)=>{
                const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                    res.render('Admin/SellerPerTotal', {
                        title: "รายงานสรุปยอดขายตามวัน",
                        Admin: req.user,
                        Orders:TotalPrice,
                        DateSt:form.DateStart,
                        DateE:form.DateEnd,
                        SetWeb:Settings[0],
                    });
                });
            });
        }
        else{
            const Seller="select SUM(OrderLists.Price*OrderLists.Quantity) as TotalPrice,\
            SUM(OrderLists.Quantity) as TotalQuantity,DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m-%d') as Date1\
            FROM Orders natural join OrderLists natural join Products\
            where Orders.OrdersStatus=3 and DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m-%d') BETWEEN '"+form.DateStart+"' and '"+form.DateEnd+"'\
            group by Date1 order by Date1 ASC;"
            database.RunQuery(Seller,Sequelize.QueryTypes.SELECT,(TotalPrice)=>{
                const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                    res.render('Admin/SellerPerTotal', {
                        title: "รายงานสรุปยอดขาย",
                        Admin: req.user,
                        Orders:TotalPrice,
                        DateSt:form.DateStart,
                        DateE:form.DateEnd,
                        product:form.Product,
                        SetWeb:Settings[0],
                    });
                });
            });
        }

    });

router.route('/TotalSell/SearchMonth')
    .post(IsAdmin, function (req, res,next) {
        var form=req.body;
        if(form.MonthStart!=""){
            const Seller="select SUM(OrderLists.Price*OrderLists.Quantity) as TotalPrice,\
            SUM(OrderLists.Quantity) as TotalQuantity,DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m') as Date1\
            FROM Orders natural join OrderLists natural join Products\
            where Orders.OrdersStatus=3 and DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m') BETWEEN '"+form.MonthStart+"' and '"+form.MonthEnd+"'\
            group by Date1 order by Date1 ASC;"
            database.RunQuery(Seller,Sequelize.QueryTypes.SELECT,(TotalPrice)=>{
                const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                    res.render('Admin/SellerPerTotal', {
                        title: "รายงานสรุปยอดขายตามเดือน/ปี",
                        Admin: req.user,
                        Orders:TotalPrice,
                        MateSt:form.MonthStart,
                        MateE:form.MonthEnd,
                        SetWeb:Settings[0],
                    });
                });
            });
        }
        else{
            const Seller="select SUM(OrderLists.Price*OrderLists.Quantity) as TotalPrice,\
            SUM(OrderLists.Quantity) as TotalQuantity,DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m') as Date1\
            FROM Orders natural join OrderLists natural join Products\
            where Orders.OrdersStatus=3 and DATE_FORMAT(Orders.CreateOrderAt,'%Y-%m') BETWEEN '"+form.MonthStart+"' and '"+form.MonthEnd+"'\
            group by Date1 order by Date1 ASC;"
            database.RunQuery(Seller,Sequelize.QueryTypes.SELECT,(TotalPrice)=>{
                const selectWebset="SELECT * FROM Settings;"
                    database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                    res.render('Admin/SellerPerTotal', {
                        title: "รายงานสรุปยอดขายตามเดือน/ปี",
                        Admin: req.user,
                        Orders:TotalPrice,
                        MateSt:form.MonthStart,
                        MateE:form.MonthEnd,
                        SetWeb:Settings[0],
                    });
                });
            });
        }

    });

router.route('/Setwebsite')
    .get(IsAdmin, function (req, res,next) {
        const selectWebset="SELECT * FROM Settings;"
        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
        const sqlBackgroud="SELECT * FROM BgColor where Status=1;"
            database.RunQuery(sqlBackgroud,Sequelize.QueryTypes.SELECT,(Bgcolor)=>{
            const sqlTheme='SELECT * FROM ThemesColor where Status=1;'
                database.RunQuery(sqlTheme,Sequelize.QueryTypes.SELECT,(Themes)=>{
                    const sqlFont='SELECT * FROM Font where Status=1;'
                    database.RunQuery(sqlFont,Sequelize.QueryTypes.SELECT,(Fonts)=>{
                        const sqlNav='SELECT * FROM Navigation where Status=1;'
                        database.RunQuery(sqlNav,Sequelize.QueryTypes.SELECT,(Navmenus)=>{
                            res.render('Admin/SetWebsite', {
                                title: "ตั้งค่าธีม สี เมนู เว็บ",
                                Admin: req.user,
                                SetWeb:Settings[0],
                                Theme:Themes,
                                Font:Fonts,
                                NavMenu:Navmenus,
                                Background:Bgcolor[0],
                            });
                        });
                    });
                });
            });
        });
    })
    .post(IsAdmin,(req,res)=>{
        const resetTheme="UPDATE ThemesColor SET Status="+0;
        const resetBgcolor="UPDATE BgColor SET Status="+0;
        const resetFont="UPDATE Font SET Status="+0;
        const resetMenu="UPDATE Navigation SET Status="+0;
        database.RunQuery(resetTheme,Sequelize.QueryTypes.UPDATE,(resetTm)=>{
            database.RunQuery(resetBgcolor,Sequelize.QueryTypes.UPDATE,(resetBg)=>{
                database.RunQuery(resetFont,Sequelize.QueryTypes.UPDATE,(resetFt)=>{
                    database.RunQuery(resetMenu,Sequelize.QueryTypes.UPDATE,(resmenu)=>{
                    var UpdateTheme = '\
                        UPDATE ThemesColor\
                        SET Status = \'' + 1 + '\' \
                        WHERE ThemesColorId= ' + req.body.theme;
                        database.RunQuery(UpdateTheme,Sequelize.QueryTypes.UPDATE, function (ResTheme) {
                        var UpdateBg = '\
                            UPDATE BgColor\
                            SET Status = \'' + 1 + '\' \
                            WHERE BgColorId= '+req.body.backgorud;
                            database.RunQuery(UpdateBg,Sequelize.QueryTypes.UPDATE,(ResBg)=>{
                            var UpdateFont = '\
                                UPDATE Font\
                                SET Status = \'' + 1 + '\' \
                                WHERE FontId= ' + req.body.Font;
                                database.RunQuery(UpdateFont,Sequelize.QueryTypes.UPDATE,(ResFt)=>{
                                var Updatemenu='\
                                UPDATE Navigation\
                                SET Status = \'' + 1 + '\' \
                                WHERE NavigationId= ' + req.body.Menu;
                                    database.RunQuery(Updatemenu,Sequelize.QueryTypes.UPDATE,(ResMe)=>{
                                        //console.log(resetTm,ResMe);
                                        res.redirect('/SellerCenter/Setwebsite?');
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    });

router.route('/Setwebsite/Settings')
    .get(IsAdmin, function (req, res,next) {
        const selectWebset="SELECT * FROM Settings;"
        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
            const selectSocial="SELECT * FROM SocialMedia;"
            database.RunQuery(selectSocial,Sequelize.QueryTypes.SELECT,(sociallink)=>{
                res.render('Admin/Settings', {
                    title: "ตั้งค่าเว็บ ลิงก์เว็บ",
                    Admin: req.user,
                    SetWeb:Settings[0],
                    Social:sociallink
                });
            });
        });
    });

router.route('/Setwebsite/Settings/Edit')
    .post(IsAdmin,Uploadicon.single('Logo'),function (req, res, next) {
        const img=req.file;
        var form=req.body;
        if(img !=undefined){
            const UpdateSettings='\
            UPDATE Settings\
                    SET LogoWeb = \'' + img.filename+ '\', \
                    WebName = \'' + form.Webname + '\', \
                    WebAddress = \'' + form.Webaddress + '\', \
                    WebTel= \'' + form.Webtel + '\', \
                    WebEmail = \'' + form.Webemail + '\' \
                    WHERE SettingId=1';
                    database.RunQuery(UpdateSettings,Sequelize.QueryTypes.UPDATE,(updateSet)=>[
                        res.redirect('/SellerCenter/Setwebsite/Settings?')
                    ]);
        }else{
            const UpdateSettings='\
            UPDATE Settings\
                SET WebName = \'' + form.Webname + '\', \
                    WebAddress = \'' + form.Webaddress + '\', \
                    WebTel= \'' + form.Webtel + '\', \
                    WebEmail = \'' + form.Webemail + '\' \
                    WHERE SettingId=1';
            database.RunQuery(UpdateSettings,Sequelize.QueryTypes.UPDATE,(updateSet)=>[
                res.redirect('/SellerCenter/Setwebsite/Settings?')
            ]);
        }
    });

router.route('/Setwebsite/Settings/EditLink')
    .post(IsAdmin,function (req, res, next) {
        const img=req.file;
        var form=req.body;
        if(form.Facebook==""){
            form.Facebook=""
        }
        if(form.Line==""){
            form.Line=""
        }
        if(form.Ig==""){
            form.Ig=""
        }
        if(form.Tiktok==""){
            form.Tiktok=""
        }
        const UpdateFacebook="\
            UPDATE SocialMedia\
                SET SrcSocialMeida='"+ form.Facebook+"' WHERE SocialMediaId=1";
        database.RunQuery(UpdateFacebook,Sequelize.QueryTypes.UPDATE,(UpdateFacebook)=>{
            const UpdateLine="\
            UPDATE SocialMedia\
                SET SrcSocialMeida='" + form.Line +"' WHERE SocialMediaId=2";
            database.RunQuery(UpdateLine,Sequelize.QueryTypes.UPDATE,(UpdateLine)=>{
                const UpdateIg="\
                UPDATE SocialMedia\
                    SET SrcSocialMeida='"+ form.Ig +"' WHERE SocialMediaId=3";
                database.RunQuery(UpdateIg,Sequelize.QueryTypes.UPDATE,(UpdateIg)=>{
                    const UpdateTiktok="\
                    UPDATE SocialMedia\
                        SET SrcSocialMeida='" + form.Tiktok +"' WHERE SocialMediaId=4";
                    database.RunQuery(UpdateTiktok,Sequelize.QueryTypes.UPDATE,(updateTiktok)=>{
                        res.redirect('/SellerCenter/Setwebsite/Settings?')
                    });
                });
            });
         });
    });

router.route('/Banks')
    .get(IsAdmin, function (req, res,next) {
        const selectWebset="SELECT * FROM Settings;"
        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
            const selectBanks="SELECT * FROM Banks;"
            database.RunQuery(selectBanks,Sequelize.QueryTypes.SELECT,(Banks)=>{
                const selectAcbanks="SELECT * FROM AccountBanks natural join Banks;"
                database.RunQuery(selectAcbanks,Sequelize.QueryTypes.SELECT,(AcBanks)=>{
                    res.render('Admin/Banks', {
                        title: "บัญชีธนาคาร",
                        Admin: req.user,
                        SetWeb:Settings[0],
                        Bank:Banks,
                        AcBank:AcBanks,
                        ErBank:req.flash('Banks')
                    }); 
                });
            });
        });
    });

router.route('/Banks/Add')
    .post(IsAdmin,UploadQrcode.single('qrcode'),function (req, res, next) {
        const img=req.file;
        var form=req.body;
        //console.log(img);
        if(img !=undefined){
            const InsertBank='\
            INSERT INTO AccountBanks\
                VALUES (null,\
                \'' + form.BankNumber + '\', \
                \'' + form.AccountName + '\', \
                \'' + img.filename + '\', \
                \'' + form.bank  + '\')';
                database.RunQuery(InsertBank,Sequelize.QueryTypes.INSERT,(banks)=>{
                    res.redirect('/SellerCenter/Banks')
                });
        }else{
        const InsertBank='\
            INSERT INTO AccountBanks\
            VALUES (null,\
                \'' + form.BankNumber + '\', \
                \'' + form.AccountName + '\', \
                \'' + null + '\', \
                \'' + form.bank  + '\')';
            database.RunQuery(InsertBank,Sequelize.QueryTypes.INSERT,(banks)=>{
                res.redirect('/SellerCenter/Banks')
            });
        }
    });

router.route('/Banks/:id/Edit')
    .post(IsAdmin,UploadQrcode.single('qrcode'),function (req, res, next) {
        const img=req.file;
        var form=req.body;
        if(img !=undefined){
            const InsertBank='\
            UPDATE AccountBanks\
            SET BankNumber = \'' + form.BankNumber+ '\', \
                AccountName = \'' + form.AccountName + '\', \
                BankId = \'' + form.bank+ '\', \
                QrImg = \'' + img.filename + '\' \
                WHERE AccountBankId='+req.params.id;
                database.RunQuery(InsertBank,Sequelize.QueryTypes.UPDATE,(banks)=>{
                    res.redirect('/SellerCenter/Banks')
                });
        }else{
            const InsertBank='\
            UPDATE AccountBanks\
            SET BankNumber = \'' + form.BankNumber+ '\', \
                BankId = \'' + form.bank+ '\', \
                AccountName = \'' + form.AccountName + '\' \
                WHERE AccountBankId='+req.params.id;
            database.RunQuery(InsertBank,Sequelize.QueryTypes.UPDATE,(banks)=>{
                res.redirect('/SellerCenter/Banks')
            });
        }
    });

router.route('/Banks/:id/Delete')
    .post(IsAdmin,function (req, res, next) {
        const SelectBank="SELECT OrderId,AccountBankId FROM Orders where AccountBankId="+req.params.id;
        database.RunQuery(SelectBank, Sequelize.QueryTypes.SELECT,function (Bank) {
            if (Bank.length > 0) {
                req.flash('Banks','ไม่สามารถลบได้ เนื่องจากข้อมูลธนาคารถูกใช้อยู่ในหมายเลขคำสั่งซื้อ');
                res.redirect('/SellerCenter/Banks')
            }
            else{
                const DeleteBanks='\
                DELETE FROM AccountBanks\
                WHERE AccountBankId = ' + req.params.id;
                database.RunQuery(DeleteBanks,Sequelize.QueryTypes.DELETE,(banks)=>{
                    res.redirect('/SellerCenter/Banks')
                });
            }
        });
    });

router.route('/Info')
    .get(IsAdmin, function (req, res,next) {
        const selectWebset="SELECT * FROM Settings;"
        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
            const selectTranB="SELECT * FROM TranshipBangkok;"
            database.RunQuery(selectTranB,Sequelize.QueryTypes.SELECT,(Bangkok)=>{
                const selectTranP="SELECT * FROM TranshipProvince;"
                database.RunQuery(selectTranP,Sequelize.QueryTypes.SELECT,(Province)=>{
                    const selectService="SELECT * FROM Services;"
                    database.RunQuery(selectService,Sequelize.QueryTypes.SELECT,(service)=>{
                        const selectU="SELECT * FROM Users where Username="+"'"+req.user.Username+"'";
                        database.RunQuery(selectU,Sequelize.QueryTypes.SELECT,(admin)=>{
                            res.render('Admin/SettingsAdmin', {
                                title: "จัดการข้อมูลส่วยตัว",
                                Admin: req.user,
                                SetWeb:Settings[0],
                                Bangkoks:Bangkok,
                                Provinces:Province,
                                services:service,
                                admin:admin,
                            }); 
                        });
                    });
                });
            });
        });
    });

router.route('/Info/UpdateBangkok')
    .post(IsAdmin, function (req, res,next) {
        var form=req.body;
        const selectTranB="SELECT * FROM TranshipBangkok;"
        database.RunQuery(selectTranB,Sequelize.QueryTypes.SELECT,(Bangkok)=>{
            //console.log(Bangkok.length)
            for (var item=0;item<Bangkok.length;item++) {
                const UpdateBangkok='\
                UPDATE TranshipBangkok\
                SET TranshportTotal = \'' + form.TranshportTotal[item]+ '\', \
                    TransportShip = \'' + form.TransportShip[item] + '\', \
                    tranship = \'' + form.tranship[item] + '\' \
                    where TranshipBangkokId='+form.TranshipBangkokId[item];
                database.RunQuery(UpdateBangkok,Sequelize.QueryTypes.UPDATE,(bangkok)=>{
                    //console.log(bangkok,UpdateBangkok);
                });
            }
            res.redirect('/SellerCenter/Info');
        });
    });

router.route('/Info/UpdateProvince')
    .post(IsAdmin, function (req, res,next) {
        var form=req.body;
        const selectTranB="SELECT * FROM TranshipProvince;"
        database.RunQuery(selectTranB,Sequelize.QueryTypes.SELECT,(Provin)=>{
            //console.log(Provin.length)
            for (var item=0;item<Provin.length;item++) {
                const UpdateBangkok='\
                UPDATE TranshipProvince\
                SET TranshportTotal = \'' + form.TranshportTotal[item]+ '\', \
                    TransportShip = \'' + form.TransportShip[item] + '\', \
                    tranship = \'' + form.tranship[item] + '\' \
                    where TranshipProvinceId='+form.TranshipProvinceId[item];
                database.RunQuery(UpdateBangkok,Sequelize.QueryTypes.UPDATE,(bangkok)=>{
                    //console.log(bangkok,UpdateBangkok);
                });
            }
            res.redirect('/SellerCenter/Info');
        });
    })

router.route('/Info/Services')
    .post(IsAdmin,(req,res,next)=>{
        const form=req.body;
        const UpServices='\
        UPDATE Services\
            SET ServicesShip = \'' + form.Services + '\' \
            WHERE ServicesId= 1';
        database.RunQuery(UpServices,Sequelize.QueryTypes.UPDATE, function (Services) {
            res.redirect('/SellerCenter/Info');
        });
    });

router.route('/Info/Email')
    .post(IsAdmin,(req,res) =>{
        var form = req.body;
        var selectQuery = 'SELECT *\
        FROM Users\
        WHERE Email = \'' + form.email + '\'';
        database.RunQuery(selectQuery,Sequelize.QueryTypes.SELECT, function (emailRows) {
            const selectWebset="SELECT * FROM Settings;"
            database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
                const selectTranB="SELECT * FROM TranshipBangkok;"
                database.RunQuery(selectTranB,Sequelize.QueryTypes.SELECT,(Bangkok)=>{
                    const selectTranP="SELECT * FROM TranshipProvince;"
                    database.RunQuery(selectTranP,Sequelize.QueryTypes.SELECT,(Province)=>{
                        const selectService="SELECT * FROM Services;"
                        database.RunQuery(selectService,Sequelize.QueryTypes.SELECT,(service)=>{
                            const selectU="SELECT * FROM Users where Username="+"'"+req.user.Username+"'";
                            database.RunQuery(selectU,Sequelize.QueryTypes.SELECT,(admin)=>{
                                if (bcrypt.compareSync(form.password, req.user.Password)) {
                                    if (emailRows.length > 0) {
                                        req.flash('Email', 'อีเมลนี้ถูกใช้ไปแล้วไม่สามารถใช้ซ้ำได้');
                                        //console.log(emailRows);
                                    }else{
                                        var updateQuery = '\
                                        UPDATE Users\
                                        SET Email = \'' + form.email + '\' \
                                        WHERE UserId= ' + req.user.UserId;
                                        database.RunQuery(updateQuery,Sequelize.QueryTypes.UPDATE, function (result) {
                                        });
                                        res.redirect('/SellerCenter/Info');
                                    }    
                                }else{
                                    req.flash('Email', 'รหัสผ่านของท่านไม่ถูกต้อง');
                                }
                                res.render('Admin/SettingsAdmin', {
                                    title: "จัดการข้อมูลส่วยตัว",
                                    Admin: req.user,
                                    SetWeb:Settings[0],
                                    Bangkoks:Bangkok,
                                    Provinces:Province,
                                    services:service,
                                    admin:admin,
                                    Email: req.flash('Email'),
                                }); 
                            });
                        });
                    });
                });
            });
        });
    });

router.route('/Info/Password')
    .post(IsAdmin,(req,res) =>{
        var form = req.body;
        const selectWebset="SELECT * FROM Settings;"
        database.RunQuery(selectWebset,Sequelize.QueryTypes.SELECT,(Settings)=>{
            const selectTranB="SELECT * FROM TranshipBangkok;"
            database.RunQuery(selectTranB,Sequelize.QueryTypes.SELECT,(Bangkok)=>{
                const selectTranP="SELECT * FROM TranshipProvince;"
                database.RunQuery(selectTranP,Sequelize.QueryTypes.SELECT,(Province)=>{
                    const selectService="SELECT * FROM Services;"
                    database.RunQuery(selectService,Sequelize.QueryTypes.SELECT,(service)=>{
                        const selectU="SELECT * FROM Users where Username="+"'"+req.user.Username+"'";
                        database.RunQuery(selectU,Sequelize.QueryTypes.SELECT,(admin)=>{
                            if (form.newPassword == form.repeatPassword) {
                                if (bcrypt.compareSync(form.currentPassword, req.user.Password)) {
                                    var passwordHash = bcrypt.hashSync(form.newPassword, null, null);
                                    var updateQuery = '\
                                    UPDATE Users\
                                    SET Password = \'' + passwordHash + '\' \
                                    WHERE UserId = ' + req.user.UserId;

                                    database.RunQuery(updateQuery,Sequelize.QueryTypes.UPDATE, function (result) {
                                    });
                                    res.redirect('/SellerCenter/Info');
                                }
                                else {
                                    //password wrong
                                    req.flash('Password', 'รหัสผ่านเดิมของท่านไม่ถูกต้อง กรุณากรอกใหม่');
                                
                                }
                            }
                            else {
                                //passwords are not matched
                                req.flash('Password', 'รหัสผ่านใหม่ของท่านไม่ตรงกัน');
                            }
                            res.render('Admin/SettingsAdmin', {
                                title: "จัดการข้อมูลส่วยตัว",
                                Admin: req.user,
                                SetWeb:Settings[0],
                                Bangkoks:Bangkok,
                                Provinces:Province,
                                services:service,
                                admin:admin,
                                Pass: req.flash('Password'),
                            }); 
                        });
                    });
                });
            });
        });

    });
module.exports = router;