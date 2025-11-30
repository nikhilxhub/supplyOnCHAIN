import { useStateContext } from '@/context/StateProvider'
import React from 'react'

const DashBoardAnalytics = () => {

  const { address } =  useStateContext();
  return (
    <div>DashBoardAnalytics</div>
  )
}

export default DashBoardAnalytics