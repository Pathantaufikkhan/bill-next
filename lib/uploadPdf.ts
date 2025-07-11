// /lib/uploadPdf.ts
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadPdfFile(pdfBlob: Blob, fileName: string): Promise<string> {
    const storageRef = ref(storage, `bills/${fileName}`);
    await uploadBytes(storageRef, pdfBlob);
    const url = await getDownloadURL(storageRef);
    return url;
}
