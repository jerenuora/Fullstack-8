import { gql } from '@apollo/client'


export const ALL_AUTHORS = gql `
query {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`
export const ALL_BOOKS = gql `
query {
    allBooks {
      title
      author {
        name
      }
      published
      genres
      id
    }
  }
`

export const ADD_BOOK = gql `
    mutation createBook($title: String!, $author: String!, $published: Int!, $genres: [String!]!) {
        addBook(
            title: $title, 
            author: $author, 
            published: $published, 
            genres: $genres
            ) {
        title
        author {
          name
        }
        published
        genres
    }
  }
`

export const EDIT_BORN =gql `
mutation editBorn($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`

export const LOGIN = gql `
mutation($username: String!, $password: String!) {
  login(username: $username, password: $password) {
    value
  }
}
`

export const MY_FAVORITE_GENRE = gql `
query {
  me {
    favoriteGenre
  }
}
`

export const ALL_BOOKS_OF_GENRE = gql `
query allBooksByGenre($genreToFind: String!) {
  allBooks(genre:$genreToFind) {
    title
    author {
      name
    }
    published
    genres
    id

  }
}
`

export const BOOK_ADDED = gql `
subscription BookAdded {
  bookAdded {
    title
    author {
      name
    }
    genres
    published
    id
  }
}
`