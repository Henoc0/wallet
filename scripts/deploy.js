// This setup uses Hardhat to deploy smart contracts.
// Learn more about it at https://hardhat.org


async function main() {
  const Wallet = await hre.ethers.getContractFactory("wallet")
  const wallet = await Wallet.deploy()
  await wallet.waitForDeployment()
  console.log("Wallet deployed to:", await wallet.getAddress())
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})


// Deployment : npx hardhat run scripts/deploy.js --network localhost