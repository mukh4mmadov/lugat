# Encodes a WAV into a small MP3 (mono, 64 kbit/s) with the encoder built into
# Windows (Media Foundation), so no extra tools are needed:
#   powershell -File scripts/lesson-audio/encode.ps1 <in.wav> <out.mp3>
param([Parameter(Mandatory)][string]$InPath, [Parameter(Mandatory)][string]$OutPath)
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime]
$null = [Windows.Media.Transcoding.MediaTranscoder, Windows.Media.Transcoding, ContentType = WindowsRuntime]
$null = [Windows.Media.MediaProperties.MediaEncodingProfile, Windows.Media.MediaProperties, ContentType = WindowsRuntime]

$extensions = [System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object { $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 }
function Wait-Operation($operation, [type]$resultType) {
  $method = ($extensions | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' })[0].MakeGenericMethod($resultType)
  $task = $method.Invoke($null, @($operation)); $task.Wait(-1) | Out-Null; $task.Result
}
function Wait-Progress($operation) {
  $method = ($extensions | Where-Object { $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncActionWithProgress`1' })[0].MakeGenericMethod([double])
  $task = $method.Invoke($null, @($operation)); $task.Wait(-1) | Out-Null
}

$source = Wait-Operation ([Windows.Storage.StorageFile]::GetFileFromPathAsync((Resolve-Path $InPath).Path)) ([Windows.Storage.StorageFile])
$fullOut = [System.IO.Path]::GetFullPath($OutPath)
$folder = Wait-Operation ([Windows.Storage.StorageFolder]::GetFolderFromPathAsync([System.IO.Path]::GetDirectoryName($fullOut))) ([Windows.Storage.StorageFolder])
$target = Wait-Operation ($folder.CreateFileAsync([System.IO.Path]::GetFileName($fullOut), [Windows.Storage.CreationCollisionOption]::ReplaceExisting)) ([Windows.Storage.StorageFile])

$profile = [Windows.Media.MediaProperties.MediaEncodingProfile]::CreateMp3([Windows.Media.MediaProperties.AudioEncodingQuality]::Low)
$profile.Audio.ChannelCount = 1
$profile.Audio.SampleRate = 44100
$profile.Audio.Bitrate = 64000

$transcoder = New-Object Windows.Media.Transcoding.MediaTranscoder
$prepared = Wait-Operation ($transcoder.PrepareFileTranscodeAsync($source, $target, $profile)) ([Windows.Media.Transcoding.PrepareTranscodeResult])
if (-not $prepared.CanTranscode) { throw "Cannot encode: $($prepared.FailureReason)" }
Wait-Progress ($prepared.TranscodeAsync())
"{0} -> {1} ({2:N0} KB)" -f $InPath, $OutPath, ((Get-Item $fullOut).Length / 1KB)
