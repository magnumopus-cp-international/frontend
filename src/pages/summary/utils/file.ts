export const audioExt = ['mp3', 'm4a', 'flac', 'aiff', 'mp4', 'wav', 'wma', 'aac'];
export function getFileExtension(name: string) {
  return name.split('.')?.[name.split('.').length - 1];
}

export function isAudioFile(name: string) {
  return audioExt.includes(getFileExtension(name));
}
