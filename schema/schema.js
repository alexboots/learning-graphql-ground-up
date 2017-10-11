// We are instructing GraphQL 
//  what type of data we have in our application
const graphql = require('graphql');

// Import stuff we need
const {
  GraphQLObjectType,

  // http://graphql.org/graphql-js/type/
  GraphQLString,
  GraphQLInt

} = graphql;


// We are using GraphQLObjectType to 
//  tell GraphQL about the model of a user in our app
const UserType = new GraphQLObjectType({
  // Two required properties:
    // 1) name
  name: 'User', // Need to be a string
    // 2) fields
  fields: {
    // Tells GraphQL about all the different properties 
    //  a user (or whatever) has
    id: { type: GraphQLString },
    firstName: { type: GraphQLString },
    age: { type: GraphQLInt }
  }
});