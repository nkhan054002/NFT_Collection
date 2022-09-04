
import React, {useRef, useState, useEffect} from "react"; 
import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3Modal from "web3modal";
import { Contract, providers, utils } from "ethers";
import { WHITELIST_CONTRACT_ADDRESS } from "../../hardhat-tutorial/constants";
import { NFT_CONTRACT_ADDRESS, abi } from "../constants";

export default function Home() {
  // walletConnected keep track of whether the user's wallet is connected or not
  const [walletConnected, setWalletConnected] = useState(false);
  // checks if the currently connected MetaMask wallet is the owner of the contract
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [preSaleStarted, setPresaleStarted] = useState(false);
  const [presaleEnded, setPresaleEnded] = useState(false);
  // tokenIdsMinted keeps track of the number of tokenIds that have been minted
  const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
  const web3ModalRef = useRef()
  const getProviderOrSigner = async (needSigner = false)=>{
    const provider = await web3ModalRef.current.connect();
    const web3Provider = new providers.Web3Provider(provider);
    const {chainId} = await web3Provider.getNetwork();
    if (chainId!==4){
      window.alert("Change network to rinkeby")
      throw new Error("Change network to rinkeby")
    }
    if (needSigner){
      return web3Provider.getSigner();
    }
    return web3Provider
  }
  const startPresale = async()=>{
    try{
      const signer = getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await nftContract.startPresale();
      setLoading(true);
      await tx.wait();
      setLoading(false);
      await checkIfPresaleStarted();
      //above function also changes the useState variable
    } catch (err){
      console.error(err.message)
    }
  }
  const presaleMint = async() => {
    try{
      const signer = getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = await nftContract.presaleMint({
        gas: 2100000,
        gasPrice: 8000000000,
        value:utils.parseEther("0.01")
      })
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You just minted a CryptoDevs NFT")
    } catch (err){
      console.error(err.message)
    }
  }
  const getTokenIdsMinted = async ()=>{
    try {
      const provider = getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _tokenIds = await nftContract.tokenIds;
      setTokenIdsMinted(_tokenIds.toString())
    } catch (err){
      console.error(err.message)
    }
  }
  const publicMint = async ()=>{
    try{
      const signer = getProviderOrSigner();
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);
      const tx = nftContract.mint({
        value:utils.parseEther("0.01")
      })
      setLoading(true);
      await tx.wait();
      setLoading(false);
      window.alert("You successfully minted a Crypto Dev!");
    } catch (err) {
      console.error(err.message)
    }
  }
  const checkIfPresaleStarted = async()=>{
    try {
      const provider = await getProviderOrSigner();
    const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
    const _presaleStarted = nftContract.presaleStarted();
    if (!_presaleStarted){
      await getOwner();
    }
    setPresaleStarted(_presaleStarted);
    } catch (err){
      console.error(err.message);
    }
  }
  const checkIfPresaleEnded = async() => {
    try{
      const provider = await getProviderOrSigner();
      const nftContract = Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _presaleEnded = nftContract.presaleEnded;
      const hasEnded = _presaleEnded.lt(Math.floor(( Date.now())/1000))
      if (hasEnded) {
        setPresaleEnded(true);
      } else {
        setPresaleEnded(false);
      }
      return hasEnded;
    } catch(err) {
      console.error(err.message)
    }
  }
  const getOwner = async()=>{
    try{
      const provider = await getProviderOrSigner(true);
      const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
      const _owner = await nftContract.owner();
      const signer = await getProviderOrSigner(true)
      const address = await signer.getAddress();
      if (address.toLowerCase() === _owner.toLowerCase()) {
        setIsOwner(true);
      }
    } catch(err){console.error(err.message)}
}
  const connectWallet = async ()=>{
    //to do this, we need to instantiate, web3modal
    try {
      await getProviderOrSigner();
      setWalletConnected(true);
    } catch (err){
      console.log(err)
    }
  }
  useEffect(()=>{
    if (!walletConnected){
      web3ModalRef.current = new Web3Modal({
        network:"rinkeby",
        providerOptions:{},
        disableInjectedProvider:false
      });
      connectWallet();
      const _presaleStarted = checkIfPresaleStarted();
      if  (_presaleStarted){
        checkIfPresaleEnded();
        //such check functions gives our index.js, i.e. this file`s corresponding variables, values that are present in the blockchain, in our project
      }
      getTokenIdsMinted();
      const presaleEndedInterval = setInterval( async()=>{
        const _presaleStarted = await checkIfPresaleStarted();
        if (_presaleStarted){
          const _presaleEnded = await checkIfPresaleEnded();
          if (_presaleEnded){
            clearInterval(presaleEndedInterval)
          }
        }
      }, 5*1000)
      // set an interval to get the number of token Ids minted every 5 seconds
      setInterval(async function () {
        await getTokenIdsMinted();
      }, 5 * 1000);
    }
      
  }, [walletConnected])

  const RenderButton = ()=>{
    if (!walletConnected){
      return (
        <button onClick = {connectWallet} className = {styles.button}>
          Connect your Wallet 
        </button>
      );
    };
    if (loading){
      return (
        <button className={styles.button}>Loading...</button>
      );
    };
    if (isOwner&&!preSaleStarted){
      return (<button className = {styles.button} onClick = {startPresale}>Start Presale</button>)
    }
    if (!preSaleStarted){
      return (<div>
        <div className = {styles.description}>Presale hasnt started!</div>
      </div>)
    }
    if (!presaleEnded){
      return (<div>
        <div className = {styles.description}>
          Presale has started, If your address is whitelisted, Mint a Cryptodev
        </div>
        <button className = {styles.button} onClick = {presaleMint}>
          Presale Mint
        </button>
      </div>)
    }
    if (presaleEnded){
      return (<button className={styles.button} onClick={publicMint}>
          Public Mint 🚀
      </button>)
    }

  }
  const button_val = RenderButton();
  //{ !walletConnected ? <button onClick = {connectWallet} className={styles.main}>
  //Connect wallet
  //</button> : null}

  return (
    <div>
      <Head>
        <title>Crypto Devs</title>
        <meta name="description" content="Whitelist-Dapp" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className = {styles.main}>
        <h1 className={styles.title}>Welcome to Crypto Devs!</h1>
        <div className = {styles.description}>
          Its an NFT Collection for developers in Crypto
        </div>
        <div className={styles.description}>
            {tokenIdsMinted/20} have been minted
        </div>
        {RenderButton()}
        </div>
        <div>
          <img className={styles.image} src="./cryptodevs/0.svg" />
        </div>
      <footer className = {styles.footer}>
          Made with &#10084; by Crypto Devs
      </footer>
    </div>
  )
}
