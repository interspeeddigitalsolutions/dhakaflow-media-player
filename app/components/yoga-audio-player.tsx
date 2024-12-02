'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"

export default function YogaAudioPlayer() {
    const [isPlaying, setIsPlaying] = useState(false)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const audioRef = useRef<HTMLAudioElement>(null)
    const { toast } = useToast()

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const setAudioData = () => {
            setDuration(audio.duration)
        }

        const setAudioTime = () => {
            setCurrentTime(audio.currentTime)
            if (audio.ended) {
                setIsPlaying(false)
            }
        }

        audio.addEventListener('loadedmetadata', setAudioData)
        audio.addEventListener('timeupdate', setAudioTime)
        audio.addEventListener('ended', () => setIsPlaying(false))

        // Ensure the audio data is set if it's already loaded
        if (audio.readyState >= 2) {
            setAudioData()
        }

        return () => {
            audio.removeEventListener('loadedmetadata', setAudioData)
            audio.removeEventListener('timeupdate', setAudioTime)
            audio.removeEventListener('ended', () => setIsPlaying(false))
        }
    }, [])

    const togglePlayPause = () => {
        const audio = audioRef.current
        if (audio) {
            if (isPlaying) {
                audio.pause()
            } else {
                audio.play().catch(error => console.error("Playback failed:", error))
            }
            setIsPlaying(!isPlaying)
        }
    }

    const handleSeek = (value: number[]) => {
        const audio = audioRef.current
        if (audio) {
            audio.currentTime = value[0]
            setCurrentTime(value[0])
        }
    }

    const handleVolumeChange = (value: number[]) => {
        const newVolume = value[0]
        setVolume(newVolume)
        if (audioRef.current) {
            audioRef.current.volume = newVolume
        }
    }

    const formatTime = (time: number) => {
        if (!isFinite(time)) return '0:00'
        const minutes = Math.floor(time / 60)
        const seconds = Math.floor(time % 60)
        return `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    useEffect(() => {
        const timer = setTimeout(() => {
            toast({
                description: "Click the play button to begin your session"
            });
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-teal-100 to-teal-200 p-4 sm:p-8">
            <div className="bg-white bg-opacity-80 backdrop-blur-md rounded-lg shadow-xl p-6 sm:p-8 w-full max-w-md relative overflow-hidden">
                <div className="absolute inset-0 bg-mandala opacity-10 z-0"></div>
                <div className="relative z-10 flex flex-col items-center">
                    <img src={'/df-logo.png'} className='w-20 my-4' alt='dhakaflow logo' />
                    <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-teal-800">Yoga Session</h1>
                    <audio ref={audioRef} autoPlay loop preload="metadata">
                        <source src="/audio1.mp3" type="audio/mpeg" />
                        Your browser does not support the audio element.
                    </audio>
                    <Button
                        onClick={togglePlayPause}
                        variant="outline"
                        size="icon"
                        className="rounded-full w-20 h-20 sm:w-24 sm:h-24 bg-teal-500 hover:bg-teal-600 text-white border-none shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105 mb-6"
                        aria-label={isPlaying ? 'Pause yoga session' : 'Play yoga session'}
                    >
                        {isPlaying ? (
                            <Pause className="h-10 w-10 sm:h-12 sm:w-12" />
                        ) : (
                            <Play className="h-10 w-10 sm:h-12 sm:w-12" />
                        )}
                    </Button>
                    <div className="w-full mb-4">
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={0.1}
                            onValueChange={handleSeek}
                            aria-label="Seek"
                            className="w-full"
                        />
                        <div className="flex justify-between text-sm text-teal-700 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                        </div>
                    </div>
                    {/* <div className="flex justify-center w-full">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleVolumeChange([volume === 0 ? 1 : 0])}
              aria-label={volume === 0 ? 'Unmute' : 'Mute'}
              className="text-teal-700"
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </Button>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              aria-label="Adjust volume"
              className="w-24 ml-2"
            />
          </div> */}
                </div>
            </div>
        </div>
    )
}

