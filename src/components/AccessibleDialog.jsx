import {useEffect,useRef} from 'react';
export default function AccessibleDialog({label,onClose,children,...props}){
 const panel=useRef(null),close=useRef(onClose);
 useEffect(()=>{close.current=onClose},[onClose]);
 useEffect(()=>{
  const previous=document.activeElement,root=panel.current;
  const focusable=()=>[...root.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex="0"]')].filter(el=>el.getClientRects().length>0);
  (focusable()[0]||root).focus();
  const key=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close.current?.()}else if(event.key==='Tab'){const items=focusable();if(!items.length){event.preventDefault();root.focus();return}const first=items[0],last=items.at(-1);if(event.shiftKey&&(document.activeElement===first||document.activeElement===root)){event.preventDefault();last.focus()}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}}};
  root.addEventListener('keydown',key);return()=>{root.removeEventListener('keydown',key);if(previous?.isConnected)previous.focus()};
 },[]);
 return <div {...props} ref={panel} role="dialog" aria-modal="true" aria-label={label} tabIndex={-1}>{children}</div>;
}
