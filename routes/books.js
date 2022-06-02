const express = require('express')
const Author = require('../models/author')
const router = express.Router()
const Book = require('../models/book')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadPath = path.join('public', Book.coverImagePath)
const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"]
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback)=> {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
})

// get all books
router.get("/", async (req, res) => {
   let query = Book.find()
   if(req.query.title != null && req.query.title != ''){
       query = query.regex("title", new RegExp(req.query.title, 'i'))
   }
   if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
       query = query.lte("publishDate", req.query.publishedBefore)
   }
   if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
       query = query.gte("publishDate", req.query.publishedAfter    )
   }
    try {
        const books = await query.exec()
        res.render("books/index", {
        books: books,
        searchOptions: req.query
    })
   } catch (error) {
       res.redirect("/")
   } 
})

//new book route
router.get("/new", async (req, res) => {
    renderNewPage(res, new Book())
})

// create new book
router.post('/', upload.single("cover"), async (req, res)=>{
    const fileName = req.file = null?null: req.file.filename 
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        pageCount: req.body.pageCount,
        publishDate: new Date(req.body.publishDate), 
        description: req.body.description,
        coverImageName: fileName
    })

    try {
        const newBook = await book.save()
        // res.redirect(`books/${newBook.id}`)
        res.redirect(`books/`)
    } catch (error) {
        if(book.coverImageName != null){
            removeBookCover(book.coverImageName) // remove created image on error
        }
        renderNewPage(res, book, true)
    }
})

function removeBookCover(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.error(err)
    })
}
async function renderNewPage(res, book, hasError = false){
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        if(hasError) params.errorMessage = "Error creating book"
        res.render('books/new', params)

    } catch (error) {
        res.redirect('/books')
    }
}
module.exports = router