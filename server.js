const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const { authors, books } = require("./data");
const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLInt,
  GraphQLString,
  GraphQLList,
} = require("graphql");

const app = express();

const BookType = new GraphQLObjectType({
  name: "Book",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    authorId: { type: GraphQLString },
    bookAuthor: {
      type: AuthorType,
      resolve: (book) => {
        return authors.find((auth) => auth.id == book.authorId);
      },
    },
  }),
});

const AuthorType = new GraphQLObjectType({
  name: "Author",
  fields: () => ({
    id: { type: GraphQLInt },
    name: { type: GraphQLString },
    authorBooks: {
      type: GraphQLList(BookType),
      resolve: (author) => {
        return books.filter((book) => book.authorId == author.id);
      },
    },
  }),
});

const rootQueryType = new GraphQLObjectType({
  name: "Query",
  description: "All Query Data",
  fields: () => ({
    book: {
      type: BookType,
      args: { id: { type: GraphQLInt } },
      resolve: (parent, args) => books.find((b) => b.id === args.id),
    },

    allBooks: {
      type: new GraphQLList(BookType),
      resolve: () => books,
    },

    author: {
      type: AuthorType,
      args: { name: { type: GraphQLString } },
      resolve: (parent, args) =>
        authors.find((auth) => auth.name === args.name),
    },

    allAuthors: {
      type: new GraphQLList(AuthorType),
      resolve: () => authors,
    },
  }),
});

const rootMutationType = new GraphQLObjectType({
    name: "Mutation",
    description: "Mutating the data",
    fields: () => ({
      addBook: {
        type: BookType,
        args: { name: { type: GraphQLString } },
        resolve: (parent, args) => {
          const book = { id: books.length + 1, name: args.name };
          books.push(book);
          return book;
        },
      },
      addAuthor: {
        type: AuthorType,
        args: { name: { type: GraphQLString } },
        resolve: (parent, args) => {
          const author = { id: authors.length + 1, name: args.name };
          authors.push(author);
          return author;
        },
      },
    }),
  });
  
const schema = new GraphQLSchema({
  query: rootQueryType,
  mutation: rootMutationType
});

app.use(
  "/graphql",
  graphqlHTTP({
    graphiql: true,
    schema: schema,
  })
);

const PORT = 8001;
app.listen(PORT, () => console.log(`server is running in port ${PORT}`));
