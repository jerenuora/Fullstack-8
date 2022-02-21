import { ALL_BOOKS } from '../queries' 
import { useQuery } from '@apollo/client'

const Books = ({ show }) => {
  const books = useQuery(ALL_BOOKS)

  if (!show) {
    return null
  }
  if (books.loading)  {
    return <div>loading...</div>
  }

  const booksToShow = books.data.allBooks

  return (
    <div>
      <h2>books</h2>

      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {booksToShow.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Books
