// Export get parameter from App.js and Passport.js
const database = require('../Config/Database');
module.exports = (app, passport)=> {
// database module
const HomePageData = require('../Routes/Web');
    app.get('/SignIn', async (req, res)=>{
        // render the page and pass in any flash data if it exists
        if (req.session.inCheckOut){
            var checkOutNoti = 'กรุณาลงชื่อเข้าใช้เพื่อไปยังหน้าตะกร้า!\
                หากไม่มีบัญชีผู้ใช้งาน กรุณากดที่สมัครสมาชิก';
            req.session.inCheckOut = false;
        }
        try{
        const homePageData = new HomePageData(req);
        const contextDict = await homePageData.getData();
        contextDict.title = 'SignIn';
        console.log(contextDict);
        contextDict.signInError= req.flash('signInError');
        contextDict.checkOutNoti= checkOutNoti;
        //console.log(contextDict);
        res.render('SignIn',contextDict);
        }  catch (err) {
            console.log(err);
        }
    });

    app.post('/SignIn', passport.authenticate('SignIn', {
        successRedirect: '/AccUser/', // redirect to the secure profile section
        failureRedirect: '/SignIn', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/SignUp', async function (req, res) {
        // render the page and pass in any flash data if it exists
        if (req.session.inCheckOut){
            var checkOutNoti = 'กรุณาลงชื่อเข้าใช้เพื่อไปยังหน้าตะกร้า!\
            หากไม่มีบัญชีผู้ใช้งาน กรุณากดที่สมัครสมาชิก';
            req.session.inCheckOut = false;
        }
        try{
            const homePageData = new HomePageData(req);
            const contextDict = await homePageData.getData();
            contextDict.title='Sign Up';
            contextDict.signUpError=req.flash('signUpError');
            contextDict.checkOutNoti= checkOutNoti;
            res.render('SignUp',contextDict);
        }  catch (err) {
            console.log(err);
        }
                           

    });
    // process the signup form
    app.post('/SignUp', passport.authenticate('SignUp', {
        successRedirect: '/AccUser', // redirect to the secure profile section
        failureRedirect: '/SignUp', // redirect back to the signup page if there is an error
        failureFlash: true // allow flash messages
    }));

    app.get('/SignOut', (req, res ,next)=> {
        req.logout(next);
        res.redirect('/');
    });
    

};
