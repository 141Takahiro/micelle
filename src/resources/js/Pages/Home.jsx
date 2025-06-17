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
import defaultImage from "../assets/icons/default-image.png";
import micelleEvaluateImage from "../assets/icons/micelle_evaluate.jpg";
import { usePage } from "@inertiajs/react";
import React, { useRef } from 'react';

export default function Home({ rooms = [] }) {

    const [selectedRoom, setselectedRoom] = useState(rooms.length > 0 ? rooms[0].id : null);
    const [imageSrc, setImageSrc] = useState(defaultImage);
    const [imageFile, setImageFile] = useState(null);
    const [imageError, setImageError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [cameraSrc, setCameraSrc] = useState(cameraIcon);
    const [folderSrc, setFolderSrc] = useState(folderIcon);
    const { props } = usePage();
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);
    const currentRoom = rooms.find(room => room.id === selectedRoom);
    const fileInputRef = useRef(null);

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
            width={220}
            height={220}
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
            width={220}
            height={220}
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

    const [isLoading, setIsLoading] = useState(false);

    const handleStatusUpdate = (agendaId, currentStatus) => {
        setIsLoading(true);

        const newStatus = currentStatus === 1 ? 0 : 1;
        router.put(`/agendas/${agendaId}/update-status`, { status: newStatus }, {
            onSuccess: () => {
                setAgendas((prevAgendas) =>
                prevAgendas.map((agenda) =>
                    agenda.id === agendaId ? { ...agenda, status: newStatus } : agenda
                )
                );
            },
            onFinish: () => {
                setIsLoading(false); 
            }
        });
    };

    useEffect(() => {
        const latestAgendas = rooms.map((room) => {
            return room.agendas.length > 0
                ? room.agendas.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0]
                : null;
    });

    setAgendas(latestAgendas);
        }, [rooms]);

   
    const allCompleted = agendas.every(agenda => agenda && agenda.status === 1);
    const hasAiEvaluate = agendas.some(agenda => agenda && agenda.ai_evaluate);
   
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openCamera = () => {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";
        fileInput.capture = "environment";
        fileInput.style.display = "none";
        document.body.appendChild(fileInput);

        fileInput.click();
        fileInput.addEventListener("change", (event) => {
            const file = event.target.files[0];

        if (file) {
            processFile(file, (dataURL) => {
                setImageSrc(dataURL);
            });
        }
            document.body.removeChild(fileInput);
            });
        };

    //画像のプレビュー
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            processFile(file, (dataURL) => {
                setImageSrc(dataURL);
                    if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                    }
            });
        }
    };

    //画像の投稿管理
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

        router.post(`/updatePhoto/${selectedRoom}`, formData, {
            replace: true,
            onFinish: () => setIsSubmitting(false),
        });

    };

    const MAX_FILE_SIZE = 2 * 1024 * 1024; 
    const MIN_QUALITY = 0.3;      
    const QUALITY_DECREMENT = 0.1; 

    const compressImage = (canvas, quality, callback) => {
    canvas.toBlob(
        (blob) => {
        if (!blob) {
            console.error("Blobの生成に失敗しました");
            return;
        }
  
        if (blob.size > MAX_FILE_SIZE && quality > MIN_QUALITY) {
            compressImage(canvas, quality - QUALITY_DECREMENT, callback);
        } else {
            callback(blob);
        }
        },
        "image/jpeg",
        quality
    );
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


    //画像のサイズ変更及びファイルへ保存
    const processFile = (file, onSuccess) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const dataURL = e.target.result;
            const img = new Image();
                img.onload = () => {

                const MAX_EDGE = 4096;
                let width = img.width;
                let height = img.height;
       
                const ratio = Math.min(1, MAX_EDGE / width, MAX_EDGE / height);
                width = width * ratio;
                height = height * ratio;
        
                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);

                const initialQuality = 0.6;
                compressImage(canvas, initialQuality, (compressedBlob) => {
                    const validationError = validateImage(compressedBlob);
                        if (validationError) {
                            setImageError(validationError);
                            return;
                        }
            
                setImageFile(compressedBlob);
                const newReader = new FileReader();
                newReader.onload = (event) => {
                    onSuccess(event.target.result);
                };
                newReader.readAsDataURL(compressedBlob);
                });
                };
            img.src = dataURL;
        };
    reader.readAsDataURL(file);
    };


    //初期化処理
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

        setImageLoaded(false);    
        setIsModalOpen(false);      
        setIsSubmitting(false);    
    }, [props]);

    // useEffect(() => {
    //     if (props.updatePhoto_message || props.score || props.micelle_message || props.image_url) {
    //         setModalData({
    //             updatePhoto_message: props.updatePhoto_message || "",
    //             score: props.score ?? null, 
    //             micelle_message: props.micelle_message || "",
    //             image_url: props.image_url || "",
    //         });
    //         setUpdateModalOpen(true);
    //         }
    //     }, [props.updatePhoto_message, props.score, props.micelle_message]);

    // useEffect(() => {
    //     setImageLoaded(false);
    // }, [modalData.image_url]);

    // useEffect(() => {
    //     setIsModalOpen(false);
    // }, []);

    // useEffect(() => {
    //     setIsSubmitting(false);
    // }, []);

    

    useEffect(() => {
        setImageSrc(defaultImage);
    }, [isSubmitting]);


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
                                <div class="flex justify-center">
                                    <img
                                        src={rotateRight}
                                        alt="ローディング中..."
                                        className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                    />
                                </div>
                            )}
                                <div class="flex justify-center">
                                    <img
                                        src={modalData.image_url}
                                        alt="部屋の画像"
                                        className="md:max-h-[32rem] object-cover rounded-sm"
                                        onLoad={() => setImageLoaded(true)}
                                    />
                                </div>
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

                    <button 
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded" 
                        onClick={() => {
                            setUpdateModalOpen(false);
                            setIsModalOpen(false);
                        }}
                    >
                        閉じる
                    </button>
                </div>
            </Modal>

            <Modal show={isModalOpen} onClose={() => setIsModalOpen(false)}>
                {/* <h2 className="text-center m-4">{modalData.updatePhoto_message}</h2> */}
                <div className="p-4">
                    <div className="flex flex-col">
                        <label className="text-sm font-bold">部屋を選択：</label>
                        <select
                            className="p-2 border rounded mt-2"
                            value={selectedRoom}
                            onChange={(e) => setselectedRoom(Number(e.target.value))}
                        >
                    {rooms.map(room => (
                        <option key={room.id} value={String(room.id)}>
                            {room.room_name}
                        </option>
                    ))}
                </select>

                    {currentRoom && (
                        <h2 className="text-xl text-center my-4">
                            「{currentRoom.room_name}」の写真を更新しましょう！
                        </h2>
                    )}

                            <div className="flex justify-center">
                                <img src={imageSrc} alt="部屋の写真" className="md:max-h-[32rem] object-cover rounded-sm"/>
                            </div>
                            <div className="flex justify-around md:justify-end md:mr-20">
                                <div className="md:hidden">
                                    <button
                                        onClick={openCamera}
                                        onMouseEnter={() => setCameraSrc(cameraAdd)}
                                        onMouseLeave={() => setCameraSrc(cameraIcon)}
                                    >
                                        <img src={cameraSrc} alt="カメラアイコン" style={{ width: "50px", height: "50px" }} />
                                    </button>
                                </div>
                                <div>
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        accept="image/*"   
                                        onChange={handleImageChange} 
                                        style={{ display: "none" }} 
                                        id="fileInput" 
                                    />
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

            <div className="md:flex md:flex-row">
                <div className="basis-1/3 border-2 border-solid rounded-sm m-1 shadow-xl justify-items-center">
                    <h2 className="text-xl font-bold m-2">今週のタスク</h2>

                    {rooms.length === 0 ? (
                        <p className="text-center text-gray-500 m-4">部屋のデータがありません。</p>
                    ) : (
                        rooms.map((room) => {
                            const weekDays = ["月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日", "日曜日"];
                            const agenda = agendas.find(a => a.room_id === room.id) || null;

                            return (
                                <div 
                                    className="w-full mt-8"
                                    key={room.id}
                                >
                                    <h2 className="ml-2 text-lg font-semibold text-gray-800">{room.room_name}</h2>
                                    <div className="md:flex md:justify-center">
                                        <div 
                                            className={`md:w-5/6 p-4 font-semibold text-white rounded-md shadow-md transition ml-4 mr-4 mt-1 mb-2
                                                ${isLoading || !agenda?.day_of_the_week || !agenda?.start_time || !agenda?.end_time 
                                                    ? "bg-gray-400 opacity-50 cursor-not-allowed" 
                                                    : agenda?.status === 1 
                                                    ? "bg-blue-500 hover:bg-blue-600" 
                                                    : "bg-red-500 hover:bg-red-600"
                                                }`}
                                            onClick={() => {
                                                if (!isLoading && agenda) { 
                                                    handleStatusUpdate(agenda.id, agenda.status);
                                                    setselectedRoom(room.id);
                                                }
                                            }}
                                        >
                                            {agenda && agenda.day_of_the_week !== null && agenda.start_time !== null && agenda.end_time !== null ? (
                                            <div>
                                                    <p>曜日: {weekDays[agenda.day_of_the_week - 1]} </p>
                                                    <p>{agenda.start_time}~{agenda.end_time}</p>
                                                    {agenda.status === 0 && <p className="text-center font-bold">未完了</p>}
                                                    {agenda.status === 1 && <p className="text-center font-bold">OK！</p>}
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

                <div 
                    className={`flex justify-center border-2 border-solid rounded-sm m-2 shadow-xl transition duration-300 ease-in-out h-auto md:hidden
                        ${allCompleted && !hasAiEvaluate ? "border-4 border-red-500 bg-red-500" : ""}`}
                >
                    <img 
                        src={micelleEvaluateImage} 
                        alt="ミセル判定画像" 
                        className={`h-auto w-auto m-4 transition ease-in-out hover:scale-105 hover:border-4 hover:border-blue-500 rounded
                        ${allCompleted && !hasAiEvaluate ? "border-4 border-red-500" : ""}`}
                        onClick={() => setIsModalOpen(true)}
                    />
                </div>
                
                <div className="basis-2/3 border-2 border-solid rounded-sm m-1 shadow-xl justify-items-center">
                    <h2 className="text-xl font-bold m-2">登録されている部屋</h2>
                    
                        {rooms.length === 0 ? (
                            <p className="text-gray-500 m-4">登録されている部屋がありません。</p>
                        ) : (
                            <>
                            <div className="md:flex md:flex-row">
                                <div  className="basis-1/2 justify-items-center">
                                    <div>
                                        {rooms.map((room) =>
                                            room.id === selectedRoom ? (
                                                <div key={room.id} className="p-2 m-2 bg-gray-100 rounded-md">
                                                    <h3 className="flex justify-center mt-2 mb-7 text-lg font-semibold text-gray-800">
                                                        部屋名：{room.room_name}
                                                    </h3>


                                                    {!hasImageLoaded[room.id] && (
                                                        <img
                                                            src={rotateRight}
                                                            alt="ローディング中..."
                                                            className="h-48 w-96 object-scale-down rounded-sm animate-spin m-2"
                                                        />
                                                    )}

                                                    <img
                                                        className="md:h-48 md:w-96 object-cover rounded-sm m-2"
                                                        src={`/rooms/${room.img_name}`}
                                                        alt={room.room_name}
                                                        style={{ display: hasImageLoaded[room.id] ? "block" : "none" }}
                                                        onLoad={() => handleImageLoad(room.id)}
                                                    />


                                                </div>
                                            ) : null
                                        )}
                                    </div>
                                   <div className="block justify-center mb-8">
                                        <FormControl component="fieldset">
                                            <RadioGroup
                                                row
                                                value={selectedRoom}
                                                onChange={(e) => setselectedRoom(Number(e.target.value))}
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
                                    <div 
                                        className={`md:flex justify-center border-2 border-solid rounded-sm m-2 shadow-xl transition duration-300 ease-in-out h-auto md:w-4/5 hidden
                                            ${allCompleted && !hasAiEvaluate ? "border-4 border-red-500 bg-red-500" : ""}`}
                                    >
                                        <img 
                                            src={micelleEvaluateImage} 
                                            alt="ミセル判定画像" 
                                            className={`h-auto w-auto m-4 transition ease-in-out hover:scale-105 hover:border-4 hover:border-blue-500 rounded
                                                ${allCompleted && !hasAiEvaluate ? "border-4 border-red-500" : ""}`}

                                            onClick={() => setIsModalOpen(true)}
                                        />
                                    </div>
                                </div>

                                <div className="md:basis-1/2 mt-6 mb-4 md:mb-0 md:border-l-4 border-gray-200">

                                    <div className="md:mr-4">
                                        {rooms.map((room) =>
                                            room.id === selectedRoom ? (
                                                <div key={room.id} className="flex flex-col items-center mb-8">
                                                    <p className="text-lg font-semibold text-gray-800">達成率：{Math.round((room.agendas.filter(agenda => agenda.status).length / room.agendas.length) * 100) || 0}%</p>
                                                        <GaugeComponentA
                                                            value={(room.agendas.filter(agenda => agenda.status).length / room.agendas.length) * 100 || 0}
                                                        />
                                                </div>
                                            ) : null
                                        )}

                                        {rooms.map((room) =>
                                            room.id === selectedRoom ? (
                                                <div key={room.id} className="flex flex-col items-center mb-2">
                                                    <p className="text-lg font-semibold text-gray-800">
                                                        AIスコアの平均：{" "}
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
                                    {/* <div className="hidden md:flex justify-center m-4">
                                        <FormControl component="fieldset">
                                            <RadioGroup
                                                row
                                                value={selectedRoom}
                                                onChange={(e) => setselectedRoom(Number(e.target.value))}
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
                                    </div> */}
                                </div>
                            </div>
                        </>
                        )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
