import React from 'react'
import "../../styles/InstaSection.css";
import { Link } from 'react-router-dom';
const InstaSection = () => {
  return (
    <div className="instagram-container">
    {/* Instagram Section */}
    <div className="instagram-content">
      <div className="text-section">
        <h3>
          FOLLOW US ON <br /> <span className="instagram-title">INSTAGRAM</span>
        </h3>
        <Link to="/instagram" className="see-more">SEE MORE</Link>
      </div>
      <div className="images-section">
        <img src="/images/img1.jpg" alt="Product 1" />
        <img src="/images/img2.jpg" alt="Product 2" />
        <img src="/images/img3.jpg" alt="Product 3" />
      </div>
    </div>
  </div>

  )
}

export default InstaSection