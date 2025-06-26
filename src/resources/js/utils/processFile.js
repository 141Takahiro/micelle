import compressImage from '../utils/compressImage';
import validateImage from '../utils/validateImage';

const processFile = (file) => {
    return new Promise((resolve, reject) => {
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

                compressImage(canvas, initialQuality)
                    .then((compressedBlob) => {
                        const validationError = validateImage(compressedBlob);
                        if (validationError) {
                            reject(new Error(validationError));
                            return;
                        }

                        // 新しい File オブジェクトを生成（元のファイル名、MIME タイプを保持）
                        const processedFile = new File([compressedBlob], file.name, { type: file.type });

                        // Blob を DataURL に変換する
                        const newReader = new FileReader();
                        newReader.onload = (event) => {
                            // dataURL と processedFile の両方を返す
                            resolve({ dataURL: event.target.result, file: processedFile });
                        };
                        newReader.onerror = (error) => {
                            reject(error);
                        };
                        newReader.readAsDataURL(compressedBlob);
                    })
                    .catch((error) => {
                        reject(error);
                    });
            };

            img.onerror = (error) => {
                reject(error);
            };

            // 画像の読み込み開始
            img.src = dataURL;
        };

        reader.onerror = (error) => {
            reject(error);
        };

        reader.readAsDataURL(file);
    });
};

export default processFile;