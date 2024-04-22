import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { readContract, readContracts } from 'wagmi/actions'
import { useEffect, useState } from "react";
import axios from "axios";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Center, Flex, HStack, IconButton, Image, Input, Link, SimpleGrid, Text, Tooltip, VStack, useClipboard } from "@chakra-ui/react";
import { routerAbi, lpAbi, factoryAbi } from "./data";
import PortInfo from "./PortInfo";
import { RepeatIcon, CopyIcon, CheckIcon } from '@chakra-ui/icons'
import pulseChain from './assets/pulse.png'
import dexscreener from './assets/dexscreener.png'


export default function SearchWallet (searchedAddress) {

    const { open } = useWeb3Modal()
    const { address, isConnected } = useAccount();
    const [tokenList, setTokenList] = useState([]);
    const [valueTokenList, setValueTokenList] = useState([]);
    const [lowList, setLowList] = useState([]);
    const [totalPort, setTotalPort] = useState();
    const [lowListTvl, setLowListTvl] = useState();
    const [searchValue, setSearchValue] = useState();
    const { onCopy: onCopyAddress, value, setValue, hasCopied } = useClipboard(searchedAddress);
    const { onCopy: onCopyContract, value: contractValue, setValue: setContractValue, hasCopied: hasCopiedContract } = useClipboard();
    const [isLoading, setIsLoading] = useState(true);
    const [hasSearch, setHasSearched] = useState(false);

    const wPls = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27';


        async function getTokens() {
            setIsLoading(true);
            let response = null;
            let retries = 0;
            let maxRetries = 10;
            let success = false;
            let totalPort = 0;
            let lowAssetsTvl = 0;

            const finalList = [];
            const valueList = [];
            const lowList = [];

            while (retries <= maxRetries && !success) {
                try {
                    response = await axios.get(`https://scan.pulsechain.com/api?module=account&action=tokenlist&address=${searchedAddress}`)
                    success = true;
                    console.log("Axios success")
                    break;
                }
                catch (error) {
                    console.log(error)
                }
                retries++
            }
            if(retries >= maxRetries) console.log("Too many request.");

            const tokenList = response.data.result;
            // const token = await axios.get(`https://scan.pulsechain.com/api?module=token&action=getToken&contractaddress=${tokenList[0].contractAddress}`)
            // console.log(token);

            const contractsData = await readContract({
                    //Getting wPLS / DAI reserves to calculate Pulse price
                        address: import.meta.env.VITE_PULSE_LP,
                        abi: lpAbi,
                        functionName: 'getReserves',
            });
            
            const pulsePrice = parseInt(contractsData[1].toString())/parseInt(contractsData[0].toString())
            console.log("PULSE", pulsePrice);

            for(let i=0; i<tokenList.length; i++) {
                if(tokenList[i].type == "ERC-20") {
                    // const token = await fetchToken({ address: tokenList[i].contractAddress });
                    // console.log(token);
                    const findPairs = await readContracts({
                        contracts: [
                            {
                                address: '0x29eA7545DEf87022BAdc76323F373EA1e707C523', //Pulsex facotry V2
                                abi: factoryAbi,
                                functionName: 'getPair',
                                args: [tokenList[i].contractAddress, wPls],
                            },
                            {
                                address: '0x1715a3E4A142d8b698131108995174F37aEBA10D', //Pulsex facotry V1
                                abi: factoryAbi,
                                functionName: 'getPair',
                                args: [tokenList[i].contractAddress, wPls],
                            }
                        ]   
                    })
                    const getReserve = await readContracts({
                        contracts: [
                            {
                                address: findPairs[0].result, //Pair address
                                abi: lpAbi,
                                functionName: 'getReserves',
                            },
                            {
                                address: findPairs[0].result, //Pair address
                                abi: lpAbi,
                                functionName: 'token0',
                            },
                            {
                                address: findPairs[1].result, //Pair address V1
                                abi: lpAbi,
                                functionName: 'getReserves',
                            },
                            {
                                address: findPairs[1].result, //Pair address V1
                                abi: lpAbi,
                                functionName: 'token0',
                            }
                        ]   
                    })
                    // console.log("V2", getReserve[0])
                    // console.log("V1", getReserve[3].result == '0xA1077a294dDE1B09bB078844df40758a5D0f9a27')
                    let v1PlsReserve = 0;
                    let v2PlsReserve = 0;
                    let priceInPulse = 0;
                    let priceInUsd = 0;
                    let plsToken0 = false;

                    if(getReserve[3].result) { //pair exist?
                        if (getReserve[3].result == '0xA1077a294dDE1B09bB078844df40758a5D0f9a27') { //token0 is wPLS
                            v1PlsReserve = parseInt(getReserve[2].result[0].toString());
                            plsToken0 = true;
                        }
                        else {
                            // v1PlsReserve = getReserve[2].result[1]
                            v1PlsReserve = parseInt(getReserve[2].result[1].toString());
                        }
                    }
                    else {v1PlsReserve = 0}

                    if(getReserve[1].result) {
                        if (getReserve[1].result == '0xA1077a294dDE1B09bB078844df40758a5D0f9a27') { //token0 is wPLS
                            v2PlsReserve = parseInt(getReserve[0].result[0].toString());
                            plsToken0 = true;
                        }
                        else {
                            // v1PlsReserve = getReserve[2].result[1]
                            v2PlsReserve = parseInt(getReserve[0].result[1].toString());
                        }
                    }
                    else {v2PlsReserve = 0}

                    // console.log(getReserve[2].result[0])
                    // else {v1PlsReserve = getReserve[2].result[1]};

                    if(v1PlsReserve > v2PlsReserve && plsToken0) {
                        priceInPulse = parseInt(getReserve[2].result[0].toString()) / parseInt(getReserve[2].result[1].toString())
                    }
                    else if(v1PlsReserve > v2PlsReserve && !plsToken0) {
                        priceInPulse = parseInt(getReserve[2].result[1].toString()) / parseInt(getReserve[2].result[0].toString())
                    }
                    else if(v1PlsReserve < v2PlsReserve && plsToken0) {
                        priceInPulse = parseInt(getReserve[0].result[0].toString()) / parseInt(getReserve[0].result[1].toString())
                    }
                    else if(v1PlsReserve < v2PlsReserve && !plsToken0) {
                        priceInPulse = parseInt(getReserve[0].result[1].toString()) / parseInt(getReserve[0].result[0].toString())
                    }
                    
                    priceInUsd = (priceInPulse * pulsePrice) / 10**(18-tokenList[i].decimals) ;
                    // console.log(tokenList[i].contractAddress, priceInUsd);
                    tokenList[i].priceInPulse = priceInPulse;
                    tokenList[i].priceInUsd = priceInUsd;
                    tokenList[i].balanceValueUsd = parseInt(tokenList[i].balance.toString())/(10**tokenList[i].decimals) * priceInUsd
                    totalPort += tokenList[i].balanceValueUsd;
                }
                if(tokenList[i].balanceValueUsd && tokenList[i].balanceValueUsd != 0) {
                    finalList.push(tokenList[i]);
                    if(tokenList[i].balanceValueUsd > 20) {
                        valueList.push(tokenList[i]);
                    }
                    else { lowList.push(tokenList[i])}
                }
            }
            finalList.sort((a, b) => {
                return b.balanceValueUsd-a.balanceValueUsd;
            })
            valueList.sort((a, b) => {
                return b.balanceValueUsd-a.balanceValueUsd;
            })
            lowList.sort((a, b) => {
                return b.balanceValueUsd-a.balanceValueUsd;
            })
            for(let i=0; i<lowList.length; i++) {
                lowAssetsTvl += lowList[i].balanceValueUsd;
            }

        setTokenList(finalList)
        setValueTokenList(valueList)
        setLowList(lowList)
        setTotalPort(totalPort)
        setLowListTvl(lowAssetsTvl)
        setIsLoading(false);
        // return finalList;
        }
    }