const axios = require("axios");

const checktoken = () => {
  console.log("🚀 Checking GHN Token...");
  console.log("Token:", process.env.GHN_TOKEN);
  console.log("Shop ID:", process.env.GHN_SHOP_ID);
  console.log("Base URL:", process.env.GHN_BASE_URL);
};

checktoken();
class GHNConfig {
  constructor() {
    this.ghnAxios = axios.create({
      baseURL: process.env.GHN_BASE_URL,
      headers: {
        Token: process.env.GHN_TOKEN,
        ShopId: Number(process.env.GHN_SHOP_ID),
        "Content-Type": "application/json",
      },
    });

    this.ghnAxiosV2 = axios.create({
      baseURL: process.env.GHN_BASE_URL,
      headers: {
        Token: process.env.GHN_TOKEN,
        "Content-Type": "application/json",
      },
    });

    this.ghnAxiosProvince = axios.create({
      baseURL: process.env.GHN_BASE_URL_PROVINCE,
      headers: {
        Token: process.env.GHN_TOKEN,
        "Content-Type": "application/json",
      },
    });
  }
}

module.exports = new GHNConfig();
