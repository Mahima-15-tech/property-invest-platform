const bcrypt = require("bcrypt");

(async () => {
  const hashed = await bcrypt.hash("123456", 10);
  console.log(hashed);
})();