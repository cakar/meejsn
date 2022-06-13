const express = require('express')
const router = express.Router()
const Author = require('../models/author')
const Book = require('../models/book')

// get all authors
router.get("/", async (req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ''){
        searchOptions.name = new RegExp(req.query.name, 'i')
    }
    try {
        const authors = await Author.find(searchOptions)
        // const count = await Author.countDocuments({name:{ $ne:""}}) // not null docs
        res.render('authors/index', {authors:authors, searchOptions: req.query})
    } catch (error) {
        console.log(error)
        res.redirect('/')
    }
})

//new author route
router.get("/new", (req, res) => {
    res.render("authors/new", {author: new Author()})
})
router.get("/:id", async (req, res) => {
    try {
        const booksByAuthor = await Book.find({author:req.params.id})
        const author = await Author.findById(req.params.id)
    
        res.render("authors/show", {author:author,books:booksByAuthor})
    } catch (error) {
        console.log(error)
    }
})
router.get("/:id/edit", async (req, res) => {
    try {
        const author = await Author.findById(req.params.id)
        res.render("authors/edit", {author: author})
        
    } catch (error) {
        res.redirect("/authors")
    }
})
router.delete("/:id", async (req, res) => {
    let author
    try {
        author = await Author.findById(req.params.id)
        await author.remove()
        res.redirect("/authors")
    } catch (error) {
        if(author == null) res.redirect("/")
        else {
            res.redirect(`/authors/${author.id}`)
        }          
    }
})

// create new author
router.post('/', async (req, res)=>{
    const author = new Author({
        name: req.body.name
    })
    try {
        const newAuthor = await author.save()
        res.redirect(`authors/${newAuthor.id}`)
    } catch (error) {
        res.render('authors/new', {
            author: author,
            errorMessage: 'Error creating author'
        })    
    }
})

// update author
router.put('/:id', async (req, res)=>{
    let author
    try {
        author = await Author.findById(req.params.id)
        author.name = req.body.name
        await author.save()
        res.redirect(`/authors/${author.id}`)
    } catch (error) {
        if(author == null) res.redirect("/")
        else {
            res.render('/authors/edit', {
                author: author,
                errorMessage: 'Error updating author'
            })  
        }          
    }
})

module.exports = router