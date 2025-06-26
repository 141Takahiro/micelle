import React from 'react';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';

// 達成率グラフ
const GaugeComponentStatus = ({ value }) => (
    <Gauge
        value={value}
        width={230}
        height={230}
        valueMin={0}
        valueMax={100}
        startAngle={-135}
        endAngle={135}
        innerRadius="80%"
        outerRadius="100%"
        text={({ value }) => `${Math.round(value)}%`}
    />
);

// AI評価グラフ
const GaugeComponentAI = ({ value }) => (
    <Gauge
        sx={{ [`& .${gaugeClasses.valueArc}`]: { fill: '#FF0000' } }}
        value={value}
        width={230}
        height={230}
        valueMin={0}
        valueMax={100}
        startAngle={-135}
        endAngle={135}
        innerRadius="80%"
        outerRadius="100%"
        text={({ value }) => `${Math.round(value)}点`}
    />
);

const RoomGaugeGraph = ({ rooms, selectedRoomId, agendas }) => {
    const selectedRoom = rooms.find(room => room.id === selectedRoomId);
    if (!selectedRoom) return null;

    const roomAgendas = agendas[selectedRoom.id] || [];

    const achievementRate = roomAgendas.length > 0
        ? Math.round((roomAgendas.filter(agenda => agenda.status).length / roomAgendas.length) * 100)
        : 0;

    const gaugeStatusValue = roomAgendas.length > 0
        ? (roomAgendas.filter(agenda => agenda.status).length / (roomAgendas.length || 1)) * 100
        : 0;

    const aiAverage = roomAgendas.length > 0
        ? Math.round(roomAgendas.reduce((acc, agenda) => acc + (agenda.ai_evaluate || 0), 0) / roomAgendas.length)
        : 0;

    const gaugeAiValue = roomAgendas.length > 0
        ? roomAgendas.reduce((acc, agenda) => acc + (agenda.ai_evaluate || 0), 0) / roomAgendas.length
        : 0;

    return (
        <div className="md:mr-4">
            <div className="flex flex-col items-center mb-8">
                <p className="text-lg font-semibold text-gray-800">達成率：{achievementRate}%</p>
                <GaugeComponentStatus value={gaugeStatusValue} />
            </div>

            <div className="flex flex-col items-center mb-2">
                <p className="text-lg font-semibold text-gray-800">
                    AIスコアの平均：{aiAverage}
                </p>
                <GaugeComponentAI value={gaugeAiValue} />
            </div>
        </div>
    );
};

export default RoomGaugeGraph;