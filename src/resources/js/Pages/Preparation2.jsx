import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState } from "react";
import { router } from "@inertiajs/react"

const Preparation = ({ stored_rooms }) => {
    const [roomData, setRoomData] = useState([{ roomName: "", img: null, preview: null }]);

    const handleImageChange = (index, event) => {
        const file = event.target.files[0];
        const updatedRooms = [...roomData];
        updatedRooms[index].img = file;

        const reader = new FileReader();
        reader.onloadend = () => {
            updatedRooms[index].preview = reader.result;
            setRoomData(updatedRooms);
        };
        reader.readAsDataURL(file);
    };

    const handleRoomNameChange = (index, event) => {
        const updatedRooms = [...roomData];
        updatedRooms[index].roomName = event.target.value;
        setRoomData(updatedRooms);
    };

    const addRoom = () => {
        setRoomData([...roomData, { roomName: "", img: null, preview: null }]);
    };

    const handleSubmit = () => {
        const formData = new FormData();
        let hasError = false;

        for (const [index, room] of roomData.entries()) {
            if (!room.roomName) {
                alert(`部屋 ${index + 1} の名前を入力してください`);
                return;
            }
            formData.append(`room_name[${index}]`, room.roomName);
            formData.append(`img[${index}]`, room.img ? room.img : "null");
        }

        router.post("/store", formData)
        .catch((error) => {
            alert(error.response?.data?.message || "アップロードに失敗しました。もう一度試してください。");
        });
    };
    
    const handleDelete = (room_id) => {
        router.delete(`/delete/${room_id}`, {
            onSuccess: () => {
                window.location.reload();
            },
            onError: (error) => {
                alert(error.response?.data?.message || "削除に失敗しました。");
            }
        });
    };

return (
    <AuthenticatedLayout
        header={
            <h2 className="text-xl font-semibold leading-tight text-gray-800">
                Preparation
            </h2>
        }
    >

    <div>
        <h2>写真の投稿</h2>
        {roomData.map((room, index) => (
            <div key={index}>
                <input type="file" accept="image/*" onChange={(event) => handleImageChange(index, event)} />
                        {room.preview && <img src={room.preview} alt="選択された画像" width="200" />}
                <input
                    type="text"
                    placeholder={`部屋 ${index + 1} の名前を入力`}
                    value={room.roomName}
                    onChange={(event) => handleRoomNameChange(index, event)}
                />
            </div>
        ))}
            <button onClick={addRoom}>部屋を追加</button>
            <button onClick={handleSubmit}>送信</button>
    </div>
 
    <div>
        <h2>部屋の画像</h2>
        {stored_rooms.map((stored_room, index) => (
            <div key={stored_room.room_id ?? `default-room-${index}`}>
                <img 
                    src={`/storage/room_imgs/${stored_room.img_name}`} 
                    alt="部屋の画像" 
                    width="200" 
                />
            {stored_room.room_id !== null && ( 
                <button onClick={() => handleDelete(stored_room.room_id)}>削除</button>
            )}
            </div>
        ))}
    </div>

    </AuthenticatedLayout>
    );
};

export default Preparation;