require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path');
const app = express();
const port = process.env.PORT||3000;

mongoose.connect(process.env.MONGO_URL)
.then(()=> console.log("Mongodb Connected"))
.catch((err) => console.log("Mongo err" , err));

app.use(express.static(path.join(__dirname,'static')))
app.use(express.json()) 
const UserSchema =new mongoose.Schema({
    title:{
        type:String,
        required: true 
    }, 
    description:{
        type:String
    }
})

const User = mongoose.model('user',UserSchema)


function generateItemsHTML(items) {
    let html = '';
    items.forEach((item, index) => {
        html += `
            <tr>
                <th scope="row">${index + 1}</th>
                <td>${item.title}</td>
                <td>${item.description}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="deleteitem('${item._id}')">Delete</button>
                    <button class="btn btn-primary btn-sm" ><a style="color:white; text-decoration:none" href="/edititem/:${item._id}">Edit</a></button>
                </td>
            </tr>
        `;
    });
    
    return html;
}

app.get('/', async (req, res) => {
    try {
        const items = await User.find({});
        const data = fs.readFileSync(path.join(__dirname, 'index.html'));
        // Pass the items data to the HTML page
        const htmlWithData = data.toString().replace('<!-- items-placeholder -->', generateItemsHTML(items));
        res.send(htmlWithData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/getitem', async (req,res)=>{
    const items = await User.find({});
    res.send(generateItemsHTML(items))
})


app.post('/submit',async (req,res)=>{
    const tit = req.body.title 
    const desc = req.body.description
// console.log(desc)
// console.log(tit)
   const result =await User.create({
        title:tit,
        description: desc
    })
    // console.log(result)
    res.status(201).json({"msg": "success"});
})
app.delete('/delete',async (req,res)=>{
    const id = req.body.Itemid
//    console.log(id);
   await User.findByIdAndDelete(id)
    res.status(201).json({"msg": "success"});
})

 
 
app.patch('/update', async ( req, res)=>{
    const id = req.body.Itemid
    const tit = req.body.title
    const desc = req.body.description
    // console.log("Inside update")
    // console.log(tit)
    // console.log(desc)
    await User.findByIdAndUpdate(id, {title:tit, description:desc})
    res.status(201)
})
app.get('/edit:id' ,(req,res)=>{
        const data = fs.readFileSync(path.join(__dirname,'edit.html'))
        res.send(data.toString())
})

// app.get('/edititem/:itemid', async (req, res) => {
//     try {
//         const id = req.params.itemid.replace(':',"");
//         const user = await User.findOne({ _id: id });

//         // Render edit.html and pass user data as a parameter
//         res.render('edit', { user }); 
//     } catch (error) {
//        console.error(error);
//        res.status(500).send("Internal Server Error");
//     }
// });


app.get('/edititem/:itemid', async (req, res) => {
    try {
        const id = req.params.itemid.replace(':',"");
       const user = await User.findOne({ _id: id });
    //    console.log(user);
    //    const descr = "hello";
    //    const data = `
    //    <h1>Edit</h1>
    //    <div id="description">${descr}</div>
    //    <input type="text"  id="updateddesc">`;
    //    res.send(data.toString());
    // res.json(user)
    res.redirect(`/edit:${id}`)  
    } catch (error) { 
       console.error(error); 
       res.status(500).send("Internal Server Error");
    }
 });

 app.get('/editdata/:itemid', async (req, res) => {
    const id = req.params.itemid.replace(':', '');
    const user = await User.findOne({ _id: id });
    console.log(user);
    console.log(typeof(user));
    const data = JSON.stringify(user)
    res.json(data);
});

app.listen(port,()=>{
    console.log(`localhost:${port}`)
})