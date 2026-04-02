import { useState, useEffect, useCallback } from 'react';
import aliProjects from './data/projects.json';
import paceProjects from './data/projects-pace.json';
import './index.css';

// Minimal icons
const PlayIcon = () => <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
const ContactIcon = () => <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>;

// Randomize starting state once at module load so site + slide are always in sync
const _initialSite = window.__INITIAL_SITE__ || (Math.random() < 0.5 ? 'ali' : 'pace');
const _initialData = _initialSite === 'ali' ? aliProjects : paceProjects;
const _initialProjectIndex = Math.floor(Math.random() * _initialData.length);

function App() {
  const [activeSite, setActiveSite] = useState(_initialSite);
  const [currentProjectIndex, setCurrentProjectIndex] = useState(_initialProjectIndex);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check mobile breakpoint for image selection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const projectsData = activeSite === 'ali' ? aliProjects : paceProjects;
  const totalProjects = projectsData.length;

  const aliYears = Array.from({length: 2026 - 1989 + 1}, (_, i) => 1989 + i);
  const paceYears = Array.from({length: 2028 - 2012 + 1}, (_, i) => 2012 + i);
  const timelineYears = activeSite === 'ali' ? aliYears : paceYears;

  // Fallback to 0 if we switch sites and the current index is out of bounds
  const project = projectsData[currentProjectIndex] || projectsData[0];

  // Track slide views to auto-open contact card
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    setSlideCount((prev) => prev + 1);
  }, [currentProjectIndex]);

  useEffect(() => {
    if (slideCount === 6) { // 1 on mount + 5 transitions
      setIsContactOpen(true);
    }
  }, [slideCount]);

  // Navigation Logic
  const goToPrevProject = useCallback(() => {
    setCurrentProjectIndex((prev) => (prev === 0 ? totalProjects - 1 : prev - 1));
  }, [totalProjects]);

  const goToNextProject = useCallback(() => {
    setCurrentProjectIndex((prev) => (prev + 1) % totalProjects);
  }, [totalProjects]);

  // Autoscroll Timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(goToNextProject, 2500);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentProjectIndex, goToNextProject]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        goToNextProject();
      } else if (e.key === 'ArrowLeft') {
        goToPrevProject();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextProject, goToPrevProject]);

  // Swipe logic
  useEffect(() => {
    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e) => {
      touchStartX = e.changedTouches[0].screenX;
    };
    const handleTouchEnd = (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      if (touchEndX < touchStartX - 50) goToNextProject();
      if (touchEndX > touchStartX + 50) goToPrevProject();
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToNextProject, goToPrevProject]);

  const contactInfo = activeSite === 'ali' ? {
    name: 'Ali Gidfar',
    firm: '',
    address: '1910 7th street, Boulder, CO',
    email: 'ali@pacedevelopment.us',
    cell: '303 669 3370',
    linkedin: ''
  } : {
    name: 'Pace Development',
    firm: '',
    address: '1910 7th street, Boulder, CO',
    email: 'ali@pacedevelopment.us',
    cell: '303 669 3370',
    linkedin: ''
  };

  return (
    <div className="app-container">
      {/* Background Images */}
      <div className="slider-container">
        {projectsData.map((p, pIndex) => {
          const mobileImage = p.image_mobile_1 || p['image_pace-mobile_1'] || p.image_desktop_1;
          const desktopImage = p.image_desktop_1;
          return (
            <div
              key={p.id}
              className={`slide ${pIndex === currentProjectIndex ? 'active' : ''}`}
              style={{ backgroundImage: `url(${isMobile ? mobileImage : desktopImage})` }}
            />
          );
        })}
        <div className="gradient-overlay"></div>
      </div>

      {/* Brand Logos / Site Switcher */}
      <div className="site-switcher">
        <button
          className={`brand-logo ${activeSite === 'ali' ? 'active' : ''}`}
          onClick={() => { setActiveSite('ali'); setCurrentProjectIndex(0); }}
          aria-label="Ali Gidfar Site"
        >
          ALI GIDFAR
        </button>
        <button
          className={`brand-logo ${activeSite === 'pace' ? 'active' : ''}`}
          onClick={() => { setActiveSite('pace'); setCurrentProjectIndex(0); }}
          aria-label="PACE Site"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <img src="/assets/PACE-ON-BLACK.svg" alt="PACE" style={{ height: '20px' }} />
        </button>
      </div>

      {/* Sidebar - Desktop Years */}
      <div className="sidebar">
        {timelineYears.map((year) => {
          const isActive = project.year === year;
          return (
            <span
              key={year}
              className={`year-label ${isActive ? 'active' : ''}`}
            >
              {year}
            </span>
          );
        })}
      </div>

      {/* Mobile - Dots */}
      <div className="mobile-nav">
        {projectsData.map((p, index) => (
          <button
            key={p.id}
            className={`dash ${index === currentProjectIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentProjectIndex(index);
              setIsPlaying(true);
            }}
            aria-label={`Go to project from ${p.year}`}
          />
        ))}
      </div>

      {/* Project Text Overlay */}
      <div className="content-overlay">
        <span className="slide-count">{(currentProjectIndex + 1).toString().padStart(2, '0')} / {totalProjects.toString().padStart(2, '0')}</span>
        <h1>{project.title}</h1>
        <span className="meta-info">
          {project.location} — {project.year}
        </span>
        <p>{project.description}</p>
      </div>

      {/* Controls */}
      <button
        className="control-btn"
        onClick={() => setIsPlaying(!isPlaying)}
        aria-label={isPlaying ? "Pause Slideshow" : "Play Slideshow"}
      >
        {isPlaying ? <PauseIcon /> : <PlayIcon />}
      </button>

      {/* Contact Trigger + Stat */}
      <div className="contact-trigger-wrap">
        <span className="stat-label">Total sf. 13,925,000</span>
        <button
          className="contact-trigger"
          onClick={() => setIsContactOpen(!isContactOpen)}
          style={{ padding: 0, overflow: 'hidden' }}
        >
          <img
            src={activeSite === 'ali' ? '/assets/Ali.png' : '/assets/pace.png'}
            alt={activeSite === 'ali' ? 'Ali Gidfar Contact' : 'Pace Development Contact'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </button>
      </div>

      {/* Contact Card */}
      <div className={`contact-card ${isContactOpen ? 'open' : ''}`}>
        <button className="contact-close" onClick={() => setIsContactOpen(false)}>×</button>
        <h2 style={{ marginBottom: (!contactInfo.firm && !contactInfo.address) ? '1.5rem' : '0.25rem' }}>{contactInfo.name}</h2>
        {contactInfo.firm && <span className="firm" style={{ marginBottom: contactInfo.address ? '0.25rem' : '1.5rem' }}>{contactInfo.firm}</span>}
        {contactInfo.address && <span className="address" style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '1.5rem', lineHeight: '1.3' }}>{contactInfo.address}</span>}
        <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
        {contactInfo.cell && <a href={`tel:${contactInfo.cell.replace(/[\s\.\-\(\)]+/g, '')}`}>M: {contactInfo.cell}</a>}
        {contactInfo.linkedin && <a href={contactInfo.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
      </div>
    </div>
  );
}

export default App;
