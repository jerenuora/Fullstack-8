import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
const Authors = ({ show }) => {
  const authors = useQuery(ALL_AUTHORS)

  if (!show) {
    return null
  }

  console.log(authors)

  if (authors.loading)  {
    return <div>loading...</div>
  }
  
  const authorsToShow = authors.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authorsToShow.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Authors
