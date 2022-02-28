import { ALL_BOOKS, MY_FAVORITE_GENRE  } from '../queries'
import { useQuery } from '@apollo/client'

const Recommendations =  ({ show }) => {
    const meObject =  useQuery(MY_FAVORITE_GENRE)
    const books = useQuery(ALL_BOOKS)
    if (!show | meObject.loading | books.loading) {
        return null
      }

    const favoriteGenre = meObject.data.me.favoriteGenre

    const booksToShow = books.data.allBooks
    const booksByGenre = booksToShow.filter((book) =>
    book.genres.includes(favoriteGenre) ? book : null
    )
    console.log(booksByGenre)
    if (booksByGenre.length === 0) {
        return (
            <div>
                <br/>
                Sorry, no books in <b>{favoriteGenre}</b>
            </div>
        )
    }
    return (
        <div>
          <h2>Recommendations</h2>
          Books in genre <b>{favoriteGenre}</b>, your favourite!
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

export default Recommendations