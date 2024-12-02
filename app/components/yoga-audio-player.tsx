'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

export default function YogaAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(1)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const setAudioData = () => {
      setDuration(audio.duration)
      setCurrentTime(audio.currentTime)
    }

    const setAudioTime = () => setCurrentTime(audio.currentTime)

    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)

    audio.play().catch(error => console.error("Audio playback failed:", error))
    setIsPlaying(true)

    return () => {
      audio.removeEventListener('loadeddata', setAudioData)
      audio.removeEventListener('timeupdate', setAudioTime)
    }
  }, [])

  const playPause = () => {
    const audio = audioRef.current
    if (!audio) return

    if (isPlaying) {
      audio.pause()
    } else {
      audio.play()
    }
    setIsPlaying(!isPlaying)
  }

  const changeVolume = (newVolume: number[]) => {
    const audio = audioRef.current
    if (!audio) return

    const volumeValue = newVolume[0]
    audio.volume = volumeValue
    setVolume(volumeValue)
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-teal-100 to-teal-200 p-8">
      <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-xl p-8 w-full max-w-md relative overflow-hidden">
        <div className="absolute inset-0 bg-mandala opacity-10 z-0"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-6 text-center text-teal-800">Yoga Session</h1>
          <audio ref={audioRef} src="/placeholder.mp3" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-teal-700">{formatTime(currentTime)}</span>
            <span className="text-sm text-teal-700">{formatTime(duration)}</span>
          </div>
          <Slider
            value={[currentTime]}
            max={duration}
            step={1}
            onValueChange={(value) => {
              const audio = audioRef.current
              if (audio) {
                audio.currentTime = value[0]
              }
            }}
            className="mb-6"
          />
          <div className="flex justify-center items-center space-x-4 mb-6">
            <Button
              onClick={playPause}
              variant="outline"
              size="icon"
              className="rounded-full w-16 h-16 bg-teal-500 hover:bg-teal-600 text-white border-none"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8" />}
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            {volume > 0 ? <Volume2 size={20} className="text-teal-700" /> : <VolumeX size={20} className="text-teal-700" />}
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={changeVolume}
              aria-label="Adjust volume"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

