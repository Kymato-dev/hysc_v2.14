import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { Box, ChakraProvider } from '@chakra-ui/react'
import theme from './Theme/theme.jsx'
import datura from './assets/ezgif.com-optimize.gif'



ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
  
      <App />
      
    </ChakraProvider>
  </React.StrictMode>,
)
