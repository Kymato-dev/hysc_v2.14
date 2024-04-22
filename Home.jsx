import { useContractWrite } from "wagmi";
import {
  readContracts,
  writeContract,
  readContract,
  fetchBlockNumber,
} from "wagmi/actions";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  VStack,
  Spinner,
  Text,
  SimpleGrid,
  Image,
  Link,
  Tooltip,
  useClipboard,
  IconButton,
} from "@chakra-ui/react";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { InfoContext } from "./App";
import { lpAbi, masterAbi, tokenAbi, masterContract, masterContract2, vaultAbi } from "./data";
import { CopyIcon, CheckIcon } from "@chakra-ui/icons";
import dexscreener from "./assets/dexscreener.png";
import pulseChain from "./assets/PulseChain.jpeg";
import hyo from "./assets/hyos.png";
import hyoscyamine  from "./assets/FarmIcons/hyoscyamine.gif";
import kymato from './assets/FarmIcons/kymato.svg'
import caduceus from './assets/FarmIcons/cad.png'
import snake from './assets/FarmIcons/snake.png'

function Home() {
  const allPools = useContext(InfoContext);
  const { open } = useWeb3Modal();
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [totalRewards, setTotalRewards] = useState();
  const [totalRewards2, setTotalRewards2] = useState();
  const [totalRewardsUsd, setTotalRewardsUsd] = useState();
  const [totalRewardsUsd2, setTotalRewardsUsd2] = useState();
  const [userTotalStaked, setUserTotalStaked] = useState();
  const [userTotalStaked2, setUserTotalStaked2] = useState();
  const [dailyEarnings, setDailyEarnings] = useState();
  const [dailyEarnings2, setDailyEarnings2] = useState();
  
  const [totalRewardsBothMasterUsd, setTotalRewardsBothMasterUsd] = useState();
  
  const [totalRewardsIncVaults, setTotalRewardsIncVaults] = useState();
  const [totalRewardsIncVaults2, setTotalRewardsIncVaults2] = useState();

  const [totalRewardsIncVaultsUsd, setTotalRewardsIncVaultsUsd] = useState();
  const [totalRewardsIncVaultsUsd2, setTotalRewardsIncVaultsUsd2] = useState();

  const [vaultRewards, setVaultRewards] = useState();
  const [vaultRewards2, setVaultRewards2] = useState();
  const [vaultRewardsUsd, setVaultRewardsUsd] = useState();
  
  const [tvl, setTvl] = useState();
  const [tvl2, setTvl2] = useState();
  
  
  const [nativeTokenPrice, setNativeTokenPrice] = useState();
  const [nativeTokenPrice2, setNativeTokenPrice2] = useState();
  const [marketCap, setMarketCap] = useState();
  const [totalSupply, setTotalSupply] = useState();
  const [inflation, setInflation] = useState();
  const [marketCap2, setMarketCap2] = useState();
  const [totalSupply2, setTotalSupply2] = useState();
  const [inflation2, setInflation2] = useState();
  const [averageApr, setAverageApr] = useState();
  const [averageApr2, setAverageApr2] = useState();

  
  const [burned, setBurned] = useState();
  const [burned2, setBurned2] = useState();
  
  const [kymatoPrice, setKymatoPrice] = useState();
  const [scopolaPrice, setScopolaPrice] = useState();
  const [snakePrice, setSnakePrice] = useState();
  const [teddyPrice, setTeddyPrice] = useState();
  const [eHexPrice, setEHexPrice] = useState();
  const [kymatoTvlUsd, setkymatoTvlUsd] = useState();
  //
  const [tokenMintedPerBlock, setTokenMintedPerBlock] = useState();
  const [tokenMintedPerBlock2, setTokenMintedPerBlock2] = useState();

  const [kymatoTotalSupply, setKymatoTotalSupply] = useState();
  const [kymatoMarketCap, setKymatoMarketCap] = useState();
  const [kymatoBurn, setKymatoBurn] = useState();

  const [snakeTotalSupply, setSnakeTotalSupply] = useState();
  const [snakeMarketCap, setSnakeMarketCap] = useState();
  const [snakeBurn, setSnakeBurn] = useState();

  const { address, isConnected } = useAccount();
  
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: '',
    abi: masterAbi,
    functionName: "claimAll",
  });


  const { onCopy, value, setValue, hasCopied } = useClipboard(address);
  const poolsToClaim = [
    { address: import.meta.env.VITE_MASTER2, abi: masterAbi },
    { address: import.meta.env.VITE_MASTER, abi: masterAbi },
    { address: "0x7e144619dF6243c01b1ba10c6A3b564AD0417B9A", abi: vaultAbi }, // kymato
    { address: "0x8652f569A3fAa606EDCd1B8716f725FB97bB8113", abi: vaultAbi }, // scopola
    { address: "0xCf74F7B81Fd9F51dDe0A0132E389eE0F4aE93b00", abi: vaultAbi }, // snake
    { address: "0x9608b3eB01db7f27736619540Ab093224Fd57Ed2", abi: vaultAbi }, // teddy
    // Add vault
  ];
  
  async function claimAll() {
    for (let i = 0; i < poolsToClaim.length; i++) {
      let pending;
      if (i === 0) {
        // For the first pool (index 0), run claimAll
        if (totalRewards > 0) {
          const { hash } = await writeContract({
            address: poolsToClaim[i].address,
            abi: poolsToClaim[i].abi,
            functionName: 'claimAll',
            args: null,
          });
        }
      } else if (i === 1) {
        // For the second pool (index 1), check and deposit if pending rewards for args [0, 0] to [15, 0]
        for (let j = 0; j <= 14; j++) {
          pending = await readContract({
            address: poolsToClaim[i].address,
            abi: poolsToClaim[i].abi,
            functionName: 'pendingRewards',
            args: [j, address],
          });
  
          if (pending  > 0) {
            const { hash } = await writeContract({
              address: poolsToClaim[i].address,
              abi: poolsToClaim[i].abi,
              functionName: 'deposit',
              args: [j, 0],
            });
          }
        }
      
      } else {
        // For other pools (index 2 to 5), check and deposit if pending rewards
        pending = await readContract({
          address: poolsToClaim[i].address,
          abi: poolsToClaim[i].abi,
          functionName: 'pendingRewards',
          args: [address],
        });
  
        if (pending.actualRewards > 0) {
          const { hash } = await writeContract({
            address: poolsToClaim[i].address,
            abi: poolsToClaim[i].abi,
            functionName: 'deposit',
            args: [0],
          });
        }
      }
    }
  }
  
  

  useEffect(() => {
    async function getData() {
      let protocolPools = [];
      let protocolPools2 = [];
      let totalRewardsBothMasterUsd = 0;
      
      let tvl = 0;
      let totalRewards = 0;
      let totalRewardsUsd = 0;
      let vaultRewardsUsd = 0;
      let userTotalStaked = 0;
      let poolEarnings = 0;
      let sumEarnings = 0;
      
      let sumApr = 0;
      let totalRewardsIncVaults = 0;
      let totalRewardsIncVaultsUsd = 0;
      
      let tvl2 = 0;
      let totalRewards2 = 0;
      let totalRewardsUsd2 = 0;
      let userTotalStaked2 = 0;
      let poolEarnings2 = 0;
      let sumEarnings2 = 0;
      
      let sumApr2 = 0;
      let totalRewardsIncVaults2 = 0;
      let totalRewardsIncVaultsUsd2 = 0;

      const currentBlock = await fetchBlockNumber();
      const currentBlockInt = parseInt(currentBlock.toString());
      const blockPerYear = 6 * 60 * 24 * 365;

      //========================= Kymato VAULT =============================================================

      const kymatoGeneralData = await readContracts({
        contracts: [
          {
            address: "0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF",
            abi: tokenAbi,
            functionName: "balanceOf",
            args: ["0x7e144619dF6243c01b1ba10c6A3b564AD0417B9A"],
          },
          {
            ...masterContract,
            functionName: "getMultiplier",
            args: [currentBlockInt - 1, currentBlockInt],
          },
          {
            ...masterContract,
            functionName: "poolInfo",
            args: [1],
          },
          {
            ...masterContract,
            functionName: "totalAllocPoint",
          },
         
          {
            ...masterContract,
            functionName: "rewardsPerBlock",
          },
          
         
        ],
      });

      const data = await readContracts({
        contracts: [
          {
            address: "0x1CD4cc99Db9Ce3b886B4a093C21056e12EbAFE10", //Kymato
            abi: lpAbi,
            functionName: "balanceOf",
            args: ["0x24CD5Fb4bc302BAEd58305cFE486AbE0fc8573ae"],
          },
          {
            address: "0x7e144619dF6243c01b1ba10c6A3b564AD0417B9A", //Kymato vault
            abi: masterAbi,
            functionName: "degenInfo",
            args: [0, address],
          },
          {
            address: "0x7e144619dF6243c01b1ba10c6A3b564AD0417B9A",
            abi: vaultAbi,
            functionName: "pendingRewards",
            args: [address],
          },
        ],
      });

 //========================= Scopola VAULT =============================================================


const scopolaGeneralData = await readContracts ({
    contracts: [
        {
            address: '0x007957CB23C9044343B62A7FaE2A4dAa7265531e',
            abi: tokenAbi,
            functionName: 'balanceOf',
            args:['0x8652f569A3fAa606EDCd1B8716f725FB97bB8113']
         },
         {
            ...masterContract,
            functionName: 'getMultiplier',
            args: [currentBlockInt-1, currentBlockInt]
         },
         {
         ...masterContract,
         functionName: 'poolInfo',
         args: [13]
         },
         {
            ...masterContract,
            functionName: 'totalAllocPoint',
         },
         
        {
            ...masterContract,
            functionName: 'rewardsPerBlock',
        },
       
    ]
})

const scopolaData = await readContracts ({
  contracts: [
      {
          address: '0x8652f569A3fAa606EDCd1B8716f725FB97bB8113',
          abi: vaultAbi,
          functionName: 'degenInfo',
          args:[0, address]
      },
      {
          address: '0x8652f569A3fAa606EDCd1B8716f725FB97bB8113',
          abi: vaultAbi,
          functionName: 'pendingRewards',
          args:[address]
      },
      {
          address: '0x007957CB23C9044343B62A7FaE2A4dAa7265531e',
          abi: tokenAbi,
          functionName: 'balanceOf',
          args:[address]
      },
      
  ]
})

//---------------------------------------------------------------------//

 //========================= Snake VAULT =============================================================


 const snakeGeneralData = await readContracts ({
  contracts: [
      {
          address: '0xb724eA7a4F5eA808972E39f1c9dfB1a1871c4f70',
          abi: tokenAbi,
          functionName: 'balanceOf',
          args:['0xCf74F7B81Fd9F51dDe0A0132E389eE0F4aE93b00']
       },
       {
          ...masterContract2,
          functionName: 'getMultiplier',
          args: [currentBlockInt-1, currentBlockInt]
       },
       {
       ...masterContract2,
       functionName: 'poolInfo',
       args: [3]
       },
       {
          ...masterContract2,
          functionName: 'totalAllocPoint',
       },
      
      {
          ...masterContract2,
          functionName: 'rewardsPerBlock',
      },
     
  ]
})

const snakeData = await readContracts ({
contracts: [
    {
        address: '0xCf74F7B81Fd9F51dDe0A0132E389eE0F4aE93b00',
        abi: vaultAbi,
        functionName: 'degenInfo',
        args:[0, address]
    },
    {
        address: '0xCf74F7B81Fd9F51dDe0A0132E389eE0F4aE93b00',
        abi: vaultAbi,
        functionName: 'pendingRewards',
        args:[address]
    },
    
    
]
})

//========================= Teddy VAULT =============================================================


const teddyGeneralData = await readContracts ({
  contracts: [
      {
          address: '0xd6c31bA0754C4383A41c0e9DF042C62b5e918f6d',
          abi: tokenAbi,
          functionName: 'balanceOf',
          args:['0x9608b3eB01db7f27736619540Ab093224Fd57Ed2']
       },
       {
          ...masterContract2,
          functionName: 'getMultiplier',
          args: [currentBlockInt-1, currentBlockInt]
       },
       {
       ...masterContract2,
       functionName: 'poolInfo',
       args: [4]
       }
  ]
})

const teddyData = await readContracts ({
contracts: [
    {
        address: '0x9608b3eB01db7f27736619540Ab093224Fd57Ed2',
        abi: vaultAbi,
        functionName: 'degenInfo',
        args:[0, address]
    },
    {
        address: '0x9608b3eB01db7f27736619540Ab093224Fd57Ed2',
        abi: vaultAbi,
        functionName: 'pendingRewards',
        args:[address]
    },
    
    
]
})


//========================= eHex VAULT =============================================================


const eHexGeneralData = await readContracts ({
  contracts: [
      {
          address: '0xd6c31bA0754C4383A41c0e9DF042C62b5e918f6d',
          abi: tokenAbi,
          functionName: 'balanceOf',
          args:['0x10b106aA73827c59FbC67296231cBdf6fb57Aa21']
       },
       {
          ...masterContract2,
          functionName: 'getMultiplier',
          args: [currentBlockInt-1, currentBlockInt]
       },
       {
       ...masterContract2,
       functionName: 'poolInfo',
       args: [4]
       }
      
  ]
})

const eHexData = await readContracts ({
contracts: [
    {
        address: '0x10b106aA73827c59FbC67296231cBdf6fb57Aa21',
        abi: vaultAbi,
        functionName: 'degenInfo',
        args:[0, address]
    },
    {
        address: '0x10b106aA73827c59FbC67296231cBdf6fb57Aa21',
        abi: vaultAbi,
        functionName: 'pendingRewards',
        args:[address]
    },
    
    
]
})

//---------------------------------------------------------------------//



      const kymatoTvl = data[0].result;
      const kymatoPendingRewards = address ? data[2].result : 0;
      const kymatoStaked = address ? data[1].result[0] : 0;

      const scopolaPendingRewards = address ? scopolaData[1].result : 0;
      const scopolaStaked = address ? scopolaData[0].result[0] : 0;

      const snakePendingRewards = address ? snakeData[1].result : 0;
      const snakeStaked = address ? snakeData[0].result[0] : 0;
      
      const teddyPendingRewards = address ? teddyData[1].result : 0;
      const teddyStaked = address ? teddyData[0].result[0] : 0;

      const eHexPendingRewards = address ? eHexData[1].result : 0;
      const eHexStaked = address ? eHexData[0].result[0] : 0;

      
      //add
      

      function wait() {
        if (!allPools) {
          setTimeout(wait, 60);
        } else {
          setIsDataLoading(false);
          const nativeTokenPrice = allPools.generalInfo[0].nativeTokenPriceUsd;
          const nativeTokenPrice2 = allPools.generalInfo2[0].nativeTokenPriceUsd;
          const snakePrice = allPools.stakingPools2[0].snakePrice;
          const teddyPrice = allPools.stakingPools2[0].teddyPrice;
          const eHexPrice = allPools.stakingPools2[0].eHexPrice;

          const snakeTotalSupply = allPools.generalInfo[0].snakeTotalSupply;
          const snakeMarketCap = (snakePrice) * snakeTotalSupply ;
          const snakeBurn = allPools.generalInfo[0].snakeBurn;


          setTeddyPrice(teddyPrice);
          setSnakePrice(snakePrice);
          setEHexPrice(eHexPrice);
          setNativeTokenPrice(parseFloat(nativeTokenPrice).toFixed(4));
          setNativeTokenPrice2(parseFloat(nativeTokenPrice2).toFixed(4));
          let tokenMintedPerBlock = kymatoGeneralData[4].result;
          
          
          setTokenMintedPerBlock(tokenMintedPerBlock);
          
          const marketCap =
            allPools.generalInfo[0].nativeTokenSupply * nativeTokenPrice;
          const totalSupply = parseInt(
            allPools.generalInfo[0].nativeTokenSupply
          );
       //
          
          const marketCap2 =
            allPools.generalInfo2[0].nativeTokenSupply * nativeTokenPrice2;
          const totalSupply2 = parseInt(
            allPools.generalInfo2[0].nativeTokenSupply
          );

          //add
          const inflation = allPools.generalInfo[0].inflation;
          const burned = allPools.generalInfo[0].burned;
          const inflation2 = allPools.generalInfo2[0].inflation;
          const burned2 = allPools.generalInfo2[0].burned;
          
          //---------------------------------Kymato----------------------------------------//
            const actualKymatoRewards = kymatoPendingRewards
            ? kymatoPendingRewards.actualRewards
            : 0;
          const kymatoPrice = allPools.generalInfo[0].kymatoPrice;
          const kymatoTotalSupply = allPools.generalInfo[0].kymatoTotalSupply;
          const kymatoMarketCap = kymatoPrice * kymatoTotalSupply;
          const kymatoBurn = allPools.generalInfo[0].kymatoBurn; 
          const kymatoTvlUsd = (parseInt(kymatoTvl.toString()) * kymatoPrice) / 10 ** 18;
          
          
          const kymatoStakedUsd = (parseInt(kymatoStaked.toString()) * kymatoPrice) / 10 ** 18;
          const KymatoRewardsUsd = (parseInt(actualKymatoRewards.toString()) * nativeTokenPrice) / 10 ** 18;
          const actualKymatoRewardsFormatted = actualKymatoRewards.toString() / 10 ** 18;
          const totalKymatoStaked = kymatoGeneralData[0].result;
          let multiplier = kymatoGeneralData[1].result;
          let poolInfo = kymatoGeneralData[2].result;
          let totalAllocPoint = kymatoGeneralData[3].result;
          
          
          setkymatoTvlUsd(kymatoTvlUsd);
          setMarketCap(marketCap.toFixed(0));
          setTotalSupply(totalSupply);
          setBurned(burned);
          setMarketCap2(marketCap2.toFixed(0));
          setTotalSupply2(totalSupply2);
          setBurned2(burned2);
          
          
          

          //-------------Kymato VAULT
         
          const totalKymatoStakedUsd = (parseInt(totalKymatoStaked.toString()) * kymatoPrice) / 10 ** 18;
          
          let poolRewardPerBlock =
              (parseInt(tokenMintedPerBlock.toString()) *
              parseInt(multiplier.toString()) *
              parseInt(poolInfo[1].toString())) /
              parseInt(totalAllocPoint.toString());

          let poolRewardPerYear = poolRewardPerBlock * blockPerYear;
          let poolRewardPerYearUsd = (poolRewardPerYear / 10 ** 18) * nativeTokenPrice;
          let kymatoPoolEarnings = 0;
          let kymatoApr;
            if (kymatoStakedUsd == 0) {
              kymatoApr = (poolRewardPerYearUsd / 1) * 100;
            } else {
              kymatoApr = (poolRewardPerYearUsd / totalKymatoStakedUsd) * 100;
            }
            if (
              kymatoApr > 100000000000) {
              kymatoApr = 100000000000;
            }
          kymatoPoolEarnings = (kymatoStakedUsd * kymatoApr) / 100 / 365;

          //--------------------------Scopola-------------------------------------//

            const actualScopolaRewards = scopolaPendingRewards
            ? scopolaPendingRewards.actualRewards
            : 0;
          const scopolaPrice = allPools.generalInfo[0].scopolaPrice;
          const scopolaStakedUsd = scopolaStaked ? (parseInt(scopolaStaked.toString()) * scopolaPrice) / 10 ** 18 : 0;
          const scopolaRewardsUsd = actualScopolaRewards ? (parseInt(actualScopolaRewards.toString()) * nativeTokenPrice) / 10 ** 18 : 0;
          const actualScopolaRewardsFormatted = actualScopolaRewards.toString() / 10 ** 18;
          const totalScopolaStaked = scopolaGeneralData[0].result;
          
          let sMultiplier = scopolaGeneralData[1].result;
          let sPoolInfo = scopolaGeneralData[2].result;
          let sTotalAllocPoint = scopolaGeneralData[3].result;
          let sTokenMintedPerBlock = scopolaGeneralData[4].result;
          
          setScopolaPrice(scopolaPrice);
         
          const totalScopolaStakedUsd = (parseInt(totalScopolaStaked.toString()) * scopolaPrice) / 10 ** 18;
          let sPoolRewardPerBlock =(
              parseInt(sTokenMintedPerBlock.toString()) *
              parseInt(sMultiplier.toString()) *
              parseInt(sPoolInfo[1].toString())) /
              parseInt(sTotalAllocPoint.toString());
          let sPoolRewardPerYear = sPoolRewardPerBlock * blockPerYear;
          let sPoolRewardPerYearUsd = (sPoolRewardPerYear / 10 ** 18) * nativeTokenPrice;
          let scopolaPoolEarnings = 0;
          let scopolaApr;
          if (scopolaStakedUsd == 0) {scopolaApr = (sPoolRewardPerYearUsd / 1) * 100;
          } 
          else {
            scopolaApr = (sPoolRewardPerYearUsd / totalScopolaStakedUsd) * 100;
          }
          if (
            scopolaApr > 100000000000) {
            scopolaApr = 100000000000;
          }
          scopolaPoolEarnings = (scopolaStakedUsd * scopolaApr) / 100 / 365;

          

          //--------------------------Snake-------------------------------------//

          const actualSnakeRewards = snakePendingRewards
          ? snakePendingRewards.actualRewards
          : 0;
        
        const snakeStakedUsd = snakeStaked ? (parseInt(snakeStaked.toString()) * snakePrice) / 10 ** 9 : 0;
        const snakeRewardsUsd = actualSnakeRewards ? (parseInt(actualSnakeRewards.toString()) * nativeTokenPrice2) / 10 ** 18 : 0;
        const actualSnakeRewardsFormatted = actualSnakeRewards.toString() / 10 ** 18;
        const totalSnakeStaked = snakeGeneralData[0].result;
        
        let snMultiplier = snakeGeneralData[1].result;
        let snPoolInfo = snakeGeneralData[2].result;
        let snTotalAllocPoint = snakeGeneralData[3].result;
        let snTokenMintedPerBlock = snakeGeneralData[4].result;
        
       
        setSnakePrice(snakePrice);
       
        const totalSnakeStakedUsd = (parseInt(totalSnakeStaked.toString()) * snakePrice) / 10 ** 9;
        let snPoolRewardPerBlock =(
            parseInt(snTokenMintedPerBlock.toString()) *
            parseInt(snMultiplier.toString()) *
            parseInt(snPoolInfo[1].toString())) /
            parseInt(snTotalAllocPoint.toString());
        let snPoolRewardPerYear = snPoolRewardPerBlock * blockPerYear;
        let snPoolRewardPerYearUsd = (snPoolRewardPerYear / 10 ** 9) * nativeTokenPrice2;
        let snakePoolEarnings = 0;
        let snakeApr;
        if (snakeStakedUsd == 0) {snakeApr = (snPoolRewardPerYearUsd / 1) * 100;
        } 
        else {
          snakeApr = (snPoolRewardPerYearUsd / totalSnakeStakedUsd) * 100 / 10**9;
        }
        if (
          snakeApr > 100000000000000) {
          snakeApr = 100000000000000;
        }
        snakePoolEarnings = (snakeStakedUsd * snakeApr) / 100 / 365;

        setTokenMintedPerBlock2(snTokenMintedPerBlock);

        

       
//--------------------------Teddy-------------------------------------//

const actualTeddyRewards = teddyPendingRewards
? teddyPendingRewards.actualRewards
: 0;

const teddyStakedUsd = teddyStaked ? (parseInt(teddyStaked.toString()) * teddyPrice) / 10 ** 18 : 0;
const teddyRewardsUsd = actualTeddyRewards ? (parseInt(actualTeddyRewards.toString()) * nativeTokenPrice2) / 10 ** 18 : 0;
const actualTeddyRewardsFormatted = actualTeddyRewards.toString() / 10 ** 18;
const totalTeddyStaked = teddyGeneralData[0].result;

let tMultiplier = teddyGeneralData[1].result;
let tPoolInfo = teddyGeneralData[2].result;
let tTotalAllocPoint = snTotalAllocPoint;
let tTokenMintedPerBlock = snTokenMintedPerBlock;


setTeddyPrice(teddyPrice);

const totalTeddyStakedUsd = (parseInt(totalTeddyStaked.toString()) * teddyPrice) ;
let tPoolRewardPerBlock =(
  parseInt(tTokenMintedPerBlock.toString()) *
  parseInt(tMultiplier.toString()) *
  parseInt(tPoolInfo[1].toString())) /
  parseInt(tTotalAllocPoint.toString());
let tPoolRewardPerYear = tPoolRewardPerBlock * blockPerYear;
let tPoolRewardPerYearUsd = (tPoolRewardPerYear / 10 ** 18) * nativeTokenPrice2;
let teddyPoolEarnings = 0;
let teddyApr;
if (teddyStakedUsd == 0) {teddyApr = (tPoolRewardPerYearUsd / 1) * 100;
} 
else {
teddyApr = (tPoolRewardPerYearUsd / totalTeddyStakedUsd) * 100 / 10**18;
}
if (
teddyApr > 100000000000000) {
teddyApr = 100000000000000;
}
teddyPoolEarnings = (teddyStakedUsd * teddyApr) / 100 / 365;

//--------------------------eHex-------------------------------------//

const actualEHexRewards = eHexPendingRewards
? eHexPendingRewards.actualRewards
: 0;

const eHexStakedUsd = eHexStaked ? (parseInt(eHexStaked.toString()) * eHexPrice) / 10 ** 18 : 0;
const eHexRewardsUsd = actualEHexRewards ? (parseInt(actualEHexRewards.toString()) * nativeTokenPrice2) / 10 ** 18 : 0;
const actualEHexRewardsFormatted = actualEHexRewards.toString() / 10 ** 18;
const totalEHexStaked = eHexGeneralData[0].result;

let eMultiplier = eHexGeneralData[1].result;
let ePoolInfo = eHexGeneralData[2].result;
let eTotalAllocPoint = snTotalAllocPoint;
let eTokenMintedPerBlock = snTokenMintedPerBlock;


setEHexPrice(eHexPrice);

const totalEHexStakedUsd = (parseInt(totalEHexStaked.toString()) * eHexPrice) ;
let ePoolRewardPerBlock =(
  parseInt(eTokenMintedPerBlock.toString()) *
  parseInt(eMultiplier.toString()) *
  parseInt(ePoolInfo[1].toString())) /
  parseInt(eTotalAllocPoint.toString());
let ePoolRewardPerYear = ePoolRewardPerBlock * blockPerYear;
let ePoolRewardPerYearUsd = (ePoolRewardPerYear / 10 ** 18) * nativeTokenPrice2;
let eHexPoolEarnings = 0;
let eHexApr;
if (eHexStakedUsd == 0) {eHexApr = (ePoolRewardPerYearUsd / 1) * 100;
} 
else {
eHexApr = (ePoolRewardPerYearUsd / totalEHexStakedUsd) * 100 / 10**18;
}
if (
eHexApr > 100000000000000) {
eHexApr = 100000000000000;
}
eHexPoolEarnings = (eHexStakedUsd * eHexApr) / 100 / 365;





//-----------------------------------------------------------------//

        

          for (let i = 0; i < allPools.farmingPools.length; i++) {
            protocolPools.push(allPools.farmingPools[i]);
          }
          for (let i = 0; i < allPools.farmingPools2.length; i++) {
            protocolPools2.push(allPools.farmingPools2[i]);
          }
          for (let i = 0; i < allPools.stakingPools.length; i++) {
            protocolPools.push(allPools.stakingPools[i]);
          }
          for (let i = 0; i < allPools.stakingPools2.length; i++) {
            protocolPools2.push(allPools.stakingPools2[i]);
          }
          for(let i=0; i<protocolPools.length; i++) {
            if(!parseFloat(protocolPools[i].totalStakedUsd)){
                protocolPools[i].totalStakedUsd = 0
            }
            tvl += parseFloat(protocolPools[i].totalStakedUsd);
            totalRewards += parseFloat(protocolPools[i].rewards);
            totalRewardsUsd += parseFloat((protocolPools[i].rewardsUsd));
            if(protocolPools[i].userStaked > 0) {
                sumApr += protocolPools[i].apr * protocolPools[i].userStakedUsd;
                
                userTotalStaked += protocolPools[i].userStakedUsd;
                

                poolEarnings = protocolPools[i].userStakedUsd * protocolPools[i].apr  / 100 / 365;
                sumEarnings += poolEarnings;
            }   
            }
            for(let i=0; i<protocolPools2.length; i++) {
              if(!parseFloat(protocolPools2[i].totalStakedUsd)){
                  protocolPools2[i].totalStakedUsd = 0
              }
              tvl2 += parseFloat(protocolPools2[i].totalStakedUsd);
              totalRewards2 += parseFloat(protocolPools2[i].rewards);
              totalRewardsUsd2 += parseFloat((protocolPools2[i].rewardsUsd));
              if(protocolPools2[i].userStaked > 0) {
                  sumApr2 += protocolPools2[i].apr * protocolPools2[i].userStakedUsd;
                  
                  userTotalStaked2 += protocolPools2[i].userStakedUsd;
                  
  
                  poolEarnings2 = protocolPools2[i].userStakedUsd * protocolPools2[i].apr  / 100 / 365;
                  sumEarnings2 += poolEarnings2;
                  
              }
        }

        sumApr += ((kymatoApr * kymatoStakedUsd) + (scopolaApr * scopolaStakedUsd));
sumApr2 += ((snakeApr * snakeStakedUsd) + (teddyApr * teddyStakedUsd) + (eHexApr * eHexStakedUsd));

let averageApr = 0;
if (!isNaN(sumApr) && sumApr !== 0 && !isNaN(userTotalStaked) && userTotalStaked !== 0) {
  // Calculate averageApr only if both values are valid
  averageApr = sumApr / userTotalStaked / 365;
}
setAverageApr(averageApr);

let averageApr2 = 0;
if (!isNaN(sumApr2) && sumApr2 !== 0 && !isNaN(userTotalStaked2) && userTotalStaked2 !== 0) {
  // Calculate averageApr2 only if both values are valid
  averageApr2 = sumApr2 / userTotalStaked2 / 365;
}
setAverageApr2(averageApr2);





          tvl += (totalKymatoStakedUsd + totalScopolaStakedUsd) ; 
          tvl2 += (totalSnakeStakedUsd + totalTeddyStakedUsd + totalEHexStakedUsd);//Add Vault
          sumEarnings += (kymatoPoolEarnings + scopolaPoolEarnings);
          sumEarnings2 += (snakePoolEarnings + teddyPoolEarnings + eHexPoolEarnings);//Add vault
          userTotalStaked += (kymatoStakedUsd + scopolaStakedUsd);
          userTotalStaked2 += (snakeStakedUsd + teddyStakedUsd + eHexStakedUsd); //Add vault
          
          
          vaultRewardsUsd = KymatoRewardsUsd + scopolaRewardsUsd + snakeRewardsUsd + teddyRewardsUsd + eHexRewardsUsd;

          totalRewardsBothMasterUsd = totalRewardsUsd + totalRewardsUsd2 + KymatoRewardsUsd + scopolaRewardsUsd + snakeRewardsUsd + teddyRewardsUsd + eHexRewardsUsd ; //add vault
          totalRewardsIncVaults = totalRewards + actualKymatoRewardsFormatted + actualScopolaRewardsFormatted; //add vault
          totalRewardsIncVaults2 = totalRewards2 + actualSnakeRewardsFormatted + actualTeddyRewardsFormatted +actualEHexRewardsFormatted ; //add vault
          totalRewardsIncVaultsUsd = totalRewardsUsd + KymatoRewardsUsd + scopolaRewardsUsd;
          totalRewardsIncVaultsUsd2 = totalRewardsUsd2 + snakeRewardsUsd + teddyRewardsUsd  + eHexRewardsUsd ;


          setTotalRewardsBothMasterUsd(totalRewardsBothMasterUsd.toFixed(2));
          
          
          
          setTotalRewards(totalRewards.toFixed(2));
          setTotalRewardsUsd(totalRewardsUsd.toFixed(2));

          setVaultRewardsUsd(vaultRewardsUsd.toFixed(2));
          setTotalRewardsIncVaults(totalRewardsIncVaults.toFixed(6));
          setTotalRewardsIncVaultsUsd(totalRewardsIncVaultsUsd.toFixed(2));
          setTvl(tvl.toFixed(2));
          setInflation(inflation);
          
          setUserTotalStaked(userTotalStaked);
          setDailyEarnings(sumEarnings);
          ///////v2
          setTotalRewards2(totalRewards2.toFixed(2));
          setTotalRewardsUsd2(totalRewardsUsd2.toFixed(2));

           
          setTotalRewardsIncVaults2(totalRewardsIncVaults2.toFixed(6));
          setTotalRewardsIncVaultsUsd2(totalRewardsIncVaultsUsd2.toFixed(2));
          setTvl2(tvl2.toFixed(2));

          setInflation2(inflation2);
          setAverageApr2(averageApr2);
          setUserTotalStaked2(userTotalStaked2);
          setDailyEarnings2(sumEarnings2);

          setKymatoPrice(kymatoPrice);
          setScopolaPrice(scopolaPrice);
          
           //Add Vault
          
          setKymatoBurn(kymatoBurn);
          setKymatoMarketCap(kymatoMarketCap);
          setKymatoTotalSupply(kymatoTotalSupply);

          setSnakeBurn(snakeBurn);
          setSnakeMarketCap(snakeMarketCap);
          setSnakeTotalSupply(snakeTotalSupply);

          

  
        }
      }
      wait();
    }
    getData();
    
    
  }, [address, allPools, isConnected]);

 

  return (
    
    <Box minHeight="100vh">
      <Box
        height={[120, 130, 150, 200]}
        bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.3))"
        bgRepeat="no-repeat"
        bgPosition="center"
        width="100%"
      >
        <Box
          height={[120, 130, 150, 200]}
          bgImage={hyo}
          bgRepeat="no-repeat"
          bgPosition="center"
          backgroundSize={[
            "80%", // Default size for small screens
            "70%", // Adjust as needed for medium screens
            "58%", // Adjust as needed for large screens
            "45%", // Adjust as needed for extra-large screens
          ]}
          padding={[5, null, null, 10]}
        ></Box>
      </Box>
      
        
      {isDataLoading ? (<Center>
  <VStack spacing={4}>
  <Center>
  <Box
    bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))"
    padding={2}
    rounded="3xl"
    color="gray.300"
    width={[220, 400, 700, 900]}
    fontSize={[12, 18, 20, 20]}
    mt='20px'
    textAlign="center" // Center-align the text horizontally
    alignItems="center" // Center-align the text vertically
  >
    <Text textColor="gray.300">
      Interface is now loading Initial Data from Pulsechain RPC
    </Text>
    <Text textColor="gray.300">
      Allow time for Initial Load
    </Text>
  </Box>
