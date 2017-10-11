const express = require('express');
const expressGraphQL = require('express-graphql');
const schema = require('./schema/schema');
const app = express();


// GraphQL API route
app.use('/graphql', expressGraphQL ({
    schema, // That es6 syntax so you dont need to do {  schema:  schema }
    graphiql: true, // graphIq (note the I) is a dev tool
  })
);

app.listen(4000, () => {
  console.log('Holla');
});

