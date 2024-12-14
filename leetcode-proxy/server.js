const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
const PORT = 5000; // You can use any port

app.use(cors());
app.use(express.json());

app.post("/graphql", async (req, res) => {
  try {
    const response = await axios.post(
      "https://leetcode.com/graphql/",
      req.body,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
