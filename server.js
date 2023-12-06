require('dotenv').config();
const express = require("express");
const app = express();
const flash = require('express-flash');
const session = require('express-session')
const methodOverride = require('method-override')

const passport = require('passport');
const users=[];



const initializePassport = require('./passport-config');
initializePassport(
    passport , 
    email =>  users.find(user => user.email===email),
    id => users.find(user => user.id===id)
    );



app.set("view engine","ejs");

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use(flash())
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/',checkAuthenticated,(req,res)=>{
    res.render('index.ejs',{name:req.user.name});
})

app.get('/login',checkNotAuthenticated,(req,res)=>{
    res.render('login.ejs');

})

app.post('/login',checkNotAuthenticated,passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true
}))

app.get('/register',checkNotAuthenticated,(req,res)=>{
    res.render('register.ejs');

})

app.post('/register',checkNotAuthenticated,(req,res)=>{

        try {
            
            users.push({
                id: Date.now().toString(),
                name: req.body.name,
                email: req.body.email,
                password: req.body.password
            })
            res.redirect('/login')
        } catch  {
            res.redirect('/register')
        }


     console.log(users)
})

app.delete('/logout',(req,res)=>{
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
})

function checkAuthenticated(req,res,next){
    if(req.isAuthenticated()){
        return next()
    }
    res.redirect('/login');
}

function checkNotAuthenticated(req,res,next){
    if(req.isAuthenticated()){
      return  res.redirect('/')
    }
    next();
}

app.listen(3000,()=>{
    console.log("Listening on port 3000");
})