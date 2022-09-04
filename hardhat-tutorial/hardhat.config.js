require("@nomiclabs/hardhat-waffle");
require("dotenv").config({
    path:__dirname+'/../.env'
})

// const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;
// const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
const ALCHEMY_API_KEY_URL = "";
const RINKEBY_PRIVATE_KEY = "";
console.log(process.env)
module.exports = {
  solidity:{
    compilers:[
      {
        version:"0.8.0"
      },
      {
        version:"0.8.9"
      }
    ]
  },
  networks:{
    rinkeby:{
      url:String(ALCHEMY_API_KEY_URL),
      accounts : [RINKEBY_PRIVATE_KEY],
      gas: 2100000,
      gasPrice: 8000000000
    },
  },
  }
