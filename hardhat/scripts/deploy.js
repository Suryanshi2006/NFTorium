// filepath: /home/alhope/code/projects/contributions/NFTorium/hardhat/scripts/deploy.js
const hre = require("hardhat");

async function main() {
  // Get the contract factory
  const NFTMarketplace = await hre.ethers.getContractFactory("NFTMarketplace");

  // Deploy the contract
  const nftMarketplace = await NFTMarketplace.deploy();

  // Wait for the deployment transaction to be mined
  await nftMarketplace.waitForDeployment();

  // Get the deployed contract address
  const address = await nftMarketplace.getAddress();

  console.log("NFTMarketplace deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
