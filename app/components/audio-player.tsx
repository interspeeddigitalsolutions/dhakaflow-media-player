'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Volume2, VolumeX, Play, Pause } from 'lucide-react'

export default function AudioPlayer() {
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

    // Add event listeners
    audio.addEventListener('loadeddata', setAudioData)
    audio.addEventListener('timeupdate', setAudioTime)

    // Play audio when component mounts
    audio.play().catch(error => console.error("Audio playback failed:", error))
    setIsPlaying(true)

    // Remove event listeners on cleanup
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

  const stopAudio = () => {
    const audio = audioRef.current
    if (!audio) return

    audio.pause()
    audio.currentTime = 0
    setIsPlaying(false)
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 p-8">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Audio Player</h1>
        <audio ref={audioRef} src="/placeholder.mp3" />
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm">{formatTime(currentTime)}</span>
          <span className="text-sm">{formatTime(duration)}</span>
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
          className="mb-4"
        />
        <div className="flex justify-center items-center space-x-4 mb-4">
          <Button
            onClick={playPause}
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button onClick={stopAudio} variant="outline" size="sm" aria-label="Stop">Stop</Button>
        </div>
        <div className="flex items-center space-x-2">
          {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
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
  )
}

