// author: hewei
// date: 2024-11-03
// email: hemailads@163.com

/**
 * 创建文件分片
 */
class FileSpliter {
  #file;
  #chunkSize;
  #idDigits;
  count;

  /**
   * 构造方法
   */
  constructor(file, chunkSize) {
    this.#file = file;
    this.#chunkSize = chunkSize;
    this.#idDigits = 32;
    this.count = Math.ceil(file.size / chunkSize);
  }

  /**
   * 将文件id转为字节数组
   */
  idByteArray(id) {
    let bytes = new Uint8Array(this.#idDigits);
    let binArray = id.toString(2).split("");

    for (let i = 0; i < binArray.length; i++) {
      bytes[this.#idDigits - i - 1] = parseInt(
        binArray[binArray.length - i - 1]
      );
    }

    return bytes;
  }

  /**
   * 将文件分块为字节数组
   */
  async chunkByteArray(id) {
    let start = id * this.#chunkSize;
    let end = start + this.#chunkSize;
    let chunk = this.#file.slice(start, end);
    let chunkArrayBuffer = await chunk.arrayBuffer();
    let chunkByteArray = new Uint8Array(this.#idDigits + chunk.size);
    chunkByteArray.set(this.idByteArray(id), 0);
    chunkByteArray.set(new Uint8Array(chunkArrayBuffer), this.#idDigits);
    return chunkByteArray;
  }
}

/**
 * 文件分片合并
 */
class FileMerger {
  #totalSize;
  #chunkSize;
  #idDigits;
  #byteArrayMaxLength;
  #byteArrayList;
  #okIds;

  constructor(totalSize, chunkSize) {
    this.#totalSize = totalSize;
    this.#chunkSize = chunkSize;
    this.#idDigits = 32;
    this.#byteArrayMaxLength = 1024 * 1024 * 1024;
    let byteArrayCount = Math.ceil(this.#totalSize / this.#byteArrayMaxLength);
    this.#byteArrayList = [];

    for (let i = 0; i < byteArrayCount; i++) {
      let size = Math.min(
        this.#byteArrayMaxLength,
        this.#totalSize - i * this.#byteArrayMaxLength
      );
      this.#byteArrayList.push(new Uint8Array(size));
    }

    let count = Math.ceil(this.#totalSize / this.#chunkSize);
    this.#okIds = new Uint8Array(count).fill(0);
  }

  /**
   * 将字节数组转为id
   */
  byteArrayToId(byteArray) {
    return parseInt(byteArray.join(""), 2);
  }

  /**
   * 添加分片字节数组
   */
  addChunkByteArray(chunk) {
    let id = this.byteArrayToId(chunk.slice(0, this.#idDigits));
    let start = id * this.#chunkSize;
    let end = start + chunk.slice(this.#idDigits).byteLength;
    let startIndex = Math.floor(start / this.#byteArrayMaxLength);
    let endIndex = Math.floor(end / this.#byteArrayMaxLength);
    let offset = 0;

    for (let i = startIndex; i <= endIndex; i++) {
      let lineStart = start - i * this.#byteArrayMaxLength + offset;
      let size = Math.min(
        this.#byteArrayMaxLength - lineStart,
        chunk.byteLength - this.#idDigits + offset
      );
      let sliceStart = offset + this.#idDigits;
      this.#byteArrayList[i].set(
        chunk.slice(sliceStart, sliceStart + size),
        lineStart
      );
      offset += size;
    }

    this.#okIds[id] = 1;
  }

  /**
   * 获取分片字节数组
   */
  byteArrayList() {
    return this.#byteArrayList;
  }

  /**
   * 获取缺失分片的id
   */
  missingChunkIds() {
    let ids = [];

    for (let i = 0; i < this.#okIds.length; i++) {
      if (this.#okIds[i] !== 1) {
        ids.push(i);
      }
    }

    return ids;
  }
}
