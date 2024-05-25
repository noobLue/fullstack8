import { gql } from "@apollo/client";

export const ALL_AUTHORS = gql`
  query AllAuthors {
    allAuthors {
      name
      bookCount
      born
    }
  }
`;

// Variables seem to default to null
export const ALL_BOOKS = gql`
  query AllBooks($author: String, $genre: String) {
    allBooks(author: $author, genre: $genre) {
      author
      genres
      published
      title
    }
  }
`;
