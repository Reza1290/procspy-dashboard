// 'use client'

// import { useEffect, useState, useRef } from 'react';
// import io from 'socket.io-client';
// import * as mediasoupClient from 'mediasoup-client';
// import { usePathname, useRouter } from 'next/navigation';

// const VideoChat = () => {
//     const pathname = usePathname()
//     const router = useRouter();
//     const roomCode = pathname.split('/')[-1]
//     const socketRef = useRef(null);
//     const localVideoRef = useRef(null);
//     const remoteVideoContainerRef = useRef(null);
//     const deviceRef = useRef(null);
//     const [producerTransport, setProducerTransport] = useState(null);
//     const [consumerTransports, setConsumerTransports] = useState([]);
//     const [rtpCapabilities, setRtpCapabilities] = useState(null);
//     const [audioProducer, setAudioProducer] = useState(null);
//     const [videoProducer, setVideoProducer] = useState(null);
//     const consumingTransports = useRef([]);

//     useEffect(() => {
//         socketRef.current = io('https://192.168.2.7:3000/mediasoup');
//         socketRef.current.on('connection-success', ({ socketId }) => {
//             console.log(`Connected: ${socketId}`);
//             getLocalStream();
//         });
//         socketRef.current.on('new-producer', ({ producerId }) => signalNewConsumerTransport(producerId));
//         socketRef.current.on('producer-closed', handleProducerClosed);
//         return () => socketRef.current.disconnect();
//     }, []);

//     const getLocalStream = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({
//                 audio: true,
//                 video: { width: { min: 640, max: 1920 }, height: { min: 400, max: 1080 } }
//             });
//             if (localVideoRef.current) localVideoRef.current.srcObject = stream;
//             joinRoom(stream);
//         } catch (error) {
//             console.error('Error getting local stream:', error);
//         }
//     };

//     const joinRoom = (stream) => {
//         socketRef.current.emit('joinRoom', { roomCode }, (data) => {
//             setRtpCapabilities(data.rtpCapabilities);
//             createDevice(data.rtpCapabilities, stream);
//         });
//     };

//     const createDevice = async (rtpCapabilities, stream) => {
//         try {
//             const newDevice = new mediasoupClient.Device();
//             await newDevice.load({ routerRtpCapabilities: rtpCapabilities });
//             deviceRef.current = newDevice;
//             createSendTransport(newDevice, stream);
//         } catch (error) {
//             console.error('Error creating device:', error);
//         }
//     };

//     const createSendTransport = (device, stream) => {
//         socketRef.current.emit('createWebRtcTransport', { consumer: false }, ({ params }) => {
//             if (params.error) {
//                 console.error(params.error);
//                 return;
//             }
//             const transport = device.createSendTransport(params);
//             transport.on('connect', async ({ dtlsParameters }, callback, errback) => {
//                 try {
//                     await socketRef.current.emit('transport-connect', { dtlsParameters });
//                     callback();
//                 } catch (error) {
//                     errback(error);
//                 }
//             });
//             transport.on('produce', async (parameters, callback, errback) => {
//                 try {
//                     await socketRef.current.emit('transport-produce', {
//                         kind: parameters.kind,
//                         rtpParameters: parameters.rtpParameters,
//                         appData: parameters.appData,
//                     }, ({ id }) => callback({ id }));
//                 } catch (error) {
//                     errback(error);
//                 }
//             });
//             setProducerTransport(transport);
//             connectSendTransport(transport, stream);
//         });
//     };

//     const connectSendTransport = async (transport, stream) => {
//         const audio = await transport.produce({ track: stream.getAudioTracks()[0] });
//         const video = await transport.produce({ track: stream.getVideoTracks()[0] });
//         setAudioProducer(audio);
//         setVideoProducer(video);
//     };

//     const signalNewConsumerTransport = async (remoteProducerId) => {
//         if (consumingTransports.current.includes(remoteProducerId)) return;
//         consumingTransports.current.push(remoteProducerId);
//         socketRef.current.emit('createWebRtcTransport', { consumer: true }, ({ params }) => {
//             if (params.error) {
//                 console.log(params.error);
//                 return;
//             }
//             let consumerTransport;
//             try {
//                 consumerTransport = deviceRef.current.createRecvTransport(params);
//             } catch (error) {
//                 console.log(error);
//                 return;
//             }
//             consumerTransport.on('connect', async ({ dtlsParameters }, callback, errback) => {
//                 try {
//                     await socketRef.current.emit('transport-recv-connect', { dtlsParameters, serverConsumerTransportId: params.id });
//                     callback();
//                 } catch (error) {
//                     errback(error);
//                 }
//             });
//             connectRecvTransport(consumerTransport, remoteProducerId, params.id);
//         });
//     };

//     const connectRecvTransport = async (consumerTransport, remoteProducerId, serverConsumerTransportId) => {
//         socketRef.current.emit('consume', {
//             rtpCapabilities: deviceRef.current.rtpCapabilities,
//             remoteProducerId,
//             serverConsumerTransportId,
//         }, async ({ params }) => {
//             if (params.error) {
//                 console.log('Cannot Consume');
//                 return;
//             }
//             console.log('test')
//             const consumer = await consumerTransport.consume({
//                 id: params.id,
//                 producerId: params.producerId,
//                 kind: params.kind,
//                 rtpParameters: params.rtpParameters
//             });

//             setConsumerTransports((prev) => [...prev, { consumerTransport, serverConsumerTransportId: params.id, producerId: remoteProducerId, consumer }]);

//             const mediaElement = document.createElement(params.kind === 'audio' ? 'audio' : 'video');
//             mediaElement.srcObject = new MediaStream([consumer.track]);
//             mediaElement.autoplay = true;
//             // mediaElement.playsInline = true;

//             if (params.kind === 'audio') {
//                 mediaElement.setAttribute('id', `audio-${remoteProducerId}`);
//             } else {
//                 mediaElement.setAttribute('id', `video-${remoteProducerId}`);
//             }

//             if (remoteVideoContainerRef.current) {
//                 remoteVideoContainerRef.current.appendChild(mediaElement);
//             }

//             socketRef.current.emit('consumer-resume', { serverConsumerId: params.serverConsumerId });
//         });
//     };


//     const handleProducerClosed = ({ remoteProducerId }) => {
//         setConsumerTransports((prev) => prev.filter((t) => t.producerId !== remoteProducerId));
//     };

//     return (
//         <div>
//             <h1>Mediasoup Video Chat</h1>
//             <video ref={localVideoRef} autoPlay playsInline></video>
//             <div ref={remoteVideoContainerRef}></div>
//         </div>
//     );
// };

// export default VideoChat;

const page = () => {
    return (
        <div>
            Enter
        </div>
    );
}
    
export default page;