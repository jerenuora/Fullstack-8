const { UserInputError, AuthenticationError } = require('apollo-server')
const jwt = require('jsonwebtoken')
const Author = require('./models/author')
const Book = require('./models/book')
const User = require('./models/user')
const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const JWT_SECRET = 'a-secret_key.here'

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
          
          pubsub.publish('BOOK_ADDED', { bookAdded: book })

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
      },
      Subscription: {
        bookAdded: {
          subscribe: () => pubsub.asyncIterator(['BOOK_ADDED'])
        },
      },
    
  }

module.exports = resolvers