</Center>
    
    <Spinner
      thickness="6px"
      speed="0.95s"
      emptyColor="gray.200"
      color="blue.500"
      size="xl"
    />
  </VStack>
</Center>
      ) : ( <>
      {isConnected ? (
        <Box
          bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))"
          padding={2}
          mt="20px"
          ml="auto"
          mr="auto"
          rounded="3xl"
          color="gray.300"
          width={[220, 400, 700, 900]}
          fontSize={[12, 18, 20, 20]}
        >
          <Center>
            <Flex ml="auto" mr="auto">
              <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" padding={2} rounded="2xl" label="Copy Address">
                <IconButton
                  variant="unstyled"
                  ml={-3}
                  color="gray.300"
                  icon={hasCopied ? <CheckIcon /> : <CopyIcon />}
                  onClick={onCopy}
                  mb={3}
                ></IconButton>
              </Tooltip>
              <Button
                rounded="3xl"
                mt="auto"
                mb={1}
                onClick={() => open()}
                paddingBottom={2}
                paddingTop={2}
                fontSize={[null, 15, 20, 20]}
                bgGradient="linear(to-bl, blue.700, green.600)"
                fontWeight="bold"
                color="black"
                _hover={{
                  outlineColor: "green.100",
                  bgGradient: "linear(to-bl, blue.500, green.400)",
                }}
              >
                {isConnected
                  ? `${address.substring(0, 5)}...${address.substring(
                      address.length - 5
                    )}`
                  : "Connect Wallet"}
              </Button>
              <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" padding={2} rounded="2xl" label="View on PulseScan">
                <Link
                  href={`https://scan.pulsechain.com/address/${address}`}
                  isExternal
                >
                  <Image
                    src={pulseChain}
                    alt="dex"
                    rounded="2xl"
                    boxSize={[6, 7, 8, 9]}
                    mt={1}
                  ></Image>
                </Link>
              </Tooltip>
            </Flex>
          </Center>
          
          
  <Center textColor='Highlight'>
    You have {totalRewardsIncVaults} HYSC to claim (${totalRewardsIncVaultsUsd})
  </Center>
  <Center textColor='Highlight'>
    You have {totalRewardsIncVaults2} ⚕ to claim (${totalRewardsIncVaultsUsd2})
  </Center>

          <HStack fontWeight="bold" mb={1}>
            <Flex fontFamily="heading" ml={2} mr="auto">
              Your Total Value Staked:
            </Flex>
            <Flex fontFamily="heading" mr={2} ml={"auto"}>
              ${parseFloat(userTotalStaked + userTotalStaked2).toFixed(2)}
            </Flex>
          </HStack>
          <HStack mb={1}>
            <Flex
              fontFamily="heading"
              ml={2}
              mr="auto"
              fontWeight="bold"
            >
              Daily Avg APR:
            </Flex>
            <Flex
              fontFamily="heading"
              mr={2}
              ml={"auto"}
              fontWeight="bold"
            >
           
              {parseFloat((averageApr * userTotalStaked + averageApr2 * userTotalStaked2)/(userTotalStaked + userTotalStaked2)).toFixed(2)}% 
                 </Flex> 
          </HStack>
          <HStack fontWeight="bold" mb={1}>
            <Flex fontFamily="heading" ml={2} mr="auto">
              Daily:
            </Flex>
            <Flex fontFamily="heading" mr={2} ml={"auto"}>
              ${parseFloat(dailyEarnings + dailyEarnings2).toFixed(2)}
            </Flex>
          </HStack>
          
          <HStack>
            <Flex ml="auto" mr="auto">
           
            <Tooltip bg="linear-gradient(to bottom, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))" padding={2} rounded="2xl" label="Deposits zero to available pools with pending rewards. ">                
              
              <Button
                rounded="3xl"
                mt="auto"
                mb={1}
                onClick={claimAll}
                isLoading={isLoading}
                width={[200, 300, 550, 550]}
                height={[10, 35, 45, 50]}
                paddingBottom={2}
                paddingTop={2}
                fontSize={[12, 15, 20, 20]}
                bgGradient="linear(to-bl, blue.700, green.600)"
                fontWeight="bold"
                color="black"
                _hover={{
                  outlineColor: "green.100",
                  bgGradient: "linear(to-bl, blue.500, green.400)", // Lighter shade on hover
                }}
              >
                Claim All Available Rewards
              </Button></Tooltip>
            </Flex>
          </HStack>
        </Box>
      ) : (
        <Box
          padding={2}
          ml="auto"
          mr="auto"
          rounded="3xl"
          bgColor="gray.900"
          color="gray.300"
          width={[220, 350, 400, 450]}
          fontSize={[null, 18, 20, 20]}
          h={[200, 200, 200, 250]}
        >
          <Center h={[200, 200, 200, 250]}>
            <Flex>
              <Button
              _hover={{
                outlineColor: "green.100",
                bgGradient: "linear(to-bl, blue.500, green.400)", // Lighter shade on hover
              }}
                rounded="3xl"
                width={[150, 150, 175, 200]}
                height={50}
                fontSize={15}
                paddingTop={2}
                paddingBottom={2}
                bgColor="gray.500"
                color="gray.200"
                onClick={() => open()}
              >
                {isConnected
                  ? address.substring(0, 5) +
                    "..." +
                    address.substring(address.length - 5)
                  : "Connect Wallet"}
              </Button>
            </Flex>
          </Center>
        </Box>
      )}
      <Flex>
        <SimpleGrid
          columns={[1, null, null, 2]}
          spacing={[4, 8, 15, 20]}
          ml="auto"
          mr="auto"
          mt={[45, 50, 70, 75]}
        >
          <Box
          ml="auto"
          mr="auto"
            bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))"
            rounded="3xl"
            padding={3}
            width={[220, 350, 400, 450]}
            fontSize={[12, 18, 20, 20]}
            color="gray.100"
          >
            <HStack>
            <Link href='https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=ETH&outputCurrency=0x73D159B3C18447Da0D332e147C00F8802A5d9263' isExternal>
            <Image src={hyoscyamine} rounded='2xl' alt='hyoscyamine' boxSize={[5,6,8,10]} ></Image></Link>
              <Text
                mb={3}
                fontWeight="semibold"
                fontSize={[null, 20, 25, 25]}
                ml={2}
              >
                Hyoscyamine
              </Text>
              <HStack ml="auto" mr={2}>
                <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" label="View on PulseScan">
                  <Link
                    href="https://scan.mypinata.cloud/ipfs/bafybeignzhc77l2eszm4jvjvvnx2t2hy7lxdo4prnpnovzqqntsg47kmmy/#/token/0x73D159B3C18447Da0D332e147C00F8802A5d9263"
                    isExternal
                  >
                    <Image
                      src={pulseChain}
                      alt="dex"
                      rounded="2xl"
                      boxSize={[6, 7, 8, 9]}
                      mb={3}
                    ></Image>
                  </Link>
                </Tooltip>
                <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" label="Dexscreener">
                  <Link
                    href="https://dexscreener.com/pulsechain/0xeb8aa442df89c1c12661b95cba62829eca3dde33"
                    isExternal
                  >
                    <Image
                      src={dexscreener}
                      alt="dex"
                      rounded="2xl"
                      boxSize={[5, 5, 6, 7]}
                      mb={3}
                    ></Image>
                  </Link>
                </Tooltip>
              </HStack>
            </HStack>

            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Price:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                ${parseFloat(nativeTokenPrice).toFixed(4)}
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Market Cap:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                ${marketCap}
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Total Supply:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                {totalSupply}
              </Flex>
            </HStack>
            <HStack mb={1}>
            
            <Flex fontFamily="heading" ml={2} mr="auto">
    Daily Inflation:
  </Flex>
  <Flex ml="auto" mr={2} fontWeight="semibold">
    {Math.abs(parseFloat(inflation)).toFixed(6)}
  </Flex>
