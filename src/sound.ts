import fs from "fs"

export interface Sound {
  Name: string
  Group: string
  Path: string
}

function getSounds(): Sound[] {
  // scan the sounds directory
  const soundDir = process.cwd() + "/sounds"
  const soundFiles = fs.readdirSync(soundDir)
  const sounds: Sound[] = []
  for (const soundGroup of soundFiles) {
    for (const sound of fs.readdirSync(`${soundDir}/${soundGroup}`)) {
      const path = `${soundDir}/${soundGroup}/${sound}`
      sounds.push({
        Name: sound.replace(".mp3", "").replace(".wav", ""),
        Group: soundGroup,
        Path: path
      })
    }
  }

  // sort sounds by name
  sounds.sort((a, b) => a.Name.localeCompare(b.Name))

  return sounds
}

export { getSounds }
