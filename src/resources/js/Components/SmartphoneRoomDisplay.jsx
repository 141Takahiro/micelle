import React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';

const SmartphoneRoomDisplay = ({
    rooms,
    filteredAgendas,
    selectedRoom,
    dayLabel,
    hasImageLoaded,
    rotateRight,
    handleImageLoad,
    setSelectedRoomId,
    selectedRoomId,
}) => {

    return (
        <div>
            {rooms.length === 0 ? (
                <p className="text-gray-500 m-4">登録されている部屋がありません。</p>
            ) : (
                <div className="md:flex md:flex-row">
                    <div className="basis-1/2 justify-items-center">
                        {selectedRoom && (
                            <div key={selectedRoom.id} className="p-2 m-2 bg-gray-100 rounded-md">
                                <p className="text-gray-600 font-semibold text-base leading-relaxed">
                                    部屋名：{selectedRoom.room_name}
                                </p>
                                {!hasImageLoaded[selectedRoom.id] && (
                                    <div className="flex justify-center">
                                        <img
                                            src={rotateRight}
                                            alt="ローディング中…"
                                            className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                        />
                                    </div>
                                )}
                                <div className="flex justify-center">
                                    <img
                                        className="md:h-48 md:w-96 object-cover rounded-sm"
                                        src={`/rooms/${selectedRoom.img_name}`}
                                        alt={selectedRoom.room_name}
                                        style={{ display: hasImageLoaded[selectedRoom.id] ? "block" : "none" }}
                                        onLoad={() => handleImageLoad(selectedRoom.id)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="m-2">
                {filteredAgendas.length === 0 ? (
                    <p className="text-gray-500">予定が登録されていません</p>
                ) : (
                    filteredAgendas.map((regular_agenda) => (
                        <div key={regular_agenda.id} className="p-2 m-2 bg-gray-100 rounded-md">
                            <p className="text-gray-600 font-semibold text-base leading-relaxed">
                                登録曜日: {dayLabel}
                            </p>
                            <p className="text-gray-600 font-semibold text-base leading-relaxed">
                                登録時間: {regular_agenda.start_time}~{regular_agenda.end_time}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <div className="flex justify-center m-4">
                <FormControl>
                    <RadioGroup
                        row
                        aria-labelledby="room-radio-group-label"
                        name="room-radio-group"
                        value={selectedRoomId}
                        onChange={(e) => {
                            console.log("RadioGroup Event:", e);
                            console.log("e.target.value:", e.target.value);
                            setSelectedRoomId(Number(e.target.value));
                        }}
                    >
                        {rooms.map((room) => (
                            <FormControlLabel
                                key={room.id}
                                value={room.id}
                                control={<Radio />}
                                label={room.room_name}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
            </div>
        </div>
    );
};

export default SmartphoneRoomDisplay;