import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/explore.css';
import { Link } from 'react-router-dom';
const DiscoverTrends = () => {
  const Navigate = useNavigate();

  const [navOpen, setNavOpen] = React.useState(false);
  useEffect(() => {
    const nextDom = document.getElementById('next');
    const prevDom = document.getElementById('prev');
    const carouselDom = document.querySelector('.explore-carousel');
    const listItemDom = document.querySelector('.explore-carousel .explore-list');
    const thumbnailDom = document.querySelector('.explore-carousel .explore-thumbnail');
    // Handle carousel navigation
    const showSlider = (type) => {
      const itemSlider = document.querySelectorAll('.explore-carousel .explore-list .explore-item');
      const itemThumbnail = document.querySelectorAll('.explore-carousel .explore-thumbnail .explore-item');

      if (type === 'next') {
        listItemDom.appendChild(itemSlider[0]);
        thumbnailDom.appendChild(itemThumbnail[0]);
        carouselDom.classList.add('next');
      } else {
        const positionLastItem = itemSlider.length - 1;
        listItemDom.prepend(itemSlider[positionLastItem]);
        thumbnailDom.prepend(itemThumbnail[positionLastItem]);
        carouselDom.classList.add('prev');
      }

      setTimeout(() => {
        carouselDom.classList.remove('next');
        carouselDom.classList.remove('prev');
      }, 3000);
    };

    nextDom.onclick = () => showSlider('next');
    prevDom.onclick = () => showSlider('prev');
  }, []);

  return (
    <div>
      <header>
        <nav id="nav" className="explore-nav">
        <img src={'ed.jpg'} alt="logo" className="imglogo" />
          <div className="explore-logo" id="logo">Elite Designs</div>
          <button
          className="hamburger"
          onClick={() =>{ setNavOpen(!navOpen);console.log("Hamburger clicked. navOpen state:", !navOpen);}}
          aria-expanded={navOpen}
          aria-controls="navitems"
        >
          ☰
        </button>
          <div className={!navOpen ? 'explore-navitems' : 'notnavitems'}  id="navitems">
            <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/explore"  className="active">Explore</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <button onClick={() => Navigate('/login')} className="uploadbtn">Get Started</button>
            </ul>
          </div>
        </nav>
      </header>

      <div className="explore-carousel">
        <div className="explore-list">
          <div className="explore-item">
            <img src="img/left2.jpg" style={{ filter: 'brightness(0.4)' }} alt="Necklaces" />
            <div className="explore-content">
              <div className="explore-author">ELITE</div>
              <div className="explore-title">AI Creations</div>
              <div className="explore-topic">necklaces</div>
              <div className="explore-des">
                Glimpse one of our most popular AI-powered creations—a stunning fusion of art and innovation.
              </div>
            </div>
          </div>
          <div className="explore-item">
            <img src="img/carousel2.jpeg" style={{ filter: 'brightness(0.6)' }} alt="Ornaments" />
            <div className="explore-content">
              <div className="explore-author">ELITE</div>
              <div className="explore-title">AI Creations</div>
              <div className="explore-topic">ornaments</div>
              <div className="explore-des">
                Glimpse one of our most popular AI-powered creations—a stunning fusion of art and innovation.
              </div>
            </div>
          </div>
          <div className="explore-item">
            <img src="img/right3.avif" style={{ filter: 'brightness(0.6)' }} alt="Earrings" />
            <div className="explore-content">
              <div className="explore-author">ELITE</div>
              <div className="explore-title">AI Creations</div>
              <div className="explore-topic">earrings</div>
              <div className="explore-des">
                Glimpse one of our most popular AI-powered creations—a stunning fusion of art and innovation.
              </div>
            </div>
          </div>
          <div className="explore-item">
            <img src="img/left3.jpg" style={{ filter: 'brightness(0.6)' }} alt="Necklaces" />
            <div className="explore-content">
              <div className="explore-author">ELITE</div>
              <div className="explore-title">AI Creations</div>
              <div className="explore-topic">necklaces</div>
              <div className="explore-des">
                Glimpse one of our most popular AI-powered creations—a stunning fusion of art and innovation.
              </div>
            </div>
          </div>
        </div>
        <div className="explore-thumbnail">
          <div className="explore-item">
            <img src="img/left2.jpg" alt="Thumbnail 1" />
          </div>
          <div className="explore-item">
            <img src="img/carousel2.jpeg" alt="Thumbnail 2" />
          </div>
          <div className="explore-item">
            <img src="img/right3.avif" alt="Thumbnail 3" />
          </div>
          <div className="explore-item">
            <img src="img/left3.jpg" alt="Thumbnail 4" />
          </div>
        </div>
        <div className="explore-arrows">
          <button id="next">&larr;</button>
          <button id="prev">&rarr;</button>
        </div>
        <div className="explore-time"></div>
      </div>

      <div className="explore-container">
        <div className="explore-photo-gallery">
          <div className="explore-column">
            <div className="explore-photo">
              <img src="img/right1.jpeg" alt="GI1" />
            </div>
            <div className="explore-photo">
              <img src="img/matterbg.jpg" alt="GI2" />
            </div>
          </div>
          <div className="explore-column">
            <div className="explore-photo">
              <img src="img/left3.jpg" alt="GI3" />
            </div>
            <div className="explore-photo">
              <img src="img/right3.avif" alt="GI4" />
            </div>
            <div className="explore-photo">
              <img src="img/carousel11.png" alt="GI5" />
            </div>
            <div className="explore-photo">
              <img src="img/sendme.avif" alt="GI6" />
            </div>
          </div>
          <div className="explore-column">
            <div className="explore-photo">
              <img src="img/jewelry-photography (1).jpg" alt="GI7" />
            </div>
            <div className="explore-photo">
              <img src="img/im1.jpg" alt="GI8" />
            </div>
            <div className="explore-photo">
              <img src="img/left1.jpg" alt="GI9" />
            </div>
          </div>
        </div>
      </div>
      <footer style={{ backgroundColor: "black", color: "white", position: "fixed", bottom: "0", width: "100%", height: "4vh", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "0.8rem"}}className='lfooter'>
        <div className="footer">
          <p>©2024 Elite Designs</p>
          <p className="socialmedia">E-mail, Instagram, X</p>
          <p>elitedesigns@gmail.com</p>
        </div>
      </footer>
    </div>
  );
};

export default DiscoverTrends;
