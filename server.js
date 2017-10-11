const express = require('express');
const expressGraphQL = require('express-graphql');

const app = express();


// GraphQL API route
app.use('/graphql', expressGraphQL ({
    graphiql: true, // graphIq (note the I) is a dev tool
    

  })
);

app.listen(4000, () => {
  console.log('Holla');
});

