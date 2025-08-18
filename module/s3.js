const { S3Client, PutObjectCommand, ListObjectsCommand, DeleteObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const fs = require("fs");
const path = require("path");

const s3Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_URL,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    }
});

async function uploadFile(fileKey, fileData, contentType = 'application/octet-stream') {
    const command = new PutObjectCommand({
        Bucket: "noh",
        Key: fileKey,
        Body: fileData,
        ContentType: contentType
    });

    return s3Client.send(command);
}

async function listFiles() {
    const command = new ListObjectsCommand({
        Bucket: "noh"
    });

    const response = await s3Client.send(command);
    const totalSize = response.Contents.reduce((acc, item) => acc + item.Size, 0); // Toplam boyutu hesapla

    return {
        files: response.Contents
            .sort((a, b) => new Date(a.LastModified) - new Date(b.LastModified)) // Tarihe göre sırala (eskiden yeniye)
            .map(item => ({ name: item.Key, size: item.Size })), // Dosyaları { name, size } formatında döndür
        totalSize // Toplam boyutu döndür
    };
}

async function deleteFile(fileKey) {
    const command = new DeleteObjectCommand({
        Bucket: "noh",
        Key: fileKey
    });

    return s3Client.send(command);
}

async function downloadFile(fileKey, downloadPath) {
    const command = new GetObjectCommand({
        Bucket: "noh",
        Key: fileKey
    });

    const response = await s3Client.send(command);

    const writeStream = fs.createWriteStream(downloadPath);
    return new Promise((resolve, reject) => {
        response.Body.pipe(writeStream);
        response.Body.on("error", reject);
        writeStream.on("finish", resolve);
    });
}

module.exports = { uploadFile, listFiles, deleteFile, downloadFile };