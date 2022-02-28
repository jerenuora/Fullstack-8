import { ALL_BOOKS } from '../queries'
import { useQuery } from '@apollo/client'
import { useState } from 'react'
const Books = ({ show }) => {
  const books = useQuery(ALL_BOOKS)
  const [genreToShow, setGenresToShow] = useState(null)

  if (!show) {
    return null
  }
  if (books.loading) {
    return <div>loading...</div>
  }

  const booksToShow = books.data.allBooks
  const genres = new Set(
    booksToShow.reduce((list, book) => list.concat(book.genres), [])
  )
  const genreButtons = [...genres].map((genre) => {
    return <button key={genre} onClick={() => setGenresToShow(genre)}>{genre}</button>
  })

  console.log(genreToShow)
  console.log(booksToShow)
  let booksByGenre = booksToShow

  if (genreToShow) {
    booksByGenre = booksToShow.filter((book) =>
      book.genres.includes(genreToShow) ? book : null
    )
  }
  return (
    <div>
      <h2>books by genre {genreToShow}</h2>
      {genreButtons}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksByGenre.map((a) => (
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
