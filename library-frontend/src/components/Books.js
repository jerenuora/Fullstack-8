import { ALL_BOOKS, ALL_BOOKS_OF_GENRE } from '../queries'
import { useQuery } from '@apollo/client'
import { useState } from 'react'
const Books = ({ show }) => {
  const books = useQuery(ALL_BOOKS)
  const [genreToFind, setGenresToShow] = useState('')

  let booksByGenre = useQuery(ALL_BOOKS_OF_GENRE, {
    variables: { genreToFind }
  })

  if (!show) {
    return null
  }
  if (booksByGenre.loading) {
    return <div>loading...</div>
  }

  const genres = new Set(
    books.data.allBooks.reduce((list, book) => list.concat(book.genres), [])
  )
  const genreButtons = [...genres].map((genre) => {
    return <button key={genre} onClick={() => setGenresToShow(genre)}>{genre}</button>
  })


  const booksToShow = booksByGenre.data.allBooks
  
  return (
    <div>
      <h2>books by genre {genreToFind}</h2>
      {genreButtons}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
