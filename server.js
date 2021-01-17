const express = require('express')
//require graphQL into server - used to be called expressGraphQL
const { graphqlHTTP } = require('express-graphql')
//import to create queries for graphql
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require ('graphql')
const app = express()

const authors = [
	{ id: 1, name: 'J. K. Rowling' },
	{ id: 2, name: 'J. R. R. Tolkien' },
	{ id: 3, name: 'Brent Weeks' }
]

const books = [
	{ id: 1, name: 'Harry Potter and the Chamber of Secrets', authorId: 1 },
	{ id: 2, name: 'Harry Potter and the Prisoner of Azkaban', authorId: 1 },
	{ id: 3, name: 'Harry Potter and the Goblet of Fire', authorId: 1 },
	{ id: 4, name: 'The Fellowship of the Ring', authorId: 2 },
	{ id: 5, name: 'The Two Towers', authorId: 2 },
	{ id: 6, name: 'The Return of the King', authorId: 2 },
	{ id: 7, name: 'The Way of Shadows', authorId: 3 },
    { id: 8, name: 'Beyond the Shadows', authorId: 3 }
]
    
// contents of the book type that will go into the schema
const BookType = new GraphQLObjectType ({
    name: 'Book',
    description: 'Book written by an author',
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt) },
        name: {type: GraphQLNonNull(GraphQLString)},
        authorId: {type: GraphQLNonNull(GraphQLInt) },
        // allowing to find author on the query using the resolve method
        //telling the book type how to find authorType from the book
        author: {
            type: AuthorType,
            //creating authorType using the resolve method
            // resolve takes a parent and an argument, for our case, the parent is the book
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId )
            }
        }
    })
})

//create / define an const authorType
const AuthorType = new GraphQLObjectType ({
    name: 'Author',
    description: 'Author of a book',
    // function is needed in the field to call other consts, if not then it will be undefined
    fields: () => ({
        id: {type: GraphQLNonNull(GraphQLInt) },
        name: {type: GraphQLNonNull(GraphQLString)},
        //creating a new field to see authors with book name
        books: {
            type: new GraphQLList(BookType),
        // past a resolve to see booktype on the query for authors, the parent on the resolve function will be author
            resolve: (author) => {
            //to return list of all the books for the author
            return books.filter(book => book.authorId === author.id)
            } 
         }
    })
})


//create root query that contains a list of books already
const RootQueryType = new GraphQLObjectType ({
    name: 'Query',
    description: 'Root Query',
    // function is needed in the field to call other consts, if not then it will be undefined
    fields: () => ({
        //create a single book query
        book: {
            //returns a single list of a book
            type: BookType,
            description: 'Single Book',
            // dont want a parent, instead want to pass an argument... to be defined in a object
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList (BookType),
            description: 'List of Books',
            resolve: () => books
        },
    //creating an authors query
        authors: {
            type: new GraphQLList (AuthorType),
            description: 'List of Authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'Single author',
            // dont want a parent, instead want to pass an argument... to be defined in a object
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
            
        }
    })

})

// creating mutations for rootquery which allows you to do crud operations in a sense
const RootMutationType = new GraphQLObjectType ({
   name: 'Mutation',
   description: 'Root Mutation',
   // what you want to mutate (add, update, remove)
   fields: () => ({
       addBook: {
           type: BookType,
           description: 'add a book',
           args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                authorId: {type: GraphQLNonNull(GraphQLInt)},
           },
           // resolve will add data to query instead of showing current
           resolve: (parent, args) => {
               //create a book object
               const book = { id:books.length + 1, name: args.name, authorId: args.authorId }
               //adds book to array
               books.push(book)
               //retuns a book object
               return book
               // since its not added on a database, the newly added book will be deleted once the server restarts
               // to add a new one, follow this example

            /* {mutation {
            addBook (name: "New Name", authorId: 1)
            { 
                id
		        name
            }
            } */
           }
       },
       //creating mutation to add author
       addAuthor: {
        type: AuthorType,
        description: 'add a author',
        args: {
             name: {type: GraphQLNonNull(GraphQLString)}
        },
        // resolve will add data to query instead of showing current
        resolve: (parent, args) => {
            //create a author object
            const author = { id: authors.length + 1, name: args.name }
            //adds author to array
            authors.push(author)
            //returns a author object
            return author
            // since its not added on a database, the newly added author will be deleted once the server restarts
              // to add a new one, follow this example
            /*
            mutation {
                addAuthor (name: "New Author") 
                { 
                    id
		            name
                }
            }
            */
        }
    }
    //update and remove comming soon
    /*
    removeAuthor: {
        type: AuthorType,
        description: 'remove a author by id',
        args: {
             name: {type: GraphQLNonNull(GraphQLString)}
        },
        // resolve will add data to query instead of showing current
        resolve: (parent, args) => {
            //create a author object
            const author = { id: authors.length + 1, name: args.name }
            //adds author to array
            authors.pop()
            //returns a author object
            return author
            // since its not added on a database, the newly added author will be deleted once the server restarts
              // to add a new one, follow this example
            /*
            mutation {
                addAuthor (name: "New Author") 
                { 
                    id
		            name
                }
            }
            */
   })
})



// creating a schema for the booktype
const schema = new GraphQLSchema ({
    query: RootQueryType,
    mutation: RootMutationType
})



//app use -- leave object empty since we have nothing to pass through yet
app.use('/graphql', graphqlHTTP({
    //provides ui to access
    graphiql: true,
    //allows to have the schema interface
    schema: schema
}))

app.listen (5000., () => console.log('Server running'))