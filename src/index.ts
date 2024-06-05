import { Context, Plugin, PluginInitParams, PublicAPI, Query, Result } from "@wox-launcher/wox-plugin"
import { getSounds, Sound } from "./sound"
import play from "audio-play"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import load from "audio-loader"

let api: PublicAPI
let sounds: Sound[]
const playingHandles: Record<string, play.AudioPlayHandle> = {}

export const plugin: Plugin = {
  init: async (ctx: Context, initParams: PluginInitParams) => {
    api = initParams.API
    sounds = getSounds()
    await api.Log(ctx, "Info", `Loaded ${sounds.length} sound groups`)
  },

  query: async (ctx: Context, query: Query): Promise<Result[]> => {
    const results: Result[] = []

    for (let i = 0; i < sounds.length; i++) {
      const sound = sounds[i]
      if (sound.Name.toLowerCase().includes(query.Search.toLowerCase()) ||
        sound.Group.toLowerCase().includes(query.Search.toLowerCase()) ||
        query.Search === "") {
        results.push({
          Title: sound.Name + `${playingHandles[sound.Name] ? " (Playing)" : ""}`,
          SubTitle: sound.Group,
          Icon: {
            ImageType: "relative",
            ImageData: "images/app.png"
          },
          Score: sounds.length - i + (playingHandles[sound.Name] ? 1000 : 0),
          Actions: [
            {
              Name: "Play or pause",
              PreventHideAfterAction: true,
              Action: async () => {
                if (playingHandles[sound.Name]) {
                  playingHandles[sound.Name].pause()
                  delete playingHandles[sound.Name]
                  return
                }

                const soundBuffer = await load(sound.Path)
                playingHandles[sound.Name] = play(soundBuffer, {
                  loop: true,
                  autoplay: true
                }, () => {
                })
              }
            }
          ]
        })
      }
    }

    return results
  }
}
