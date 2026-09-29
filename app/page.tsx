export default function Home() {
  return (
    <div style={{background:'black',color:'white',minHeight:'100vh',padding:'20px',fontFamily:'sans-serif'}}>
      <h1 style={{fontSize:'28px',fontWeight:'bold'}}>HustleHub Secunda ✅</h1>
      <p style={{color:'#888',marginTop:'10px'}}>Your community marketplace is LIVE</p>
      
      <div style={{marginTop:'30px',display:'grid',gap:'15px'}}>
        <div style={{background:'#18181b',padding:'20px',borderRadius:'16px',border:'1px solid #333'}}>
          <h3>Glamour Locks - Thandi</h3>
          <p style={{color:'#888',fontSize:'14px'}}>Braids & Weave - R250</p>
          <a href="/glamour-locks" style={{display:'block',marginTop:'12px',background:'white',color:'black',textAlign:'center',padding:'10px',borderRadius:'20px',fontWeight:'bold',textDecoration:'none'}}>Book Now</a>
        </div>
        <div style={{background:'#18181b',padding:'20px',borderRadius:'16px',border:'1px solid #333'}}>
          <h3>Nails by Lisa</h3>
          <p style={{color:'#888',fontSize:'14px'}}>Acrylic & Gel - R180</p>
          <a href="/nails-by-lisa" style={{display:'block',marginTop:'12px',background:'white',color:'black',textAlign:'center',padding:'10px',borderRadius:'20px',fontWeight:'bold',textDecoration:'none'}}>Book Now</a>
        </div>
        <div style={{background:'#18181b',padding:'20px',borderRadius:'16px',border:'1px solid #333'}}>
          <h3>Fade Masters</h3>
          <p style={{color:'#888',fontSize:'14px'}}>Cuts & Fades - R120</p>
          <a href="/fade-masters" style={{display:'block',marginTop:'12px',background:'white',color:'black',textAlign:'center',padding:'10px',borderRadius:'20px',fontWeight:'bold',textDecoration:'none'}}>Book Now</a>
        </div>
      </div>

      <div style={{marginTop:'30px',textAlign:'center',color:'#666',fontSize:'12px'}}>
        <p>Chicken Bot LIVE: /api/whatsapp ✅</p>
        <p style={{marginTop:'5px'}}>Manager: /manager</p>
      </div>
    </div>
  );
}
