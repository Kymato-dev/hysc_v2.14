import { useWeb3Modal } from "@web3modal/wagmi/react";
import { useAccount } from "wagmi";
import { readContract, readContracts, fetchBalance } from 'wagmi/actions'
import { useEffect, useState } from "react";
import axios from "axios";
import { Accordion, AccordionButton, AccordionIcon, AccordionItem, AccordionPanel, Box, Button, Center, Flex, FormControl, HStack, IconButton, Image, Input, InputGroup, InputRightElement, Link, SimpleGrid, Text, Tooltip, VStack, useClipboard } from "@chakra-ui/react";
import { routerAbi, lpAbi, factoryAbi } from "./data";
import PortInfo from "./PortInfo";
import { RepeatIcon, CopyIcon, CheckIcon, CloseIcon, SearchIcon } from '@chakra-ui/icons'
import pulseChain from './assets/pulse.png'
import hyo from './assets/hyos.png'

function Portfolio () {

    const { open } = useWeb3Modal()
    const { address, isConnected } = useAccount();
    const [tokenList, setTokenList] = useState([]);
    const [valueTokenList, setValueTokenList] = useState([]);
    const [lowList, setLowList] = useState([]);
    const [totalPort, setTotalPort] = useState();
    const [lowListTvl, setLowListTvl] = useState();
    const [searchValue, setSearchValue] = useState();
    const [displaySearch, setDisplaySearch] = useState('')
    const [pulseInfo, setPulseInfo] = useState([]);
    const { onCopy: onCopyAddress, value, setValue, hasCopied } = useClipboard(address);
    const { onCopy: onCopySearch, value : searchedValue, setValue: setSearchedValue, hasCopied: hasCopiedSearched } = useClipboard(displaySearch);
    const { onCopy: onCopyContract, value: contractValue, setValue: setContractValue, hasCopied: hasCopiedContract } = useClipboard();
    const [isLoading, setIsLoading] = useState(true);
    const [searched, setSearched] = useState(false);


    const wPls = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27';
    let hasSearched = false;
    let searchedAddress = "";


        async function getTokens() {
            setIsLoading(true);
            let response = null;
            let response2 = null;
            let retries = 0;
            let maxRetries = 10;
            let success = false;
            let success2 = false;
            let totalPort = 0;
            let lowAssetsTvl = 0;
            let pulseBalanceRaw = 0;

            const finalList = [];
            const valueList = [];
            const lowList = [];
            const plsInfo = {};
            const plsInfoArr = [];

            while (retries <= maxRetries && !success) {
                try {
                    if(isConnected && !hasSearched) {
                    response = await axios.get(`https://api.scan.pulsechain.com/api/v2/addresses/${address}/token-balances`)
                    }
                    else if ((isConnected && hasSearched) || (!isConnected && hasSearched)) {
                    response = await axios.get(`https://api.scan.pulsechain.com/api/v2/addresses/${searchedAddress}/token-balances`) 
                    }
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

            if(isConnected && !hasSearched) {
                pulseBalanceRaw = await fetchBalance({
                    address: address,
                    })
                }
            else if ((isConnected && hasSearched) || (!isConnected && hasSearched)) {
                pulseBalanceRaw = await fetchBalance({
                    address: searchedAddress,
                    })
                }

            const pulseBalance = pulseBalanceRaw.value;
            const tokenList = response.data;
            

            const contractsData = await readContract({
                    //Getting wPLS / DAI reserves to calculate Pulse price
                        address: import.meta.env.VITE_PULSE_LP,
                        abi: lpAbi,
                        functionName: 'getReserves',
            });
            
            const pulsePrice = parseInt(contractsData[1].toString())/parseInt(contractsData[0].toString())

            plsInfo.contractAddress = null;
            plsInfo.name = "Pulse";
            plsInfo.symbol = "PLS";
            plsInfo.value = pulseBalance;
            plsInfo.priceInUsd = pulsePrice;
            plsInfo.balanceValueUsd = parseInt(pulseBalance)/10**18 * pulsePrice; 
            plsInfo.decimals = 18;

            plsInfoArr.push(plsInfo);

            for(let i=0; i<tokenList.length; i++) {
                if(tokenList[i].token.type == "ERC-20") {
                    tokenList[i].name = tokenList[i].token.name
                    tokenList[i].symbol = tokenList[i].token.symbol
                    tokenList[i].decimals = tokenList[i].token.decimals
                    tokenList[i].contractAddress = tokenList[i].token.address;
                    // const token = await fetchToken({ address: tokenList[i].contractAddress });
                    // console.log(token);
                //    if (tokenList[i].contractAddress = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27') { //wPLS
                        
                //         tokenList[i].priceInUsd = 1 * pulsePrice
                //         tokenList[i].balanceValueUsd = parseInt(tokenList[i].balance.toString())/(10**tokenList[i].decimals) * pulsePrice
                //         totalPort += tokenList[i].balanceValueUsd;
                //     }
                
                    const findPairs = await readContracts({
                        contracts: [
                            {
                                address: '0x29eA7545DEf87022BAdc76323F373EA1e707C523', //Pulsex facotry V2
                                abi: factoryAbi,
                                functionName: 'getPair',
                                args: [tokenList[i].token.address, wPls],
                            },
                            {
                                address: '0x1715a3E4A142d8b698131108995174F37aEBA10D', //Pulsex facotry V1
                                abi: factoryAbi,
                                functionName: 'getPair',
                                args: [tokenList[i].token.address, wPls],
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
                    
                    priceInUsd = (priceInPulse * pulsePrice) / 10**(18-tokenList[i].token.decimals) ;
                    tokenList[i].priceInPulse = priceInPulse;
                    tokenList[i].priceInUsd = priceInUsd;
                    tokenList[i].balanceValueUsd = parseInt(tokenList[i].value)/(10**tokenList[i].token.decimals) * priceInUsd
                    totalPort += tokenList[i].balanceValueUsd;
                }
                if(tokenList[i].balanceValueUsd && tokenList[i].balanceValueUsd != 0) {
                    finalList.push(tokenList[i]);
                    if(tokenList[i].balanceValueUsd > 20) {
                        valueList.push(tokenList[i]);
                    }
                    else { lowList.push(tokenList[i])}
                }
                // if (tokenList[i].contractAddress = '0xA1077a294dDE1B09bB078844df40758a5D0f9a27') { //wPLS
                //     if(tokenList[i].balanceValueUsd > 20) {
                //         valueList.push(tokenList[i]);
                //     }
                //     else { lowList.push(tokenList[i])}
                // }
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
        setPulseInfo(plsInfoArr);
        setTokenList(finalList)
        setValueTokenList(valueList)
        setLowList(lowList)
        setTotalPort(totalPort)
        setLowListTvl(lowAssetsTvl)
        setIsLoading(false);

        // return finalList;


        }

        useEffect(() => {

            getTokens();
        
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [isConnected])

        const handleChange = (e) => {
            e.preventDefault();
            setSearchValue((e.target.value));
            if(e.target.value == '' && isConnected) {
                setSearchValue(address);
            }
        }
        const handleSubmit = (e) => {
            e.preventDefault()
            setDisplaySearch((searchValue));
            if(searchValue == '') {
                hasSearched=false
                setSearched(hasSearched);
            }  
            hasSearched = true;
            searchedAddress = (searchValue);
            setSearched(hasSearched);
            getTokens();
        }
        function clearSearch() {
            hasSearched = false;
            searchedAddress = "";
            setSearched(hasSearched);
            setSearchValue(searchedAddress);
            if(isConnected) { getTokens() }
        }

        return(
            <Box minHeight='100vh'>
            
          
            <Box
      height={[120, 130, 150, 200]}
      bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.3))"
      bgRepeat='no-repeat'
      bgPosition='center'
      width='100%'
      >              
      <Box
    height={[120, 130, 150, 200]}
    bgImage={hyo}
    bgRepeat='no-repeat'
    bgPosition='center'
    backgroundSize={[
        "100%", // Default size for small screens
        "70%",  // Adjust as needed for medium screens
        "58%",  // Adjust as needed for large screens
        "45%",  // Adjust as needed for extra-large screens
      ]}
    
    padding={[5, null, null, 10]}
  >
    </Box>                    
            </Box>  
                        


                    <Center>
                        
            <Text p='5px' pl='15px' pr='15px' rounded='3xl'  bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" fontFamily='heading' fontWeight='bold' fontSize={[10, 12, 16, 20, 25]} color='white' ml='auto' mr='auto' mt='10px' align='center'>
            Pulsechain Wallet Checker
                        </Text> </Center>
                        <Center>
                        
            <Text p='5px' pl='15px' pr='15px' rounded='3xl' bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" fontFamily='heading' fontWeight='bold' fontSize={[5, 6, 8, 10, 15]} color='white' ml='auto' mr='auto' mt='10px' align='center'>
            PRC20s in connected wallet
                        </Text> </Center>                     
                                     
            
                {(tokenList && isConnected) || (tokenList && searched) ? 
            <Box>
            <Center>
                <Box bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" rounded='3xl' fontFamily='heading' width={[300, 500, 750, 1000]} mt={10}>
                <Flex paddingTop='6px' align="center" justify="center">
                <form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Input value={searchValue} mb={5} onChange={handleChange} onKeyDown={e=> {if(e.key==='Enter'){handleSubmit}}} onSubmit={handleSubmit} ml='auto' mr='auto' type='text' textColor='gray.300' focusBorderColor='blue.500' placeholder="Search Address" _placeholder={{ color: 'gray.300' }} width={300} ></Input>
                        <InputRightElement>
                            <IconButton color={'green.600'} onClick={clearSearch} variant='unstyled' icon={<CloseIcon></CloseIcon>}></IconButton>
                        </InputRightElement>
                    </InputGroup>
                </form>
                </Flex>
                    {/* <Flex width={300}>
                        <InputGroup>
                            <Input value={searchValue} mb={5} onChange={handleChange} onKeyDown={e=> {if(e.key==='Enter'){handleSubmit}}} onSubmit={handleSubmit} type='text' textColor='gray.300' focusBorderColor='blue.500' placeholder="Search Address" _placeholder={{ color: 'gray.300' }} width={300} ></Input>
                            <InputRightElement>
                                <IconButton color={'gray.300'} onClick={handleSubmit} variant='unstyled' icon={<SearchIcon></SearchIcon>}></IconButton>
                            </InputRightElement>
                        </InputGroup>   
                        <IconButton color={'blue.500'} onClick={clearSearch} variant='unstyled' icon={<CloseIcon></CloseIcon>}></IconButton>
                    </Flex>  */}
                        <Box color={'gray.300'} bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" mb={5}>
                            <HStack>
                                <Box ml={[0,1,2,3]}>
                                <Text fontSize={[17, 17, 18, 20]}>
                                    {searched ? (displaySearch.substring(0,5) + '...' + displaySearch.substring(displaySearch.length - 5)) : address.substring(0,5) + '...' + address.substring(address.length - 5)}
                                </Text>
                                <HStack mt={-2}>
                                    <Tooltip  label="Copy Address">
                                            <IconButton variant='unstyled' mr={-3} color='gray.300' icon={hasCopied || hasCopiedSearched ? <CheckIcon /> : <CopyIcon />} 
                                                        onClick={searched ? onCopySearch : onCopyAddress}></IconButton>
                                    </Tooltip>
                                    <Tooltip label="View on PulseScan">
                                        <Link href={`https://scan.pulsechain.com/address/${address}`} isExternal>
                                            <Image src={pulseChain} alt='dex' mb={-1} boxSize={[6,6,6,7]}></Image>
                                        </Link>
                                    </Tooltip>
                                </HStack>
                                </Box>
                                <Flex ml='auto' mr={5}>
                                    <HStack spacing={0} justifyContent='right' mr={[0, null, null, 5]}>
                                        <Flex>
                                            <IconButton isLoading={isLoading} icon={<RepeatIcon/>} variant='ghost' size='sm' onClick={getTokens} color='gray.300'>CLick to refresh</IconButton>
                                        </Flex>
                                        <Flex>
                                            <Text fontSize={[25, 30, 35, 40]}>
                                                ${parseFloat(totalPort).toFixed(2)}
                                            </Text>
                                        </Flex>
                                    </HStack>
                                </Flex>
                            </HStack>
                        </Box>
                        <Flex>
                            <HStack fontSize={[15,16,17,18]} width={[300, 500, 750, 1000]} ml='auto' mr='auto' spacing={0} paddingBottom={2} color='gray.300' bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))">
                                <Box width={[20, 200, 300, 400]}>
                                    <Text ml={[2,3,4,5]} mt={5} align={'left'}>
                                        Assets
                                    </Text>
                                </Box>
                                <Box width={[16, 100, 150, 200]}>
                                    <Text mt={5} align={['center', 'left']}>
                                        Amount
                                    </Text>
                                </Box>
                                <Box width={[16, 100, 150, 200]}>
                                    <Text mt={5} align={['center', 'left']}>
                                        Price
                                    </Text>
                                </Box>
                                <Box width={[20, 100, 150, 200]}>
                                    <Text mt={5} mr={[2,3,4,5]} align={['right', 'left']}>
                                        Value
                                    </Text>
                                </Box>

                            </HStack>
                        </Flex>
                        <Center borderBottom='2px' borderColor='blue.500' ml='auto' mr='auto' width={[300, 500, 750, 1000]}></Center>
                        <Flex fontSize={[11,13,15,18]} spacing={1} ml='auto' mr='auto' color='gray.300' bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))">
                        {pulseInfo.map((item) => {
                                    return(
                                        <PortInfo key={item.balance} {...item}/>    
                                    )
                                })}
                        </Flex>
                        <Flex>
                            <VStack fontSize={[11,13,15,18]} spacing={1} ml='auto' mr='auto' color='gray.300' bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" >
                                {valueTokenList.map((item) => {
                                    return(
                                        <PortInfo key={item.contractAddress} {...item}/>    
                                    )
                                })}
                            </VStack>
                        </Flex>
                </Box>
            </Center>
            <Box fontFamily={'heading'}>
                <Center>
                    <Accordion mt={5} color={'gray.300'} bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" width={[300, 500, 750, 1000]} defaultIndex={[]} allowMultiple>
                        <AccordionItem border='none'>
                            <AccordionButton>
                                <Box as="span" flex={1} textAlign={'left'} fontSize={[15, 16, 17,18]}>
                                    {`Assets < $20 - $${parseFloat(lowListTvl).toFixed(2)}`} 
                                </Box>  
                                <AccordionIcon></AccordionIcon>  
                            </AccordionButton>
                            <AccordionPanel>
                                <VStack fontSize={[11,13,15,18]} spacing={1} ml='auto' mr='auto' color='gray.300' bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" >
                                    {lowList.map((item) => {
                                        return(
                                            <PortInfo key={item.contractAddress} {...item}/>       
                                        )
                                    })}
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>
                    </Accordion>
                </Center>
            </Box>
        </Box>

        : <Box mt={20} color='gray.300'>                        
            <Flex ml='auto' mr='auto'>
                <Button _hover={{
                  outlineColor: "green.100",
                  bgGradient: "linear(to-bl, blue.500, green.400)",
                  color: "black",
                }} ml='auto' mr='auto' mb={5} width={[150, 150, 175, 200]} height={50} fontSize={15} paddingTop={2} paddingBottom={2} bgImage="linear-gradient(to bottom, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5))" color='gray.200' onClick={() => open()}> 
                    {isConnected ? address.substring(0,5) + '...' + address.substring(address.length - 5) : "Connect Wallet" }
                </Button>
            </Flex>
            <Center>
            <Flex>
                <form onSubmit={handleSubmit}>
                    <InputGroup>
                        <Input value={searchValue} mb={5} onChange={handleChange} onKeyDown={e=> {if(e.key==='Enter'){handleSubmit}}} onSubmit={handleSubmit} ml='auto' mr='auto' type='text' textColor='gray.300' focusBorderColor='blue.500' placeholder="Search Address" _placeholder={{ color: 'gray.300' }} width={300} ></Input>
                        <InputRightElement>
                            <IconButton color={'blue.500'} onClick={clearSearch} variant='unstyled' icon={<CloseIcon></CloseIcon>}></IconButton>
                        </InputRightElement>
                    </InputGroup>
                </form>
                
            </Flex>
            </Center>
         </Box> }
    </Box>
        )

}

export default Portfolio;