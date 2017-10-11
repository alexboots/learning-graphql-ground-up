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

// Give GraphQL an 'entry point' to the data 
//  Allows GraphQL to jump and land on a specific node in our data
const RootQuery = new GraphQLObjectType({
  // 
  name: 'RootQueryType',
  fields: {
    // "You can ask me about users in the application IF
    //   you give me the ID of the user you're looking for
    //   I'll return you a user"
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      // resolve: 
      //  "Oh you're looking for a user with ID of 23
      //   Ok, i'll try and go find it"
      resolve(parentValue, args) {
        // parentValue = never really used lol 
        // args = has whatever is in args above ^ on it 
        //   (in this case `id`
        


      }
    }
  }
});

