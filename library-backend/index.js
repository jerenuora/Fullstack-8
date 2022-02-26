const { ApolloServer, gql, UserInputError, AuthenticationError } = require('apollo-server')
const mongoose = require('mongoose')

require('dotenv').config()
const jwt = require('jsonwebtoken')
const { v1: uuid } = require('uuid')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')

const MONGODB_URI = process.env.MONGODB_URI
const JWT_SECRET = 'a-secret_key.here'

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
    me: User
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
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }
  
  type Token {
    value: String!
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
      createUser(
        username: String!
        favoriteGenre: String!
      ): User
      login(
        username: String!
        password: String!
      ): Token
    
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
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser
    }
  },
  Author: {
    name: async (root, args) => {
      const author = await Author.findById(root._id)
      return author.name
    },
    bookCount: async (root, args) =>  {
      const books = await Book.find({author: root._id})
      return books.length
    }
  },
  Mutation: {
    addBook: async (root, args, context) => {
        let author = await Author.findOne({ name: args.author})
        const currentUser = context.currentUser
        if (!currentUser){
          throw new AuthenticationError('Not Authorized')
        }
        if (!author){
          const newAuthor = new Author({ name: args.author })
          try {

            author = await newAuthor.save()
          } catch(error) {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })
          }
        }
        const book = new Book({ ...args, author: author})
        try {
        await book.save()
        } catch(error) {
            throw new UserInputError(error.message, {
              invalidArgs: args,
            })
          }
        return book
    },
    editAuthor: async (root, args, context) => {
        const author = await Author.findOne({ name: args.name })
        const currentUser = context.currentUser
        if (!currentUser){
          throw new AuthenticationError('Not Authorized')
        }

        if (!author) {
            return null
        }
        author.born = args.setBornTo
        await author.save()
        return author
    },
    createUser: async (root, args) => {
      const user = new User({ username: args.username, favoriteGenre: args.favoriteGenre })
      try {
        return user.save()
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args
        })
      }
      },
      login: async (root, args) => {
        const user = await User.findOne({ username: args.username })
        if (!user || args.password !== 'password') {
          throw new UserInputError('Wrong login credentials')
        }
        const userForToken = {
          username: user.username,
          id: user._id
        }
        return { value: jwt.sign(userForToken, JWT_SECRET) } 
      }
    }
}


const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
      const decodedToken = jwt.verify(
        auth.substring(7), JWT_SECRET
      )
      const currentUser = await User.findById(decodedToken.id)
      return { currentUser }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`)
})
