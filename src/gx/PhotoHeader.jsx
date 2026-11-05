import AccountMenu from './AccountMenu';

// One place that puts type on a photograph, so each screen has the same scrim.
export default function PhotoHeader({src,focal='50% 35%',eyebrow,title,children,menu=true}){
 return <header className="gx-hero">
  <img src={src} alt="" style={{objectPosition:focal}} />
  {menu&&<AccountMenu/>}
  <div className="gx-wrap" style={{width:'100%'}}>
   {eyebrow&&<p className="gx-eyebrow">{eyebrow}</p>}
   {title&&<h1 className="gx-title">{title}</h1>}
   {children}
  </div>
 </header>;
}
