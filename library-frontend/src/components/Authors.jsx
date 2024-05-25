import { useQuery, gql } from "@apollo/client";

const ALL_AUTHORS = gql`
  query AllAuthors {
    allAuthors {
      name
      bookCount
      born
    }
  }
`;

const Authors = (props) => {
  const authors_result = useQuery(ALL_AUTHORS);

  if (!props.show) {
    return null;
  }

  if (authors_result.loading) {
    return <div>loading...</div>;
  }

  const authors = authors_result.data.allAuthors;

  console.log(authors);

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
    </div>
  );
};

export default Authors;
