export class ManejadorCamara {
    async procesarFotoBase64(archivo) {
        return new Promise((resolve, reject) => {
            if (!archivo) return resolve("");

            const lector = new FileReader();
            lector.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    // Redimensionamos para que la cadena Base64 no sobrecargue IndexedDB
                    const canvas = document.createElement("canvas");
                    const maxAncho = 640;
                    let w = img.width;
                    let h = img.height;

                    if (w > maxAncho) {
                        h = Math.round((h * maxAncho) / w);
                        w = maxAncho;
                    }

                    canvas.width = w;
                    canvas.height = h;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, w, h);

                    resolve(canvas.toDataURL("image/jpeg", 0.7));
                };
                img.onerror = reject;
                img.src = e.target.result;
            };
            lector.onerror = reject;
            lector.readAsDataURL(archivo);
        });
    }
}