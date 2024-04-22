import { fetchBlockNumber, fetchToken, readContract, readContracts } from 'wagmi/actions'
import { getAccount } from "wagmi/actions";
import { tokenAbi, masterContract, masterContract2, lpAbi } from "./data";



export const fetchData = async () => {
    const account = getAccount();
    const address = account.address;
    const isConnected = account.isConnected;

    const currentBlock = await fetchBlockNumber();
    const currentBlockInt = parseInt(currentBlock.toString());
    const blockPerYear = 3153600; //block per minute, hour, day, year


    const contractCalls = [
        { address: import.meta.env.VITE_LP2, abi: lpAbi, functionName: 'getReserves' },
        { ...masterContract2, functionName: 'poolLength' },
        { ...masterContract2, functionName: 'rewardsPerBlock' },
        { ...masterContract2, functionName: 'getMultiplier', args: [currentBlockInt - 1, currentBlockInt] },
        { ...masterContract2, functionName: 'totalAllocPoint' },
        { address: import.meta.env.VITE_TOKEN2, abi: tokenAbi, functionName: 'balanceOf', args: ['0x0000000000000000000000000000000000000369'] },
        { address: import.meta.env.VITE_PULSE_LP, abi: lpAbi, functionName: 'getReserves' },
        { address: '0x1A55626CDfbF730843C3BE3dbB1Ec850623Fc90a', abi: lpAbi, functionName: 'getReserves' },
        { address: '0x4a8B4e737736E0d2197BAf1A781125d804194aD4', abi: lpAbi, functionName: 'getReserves' },
        { address: '0xc614a34C49aB6F15895055684D6BF34006863C5E', abi: lpAbi, functionName: 'getReserves' },
        { address: '0x40160032573fc24EA0A8D3041DF614a8Ad3bB3Af', abi: lpAbi, functionName: 'getReserves' },
        { address: '0x5087bfbEaC7C7A1038C7a3c437652B1A40e6B877', abi: lpAbi, functionName: 'getReserves' },
        { address: import.meta.env.VITE_LP, abi: lpAbi, functionName: 'getReserves' },
        { address: '0xb924EB55CE5F65C4Be4c004584803cbe8B341133', abi: lpAbi, functionName: 'getReserves' },
        { address: '0x5B9661276708202DD1A0dD2346A3856b00d3c251', abi: lpAbi, functionName: 'getReserves' },
        { address: '0x0c379b5eea52689d14ced055e717f92fd458926f', abi: lpAbi, functionName: 'getReserves' }
        // Add any additional contract calls here
    ];

     // Fetching data from contracts
     const responses = await readContracts({ contracts: contractCalls });
    
     // Parsing responses
     const burnedCad = parseInt(responses[5].result.toString()) / 10**18;
     const pulsePrice = parseInt(responses[6].result[1].toString()) / parseInt(responses[6].result[0].toString());
     const nativeToken2PriceUsd = (parseInt(responses[0].result[1].toString()) / parseInt(responses[0].result[0].toString()) * pulsePrice).toString();
     const nativeToken2 = await fetchToken({ address: import.meta.env.VITE_TOKEN2 });
     const nativeToken2Supply = nativeToken2.totalSupply.formatted - burnedCad;
 
     // Calculating additional prices based on LP token reserves
     const scopolaPrice = calculateTokenPrice(responses[7], pulsePrice);
     const snakePrice = calculateTokenPrice(responses[8], pulsePrice, true, 9); // Reversed and different decimal for snake
     const wavePrice = calculateTokenPrice(responses[9], pulsePrice);
     const torusPrice = calculateTokenPrice(responses[10], pulsePrice);
     const kymatoPrice = calculateTokenPrice(responses[11], pulsePrice, true) *10**18 ; // Reversed for kymato
     const hyscPrice = calculateTokenPrice(responses[12], pulsePrice).toString();
     const anuPrice = calculateTokenPrice(responses[13], pulsePrice, false, 9); // Anu has different decimals
     const incPrice = calculateTokenPrice(responses[14], pulsePrice);
     const dmtPrice = calculateTokenPrice(responses[15], pulsePrice);

     const numberOfPool2 = parseInt((responses[1].result).toString());
    const token2MintedPerBlock = responses[2].result;
    const token2MintedPerDay = parseInt(token2MintedPerBlock.toString()) / (10**18) * 6 * 60 * 24;
    const multiplier2 = responses[3].result;
    const totalAllocPoint2 = responses[4].result;
 
    
    function calculateTokenPrice(response, basePrice, isReversed = false, decimals = 18) {
        const [tokenReserve, baseTokenReserve] = response.result.map(value => parseInt(value.toString()));
        const price = isReversed 
            ? (tokenReserve / baseTokenReserve) * basePrice 
            : (baseTokenReserve / tokenReserve) * basePrice;
        return price / (10 ** decimals);
    }
//===========================================


let generalInfo2 = {};

generalInfo2.multiplier = multiplier2;
generalInfo2.rewardsPerBlock = token2MintedPerBlock;
generalInfo2.nativeTokenPriceUsd = nativeToken2PriceUsd;
generalInfo2.nativeTokenSupply = nativeToken2Supply;
generalInfo2.inflation = token2MintedPerDay;
generalInfo2.burned = burnedCad;
generalInfo2.anuPrice = anuPrice;

//========================= Fill all pools with the data collected ========================
    
let allPools = {}
let general2 = [];
let farmingPools2 = [];
let stakingPools2 = [];

general2.push(generalInfo2);
for( let i=0; i<numberOfPool2; i++) {
    const allInfo2 = {}; //object which will contain all data for each pool

    const poolInfo2 = await readContract({
        ...masterContract2,
        functionName: 'poolInfo',
        args: [i]
    })
   
    const rewardAlloc2 = poolInfo2[1];

    if(
        
        poolInfo2[0] == '0x11dB8dB3b1979c17c4D9537281cf1F0C7B7285e6'
        || poolInfo2[0] == '0x9AEaef961DE2D3f6A6999D5bA7436FB6f2d01013'
        || poolInfo2[0] == '0xb6Fae03E73Bc3b9c89B2ec97a2C85Ac11906B524'
        || poolInfo2[0] == '0xDcDaaDb2B99a3D48D4C2815592243c9085ff14C9'
        || poolInfo2[0] == '0x1897105dbfC4610f3C7364d00cF3fB1dc205C8DF'
        
        
        
        ) {
        continue
    }
    const tokenInfo2 = await fetchToken({ address: poolInfo2[0]})
    const depositFee2 = parseInt(poolInfo2[4].toString()) /100;

    const poolRewardPerBlock2 = parseInt(token2MintedPerBlock.toString()) * parseInt(multiplier2.toString()) * parseInt(poolInfo2[1].toString()) / parseInt(totalAllocPoint2.toString());
    const poolRewardPerYear2 = poolRewardPerBlock2 * blockPerYear;
    const poolRewardPerYearUsd2 = (poolRewardPerYear2 / 10**18) * nativeToken2PriceUsd;


    


    if(tokenInfo2.symbol == 'PLP' || tokenInfo2.symbol == '9mm-LP') {    //farm token is LP token
        const data2 = await readContracts({
            contracts: [
                {
                    address: poolInfo2[0],
                    abi: lpAbi,
                    functionName:'token0',
                },
                {
                    address: poolInfo2[0],
                    abi: lpAbi,
                    functionName:'token1',
                },
                {
                    address: poolInfo2[0],
                    abi: lpAbi,
                    functionName: 'totalSupply',
                },
                {
                    address: poolInfo2[0],
                    abi: lpAbi,
                    functionName: 'getReserves',
                },
                {
                    address: poolInfo2[0],
                    abi: tokenAbi,
                    functionName: 'balanceOf',
                    args: [import.meta.env.VITE_MASTER2]
                },
                {
                    address: poolInfo2[0],
                    abi: lpAbi,
                    functionName:'allowance',
                    args: [address, import.meta.env.VITE_MASTER2],
                },
                
                
            ]
        });

        const lpToken0Name2 = data2[0].result
        const lpToken1Name2 = data2[1].result
        const lpTotalSupply2 = data2[2].result;
        const getLpReserves2 = data2[3].result;
        const totalStaked2 = data2[4].result;
        const allowance2 = data2[5].result;
        
        
        const token0Name2 = await fetchToken({ address: lpToken0Name2 })
        const token1Name2 = await fetchToken({ address: lpToken1Name2 })

        let lpName2 = '';
        let isCad = false;
        let isV1 = false;
        

//===========================================
// ========================= GET THE CORRECT LP PRICE DEPENDING ON PAIRING =======================          
let lpPriceUsd2;
let token0_2 = lpToken0Name2;
let token1_2 = lpToken1Name2;

if(token0Name2.name == 'Wrapped Pulse'){
const lpPriceEth2 = parseInt(getLpReserves2[0].toString()) * 2 / parseInt(lpTotalSupply2.toString());
lpPriceUsd2 = (lpPriceEth2 * pulsePrice).toString();
token0_2 ='PLS'
}
else if (token1Name2.name == 'Wrapped Pulse'){
const lpPriceEth2 = parseInt(getLpReserves2[1].toString()) * 2 / parseInt(lpTotalSupply2.toString());
lpPriceUsd2 = (lpPriceEth2 * pulsePrice).toString();
token1_2 = 'PLS'
}
else if(token0Name2.name == 'Caduceus'){
    const lpPriceEth2 = parseInt(getLpReserves2[0].toString()) * 2 / parseInt(lpTotalSupply2.toString());
    lpPriceUsd2 = (lpPriceEth2 * nativeToken2PriceUsd).toString();
}
else if (token1Name2.name == 'Caduceus'){
    const lpPriceEth2 = parseInt(getLpReserves2[1].toString()) * 2 / parseInt(lpTotalSupply2.toString());
    lpPriceUsd2 = (lpPriceEth2 * nativeToken2PriceUsd).toString();
} 
else if(token0Name2.address == '0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF'){ //kymato
    const lpPriceEth2 = (parseInt(getLpReserves2[0].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * kymatoPrice).toString();
}
else if (token1Name2.address == '0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF'){ //kymato
    const lpPriceEth2 = (parseInt(getLpReserves2[1].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * kymatoPrice).toString();
} 
else if(token0Name2.address == '0xb724eA7a4F5eA808972E39f1c9dfB1a1871c4f70'){ //snake
    const lpPriceEth2 = (parseInt(getLpReserves2[0].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * snakePrice).toString();
}
else if (token1Name2.address == '0xb724eA7a4F5eA808972E39f1c9dfB1a1871c4f70'){ //snake
    const lpPriceEth2 = (parseInt(getLpReserves2[1].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * snakePrice).toString();
}  
else if(token0Name2.address == '0xa5C17b43E977d73b06c04F81D830142F485D79d2'){ //waves
    const lpPriceEth2 = (parseInt(getLpReserves2[0].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * wavePrice).toString();
}
else if (token1Name2.address == '0xa5C17b43E977d73b06c04F81D830142F485D79d2'){ //waves
    const lpPriceEth2 = (parseInt(getLpReserves2[1].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * wavePrice).toString();
} 
else if(token0Name2.address == '0x252C7EAAe7E4FEDec5b33e57AD72699b521EC722'){ //torus
    const lpPriceEth2 = (parseInt(getLpReserves2[0].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * torusPrice).toString();
}
else if (token1Name2.address == '0x252C7EAAe7E4FEDec5b33e57AD72699b521EC722'){ //torus
    const lpPriceEth2 = (parseInt(getLpReserves2[1].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * torusPrice).toString();
}  
else if(token0Name2.address == '0x007957CB23C9044343B62A7FaE2A4dAa7265531e'){ //Scop
    const lpPriceEth2 = (parseInt(getLpReserves2[0].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * scopolaPrice).toString();
}
else if (token1Name2.address == '0x007957CB23C9044343B62A7FaE2A4dAa7265531e'){ //Scop
    const lpPriceEth2 = (parseInt(getLpReserves2[1].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * scopolaPrice).toString();
} 
else if(token0Name2.address == '0x73D159B3C18447Da0D332e147C00F8802A5d9263'){ //hysc
    const lpPriceEth2 = (parseInt(getLpReserves2[0].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * hyscPrice).toString();
}
else if (token1Name2.address == '0x73D159B3C18447Da0D332e147C00F8802A5d9263'){ //hysc
    const lpPriceEth2 = (parseInt(getLpReserves2[1].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * hyscPrice).toString();
}
else if(token0Name2.address == '0x962d791578C8696D30755Ed621c767a7a2A3D9ef'){ //anu
    const lpPriceEth2 = (parseInt(getLpReserves2[0].toString()) * 2 * 10**9) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = ((lpPriceEth2 * anuPrice).toString()) * 10**9;
}
else if (token1Name2.address == '0x962d791578C8696D30755Ed621c767a7a2A3D9ef'){ //anu
    const lpPriceEth2 = (parseInt(getLpReserves2[1].toString()) * 2 * 10**9) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = ((lpPriceEth2 * anuPrice).toString()) * 10**9;
} 
else if(token0Name2.address == '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d'){ //inc
    const lpPriceEth2 = (parseInt(getLpReserves2[0].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * incPrice).toString();
}
else if (token1Name2.address == '0x2fa878Ab3F87CC1C9737Fc071108F904c0B0C95d'){ //inc
    const lpPriceEth2 = (parseInt(getLpReserves2[1].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * incPrice).toString();
}
else if(token0Name2.address == '0x6a88E87264bDbfDed22eb283fba21E04BE5EeC95'){ //DMT
    const lpPriceEth2 = (parseInt(getLpReserves2[0].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * dmtPrice).toString();
    isV1 = true;
    console.log('Is V1:', isV1); // Add this line for debugging

}
else if (token1Name2.address == '0x6a88E87264bDbfDed22eb283fba21E04BE5EeC95'){ //DMT
    const lpPriceEth2 = (parseInt(getLpReserves2[1].toString()) * 2) / (parseInt(lpTotalSupply2.toString()));
    lpPriceUsd2 = (lpPriceEth2 * dmtPrice).toString();
    isV1 = true;
    console.log('Is V1:', isV1); // Add this line for debugging

}

if (token0Name2.name == 'Caduceus' || token1Name2.name == 'Caduceus') {
    isCad = true;
}


//=======================================================================================
const totalStakedUsd2 = token0Name2.address  === '0x962d791578C8696D30755Ed621c767a7a2A3D9ef'
  ? (parseInt(totalStaked2.toString()) / 10**9) * lpPriceUsd2
  : (parseInt(totalStaked2.toString()) / 10**18) * lpPriceUsd2;


let Apr2;
if (totalStakedUsd2 == 0) {
    Apr2 = poolRewardPerYearUsd2 / 1 * 100
}
else {Apr2 = poolRewardPerYearUsd2 / totalStakedUsd2 * 100 }
if (Apr2 > 10000000000) {Apr2 = 10000000000}

if(isConnected) {
    const data2 = await readContracts({
        contracts: [
            {
                address: poolInfo2[0],
                abi: tokenAbi,
                functionName: 'balanceOf',
                args: [address] 
            },
            {
                ...masterContract2,
                functionName: 'degenInfo',
                args:[i, address]
            },
            {
                ...masterContract2,
                functionName: 'pendingRewards',
                args:[i, address]
            }
        ]
    });
    const userBalance2 = data2[0].result;
    const userInfo2 = data2[1].result;
    const rewards2 = data2[2].result;

    const pendingRewards2 = (parseFloat(rewards2.toString()) / 10**18).toFixed(5);
    const pendingRewardsUsd2 = (pendingRewards2 * nativeToken2PriceUsd).toFixed(2);

    // const userStaked = parseInt(userInfo[0].toString()) / 10**18;
    const userStaked2 = userInfo2[0].toString();
    const userStakedUsd2 = parseInt(userStaked2.toString()) /10**18 * lpPriceUsd2;
  
// ================= GET THE COMPOSITION OF LP TOKENS ==================
//Amount of each token per LP token
const token0Amount2 = parseInt(getLpReserves2[0].toString())/ parseInt(lpTotalSupply2.toString())
const token1Amount2 = parseInt(getLpReserves2[1].toString()) / parseInt(lpTotalSupply2.toString())

const token0staked2 = token0Amount2 * (parseInt(userStaked2) / 10**token0Name2.decimals)
const token1staked2 = token1Amount2 * (parseInt(userStaked2) / 10**token1Name2.decimals)

    allInfo2.id = i;
    allInfo2.name = lpName2;
    allInfo2.userStaked = userStaked2.toString();
    allInfo2.userStakedUsd = userStakedUsd2;
    allInfo2.totalStakedUsd = totalStakedUsd2.toFixed(2);
    allInfo2.apr = parseInt(Apr2);
    allInfo2.rewards = pendingRewards2;
    allInfo2.rewardsUsd = pendingRewardsUsd2;
    allInfo2.userBalance = userBalance2.toString();
    allInfo2.allowance = allowance2;
    allInfo2.address = poolInfo2[0];
    allInfo2.depositFee = depositFee2;
    allInfo2.isHysc = isCad;
    allInfo2.token0 = token0_2;
    allInfo2.token1 = token1_2;
    allInfo2.rewardAlloc = rewardAlloc2;
    allInfo2.token0Staked = token0staked2;
    allInfo2.token1Staked = token1staked2;
    allInfo2.token0Symbol = token0Name2.symbol;
    allInfo2.token1Symbol = token1Name2.symbol;
    allInfo2.isV1 = isV1;


} else {    //user is not connected
    allInfo2.name = lpName2;
    allInfo2.userStaked = '0';
    allInfo2.userStakedUsd = '0';
    allInfo2.totalStakedUsd = totalStakedUsd2.toFixed(2);
    allInfo2.apr = parseInt(Apr2);
    allInfo2.rewards = '0';
    allInfo2.rewardsUsd = '0';
    allInfo2.depositFee = depositFee2;
    allInfo2.isHysc = isCad;
    allInfo2.token0 = token0_2;
    allInfo2.token1 = token1_2;
    allInfo2.rewardAlloc = rewardAlloc2;
    allInfo2.isV1 = isV1;
}
farmingPools2.push(allInfo2) 
// =========================== SINGLE SIDED STAKING ==============================

} else { //Not a LP token ie. single sided pool

    const data2 = await readContracts({
        contracts: [
            {
                address: import.meta.env.VITE_LP2,
                abi: lpAbi,
                functionName: 'getReserves',
            },
            {
                address: poolInfo2[0],
                abi: tokenAbi,
                functionName: 'balanceOf',
                args: [import.meta.env.VITE_MASTER2]
            },
            {
                address: poolInfo2[0],
                abi: tokenAbi,
                functionName:'allowance',
                args: [address, import.meta.env.VITE_MASTER2],
            },
            
            {
                address: '0x31eF9a41500E6BD18524404aC9c5B88D04AA924E', //teddy/wPLS
                abi: lpAbi,
                functionName: 'getReserves',
            },
            {
                address: '0xF0eA3efE42C11c8819948Ec2D3179F4084863D3F', //eHex/wPLS
                abi: lpAbi,
                functionName: 'getReserves',
            },
            
        ]
    })


const totalStaked2 = data2[1].result;
const allowance2 = data2[2].result;
const teddyReserve = data2[3].result
const eHexReserve = data2[4].result

           
const teddyPriceUsd = (parseInt(teddyReserve[0].toString())/parseInt(teddyReserve[1].toString()) * pulsePrice / 10**18).toString();
const eHexPriceUsd = (parseInt(eHexReserve[0].toString())/parseInt(eHexReserve[1].toString()) * pulsePrice / 10**18).toString();




let tokenPriceUsd2;
let totalStakedUsd2;
let Apr2 =0 ;
if (poolInfo2[0] == '0x619e541d38572ee6E12D340566Da78e63D422e0f') {
    tokenPriceUsd2 = nativeToken2PriceUsd;
    totalStakedUsd2 = (parseInt(totalStaked2.toString()) / 10**18) * tokenPriceUsd2;
}
if (poolInfo2[0] == '0xDcDaaDb2B99a3D48D4C2815592243c9085ff14C9') {
    tokenPriceUsd2 = teddyPriceUsd;
    totalStakedUsd2 = (parseInt(totalStaked2.toString()) / 10**18) * tokenPriceUsd2;
}
if (poolInfo2[0] == '0xb6Fae03E73Bc3b9c89B2ec97a2C85Ac11906B524') {
    tokenPriceUsd2 = snakePrice;
    totalStakedUsd2 = (parseInt(totalStaked2.toString()) / 10**9) * tokenPriceUsd2;
}
if (poolInfo2[0] == '0x1897105dbfC4610f3C7364d00cF3fB1dc205C8DF') {
    tokenPriceUsd2 = eHexPriceUsd;
    totalStakedUsd2 = (parseInt(totalStaked2.toString()) / 10**8) * tokenPriceUsd2;
}



if (totalStakedUsd2 == 0) {
    Apr2 = poolRewardPerYearUsd2 / 1 * 100
}
else {Apr2 = poolRewardPerYearUsd2 / totalStakedUsd2 * 100 }
if (Apr2 > 10000000000) {Apr2 = 10000000000}

if(isConnected) {

    const data2 = await readContracts({
        contracts: [
            {
                address: poolInfo2[0],
                abi: tokenAbi,
                functionName: 'balanceOf',
                args: [address] 
            },
            {
                ...masterContract2,
                functionName: 'degenInfo',
                args:[i, address]
            },
            {
                ...masterContract2,
                functionName: 'pendingRewards',
                args:[i, address]
            },
            {
                address: poolInfo2[0],
                abi: tokenAbi,
                functionName: 'decimals', 
            },
        ]
    });
    const userBalance2 = data2[0].result;
    const userInfo2 = data2[1].result;
    const rewards2 = data2[2].result;
    const decimals2 = data2[3].result;

    const pendingRewards2 = (parseFloat(rewards2.toString()) / 10**18)
    const pendingRewardsUsd2 = (pendingRewards2 * nativeToken2PriceUsd)

    const userStaked2 = userInfo2[0]
    const userStakedUsd2 = parseInt(userStaked2.toString()) / (10**decimals2) * parseFloat(tokenPriceUsd2);
    
   



    allInfo2.id = i;
    allInfo2.name = tokenInfo2.symbol
    allInfo2.userStaked = userStaked2.toString();
    allInfo2.userStakedUsd = userStakedUsd2
    allInfo2.totalStakedUsd = totalStakedUsd2.toFixed(2)
    allInfo2.apr = parseInt(Apr2);
    allInfo2.rewards = pendingRewards2.toFixed(2);
    allInfo2.rewardsUsd = pendingRewardsUsd2.toFixed(2);
    allInfo2.userBalance = userBalance2;
    allInfo2.allowance = allowance2;
    allInfo2.address = poolInfo2[0];
    allInfo2.depositFee = depositFee2;
    allInfo2.pulsePrice = pulsePrice;
    allInfo2.snakePrice = snakePrice;
    allInfo2.teddyPrice = teddyPriceUsd;
    allInfo2.eHexPrice = eHexPriceUsd;
    allInfo2.nativeTokenPriceUsd = nativeToken2PriceUsd;
    allInfo2.token = tokenInfo2.address;

    

} else {    //user not connected
    allInfo2.name = tokenInfo2.symbol;
    allInfo2.userStaked = '0';
    allInfo2.userStakedUsd = '0';
    allInfo2.totalStakedUsd = totalStakedUsd2.toFixed(2);
    allInfo2.apr = parseInt(Apr2);
    allInfo2.rewards = '0';
    allInfo2.rewardsUsd = '0';
    allInfo2.depositFee = depositFee2;
    allInfo2.pulsePrice = pulsePrice;
    allInfo2.snakePrice = snakePrice;
    allInfo2.teddyPrice = teddyPriceUsd;
    allInfo2.eHexPrice = eHexPriceUsd;
    allInfo2.nativeTokenPriceUsd = nativeToken2PriceUsd;
    allInfo2.token = tokenInfo2.address
}
stakingPools2.push(allInfo2);
} 
}   
allPools.generalInfo2 = general2;
allPools.farmingPools2 = farmingPools2;
allPools.stakingPools2 = stakingPools2;



//==============================End of Caduceus==========================================

//===================================HYSC Start==========================================

//=======================================================================================





const data = await readContracts({
    contracts: [
     {
        address: import.meta.env.VITE_LP,
        abi: lpAbi,
        functionName: 'getReserves',
     },
     {
        ...masterContract,
        functionName: 'poolLength',
     },
     {
        ...masterContract,
        functionName: 'rewardsPerBlock',
     },
     {
        ...masterContract,
        functionName: 'getMultiplier',
        args: [currentBlockInt-1, currentBlockInt]
     },
     {
        ...masterContract,
        functionName: 'totalAllocPoint',
     },
     {//Getting burn address snake balance
         address: '0xb724eA7a4F5eA808972E39f1c9dfB1a1871c4f70',
         abi: tokenAbi,
         functionName: 'balanceOf',
         args: ['0x0000000000000000000000000000000000000369'],
     },
    {//Getting burn address balance
        address: import.meta.env.VITE_TOKEN,
        abi: tokenAbi,
        functionName: 'balanceOf',
        args: ['0x0000000000000000000000000000000000000369'],
        },
    {//Getting DAI/wPLS reserves to calculate DAI price
            address: '0x5087bfbeac7c7a1038c7a3c437652b1a40e6b877',
            abi: lpAbi,
            functionName: 'getReserves',
        
        },
        
        {//Getting burn address kymato balance
            address: '0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF',
            abi: tokenAbi,
            functionName: 'balanceOf',
            args: ['0x0000000000000000000000000000000000000369'],
        },
        {//Getting a1a.PLS reserves to calculate a1a price
            address: '0xb2045a428b6661e7e16fa1aecd77ec03912828c7',
            abi: lpAbi,
            functionName: 'getReserves',
        
        },
         
    ]
});

//token 0/1 might need swapped
const burnedHysc = parseInt(data[6].result.toString()) / 10**18;
const daiPrice = parseInt(data[7].result[0].toString())/parseInt(data[7].result[1].toString()) * pulsePrice
const a1aPrice = parseInt(data[9].result[1].toString())/parseInt(data[9].result[0].toString()) * pulsePrice;


const nativeTokenPriceUsd = (parseInt(data[0].result[1].toString())/parseInt(data[0].result[0].toString()) * pulsePrice).toString();
const nativeToken = await fetchToken({ address: import.meta.env.VITE_TOKEN })
const nativeTokenSupply = nativeToken.totalSupply.formatted - burnedHysc;

const kymatoToken = await fetchToken( {address: '0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF'})
const snakeToken = await fetchToken( {address: '0xb724eA7a4F5eA808972E39f1c9dfB1a1871c4f70'})
const kymatoBurn = parseInt(data[8].result.toString()) / 10**18;
const kymatoTotalSupply = kymatoToken.totalSupply.formatted - kymatoBurn;
const snakeBurn = parseInt(data[5].result.toString()) /10**9;
const snakeTotalSupply = (snakeToken.totalSupply.formatted * 10**9) - snakeBurn;



const numberOfPool = parseInt((data[1].result).toString());
const tokenMintedPerBlock = data[2].result;
const tokenMintedPerDay = parseInt(tokenMintedPerBlock.toString()) / (10**18) * 6 * 60 * 24;
const multiplier = data[3].result;
const totalAllocPoint = data[4].result;

let generalInfo = {};

generalInfo.totalAllocPoint = totalAllocPoint;
generalInfo.multiplier = multiplier;
generalInfo.rewardsPerBlock = tokenMintedPerBlock;
generalInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;
generalInfo.nativeTokenSupply = nativeTokenSupply;
generalInfo.inflation = tokenMintedPerDay;
generalInfo.burned = burnedHysc;
generalInfo.pulsePrice = pulsePrice;
generalInfo.daiPrice = daiPrice;
generalInfo.kymatoPrice = kymatoPrice;
generalInfo.scopolaPrice = scopolaPrice;



//
generalInfo.kymatoTotalSupply = kymatoTotalSupply;
generalInfo.kymatoBurn = kymatoBurn;
generalInfo.snakePrice = snakePrice;
generalInfo.snakeTotalSupply = snakeTotalSupply;
generalInfo.snakeBurn = snakeBurn;


//========================= Fill all pools with the data collected ========================
    
    
    let general = [];
    let farmingPools = [];
    let stakingPools = [];

    general.push(generalInfo);
    for( let i=0; i<numberOfPool; i++) {
        const allInfo = {}; //object which will contain all data for each pool

        const poolInfo = await readContract({
            ...masterContract,
            functionName: 'poolInfo',
            args: [i]
        })
        // if(poolInfo[1] == 0) { //if allocpoint == 0
        //     continue
        // }
        const rewardAlloc = poolInfo[1];

        if(
               poolInfo[0] == '0x9AEaef961DE2D3f6A6999D5bA7436FB6f2d01013'
            || poolInfo[0] == '0x7DDCD6131753C0DE6e88E3d515a87245fAD0be1C' 
            || poolInfo[0] == '0x88e120936FFc1297431e14157d4110379F53F830'
            || poolInfo[0] == '0x9928bC26D73F1470043637f50898908AB80379a3'
            || poolInfo[0] == '0x8BE701bcb7927847106785581778368F12db8C59'
            || poolInfo[0] == '0x1CD4cc99Db9Ce3b886B4a093C21056e12EbAFE10'
            || poolInfo[0] == '0x0A849f780CAf3b9b8E74034F3ECd4e93d228246A'
            || poolInfo[0] == '0xDc5fB518F952F78E68668A59D1b64Be2831983Db'
            || poolInfo[0] == '0xb6Fae03E73Bc3b9c89B2ec97a2C85Ac11906B524'
            || poolInfo[0] == '0x24CD5Fb4bc302BAEd58305cFE486AbE0fc8573ae'
            || poolInfo[0] == '0x0A2E210B46FAd395591943bB3342c7d8d8057D59'
            
            ) {
            continue
        }
        const tokenInfo = await fetchToken({ address: poolInfo[0]})
        const depositFee = parseInt(poolInfo[4].toString()) /100;

        const poolRewardPerBlock = parseInt(tokenMintedPerBlock.toString()) * parseInt(multiplier.toString()) * parseInt(poolInfo[1].toString()) / parseInt(totalAllocPoint.toString());
        const poolRewardPerYear = poolRewardPerBlock * blockPerYear;
        const poolRewardPerYearUsd = (poolRewardPerYear / 10**18) * nativeTokenPriceUsd;

        if(tokenInfo.symbol == 'PLP' || tokenInfo.symbol == '9mm-LP') {    //farm token is LP token
            const data = await readContracts({
                contracts: [
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName:'token0',
                    },
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName:'token1',
                    },
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName: 'totalSupply',
                    },
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName: 'getReserves',
                    },
                    {
                        address: poolInfo[0],
                        abi: tokenAbi,
                        functionName: 'balanceOf',
                        args: [import.meta.env.VITE_MASTER]
                    },
                    {
                        address: poolInfo[0],
                        abi: lpAbi,
                        functionName:'allowance',
                        args: [address, import.meta.env.VITE_MASTER],
                    },
                ]
            });

            const lpToken0Name = data[0].result
            const lpToken1Name = data[1].result
            const lpTotalSupply = data[2].result;
            const getLpReserves = data[3].result;
            const totalStaked = data[4].result;
            const allowance = data[5].result;
            
            const token0Name = await fetchToken({ address: lpToken0Name })
            const token1Name = await fetchToken({ address: lpToken1Name })

            let lpName = '';
            let isHysc = false;
            let isV1 = false;

           

// ========================= GET THE CORRECT LP PRICE DEPENDING ON PAIRING =======================          
            let lpPriceUsd;
            let token0 = lpToken0Name;
            let token1 = lpToken1Name;

            if(token0Name.name == 'Wrapped Pulse'){
            const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
            lpPriceUsd = (lpPriceEth * pulsePrice).toString();
            token0 ='PLS'
            }
            else if (token1Name.name == 'Wrapped Pulse'){
            const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
            lpPriceUsd = (lpPriceEth * pulsePrice).toString();
            token1 = 'PLS'
            }
            
            else if(token0Name.name == 'hyoscyamine'){
                const lpPriceEth = parseInt(getLpReserves[0].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * nativeTokenPriceUsd).toString();
            }
            else if (token1Name.name == 'hyoscyamine'){
                const lpPriceEth = parseInt(getLpReserves[1].toString()) * 2 / parseInt(lpTotalSupply.toString());
                lpPriceUsd = (lpPriceEth * nativeTokenPriceUsd).toString();
            }
           
          
            else if(token0Name.address == '0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF'){ //kymato
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * kymatoPrice).toString();
            }
            else if (token1Name.address == '0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF'){ //kymato
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * kymatoPrice).toString();
            }
               
            else if(token0Name.address == '0xb724eA7a4F5eA808972E39f1c9dfB1a1871c4f70'){ //snake
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * snakePrice).toString();
            }
            else if (token1Name.address == '0xb724eA7a4F5eA808972E39f1c9dfB1a1871c4f70'){ //snake
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * snakePrice).toString();
            }  
            else if(token0Name.address == '0xa5C17b43E977d73b06c04F81D830142F485D79d2'){ //waves
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * wavePrice).toString();
            }
            else if (token1Name.address == '0xa5C17b43E977d73b06c04F81D830142F485D79d2'){ //waves
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * wavePrice).toString();
            } 
            else if(token0Name.address == '0x252C7EAAe7E4FEDec5b33e57AD72699b521EC722'){ //torus
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * torusPrice).toString();
            }
            else if (token1Name.address == '0x252C7EAAe7E4FEDec5b33e57AD72699b521EC722'){ //torus
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * torusPrice).toString();
            } 
            else if(token0Name.address == '0x697fc467720b2a8e1b2f7f665d0e3f28793e65e8'){ //a1a
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * a1aPrice).toString();
            }
            else if (token1Name.address == '0x697fc467720b2a8e1b2f7f665d0e3f28793e65e8'){ //a1a
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * a1aPrice).toString();
            } 
            else if(token0Name.address == '0x007957CB23C9044343B62A7FaE2A4dAa7265531e'){ //Scop
                const lpPriceEth = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * scopolaPrice).toString();
            }
            else if (token1Name.address == '0x007957CB23C9044343B62A7FaE2A4dAa7265531e'){ //Scop
                const lpPriceEth = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth * scopolaPrice).toString();
            } 
            else if(token0Name.address == '0x962d791578C8696D30755Ed621c767a7a2A3D9ef'){ //anu
                const lpPriceEth2 = (parseInt(getLpReserves[0].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth2 * anuPrice).toString();
            }
            else if (token1Name.address == '0x962d791578C8696D30755Ed621c767a7a2A3D9ef'){ //anu
                const lpPriceEth2 = (parseInt(getLpReserves[1].toString()) * 2) / (parseInt(lpTotalSupply.toString()));
                lpPriceUsd = (lpPriceEth2 * anuPrice).toString();
            }
            if (token0Name.name == 'hyoscyamine' || token1Name.name == 'hyoscyamine') {
                isHysc = true;
            }

//=======================================================================================
            const totalStakedUsd = (parseInt(totalStaked.toString()) / 10**18) * lpPriceUsd;

            let Apr;
            if (totalStakedUsd == 0) {
                Apr = poolRewardPerYearUsd / 1 * 100
            }
            else {Apr = poolRewardPerYearUsd / totalStakedUsd * 100 }
            if (Apr > 10000000000) {Apr = 10000000000}

            if(isConnected) {
                const data = await readContracts({
                    contracts: [
                        {
                            address: poolInfo[0],
                            abi: tokenAbi,
                            functionName: 'balanceOf',
                            args: [address] 
                        },
                        {
                            ...masterContract,
                            functionName: 'degenInfo',
                            args:[i, address]
                        },
                        {
                            ...masterContract,
                            functionName: 'pendingRewards',
                            args:[i, address]
                        }
                    ]
                });
                const userBalance = data[0].result;
                const userInfo = data[1].result;
                const rewards = data[2].result;

                const pendingRewards = (parseFloat(rewards.toString()) / 10**18).toFixed(5);
                const pendingRewardsUsd = (pendingRewards * nativeTokenPriceUsd).toFixed(2);

         
                const userStaked = userInfo[0].toString();
                const userStakedUsd = parseInt(userStaked.toString()) /10**18 * lpPriceUsd;
               

// ================= GET THE COMPOSITION OF LP TOKENS ==================
            //Amount of each token per LP token
            const token0Amount = parseInt(getLpReserves[0].toString())/ parseInt(lpTotalSupply.toString())
            const token1Amount = parseInt(getLpReserves[1].toString()) / parseInt(lpTotalSupply.toString())

            const token0staked = token0Amount * (parseInt(userStaked) / 10**token0Name.decimals)
            const token1staked = token1Amount * (parseInt(userStaked) / 10**token1Name.decimals)

                allInfo.id = i;
                allInfo.name = lpName;
                allInfo.userStaked = userStaked.toString();
                allInfo.userStakedUsd = userStakedUsd;
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards;
                allInfo.rewardsUsd = pendingRewardsUsd;
                allInfo.userBalance = userBalance.toString();
                allInfo.allowance = allowance;
                allInfo.address = poolInfo[0];
                allInfo.depositFee = depositFee;
                allInfo.isHysc = isHysc;
                allInfo.isV1 = isV1;
                allInfo.token0 = token0;
                allInfo.token1 = token1;
                allInfo.rewardAlloc = rewardAlloc;
                allInfo.token0Staked = token0staked;
                allInfo.token1Staked = token1staked;
                allInfo.token0Symbol = token0Name.symbol;
                allInfo.token1Symbol = token1Name.symbol;


            } else {    //user is not connected
                allInfo.name = lpName;
                allInfo.userStaked = '0';
                allInfo.userStakedUsd = '0';
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = '0';
                allInfo.rewardsUsd = '0';
                allInfo.depositFee = depositFee;
                allInfo.isHysc = isHysc;
                allInfo.isV1 = isV1;
                allInfo.token0 = token0;
                allInfo.token1 = token1;
                allInfo.rewardAlloc = rewardAlloc;
                allInfo.token0Symbol = token0Name.symbol;
                allInfo.token1Symbol = token1Name.symbol;
            }
            farmingPools.push(allInfo) 
// =========================== SINGLE SIDED STAKING ==============================
        
        } else { //Not a LP token ie. single sided pool

                const data = await readContracts({
                    contracts: [
                        {
                            address: import.meta.env.VITE_LP,
                            abi: lpAbi,
                            functionName: 'getReserves',
                        },
                        {
                            address: poolInfo[0],
                            abi: tokenAbi,
                            functionName: 'balanceOf',
                            args: [import.meta.env.VITE_MASTER]
                        },
                        {
                            address: poolInfo[0],
                            abi: tokenAbi,
                            functionName:'allowance',
                            args: [address, import.meta.env.VITE_MASTER],
                        },
                       
                        {
                            address: '0x5087bfbEaC7C7A1038C7a3c437652B1A40e6B877', //kymato/wPLS
                            abi: lpAbi,
                            functionName: 'getReserves',
                        },
                        {
                            address: '0x1a55626cdfbf730843c3be3dbb1ec850623fc90a', //scop/wPLS
                            abi: lpAbi,
                            functionName: 'getReserves',
                        },
                    ]
                })

            const tokenPriceEth = data[0].result;
            const totalStaked = data[1].result;
            const allowance = data[2].result;

            const HyscPriceUsd = (parseInt(tokenPriceEth[1].toString())/parseInt(tokenPriceEth[0].toString()) * pulsePrice).toString();


            let tokenPriceUsd;
            let totalStakedUsd;
            let Apr =0 ;
            if (poolInfo[0] == '0x73D159B3C18447Da0D332e147C00F8802A5d9263') {
                tokenPriceUsd = HyscPriceUsd;
                totalStakedUsd = (parseInt(totalStaked.toString()) / 10**18) * tokenPriceUsd;
            }
            
            else if (poolInfo[0] == '0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF') {
                tokenPriceUsd = kymatoPrice;
                totalStakedUsd = (parseInt(totalStaked.toString()) / 10**18) * tokenPriceUsd;
            }

            else if (poolInfo[0] == '0x007957CB23C9044343B62A7FaE2A4dAa7265531e') {
                tokenPriceUsd = scopolaPrice;
                totalStakedUsd = (parseInt(totalStaked.toString()) / 10**18) * tokenPriceUsd;
            }

            if (totalStakedUsd == 0) {
                Apr = poolRewardPerYearUsd / 1 * 100
            }
            else {Apr = poolRewardPerYearUsd / totalStakedUsd * 100 }
            if (Apr > 10000000000) {Apr = 10000000000}

            if(isConnected) {

                const data = await readContracts({
                    contracts: [
                        {
                            address: poolInfo[0],
                            abi: tokenAbi,
                            functionName: 'balanceOf',
                            args: [address] 
                        },
                        {
                            ...masterContract,
                            functionName: 'degenInfo',
                            args:[i, address]
                        },
                        {
                            ...masterContract,
                            functionName: 'pendingRewards',
                            args:[i, address]
                        },
                        {
                            address: poolInfo[0],
                            abi: tokenAbi,
                            functionName: 'decimals', 
                        },
                    ]
                });
                const userBalance = data[0].result;
                const userInfo = data[1].result;
                const rewards = data[2].result;
                const decimals = data[3].result;

                const pendingRewards = (parseFloat(rewards.toString()) / 10**18)
                const pendingRewardsUsd = (pendingRewards * nativeTokenPriceUsd)

                const userStaked = userInfo[0]
                const userStakedUsd = parseInt(userStaked.toString()) / (10**decimals) * parseFloat(tokenPriceUsd);
                const rewardPerShare = poolRewardPerYear / parseInt(totalStaked.toString());
                const rewardPerShareUsd = rewardPerShare * pulsePrice;
                const userShare = parseInt(userStaked.toString()) / (parseInt(totalStaked.toString()));
                const userShareUsdPerYear = rewardPerShareUsd * userShare;
        
                allInfo.id = i;
                allInfo.name = tokenInfo.symbol
                allInfo.userStaked = userStaked.toString();
                allInfo.userStakedUsd = userStakedUsd
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2)
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = pendingRewards.toFixed(2);
                allInfo.rewardsUsd = pendingRewardsUsd.toFixed(2);
                allInfo.userBalance = userBalance;
                allInfo.allowance = allowance;
                allInfo.address = poolInfo[0];
                allInfo.depositFee = depositFee;
                allInfo.pulsePrice = pulsePrice;
                allInfo.scopolaPrice = scopolaPrice;
                allInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;
                allInfo.token = tokenInfo.address;
                allInfo.userShareUsdPerYear = userShareUsdPerYear;
               

            } else {    //user not connected
                allInfo.name = tokenInfo.symbol;
                allInfo.userStaked = '0';
                allInfo.userStakedUsd = '0';
                allInfo.totalStakedUsd = totalStakedUsd.toFixed(2);
                allInfo.apr = parseInt(Apr);
                allInfo.rewards = '0';
                allInfo.rewardsUsd = '0';
                allInfo.depositFee = depositFee;
                allInfo.pulsePrice = pulsePrice;
                allInfo.nativeTokenPriceUsd = nativeTokenPriceUsd;
                allInfo.token = tokenInfo.address

                
            }
            stakingPools.push(allInfo);
        } 
    }   
    allPools.generalInfo = general;
    allPools.farmingPools = farmingPools;
    allPools.stakingPools = stakingPools;


   
    
return  allPools;

}