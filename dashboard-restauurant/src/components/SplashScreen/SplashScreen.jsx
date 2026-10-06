import './SplashScreen.css';

function SplashScreen() {
  return (
    <main className='splash-screen' aria-label='VinhKy Dashboard'>
      <div className='splash-screen-grid' aria-hidden='true' />
      <div className='splash-screen-chart' aria-hidden='true'>
        <svg viewBox='0 0 390 150' preserveAspectRatio='none' fill='none'>
          <path d='M0 112H390M0 74H390M0 36H390' />
          <path d='M0 122L54 111L100 116L151 83L199 92L253 56L302 67L349 29L390 36' />
        </svg>
      </div>
      <section className='splash-screen-content'>
        <div className='splash-screen-mark' aria-hidden='true'>
          <svg viewBox='0 0 80 80' fill='none'>
            <rect x='1' y='1' width='78' height='78' rx='23' />
            <path d='M22 55V44M34 55V35M46 55V27' />
            <path d='M21 33L34 25L44 30L59 17' />
            <path d='M51 17H59V25' />
          </svg>
        </div>
        <h1>VinhKy Dashboard</h1>
        <p>
          Revenue <span>•</span> Expense <span>•</span> Analytics
        </p>
      </section>
      <div className='splash-screen-glint' aria-hidden='true' />
    </main>
  );
}

export default SplashScreen;
