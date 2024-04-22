import React, { Suspense, lazy, useState, useEffect, createContext } from 'react';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { walletConnectProvider } from '@web3modal/wagmi';
import { WagmiConfig, createConfig, configureChains } from 'wagmi';
import {  pulsechain } from './utils/viem/chains';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import Profile from './Profile';

import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { fetchData } from './FetchData';
import datura from './assets/tenor-3493881893.gif';
import staticDaturaPath from './assets/static.jpg';
import { Box, Button } from '@chakra-ui/react';

const Home = lazy(() => import('./Home'));
const Farm = lazy(() => import('./Farms/Farm'));
const Caduceus = lazy(() => import('./Farms2/Farm'));
const CaduceusSSS = lazy(() => import('./Staking2/Staking'));
const Staking = lazy(() => import('./Staking/Staking'));
const Portfolio = lazy(() => import('./Portfolio'));
const VaultStaking = lazy(() => import('./VaultStaking/VaultStaking'));





export const InfoContext = createContext();



const projectId = import.meta.env.VITE_WALLET_CONNECT;

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [
    // Chain configurations
    {
      id: 369,
  network: 'pulsechain',
  name: 'PulseChain',
  nativeCurrency: { name: 'Pulse', symbol: 'PLS', decimals: 18 },
  testnet: false,
      rpcUrls: {
        default: {
          http: ['https://rpc.pulsechain.com'],
          webSocket: ['wss://rpc.pulsechain.com'],
        },
        public: {
          http: ['https://rpc.pulsechain.com'],
          webSocket: ['wss://rpc.pulsechain.com'],
        },
      },
    },
    // Add configurations for other chains as needed
  ],
    [alchemyProvider( {apiKey: import.meta.env.VITE_ALCHEMY}), publicProvider()],
    [walletConnectProvider({ projectId })],
)

const wagmiConfig = createConfig({
    autoConnect: true,
    connectors: [
        new WalletConnectConnector({ options: { projectId, showQrModal: false } }),
        new InjectedConnector({
            options: {
                shimDisconnect: true,
            },
        }),
    ],
    publicClient,
    webSocketPublicClient,
})

createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: pulsechain });

function App() {
  const [allPools, setAllPools] = useState();
 
  const [counter, setCounter] = useState(0);

  const [isGifPlaying, setIsGifPlaying] = useState(true);

  const toggleGifPlaying = () => {
    setIsGifPlaying((prevState) => !prevState);
  };

  
    
  

  useEffect(() => {
    async function getData() {
      const allPools = await fetchData()
      // setTimeout(() => { setAllPools(allPools) }, 5000);
      setAllPools(allPools);
     
    }
    function timeInterval() {
      setTimeout(()=> {setCounter(counter+1)}, 2500);
    }
    getData();
    timeInterval();
  },[counter])

  return (
    <Box
   
      bgImg={isGifPlaying ? datura : staticDaturaPath} // assuming you have staticImage defined
      bgPosition="center"
      bgSize={isGifPlaying ? 'cover' : 'cover'}
      bgRepeat="no-repeat"
      paddingBottom={30}
      > 
       
  <Button 
    fontWeight='bold'
    position="absolute"
    top="100px"
    left="15px" 
    _hover={{
      outlineColor: "green.100",
      bgGradient: "linear(to-bl, blue.500, green.400)",
      color: "black",
    }} 
    bgGradient='linear(to-bl, blue.700, green.600)'
    >
    IPFS v2.14
  </Button>


      <Button 
      fontWeight='bold'
      position="absolute"
        top="150px"
        left="15px" 
        _hover={{
          outlineColor: "green.100",
          bgGradient: "linear(to-bl, blue.500, green.400)",
          color: "black",
        }} bgGradient='linear(to-bl, blue.700, green.600)'
        onClick={toggleGifPlaying}>
        ||
        </Button>  

       
  
    
    <WagmiConfig config={wagmiConfig}>
      <InfoContext.Provider value={allPools}>
      
     
      <Suspense fallback={<div>Loading...</div>}>
                    <BrowserRouter>
                    <Profile />
                        <Routes>
                            <Route path ='/' element={<Home />} />
                            <Route path ='/Farms' element={<Farm />} />
                            <Route path ='/Caduceus' element={<Caduceus />} />
                            <Route path ='/Staking' element={<Staking />} />
                            <Route path ='/CaduceusSSS' element={<CaduceusSSS />} />
                            <Route path ='/PulseChain' element={<Portfolio />} />
                            <Route path ='/Stake' element={<VaultStaking />} />
                        </Routes>
                    </BrowserRouter>
                </Suspense>
     
      </InfoContext.Provider>
    </WagmiConfig></Box>
  )
}

export default App
