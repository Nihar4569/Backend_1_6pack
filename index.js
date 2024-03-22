import express from "express";
import path from 'path'
import mongoose, { Schema } from "mongoose"
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const app = express();
const user = [];
//MiddleWare
// app.use(express.static(path.join(path.resolve(),"public")))
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//DataBase Connection
console.log("Please wait while connecting to your DataBase . . .")
mongoose.connect("mongodb://127.0.0.1:27017", {
    dbName: "backend"
}).then(() => {
    console.log("MongoDB Connected Successfully")
}).catch((e) => console.log(e));

//Schema
const userschema = new Schema({
    name: String,
    email: String,
    password: String,
})
const users = mongoose.model("Users", userschema)
//-------------------------------------------------------------------------------
//SettingUp ViewEngine
app.set("view engine", "ejs");

const isAuthenticated = async (req, res, next) => {
    const token = req.cookies.token;
    if (token) {
        const decode = jwt.verify(token, "sdjasdbajdfd")
        req.user = await users.findById(decode._id);
        console.log(decode)
        next();
    }
    else {
        res.render("login",{err:"Enter Password"})
    }
}

app.get("/", isAuthenticated, (req, res) => {
    //console.log(req.cookies.token);
    //res.render("login")//if not set ejs viewEngine then use indes.ejs
    console.log(req.user);
    res.render("logout", { name: req.user.name });
})
app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    })
    res.redirect("/")
})
app.post("/register", async (req, res) => {
    
    const {name,email,password} = req.body;
    let user = await users.findOne({ email: email });
    if (user) {
        res.redirect("login")
    }
    const hashpass = await bcrypt.hash(password,10);
    const nusers = await users.create({
        name,
        email,
        password:hashpass,
    })
    const token = jwt.sign({ _id: nusers._id }, "sdjasdbajdfd")
    console.log(req.body)
    console.log(token);
    res.cookie("token", token, {
        httpOnly: true, expires: new Date(Date.now() + 60 * 1000)
    });
    res.redirect("/");
});
app.get("/register", (req, res) => {
    res.render("register")
})
app.get("/login", (req, res) => {
    const token = req.cookies.token;
    console.log(token)
    if(token){
        res.render("logout",{name:"Nihar"})
    }
    res.render("login")
})
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    let user = await users.findOne({ email });
    if (!user) {
        return res.redirect("/register")
    }
    //const isMatch = (user.password === password)
    const isMatch = await bcrypt.compare(password,user.password);

    if (isMatch) {
        console.log("Password Matched.. Login Successful")
        const token = jwt.sign({ _id: user._id }, "sdjasdbajdfd")
        console.log(req.body)
        console.log(token);
        res.cookie("token", token, {
            httpOnly: true, expires: new Date(Date.now() + 60 * 1000)
        });
        return res.redirect("/")
    }
    if(!isMatch){
        console.log("Password didn't matched")
        res.render("login",{err:"Password didn't matched"})
    }
})
// app.get("/success",(req,res)=>{
//     res.render("success");
// })
// app.get("/add",(req,res)=>{
//     users.create({name:"Nihar",email:"sahun4569@gmail.com"}).then(()=>{
//         res.send("Data Added")
//     })
// })
// app.get("/login",(req,res)=>{
//     res.render("login")
// })


app.post("/contact", async (req, res) => {
    //const {name,email} = req.body; //Destructure

})
app.get("/user", (req, res) => {
    res.json({
        user
    })
})
app.listen(5000, () => {
    console.log("Server is working")
})