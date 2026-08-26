const cors = require("cors");

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if ( origin === 'http://localhost:3000'
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', "PATCH", 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

module.exports = cors(corsOptions);
