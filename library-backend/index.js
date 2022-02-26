const { ApolloServer, gql } = require('apollo-server')
const mongoose = require('mongoose')
require('dotenv').config()
const { v1: uuid } = require('uuid')
const Author = require('./models/author')
const Book = require('./models/book')

const MONGODB_URI = process.env.MONGODB_URI

console.log('connecting to', MONGODB_URI)

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connection to MongoDB:', error.message)
  })


const typeDefs = gql`
  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(author: String, genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Book {
    title: String!
    author: Author!
    published: String!
    genres: [String!]!
    id: ID!
  }

  type Author {
    name: String!
    born: Int
    bookCount: Int
    id: ID!
  }

  type Mutation {
      addBook(
          title: String!
          author: String!
          published: Int!
          genres: [String!]!
      ): Book
      editAuthor(
          name: String!
          setBornTo: Int!
      ): Author
  }
`

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      const books = await Book.find({})
      const filterGenre = (books) => books.filter((b) => b.genres.includes(args.genre))
      const filterAuthor = (books) => books.filter((b) => b.author === args.author)
      if (!args.author && !args.genre){
        return books
      } else if (!args.genre) {
        return filterAuthor(books)
      } else if (!args.author) {
        return filterGenre(books)
      }
      return filterAuthor(filterGenre(books))
    },
    allAuthors: async () => Author.find({})
  },
  // Author: {
  //   bookCount: async (root, args) =>{
  //     return Book.collection.countDocuments()
  //   },
  //   // name: async (root, args) => {
  //   //   const author = await Author.findOne({ id: root._id })
  //   //   return author.name
  //   // }
  // },
  Mutation: {
    addBook: async (root, args) => {
        let author = await Author.findOne({ name: args.author})
        if (!author){
            let author = new Author({ name: args.author, id: uuid() })
            author.save()
            author = await Author.findOne({ name: args.author})
        }
        author = await Author.findOne({ name: args.author })
        const book = new Book({ ...args, author: author._id, id: uuid() })
        await book.save()
        return book
    },
    editAuthor: async (root, args) => {
        const author = await Author.findOne({ name: args.name })
        if (!author) {
            return null
        }
        author.born = args.setBornTo
        await author.save()
        return author
    }
}
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
