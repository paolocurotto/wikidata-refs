const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Import routes
app.use('/', require('./routes/wikidata'));
app.use('/', require('./routes/solr'));
app.use('/', require('./routes/search_similar_terms'));


const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


