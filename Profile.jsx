import { Button, Center, Flex, HStack, Image, Link, Menu, MenuButton, MenuItem, MenuList, Text } from "@chakra-ui/react";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import {  useAccount } from "wagmi";
import { Link as RouteLink } from "react-router-dom";
import { useEffect, useState } from "react";
import { useContext } from "react";
import { InfoContext } from "./App";
import hyoscyamine  from "./assets/FarmIcons/hyoscyamine.gif";
import kymato from './assets/FarmIcons/kymato.svg'

import {  HamburgerIcon } from "@chakra-ui/icons";


function Profile() {
    const allPools = useContext(InfoContext);

    const { open } = useWeb3Modal()
    const { address, isConnected } = useAccount()
    // const [allPools, setAllPools] = useState();
    const [kymatoPrice, setKymatoPrice] = useState(0);
    const [nativeTokenPrice, setNativeTokenPrice] = useState(0);
    useEffect(() => {
        function wait() {
            if (!allPools) {
              setTimeout(wait, 100)
            } else {
              setKymatoPrice((allPools.generalInfo[0].kymatoPrice).toFixed(4));
              setNativeTokenPrice(parseFloat(allPools.generalInfo[0].nativeTokenPriceUsd).toFixed(4));
            }
          }
          wait();
    },[address,allPools])

    
    return (
        <Flex  bgGradient='linear(to-b, blue.700, black)' color='gray.300' fontWeight='bold' fontSize={[11, 12, 16, 17]}>
           
            <HStack hideBelow='sm' ml={[5, null, null, 10]} spacing={[2, null, null, 9]} height={75} mr={2}>
                <Flex>
                    <RouteLink to='/' >
                       Home
                    </RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/Farms' >Farm</RouteLink>
                </Flex>
                
                <Flex>
                    <RouteLink to='/Staking' >Stake</RouteLink>
                </Flex>
                <Flex>
                    <RouteLink to='/PulseChain' >Wallet</RouteLink>
                </Flex>
                <Flex>
                                <Link href="https://kymato.printify.me/products" isExternal>Merch</Link>
                            </Flex>
                
            </HStack>
            <HStack hideBelow='sm' ml='auto' spacing={[1, 3, 4, 5]} height={45} mt={4} mr={[5, null, null, 10]} mb={2}>
                <Link href='https://pulsex.mypinata.cloud/ipfs/bafybeiesh56oijasgr7creubue6xt5anivxifrwd5a5argiz4orbed57qi/#/?inputCurrency=0x6B175474E89094C44Da98b954EedeAC495271d0F&outputCurrency=0xBaD066987eC4D4FCb9F01877Cd99F08C982aF7DF' isExternal>
            <Image src={kymato} rounded='2xl' alt='Kymato' boxSize={[3,4,5,6]} ></Image></Link>
            
            <Flex fontSize={[8, 11, 14, 17]}>
            <Link href='https://dexscreener.com/pulsechain/0x39dee9293009a6798dfaf9dbf100c55f13622cf7' isExternal>

                    <Text>${kymatoPrice}</Text></Link>
                </Flex>
                <Link href='https://pulsex.mypinata.cloud/ipfs/bafybeiesh56oijasgr7creubue6xt5anivxifrwd5a5argiz4orbed57qi/#/?inputCurrency=PLS&outputCurrency=0x73D159B3C18447Da0D332e147C00F8802A5d9263' isExternal>
            <Image src={hyoscyamine} rounded='2xl' alt='hyoscyamine' boxSize={[3,4,5,6]} ></Image></Link>
                <Flex fontSize={[8, 11, 14, 17]}>
                <Link href='https://dexscreener.com/pulsechain/0xeb8aa442df89c1c12661b95cba62829eca3dde33' isExternal> <Text>${nativeTokenPrice}</Text></Link>
                </Flex>
                <Flex fontSize={[8, 11, 14, 16]}>
                    
               
                
                <Button
  fontSize={[null, 11, 14, 17]}
  height={[null, 31, null, 42]}
  paddingTop={2}
  paddingBottom={2}
  bgGradient="linear(to-bl, blue.700, green.600)"
  color="gray.200"
  onClick={() => open()}
  _hover={{
    outlineColor: "green.100",
    bgGradient: "linear(to-bl, blue.500, green.400)",
    color: "black",
  }}
  // Adjust the width property according to your design
  width={['auto', 'auto', 'auto', '130px']}
>
  {isConnected ? `${address.substring(0, 5)}...${address.substring(address.length - 5)}` : "Connect Wallet"}
</Button>
 </Flex>
            </HStack>
            <Center>
            <HStack ml={2} mr='auto' display={{ base: "flex", sm: "none" }} spacing={[1, 3, 4, 5]}>
                <Menu>
                    {({ isOpen }) => (
                        <>
                        <MenuButton as={HamburgerIcon} boxSize={30} >
                            {isOpen ? 'Close' : 'Open'}
                        </MenuButton>
                        <MenuList bgColor='gray.900'  border='none' borderRadius='none'>
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/' >
                                    Home
                                </RouteLink>
                            </MenuItem >
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/Farms' >
                                    Farm
                                </RouteLink>
                            </MenuItem>
                            
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/Staking'>
                                    Stake
                                </RouteLink>
                            </MenuItem>
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <RouteLink to='/dePulse' >
                                    Wallet Checker
                                </RouteLink>
                            </MenuItem>
                            
                            <MenuItem bgColor='gray.900' fontSize={20} color='gray.300'>
                                <Link href="https://kymato.printify.me/products" isExternal>Merch</Link>
                            </MenuItem>
                        </MenuList>
                        </>
                    )}
                </Menu>
            </HStack>
            </Center>
            <HStack mr={2} ml='auto' display={{ base: "flex", sm: "none" }} spacing={3} mt={4} mb={4}>
            <Flex fontSize={[15]}>
                <Text>${parseFloat(nativeTokenPrice).toFixed(3)}</Text>
            </Flex>
            <Flex>
                <Button width={130} fontSize={15} paddingTop={2} paddingBottom={2} bgGradient="linear(to-bl, blue.700, green.600)" color='gray.200' _hover={{
                  outlineColor: "green.100",
                  bgGradient: "linear(to-bl, blue.500, green.400)",
                  color: "black",
                }} onClick={() => open()}> 
                    {isConnected ? address.substring(0,5) + '...' + address.substring(address.length - 5) : "Connect Wallet" }
                </Button>
                </Flex>
            </HStack>
        </Flex>
    )
}

export default Profile;