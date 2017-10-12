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
  GraphQLSchema,

  // See comment in CompanyType => users => resolve
  GraphQLList,

  // Makes a field required when you're doing Mutations
  GraphQLNonNull
} = graphql;

// Important to define this above company type
//  Order of definition is a thing
const CompanyType = new GraphQLObjectType({
  name: 'Company',
  fields: () => ({
    id: { type: GraphQLString },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    users: {
      type: new GraphQLList(UserType),
      // When we go from company to user, we expect to get back 
      //  a list of users. So we have to tell GraphQL this is what
      //  we expect to get back by wrapping UserType in GraphQLList()
      resolve(parentValue, args) {
        return axios.get(`http://localhost:3000/companies/${parentValue.id}/users/ `)
          .then(response => response.data);
      }
    }
  })
});

// We are using GraphQLObjectType to 
//  tell GraphQL about the model of a user in our app
const UserType = new GraphQLObjectType({
  // Two required properties:
    // 1) name
  name: 'User', // Need to be a string
    // 2) fields
  fields: () => ({
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
  })
});

// Give GraphQL an 'entry point' to the data 
//  Allows GraphQL to jump and land on a specific node in our data
const RootQuery = new GraphQLObjectType({
  // 
  name: 'RootQueryType',
  fields: () => ({
    // "You can ask me about users in the application IF
    //   you give me the ID of the user you're looking for
    //   I'll return you a user"
    /* Eg GraphQL:
        {
          user(id: "1") {
            firstName
            age
            company {
              id
            }
          }
        }
      */
    user: {
      type: UserType,
      args: { id: { type: GraphQLString } },
      // resolve: 
      //  "Oh you're looking for a user with ID of 23
      //   Ok, i'll try and go find it"
      resolve(parentValue, args) {
        // parentValue = reference to current object we are working w/
        // args = has whatever is in args above ^ on it 
        //   (in this case `id`)

        // We should always be returning 
        //  a promise from this resolve functon
                          // set up json-server with data for this
        return axios.get(`http://localhost:3000/users/${args.id}`)
          // axios returns stuff in { data: { blah:{} } } object, need to get it outta there
          .then(response => response.data)
      }
    },
    // Can add more stuff to the Root Query so you can 
    //  now access company directly via GraphQL as well
    company: {
      /* Eg GraphQL:
        {
          company(id: "1") {
            name
            users {
              name
              company {
                name
              }
            }
          }
        }
      */
      type: CompanyType,
      args: { id: { type: GraphQLString } },
      resolve(parentValue, args) {
        console.log('args.id', args.id);
        return axios.get(`http://localhost:3000/companies/${args.id}`)
          .then(response => response.data)
      }
    }
  })
});

/*
Example mutation:

mutation {
  addUser(firstName: "asdasdasd", age: 40) {
    # You can say what you expect to get back
    id,
    firstName,
    age
  }
}
*/

const mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    // Fields in mutation describe the operation - not strict nameing
    addUser: {
      // Must have these three things (type, args, resolve)!
      type: UserType, // Referes to the type of data we will eventually 'return'.
              //  The data you are operating on won't always be the same
              //  type of data you are returning (is here though)
      args: {
        // GraphQLNonNull = required field
        firstName: { type: new GraphQLNonNull(GraphQLString) },
        age: { type: new GraphQLNonNull(GraphQLInt) },
        companyId: { type: GraphQLString }
      },
      resolve (parentValue, args) {
        const { firstName, age } = args;
        return axios.post('http://localhost:3000/users/', {
          firstName, 
          age
        })
        .then(request => request.data);
      }
    },
    /* 
    mutation {
      deleteUser(id: 2) {
        id # GraphQL exepcts to get back some usefull data, 
           #  will be null if server doesn't send anything back /shrug
      }
    }
    */
    deleteUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLInt) }
      },
      resolve (parentValue, args) {
        const { id } = args;
        return axios.delete(`http://localhost:3000/users/${id}`)
          .then(request => request.data);
      }
    },
    editUser: {
      type: UserType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLString) },
        firstName: { type: GraphQLString },
        age: { type: GraphQLInt },
        companyId: { type: GraphQLString }
      },
      resolve(parentValue, args) {
        const { id, firstName, age, companyId } = args;

        // Remember:
        // put = completely replace object w what you send
        //   this could blow away whatever you don't pass. Its overwriting.
        // patch = update only the bits of data you pass
        return axios.patch(`http://localhost:3000/users/${id}`, {
          firstName,
          age,
          companyId
        })
        .then(request => request.data);
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation
});

// Notes:
// Best to think of schema as a bunch of 
//  functions that return references to other objects in our graph
// We can think of each of the edges in our graph as a resolve function

// Node = peice of data
//  they have resolve functions that can go grab more data from other nodes

// ====

// Going from one type of data to another we have to 
//  set up the relationship in code here
// This means we have to think out how the data relates to one another 
//  and what we expect to get back.
// In this schema for example if we are querying a company for 
//  users we should expect to get back multiple users (all associated w that company)

// ====

// We have a circular dependency between user and companeis here 
//  they both depend on each other - order of operations issue
// GraphQL workaround to get around this 

// - wrap the Fields object with an arrow function
//  fields: () => ({id: , fields, etc })
// This ^ makes it so the CompanyType and UserType get defined
//  but the code wont get executed until afterwords, 
//  internally GraphQL waits and executes it afterwords.
// Once wrapped UserType is inside the closure scope of the 
//  anonymous function so we don't get "UserType is not defined" error 

//// Fragment EG
// ===========

/* 
// Here we put 'apple' before company as you can't just list 'company' twice
//  as will error out with javascript getting the same name back for 2 queries
{
  apple: company(id: "2") {
    ...companyDetails
  }
  google: company(id: "2") {
    ...companyDetails
  }
}

// `on Company` is so GraphQL can make sure the 
//   things you're requesting exist on the object 
//   and give you nice error message if not (just typechecking)
fragment companyDetails on Company {
  id
  name
  description
  users {
    firstName
    company {
      name
    }
  }
}

*/


//// Mutations | Changing data on the server ~!! GraphQL's CUD of CRUD
// ===========
/*
  Similar to how RootQuery is setup/

  Yeah code is self explanatory
*/
