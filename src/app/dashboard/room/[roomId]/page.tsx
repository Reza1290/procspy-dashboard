'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import VideoContainer from '../ui/VideoContainer'
import { useWebRtc } from '../../../../context/WebRtcProvider'
import Header from '../../../../components/ui/Header'
import HeaderTitle from '../../../../components/ui/HeaderTitle'

const Page = () => {
  const params = useParams()
  const roomId = Array.isArray(params?.roomId) ? params.roomId[0] : params?.roomId
  const { peers, setData } = useWebRtc()
  
  useEffect(() => {
    if (roomId) {
      setData({ roomId, singleConsumerSocketId: null })
    }
  }, [roomId, setData, peers])

  return (
    <div>
      <Header>
        <HeaderTitle>
          Proctoring Mode Room {roomId}
        </HeaderTitle>
      </Header>
      <div className="my-4 grid sm:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4">
        {peers.map((consumer: any) => (
          <VideoContainer key={consumer.socketId} consumer={consumer} />
        ))}
      </div>
    </div>
  )
}

export default Page
