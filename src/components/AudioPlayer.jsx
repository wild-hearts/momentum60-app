import {useId, useRef, useState} from 'react';

// Browser controls preserve platform keyboard and screen-reader behaviour.
export default function AudioPlayer({src, title}) {
  const audio = useRef(null);
  const messageId = useId();
  const [failed, setFailed] = useState(false);
  function retry() {
    setFailed(false);
    audio.current.load();
    audio.current.focus();
    // A retry reloads the source. Playback remains an explicit user choice.
  }
  return <div>
    <audio ref={audio} tabIndex={0} controls preload="none" src={src}
      style={{width:'100%', maxWidth:'100%'}} aria-label={title}
      aria-describedby={failed ? messageId : undefined}
      onError={() => setFailed(true)} onCanPlay={() => setFailed(false)}
      onPlay={event => document.querySelectorAll('audio').forEach(other => {
        if (other !== event.currentTarget) other.pause();
      })}/>
    {failed && <div><p id={messageId} role="alert">This track could not load. Check your connection, then reload it. Your daily action still counts without music.</p><button type="button" onClick={retry}>Reload track</button></div>}
  </div>;
}
