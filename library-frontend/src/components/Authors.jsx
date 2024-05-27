import { useMutation, useQuery } from "@apollo/client";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";
import { useState } from "react";

const AuthorBirthYear = ({ authors }) => {
  const [author, setAuthor] = useState("");
  const [year, setYear] = useState("");

  const [editAuthor] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const selectEvent = (e) => {
    e.preventDefault();
    setAuthor(e.target.value);
  };

  const yearEvent = (e) => {
    e.preventDefault();
    setYear(e.target.value);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    editAuthor({ variables: { name: author, born: parseInt(year) } });
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Edit author</h2>
      <select value={author} onChange={selectEvent}>
        {authors.map((a) => (
          <option key={a.name} value={a.name}>
            {a.name}
          </option>
        ))}
      </select>
      <input type="number" value={year} onChange={yearEvent}></input>
      <button type="submit">Update author</button>
    </form>
  );
};

const Authors = ({ show, loggedIn }) => {
  const authorsResult = useQuery(ALL_AUTHORS);

  if (!show) {
    return null;
  }

  if (authorsResult.loading) return <div>loading...</div>;

  const authors = authorsResult.data.allAuthors;

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
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {loggedIn && <AuthorBirthYear authors={authors}></AuthorBirthYear>}
    </div>
  );
};

export default Authors;
