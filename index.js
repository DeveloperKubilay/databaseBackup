require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { uploadFile, listFiles, downloadFile } = require('./module/s3');
const { spawn } = require('child_process');

async function main() {
    console.log("🔄 Yedekleme işlemi başlatılıyor...");
    const fileSize = (await fs.promises.stat(path.join(__dirname, 'module', 'yedek_dosyaadi.backup'))).size;
    console.log(`📂 Yedek dosyasının boyutu: ${fileSize} bayt 🚀`);

    const files = await listFiles();
    while (files.totalSize + fileSize > Number(process.env.Size.replace(".", ""))) {
        if (files.files.length === 0) {
            console.log("❌ Silinecek dosya bulunamadı, alan yetersiz! 🚨");
            process.exit(0);
        }
        const oldestFile = files.files[0];
        console.log(`⚠️ Eski dosya siliniyor: ${oldestFile.name} (${oldestFile.size} bayt)`);
        await deleteFile(oldestFile.name);
        files.totalSize -= oldestFile.size;
        files.files.shift();
    }

    const fileKey = 'DATABASE_BACKUP' + Date.now() + '.backup';

    fs.writeFileSync(path.join(__dirname, 'module', "temp", fileKey),
        fs.readFileSync(path.join(__dirname, 'module', 'backup.sh'), "utf-8")
            .replace("{PASSWORD}", process.env.DATABASE_PASSWORD)
            .replace("{USERNAME}", process.env.DATABASE_USERNAME)
            .replace("{FILENAME}", fileKey)
            .replace("{DATABASE_NAME}", process.env.DATABASE_NAME)
    );

    await new Promise((resolve, reject) => {
        const process = spawn("sh", ["backup.sh"], { cwd: path.join(__dirname, "module", "temp"), stdio: 'inherit', shell: true });

        process.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Process exited with code ${code}`));
            }
        });
    });

    const readStream = fs.createReadStream(path.join(__dirname, 'module', "temp", fileKey));
    await uploadFile(fileKey, readStream);
    console.log(`✅ Dosya başarıyla yüklendi: ${fileKey}`);
}

async function restore() {
    const files = (await listFiles())?.reverse();
    const file = files[0];

    if (!file) 
        return console.log("❌ Geri yüklenecek dosya bulunamadı! 🚨");
    

    const downloadPath = path.join(__dirname, 'module', 'temp', file.name);
    console.log(`⬇️ Dosya indiriliyor: ${file.name} (${file.size} bayt)`);

    await downloadFile(file.name, downloadPath);
    console.log(`✅ Dosya başarıyla indirildi: ${downloadPath}`);

    fs.writeFileSync(path.join(__dirname, 'module', "temp", "restore.sh"),
    fs.readFileSync(path.join(__dirname, 'module', 'restore.sh'), "utf-8")
        .replace("{PASSWORD}", process.env.DATABASE_PASSWORD)
        .replace("{USERNAME}", process.env.DATABASE_USERNAME)
        .replace("{FILENAME}", file.name)
        .replace("{DATABASE_NAME}", process.env.DATABASE_NAME)
    );
}


if (process.argv.includes('upload'))
    main()
else if (process.argv.includes('restore'))
    restore()
else
    setInterval(
        main,
        process.env.Interval || 3600000
    ); // Default 1 saat
