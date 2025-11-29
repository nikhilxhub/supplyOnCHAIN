
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Dashboard from './pages/Dashboard'
import { ThirdwebProvider } from 'thirdweb/react'
import { StateContextProvider } from './context/StateProvider'
function App() {


  return (
    <>

      <ThirdwebProvider>
        <StateContextProvider>
          

        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />

          </Routes>
        </BrowserRouter>
        </StateContextProvider>
      </ThirdwebProvider>
    </>
  )
}

export default App
