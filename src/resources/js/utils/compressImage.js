const MAX_FILE_SIZE = 2 * 1024 * 1024;
const MIN_QUALITY = 0.3;
const QUALITY_DECREMENT = 0.1;

export function compressImage(canvas, initialQuality = DEFAULT_QUALITY) {
    return new Promise((resolve, reject) => {
        const step = (quality) => {
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        return reject(new Error("Blob の生成に失敗しました"));
                    }
                    if (blob.size > MAX_FILE_SIZE && quality > MIN_QUALITY) {
                        step(quality - QUALITY_DECREMENT);
                    } else {
                        resolve(blob);
                    }
                },
                "image/jpeg",
                quality
            );
        };
        step(initialQuality);
    });
}

export default compressImage;