</HStack>

            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Burnt:
                </Flex>
                                <Flex ml='auto' mr={2} fontWeight='semibold'>
                                    {parseInt(burned)} HYSC
                                </Flex>
                                 <Flex
              justify="right"
              mr={1}
              mt={-1}
              fontSize="smaller"
              fontWeight="light"
            >
              (${parseFloat(burned * nativeTokenPrice).toFixed(2)}USD)
            </Flex>
                            </HStack>
            
          </Box>
         
          <Box
          ml="auto"
          mr="auto"
            bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))"            rounded="3xl"
            padding={3}
            width={[220, 350, 400, 450]}
            fontSize={[12, 18, 20, 20]}
            color="gray.100"
          >
            <HStack>
            <Link href='https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=ETH&outputCurrency=0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF' isExternal>
            <Image src={kymato} rounded='2xl' alt='Kymato' boxSize={[5,6,8,10]} ></Image></Link>
              <Text
                mb={3}
                fontWeight="semibold"
                fontSize={[null, 20, 25, 25]}
                ml={2}
              >
                Kymato
              </Text>
              <HStack ml="auto" mr={2}>
                <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" label="View on PulseScan">
                  <Link
                    href="https://scan.mypinata.cloud/ipfs/bafybeignzhc77l2eszm4jvjvvnx2t2hy7lxdo4prnpnovzqqntsg47kmmy/#/token/0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF"
                    isExternal
                  >
                    <Image
                      src={pulseChain}
                      alt="dex"
                      rounded="2xl"
                      boxSize={[6, 7, 8, 9]}
                      mb={3}
                    ></Image>
                  </Link>
                </Tooltip>
                <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" label="Dexscreener">
                  <Link
                    href="https://dexscreener.com/pulsechain/0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF"
                    isExternal
                  >
                    <Image
                      src={dexscreener}
                      alt="dex"
                      rounded="2xl"
                      boxSize={[5, 5, 6, 7]}
                      mb={3}
                    ></Image>
                  </Link>
                </Tooltip>
              </HStack>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Price:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                ${parseFloat(kymatoPrice).toFixed(4)}
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Market Cap:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                ${parseInt(kymatoMarketCap)}
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Total Supply:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                {parseInt(kymatoTotalSupply)}
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontSize='smaller' textColor='Highlight' fontFamily="heading" ml={2} mr="auto"><Link href="https://dai.kymato.xyz"
                    isExternal>
               Stake pDAI to earn Kymato</Link>
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Burnt:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                {parseInt(kymatoBurn)} Kymato
              </Flex><Flex
              justify="right"
              mr={1}
              mt={-1}
              fontSize="smaller"
              fontWeight="light"
            >
              (${parseFloat(kymatoBurn * kymatoPrice).toFixed(2)}USD)
            </Flex>
            </HStack>
            
          </Box>
          <Box
          ml="auto"
          mr="auto"
            bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))"
            rounded="3xl"
            padding={3}
            width={[220, 350, 400, 450]}
            fontSize={[12, 18, 20, 20]}
            color="gray.100"
          >
            <HStack>
            <Link href='https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=ETH&outputCurrency=0x619e541d38572ee6E12D340566Da78e63D422e0f' isExternal>
            <Image src={caduceus} rounded='2xl' alt='Caduceus' boxSize={[5,6,8,10]} ></Image></Link>
              <Text
                mb={3}
                fontWeight="semibold"
                fontSize={[null, 20, 25, 25]}
                ml={2}
              >
                Caduceus
              </Text>
              <HStack ml="auto" mr={2}>
                <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" label="View on PulseScan">
                  <Link
                    href="https://scan.mypinata.cloud/ipfs/bafybeignzhc77l2eszm4jvjvvnx2t2hy7lxdo4prnpnovzqqntsg47kmmy/#/token/0x619e541d38572ee6E12D340566Da78e63D422e0f"
                    isExternal
                  >
                    <Image
                      src={pulseChain}
                      alt="dex"
                      rounded="2xl"
                      boxSize={[6, 7, 8, 9]}
                      mb={3}
                    ></Image>
                  </Link>
                </Tooltip>
                <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" label="Dexscreener">
                  <Link
                    href="https://dexscreener.com/pulsechain/0x3a840dbd4794e180daddc9a0cb0fc48a5c55e2ec"
                    isExternal
                  >
                    <Image
                      src={dexscreener}
                      alt="dex"
                      rounded="2xl"
                      boxSize={[5, 5, 6, 7]}
                      mb={3}
                    ></Image>
                  </Link>
                </Tooltip>
              </HStack>
            </HStack>

            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Price:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                ${nativeTokenPrice2}
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Market Cap:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                ${marketCap2}
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Total Supply:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                {totalSupply2}
              </Flex>
            </HStack>
            <HStack mb={1}>
            
            <Flex fontFamily="heading" ml={2} mr="auto">
    Daily Inflation:
  </Flex>
  <Flex ml="auto" mr={2} fontWeight="semibold">
    {Math.abs(parseFloat(inflation2)).toFixed(0)}
  </Flex>
