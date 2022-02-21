import { useQuery, useMutation } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, EDIT_BORN } from '../queries'
import { useState } from 'react'

const Authors = ({ show }) => {
  const authors = useQuery(ALL_AUTHORS)
  const [born, setBorn] = useState('')
  const [name, setName] = useState('')

  const [editBorn] = useMutation(EDIT_BORN, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
    onError: (error) => {
      console.log(error)
    },
  })

  if (!show) {
    return null
  }


  if (authors.loading) {
    return <div>loading...</div>
  }
  const submit = async (event) => {
    event.preventDefault()
    const bornInt = parseInt(born)
    editBorn({ variables: { name, setBornTo: bornInt } })
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
              <tr key={a.id}>
                <td>{a.name}</td>
                <td>{a.born}</td>
                <td>{a.bookCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <h3>Set year born</h3>
        <form onSubmit={submit}>
          <div>
            name
            <input
              value={name}
              onChange={({ target }) => setName(target.value)}
            />
          </div>
          <div>
            born
            <input
              value={born}
              onChange={({ target }) => setBorn(target.value)}
            />
            
          </div>
          <button type="submit">Set born</button>

        </form>
      </div>
    )
  
}

export default Authors
