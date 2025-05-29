import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useState } from "react";
import { Radio, RadioGroup, FormControlLabel, FormControl } from '@mui/material';
import { Gauge, gaugeClasses } from '@mui/x-charts/Gauge';
import rotateRight from "../assets/icons/rotate_right.png";
import { router } from '@inertiajs/react';
import Modal from "../Components/Modal";
import PrimaryButton from "../Components/PrimaryButton";
import cameraIcon from "../assets/icons/cameraIcon.png";
import folderIcon from "../assets/icons/folderIcon.png";
import cameraAdd from "../assets/icons/camera-add.png";
import folderOpen from "../assets/icons/folder-open.png";
import { usePage } from "@inertiajs/react";


export default function Home({ rooms = [] }) {

        rooms.forEach(room => {
            console.log(`Room ID: ${room.id}`);
            console.log(`Agendasの数： ${room.agendas?.length ?? 0}`);
            console.log("Agendas:", room.agendas);
        });

    const defaultImage = "/storage/images/default-image.png";
    const [selectedRoomId, setSelectedRoomId] = useState(rooms.length > 0 ? rooms[0].id : null);
    const [imageSrc, setImageSrc] = useState(defaultImage);
    const [imageFile, setImageFile] = useState(null);
    const [imageError, setImageError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cameraSrc, setCameraSrc] = useState(cameraIcon);
    const [folderSrc, setFolderSrc] = useState(folderIcon);
    const { props } = usePage();
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const [modalData, setModalData] = useState({ 
        updatePhoto_message: "", 
        score: null,
        micelle_message: "",
        image_url: "",
    });

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

    const handleRoomSelection = (roomId) => {
        setSelectedRoomId(roomId);
    };

    useEffect(() => {
        console.log(`選択された Room ID: ${selectedRoomId}`);
    }, [selectedRoomId]);

    const [agendas, setAgendas] = useState([]);

    const handleStatusUpdate = (agendaId, currentStatus) => {
        const newStatus = currentStatus === 1 ? 0 : 1;
        router.put(`/agendas/${agendaId}/update-status`, { status: newStatus });
            setAgendas((prevAgendas) =>
                prevAgendas.map((agenda) =>
                    agenda.id === agendaId ? { ...agenda, status: newStatus } : agenda
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


    const [isModalOpen, setIsModalOpen] = useState(false);

            const openCamera = () => {
            console.log("カメラアイコンがクリックされました。");
        };

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const imageError = validateImage(file);

        setImageError(imageError);

        if (!imageError) {
            setImageFile(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImageSrc(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateImage = (file) => {
        if (!file || file === null || file === undefined) { 
            return "ファイルが選択されていません。";
        }
        const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
        const maxSize = 2 * 1024 * 1024;
            if (!allowedTypes.includes(file.type)) {
                return "許可されていないファイル形式です。JPEG, PNG, JPGのみアップロードできます。";
            }
            if (file.size > maxSize) {
                return "ファイルサイズが２ＭＢを超えています。";
            }
        return null;
    };

    const handleSubmit = async () => {
        const newImageError = validateImage(imageFile);
        setImageError(newImageError);

        if (newImageError) {
            setIsSubmitting(false);
            return;
        }

        setIsSubmitting(true);
        const formData = new FormData();
        formData.append("image", imageFile);

        router.post(`/updatePhoto/${randomRoom.id}`, formData, {
            replace: true,
        });

    };

    const getRandomRoom = (rooms) => {
        if (!rooms || rooms.length === 0) {
            console.error("部屋が存在しません！");
            return null;
        }
        return rooms[Math.floor(Math.random() * rooms.length)];
    };

    const randomRoom = getRandomRoom(rooms);
        if (randomRoom) {
            console.log("選ばれた部屋:", randomRoom);
    }

    useEffect(() => {
        if (props.updatePhoto_message || props.score || props.micelle_message || props.image_url) {
            setModalData({
                updatePhoto_message: props.updatePhoto_message || "",
                score: props.score ?? null, 
                micelle_message: props.micelle_message || "",
                image_url: props.image_url || "",
            });

            setUpdateModalOpen(true);
            }
        }, [props.updatePhoto_message, props.score, props.micelle_message]);

    useEffect(() => {
        setImageLoaded(false);
    }, [modalData.image_url]);

    useEffect(() => {
        setImageSrc(defaultImage);
    }, []);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Home
                </h2>
            }
        >
            <Head title="Home" />

            <Modal show={updateModalOpen} onClose={() => setUpdateModalOpen(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold">ミセルくんのメッセージ</h2>
                    <p>{modalData.updatePhoto_message}</p>

                    {modalData.image_url && (
                        <>
                            {!imageLoaded && (
                                <img
                                    src={rotateRight}
                                    alt="ローディング中..."
                                    className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                />
                            )}
                                <img
                                    src={modalData.image_url}
                                    alt="部屋の画像"
                                    className="h-48 w-96 object-cover rounded-sm m-2"
                                    onLoad={() => setImageLoaded(true)}
                                />
                        </>
                    )}

                    {modalData.score !== null && (
                        <div className="mt-4">
                            <h3 className="text-md font-semibold">スコア</h3>
                            <p className="text-lg font-bold">{modalData.score}点</p>
                        </div>
                    )}

                    {modalData.micelle_message && (
                        <div className="mt-4">
                            <h3 className="text-md font-semibold">評価メッセージ</h3>
                            <p className="text-md">{modalData.micelle_message}</p>
                        </div>
                    )}

                    <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" onClick={() => setUpdateModalOpen(false)}>
                        閉じる
                    </button>
                </div>
            </Modal>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <h2 className="text-center m-4">{modalData.updatePhoto_message}</h2>
                <div className="p-4">
                     <div className="flex flex-col">
                        
                    {randomRoom && (
                        <h2 className="text-xl text-center my-4">
                            「{randomRoom.room_name}」の写真を更新しましょう！
                        </h2>
                    )}

                            <div>
                                <img src={imageSrc} alt="部屋の写真" className="w-full rounded-sm"/>
                            </div>
                            <div className="flex justify-around">
                                <div>
                                    <button
                                        onClick={openCamera}
                                        onMouseEnter={() => setCameraSrc(cameraAdd)}
                                        onMouseLeave={() => setCameraSrc(cameraIcon)}
                                    >
                                        <img src={cameraSrc} alt="カメラアイコン" style={{ width: "50px", height: "50px" }} />
                                    </button>
                                </div>
                                <div>
                                    <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: "none" }} id="fileInput" />
                                        <button
                                            onClick={() => document.getElementById("fileInput").click()}
                                            onMouseEnter={() => setFolderSrc(folderOpen)}
                                            onMouseLeave={() => setFolderSrc(folderIcon)}
                                        >
                                            <img src={folderSrc} alt="フォルダアイコン" style={{ width: "50px", height: "50px" }} />
                                        </button>
                                </div>
                            </div>
                            <div>
                                <PrimaryButton onClick={handleSubmit}
                                    disabled={isSubmitting || imageError}
                                    className="my-2"
                                >
                                    {isSubmitting ? "投稿中..." : "投稿"}
                                </PrimaryButton>
                            </div>
                            {imageError && <p className="text-red-500 text-sm mt-1">{imageError}</p>}
                        </div>
                </div>
            </Modal>

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
                                onClick={() => {
                                    if (agenda) {
                                        handleStatusUpdate(agenda.id, agenda.status);
                                    }
                                    handleRoomSelection(room.id);
                                }}

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
                        {/* API確認用 */}
                        {/* <button
                            onClick={() => handleAnalyzeImage(room.img_name)}
                            className="mt-2 p-2 bg-blue-500 text-white rounded"
                        >
                            画像を判定する
                        </button> */}
                        {/* API確認用 */}

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
            <PrimaryButton onClick={() => setIsModalOpen(true)}>画像を判定する</PrimaryButton>
        </AuthenticatedLayout>
    );
}
