import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from "react";
import { Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import rotateRight from "../assets/icons/rotate_right.png";
import { router } from '@inertiajs/react';


export default function Home({ rooms = [] }) {

        rooms.forEach(room => {
            console.log(`Room ID: ${room.id}`);
            console.log(`Agendasの数： ${room.agendas?.length ?? 0}`);
            console.log("Agendas:", room.agendas);
        });

    const [selectedRoomId, setSelectedRoomId] = useState(rooms.length > 0 ? rooms[0].id : null);

    const [hasImageLoaded, setHasImageLoaded] = useState(() =>
        Object.fromEntries(rooms.map((room) => [room.id, false]))
    );
        
    const handleImageLoad = (roomId) => {
        setHasImageLoaded((prevState) => ({
        ...prevState,
        [roomId]: true,
        }));
    };

    const GaugeComponentA = ({ value }) => (
        <Gauge
            value={value}
            valueMin={0}
            valueMax={100}
            startAngle={-135}
            endAngle={135}
            innerRadius="80%"
            outerRadius="100%"
            text={({ value }) => `${Math.round(value)}%`}
        />
    );

    const GaugeComponentB = ({ value }) => (
        <Gauge
            sx={{ [`& .${gaugeClasses.valueArc}`]: { fill: '#FF0000' } }}
            value={value}
            valueMin={0}
            valueMax={100}
            startAngle={-135}
            endAngle={135}
            innerRadius="80%"
            outerRadius="100%"
            text={({ value }) => `${Math.round(value)}点`}
        />
    );

    const [agendas, setAgendas] = useState([]);

    const handleStatusUpdate = (agendaId) => {
        router.put(`/agendas/${agendaId}/update-status`);
            setAgendas((prevAgendas) =>
                prevAgendas.map((agenda) =>
                    agenda.id === agendaId ? { ...agenda, status: 1 } : agenda
            )
        );
    };

    useEffect(() => {
        const latestAgendas = rooms.map((room) => {
            return room.agendas.length > 0
                ? room.agendas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
                : null;
    });

    setAgendas(latestAgendas);
        }, [rooms]);

    
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Home
                </h2>
            }
        >
            <Head title="Home" />

            <div className="flex flex-row">
                <div className="basis-1/3 border-2 border-solid rounded-sm m-2 shadow-xl justify-items-center">
                <h2 className="text-xl font-bold mb-2">今週のタスク</h2>
                    {rooms.map((room) => {
                        const weekDays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];
                        const agenda = agendas.find(a => a.room_id === room.id) || null;


                        return (
                            <div 
                                key={room.id}
                                className={`w-5/6 p-4 text-white rounded-md shadow-md transition m-4
                                    ${agenda?.status === 1 ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'}`}
                                onClick={() => agenda && handleStatusUpdate(agenda.id)}

                            >
                                <h2>{room.room_name}</h2>
                                    {agenda ? (
                                        <div>
                                            <p>曜日: {weekDays[agenda.day_of_the_week -1]} </p>
                                            <p>{agenda.start_time}~{agenda.end_time}</p>
                                        </div>
                                    ) : (
                                    <p>Agenda がありません</p>
                                    )}
                            </div>
                        )
                    })}
                </div>

                <div className="basis-2/3 border-2 border-solid rounded-sm m-2 shadow-xl">
                    <h2 className="text-xl font-bold mb-2">登録されている部屋</h2>
                    
                        {rooms.length === 0 ? (
                            <p className="text-gray-500">登録されている部屋がありません。</p>
                        ) : (
                            <>
                            <div className="flex flex-row">
                                <div  className="basis-1/2 justify-items-center">
                                    <div>
                                        {rooms.map((room) =>
                                            room.id === selectedRoomId ? (
                                                <div key={room.id} className="p-2 m-2 bg-gray-100 rounded-md">
                                                    部屋名： {room.room_name}

                                                    {!hasImageLoaded[room.id] && (
                                                        <img
                                                            src={rotateRight}
                                                            alt="ローディング中..."
                                                            className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                                        />
                                                    )}

                                                    <img
                                                        className="h-48 w-96 object-cover rounded-sm m-2"
                                                        src={`/rooms/${room.img_name}`}
                                                        alt={room.room_name}
                                                        style={{ display: hasImageLoaded[room.id] ? "block" : "none" }}
                                                        onLoad={() => handleImageLoad(room.id)}
                                                    />
                                                </div>
                                            ) : null
                                        )}
                                    </div>

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

                                <div className="basis-1/2">
                                    {rooms.map((room) =>
                                        room.id === selectedRoomId ? (
                                            <div key={room.id}>
                                                <p>達成率: {Math.round((room.agendas.filter(agenda => agenda.status).length / room.agendas.length) * 100) || 0}%</p>
                                                    <GaugeComponentA
                                                        value={(room.agendas.filter(agenda => agenda.status).length / room.agendas.length) * 100 || 0}
                                                    />
                                            </div>
                                        ) : null
                                    )}

                                    {rooms.map((room) =>
                                        room.id === selectedRoomId ? (
                                            <div key={room.id}>
                                                <p>
                                                    AIスコアの平均:{" "}
                                                    {room.agendas.length > 0
                                                        ? Math.round(
                                                            room.agendas.reduce((acc, agenda) => acc + (agenda.ai_evaluate || 0), 0) / room.agendas.length
                                                        ) : 0}
                                                </p>
                                                <GaugeComponentB
                                                    value={
                                                        room.agendas.length > 0
                                                            ? room.agendas.reduce((acc, agenda) => acc + (agenda.ai_evaluate || 0), 0) / room.agendas.length : 0
                                                    }
                                                />
                                            </div>
                                        ) : null
                                    )}
                                </div>
                            </div>
                        </>
                        )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
