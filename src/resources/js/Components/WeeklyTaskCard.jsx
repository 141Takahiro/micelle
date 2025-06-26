import React from 'react';

const WeeklyTaskCard = ({
  rooms,
  latestAgendas,
  isStatusLoading,
  handleStatusUpdate,
  setSelectedRoomId,
}) => {
  const weekDays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];

  return (
    <div>
      <h2 className="text-xl font-bold m-2">今週のタスク</h2>
      {rooms.length === 0 ? (
        <p className="text-center text-gray-500 m-4">部屋のデータがありません。</p>
      ) : (
        rooms.map((room, index) => {
          const latestAgenda = latestAgendas[index];

          return (
            <div className="w-full mt-4" key={room.id}>
              <h2 className="ml-2 text-lg font-semibold text-gray-800">{room.room_name}</h2>
              <div className="md:flex md:justify-center">
                <div
                  className={`md:w-5/6 p-4 font-semibold text-white rounded-md shadow-md transition ml-2 mr-2
                    ${isStatusLoading ||
                      !latestAgenda?.day_of_the_week ||
                      !latestAgenda?.start_time ||
                      !latestAgenda?.end_time
                      ? "bg-gray-400 opacity-50 cursor-not-allowed"
                      : latestAgenda?.status === 1
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-red-500 hover:bg-red-600"
                    }`}
                  onClick={() => {
                    if (!isStatusLoading && latestAgenda) {
                      handleStatusUpdate(room.id, latestAgenda.id, latestAgenda.status);
                      setSelectedRoomId(room.id);
                    }
                  }}
                >
                  {latestAgenda &&
                    latestAgenda.day_of_the_week !== null &&
                    latestAgenda.start_time !== null &&
                    latestAgenda.end_time !== null ? (
                    <div>
                      <p>曜日: {weekDays[latestAgenda.day_of_the_week - 1]}</p>
                      <p>
                        {latestAgenda.start_time} ~ {latestAgenda.end_time}
                      </p>
                      {latestAgenda.status === 0 && (
                        <p className="text-center font-bold">未完了</p>
                      )}
                      {latestAgenda.status === 1 && (
                        <p className="text-center font-bold">OK！</p>
                      )}
                    </div>
                  ) : (
                    <p className="text-center text-white">タスクが未登録です</p>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default WeeklyTaskCard;