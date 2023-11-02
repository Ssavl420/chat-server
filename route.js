const express = require('express');
const router = express.Router();

router.get("/", (request, response) => {
   response.setHeader("Access-Control-Allow-Origin", "*");
   response.setHeader("Access-Control-Allow-Methods",
      "GET, POST, OPTIONS, PUT, PATCH, DELETE"
   );
   response.setHeader("Access-Control-Allow-Headers",
      "X-Requested-With,content-type"
   );

   response.send("Test chat")
});

module.exports = router;