import React from 'react';
import DangerButton from './DangerButton';
import rotateRight from "../assets/icons/rotate_right.png";

const RoomItem = ({
    room,
    regular_agendas,
    hasImageLoaded,
    selectedRoomId,
    handleImageLoad,
    handleDelete,
}) => {

    const weekDays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];

    const regularAgenda =
        regular_agendas.find(regular_agenda => regular_agenda.room_id === room.id) || null;

    return (
        <li
            key={room.id}
            className={`relative p-1 rounded-md transition duration-300 m-1 ${selectedRoomId === room.id ? "bg-blue-500 bg-opacity-50" : "bg-gray-200"
                }`}
        >
            <p className="m-2 font-bold">部屋名: {room.room_name}</p>
            {!hasImageLoaded[room.id] && (
                <div className="flex justify-center">
                    <img
                        src={rotateRight}
                        alt="ローディング中..."
                        className="h-48 w-96 object-scale-down rounded-sm animate-spin m-1"
                    />
                </div>
            )}
            <div className="flex justify-center">
                <img
                    className="h-48 w-96 object-cover rounded-sm m-1"
                    src={`/rooms/${room.img_name}`}
                    alt={room.room_name}
                    style={{ display: hasImageLoaded[room.id] ? "block" : "none" }}
                    onLoad={() => handleImageLoad(room.id)}
                />
            </div>
            <div className="flex justify-around">
                {regularAgenda ? (
                    regularAgenda.day_of_the_week &&
                        regularAgenda.start_time &&
                        regularAgenda.end_time ? (
                        <div className="m-2 p-2 bg-gray-100 rounded-md">
                            {weekDays[regularAgenda.day_of_the_week - 1]} | {regularAgenda.start_time}~{regularAgenda.end_time}
                        </div>
                    ) : (
                        <p className="m-2 p-2 bg-gray-100 rounded-md">予定が登録されていません</p>
                    )
                ) : (
                    <p className="m-2 p-2 bg-gray-100 rounded-md">予定が登録されていません</p>
                )}
                <DangerButton onClick={() => handleDelete(room.id)} className="m-2">
                    削除
                </DangerButton>
            </div>
        </li>
    );
};

const RoomList = ({
    rooms,
    regular_agendas,
    hasImageLoaded,
    selectedRoomId,
    handleImageLoad,
    handleDelete,
}) => {
    return (
        <div className="block basis-2/3 rounded-sm m-1 shadow-xl">
            <h2 className="text-xl text-center font-bold my-4">登録済みの部屋一覧</h2>
            {rooms.length === 0 ? (
                <p className="text-center text-gray-500 m-4">部屋が登録されていません。</p>
            ) : (
                <ul className="md:grid grid-cols-2">
                    {rooms.map(room => (
                        <RoomItem
                            key={room.id}
                            room={room}
                            regular_agendas={regular_agendas}
                            hasImageLoaded={hasImageLoaded}
                            selectedRoomId={selectedRoomId}
                            handleImageLoad={handleImageLoad}
                            handleDelete={handleDelete}
                        />
                    ))}
                </ul>
            )}
        </div>
    );
};

export default RoomList;