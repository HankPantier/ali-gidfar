import { useState, useEffect, useCallback } from 'react';
import aliProjects from './data/projects.json';
import paceProjects from './data/projects-pace.json';
import './index.css';

// Minimal icons
const PlayIcon = () => <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" /></svg>;
const ContactIcon = () => <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>;

function App() {
  const [activeSite, setActiveSite] = useState('ali');
  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [subSlideIndex, setSubSlideIndex] = useState(0); // 0 or 1
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
  // Fallback to 0 if we switch sites and the current index is out of bounds
  const project = projectsData[currentProjectIndex] || projectsData[0];

  // Reset index when site changes
  useEffect(() => {
    setCurrentProjectIndex(0);
    setSubSlideIndex(0);
  }, [activeSite]);

  // Track slide views to auto-open contact card
  const [slideCount, setSlideCount] = useState(0);

  useEffect(() => {
    setSlideCount((prev) => prev + 1);
  }, [currentProjectIndex, subSlideIndex]);

  useEffect(() => {
    if (slideCount === 6) { // 1 on mount + 5 transitions
      setIsContactOpen(true);
    }
  }, [slideCount]);

  const getProjectImageCount = useCallback((projIndex) => {
    const proj = projectsData[projIndex];
    if (!proj) return 1;
    let count = 0;
    while (proj[`image_desktop_${count + 1}`] || proj[`image_mobile_${count + 1}`] || proj[`image_pace-mobile_${count + 1}`]) {
      count++;
    }
    return count > 0 ? count : 1;
  }, [projectsData]);

  // Navigation Logic
  const goToNextSlide = useCallback(() => {
    setSubSlideIndex((prevSub) => {
      const imgCount = getProjectImageCount(currentProjectIndex);
      if (prevSub < imgCount - 1) return prevSub + 1;

      setCurrentProjectIndex((prevProj) => (prevProj + 1) % totalProjects);
      return 0; // Reset subslide
    });
  }, [totalProjects, currentProjectIndex, getProjectImageCount]);

  const goToPrevSlide = useCallback(() => {
    setSubSlideIndex((prevSub) => {
      if (prevSub > 0) return prevSub - 1;

      const prevProjIndex = currentProjectIndex === 0 ? totalProjects - 1 : currentProjectIndex - 1;
      setCurrentProjectIndex(prevProjIndex);
      return Math.max(0, getProjectImageCount(prevProjIndex) - 1);
    });
  }, [totalProjects, currentProjectIndex, getProjectImageCount]);

  const goToPrevProject = useCallback(() => {
    setCurrentProjectIndex((prev) => (prev === 0 ? totalProjects - 1 : prev - 1));
    setSubSlideIndex(0);
  }, [totalProjects]);

  const goToNextProject = useCallback(() => {
    setCurrentProjectIndex((prev) => (prev + 1) % totalProjects);
    setSubSlideIndex(0);
  }, [totalProjects]);

  // Autoscroll Timer
  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setTimeout(goToNextSlide, 6000); // 1.5s fade + ~4.5s readable time
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentProjectIndex, subSlideIndex, goToNextSlide]);

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
      if (touchEndX < touchStartX - 50) goToNextSlide();
      if (touchEndX > touchStartX + 50) goToPrevSlide();
    };

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [goToNextSlide, goToPrevSlide]);

  const contactInfo = activeSite === 'ali' ? {
    name: 'Ali Gidfar',
    firm: '',
    address: '',
    email: 'ali@pacedevco.com',
    phone: '303.484.9200',
    cell: '303.669.3370',
    linkedin: ''
  } : {
    name: 'Pace Development',
    firm: '',
    address: '1910 7th Street,Boulder, Colorado 80302',
    email: 'ali@pacedevco.com',
    phone: '303.484.9200',
    cell: '303.669.3370',
    linkedin: ''
  };

  // Sub-slide Images Helper
  const getProjectImages = (proj) => {
    const images = [];
    let i = 1;
    while (proj[`image_desktop_${i}`] || proj[`image_mobile_${i}`] || proj[`image_pace-mobile_${i}`]) {
      images.push({
        desktop: proj[`image_desktop_${i}`] || proj.image_desktop_1,
        mobile: proj[`image_mobile_${i}`] || proj[`image_pace-mobile_${i}`] || proj[`image_desktop_${i}`] || proj.image_desktop_1
      });
      i++;
    }
    if (images.length === 0) {
      images.push({ desktop: '', mobile: '' });
    }
    return images;
  };

  return (
    <div className="app-container">
      {/* Background Images */}
      <div className="slider-container">
        {projectsData.map((p, pIndex) => {
          const images = getProjectImages(p);
          return (
            <div key={p.id}>
              {images.map((img, subIndex) => (
                <div
                  key={`${p.id}-${subIndex}`}
                  className={`slide ${pIndex === currentProjectIndex && subSlideIndex === subIndex ? 'active' : ''}`}
                  style={{ backgroundImage: `url(${isMobile ? img.mobile : img.desktop})` }}
                />
              ))}
            </div>
          );
        })}
        <div className="gradient-overlay"></div>
      </div>

      {/* Brand Logos / Site Switcher */}
      <div className="site-switcher">
        <button
          className={`brand-logo ${activeSite === 'ali' ? 'active' : ''}`}
          onClick={() => setActiveSite('ali')}
          aria-label="Ali Gidfar Site"
        >
          ALI GIDFAR
        </button>
        <button
          className={`brand-logo ${activeSite === 'pace' ? 'active' : ''}`}
          onClick={() => setActiveSite('pace')}
          aria-label="PACE Site"
          style={{ display: 'flex', alignItems: 'center' }}
        >
          <img src="/assets/PACE-ON-BLACK.svg" alt="PACE" style={{ height: '20px' }} />
        </button>
      </div>

      {/* Sidebar - Desktop Years */}
      <div className="sidebar">
        {projectsData.map((p, index) => (
          <button
            key={p.id}
            className={`year-btn ${index === currentProjectIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentProjectIndex(index);
              setSubSlideIndex(0);
              setIsPlaying(true);
            }}
          >
            {p.year}
          </button>
        ))}
      </div>

      {/* Mobile - Dots */}
      <div className="mobile-nav">
        {projectsData.map((p, index) => (
          <button
            key={p.id}
            className={`dash ${index === currentProjectIndex ? 'active' : ''}`}
            onClick={() => {
              setCurrentProjectIndex(index);
              setSubSlideIndex(0);
              setIsPlaying(true);
            }}
            aria-label={`Go to project from ${p.year}`}
          />
        ))}
      </div>

      {/* Project Text Overlay */}
      <div className="content-overlay">
        <span className="slide-count">0{(currentProjectIndex + 1)} / {totalProjects < 10 ? `0${totalProjects}` : totalProjects}</span>
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

      {/* Contact Trigger */}
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

      {/* Contact Card */}
      <div className={`contact-card ${isContactOpen ? 'open' : ''}`}>
        <button className="contact-close" onClick={() => setIsContactOpen(false)}>×</button>
        <h2 style={{ marginBottom: (!contactInfo.firm && !contactInfo.address) ? '1.5rem' : '0.25rem' }}>{contactInfo.name}</h2>
        {contactInfo.firm && <span className="firm" style={{ marginBottom: contactInfo.address ? '0.25rem' : '1.5rem' }}>{contactInfo.firm}</span>}
        {contactInfo.address && <span className="address" style={{ display: 'block', fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '1.5rem', lineHeight: '1.3' }}>{contactInfo.address}</span>}
        <a href={`mailto:${contactInfo.email}`}>{contactInfo.email}</a>
        <a href={`tel:${contactInfo.phone.replace(/[\s\.\-\(\)]+/g, '')}`}>O: {contactInfo.phone}</a>
        {contactInfo.cell && <a href={`tel:${contactInfo.cell.replace(/[\s\.\-\(\)]+/g, '')}`}>M: {contactInfo.cell}</a>}
        {contactInfo.linkedin && <a href={contactInfo.linkedin} target="_blank" rel="noreferrer">LinkedIn</a>}
      </div>
    </div>
  );
}

export default App;
