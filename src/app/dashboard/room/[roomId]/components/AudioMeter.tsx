import { useEffect, useState } from 'react';
import { Volume2 } from 'lucide-react'; 

interface AudioMeterProps {
  track: MediaStreamTrack | null;
}

export default function AudioMeter({ track }: AudioMeterProps) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    if (!track) return;

    const stream = new MediaStream([track]);
    const audioCtx = new AudioContext();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;

    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    let animationFrameId: number;

    const update = () => {
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const val = (dataArray[i] - 128) / 128;
        sum += val * val;
      }

      const rms = Math.sqrt(sum / dataArray.length);
      setVolume(rms); 

      animationFrameId = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationFrameId);
      audioCtx.close();
    };
  }, [track]);

  const level1 = Math.min(volume * 20, 1);
  const level2 = Math.min(volume * 10, 1);
  const level3 = Math.min(volume * 5, 1);

  return (
    <div className="flex items-center space-x-2 p-2 border border-white/10 rounded dark:text-white">
      <Volume2 className="min-w-6 h-6 dark:text-white" />
      <div className="flex space-x-1 items-end h-6">
        <div
          className="w-1 bg-green-400 rounded transition-all duration-100"
          style={{ height: `${level1 * 100}%` }}
        />
        <div
          className="w-1 bg-green-500 rounded transition-all duration-100"
          style={{ height: `${level2 * 100}%` }}
        />
        <div
          className="w-1 bg-red-500 rounded transition-all duration-100"
          style={{ height: `${level3 * 100}%` }}
        />
      </div>
      <p className="text-xs ml-2">{Math.floor(volume * 100)}%</p>
    </div>
  );
}
