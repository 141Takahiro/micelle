import React from 'react';
import FormControl from '@mui/material/FormControl';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import rotateRight from "../assets/icons/rotate_right.png";
import MicelleEvaluateCard from '../Components/MicelleEvaluateCard';




const HomeDisplay = ({
    rooms,
    selectedRoomId,
    setSelectedRoomId,
    hasImageLoaded,
    handleImageLoad,
    allCompleted,
    hasAiEvaluate,
    micelleEvaluateImage,
    setIsModalOpen,
}) => {
    return (
        <div>
            <div>
                {rooms.map((room) =>
                    room.id === selectedRoomId ? (
                        <div key={room.id} className="p-2 m-2 bg-gray-100 rounded-md">
                            <h3 className="flex justify-center mt-2 mb-7 text-lg font-semibold text-gray-800">
                                部屋名：{room.room_name}
                            </h3>
                            <div className="flex justify-center">
                                {!hasImageLoaded[room.id] && (
                                    <img
                                        src={rotateRight}
                                        alt="ローディング中..."
                                        className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                    />
                                )}

                                <img
                                    className="h-56 w-[28rem] object-cover rounded-sm"
                                    src={`/rooms/${room.img_name}`}
                                    alt={room.room_name}
                                    style={{ display: hasImageLoaded[room.id] ? "block" : "none" }}
                                    onLoad={() => handleImageLoad(room.id)}
                                />
                            </div>
                        </div>
                    ) : null
                )}
            </div>
            <div className="flex justify-center mb-4">
                <FormControl component="fieldset">
                    <RadioGroup
                        row
                        value={selectedRoomId}
                        onChange={(e) => setSelectedRoomId(Number(e.target.value))}
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

            <div className="md:flex hidden p-4">
                <MicelleEvaluateCard
                    allCompleted={allCompleted}
                    hasAiEvaluate={hasAiEvaluate}
                    micelleEvaluateImage={micelleEvaluateImage}
                    setIsModalOpen={setIsModalOpen}
                />
            </div>
        </div>
    );
};

export default HomeDisplay;