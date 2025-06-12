'use client'

import { useEffect, useRef, useState } from 'react'
import { useParams } from 'next/navigation'
import VideoContainer from '../ui/VideoContainer'
import { Peer, useWebRtc } from '../../../../context/WebRtcProvider'
import Header from '../../../../components/ui/Header'
import HeaderTitle from '../../../../components/ui/HeaderTitle'
import { LogBottomSheetProvider, useLogBottomSheet } from '../../../../context/LogBottomSheetProvider'
import LogsWindow from './[socketId]/components/LogsWindow'

const Page = () => {
  const { roomId } = useParams()
  const { connected, peers, setData } = useWebRtc()

  const { data } = useLogBottomSheet()
  useEffect(() => {
    if (connected) return;
    if (roomId) {
      setData({ roomId: roomId as string, singleConsumerSocketId: null })
    }
  }, [roomId])


  return (
    <div className="relative">
      <Header>
        <HeaderTitle>Proctoring Mode Room {roomId}</HeaderTitle>
      </Header>
      {
        data.active && (
          <div className="absolute z-40 w-full bottom-0 border-t border-white/15 bg-black ">
            <LogsWindow canDrag={true} token={data.token}></LogsWindow>
          </div>
        )
      }
      <div className="min-h-[90vh] max-h-[90vh] overflow-y-scroll
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-track]:bg-gray-100
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-gray-300
          dark:[&::-webkit-scrollbar-track]:bg-black
          dark:[&::-webkit-scrollbar-thumb]:bg-gray-600      
      ">
        <div className="m-4 grid sm:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-4 ">
          {peers.length > 0 && peers.map((peer: Peer) => (
            <VideoContainer key={peer.token} peer={peer} />
          ))}
        </div>

      </div>
    </div>
  )
}

export default Page
