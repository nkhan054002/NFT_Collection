//SPDX License Identifier :MIT 
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./IWhitelist.sol";

contract CryptoDevs is Ownable, ERC721Enumerable{
    string _baseTokenURI;
    IWhitelist whitelist;
    bool public presaleStarted;
    uint256 public  presaleEnded;
    //  _price is the price of one Crypto Dev NFT
    uint256 public _price = 0.01 ether;
    // _paused is used to pause the contract in case of an emergency
    bool public _paused;
    //to pause the smartcontract in order to prevent further hacks
    // max number of CryptoDevs
    uint256 public maxTokenIds = 20;
    // total number of tokenIds minted
    //individual uint8s wont matter, multiples will only save space 
    uint256 public tokenIds;

    modifier onlyWhenNotPaused{
        require(!_paused, "Smart Contract has been paused, and will resume later");
        _;
    }

    constructor(string memory baseURI, address whitelistContract) ERC721 ("CryptoDevs", "CD"){
        _baseTokenURI = baseURI;
        whitelist = IWhitelist(whitelistContract);
    }

    function startPresale() public onlyOwner{
        presaleStarted = true;
        presaleEnded = block.timestamp + 5 minutes;
    }
    function presaleMint() public payable onlyWhenNotPaused{
        require(presaleStarted && block.timestamp<presaleEnded, "Presale Ended");
        require(whitelist.whitelistedAddresses(msg.sender), "User not in Whitelist");
        require(tokenIds<maxTokenIds, "Max tokens limit reached");
        require(msg.value>=_price, "insufficient amount sent");

        tokenIds++;
        _safeMint(msg.sender, tokenIds);
        //since we are indexing with consecutive ints, this can help us specify which nft is to be minted
        //inheritance in contracts, events
        //we have overriding functions for before and after token transfer takes place 
    }
    function mint() public payable onlyWhenNotPaused{
        require(presaleStarted && block.timestamp>=presaleEnded, "Presale has not ended yet");
        require(tokenIds<maxTokenIds, "Max limit of tokens reached");
        require(msg.value >=_price, "Insufficient amount sent");
        tokenIds++;
        _safeMint(msg.sender, tokenIds);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function withdraw() public onlyOwner{
        address _owner = owner();
        //owner function comes from ownable.sol 
        uint256 amount = address(this).balance;
        (bool sent, ) = _owner.call{value:amount}("");
        require(sent, "Failed to send Ether");
        //use solidity-by-example
    }

    function setPaused(bool val) public onlyOwner{
        _paused = val;
    }

    fallback () external payable{}
    receive () external payable{}
    //so as to recieve ether, we need to add certain functions, recieve and fallback 
    //reiceve = only money no data
    //fallback = both, money and data
    //include both 
}
//basetokenuri is the url that is the base path to which if tokenn id is attached, we get hte token info