import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recommendations from './components/Recommendations'
import {  useSubscription, useApolloClient } from '@apollo/client'
import { ALL_BOOKS_OF_GENRE, BOOK_ADDED } from './queries'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()
  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      console.log(subscriptionData)
      const addedBook = subscriptionData.data.bookAdded
      const message = `A new book: "${addedBook.title}" by: ${addedBook.author.name} has arrived `
      window.alert(message)
      client.cache.updateQuery({ query: ALL_BOOKS_OF_GENRE, variables: { genreToFind: "" } }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(addedBook),
        }
      })      
    }
  })
  
  if (!token) {
    return (
      <Login setToken={setToken} />

    )
  }

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommendations')}>recommendations</button>

        <button onClick={logout}>logout</button>
      </div>

      <Authors show={page === 'authors'}  />

      <Books show={page === 'books'} />

      <NewBook show={page === 'add'} />

      <Recommendations show={page === 'recommendations'} />
    </div>
  )
}

export default App
