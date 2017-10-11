// We are instructing GraphQL 
//  what type of data we have in our application
const graphql = require('graphql');
const axios = require('axios');

// Import stuff we need
const {
  GraphQLObjectType,

  // http://graphql.org/graphql-js/type/
  GraphQLString,
  GraphQLInt,

  // used to make the schema
  GraphQLSchema
} = graphql;

// Important to define this above company type - get to why later.
//  Order of definition is a thing
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: {
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString }
  }
});

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
    age: { type: GraphQLInt },
    company: {
      type: CompanyType,
      resolve(parentValue, args) {
        const { companyId } = parentValue;
        // So user data looks like 
        //   parentValue { id: '3', firstName: 'Alex', age: 20, companyId: 2 }
        // use that to grab company info from endpoint
        return axios.get(`http://localhost:3000/companies/${companyId}`)
          .then(response => response.data)

        // We can now ask for all the company data in GraphQL query
        //  name / description etc. 
      }
    }
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
        //   (in this case `id`)

        // We should always be returning 
        //  a promise from this resolve functon
                          // set up json-server with data for this
        return axios.get(`http://localhost:3000/users/${args.id}`)
          // axios returns stuff in { data: { blah:{} } } object, need to get it outta there
          .then(response => response.data)
      }
    }
  }
});


module.exports = new GraphQLSchema({
  query: RootQuery
});


