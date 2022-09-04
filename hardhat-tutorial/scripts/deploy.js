const {ethers} = require("hardhat")

const {WHITELIST_CONTRACT_ADDRESS, METADATA_URL} = require("../constants")
async function main(){
    const whitelistContract= WHITELIST_CONTRACT_ADDRESS;
    const metadata_url = METADATA_URL;
    const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs")
    const DeployedContract = await cryptoDevsContract.deploy(metadata_url, whitelistContract);
    await DeployedContract.deployed()
    console.log("Deployed contract is at address", DeployedContract.address)
}


main().then(()=>process.exit(0))
.catch((error)=>{
    console.log(error)
    process.exit(1)
})