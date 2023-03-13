var express = require('express');
var router = express.Router();
const { Sequelize } = require('sequelize');
//import database module
var database = require('../Config/Database');
const HomePageData = require('../Routes/Web');
/* Route Home page. */
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

router.all('/',async(req, res, next)=> {
    try {
    const homePageData = new HomePageData(req);
    const contextDict = await homePageData.getData();
            const selectcate="SELECT * FROM Category WHERE RefParentId = RefParentId ORDER BY CategoryName ASC;"
            database.RunQuery(selectcate,Sequelize.QueryTypes.SELECT,(category)=>{
                const Brand ="SELECT * FROM ProductBrand;"
                database.RunQuery(Brand,Sequelize.QueryTypes.SELECT,(resultBrand)=>{
                    var cate=JSON.stringify(getNestedChildren(category,0));
                    //console.log(depth);
                    const SelectProduct = "\
                    SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg\
                    FROM Products natural join ProductImg natural join Category natural join ProductBrand where ProductStatus=1 order by UpdateAt DESC";
                    database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
                         contextDict.title= 'Home';
                         contextDict.customer= req.user;
                         contextDict.categoreis=cate;
                         contextDict.Product= showdata;
                         contextDict.Brands=resultBrand;
                    res.render('index',contextDict);
            });
        });
    });
    } catch (err) {
        next(err);
    }
    //isLoggedIn(req, contextDict);

});

router.all('/All',async(req, res, next)=> {
    try {
        const homePageData = new HomePageData(req);
        const contextDict = await homePageData.getData();
        const selectcate="SELECT * FROM Category WHERE RefParentId = RefParentId ORDER BY CategoryName ASC;"
        database.RunQuery(selectcate,Sequelize.QueryTypes.SELECT,(category)=>{
            const Brand ="SELECT * FROM ProductBrand;"
            database.RunQuery(Brand,Sequelize.QueryTypes.SELECT,(resultBrand)=>{
                var cate=JSON.stringify(getNestedChildren(category,0));
                //console.log(depth);
                const SelectProduct = "\
                SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg\
                FROM Products natural join ProductImg natural join Category natural join ProductBrand order by UpdateAt DESC";
                    database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
                        contextDict.customer= req.user;
                        contextDict.title = 'Home';
                        contextDict.categoreis=cate;
                        contextDict.Product=showdata;
                        contextDict.Brands=resultBrand;
                res.render('index',contextDict);
            });
        });
    });
} catch (err) {
    next(err);
  }
    //isLoggedIn(req, contextDict);

});