</HStack>

            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Burnt:
                </Flex>
                                <Flex ml='auto' mr={2} fontWeight='semibold'>
                                    {parseInt(burned2)} ⚕
                                </Flex>
                                 <Flex
              justify="right"
              mr={1}
              mt={-1}
              fontSize="smaller"
              fontWeight="light"
            >
              (${parseFloat(burned2 * nativeTokenPrice2).toFixed(2)}USD)
            </Flex>
                            </HStack>
            
          </Box>
          <Box
          ml="auto"
          mr="auto"
            bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))"            rounded="3xl"
            padding={3}
            width={[220, 350, 400, 450]}
            fontSize={[12, 18, 20, 20]}
            color="gray.100"
          >
            <HStack>
            <Link href='https://app.piteas.io/#/swap?exactField=input&exactAmount=0&inputCurrency=ETH&outputCurrency=0xb724eA7a4F5eA808972E39f1c9dfB1a1871c4f70' isExternal>
            <Image src={snake} rounded='2xl' alt='InnoⓍia' boxSize={[5,6,8,10]} ></Image></Link>
              <Text
                mb={3}
                fontWeight="semibold"
                fontSize={[null, 20, 25, 25]}
                ml={2}
              >
                InnoⓍia
              </Text>
              <HStack ml="auto" mr={2}>
                <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" label="View on PulseScan">
                  <Link
                    href="https://scan.mypinata.cloud/ipfs/bafybeignzhc77l2eszm4jvjvvnx2t2hy7lxdo4prnpnovzqqntsg47kmmy/#/token/0xb724eA7a4F5eA808972E39f1c9dfB1a1871c4f70"
                    isExternal
                  >
                    <Image
                      src={pulseChain}
                      alt="dex"
                      rounded="2xl"
                      boxSize={[6, 7, 8, 9]}
                      mb={3}
                    ></Image>
                  </Link>
                </Tooltip>
                <Tooltip bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" label="Dexscreener">
                  <Link
                    href="https://dexscreener.com/pulsechain/0x4a8b4e737736e0d2197baf1a781125d804194ad4"
                    isExternal
                  >
                    <Image
                      src={dexscreener}
                      alt="dex"
                      rounded="2xl"
                      boxSize={[5, 5, 6, 7]}
                      mb={3}
                    ></Image>
                  </Link>
                </Tooltip>
              </HStack>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Price:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                ${parseFloat(snakePrice).toFixed(4)}
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Market Cap:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                ${parseInt(snakeMarketCap)}
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Total Supply:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                {parseInt(snakeTotalSupply)}
              </Flex>
            </HStack>
            <HStack mb={1}>
              
              <Flex ml="auto" mr={2} fontWeight="semibold">
                
              </Flex>
            </HStack>
            <HStack mb={1}>
              <Flex fontFamily="heading" ml={2} mr="auto">
                Burnt:
              </Flex>
              <Flex ml="auto" mr={2} fontWeight="semibold">
                {parseInt(snakeBurn)} InnoⓍia
              </Flex><Flex
              justify="right"
              mr={1}
              mt={-1}
              fontSize="smaller"
              fontWeight="light"
            >
              (${parseFloat(snakeBurn * snakePrice).toFixed(2)}USD)
            </Flex>
            </HStack>
            
          </Box>

          
        </SimpleGrid>
      </Flex>
      <Center mt="10"><Flex>
      <Box
            bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))"
            fontFamily="heading"
            ml="auto"
            mr="auto"
            rounded="3xl"
            padding={2}
            width={[300, 350, 400, 450]}
            color="gray.100"
          >
            <Center height={100}>
              <VStack fontSize={[null, 15, 20, 25]} fontWeight="semibold">
                <Flex fontFamily="heading" ml="auto" mr="auto">
                  TVL:
                </Flex>
                <Flex ml="auto" mr="auto">
                  ${(parseFloat(tvl) + parseFloat(tvl2)).toFixed(2)}
                </Flex>
              </VStack>
            </Center>
          </Box>
          
          
          </Flex>
          </Center></>
         )} 
        
    </Box>
  );
}

export default Home;
