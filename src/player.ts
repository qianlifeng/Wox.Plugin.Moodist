import { exec } from "child_process"
import { ChildProcess } from "node:child_process"

const macPlayCommand = (path: string) => `afplay "${path}" -v 1`

const addPresentationCore = `Add-Type -AssemblyName presentationCore;`
const createMediaPlayer = `$player = New-Object system.windows.media.mediaplayer;`
const loadAudioFile = (path: string) => `$player.open('${path}');`
const playAudio = `$player.Play();`
const stopAudio = `Start-Sleep 1; Start-Sleep -s $player.NaturalDuration.TimeSpan.TotalSeconds;Exit;`
const windowPlayCommand = (path: string) =>
  `powershell -c ${addPresentationCore} ${createMediaPlayer} ${loadAudioFile(
    path
  )} $player.Volume = 1; ${playAudio} ${stopAudio}`

const linuxPlayCommand = (path: string) => `mpv "${path}"`

export interface Player {
  stopped: boolean
  process: ChildProcess
  stop: () => void
}

function playLoop(player: Player, playCommand: string) {
  player.process.on("exit", (code) => {
    if (player.stopped) return
    if (code !== 0) return

    player.process = exec(playCommand, { windowsHide: true })

    playLoop(player, playCommand)
  })
}

function play(path: string) {
  const playCommand = process.platform === "win32" ? windowPlayCommand(path) : process.platform === "darwin" ? macPlayCommand(path) : linuxPlayCommand(path)
  const p = exec(playCommand, { windowsHide: true })
  const player = {
    stopped: false,
    process: p,
    stop: () => {
      player.stopped = true
      p.kill()
    }
  }
  playLoop(player, playCommand)

  return player
}

export default play
