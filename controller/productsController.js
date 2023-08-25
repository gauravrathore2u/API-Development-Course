const fs = require('fs');

const productsData = JSON.parse(fs.readFileSync(__dirname+'/../data/products.json'));

//get method
exports.getProducts = (req, resp)=>{
    console.log(req.timeForApi);
    resp.status(200).json({
        status: "success",
        time: req.timeForApi,
        results: productsData.length,
        data: productsData
    })
}

//post method
exports.createProduct = (req,resp)=>{
    const newId = productsData[productsData.length - 1].id + 1;
    console.log(newId);
    const newUser = Object.assign({id: newId}, req.body);
    console.log(newUser);
    productsData.push(newUser);
    fs.writeFile(`${__dirname}/data/user.json`, JSON.stringify(productsData), (err)=>{
        resp.send({
            status: 'success',
            user: newUser
        })
    })
}

//get single user method
exports.singleProduct = (req, resp)=>{    
    const id = req.params.id * 1    //multilplying it by 1 will convert string to number
    if(id >= productsData.length){
        return resp.status(404).json({   //return is important otherwise below code will also run
            status: 'failed',
            message: 'Invalid id'
        })
    }
    const user = productsData.find((user)=> user.id === req.params.id);
    resp.status(200).json({
        status:'success',
        data: {
            user: user
        }
    })                                            
}

//udating user using patch method
exports.updateProduct = (req, resp)=>{
    if(req.params.id * 1 > productsData.length){
        return resp.status(404).json({   //return is important otherwise below code will also run
            status: 'failed',
            message: 'Invalid id'
        })
    }

    resp.status(200).json({
        status:'success',
        message: "data updated successfully"
    }) 
}

//deleting user 
exports.deleteProduct  = (req, resp)=>{
    if(req.params.id * 1 > productsData.length){
        return resp.status(404).json({   //return is important otherwise below code will also run
            status: 'failed',
            message: 'Invalid id'
        })
    }
    resp.status(204).json({
        status:'success',
        data: null
    }) 
}
