# 文件分片

最近有一个想法，想通过WebRTC的DataChannel传输文件，
但是DataChannel单次传输的数据大小有限制，所以写了这样一段代码，
把单个文件拆分成多个分片，传输完成之后再进行合并。
