const { ApolloServer } = require("@apollo/server");
const { startStandaloneServer } = require("@apollo/server/standalone");
const { default: mongoose } = require("mongoose");
const jwt = require("jsonwebtoken");
const Book = require("./models/Book");
const Author = require("./models/Author");
const { GraphQLError } = require("graphql");
const User = require("./models/User");

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

  type User {
    username: String!
    favoriteGenre: String
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    bookCount: Int!
    personsCount: Int!
    allGenres: [String]!
    allBooks(author: String, genre: String): [Book]!
    allAuthors: [Author]!
    me: User
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String]!
    ): Book
    editAuthor(
      name: String!
      born: Int!
    ): Author
    createUser(
      username: String!
      favoriteGenre: String!
    ): User
    login(
      username: String!
      password: String!
    ): Token
  }
`;

const resolvers = {
  Query: {
    bookCount: async () => Book.collection.countDocuments(),
    personsCount: () => Author.collection.countDocuments(),
    allGenres: async (root, args) => {
      const books = await Book.find({});
      const genreList = books.reduce((acc, curr) => {
        return acc.concat(curr.genres);
      }, []);

      return genreList.filter(
        (genre, index, array) => array.indexOf(genre) === index
      );
    },
    allBooks: async (root, args) => {
      let obj = {};
      // obj.genres = { $all: [args.genre1, args.genre2] }; // For matching multiple genres
      if (args.genre) obj.genres = args.genre; // For matching one genre
      if (args.author) obj.author = args.author;
      return Book.find(obj).populate("author");
    },
    allAuthors: async () => Author.find({}),
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Author: {
    name: (root) => root.name,
    bookCount: async (root) =>
      Book.collection.countDocuments({ author: root._id }),
  },
  Mutation: {
    addBook: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("User not logged in");
      }

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
    editAuthor: async (root, args, context) => {
      if (!context.currentUser) {
        throw new GraphQLError("User not logged in");
      }

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
    createUser: async (root, args) => {
      const user = await new User({ ...args });

      return user.save().catch((error) => {
        throw new GraphQLError("failed to create user", {
          extensions: {
            code: "BAD_USER_INPUT",
            invalidArgs: args.username,
            error,
          },
        });
      });
    },
    login: async (root, args) => {
      const user = await User.findOne({ username: args.username });

      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        });
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, process.env.JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

startStandaloneServer(server, {
  listen: { port: 4000 },
  context: async ({ req, res }) => {
    const auth = req ? req.headers.authorization : null;
    const prefix = "Bearer ";
    if (auth && auth.startsWith(prefix)) {
      const decodedToken = jwt.verify(
        auth.substring(prefix.length),
        process.env.JWT_SECRET
      );
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
}).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
