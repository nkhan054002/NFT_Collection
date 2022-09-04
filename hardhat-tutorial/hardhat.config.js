require("@nomiclabs/hardhat-waffle");
require("dotenv").config({
    path:__dirname+'/../.env'
})

// const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;
// const RINKEBY_PRIVATE_KEY = process.env.RINKEBY_PRIVATE_KEY;
const ALCHEMY_API_KEY_URL = "https://eth-rinkeby.alchemyapi.io/v2/_IKtGrVDOzmiIFFlbDzm3VoY58GZmKmw";
const RINKEBY_PRIVATE_KEY = "0xd2fc22f789b46434222a49b73d5bd4212fd3ee92b458359e223748138703799a";
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