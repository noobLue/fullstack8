const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { default: mongoose } = require("mongoose");
const { v1: uuid } = require("uuid");
const Book = require("./models/Book");
const Author = require("./models/Author");
const { GraphQLError } = require("graphql");

require("dotenv").config();
const MONGODB_URI = process.env.MONGODB_URI;

console.log("connecting to", MONGODB_URI);

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("Connected to mongodb"))
  .catch((err) => console.log(err.message));

const typeDefs = `
  type Book {
    title: String!
    published: Int!
    author: Author!
    id: ID!
    genres: [String!]!
  }

  type Author {
    name: String!
    bookCount: Int!
    born: Int
  }

  type Query {
    bookCount: Int!
    personsCount: Int!
    allBooks(author: String, genre: String): [Book]!
    allAuthors: [Author]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    editAuthor(
      name: String!
      born: Int!
    ): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    personsCount: () => Author.collection.countDocuments(),
    allBooks: async (root, args) => {
      let obj = {};
      // obj.genres = { $all: [args.genre1, args.genre2] }; // For matching multiple genres
      if (args.genre) obj.genres = args.genre; // For matching one genre
      if (args.author) obj.author = args.author;
      return Book.find(obj).populate("author");
    },
    allAuthors: async () => Author.find({}),
  },
  Author: {
    name: (root) => root.name,
    bookCount: async (root) =>
      Book.collection.countDocuments({ author: root._id }),
  },
  Mutation: {
    addBook: async (root, args) => {
      let fAuthor = await Author.findOne({ name: args.author });

      if (!fAuthor) {
        try {
          fAuthor = await new Author({ name: args.author }).save();
        } catch (error) {
          throw new GraphQLError("Invalid author name", {
            extensions: {
              code: "BAD_USER_INPUT",
              invalidArgs: args.author,
              error,
            },
          });
        }
      }

      const book = await new Book({ ...args, author: fAuthor._id }).populate(
        "author"
      );

      try {
        await book.save();
      } catch (error) {
        throw new GraphQLError("Failed to add book", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.title,
            error,
          },
        });
      }

      return book;
    },
    editAuthor: async (root, args) => {
      const author = await Author.findOne({ name: args.name });
      author.born = args.born;

      try {
        await author.save();
      } catch (error) {
        throw new GraphQLError("Failed to change birthyear", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.born,
            error,
          },
        });
      }

      return author;
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
