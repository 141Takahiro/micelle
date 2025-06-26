const openCamera = () => {
  return new Promise((resolve, reject) => {

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

        resolve(file);
      } else {
        reject(new Error("ファイルが選択されませんでした。"));
      }

      document.body.removeChild(fileInput);
    });
  });
};

export default openCamera;