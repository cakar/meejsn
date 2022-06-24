const express = require('express')
const Author = require('../models/author')
const router = express.Router()
const Book = require('../models/book')

const imageMimeTypes = ["image/jpeg", "image/png", "images/gif"]

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
    renderFormPage(res, new Book(), "new")
})

//show book route
router.get("/:id", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
                                .populate('author').exec()
        // console.log(book.author)
        res.render("books/show", {book:book})
    } catch (error) {
        // console.log(error)
    }
})
//edit book route
router.get("/:id/edit", async (req, res) => {
    try {
        const book = await Book.findById(req.params.id)
        const authors = await Author.find({})
    
        // console.log(authors, book.author)
        res.render("books/edit", {book:book, authors:authors})
    } catch (error) {
        // console.log(error)
    }
})

// create new book
router.post('/', async (req, res)=>{
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        pageCount: req.body.pageCount,
        publishDate: new Date(req.body.publishDate), 
        description: req.body.description
    })

    saveCover(book, req.body.cover)
    try {
        const newBook = await book.save()
        res.redirect(`books/${newBook.id}`)
    } catch {
        renderFormPage(res, book, "new", true)
    }
})

// save edit book
router.put('/:id', async (req, res)=>{
    let book
    try {
        book = await Book.findById(req.params.id)
        book.title = req.body.title
        book.author = req.body.author
        book.publishDate = req.body.publishDate
        book.pageCount = req.body.pageCount
        book.description = req.body.description
        if(req.body.cover != "null" && req.body.cover != ""){
            // console.log(req.body.cover)
            saveCover(book, req.body.cover)
        }
        await book.save()
        res.redirect(`/books/${book.id}`)
    } catch (error) {
        if(book.id != null){  // back to edit page
            renderFormPage(res, book, "edit", true)
        } else{
            res.redirect("/")
        }
    }
})

//delete book route 
router.delete("/:id", async (req,res) => {
    let book
    try {
        book = await Book.findById(req.params.id)
        await book.remove()
        res.redirect("/books")
    } catch (error) {
        if(book != null){
            res.render("/books/show/", {
                book:book,
                errorMessage: "Could not remove book"
            })
        } else {
            res.redirect("/")
        }
    }
})
async function renderFormPage(res, book, form, hasError = false){
    try {
        const authors = await Author.find({})
        const params = {
            authors: authors,
            book: book
        }
        const msg = form == "edit" ? "updating" : "creating"
        if(hasError) params.errorMessage = "Error "+ msg +" book"
        res.render('books/'+form, params)

    } catch (error) {
        res.redirect('/books')
    }
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null ) return
    const cover = JSON.parse(coverEncoded)
    if(cover != null && imageMimeTypes.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, "base64")
        book.coverImageType = cover.type
    }
}

module.exports = router