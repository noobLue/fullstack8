/* eslint-disable react/prop-types */
import { useQuery } from "@apollo/client";
import { ALL_BOOKS } from "../queries";
import { useState } from "react";

const BookFilter = ({ filter, setFilter, genres }) => {
  const selectEvent = (e) => {
    e.preventDefault();
    setFilter(e.target.value);
  };

  return (
    <div>
      <br></br>
      <select value={filter} onChange={selectEvent}>
        <option value="">All books</option>
        {genres.map((g) => (
          <option key={g} value={g}>
            {g}
          </option>
        ))}
      </select>{" "}
      Filter by genre
    </div>
  );
};

const Books = (props) => {
  const [filter, setFilter] = useState("");
  const booksResult = useQuery(ALL_BOOKS, {
    variables: { genre: filter === "" ? undefined : filter },
  });

  if (!props.show) {
    return null;
  }

  if (booksResult.loading) return <div>loading...</div>;

  const books = booksResult.data.allBooks;
  const genres = booksResult.data.allGenres;

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
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <BookFilter
        filter={filter}
        setFilter={setFilter}
        genres={genres}
      ></BookFilter>
    </div>
  );
};

export default Books;
