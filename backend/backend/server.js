require("dotenv").config();
const app = require("./app");

const PORT = process.env.PORT || 5001;

// 0.0.0.0 ให้รับ connection จากนอก container (เช่น port mapping ใน Docker)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server listening on port ${PORT}`);
});
