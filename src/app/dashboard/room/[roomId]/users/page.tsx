export default function Page({params}) {
    const roomId = Array.isArray(params?.roomId) ? params.roomId[0] : params?.roomId
    return (
       <div className="m-8">
        <h1 className="font-medium">Users List Room {roomId}</h1>  
       </div>
    );
}