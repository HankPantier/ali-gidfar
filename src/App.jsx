import { useState, useEffect, useCallback } from 'react';
import projectsData from './data/projects.json';
import './index.css';

// Minimal icons
const PlayIcon = () => <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const ContactIcon = () => <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>;

function App() {
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

  const totalProjects = projectsData.length;
  const project = projectsData[currentProjectIndex];

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

  // Navigation Logic
  const goToNextSlide = useCallback(() => {
    setSubSlideIndex((prevSub) => {
      if (prevSub === 0) return 1;
      
      // If we were on subSlide 1, go to next project
      setCurrentProjectIndex((prevProj) => (prevProj + 1) % totalProjects);
      return 0; // Reset subslide
    });
  }, [totalProjects]);

  const goToPrevSlide = useCallback(() => {
    setSubSlideIndex((prevSub) => {
      if (prevSub === 1) return 0;
      
      // If we were on subSlide 0, go to previous project's last subslide
      setCurrentProjectIndex((prevProj) => (prevProj === 0 ? totalProjects - 1 : prevProj - 1));
      return 1;
    });
  }, [totalProjects]);

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

  // Sub-slide Images Helper
  const getImageUrl = (proj, subIndex) => {
    if (isMobile) {
      return subIndex === 0 ? proj.image_mobile_1 : proj.image_mobile_2;
    }
    return subIndex === 0 ? proj.image_desktop_1 : proj.image_desktop_2;
  };

  return (
    <div className="app-container">
      {/* Background Images */}
      <div className="slider-container">
        {projectsData.map((p, pIndex) => (
          <div key={p.id}>
            {/* Sub-slide 1 */}
            <div
              className={`slide ${pIndex === currentProjectIndex && subSlideIndex === 0 ? 'active' : ''}`}
              style={{ backgroundImage: `url(${getImageUrl(p, 0)})` }}
            />
            {/* Sub-slide 2 */}
            <div
              className={`slide ${pIndex === currentProjectIndex && subSlideIndex === 1 ? 'active' : ''}`}
              style={{ backgroundImage: `url(${getImageUrl(p, 1)})` }}
            />
          </div>
        ))}
        <div className="gradient-overlay"></div>
      </div>

      {/* Brand Logo */}
      <button 
        className="brand-logo"
        onClick={() => setIsContactOpen(!isContactOpen)}
        aria-label="Contact Information"
      >
        ALI GIDFAR
      </button>

      {/* Sidebar - Desktop Years */}
      <div className="sidebar">
        {projectsData.map((p, index) => (
          <button
            key={p.year}
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
            key={p.year}
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
      >
        AG
      </button>

      {/* Contact Card */}
      <div className={`contact-card ${isContactOpen ? 'open' : ''}`}>
        <button className="contact-close" onClick={() => setIsContactOpen(false)}>×</button>
        <h2>Ali Gidfar</h2>
        <span className="firm">Gidfar Architects</span>
        <a href="mailto:contact@aligidfarworks.com">contact@aligidfarworks.com</a>
        <a href="tel:+41441234567">+41 44 123 45 67</a>
        <a href="https://linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </div>
  );
}

export default App;
