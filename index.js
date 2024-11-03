let el = document.getElementById("file");
el.addEventListener("change", async (e) => {
  let file = e.target.files[0];

  let chunkSize = 1024 * 200;
  let fileSpliter = new FileSpliter(file, chunkSize);
  let fileMerger = new FileMerger(file.size, chunkSize);

  for (let i = 0; i < fileSpliter.count; i++) {
    // 模拟丢包
    if (i % 3 === 0) {
      continue;
    }

    let chunk = await fileSpliter.chunkByteArray(i);
    fileMerger.addChunkByteArray(chunk);
    console.log("id:", i);
  }

  // 重新获取失败的文件分片重新进行合并
  let missingChunkIds = fileMerger.missingChunkIds();
  for(let id of missingChunkIds) {
    let chunk = await fileSpliter.chunkByteArray(id);
    fileMerger.addChunkByteArray(chunk);
    console.log("id:", id);
  }

  console.log("missingChunkIds", fileMerger.missingChunkIds());
  console.log("merging...");

  // 合并生成新文件
  let newFile = new File(fileMerger.byteArrayList(), file.name, { type: file.type });
  let url = URL.createObjectURL(newFile); 
  let a = document.createElement("a");  
  a.href = url;
  a.download = newFile.name;
  a.click();
});
