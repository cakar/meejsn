const mongoose = require('mongoose')
const Book = require("./book")
const authorSchema = mongoose.Schema({
    name: {type:String, required:true}
})

authorSchema.pre("remove", function(next){
    Book.find({author: this.id}, (err, books)=>{
        if(err){  // error retreieving books
            next(err)
        } else if(books.length > 0){  // can not delete authors with books assigned to it
            next(new Error("this author still has books"))
        }else{
            next() // ok to delete author
        }
    })
})
module.exports = mongoose.model('Author', authorSchema)