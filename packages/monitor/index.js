const { ethers } = require("ethers");
const https = require('https');
require("dotenv").config();


const abi = [
    'function lightIsOn() view returns (bool)',
    "function changeLightIsOn(bool _lightIsOn)"]

const changeLightIsOn = async function (lightIsOn) {

    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);

    const account = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, account);

    const currentLightIsOn = await contract.lightIsOn();
    console.log(`currentLightIsOn: ${currentLightIsOn}, new lightIsOn: ${lightIsOn}`);
    if (currentLightIsOn === lightIsOn) {
        console.log(`No change!`);
        return;
    }

    const changeLightIsOnTx = await contract.changeLightIsOn(lightIsOn);
    const transactionReceipt = await changeLightIsOnTx.wait();
    if (transactionReceipt.status === 0) {
        throw new Error("changeLightIsOnTx failed");
    }

    console.log(transactionReceipt);

    console.log(`ChangeLightIsOn Complete!`);
    // console.log(`See transactions at: https://goerli.etherscan.io/address/${ACCOUNT_1.address}`)
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function isSiteAvailable(url) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, { method: 'HEAD' }, res => {
            resolve(res.statusCode >= 200 && res.statusCode < 300);
        });
        req.on('error', (error) => {
            console.log(error);
            resolve(false);
        });
        req.end();
    });
}

const main = async function () {
    // try {
    //     const available = await isSiteAvailable(process.env.SITE_URL);
    //     console.log(`Site url: ${process.env.SITE_URL}, is available: ${available}`);
    // } catch (error) {
    //     console.log(error);
    // }

    // await changeLightIsOn(true);
    // await changeLightIsOn(true);
    // await changeLightIsOn(false);

    let prevAvailableStatus = await isSiteAvailable(process.env.SITE_URL);
    while(true) {
        const availableStatus = await isSiteAvailable(process.env.SITE_URL);
        if(prevAvailableStatus !== availableStatus && process.env.REPEAT_REQUEST_TIMEOUT_MS) {
            prevAvailableStatus = availableStatus;
            console.log(`Repeat request timeout: ${process.env.REPEAT_REQUEST_TIMEOUT_MS}ms`);
            await sleep(process.env.REPEAT_REQUEST_TIMEOUT_MS);
            continue;
        }

        prevAvailableStatus = availableStatus;
        await changeLightIsOn(availableStatus);
        await sleep(process.env.REQUEST_TIMEOUT_MS);
    }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