/* Route Category page. */
router.route('/Product/:CategoryName/:id/:ProductName')
    .all(async function (req, res, next) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
            const SelectProduct = "\
            SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg ,\
            JSON_EXTRACT(MProductImg,'$.filename1')As productImg1,\
            JSON_EXTRACT(MProductImg,'$.filename2')As productImg2 ,JSON_EXTRACT(MProductImg,'$.filename3')As productImg3,\
            JSON_EXTRACT(MProductImg,'$.filename4')As productImg4\
            FROM Products natural join ProductImg natural join Category natural join ProductBrand where ProductId="+req.params.id;
                database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
                    contextDict.title = showdata[0].ProductName;
                    contextDict.product=showdata[0];
                    contextDict.customer= req.user;
            //console.log(contextDict);
                res.render('ProductInfo',contextDict);
            });
    } catch (err) {
        next(err);
      }
});


 /* Route Search  page. */
 router.route('/search')
 .get(async function (req, res, next) {
    try {
        const homePageData = new HomePageData(req);
        const contextDict = await homePageData.getData();
        const selectcate="SELECT * FROM Category WHERE RefParentId = RefParentId ORDER BY CategoryName ASC;"
        database.RunQuery(selectcate,Sequelize.QueryTypes.SELECT,(categories)=>{
            const Brand ="SELECT * FROM ProductBrand;"
            database.RunQuery(Brand,Sequelize.QueryTypes.SELECT,(resultBrand)=>{
                var cate=JSON.stringify(getNestedChildren(categories,0));
                var productname=req.query.Productname;
                var category=req.query.CategoryId;
                var brand=req.query.Brand;
                var sort=req.query.Sort;
                if(sort==="ASC"){
                    const SelectProduct = "\
                    SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
                    FROM Products natural join ProductImg natural join Category natural join ProductBrand\
                    where ProductName like '%"+productname+"%' and CategoryId like '%"+category+"%'\
                    and BrandId like '%"+brand+"%' order by ProductPrice "+sort;
                    database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
                    contextDict.title='search';
                    contextDict.customer=req.user;
                    contextDict.Product=showdata;
                    contextDict.categoreis=cate;
                    contextDict.Productname=productname;
                    contextDict.Sort=sort;
                    contextDict.Brands=resultBrand;
                    contextDict.Brand=brand;
                    contextDict.CategoryId=category;
                    //console.log(productname,category);
                    res.render('Search',contextDict)
                    });
                }
                if(sort==="DESC"){
                    const SelectProduct = "\
                    SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
                    FROM Products natural join ProductImg natural join Category natural join ProductBrand\
                    where ProductName like '%"+productname+"%' and CategoryId like '%"+category+"%' \
                    and BrandId like '%"+brand+"%' order by ProductPrice "+sort;
                    database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
                        contextDict.title='search';
                        contextDict.customer=req.user;
                        contextDict.Product=showdata;
                        contextDict.categoreis=cate;
                        contextDict.Productname=productname;
                        contextDict.Sort=sort;
                        contextDict.Brands=resultBrand;
                        contextDict.Brand=brand;
                        contextDict.CategoryId=category;
                    //console.log(productname,category);
                    res.render('Search',contextDict)
                    });
                }
                if(sort===""){
                    const SelectProduct = "\
                        SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
                        FROM Products natural join ProductImg natural join Category natural join ProductBrand\
                        where ProductName like '%"+productname+"%' and CategoryId like '%"+category+"%'\
                        and BrandId like '%"+brand+"%'";
                    database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
                        contextDict.title='search';
                        contextDict.customer=req.user;
                        contextDict.Product=showdata;
                        contextDict.categoreis=cate;
                        contextDict.Productname=productname;
                        contextDict.Sort=sort;
                        contextDict.Brands=resultBrand;
                        contextDict.Brand=brand;
                        contextDict.CategoryId=category;
                    //console.log(productname,category);
                    res.render('Search',contextDict)
                    });
                }
         });
     });
    }  catch (err) {
        next(err);
      }
 });
    
router.route('/search/:CategoryId/:Category_Name')
    .get(async function (req, res, next) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
            const selectcate="SELECT * FROM Category WHERE RefParentId = RefParentId ORDER BY CategoryName ASC;"
            database.RunQuery(selectcate,Sequelize.QueryTypes.SELECT,(categories)=>{
                const Brand ="SELECT * FROM ProductBrand;"
                database.RunQuery(Brand,Sequelize.QueryTypes.SELECT,(resultBrand)=>{
                    var cate=JSON.stringify(getNestedChildren(categories,0));
                    var productname=req.query.Productname;
                    var category=req.params.CategoryId;
                    var brand=req.query.Brand;
                    var sort=req.query.Sort;
                    if(category!=""){
                        const SelectProduct = "\
                        SELECT *,JSON_EXTRACT(MProductImg,'$.filename0')As productImg \
                        FROM Products natural join ProductImg natural join Category natural join ProductBrand\
                        where  CategoryId like '%"+category+"%'";
                        database.RunQuery(SelectProduct,Sequelize.QueryTypes.SELECT,(showdata)=>{
                            contextDict.title='search';
                            contextDict.customer=req.user;
                            contextDict.Product=showdata;
                            contextDict.categoreis=cate;
                            contextDict.Productname=productname;
                            contextDict.Sort=sort;
                            contextDict.Brands=resultBrand;
                            contextDict.Brand=brand;
                            contextDict.CategoryId=category;
                        //console.log(productname,category);
                        res.render('Search',contextDict)
                        });
                    }
            });
        });
        } catch (err) {
            next(err);
        }
    });

router.route('/About')
    .get(async function (req, res, next) {
        try {
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
            contextDict.title='Contact';
            contextDict.customer=req.user;
            res.render('Contact',contextDict);
        } catch (err) {
            next(err);
        }
                          
    });

module.exports = router;