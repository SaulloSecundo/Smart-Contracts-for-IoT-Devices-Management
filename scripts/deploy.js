const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  // compilação e implantação do contrato HumiditySensorManager na blockchain

  const humiditySensorFactory = await hre.ethers.getContractFactory("HumiditySensorManager");
  const humiditySensorContract = await humiditySensorFactory.deploy();
  console.log("HumiditySensorManager deployed to:", await humiditySensorContract.getAddress());

 // compilação e implantação do contrato ProximitySensorManager na blockchain

  const proximitySensorFactory = await hre.ethers.getContractFactory("ProximitySensorManager");
  const proximitySensorContract = await proximitySensorFactory.deploy();
  console.log("ProximitySensorManager deployed to:", await proximitySensorContract.getAddress());

// compilação e implantação do contrato MotionSensorManager na blockchain

  const motionSensorFactory = await hre.ethers.getContractFactory("MotionSensorManager");
  const motionSensorContract = await motionSensorFactory.deploy();
  console.log("MotionSensorManager deployed to:", await motionSensorContract.getAddress());

// compilação e implantação do contrato TemperatureSensorManager na blockchain

  const temperatureSensorFactory = await hre.ethers.getContractFactory("TemperatureSensorManager");
  const temperatureSensorContract = await temperatureSensorFactory.deploy();
  console.log("TemperatureSensorManager deployed to:", await temperatureSensorContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

